import type {
  AnswerSource,
  IntegreatResult,
  IntentResult,
  RegionResult,
  UserProfile,
} from "../agents/index.js";

export interface ChatRequestBody {
  message: string;
  profile?: {
    language?: string;
    audience?: string;
    needs?: string[];
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
  };
  region?: {
    country?: string;
    region?: string;
    city?: string;
  };
  context?: {
    profile?: ChatRequestBody["profile"];
    region?: ChatRequestBody["region"];
    intent?: IntentResult;
    lastAssistantMessage?: string;
    lastQuestion?: string;
    questions?: string[];
    originalMessage?: string;
    previousUserMessage?: string;
    message?: string;
  };
}

export interface ChatResponseBody {
  ok: true;
  data: ChatClarificationData | ChatAnswerData | ChatInsufficientContextData;
}

export interface ChatClarificationData {
  mode: "clarification";
  answer: string;
  questions: string[];
  profile: UserProfile;
  region: RegionResult;
}

export interface ChatAnswerData {
  mode: "answer";
  answer: string;
  sources: AnswerSource[];
  suggestedQuestions: string[];
  missingProfileFields: string[];
  context: {
    profile: UserProfile;
    intent: IntentResult;
    region: RegionResult;
    integreat: Pick<IntegreatResult, "region" | "language" | "notes"> & {
      snippetCount: number;
    };
  };
}

export interface ChatInsufficientContextData {
  mode: "insufficient_context";
  answer: string;
  sources: [];
  suggestedQuestions: string[];
  missingProfileFields: string[];
  context: {
    profile: UserProfile;
    intent: IntentResult;
    region: RegionResult;
    integreat: Pick<IntegreatResult, "region" | "language" | "notes"> & {
      snippetCount: number;
    };
  };
}
