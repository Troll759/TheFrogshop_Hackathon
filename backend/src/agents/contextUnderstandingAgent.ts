import { AppError } from "../utils/appError.js";
import { normalizeText } from "../utils/text.js";
import { getIntentPolicy, INTENT_POLICIES, isGenericIntentFollowUp } from "./intentPolicies.js";
import type {
  Agent,
  ContextUnderstandingAgentInput,
  ContextUnderstandingResult,
  IntentResult,
  RegionResult,
  UserProfile,
} from "./types.js";
import { OpenAiAgentBase, type OpenAiAgentOptions } from "./openAiAgentClient.js";

interface ModelContextUnderstandingResult {
  effectiveMessage: string | null;
  profileUpdates: Partial<UserProfile>;
  regionUpdates: RegionResult;
  intent: IntentResult;
  topicStatus: "new_topic" | "follow_up";
  isClarificationFollowUp: boolean;
  requiredFields: string[];
  searchConcepts: string[];
}

export class ContextUnderstandingAgent
  extends OpenAiAgentBase
  implements Agent<ContextUnderstandingAgentInput, ContextUnderstandingResult>
{
  constructor(options: OpenAiAgentOptions = {}) {
    super(options);
  }

  async execute(input: ContextUnderstandingAgentInput): Promise<ContextUnderstandingResult> {
    try {
      const response = await this.getClient("ContextUnderstandingAgent").responses.create({
        model: this.model,
        input: this.buildPrompt(input),
        text: {
          format: {
            type: "json_schema",
            name: "frogman_context_understanding",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              required: [
                "effectiveMessage",
                "profileUpdates",
                "regionUpdates",
                "intent",
                "topicStatus",
                "isClarificationFollowUp",
                "requiredFields",
                "searchConcepts",
              ],
              properties: {
                effectiveMessage: { type: ["string", "null"] },
                profileUpdates: {
                  type: "object",
                  additionalProperties: false,
                  required: [
                    "language",
                    "audience",
                    "needs",
                    "age",
                    "children",
                    "childAge",
                    "childAges",
                    "legalStatus",
                    "residenceStatus",
                    "nationality",
                    "citizenship",
                    "passportCountry",
                    "residencePermitCountry",
                    "urgency",
                    "topic",
                    "addressRegistrationType",
                    "languageLevel",
                    "workPermit",
                    "qualification",
                    "insuranceStatus",
                  ],
                  properties: {
                    language: { type: ["string", "null"] },
                    audience: { type: ["string", "null"] },
                    needs: { type: "array", items: { type: "string" } },
                    age: { type: ["number", "null"] },
                    children: { type: ["boolean", "null"] },
                    childAge: { type: ["number", "null"] },
                    childAges: { type: "array", items: { type: "number" } },
                    legalStatus: { type: ["string", "null"] },
                    residenceStatus: { type: ["string", "null"] },
                    nationality: { type: ["string", "null"] },
                    citizenship: { type: ["string", "null"] },
                    passportCountry: { type: ["string", "null"] },
                    residencePermitCountry: { type: ["string", "null"] },
                    urgency: { type: ["string", "null"], enum: ["low", "medium", "high", null] },
                    topic: { type: ["string", "null"] },
                    addressRegistrationType: {
                      type: ["string", "null"],
                      enum: ["first_registration", "change_of_address", null],
                    },
                    languageLevel: { type: ["string", "null"] },
                    workPermit: { type: ["string", "null"] },
                    qualification: { type: ["string", "null"] },
                    insuranceStatus: { type: ["string", "null"] },
                  },
                },
                regionUpdates: {
                  type: "object",
                  additionalProperties: false,
                  required: ["country", "region", "city"],
                  properties: {
                    country: { type: ["string", "null"] },
                    region: { type: ["string", "null"] },
                    city: { type: ["string", "null"] },
                  },
                },
                intent: {
                  type: "object",
                  additionalProperties: false,
                  required: ["intent", "confidence"],
                  properties: {
                    intent: { type: "string" },
                    confidence: { type: "number" },
                  },
                },
                topicStatus: { type: "string", enum: ["new_topic", "follow_up"] },
                isClarificationFollowUp: { type: "boolean" },
                requiredFields: { type: "array", items: { type: "string" } },
                searchConcepts: { type: "array", items: { type: "string" } },
              },
            },
          },
        },
      });

      return this.normalizeResult(response.output_text, input);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError("Could not understand the conversation context.", 502, "context_understanding_failed", {
        cause: error instanceof Error ? error.message : "Unknown OpenAI error",
      });
    }
  }

  private buildPrompt(input: ContextUnderstandingAgentInput): string {
    const previousPolicy = input.context?.intent ? getIntentPolicy(input.context.intent) : undefined;

    return JSON.stringify({
      instructions: [
        "Understand the user message for a Germany refugee information assistant.",
        "Determine the user's intent, whether this is a new topic or a follow-up, and which profile fields are required for that intent.",
        "Interpret clarification follow-ups using the previous question and previous user topic.",
        "If the user asks a generic follow-up such as what documents are needed, where to go, cost, online availability, or steps, inherit the previous intent.",
        "If the user only answers a clarification question, effectiveMessage must preserve the previous topic and include the new answer.",
        "Extract profile updates only when explicitly stated.",
        "Keep user age and child age separate.",
        "Only set language when the user explicitly asks for response language or directly answers a language clarification.",
        "Do not infer language from nationality, passport, citizenship, residence permit, country, or destination country.",
        "Do not set language for German passport, German citizenship, German permit, German residence permit, German course, German class, German office, German documents, or Germany.",
        "Map address registration, register my address, Anmeldung, residence registration, and Bürgerbüro to address_registration intent.",
        "For address registration follow-ups, classify first registration as addressRegistrationType=first_registration and moving/change of address as addressRegistrationType=change_of_address.",
        "Extract languageLevel for language course needs, workPermit and qualification for job needs, and insuranceStatus for healthcare needs when stated.",
        "requiredFields must contain only fields required by the selected intent policy. Never include fields from another intent.",
        "Return short search concepts that can help find Integreat pages.",
      ],
      message: input.message,
      context: input.context ?? {},
      intentPolicies: Object.values(INTENT_POLICIES).map((policy) => ({
        intent: policy.intent,
        requiredFields: policy.requiredFields,
        optionalFields: policy.optionalFields,
        forbiddenClarifications: policy.forbiddenClarifications,
      })),
      previousIntentPolicy: previousPolicy
        ? {
            intent: previousPolicy.intent,
            requiredFields: previousPolicy.requiredFields,
            optionalFields: previousPolicy.optionalFields,
            forbiddenClarifications: previousPolicy.forbiddenClarifications,
            searchSynonyms: previousPolicy.searchSynonyms,
            followUpExamples: previousPolicy.followUpExamples,
          }
        : null,
    });
  }

  private normalizeResult(outputText: string, input: ContextUnderstandingAgentInput): ContextUnderstandingResult {
    const parsed = JSON.parse(outputText) as ModelContextUnderstandingResult;
    const profileUpdates = normalizeProfileUpdates(parsed.profileUpdates ?? {}, input);
    const regionUpdates = normalizeRegionUpdates(parsed.regionUpdates ?? {});
    const preservedMessage = getPreviousTopic(input) ?? input.message;
    const shouldInheritPreviousIntent = shouldInheritIntent(input, parsed, profileUpdates, regionUpdates);
    const intent = shouldInheritPreviousIntent && input.context?.intent
      ? input.context.intent
      : normalizeIntent(parsed.intent, input);
    const topicStatus = shouldInheritPreviousIntent || parsed.topicStatus === "follow_up" ? "follow_up" : "new_topic";
    const effectiveMessage = shouldInheritPreviousIntent && getPreviousTopic(input)
      ? `${preservedMessage}\nFollow-up question: ${input.message}`
      : normalizeNullableString(parsed.effectiveMessage) ?? preservedMessage;

    return {
      effectiveMessage,
      profileUpdates,
      regionUpdates,
      intent,
      topicStatus,
      isClarificationFollowUp: shouldInheritPreviousIntent || parsed.isClarificationFollowUp === true,
      requiredFields: normalizeRequiredFields(parsed.requiredFields, intent),
      searchConcepts: Array.isArray(parsed.searchConcepts)
        ? parsed.searchConcepts.filter((value): value is string => typeof value === "string").slice(0, 8)
        : [],
    };
  }
}

