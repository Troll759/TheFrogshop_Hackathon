import { AppError } from "../utils/appError.js";
import type { Agent, IntegreatSnippet, RerankerAgentInput, RerankerResult } from "./types.js";
import { OpenAiAgentBase, type OpenAiAgentOptions } from "./openAiAgentClient.js";

interface ModelRerankerResult {
  selections: Array<{
    index: number;
    relevanceReason: string;
  }>;
}

export class RerankerAgent extends OpenAiAgentBase implements Agent<RerankerAgentInput, RerankerResult> {
  constructor(options: OpenAiAgentOptions = {}) {
    super(options);
  }

  async execute(input: RerankerAgentInput): Promise<RerankerResult> {
    if (input.snippets.length === 0) {
      return { snippets: [], reasons: [] };
    }

    try {
      const response = await this.getClient("RerankerAgent").responses.create({
        model: this.model,
        input: this.buildPrompt(input),
        text: {
          format: {
            type: "json_schema",
            name: "frogman_reranker",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              required: ["selections"],
              properties: {
                selections: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: false,
                    required: ["index", "relevanceReason"],
                    properties: {
                      index: { type: "number" },
                      relevanceReason: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      });

      return this.normalizeResult(response.output_text, input.snippets);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError("Could not rerank Integreat snippets.", 502, "snippet_reranking_failed", {
        cause: error instanceof Error ? error.message : "Unknown OpenAI error",
      });
    }
  }

  private buildPrompt(input: RerankerAgentInput): string {
    return JSON.stringify({
      instructions: [
        "Select only Integreat snippets that directly help answer the user's request.",
        "Choose the best 3 to 5 snippets. Return fewer only if fewer snippets are actually relevant.",
        "For every selected snippet, provide a concise relevance reason.",
        "Reject snippets from the wrong city or region.",
        "Reject snippets in the wrong language when the user's requested language is known.",
        "Reject snippets that are on the wrong topic even if they mention similar words.",
        "Reject snippets for the wrong age group. For example, do not use daycare pages for school-age children or adult pages for child-specific questions.",
        "Prefer official pages over generic locations or events unless the user asks for locations/events.",
        "For school registration, prefer school, education, registration, and children 6 to 15 pages over daycare/family pages.",
        "Return selected snippets ordered by usefulness.",
      ],
      message: input.message,
      profile: input.profile,
      intent: input.intent,
      region: input.region,
      searchQueries: input.searchQueries,
      snippets: input.snippets.map((snippet, index) => ({
        index,
        title: snippet.title,
        path: snippet.path,
        url: snippet.url,
        type: snippet.type,
        metadata: snippet.metadata ?? {},
        text: snippet.text,
      })),
    });
  }

  private normalizeResult(outputText: string, snippets: IntegreatSnippet[]): RerankerResult {
    const parsed = JSON.parse(outputText) as ModelRerankerResult;
    const selections = Array.isArray(parsed.selections) ? parsed.selections : [];
    const seenIndexes = new Set<number>();
    const selectedSnippets = selections
      .filter((selection) => Number.isInteger(selection.index) && selection.index >= 0 && selection.index < snippets.length)
      .filter((selection) => {
        if (seenIndexes.has(selection.index)) {
          return false;
        }

        seenIndexes.add(selection.index);
        return true;
      })
      .map((selection): IntegreatSnippet | undefined => {
        const snippet = snippets[selection.index];
        const relevanceReason =
          typeof selection.relevanceReason === "string" && selection.relevanceReason.trim().length > 0
            ? selection.relevanceReason.trim()
            : "Selected by AI reranking as relevant to the user question.";

        if (!snippet) {
          return undefined;
        }

        return {
          ...snippet,
          metadata: {
            ...(snippet.metadata ?? {}),
            relevanceReason,
          } satisfies Record<string, string>,
        };
      })
      .filter(isDefined)
      .slice(0, 5);

    return {
      snippets: selectedSnippets,
      reasons: selectedSnippets.map((snippet) => ({
        title: snippet.title,
        url: snippet.url,
        reason: snippet.metadata?.relevanceReason ?? "Selected by AI reranking.",
      })),
    };
  }
}

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}
