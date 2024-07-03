import { runPipeline } from "mongodb-chatbot-evaluation";
import configConstructor from "../discovery.config";
import { radiantModels } from "../radiantModels";

runPipeline({
  configConstructor,
  pipeline: async (generate, evaluate, report) => {
    const evalReports: { [label: string]: Record<string, unknown> } = {};
    // Run different model evals in parallel
    await Promise.allSettled(
      radiantModels.map(async (model) => {
        const name = `${model.label}_discovery_conversations`;
        const {
          commandRunMetadata: { _id: genRunId },
        } = await generate(name);
        const {
          commandRunMetadata: { _id: qualityEvalRunId },
        } = await evaluate("mentions_mongodb", genRunId);
        const { report: reported } = await report(name, qualityEvalRunId);
        evalReports[model.label] = reported.data;
      })
    );
    // Log all the outputs
    console.table(evalReports);
  },
});
