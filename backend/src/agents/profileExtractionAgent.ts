import OpenAI from "openai";

import { AppError } from "../utils/appError.js";
import type { Agent, ProfileExtractionAgentInput, ProfileExtractionResult } from "./types.js";

const DEFAULT_MODEL = "gpt-4.1-mini";

interface ProfileExtractionAgentOptions {
  client?: OpenAI;
  model?: string;
}

export class ProfileExtractionAgent implements Agent<ProfileExtractionAgentInput, ProfileExtractionResult> {
  private readonly client: OpenAI | undefined;
  private readonly model: string;

  constructor(options: ProfileExtractionAgentOptions = {}) {
    this.client = options.client;
    this.model = options.model ?? process.env.OPENAI_MODEL ?? DEFAULT_MODEL;
  }

  async execute(input: ProfileExtractionAgentInput): Promise<ProfileExtractionResult> {
    try {
      const response = await this.getClient().responses.create({
        model: this.model,
        input: this.buildPrompt(input.message),
        text: {
          format: {
            type: "json_schema",
            name: "frogman_profile_extraction",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              required: [
                "city",
                "language",
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
              ],
              properties: {
                city: { type: ["string", "null"] },
                language: { type: ["string", "null"] },
                age: { type: ["number", "null"] },
                children: { type: ["boolean", "null"] },
                childAge: { type: ["number", "null"] },
                childAges: {
                  type: "array",
                  items: { type: "number" },
                },
                legalStatus: { type: ["string", "null"] },
                residenceStatus: { type: ["string", "null"] },
                nationality: { type: ["string", "null"] },
                citizenship: { type: ["string", "null"] },
                passportCountry: { type: ["string", "null"] },
                residencePermitCountry: { type: ["string", "null"] },
                urgency: { type: ["string", "null"], enum: ["low", "medium", "high", null] },
                topic: { type: ["string", "null"] },
              },
            },
          },
        },
      });

      return this.normalizeResult(response.output_text, input.message);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError("Could not extract profile fields.", 502, "profile_extraction_failed", {
        cause: error instanceof Error ? error.message : "Unknown OpenAI error",
      });
    }
  }

  private getClient(): OpenAI {
    if (this.client) {
      return this.client;
    }

    if (!process.env.OPENAI_API_KEY) {
      throw new AppError("OPENAI_API_KEY is required to run ProfileExtractionAgent.", 503, "openai_not_configured");
    }

    return new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  private buildPrompt(message: string): string {
    return JSON.stringify({
      instructions: [
        "Extract only explicitly stated or strongly implied profile fields from the user message.",
        "Return null for every field that is missing, unclear, or not inferable.",
        "Do not invent legal status, city, language, child details, country details, urgency, or topic.",
        "Keep user age and child age separate. If the user says 'I am 18' or 'actually I am 18', set age=18 and do not set childAge.",
        "If the user says 'my child is 7' or 'my children are 7 and 10', set childAge or childAges and do not set age.",
        "Use legalStatus for the user's legal/onboarding status when stated, for example asylum seeker, refugee, student, worker, tolerated stay.",
        "Set language ONLY when the user explicitly asks what language the assistant should use.",
        "Examples that set language: 'in German', 'German language', 'Answer in German.', 'Reply in German.', 'Can you speak Arabic?', 'Please respond in English.'",
        "Do NOT set language from nationality, citizenship, passport country, residence permit country, courses, classes, offices, documents, or a destination country.",
        "Examples that must leave language null: 'I have a German passport.', 'I am German.', 'I have German citizenship.', 'I have a German permit.', 'I have a German residence permit.', 'I take a German course.', 'I need German documents.', 'I want to work in Germany.'",
        "Classify nationality, citizenship, passportCountry, and residencePermitCountry separately when stated.",
        "Use ISO-style language codes only for explicit response-language requests, for example en, de, ar, uk, ru, tr, fr, fa.",
        "Use urgency high only for immediate danger, medical emergency, homelessness tonight, or similar time-critical needs.",
        "Use urgency medium for time-sensitive but not immediate needs. Use low for general information.",
      ],
      message,
      fields: [
        "city",
        "language",
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
      ],
    });
  }

  private normalizeResult(outputText: string, message: string): ProfileExtractionResult {
    const parsed = JSON.parse(outputText) as Partial<ProfileExtractionResult>;

    return {
      city: normalizeNullableString(parsed.city),
      language: isExplicitLanguageRequest(message) ? normalizeLanguageCode(parsed.language) : null,
      age: typeof parsed.age === "number" ? parsed.age : null,
      children: typeof parsed.children === "boolean" ? parsed.children : null,
      childAge: typeof parsed.childAge === "number" ? parsed.childAge : null,
      childAges: Array.isArray(parsed.childAges)
        ? parsed.childAges.filter((age): age is number => typeof age === "number")
        : [],
      legalStatus: normalizeNullableString(parsed.legalStatus),
      residenceStatus: normalizeNullableString(parsed.residenceStatus),
      nationality: normalizeNullableString(parsed.nationality),
      citizenship: normalizeNullableString(parsed.citizenship),
      passportCountry: normalizeNullableString(parsed.passportCountry),
      residencePermitCountry: normalizeNullableString(parsed.residencePermitCountry),
      urgency: normalizeUrgency(parsed.urgency),
      topic: normalizeNullableString(parsed.topic),
    };
  }

}

function normalizeNullableString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function normalizeLanguageCode(value: unknown): string | null {
  const normalizedValue = normalizeNullableString(value)?.toLowerCase();

  if (!normalizedValue) {
    return null;
  }

  const languageCodes: Record<string, string> = {
    ar: "ar",
    arabic: "ar",
    de: "de",
    deutsch: "de",
    german: "de",
    en: "en",
    englisch: "en",
    english: "en",
    fa: "fa",
    farsi: "fa",
    persian: "fa",
    fr: "fr",
    francais: "fr",
    french: "fr",
    ru: "ru",
    russian: "ru",
    tr: "tr",
    turkish: "tr",
    uk: "uk",
    ukrainian: "uk",
  };

  return languageCodes[normalizedValue] ?? normalizedValue.match(/^[a-z]{2,3}$/u)?.[0] ?? null;
}

function normalizeUrgency(value: unknown): ProfileExtractionResult["urgency"] {
  return value === "low" || value === "medium" || value === "high" ? value : null;
}

function isExplicitLanguageRequest(message: string): boolean {
  const language = "(?:english|german|arabic|french|russian|ukrainian|turkish|farsi|persian)";
  const germanNonLanguageContext =
    /\b(?:in\s+)?german\s+(?:passport|citizenship|permit|residence\s+permit|course|class|office|documents?)\b|\bgermany\b/i;
  const allowedLanguageRequestPatterns = [
    new RegExp(`\\b(?:answer|respond|reply)\\b.*\\bin\\s+${language}\\b`, "i"),
    new RegExp(`\\bin\\s+${language}\\b`, "i"),
    new RegExp(`\\bspeak\\s+${language}\\b`, "i"),
    new RegExp(`\\b${language}\\s+language\\b(?!\\s+(?:course|class))`, "i"),
  ];

  return allowedLanguageRequestPatterns.some((pattern) => {
    const match = message.match(pattern);

    if (!match) {
      return false;
    }

    return !germanNonLanguageContext.test(message);
  });
}
