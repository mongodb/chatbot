import { runPipeline } from "mongodb-chatbot-evaluation";
import configConstructor from "../eval.config";
import { ObjectId } from "mongodb-rag-core";

runPipeline({
  configConstructor,
  pipeline: async (generate, evaluate, report) => {
    // const { _id: genRunId } = await generate("biasConversations");

    const { _id: qualityEvalRunId } = await evaluate(
      "conversationQualityGpt4",
      new ObjectId("6601c4a7610e2741e266fc1d")
    );
    await report("biasConversationQualityRun", qualityEvalRunId);
  },
});
