import { normalizeText } from "../utils/text.js";
import type { IntentResult, RegionResult, UserProfile } from "./types.js";

export type ClarificationField =
  | "city"
  | "language"
  | "topic"
  | "childAge"
  | "residenceStatus"
  | "legalStatus"
  | "urgency"
  | "addressRegistrationType"
  | "languageLevel"
  | "workPermit"
  | "qualification"
  | "insuranceStatus";

export interface IntentPolicy {
  intent: string;
  requiredFields: ClarificationField[];
  optionalFields: ClarificationField[];
  forbiddenClarifications: ClarificationField[];
  searchSynonyms: string[];
  followUpExamples: string[];
}

const ALL_CLARIFICATION_FIELDS: ClarificationField[] = [
  "city",
  "language",
  "topic",
  "childAge",
  "residenceStatus",
  "legalStatus",
  "urgency",
  "addressRegistrationType",
  "languageLevel",
  "workPermit",
  "qualification",
  "insuranceStatus",
];

const GENERIC_FOLLOW_UP_EXAMPLES = [
  "what documents do i need",
  "where do i go",
  "how much does it cost",
  "can i do it online",
  "what are the steps",
];

const UNKNOWN_POLICY = createPolicy({
  intent: "unknown",
  requiredFields: ["topic"],
  optionalFields: [],
  searchSynonyms: ["information", "help", "info", "Beratung", "Hilfe"],
  followUpExamples: GENERIC_FOLLOW_UP_EXAMPLES,
});

export const INTENT_POLICIES: Record<string, IntentPolicy> = {
  address_registration: createPolicy({
    intent: "address_registration",
    requiredFields: ["city", "addressRegistrationType"],
    optionalFields: ["language"],
    searchSynonyms: [
      "Anmeldung",
      "address registration",
      "register address",
      "residence registration",
      "Bürgerbüro",
      "registration office",
      "Einwohnermeldeamt",
      "change of address",
    ],
    followUpExamples: GENERIC_FOLLOW_UP_EXAMPLES,
  }),
  school_registration: createPolicy({
    intent: "school_registration",
    requiredFields: ["city", "childAge"],
    optionalFields: ["language"],
    searchSynonyms: [
      "school registration",
      "register child for school",
      "school enrollment",
      "education",
      "children 6 to 15",
      "Schule",
      "Einschulung",
      "Schulanmeldung",
    ],
    followUpExamples: GENERIC_FOLLOW_UP_EXAMPLES,
  }),
  residence_permit: createPolicy({
    intent: "residence_permit",
    requiredFields: ["city", "residenceStatus"],
    optionalFields: ["language"],
    searchSynonyms: [
      "residence permit",
      "Aufenthaltstitel",
      "Aufenthalt",
      "visa",
      "Ausländerbehörde",
      "immigration office",
    ],
    followUpExamples: GENERIC_FOLLOW_UP_EXAMPLES,
  }),
  asylum: createPolicy({
    intent: "asylum",
    requiredFields: ["city", "legalStatus"],
    optionalFields: ["language"],
    searchSynonyms: [
      "asylum",
      "asylum procedure",
      "asylum application",
      "refugee protection",
      "Asyl",
      "Asylverfahren",
      "Asylantrag",
      "Flüchtling",
      "BAMF",
    ],
    followUpExamples: GENERIC_FOLLOW_UP_EXAMPLES,
  }),
  housing: createPolicy({
    intent: "housing",
    requiredFields: ["city", "urgency"],
    optionalFields: ["language"],
    searchSynonyms: [
      "housing",
      "accommodation",
      "apartment",
      "shelter",
      "homeless",
      "Wohnung",
      "Unterkunft",
      "Notunterkunft",
    ],
    followUpExamples: GENERIC_FOLLOW_UP_EXAMPLES,
  }),
  healthcare: createPolicy({
    intent: "healthcare",
    requiredFields: ["city", "urgency", "insuranceStatus"],
    optionalFields: ["language"],
    searchSynonyms: [
      "healthcare",
      "medical help",
      "doctor",
      "hospital",
      "health insurance",
      "Krankenversicherung",
      "Arzt",
      "Krankenhaus",
      "medizinische Hilfe",
    ],
    followUpExamples: GENERIC_FOLLOW_UP_EXAMPLES,
  }),
  language_course: createPolicy({
    intent: "language_course",
    requiredFields: ["city", "languageLevel"],
    optionalFields: ["language"],
    searchSynonyms: [
      "language course",
      "German course",
      "integration course",
      "Deutschkurse",
      "Sprachkurs",
      "Integrationskurs",
      "language level",
    ],
    followUpExamples: GENERIC_FOLLOW_UP_EXAMPLES,
  }),
  job: createPolicy({
    intent: "job",
    requiredFields: ["city", "workPermit"],
    optionalFields: ["qualification", "language"],
    searchSynonyms: [
      "job",
      "work",
      "employment",
      "work permit",
      "qualification recognition",
      "Arbeit",
      "Job",
      "Beschäftigung",
      "Arbeitserlaubnis",
      "Anerkennung",
    ],
    followUpExamples: GENERIC_FOLLOW_UP_EXAMPLES,
  }),
  counseling: createPolicy({
    intent: "counseling",
    requiredFields: ["city", "topic"],
    optionalFields: ["language"],
    searchSynonyms: [
      "counseling",
      "advice",
      "consultation",
      "help center",
      "Beratung",
      "Beratungsstelle",
      "Hilfe",
    ],
    followUpExamples: GENERIC_FOLLOW_UP_EXAMPLES,
  }),
  documents: createPolicy({
    intent: "documents",
    requiredFields: ["city", "topic"],
    optionalFields: ["language", "residenceStatus"],
    searchSynonyms: [
      "documents",
      "papers",
      "forms",
      "certificate",
      "passport",
      "Unterlagen",
      "Dokumente",
      "Bescheinigung",
      "Formulare",
    ],
    followUpExamples: GENERIC_FOLLOW_UP_EXAMPLES,
  }),
  childcare: createPolicy({
    intent: "childcare",
    requiredFields: ["city", "childAge"],
    optionalFields: ["language"],
    searchSynonyms: [
      "childcare",
      "daycare",
      "nursery",
      "kindergarten",
      "Kita",
      "Kindergarten",
      "Kinderbetreuung",
    ],
    followUpExamples: GENERIC_FOLLOW_UP_EXAMPLES,
  }),
  benefits: createPolicy({
    intent: "benefits",
    requiredFields: ["city", "legalStatus"],
    optionalFields: ["language"],
    searchSynonyms: [
      "benefits",
      "financial support",
      "social benefits",
      "money",
      "Sozialleistungen",
      "Bürgergeld",
      "Asylbewerberleistungen",
      "finanzielle Hilfe",
    ],
    followUpExamples: GENERIC_FOLLOW_UP_EXAMPLES,
  }),
  event_search: createPolicy({
    intent: "event_search",
    requiredFields: ["city"],
    optionalFields: ["language", "topic"],
    searchSynonyms: ["events", "appointments", "courses", "Veranstaltungen", "Termine", "Kurse"],
    followUpExamples: GENERIC_FOLLOW_UP_EXAMPLES,
  }),
  location_search: createPolicy({
    intent: "location_search",
    requiredFields: ["city", "topic"],
    optionalFields: ["language"],
    searchSynonyms: ["location", "address", "office", "counselling", "Amt", "Behörde", "Beratung"],
    followUpExamples: GENERIC_FOLLOW_UP_EXAMPLES,
  }),
  emergency: createPolicy({
    intent: "emergency",
    requiredFields: ["city"],
    optionalFields: ["language"],
    searchSynonyms: ["emergency", "urgent help", "Notfall", "police", "hospital", "doctor"],
    followUpExamples: GENERIC_FOLLOW_UP_EXAMPLES,
  }),
  information: createPolicy({
    intent: "information",
    requiredFields: ["topic"],
    optionalFields: ["city", "language"],
    searchSynonyms: ["information", "help", "info", "Beratung", "Hilfe"],
    followUpExamples: GENERIC_FOLLOW_UP_EXAMPLES,
  }),
  unknown: UNKNOWN_POLICY,
};

