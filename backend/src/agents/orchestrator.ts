import { AnswerAgent } from "./answerAgent.js";
import { ContextUnderstandingAgent } from "./contextUnderstandingAgent.js";
import { IntegreatAgent } from "./integreatAgent.js";
import { IntentAgent } from "./intentAgent.js";
import { ProfileAgent } from "./profileAgent.js";
import { RerankerAgent } from "./rerankerAgent.js";
import { RegionAgent } from "./regionAgent.js";
import { SearchQueryAgent } from "./searchQueryAgent.js";
import { ValidationAgent } from "./validationAgent.js";
import { getIntentPolicy } from "./intentPolicies.js";
import { normalizeText } from "../utils/text.js";
import type {
  Agent,
  AnswerAgentInput,
  AnswerResult,
  ContextUnderstandingAgentInput,
  ContextUnderstandingResult,
  IntegreatAgentInput,
  IntegreatResult,
  IntegreatSnippet,
  IntentAgentInput,
  IntentResult,
  OrchestrationRequest,
  OrchestrationResult,
  ProfileAgentInput,
  RerankerAgentInput,
  RerankerResult,
  RegionAgentInput,
  RegionResult,
  SearchQueryAgentInput,
  SearchQueryResult,
  ValidationAgentInput,
  ValidationResult,
  UserProfile,
} from "./types.js";

export interface OrchestratorDependencies {
  contextUnderstandingAgent: Agent<ContextUnderstandingAgentInput, ContextUnderstandingResult>;
  profileAgent: Agent<ProfileAgentInput, UserProfile>;
  intentAgent: Agent<IntentAgentInput, IntentResult>;
  regionAgent: Agent<RegionAgentInput, RegionResult>;
  searchQueryAgent: Agent<SearchQueryAgentInput, SearchQueryResult>;
  integreatAgent: Agent<IntegreatAgentInput, IntegreatResult>;
  rerankerAgent: Agent<RerankerAgentInput, RerankerResult>;
  answerAgent: Agent<AnswerAgentInput, AnswerResult>;
  validationAgent: Agent<ValidationAgentInput, ValidationResult>;
}

export class Orchestrator implements Agent<OrchestrationRequest, OrchestrationResult> {
  constructor(private readonly agents: OrchestratorDependencies) {}

  async execute(request: OrchestrationRequest): Promise<OrchestrationResult> {
    const understanding = getContextUnderstanding(request.metadata?.contextUnderstanding) ??
      await this.agents.contextUnderstandingAgent.execute({
        message: request.message,
        ...buildContextInput(request.metadata?.context),
      });
    const enrichedRequest = mergeUnderstandingIntoRequest(request, understanding);
    const profile = await this.agents.profileAgent.execute({ request: enrichedRequest });
    const fallbackIntent = await this.agents.intentAgent.execute({ request: enrichedRequest, profile });
    const intent = understanding.intent.intent ? understanding.intent : fallbackIntent;
    const region = await this.agents.regionAgent.execute({ request: enrichedRequest, profile, intent });
    const searchQueries = await this.agents.searchQueryAgent.execute({
      message: enrichedRequest.message,
      profile,
      intent,
      region,
      searchConcepts: understanding.searchConcepts,
    });
    const integreat = await this.agents.integreatAgent.execute({
      request: enrichedRequest,
      profile,
      intent,
      region,
      searchQueries: searchQueries.queries,
    });
    const reranked = await this.agents.rerankerAgent.execute({
      message: enrichedRequest.message,
      profile,
      intent,
      region,
      searchQueries: searchQueries.queries,
      snippets: integreat.snippets,
    });
    const sourceValidation = validateSelectedSources({
      request: enrichedRequest,
      profile,
      intent,
      region,
      integreat,
      snippets: reranked.snippets,
      searchQueries: searchQueries.queries,
    });
    const rerankedIntegreat = {
      ...integreat,
      snippets: sourceValidation.snippets,
      notes: sourceValidation.snippets.length === 0 && integreat.snippets.length > 0
        ? [...integreat.notes, sourceValidation.reason]
        : integreat.notes,
    };
    const answer =
      rerankedIntegreat.snippets.length > 0
        ? await this.agents.answerAgent.execute({
            request: enrichedRequest,
            profile,
            intent,
            region,
            integreat: rerankedIntegreat,
          })
        : {
            answer: "",
            sources: [],
            suggestedQuestions: [
              "Which city is this about?",
              "Can you describe the topic another way?",
            ],
            missingProfileFields: [],
          };
    const validation =
      rerankedIntegreat.snippets.length > 0
        ? await this.agents.validationAgent.execute({
            answer,
            snippets: rerankedIntegreat.snippets,
            intent,
          })
        : {
            supported: false,
            reason: "No relevant Integreat snippets were available.",
          };
    const validatedAnswer = validation.supported
      ? answer
      : {
          answer: "",
          sources: [],
          suggestedQuestions: answer.suggestedQuestions.length > 0
            ? answer.suggestedQuestions
            : ["Which city is this about?", "Can you describe the topic another way?"],
          missingProfileFields: answer.missingProfileFields,
        };

    return {
      profile,
      intent,
      region,
      integreat: validation.supported ? rerankedIntegreat : { ...rerankedIntegreat, snippets: [] },
      answer: validatedAnswer,
      validation,
    };
  }
}

