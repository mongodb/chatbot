import { models } from "../models";
import {
  assertEnvVars,
  CORE_OPENAI_CONNECTION_ENV_VARS,
} from "mongodb-rag-core";
import "dotenv/config";
import {
  AWS_BEDROCK_ENV_VARS,
  BRAINTRUST_ENV_VARS,
  GCP_VERTEX_AI_ENV_VARS,
  RADIANT_ENV_VARS,
} from "../envVars";
import PromisePool from "@supercharge/promise-pool";
import { makeOpenAiClientFactory } from "../makeOpenAiClientFactory";
import { runQuizQuestionEval } from "./QuizQuestionEval";
import { getQuizQuestionEvalCasesFromBraintrust } from "./getQuizQuestionEvalCasesFromBraintrust";
import { mongoDbQuizQuestionExamples } from "./mongoDbQuizQuestionExamples";

async function main() {
  const {
    BRAINTRUST_API_KEY,
    BRAINTRUST_ENDPOINT,
    RADIANT_API_KEY,
    RADIANT_ENDPOINT,
    MONGODB_AUTH_COOKIE,
    OPENAI_API_KEY,
    OPENAI_ENDPOINT,
    OPENAI_API_VERSION,
    AWS_ACCESS_KEY_ID,
    AWS_REGION,
    AWS_SECRET_ACCESS_KEY,
    AWS_SESSION_TOKEN,
    GCP_API_KEY,
    GCP_OPENAI_ENDPOINT,
  } = assertEnvVars({
    ...RADIANT_ENV_VARS,
    ...BRAINTRUST_ENV_VARS,
    ...CORE_OPENAI_CONNECTION_ENV_VARS,
    ...AWS_BEDROCK_ENV_VARS,
    ...GCP_VERTEX_AI_ENV_VARS,
  });

  const DEFAULT_MAX_CONCURRENCY = 15;

  const openAiClientFactory = makeOpenAiClientFactory({
    azure: {
      apiKey: OPENAI_API_KEY,
      apiVersion: OPENAI_API_VERSION,
      endpoint: OPENAI_ENDPOINT,
    },
    radiant: {
      apiKey: RADIANT_API_KEY,
      endpoint: RADIANT_ENDPOINT,
      authCookie: MONGODB_AUTH_COOKIE,
    },
    braintrust: {
      apiKey: BRAINTRUST_API_KEY,
      endpoint: BRAINTRUST_ENDPOINT,
    },
    vertexAi: {
      apiKey: GCP_API_KEY,
      endpoint: GCP_OPENAI_ENDPOINT,
    },
    bedrock: {
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
        sessionToken: AWS_SESSION_TOKEN,
      },
    },
  });

  const { RUN_ID } = process.env;

  const projectName = "university-quiz-benchmark";
  const datasetName = "university-quiz-questions";

  const data = await getQuizQuestionEvalCasesFromBraintrust({
    projectName,
    datasetName,
  });

  const modelExperiments = models.filter((m) => m.authorized === true);

  // Process models in parallel
  await PromisePool.for(modelExperiments)
    .withConcurrency(3)

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
          openaiClient: openAiClientFactory.makeOpenAiClient(modelInfo),
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
