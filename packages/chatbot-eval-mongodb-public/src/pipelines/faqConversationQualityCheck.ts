import { runPipeline } from "mongodb-chatbot-evaluation";
import configConstructor from "../eval.config";

runPipeline({
  configConstructor,
  pipeline: async (generate, evaluate, report) => {
    const { _id: genRunId } = await generate("faqConversations");
    const { _id: evalRunId } = await evaluate("conversationQuality", genRunId);
    await report("conversationQualityRun", evalRunId);
  },
});
