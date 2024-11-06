import { EvaluateQualityFunc } from "./EvaluateQualityFunc";
import { ConversationGeneratedData } from "../generate";
import { UserMessage, logger } from "mongodb-chatbot-server";
import { ObjectId } from "mongodb-rag-core/mongodb";
import { strict as assert } from "assert";
import { EvalResult } from "./EvaluationStore";

/**
  Evaluate average similarity score for the retrieved context information.
 */
export const evaluateConversationAverageRetrievalScore: EvaluateQualityFunc =
  async function ({ runId, generatedData }) {
    assert(
      generatedData.type === "conversation",
      "Invalid data type. Expected 'conversation' data."
    );
    const conversationData = generatedData as ConversationGeneratedData;
    const {
      data: { messages },
      evalData: { name },
    } = conversationData;
    const ragUserMessage = messages.find(
      (m) => m.role === "user" && m.contextContent
    ) as UserMessage;
    if (!ragUserMessage || !ragUserMessage.contextContent) {
      throw new Error(
        `No user message with contextContent for test case '${name}'.`
      );
    }

    const scores = ragUserMessage.contextContent.map(
      ({ score }) => score ?? null
    );
    assert(
      !scores.includes(null),
      "At least one contextContent item does not have a score. Not running evaluation."
    );

    const userQueryContent = ragUserMessage.content;

    const avgScore =
      (scores as number[]).reduce((acc, score) => acc + score, 0) /
      scores.length;

    logger.info(
      `The score to '${conversationData.evalData.name}' is: ${avgScore}`
    );
    return {
      generatedDataId: generatedData._id,
      result: avgScore,
      type: "conversation_retrieval_avg_score",
      _id: new ObjectId(),
      createdAt: new Date(),
      commandRunMetadataId: runId,
      metadata: {
        contextContent: ragUserMessage.contextContent,
        userQueryContent,
        preprocessedUserQueryContent: ragUserMessage.preprocessedContent,
        testName: name,
      },
    } satisfies EvalResult;
  };
