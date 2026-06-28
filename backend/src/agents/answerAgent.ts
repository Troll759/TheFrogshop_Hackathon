import OpenAI from "openai";

import { AppError } from "../utils/appError.js";
import type { Agent, AnswerAgentInput, AnswerResult, AnswerSource, IntegreatSnippet } from "./types.js";

const DEFAULT_MODEL = "gpt-4.1-mini";

interface AnswerAgentOptions {
  client?: OpenAI;
  model?: string;
}

interface ModelAnswerResult {
  answer: string;
  sources: AnswerSource[];
  suggestedQuestions: string[];
  missingProfileFields: string[];
}

export class AnswerAgent implements Agent<AnswerAgentInput, AnswerResult> {
  private readonly model: string;
  private readonly client: OpenAI | undefined;

  constructor(options: AnswerAgentOptions = {}) {
    this.client = options.client;
    this.model = options.model ?? process.env.OPENAI_MODEL ?? DEFAULT_MODEL;
  }

  async execute(input: AnswerAgentInput): Promise<AnswerResult> {
    const missingProfileFields = this.getMissingProfileFields(input);

    if (input.integreat.snippets.length === 0) {
      return {
        answer: "I do not have enough retrieved Integreat information to answer this safely.",
        sources: [],
        suggestedQuestions: [
          "Which city or district in Germany is this about?",
          "Which language should I use?",
        ],
        missingProfileFields,
      };
    }

    try {
      const response = await this.getClient().responses.create({
        model: this.model,
        input: this.buildPrompt(input, missingProfileFields),
        text: {
          format: {
            type: "json_schema",
            name: "frogman_answer",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              required: ["answer", "sources", "suggestedQuestions", "missingProfileFields"],
              properties: {
                answer: {
                  type: "string",
                },
                sources: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: false,
                    required: ["title", "url", "path", "type"],
                    properties: {
                      title: { type: "string" },
                      url: { type: "string" },
                      path: { type: "string" },
                      type: { type: "string", enum: ["page", "location", "event"] },
                    },
                  },
                },
                suggestedQuestions: {
                  type: "array",
                  items: { type: "string" },
                },
                missingProfileFields: {
                  type: "array",
                  items: { type: "string" },
                },
              },
            },
          },
        },
      });

      return this.normalizeModelResult(response.output_text, input.integreat.snippets, missingProfileFields);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError("Could not generate an answer.", 502, "answer_generation_failed", {
        cause: error instanceof Error ? error.message : "Unknown OpenAI error",
      });
    }
  }

  private getClient(): OpenAI {
    if (this.client) {
      return this.client;
    }

    if (!process.env.OPENAI_API_KEY) {
      throw new AppError("OPENAI_API_KEY is required to run answerAgent.", 503, "openai_not_configured");
    }

    return new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  private buildPrompt(input: AnswerAgentInput, missingProfileFields: string[]): string {
    return JSON.stringify({
      instructions: [
        "You are Frogman, a refugee information assistant for Germany.",
        "Answer the user only with information supported by the provided Integreat snippets whenever possible.",
        "Do not add legal claims, deadlines, eligibility rules, or procedural guarantees unless they are explicitly present in the snippets.",
        "If the snippets do not contain enough information, say that the retrieved information is insufficient and ask for the missing detail.",
        "Use plain, practical language.",
        "Return only JSON matching the requested schema.",
      ],
      userMessage: input.request.message,
      detectedIntent: input.intent,
      userProfile: input.profile,
      detectedRegion: input.region,
      integreatRegion: input.integreat.region,
      integreatLanguage: input.integreat.language,
      missingProfileFields,
      snippets: input.integreat.snippets.map((snippet, index) => ({
        index,
        type: snippet.type,
        title: snippet.title,
        text: snippet.text,
        url: snippet.url,
        path: snippet.path,
        metadata: snippet.metadata ?? {},
        lastUpdated: snippet.lastUpdated,
      })),
    });
  }

  private normalizeModelResult(
    outputText: string,
    snippets: IntegreatSnippet[],
    missingProfileFields: string[],
  ): AnswerResult {
    const parsed = JSON.parse(outputText) as ModelAnswerResult;
    const allowedSources = new Map(snippets.map((snippet) => [snippet.url, snippet]));
    const trustedSources = parsed.sources
      .map((source) => allowedSources.get(source.url))
      .filter((source): source is IntegreatSnippet => Boolean(source))
      .map((source) => ({
        title: source.title,
        url: source.url,
        path: source.path,
        type: source.type,
      }));

    return {
      answer: parsed.answer,
      sources: trustedSources,
      suggestedQuestions: parsed.suggestedQuestions.slice(0, 3),
      missingProfileFields,
    };
  }

  private getMissingProfileFields(input: AnswerAgentInput): string[] {
    const missingFields: string[] = [];

    if (!input.profile.language) {
      missingFields.push("language");
    }

    if (!input.profile.audience) {
      missingFields.push("audience");
    }

    if (!input.region.city && !input.region.region && !input.integreat.region) {
      missingFields.push("region");
    }

    return missingFields;
  }
}
