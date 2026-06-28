import OpenAI from "openai";

import { AppError } from "../utils/appError.js";

const DEFAULT_MODEL = "gpt-4.1-mini";

export interface OpenAiAgentOptions {
  client?: OpenAI;
  model?: string;
}

export abstract class OpenAiAgentBase {
  protected readonly client: OpenAI | undefined;
  protected readonly model: string;

  protected constructor(options: OpenAiAgentOptions = {}) {
    this.client = options.client;
    this.model = options.model ?? process.env.OPENAI_MODEL ?? DEFAULT_MODEL;
  }

  protected getClient(agentName: string): OpenAI {
    if (this.client) {
      return this.client;
    }

    if (!process.env.OPENAI_API_KEY) {
      throw new AppError(`OPENAI_API_KEY is required to run ${agentName}.`, 503, "openai_not_configured");
    }

    return new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
}
