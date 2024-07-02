import { runPipeline } from "mongodb-chatbot-evaluation";
import configConstructor from "../eval.config";

runPipeline({
  configConstructor,
  pipeline: async (generate, evaluate, report) => {
    const {
      commandRunMetadata: { _id: genRunId },
    } = await generate("conversations");

    const {
      commandRunMetadata: { _id: qualityEvalRunId },
    } = await evaluate("conversationQuality", genRunId);
    await report("conversationQualityRun", qualityEvalRunId);

    const {
      commandRunMetadata: { _id: faithfulnessEvalRunId },
    } = await evaluate("conversationFaithfulness", genRunId);
    await report("conversationFaithfulnessRun", faithfulnessEvalRunId);

    const {
      commandRunMetadata: { _id: retrievalEvalRunId },
    } = await evaluate("conversationRetrievalScore", genRunId);
    await report("conversationRetrievalScoreAvg", retrievalEvalRunId);

    const {
      commandRunMetadata: { _id: relevancyEvalRunId },
    } = await evaluate("conversationAnswerRelevancy", genRunId);
    await report("conversationAnswerRelevancyRun", relevancyEvalRunId);
  },
});
