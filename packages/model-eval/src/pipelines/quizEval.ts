import { CommandRunMetadata, runPipeline } from "mongodb-chatbot-evaluation";
import configConstructor from "../quizEval.config";
import { radiantModels } from "../radiantModels";
import { ObjectId } from "mongodb-rag-core";

runPipeline({
  configConstructor,
  pipeline: async (generate, evaluate, report) => {
    const evalReports: { [label: string]: Record<string, unknown> } = {};
    // Run different model evals in parallel
    await Promise.allSettled(
      radiantModels.map(async (model) => {
        const {
          commandRunMetadata: { _id: genRunId },
        } = await generate(model.label);
        const {
          commandRunMetadata: { _id: qualityEvalRunId },
        } = await evaluate("quizQuestionCorrect", genRunId);
        const { report: reported } = await report(
          model.label,
          qualityEvalRunId
        );
        evalReports[model.label] = reported.data;
      })
    );
    // Log all the outputs
    console.table(evalReports);
  },
});
