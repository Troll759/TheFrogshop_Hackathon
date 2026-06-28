import { normalizeText } from "../utils/text.js";
import type { Agent, IntentAgentInput, IntentResult } from "./types.js";

const INTENT_KEYWORDS: Array<{ intent: string; keywords: string[] }> = [
  { intent: "emergency", keywords: ["emergency", "urgent", "notfall", "police", "arzt", "hospital"] },
  {
    intent: "school_registration",
    keywords: ["school registration", "register my child for school", "school", "schule", "einschulung"],
  },
  {
    intent: "residence_permit",
    keywords: ["residence permit", "aufenthaltstitel", "aufenthalt", "permit", "visa"],
  },
  { intent: "asylum", keywords: ["asylum", "asyl", "asylum procedure", "asylantrag", "bamf"] },
  {
    intent: "housing",
    keywords: ["housing", "wohnung", "unterkunft", "accommodation", "shelter", "homeless"],
  },
  {
    intent: "healthcare",
    keywords: ["healthcare", "health insurance", "doctor", "hospital", "medical", "arzt", "krankenhaus"],
  },
  {
    intent: "language_course",
    keywords: ["language course", "german course", "integration course", "sprachkurs", "deutschkurs", "integrationskurs"],
  },
  { intent: "job", keywords: ["job", "work", "employment", "work permit", "arbeit", "arbeitserlaubnis"] },
  { intent: "counseling", keywords: ["counseling", "advice", "consultation", "beratung", "beratungsstelle"] },
  { intent: "documents", keywords: ["documents", "papers", "forms", "unterlagen", "dokumente", "formulare"] },
  { intent: "childcare", keywords: ["childcare", "daycare", "kita", "kindergarten", "kinderbetreuung"] },
  { intent: "benefits", keywords: ["benefits", "financial support", "social benefits", "sozialleistungen", "bürgergeld"] },
  {
    intent: "address_registration",
    keywords: ["register my address", "address registration", "anmeldung", "wohnsitz anmelden", "register address"],
  },
  { intent: "event_search", keywords: ["event", "veranstaltung", "course", "kurs", "today", "tomorrow"] },
  { intent: "location_search", keywords: ["where", "address", "location", "office", "amt", "behorde", "behörde"] },
  { intent: "information", keywords: ["how", "what", "wie", "was", "info", "information"] },
];

export class IntentAgent implements Agent<IntentAgentInput, IntentResult> {
  async execute(input: IntentAgentInput): Promise<IntentResult> {
    const preservedIntent = getPreservedIntent(input.request.metadata?.intent);
    const normalizedMessage = normalizeText(
      [
        input.request.message,
        input.profile.topic,
        input.profile.needs.join(" "),
        preservedIntent?.intent,
      ]
        .filter(Boolean)
        .join(" "),
    );
    const match = INTENT_KEYWORDS.find((candidate) =>
      candidate.keywords.some((keyword) => normalizedMessage.includes(normalizeText(keyword))),
    );

    return {
      intent: match?.intent ?? preservedIntent?.intent ?? "information",
      confidence: match ? 0.7 : preservedIntent?.confidence ?? 0.3,
    };
  }
}

function getPreservedIntent(value: unknown): IntentResult | undefined {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return undefined;
  }

  const candidate = value as Record<string, unknown>;

  if (typeof candidate.intent !== "string") {
    return undefined;
  }

  return {
    intent: candidate.intent,
    confidence: typeof candidate.confidence === "number" ? candidate.confidence : 0.5,
  };
}