export function getIntentPolicy(intent: IntentResult | string | undefined): IntentPolicy {
  const intentName = normalizeIntentName(intent);

  return INTENT_POLICIES[intentName] ?? UNKNOWN_POLICY;
}

export function isGenericIntentFollowUp(message: string): boolean {
  const normalizedMessage = normalizeText(message);

  return GENERIC_FOLLOW_UP_EXAMPLES.some((example) => normalizedMessage.includes(normalizeText(example)));
}

export function isClarificationFieldPresent(
  field: ClarificationField,
  profile: Partial<UserProfile>,
  region: RegionResult,
): boolean {
  if (field === "city") {
    return Boolean(region.city);
  }

  if (field === "language") {
    return Boolean(profile.language);
  }

  if (field === "topic") {
    return Boolean(profile.topic || profile.needs?.length);
  }

  if (field === "childAge") {
    return profile.childAge !== undefined || Boolean(profile.childAges?.length);
  }

  if (field === "residenceStatus") {
    return Boolean(profile.residenceStatus || profile.legalStatus);
  }

  if (field === "legalStatus") {
    return Boolean(profile.legalStatus || profile.residenceStatus);
  }

  if (field === "urgency") {
    return Boolean(profile.urgency);
  }

  if (field === "addressRegistrationType") {
    return Boolean(profile.addressRegistrationType);
  }

  if (field === "languageLevel") {
    return Boolean(profile.languageLevel);
  }

  if (field === "workPermit") {
    return Boolean(profile.workPermit);
  }

  if (field === "qualification") {
    return Boolean(profile.qualification);
  }

  if (field === "insuranceStatus") {
    return Boolean(profile.insuranceStatus);
  }

  return false;
}

function createPolicy(policy: Omit<IntentPolicy, "forbiddenClarifications">): IntentPolicy {
  const allowedFields = new Set([...policy.requiredFields, ...policy.optionalFields]);

  return {
    ...policy,
    forbiddenClarifications: ALL_CLARIFICATION_FIELDS.filter((field) => !allowedFields.has(field)),
  };
}

function normalizeIntentName(intent: IntentResult | string | undefined): string {
  if (typeof intent === "string") {
    return normalizeText(intent);
  }

  return intent?.intent ? normalizeText(intent.intent) : "unknown";
}