function normalizeProfileUpdates(
  value: Partial<UserProfile>,
  input: ContextUnderstandingAgentInput,
): Partial<UserProfile> {
  const profile: Partial<UserProfile> = {};

  if (
    typeof value.language === "string" &&
    isExplicitLanguageValue(value.language) &&
    isExplicitResponseLanguageRequest(input)
  ) {
    const language = normalizeLanguageCode(value.language);

    if (language) {
      profile.language = language;
    }
  }

  if (typeof value.audience === "string" && value.audience.trim()) {
    profile.audience = value.audience.trim();
  }

  if (Array.isArray(value.needs) && value.needs.length > 0) {
    profile.needs = value.needs.filter((need): need is string => typeof need === "string" && need.trim().length > 0);
  }

  if (typeof value.age === "number") profile.age = value.age;
  if (typeof value.children === "boolean") profile.children = value.children;
  if (typeof value.childAge === "number") profile.childAge = value.childAge;
  if (Array.isArray(value.childAges) && value.childAges.length > 0) {
    profile.childAges = value.childAges.filter((age): age is number => typeof age === "number");
  }
  if (typeof value.legalStatus === "string" && value.legalStatus.trim()) profile.legalStatus = value.legalStatus.trim();
  if (typeof value.residenceStatus === "string" && value.residenceStatus.trim()) {
    profile.residenceStatus = value.residenceStatus.trim();
  }
  if (typeof value.nationality === "string" && value.nationality.trim()) profile.nationality = value.nationality.trim();
  if (typeof value.citizenship === "string" && value.citizenship.trim()) profile.citizenship = value.citizenship.trim();
  if (typeof value.passportCountry === "string" && value.passportCountry.trim()) {
    profile.passportCountry = value.passportCountry.trim();
  }
  if (typeof value.residencePermitCountry === "string" && value.residencePermitCountry.trim()) {
    profile.residencePermitCountry = value.residencePermitCountry.trim();
  }
  if (value.urgency === "low" || value.urgency === "medium" || value.urgency === "high") profile.urgency = value.urgency;
  if (typeof value.topic === "string" && value.topic.trim()) profile.topic = value.topic.trim();
  if (isAddressRegistrationType(value.addressRegistrationType)) {
    profile.addressRegistrationType = value.addressRegistrationType;
  }
  if (typeof value.languageLevel === "string" && value.languageLevel.trim()) {
    profile.languageLevel = value.languageLevel.trim();
  }
  if (typeof value.workPermit === "string" && value.workPermit.trim()) {
    profile.workPermit = value.workPermit.trim();
  }
  if (typeof value.qualification === "string" && value.qualification.trim()) {
    profile.qualification = value.qualification.trim();
  }
  if (typeof value.insuranceStatus === "string" && value.insuranceStatus.trim()) {
    profile.insuranceStatus = value.insuranceStatus.trim();
  }

  return profile;
}

