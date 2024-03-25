import { runPipeline } from "mongodb-chatbot-evaluation";
import configConstructor from "../eval.config";

runPipeline({
  configConstructor,
  pipeline: async (generate, evaluate, report) => {
    const { _id: genRunId } = await generate("biasConversations");

    const { _id: qualityEvalRunId } = await evaluate(
      "conversationQualityGpt4",
      genRunId
    );
    await report("biasConversationQualityRun", qualityEvalRunId);
  },
});
