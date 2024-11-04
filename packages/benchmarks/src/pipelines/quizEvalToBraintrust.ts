import { runPipeline } from "mongodb-chatbot-evaluation";
import configConstructor from "../quizEval.config";
import { radiantModels } from "../radiantModels";
import { evaluateQuizQuestions } from "../braintrust/evaluateQuizQuestions";
import { strict as assert } from "assert";
import { assertEnvVars } from "mongodb-rag-core";

runPipeline({
  configConstructor,
  pipeline: async (generate, evaluate, report, config) => {
    const timestamp = Date.now();
    const { BRAINTRUST_API_KEY } = assertEnvVars({ BRAINTRUST_API_KEY: "" });
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
        evalReports[model.label] = {
          ...reported.data,
          generatedDataRunId: genRunId.toString(),
        };
        // Put the evaluations in Braintrust
        const generatedData =
          await config.generatedDataStore.findByCommandRunId(genRunId);
        assert(generatedData, "Must be generated data");
        await evaluateQuizQuestions({
          generatedData,
          projectName: "university-quiz-benchmark",
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
