import type { ChatRequestBody } from "../types/api.js";
import { AppError } from "./appError.js";

const MAX_MESSAGE_LENGTH = 2000;

export function parseChatRequestBody(value: unknown): ChatRequestBody {
  if (!isRecord(value)) {
    throw new AppError("Request body must be a JSON object.", 400, "invalid_request_body");
  }

  if (typeof value.message !== "string" || value.message.trim().length === 0) {
    throw new AppError("message is required.", 400, "validation_error", {
      field: "message",
    });
  }

  if (value.message.length > MAX_MESSAGE_LENGTH) {
    throw new AppError("message is too long.", 400, "validation_error", {
      field: "message",
      maxLength: MAX_MESSAGE_LENGTH,
    });
  }

  const parsed: ChatRequestBody = {
    message: value.message.trim(),
  };

  if (isRecord(value.profile)) {
    parsed.profile = parseProfile(value.profile);
  }

  if (isRecord(value.region)) {
    parsed.region = parseRegion(value.region);
  }

  if (isRecord(value.context)) {
    parsed.context = parseContext(value.context);
  }

  return parsed;
}

function parseProfile(value: Record<string, unknown>): NonNullable<ChatRequestBody["profile"]> {
  return {
    ...(typeof value.language === "string" ? { language: value.language.trim() } : {}),
    ...(typeof value.audience === "string" ? { audience: value.audience.trim() } : {}),
    ...(typeof value.age === "number" ? { age: value.age } : {}),
    ...(typeof value.children === "boolean" ? { children: value.children } : {}),
    ...(typeof value.childAge === "number" ? { childAge: value.childAge } : {}),
    ...(Array.isArray(value.childAges)
      ? { childAges: value.childAges.filter((age): age is number => typeof age === "number") }
      : {}),
    ...(typeof value.legalStatus === "string" ? { legalStatus: value.legalStatus.trim() } : {}),
    ...(typeof value.residenceStatus === "string" ? { residenceStatus: value.residenceStatus.trim() } : {}),
    ...(typeof value.nationality === "string" ? { nationality: value.nationality.trim() } : {}),
    ...(typeof value.citizenship === "string" ? { citizenship: value.citizenship.trim() } : {}),
    ...(typeof value.passportCountry === "string" ? { passportCountry: value.passportCountry.trim() } : {}),
    ...(typeof value.residencePermitCountry === "string"
      ? { residencePermitCountry: value.residencePermitCountry.trim() }
      : {}),
    ...(isUrgency(value.urgency) ? { urgency: value.urgency } : {}),
    ...(typeof value.topic === "string" ? { topic: value.topic.trim() } : {}),
    ...(isAddressRegistrationType(value.addressRegistrationType)
      ? { addressRegistrationType: value.addressRegistrationType }
      : {}),
    ...(typeof value.languageLevel === "string" ? { languageLevel: value.languageLevel.trim() } : {}),
    ...(typeof value.workPermit === "string" ? { workPermit: value.workPermit.trim() } : {}),
    ...(typeof value.qualification === "string" ? { qualification: value.qualification.trim() } : {}),
    ...(typeof value.insuranceStatus === "string" ? { insuranceStatus: value.insuranceStatus.trim() } : {}),
    ...(Array.isArray(value.needs)
      ? { needs: value.needs.filter((need): need is string => typeof need === "string").map((need) => need.trim()) }
      : {}),
  };
}

function parseRegion(value: Record<string, unknown>): NonNullable<ChatRequestBody["region"]> {
  return {
    ...(typeof value.country === "string" ? { country: value.country.trim() } : {}),
    ...(typeof value.region === "string" ? { region: value.region.trim() } : {}),
    ...(typeof value.city === "string" ? { city: value.city.trim() } : {}),
  };
}

function parseContext(value: Record<string, unknown>): NonNullable<ChatRequestBody["context"]> {
  return {
    ...(isRecord(value.profile) ? { profile: parseProfile(value.profile) } : {}),
    ...(isRecord(value.region) ? { region: parseRegion(value.region) } : {}),
    ...(isRecord(value.intent) ? { intent: parseIntent(value.intent) } : {}),
    ...(typeof value.lastAssistantMessage === "string" ? { lastAssistantMessage: value.lastAssistantMessage.trim() } : {}),
    ...(typeof value.lastQuestion === "string" ? { lastQuestion: value.lastQuestion.trim() } : {}),
    ...(Array.isArray(value.questions)
      ? { questions: value.questions.filter((question): question is string => typeof question === "string") }
      : {}),
    ...(typeof value.originalMessage === "string" ? { originalMessage: value.originalMessage.trim() } : {}),
    ...(typeof value.previousUserMessage === "string" ? { previousUserMessage: value.previousUserMessage.trim() } : {}),
    ...(typeof value.message === "string" ? { message: value.message.trim() } : {}),
  };
}

function parseIntent(value: Record<string, unknown>): NonNullable<NonNullable<ChatRequestBody["context"]>["intent"]> {
  return {
    intent: typeof value.intent === "string" ? value.intent.trim() : "information",
    confidence: typeof value.confidence === "number" ? value.confidence : 0,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isUrgency(value: unknown): value is "low" | "medium" | "high" {
  return value === "low" || value === "medium" || value === "high";
}

function isAddressRegistrationType(value: unknown): value is "first_registration" | "change_of_address" {
  return value === "first_registration" || value === "change_of_address";
}