function normalizeRegionUpdates(value: RegionResult): RegionResult {
  return {
    ...(typeof value.country === "string" && value.country.trim() ? { country: value.country.trim() } : {}),
    ...(typeof value.region === "string" && value.region.trim() ? { region: value.region.trim() } : {}),
    ...(typeof value.city === "string" && value.city.trim() ? { city: value.city.trim() } : {}),
  };
}

function normalizeIntent(value: IntentResult | undefined, input: ContextUnderstandingAgentInput): IntentResult {
  const previousIntent = input.context?.intent;

  if (value?.intent && Number.isFinite(value.confidence)) {
    return {
      intent: value.intent,
      confidence: Math.max(0, Math.min(1, value.confidence)),
    };
  }

  return previousIntent ?? { intent: "information", confidence: 0.3 };
}

function normalizeRequiredFields(value: unknown, intent: IntentResult): string[] {
  const policy = getIntentPolicy(intent);
  const policyRequiredFields = new Set<string>(policy.requiredFields);
  const modelFields = Array.isArray(value)
    ? value.filter((field): field is string => typeof field === "string")
    : [];
  const normalizedModelFields = modelFields
    .map((field) => normalizeText(field))
    .filter((field) => policyRequiredFields.has(field));

  return normalizedModelFields.length > 0 ? normalizedModelFields : policy.requiredFields;
}

