import { runPipeline } from "mongodb-chatbot-eval";
import configConstructor from "../eval.config";

runPipeline({
  configConstructor,
  pipeline: async (generate, evaluate, report) => {
    const { _id: genRunId } = await generate("conversations");

    const { _id: qualityEvalRunId } = await evaluate(
      "conversationQuality",
      genRunId
    );
    await report("conversationQualityRun", qualityEvalRunId);

    const { _id: faithfulnessEvalRunId } = await evaluate(
      "conversationFaithfulness",
      genRunId
    );
    await report("conversationFaithfulnessRun", faithfulnessEvalRunId);

    const { _id: retrievalEvalRunId } = await evaluate(
      "conversationRetrievalScore",
      genRunId
    );
    await report("conversationRetrievalScoreAvg", retrievalEvalRunId);
  },
});
