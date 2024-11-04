import { EvaluateQualityFunc } from "./EvaluateQualityFunc";
import { ConversationGeneratedData } from "../generate";
import { ObjectId } from "mongodb-rag-core/mongodb";
import { strict as assert } from "assert";
import { EvalResult } from "./EvaluationStore";

export interface MakeEvaluateConversationLastMessageIncludesRegexParams {
  /**
    Regex to test against.
   */
  regex: RegExp;
}
/**
  Evaluate if the last assistant message in a conversation contains the provided regular expression.
 */
export const makeEvaluateConversationLastMessageIncludesRegex = function ({
  regex,
}: MakeEvaluateConversationLastMessageIncludesRegexParams): EvaluateQualityFunc {
  return async function ({ runId, generatedData }) {
    assert(
      generatedData.type === "conversation",
      "Invalid data type. Expected 'conversation' data."
    );
    const conversationData = generatedData as ConversationGeneratedData;
    const {
      data: { messages },
      evalData: { name },
    } = conversationData;
    const lastMessage = messages[messages.length - 1];
    assert(
      lastMessage.role === "assistant",
      "Last message is not an assistant message."
    );
    const lastMessageContent = lastMessage.content;
    const lastMessageIncludesRegex = regex.test(lastMessageContent);
    return {
      _id: new ObjectId(),
      commandRunMetadataId: runId,
      createdAt: new Date(),
      generatedDataId: generatedData._id,
      metadata: {
        lastMessageContent,
        regex: regex.toString(),
        testName: name,
      },
      result: lastMessageIncludesRegex ? 1 : 0,
      type: "conversation_last_message_includes_regex",
    } satisfies EvalResult;
  };
};