function shouldInheritIntent(
  input: ContextUnderstandingAgentInput,
  parsed: ModelContextUnderstandingResult,
  profileUpdates: Partial<UserProfile>,
  regionUpdates: RegionResult,
): boolean {
  if (!input.context?.intent) {
    return false;
  }

  return (
    parsed.isClarificationFollowUp === true ||
    isGenericIntentFollowUp(input.message) ||
    isProfileOnlyFollowUp(input, profileUpdates, regionUpdates)
  );
}

function isProfileOnlyFollowUp(
  input: ContextUnderstandingAgentInput,
  profileUpdates: Partial<UserProfile>,
  regionUpdates: RegionResult,
): boolean {
  const normalizedMessage = normalizeText(input.message);
  const normalizedQuestion = getLastAssistantQuestion(input);

  if (hasNewQuestionShape(normalizedMessage)) {
    return false;
  }

  if (normalizedQuestion.includes("which city") && regionUpdates.city) {
    return true;
  }

  if (normalizedQuestion.includes("which language") && profileUpdates.language) {
    return true;
  }

  if (normalizedQuestion.includes("how old is the child") && profileUpdates.childAge !== undefined) {
    return true;
  }

  if (
    (normalizedQuestion.includes("legal status") || normalizedQuestion.includes("residence status")) &&
    (profileUpdates.legalStatus || profileUpdates.residenceStatus)
  ) {
    return true;
  }

  if (normalizedQuestion.includes("first registration") && profileUpdates.addressRegistrationType) {
    return true;
  }

  if (normalizedQuestion.includes("language level") && profileUpdates.languageLevel) {
    return true;
  }

  if (normalizedQuestion.includes("permission to work") && profileUpdates.workPermit) {
    return true;
  }

  if (normalizedQuestion.includes("health insurance") && profileUpdates.insuranceStatus) {
    return true;
  }

  if (normalizedQuestion.includes("urgent") && profileUpdates.urgency) {
    return true;
  }

  return isShortProfileOnlyStatement(normalizedMessage, profileUpdates, regionUpdates);
}

function getLastAssistantQuestion(input: ContextUnderstandingAgentInput): string {
  return normalizeText(
    input.context?.lastQuestion ?? input.context?.lastAssistantMessage ?? input.context?.questions?.[0] ?? "",
  );
}

function hasNewQuestionShape(normalizedMessage: string): boolean {
  return /(?:\bhow\b|\bwhat\b|\bwhere\b|\bwhen\b|\bwhy\b|\bcan\b|\bdo\b|\bdoes\b|\bneed\b|\bregister\b|\bapply\b|\bfind\b|\?)/u.test(
    normalizedMessage,
  );
}

