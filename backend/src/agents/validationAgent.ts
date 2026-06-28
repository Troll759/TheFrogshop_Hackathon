import { AppError } from "../utils/appError.js";
import type { Agent, ValidationAgentInput, ValidationResult } from "./types.js";
import { OpenAiAgentBase, type OpenAiAgentOptions } from "./openAiAgentClient.js";

interface ModelValidationResult {
  supported: boolean;
  reason: string;
}

export class ValidationAgent extends OpenAiAgentBase implements Agent<ValidationAgentInput, ValidationResult> {
  constructor(options: OpenAiAgentOptions = {}) {
    super(options);
  }

  async execute(input: ValidationAgentInput): Promise<ValidationResult> {
    if (input.answer.sources.length === 0 || input.snippets.length === 0) {
      return {
        supported: false,
        reason: "Answer has no sources.",
      };
    }

    try {
      const response = await this.getClient("ValidationAgent").responses.create({
        model: this.model,
        input: this.buildPrompt(input),
        text: {
          format: {
            type: "json_schema",
            name: "frogman_answer_validation",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              required: ["supported", "reason"],
              properties: {
                supported: { type: "boolean" },
                reason: { type: "string" },
              },
            },
          },
        },
      });

      return this.normalizeResult(response.output_text);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError("Could not validate answer grounding.", 502, "answer_validation_failed", {
        cause: error instanceof Error ? error.message : "Unknown OpenAI error",
      });
    }
  }

  private buildPrompt(input: ValidationAgentInput): string {
    return JSON.stringify({
      instructions: [
        "Validate whether the answer is fully supported by the provided Integreat snippets.",
        "Reject if it adds legal rules, deadlines, eligibility claims, office requirements, or procedural steps not present in the snippets.",
        "Reject if cited sources are unrelated to the answer or intent.",
        "Return supported=false unless the answer can be grounded in the snippets.",
      ],
      intent: input.intent,
      answer: input.answer.answer,
      sources: input.answer.sources,
      snippets: input.snippets.map((snippet, index) => ({
        index,
        title: snippet.title,
        path: snippet.path,
        url: snippet.url,
        text: snippet.text,
      })),
    });
  }

  private normalizeResult(outputText: string): ValidationResult {
    const parsed = JSON.parse(outputText) as ModelValidationResult;

    return {
      supported: parsed.supported === true,
      reason: typeof parsed.reason === "string" ? parsed.reason : "Validation result was missing a reason.",
    };
  }
}
