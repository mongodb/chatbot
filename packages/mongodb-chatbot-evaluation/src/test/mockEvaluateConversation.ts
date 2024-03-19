import { ObjectId } from "mongodb-rag-core";
import {
  stringifyConversation,
  EvalResult,
  EvaluateQualityFunc,
} from "../evaluate";
import { ConversationGeneratedData } from "../generate";
import { strict as assert } from "assert";

export const mockEvaluateConversation: EvaluateQualityFunc = async ({
  runId,
  generatedData,
}) => {
  assert(
    generatedData.type === "conversation",
    "Invalid data type. Expected 'conversation' data."
  );
  const conversationData = generatedData as ConversationGeneratedData;
  const {
    data: { messages },
  } = conversationData;

  const conversationTranscript = stringifyConversation(messages);

  const { meetsChatQualityStandards, reason } = mockCheckResponseQuality({
    received: conversationTranscript,
  });
  return {
    _id: new ObjectId(),
    generatedDataId: generatedData._id,
    commandRunMetadataId: runId,
    type: "test",
    result: meetsChatQualityStandards ? 1 : 0,
    createdAt: new Date(),
    metadata: {
      reason,
      conversationTranscript,
    },
  } satisfies EvalResult;
};

export const FAIL_ON_ME = "<FAIL ON ME>";

function mockCheckResponseQuality({ received }: { received: string }) {
  if (received.includes(FAIL_ON_ME)) {
    return {
      meetsChatQualityStandards: false,
      reason: `Expected output contains '${FAIL_ON_ME}'`,
    };
  } else {
    return {
      meetsChatQualityStandards: true,
      reason: `Expected output does not contain '${FAIL_ON_ME}'`,
    };
  }
}