function isShortProfileOnlyStatement(
  normalizedMessage: string,
  profileUpdates: Partial<UserProfile>,
  regionUpdates: RegionResult,
): boolean {
  const tokenCount = normalizedMessage.split(/\s+/u).filter(Boolean).length;

  if (tokenCount > 6) {
    return false;
  }

  if (regionUpdates.city && /^[a-zA-Z\s.'-]+$/u.test(regionUpdates.city)) {
    return true;
  }

  if (profileUpdates.language && tokenCount <= 3) {
    return true;
  }

  if (
    profileUpdates.age !== undefined &&
    /^(?:no\s+)?(?:actually\s+)?(?:i\s+am|i'm)?\s*\d{1,2}\s*$/u.test(normalizedMessage)
  ) {
    return true;
  }

  if (
    profileUpdates.childAge !== undefined &&
    /^(?:my\s+child\s+is\s+)?\d{1,2}\s*$/u.test(normalizedMessage)
  ) {
    return true;
  }

  return Boolean(
    profileUpdates.legalStatus ||
      profileUpdates.residenceStatus ||
      profileUpdates.addressRegistrationType ||
      profileUpdates.languageLevel ||
      profileUpdates.workPermit ||
      profileUpdates.insuranceStatus,
  );
}

function getPreviousTopic(input: ContextUnderstandingAgentInput): string | undefined {
  return (
    input.context?.originalMessage ??
    input.context?.previousUserMessage ??
    input.context?.message ??
    input.context?.profile?.topic ??
    input.context?.profile?.needs?.join(" ") ??
    input.context?.intent?.intent
  );
}

function normalizeNullableString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function isExplicitLanguageValue(value: string): boolean {
  const normalizedValue = normalizeText(value);

  return Boolean(normalizeLanguageCode(normalizedValue));
}

function normalizeLanguageCode(value: string): string | undefined {
  const languages: Record<string, string> = {
    arabic: "ar",
    ar: "ar",
    deutsch: "de",
    german: "de",
    de: "de",
    english: "en",
    englisch: "en",
    en: "en",
    french: "fr",
    francais: "fr",
    fr: "fr",
    persian: "fa",
    farsi: "fa",
    fa: "fa",
    russian: "ru",
    ru: "ru",
    ukrainian: "uk",
    uk: "uk",
    turkish: "tr",
    tr: "tr",
  };

  return languages[normalizeText(value)];
}

function isAddressRegistrationType(value: unknown): value is "first_registration" | "change_of_address" {
  return value === "first_registration" || value === "change_of_address";
}

function isExplicitResponseLanguageRequest(input: ContextUnderstandingAgentInput): boolean {
  const normalizedMessage = normalizeText(input.message);
  const normalizedQuestion = normalizeText(
    input.context?.lastQuestion ?? input.context?.lastAssistantMessage ?? input.context?.questions?.[0] ?? "",
  );
  const language = "(?:english|german|arabic|french|russian|ukrainian|turkish|farsi|persian|deutsch|englisch)";
  const germanNonLanguageContext =
    /\b(?:in\s+)?german\s+(?:passport|citizenship|permit|residence\s+permit|course|class|office|documents?)\b|\bgermany\b/u;
  const languageAnswerPattern = new RegExp(`^(?:${language}|de|en|ar|fr|ru|uk|tr|fa)$`, "u");
  const explicitPatterns = [
    new RegExp(`\\b(?:answer|respond|reply)\\b.*\\bin\\s+${language}\\b`, "u"),
    new RegExp(`\\bin\\s+${language}\\b`, "u"),
    new RegExp(`\\bspeak\\s+${language}\\b`, "u"),
    new RegExp(`\\b${language}\\s+language\\b(?!\\s+(?:course|class))`, "u"),
  ];

  if (germanNonLanguageContext.test(normalizedMessage)) {
    return false;
  }

  if (normalizedQuestion.includes("which language should i use") && languageAnswerPattern.test(normalizedMessage)) {
    return true;
  }

  return explicitPatterns.some((pattern) => pattern.test(normalizedMessage));
}
