import type { Agent, ProfileAgentInput, UserProfile } from "./types.js";

export class ProfileAgent implements Agent<ProfileAgentInput, UserProfile> {
  async execute(input: ProfileAgentInput): Promise<UserProfile> {
    const profile = getMetadataRecord(input.request.metadata?.profile);

    return {
      ...(typeof profile.language === "string" ? { language: profile.language } : {}),
      ...(typeof profile.audience === "string" ? { audience: profile.audience } : {}),
      ...(typeof profile.age === "number" ? { age: profile.age } : {}),
      ...(typeof profile.children === "boolean" ? { children: profile.children } : {}),
      ...(typeof profile.childAge === "number" ? { childAge: profile.childAge } : {}),
      ...(Array.isArray(profile.childAges)
        ? { childAges: profile.childAges.filter((age): age is number => typeof age === "number") }
        : {}),
      ...(typeof profile.legalStatus === "string" ? { legalStatus: profile.legalStatus } : {}),
      ...(typeof profile.residenceStatus === "string" ? { residenceStatus: profile.residenceStatus } : {}),
      ...(typeof profile.nationality === "string" ? { nationality: profile.nationality } : {}),
      ...(typeof profile.citizenship === "string" ? { citizenship: profile.citizenship } : {}),
      ...(typeof profile.passportCountry === "string" ? { passportCountry: profile.passportCountry } : {}),
      ...(typeof profile.residencePermitCountry === "string"
        ? { residencePermitCountry: profile.residencePermitCountry }
        : {}),
      ...(isUrgency(profile.urgency) ? { urgency: profile.urgency } : {}),
      ...(typeof profile.topic === "string" ? { topic: profile.topic } : {}),
      ...(isAddressRegistrationType(profile.addressRegistrationType)
        ? { addressRegistrationType: profile.addressRegistrationType }
        : {}),
      ...(typeof profile.languageLevel === "string" ? { languageLevel: profile.languageLevel } : {}),
      ...(typeof profile.workPermit === "string" ? { workPermit: profile.workPermit } : {}),
      ...(typeof profile.qualification === "string" ? { qualification: profile.qualification } : {}),
      ...(typeof profile.insuranceStatus === "string" ? { insuranceStatus: profile.insuranceStatus } : {}),
      needs: Array.isArray(profile.needs)
        ? profile.needs.filter((need): need is string => typeof need === "string")
        : [],
    };
  }
}

function getMetadataRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function isUrgency(value: unknown): value is "low" | "medium" | "high" {
  return value === "low" || value === "medium" || value === "high";
}

function isAddressRegistrationType(value: unknown): value is "first_registration" | "change_of_address" {
  return value === "first_registration" || value === "change_of_address";
}
