import { runPipeline } from "mongodb-chatbot-evaluation";
import configConstructor from "../quizEval.config";
import { radiantModels } from "../radiantModels";

runPipeline({
  configConstructor,
  pipeline: async (generate, evaluate, report) => {
    // Run different model evals in parallel
    await Promise.all(
      radiantModels.map(async (model) => {
        const { _id: genRunId } = await generate(model.label);
        const { _id: qualityEvalRunId } = await evaluate(
          "quizQuestionCorrect",
          genRunId
        );
        await report(model.label, qualityEvalRunId);
      })
    );
  },
});
