import { models } from "../models";
import {
  assertEnvVars,
  CORE_OPENAI_CONNECTION_ENV_VARS,
} from "mongodb-rag-core";

import { BRAINTRUST_ENV_VARS, RADIANT_ENV_VARS } from "../envVars";
import { wrapOpenAI } from "braintrust";
import PromisePool from "@supercharge/promise-pool";
import { makeOpenAiClientFactory } from "../makeOpenAiClientFactory";
import { runDiscoveryEval } from "./DiscoveryEval";
import { getConversationsTestCasesFromYaml } from "../getConversationsTestCasesFromYaml";
import fs from "fs";
async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
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
  } = assertEnvVars({
    ...RADIANT_ENV_VARS,
    ...BRAINTRUST_ENV_VARS,
    ...CORE_OPENAI_CONNECTION_ENV_VARS,
  });

  const DEFAULT_MAX_CONCURRENCY = 3;
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
  });

  const { RUN_ID } = process.env;

  const temperatures = [0.0, 0.5, 1.0];
  const maxTokensOut = [100, 500, 1000];
  const numTrials = 5;

  await sleep(500);
  const modelExperiments = models

    .filter((m) => m.authorized === true)
    // // NOTE: ignoring Google models for now b/c of issues with Radiant
    .filter((m) => m.developer !== "Google")
    .map((modelInfo) => {
      const modelExperiments = [];
      for (const temperature of temperatures) {
        for (const maxTokens of maxTokensOut) {
          modelExperiments.push({
            modelInfo,
            temperature,
            maxTokens,
          });
        }
      }
      return modelExperiments;
    });
  // Process models in parallel
  await PromisePool.for(modelExperiments)
    .withConcurrency(3)
    .process(async (modelInfos) => {
      await PromisePool.for(modelInfos)
        .withConcurrency(1)
        .process(async ({ modelInfo, temperature, maxTokens }) => {
          let experimentName = `${modelInfo.label}?temperature=${temperature}&maxTokens=${maxTokens}`;
          if (RUN_ID) {
            experimentName += `&runId=${RUN_ID}`;
          }
          console.log(`Running experiment: ${experimentName}`);
          try {
            await runDiscoveryEval({
              model: modelInfo.deployment,
              matchRegExp: /mongodb/i,
              openaiClient: wrapOpenAI(
                openAiClientFactory.makeOpenAiClient(modelInfo)
              ),
              experimentName,
              additionalMetadata: {
                ...modelInfo,
              },
              llmOptions: {
                temperature,
                max_tokens: maxTokens,
              },
              maxConcurrency:
                modelInfo.maxConcurrency ?? DEFAULT_MAX_CONCURRENCY,
              iterations: temperature === 0 ? 1 : numTrials,
              // TODO: work on the data loader...
              data: getConversationsTestCasesFromYaml(
                fs.readFileSync("TODO: add")
              ),
            });
          } catch (err) {
            console.error("Error running Braintrust");
            console.error(err);
          }
        });
    });
}
main();
