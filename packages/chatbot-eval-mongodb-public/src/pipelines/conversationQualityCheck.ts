import { runPipeline } from "mongodb-chatbot-eval";
import configConstructor from "../eval.config";

runPipeline({
  configConstructor,
  pipelineFunc: async (generate, evaluate, report) => {
    const { _id: genRunId } = await generate("conversations");
    const { _id: evalRunId } = await evaluate("conversationQuality", genRunId);
    await report("conversationQualityRun", evalRunId);
  },
});