export function createOrchestrator(): Orchestrator {
  return new Orchestrator({
    contextUnderstandingAgent: new ContextUnderstandingAgent(),
    profileAgent: new ProfileAgent(),
    intentAgent: new IntentAgent(),
    regionAgent: new RegionAgent(),
    searchQueryAgent: new SearchQueryAgent(),
    integreatAgent: new IntegreatAgent(),
    rerankerAgent: new RerankerAgent(),
    answerAgent: new AnswerAgent(),
    validationAgent: new ValidationAgent(),
  });
}

interface SourceValidationInput {
  request: OrchestrationRequest;
  profile: UserProfile;
  intent: IntentResult;
  region: RegionResult;
  integreat: IntegreatResult;
  snippets: IntegreatSnippet[];
  searchQueries: string[];
}

interface SourceValidationResult {
  snippets: IntegreatSnippet[];
  reason: string;
}

function validateSelectedSources(input: SourceValidationInput): SourceValidationResult {
  const snippets = input.snippets.filter((snippet) =>
    matchesSelectedCity(input, snippet) &&
    matchesSelectedLanguage(input, snippet) &&
    matchesSelectedTopic(input, snippet) &&
    matchesRelevantAgeGroup(input, snippet),
  );

  return {
    snippets,
    reason: snippets.length > 0
      ? "Selected Integreat sources passed pre-answer validation."
      : "Selected Integreat sources did not match the requested city, language, topic, or age group.",
  };
}

function matchesSelectedCity(input: SourceValidationInput, snippet: IntegreatSnippet): boolean {
  const sourcePath = getSourcePath(snippet);
  const regionSlug = input.integreat.region?.path;

  if (regionSlug) {
    return sourcePath.includes(`/${normalizeText(regionSlug)}/`);
  }

  const city = input.region.city;

  return city ? normalizeText(`${snippet.title} ${snippet.path} ${snippet.url}`).includes(normalizeText(city)) : true;
}

function matchesSelectedLanguage(input: SourceValidationInput, snippet: IntegreatSnippet): boolean {
  return getSourcePath(snippet).includes(`/${normalizeText(input.integreat.language)}/`);
}

function matchesSelectedTopic(input: SourceValidationInput, snippet: IntegreatSnippet): boolean {
  const searchableSource = normalizeText(`${snippet.title} ${snippet.path} ${snippet.text}`);
  const topicTerms = buildTopicTerms(input);

  if (topicTerms.length === 0) {
    return snippet.score > 0;
  }

  return topicTerms.some((term) => searchableSource.includes(normalizeText(term)));
}

function matchesRelevantAgeGroup(input: SourceValidationInput, snippet: IntegreatSnippet): boolean {
  const sourceText = normalizeText(`${snippet.title} ${snippet.path} ${snippet.text}`);
  const childAges = getChildAges(input.profile);

  if (childAges.length === 0) {
    return true;
  }

  if (input.intent.intent === "school_registration") {
    const hasSchoolAgeChild = childAges.some((age) => age >= 6);

    if (!hasSchoolAgeChild) {
      return true;
    }

    return (
      containsAny(sourceText, ["school", "schule", "education", "bildung", "schulanmeldung", "children 6 to 15"]) &&
      !containsAny(sourceText, ["daycare", "childcare", "kindergarten", "kita"])
    );
  }

  if (input.intent.intent === "childcare") {
    const hasYoungChild = childAges.some((age) => age < 6);

    if (!hasYoungChild) {
      return true;
    }

    return containsAny(sourceText, ["childcare", "daycare", "kindergarten", "kita", "nursery", "kinderbetreuung"]);
  }

  return true;
}

