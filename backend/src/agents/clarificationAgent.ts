import { normalizeText } from "../utils/text.js";
import { getIntentPolicy, isClarificationFieldPresent, type ClarificationField } from "./intentPolicies.js";
import type { Agent, ClarificationAgentInput, ClarificationResult } from "./types.js";

const MAX_QUESTIONS = 2;

export class ClarificationAgent implements Agent<ClarificationAgentInput, ClarificationResult> {
  async execute(input: ClarificationAgentInput): Promise<ClarificationResult> {
    const missingProfileFields = this.getMissingFields(input);
    const questions = missingProfileFields.map(getClarificationQuestion);

    return {
      answer:
        questions.length > 0
          ? "I can help. I just need a bit more information."
          : "",
      questions,
      missingProfileFields,
    };
  }

  private getMissingFields(input: ClarificationAgentInput): ClarificationField[] {
    const policy = getIntentPolicy(getIntent(input));
    const requiredFields = normalizeRequiredFields(input.requiredFields, policy.requiredFields);
    const missingFields = requiredFields.filter(
      (field) =>
        !policy.forbiddenClarifications.includes(field) &&
        !isClarificationFieldPresent(field, input.profile, input.region),
    );

    return missingFields.slice(0, MAX_QUESTIONS);
  }
}

function normalizeRequiredFields(
  modelRequiredFields: string[] | undefined,
  policyRequiredFields: ClarificationField[],
): ClarificationField[] {
  if (!modelRequiredFields?.length) {
    return policyRequiredFields;
  }

  const allowedFields = new Set<ClarificationField>(policyRequiredFields);
  const normalizedFields = modelRequiredFields
    .map((field) => normalizeText(field))
    .filter((field): field is ClarificationField => allowedFields.has(field as ClarificationField));

  return normalizedFields.length > 0 ? normalizedFields : policyRequiredFields;
}

function getIntent(input: ClarificationAgentInput): string {
  const normalizedIntent = normalizeText(input.intent.intent);

  if (normalizedIntent) {
    return normalizedIntent;
  }

  return normalizeText(input.profile.topic ?? input.message);
}

function getClarificationQuestion(field: ClarificationField): string {
  const questions: Record<ClarificationField, string> = {
    city: "Which city is this about?",
    language: "Which language should I use?",
    topic: "What topic do you need help with?",
    childAge: "How old is the child?",
    residenceStatus: "What is your current residence status?",
    legalStatus: "What is your current legal status?",
    urgency: "How urgent is your housing situation?",
    addressRegistrationType: "Is this your first registration or a change of address?",
    languageLevel: "What is your current language level?",
    workPermit: "Do you already have permission to work?",
    qualification: "What qualification or work experience should I consider?",
    insuranceStatus: "Do you currently have health insurance?",
  };

  return questions[field];
}
