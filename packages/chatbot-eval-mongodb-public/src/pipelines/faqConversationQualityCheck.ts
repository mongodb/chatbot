import { runPipeline } from "mongodb-chatbot-evaluation";
import configConstructor from "../eval.config";

runPipeline({
  configConstructor,
  pipeline: async (generate, evaluate, report) => {
    const {
      commandRunMetadata: { _id: genRunId },
    } = await generate("faqConversations");
    const {
      commandRunMetadata: { _id: qualityEvalRunId },
    } = await evaluate("conversationQuality", genRunId);
    await report("faqConversationQualityRun", qualityEvalRunId);

    const {
      commandRunMetadata: { _id: faithfulnessEvalRunId },
    } = await evaluate("conversationFaithfulness", genRunId);
    await report("faqConversationFaithfulnessRun", faithfulnessEvalRunId);

    const {
      commandRunMetadata: { _id: retrievalEvalRunId },
    } = await evaluate("conversationRetrievalScore", genRunId);
    await report("faqConversationRetrievalScoreAvg", retrievalEvalRunId);

    const {
      commandRunMetadata: { _id: relevancyEvalRunId },
    } = await evaluate("faqConversationAnswerRelevancy", genRunId);
    await report("faqConversationAnswerRelevancyRun", relevancyEvalRunId);
  },
});