function buildTopicTerms(input: SourceValidationInput): string[] {
  const policy = getIntentPolicy(input.intent);
  const profileTerms = [
    input.profile.topic,
    ...input.profile.needs,
    input.intent.intent,
    ...input.searchQueries,
  ].filter((term): term is string => typeof term === "string" && term.trim().length > 0);
  const terms = [...policy.searchSynonyms, ...profileTerms]
    .flatMap((term) => splitSearchTerm(term))
    .filter((term) => term.length >= 3)
    .filter((term, index, all) => all.indexOf(term) === index);

  if (input.intent.intent === "information" || input.intent.intent === "unknown") {
    return profileTerms.flatMap((term) => splitSearchTerm(term)).filter((term) => term.length >= 3);
  }

  return terms;
}

function splitSearchTerm(term: string): string[] {
  const normalizedTerm = normalizeText(term);

  return [
    normalizedTerm,
    ...normalizedTerm.split(/\W+/u),
  ].filter(Boolean);
}

function getChildAges(profile: UserProfile): number[] {
  return [
    ...(typeof profile.childAge === "number" ? [profile.childAge] : []),
    ...(profile.childAges ?? []),
  ];
}

function containsAny(value: string, candidates: string[]): boolean {
  return candidates.some((candidate) => value.includes(normalizeText(candidate)));
}

function getSourcePath(snippet: IntegreatSnippet): string {
  try {
    return normalizeText(new URL(snippet.url).pathname);
  } catch {
    return normalizeText(snippet.path);
  }
}

function mergeUnderstandingIntoRequest(
  request: OrchestrationRequest,
  understanding: ContextUnderstandingResult,
): OrchestrationRequest {
  const profile = getMetadataRecord(request.metadata?.profile);
  const region = getMetadataRecord(request.metadata?.region);

  return {
    message: understanding.effectiveMessage || request.message,
    metadata: {
      ...request.metadata,
      profile: {
        ...understanding.profileUpdates,
        ...profile,
      },
      region: {
        ...understanding.regionUpdates,
        ...region,
      },
      intent: request.metadata?.intent ?? understanding.intent,
      contextUnderstanding: understanding,
    },
  };
}

function getContextUnderstanding(value: unknown): ContextUnderstandingResult | undefined {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return undefined;
  }

  const candidate = value as Partial<ContextUnderstandingResult>;

  if (!candidate.intent || typeof candidate.intent.intent !== "string") {
    return undefined;
  }

  return {
    effectiveMessage: typeof candidate.effectiveMessage === "string" ? candidate.effectiveMessage : "",
    profileUpdates: getMetadataRecord(candidate.profileUpdates) as Partial<UserProfile>,
    regionUpdates: getMetadataRecord(candidate.regionUpdates) as RegionResult,
    intent: {
      intent: candidate.intent.intent,
      confidence: typeof candidate.intent.confidence === "number" ? candidate.intent.confidence : 0.5,
    },
    topicStatus: candidate.topicStatus === "follow_up" ? "follow_up" : "new_topic",
    isClarificationFollowUp: candidate.isClarificationFollowUp === true,
    requiredFields: Array.isArray(candidate.requiredFields)
      ? candidate.requiredFields.filter((value): value is string => typeof value === "string")
      : [],
    searchConcepts: Array.isArray(candidate.searchConcepts)
      ? candidate.searchConcepts.filter((value): value is string => typeof value === "string")
      : [],
  };
}

function getContextRecord(value: unknown): ContextUnderstandingAgentInput["context"] | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as ContextUnderstandingAgentInput["context"])
    : undefined;
}

function buildContextInput(value: unknown): Pick<ContextUnderstandingAgentInput, "context"> | Record<string, never> {
  const context = getContextRecord(value);

  return context ? { context } : {};
}

function getMetadataRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}
