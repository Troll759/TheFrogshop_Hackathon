import { Router } from "express";
import type { Response } from "express";

import { ClarificationAgent, ContextUnderstandingAgent } from "../agents/index.js";
import type {
  Agent,
  ClarificationAgentInput,
  ClarificationResult,
  ContextUnderstandingAgentInput,
  ContextUnderstandingResult,
  Orchestrator,
  UserProfile,
} from "../agents/index.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import type { ChatRequestBody, ChatResponseBody } from "../types/api.js";
import { parseChatRequestBody } from "../utils/validation.js";

export function createChatRouter(
  orchestrator: Orchestrator,
  contextUnderstandingAgent: Agent<ContextUnderstandingAgentInput, ContextUnderstandingResult> = new ContextUnderstandingAgent(),
  clarificationAgent: Agent<ClarificationAgentInput, ClarificationResult> = new ClarificationAgent(),
): Router {
  const router = Router();

  router.post(
    "/",
    asyncHandler(async (req, res: Response<ChatResponseBody>) => {
      const body = parseChatRequestBody(req.body);
      const understanding = await contextUnderstandingAgent.execute({
        message: body.message,
        ...(body.context ? { context: body.context } : {}),
      });
      const mergedProfile = mergeProfile(body.profile, body.context?.profile, understanding.profileUpdates);
      const mergedRegion = mergeRegion(body.region, body.context?.region, understanding.regionUpdates);
      const clarification = await clarificationAgent.execute({
        message: understanding.effectiveMessage,
        profile: mergedProfile,
        region: mergedRegion,
        intent: understanding.intent,
        requiredFields: understanding.requiredFields,
      });

      if (clarification.questions.length > 0) {
        res.json({
          ok: true,
          data: {
            mode: "clarification",
            answer: clarification.answer,
            questions: clarification.questions,
            profile: toUserProfile(mergedProfile),
            region: mergedRegion,
          },
        });
        return;
      }

      const result = await orchestrator.execute({
        message: understanding.effectiveMessage,
        metadata: {
          profile: mergedProfile,
          region: mergedRegion,
          intent: understanding.intent,
          context: body.context,
          contextUnderstanding: understanding,
        },
      });
      const contextRegion =
        Object.keys(mergedRegion).length > 0
          ? mergedRegion
            : result.integreat.region
              ? { city: result.integreat.region.name, region: result.integreat.region.path }
              : mergedRegion;

      const context = {
        profile: result.profile,
        intent: result.intent,
        region: contextRegion,
        integreat: {
          ...(result.integreat.region ? { region: result.integreat.region } : {}),
          language: result.integreat.language,
          notes: result.integreat.notes,
          snippetCount: result.integreat.snippets.length,
        },
      };

      if (result.integreat.snippets.length === 0 || result.answer.sources.length === 0) {
        res.json({
          ok: true,
          data: {
            mode: "insufficient_context",
            answer: "I could not find a reliable Integreat source for this yet.",
            sources: [],
            suggestedQuestions: [
              "Which city is this about?",
              "Can you describe the topic another way?",
            ],
            missingProfileFields: result.answer.missingProfileFields,
            context,
          },
        });
        return;
      }

      res.json({
        ok: true,
        data: {
          mode: "answer",
          answer: result.answer.answer,
          sources: result.answer.sources,
          suggestedQuestions: result.answer.suggestedQuestions,
          missingProfileFields: result.answer.missingProfileFields,
          context,
        },
      });
    }),
  );

  return router;
}

function mergeProfile(
  requestProfile: ChatRequestBody["profile"],
  contextProfile: ChatRequestBody["profile"],
  profileUpdates: Partial<UserProfile>,
): NonNullable<ChatRequestBody["profile"]> {
  return {
    ...contextProfile,
    ...profileUpdates,
    ...(profileUpdates.topic && !profileUpdates.needs ? { needs: [profileUpdates.topic] } : {}),
    ...requestProfile,
  };
}

function mergeRegion(
  requestRegion: ChatRequestBody["region"],
  contextRegion: ChatRequestBody["region"],
  regionUpdates: ContextUnderstandingResult["regionUpdates"],
): NonNullable<ChatRequestBody["region"]> {
  return {
    ...contextRegion,
    ...regionUpdates,
    ...requestRegion,
  };
}

function toUserProfile(profile: NonNullable<ChatRequestBody["profile"]>): UserProfile {
  return {
    ...profile,
    needs: profile.needs ?? [],
  };
}
