import { runPipeline } from "mongodb-chatbot-eval";
import configConstructor from "../eval.config";

runPipeline({
  configConstructor,
  pipeline: async (generate, evaluate, report) => {
    const { _id: genRunId } = await generate("faqConversations");
    const { _id: qualityEvalRunId } = await evaluate(
      "conversationQuality",
      genRunId
    );
    await report("faqConversationQualityRun", qualityEvalRunId);

    const { _id: faithfulnessEvalRunId } = await evaluate(
      "conversationFaithfulness",
      genRunId
    );
    await report("faqConversationFaithfulnessRun", faithfulnessEvalRunId);

    const { _id: retrievalEvalRunId } = await evaluate(
      "conversationRetrievalScore",
      genRunId
    );
    await report("faqConversationRetrievalScoreAvg", retrievalEvalRunId);
  },
});
