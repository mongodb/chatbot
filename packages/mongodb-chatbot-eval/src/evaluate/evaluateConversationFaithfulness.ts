import {
  FaithfulnessEvaluator,
  LLM,
  serviceContextFromDefaults,
} from "llamaindex";
import { EvaluateQualityFunc } from "./EvaluateQualityFunc";
import { ConversationGeneratedData } from "../generate";
import { ObjectId, UserMessage, logger } from "mongodb-chatbot-server";
import { strict as assert } from "assert";
import { EvalResult } from "./EvaluationStore";

interface MakeEvaluatorParams {
  llamaIndexLlm: LLM;
}

/**
  Evaluate whether the assistant's response is faithful to the retrieved context information
  Wraps the LlamaIndex.ts [`FaithfulnessEvaluator`](https://ts.llamaindex.ai/modules/evaluation/modules/faithfulness).

  Note that in our testing experience, results vary based on the large language model
  used in the evaluator. For example, on a dataset of ~50 questions,
  the OpenAI GPT-3.5 model had a higher incidence of false negatives,
  while the OpenAI GPT-4 model had more false positives.

  All evaluation results should be analyzed with a critical eye
  and you should thoroughly review results before making any decisions based on them.
 */
export function makeEvaluateConversationFaithfulness({
  llamaIndexLlm,
}: MakeEvaluatorParams): EvaluateQualityFunc {
  const ctx = serviceContextFromDefaults({
    llm: llamaIndexLlm,
  });

  const evaluator = new FaithfulnessEvaluator({
    serviceContext: ctx,
  });

  return async ({ runId, generatedData }) => {
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

    const texts = ragUserMessage.contextContent.map(({ text }) => text ?? "");

    const userQueryContent = ragUserMessage.content;

    const assistantMessage = messages[messages.length - 1];
    const { content: assistantResponseContent, role } = assistantMessage;
    if (role !== "assistant") {
      throw new Error(
        `No final assistant message found for test case '${name}'. Something unexpected occurred. Please check the test case data.`
      );
    }

    const { score } = await evaluator.evaluate({
      query: userQueryContent,
      response: assistantResponseContent,
      contexts: texts,
    });

    logger.info(
      `The response to '${conversationData.evalData.name}' is ${
        score ? "'faithful'" : "'not faithful'"
      }`
    );
    return {
      generatedDataId: generatedData._id,
      result: score,
      evalName: "conversation_faithfulness",
      _id: new ObjectId(),
      createdAt: new Date(),
      commandRunMetadataId: runId,
      metadata: {
        contextContent: texts,
        userQueryContent,
        assistantResponseContent,
        name,
      },
    } satisfies EvalResult;
  };
}
