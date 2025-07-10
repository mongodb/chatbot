import { MODELS } from "../benchmarkModels";
import { getOpenAiEndpointAndApiKey } from "mongodb-rag-core/models";
import "dotenv/config";
import PromisePool from "@supercharge/promise-pool";
import { runQuizQuestionEval } from "./QuizQuestionEval";
import { getQuizQuestionEvalCasesFromBraintrust } from "./getQuizQuestionEvalCasesFromBraintrust";
import { mongoDbQuizQuestionExamples } from "./mongoDbQuizQuestionExamples";
import { OpenAI } from "mongodb-rag-core/openai";

async function main() {
  const DEFAULT_MAX_CONCURRENCY = 15;

  const { RUN_ID } = process.env;

  const projectName = "mongodb-multiple-choice";
  const datasetName = "university-quiz-badge-questions";

  const data = await getQuizQuestionEvalCasesFromBraintrust({
    projectName,
    datasetName,
  });

  // Process models in parallel
  await PromisePool.for(MODELS)
    .withConcurrency(MODELS.length)

    .process(async (modelInfo) => {
      let experimentName = modelInfo.label;
      if (RUN_ID) {
        experimentName += `?runId=${RUN_ID}`;
      }
      console.log(`Running experiment: ${experimentName}`);
      try {
        await runQuizQuestionEval({
          projectName,
          model: modelInfo.deployment,
          openaiClient: new OpenAI({
            ...(await getOpenAiEndpointAndApiKey(modelInfo)),
          }),
          experimentName,
          additionalMetadata: {
            ...modelInfo,
          },
          maxConcurrency: modelInfo.maxConcurrency ?? DEFAULT_MAX_CONCURRENCY,
          data,
          promptOptions: {
            subject: "MongoDB",
            quizQuestionExamples: mongoDbQuizQuestionExamples,
          },
        });
      } catch (err) {
        console.error("Error running Braintrust");
        console.error(err);
      }
    });
}
main();
