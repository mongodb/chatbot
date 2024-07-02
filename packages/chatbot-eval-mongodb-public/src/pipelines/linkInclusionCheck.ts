import { runPipeline } from "mongodb-chatbot-evaluation";
import configConstructor from "../eval.config";

runPipeline({
  configConstructor,
  pipeline: async (generate, evaluate, report) => {
    const {
      commandRunMetadata: { _id: genRunId },
    } = await generate("linkConversations");

    const {
      commandRunMetadata: { _id: qualityEvalRunId },
    } = await evaluate("conversationLinkInclusion", genRunId);
    await report("linkConversationRun", qualityEvalRunId);
  },
});
