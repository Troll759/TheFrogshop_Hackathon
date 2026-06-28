export interface Agent<Input, Output> {
  execute(input: Input): Promise<Output>;
}

export interface OrchestrationRequest {
  message: string;
  metadata?: Record<string, unknown>;
}

export interface UserProfile {
  language?: string;
  audience?: string;
  needs: string[];
  age?: number;
  children?: boolean;
  childAge?: number;
  childAges?: number[];
  legalStatus?: string;
  residenceStatus?: string;
  nationality?: string;
  citizenship?: string;
  passportCountry?: string;
  residencePermitCountry?: string;
  urgency?: "low" | "medium" | "high";
  topic?: string;
  addressRegistrationType?: "first_registration" | "change_of_address";
  languageLevel?: string;
  workPermit?: string;
  qualification?: string;
  insuranceStatus?: string;
}

export interface IntentResult {
  intent: string;
  confidence: number;
}

export interface RegionResult {
  country?: string;
  region?: string;
  city?: string;
}

export interface IntegreatResult {
  region?: {
    id: number;
    name: string;
    path: string;
  };
  language: string;
  snippets: IntegreatSnippet[];
  notes: string[];
}

export type IntegreatSnippetType = "page" | "location" | "event";

export interface IntegreatSnippet {
  type: IntegreatSnippetType;
  title: string;
  text: string;
  url: string;
  path: string;
  score: number;
  lastUpdated?: string;
  metadata?: Record<string, string>;
}

export interface AnswerResult {
  answer: string;
  sources: AnswerSource[];
  suggestedQuestions: string[];
  missingProfileFields: string[];
}

export interface AnswerSource {
  title: string;
  url: string;
  path: string;
  type: IntegreatSnippetType;
}

export interface OrchestrationResult {
  profile: UserProfile;
  intent: IntentResult;
  region: RegionResult;
  integreat: IntegreatResult;
  answer: AnswerResult;
  validation?: ValidationResult;
}

export interface ProfileAgentInput {
  request: OrchestrationRequest;
}

export interface ProfileExtractionAgentInput {
  message: string;
}

export interface ProfileExtractionResult {
  city: string | null;
  language: string | null;
  age: number | null;
  children: boolean | null;
  childAge: number | null;
  childAges: number[];
  legalStatus: string | null;
  residenceStatus: string | null;
  nationality: string | null;
  citizenship: string | null;
  passportCountry: string | null;
  residencePermitCountry: string | null;
  urgency: "low" | "medium" | "high" | null;
  topic: string | null;
}

export interface ClarificationAgentInput {
  message: string;
  profile: Partial<UserProfile>;
  region: RegionResult;
  intent: IntentResult;
  requiredFields?: string[];
}

export interface ClarificationResult {
  answer: string;
  questions: string[];
  missingProfileFields: string[];
}

export interface IntentAgentInput {
  request: OrchestrationRequest;
  profile: UserProfile;
}

export interface RegionAgentInput {
  request: OrchestrationRequest;
  profile: UserProfile;
  intent: IntentResult;
}

export interface IntegreatAgentInput {
  request: OrchestrationRequest;
  profile: UserProfile;
  intent: IntentResult;
  region: RegionResult;
  searchQueries?: string[];
}

export interface AnswerAgentInput {
  request: OrchestrationRequest;
  profile: UserProfile;
  intent: IntentResult;
  region: RegionResult;
  integreat: IntegreatResult;
}

export interface ContextUnderstandingAgentInput {
  message: string;
  context?: {
    profile?: Partial<UserProfile> | undefined;
    region?: RegionResult | undefined;
    intent?: IntentResult | undefined;
    lastAssistantMessage?: string | undefined;
    lastQuestion?: string | undefined;
    questions?: string[] | undefined;
    originalMessage?: string | undefined;
    previousUserMessage?: string | undefined;
    message?: string | undefined;
  };
}

export interface ContextUnderstandingResult {
  effectiveMessage: string;
  profileUpdates: Partial<UserProfile>;
  regionUpdates: RegionResult;
  intent: IntentResult;
  topicStatus: "new_topic" | "follow_up";
  isClarificationFollowUp: boolean;
  requiredFields: string[];
  searchConcepts: string[];
}

export interface SearchQueryAgentInput {
  message: string;
  profile: UserProfile;
  intent: IntentResult;
  region: RegionResult;
  searchConcepts: string[];
}

export interface SearchQueryResult {
  queries: string[];
}

export interface RerankerAgentInput {
  message: string;
  profile: UserProfile;
  intent: IntentResult;
  region: RegionResult;
  searchQueries: string[];
  snippets: IntegreatSnippet[];
}

export interface RerankerResult {
  snippets: IntegreatSnippet[];
  reasons: RerankerReason[];
}

export interface RerankerReason {
  title: string;
  url: string;
  reason: string;
}

export interface ValidationAgentInput {
  answer: AnswerResult;
  snippets: IntegreatSnippet[];
  intent: IntentResult;
}

export interface ValidationResult {
  supported: boolean;
  reason: string;
}
