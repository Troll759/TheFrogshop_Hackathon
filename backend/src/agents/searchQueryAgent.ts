import { AppError } from "../utils/appError.js";
import { getIntentPolicy } from "./intentPolicies.js";
import type { Agent, SearchQueryAgentInput, SearchQueryResult } from "./types.js";
import { OpenAiAgentBase, type OpenAiAgentOptions } from "./openAiAgentClient.js";

interface ModelSearchQueryResult {
  queries: string[];
}

export class SearchQueryAgent extends OpenAiAgentBase implements Agent<SearchQueryAgentInput, SearchQueryResult> {
  constructor(options: OpenAiAgentOptions = {}) {
    super(options);
  }

  async execute(input: SearchQueryAgentInput): Promise<SearchQueryResult> {
    try {
      const response = await this.getClient("SearchQueryAgent").responses.create({
        model: this.model,
        input: this.buildPrompt(input),
        text: {
          format: {
            type: "json_schema",
            name: "frogman_search_queries",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              required: ["queries"],
              properties: {
                queries: {
                  type: "array",
                  items: { type: "string" },
                },
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

      throw new AppError("Could not generate Integreat search queries.", 502, "search_query_generation_failed", {
        cause: error instanceof Error ? error.message : "Unknown OpenAI error",
      });
    }
  }

  private buildPrompt(input: SearchQueryAgentInput): string {
    const policy = getIntentPolicy(input.intent);

    return JSON.stringify({
      instructions: [
        "Generate concise search queries for finding relevant Integreat pages, locations, or events.",
        "Include synonyms in English and German where helpful.",
        "For address registration include Anmeldung, register address, residence registration, Bürgerbüro, and registration office.",
        "For school registration include school, education, registration, children 6 to 15, Schule, and Anmeldung.",
        "Return at most 8 short queries.",
      ],
      message: input.message,
      profile: input.profile,
      intent: input.intent,
      intentPolicy: {
        requiredFields: policy.requiredFields,
        optionalFields: policy.optionalFields,
        searchSynonyms: policy.searchSynonyms,
        followUpExamples: policy.followUpExamples,
      },
      region: input.region,
      searchConcepts: input.searchConcepts,
    });
  }

  private normalizeResult(outputText: string, input: SearchQueryAgentInput): SearchQueryResult {
    const parsed = JSON.parse(outputText) as ModelSearchQueryResult;
    const fallbackQueries = [
      input.message,
      input.intent.intent,
      input.profile.topic,
      input.profile.needs.join(" "),
      ...input.searchConcepts,
      ...getIntentPolicy(input.intent).searchSynonyms,
    ];
    const queries = [...(Array.isArray(parsed.queries) ? parsed.queries : []), ...fallbackQueries]
      .filter((query): query is string => typeof query === "string" && query.trim().length > 0)
      .map((query) => query.trim())
      .filter((query, index, all) => all.indexOf(query) === index)
      .slice(0, 10);

    return { queries };
  }
}
