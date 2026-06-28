import type { Agent, RegionAgentInput, RegionResult } from "./types.js";

export class RegionAgent implements Agent<RegionAgentInput, RegionResult> {
  async execute(input: RegionAgentInput): Promise<RegionResult> {
    const region = getMetadataRecord(input.request.metadata?.region);

    return {
      ...(typeof region.country === "string" ? { country: region.country } : {}),
      ...(typeof region.region === "string" ? { region: region.region } : {}),
      ...(typeof region.city === "string" ? { city: region.city } : {}),
    };
  }
}

function getMetadataRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}
