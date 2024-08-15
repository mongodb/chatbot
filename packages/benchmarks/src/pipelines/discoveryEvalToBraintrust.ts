import { runPipeline } from "mongodb-chatbot-evaluation";
import configConstructor from "../discovery.config";
import { radiantModels } from "../radiantModels";
import { strict as assert } from "assert";
import { evaluateRegexMatch } from "../braintrust/evaluateRegexMatch";
import { assertEnvVars } from "mongodb-rag-core";
import { envVars } from "../envVars";
runPipeline({
  configConstructor,
  pipeline: async (generate, evaluate, report, config) => {
    const { BRAINTRUST_API_KEY } = assertEnvVars({ BRAINTRUST_API_KEY: "" });
    const timestamp = Date.now();
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
        // Put the evaluations in Braintrust
        const generatedData =
          await config.generatedDataStore.findByCommandRunId(genRunId);
        assert(generatedData, `No generated data found for run ${genRunId}`);
        await evaluateRegexMatch({
          generatedData,
          regExp: /mongodb/i,
          projectName: "discovery-benchmark",
          experimentName: `${model.label}-${timestamp}`,
          metadata: {
            generatedDataRunId: genRunId.toString(),
            model: model.label,
          },
          apiKey: BRAINTRUST_API_KEY,
        });
      })
    );
    // Log all the outputs
    console.table(evalReports);
  },
});
