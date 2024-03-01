import {
  FaithfulnessEvaluator,
  LLM,
  serviceContextFromDefaults,
} from "llamaindex";
import { EvaluateQualityFunc } from "./EvaluateQualityFunc";
import { ConversationGeneratedData } from "../generate";
import { ObjectId, UserMessage } from "mongodb-chatbot-server";
import { strict as assert } from "assert";
import { EvalResult } from "./EvaluationStore";

interface MakeEvaluatorParams {
  llamaIndexLlm: LLM;
}

/**
  Evaluate whether the assistant's response is faithful to the retrieved context information
  Wraps the LlamaIndex.ts [`FaithfulnessEvaluator`](https://ts.llamaindex.ai/modules/evaluation/modules/faithfulness).
 */
export function makeFaithfulnessEvaluator({
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
    } = conversationData;
    const ragUserMessage = messages.find(
      (m) => m.role === "user" && m.contextContent
    ) as UserMessage;
    if (!ragUserMessage) {
      throw new Error("No user message found with context content.");
      // TODO: do we want this behavior?
    }

    // TODO: handle if no context content
    const texts =
      ragUserMessage.contextContent?.map(({ text }) => text ?? "") ?? [];

    const query = ragUserMessage.content;

    const response = "TODO: get response from convo...last assistant msg";

    const result = await evaluator.evaluate({
      query,
      response,
      contexts: texts,
    });
    // TODO: explore data in the response object...perhaps some metadata to add to the eval result

    console.log(
      `the response is ${result.passing ? "faithful" : "not faithful"}`
    );
    return {
      generatedDataId: generatedData._id,
      result: result.passing ? 1 : 0,
      evalName: "conversation_faithfulness",
      _id: new ObjectId(),
      createdAt: new Date(),
      commandRunMetadataId: runId,
      metadata: {},
    } satisfies EvalResult;
  };
}
