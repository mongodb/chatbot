import { docs100Config } from "../docs100/config";
import { techSupportConfig } from "../techSupport/config";
import { productKnowledgeConfig } from "../productKnowledge/config";
import { marketingConfig } from "../marketing/config";
import { topQuestionsConfig } from "./config";
import { BRAINTRUST_ENV_VARS, assertEnvVars } from "mongodb-rag-core";
import {
  initDataset,
  uploadDatasetToBraintrust,
} from "mongodb-rag-core/braintrust";
import { NlPromptResponseEvalCase } from "../../NlQuestionAnswerEval";

async function main() {
  const { BRAINTRUST_API_KEY } = assertEnvVars({
    ...BRAINTRUST_ENV_VARS,
  });

  // Load all datasets
  const sourceDataset = [
    docs100Config,
    techSupportConfig,
    productKnowledgeConfig,
    marketingConfig,
  ];

  const datasetOut: NlPromptResponseEvalCase[] = [];
  for (const dataset of sourceDataset) {
    const btDataset = initDataset({
      apiKey: BRAINTRUST_API_KEY,
      dataset: dataset.datasets[0].datasetName,
      project: dataset.datasets[0].projectName,
    });
    const data = await btDataset.fetchedData();

    datasetOut.push(...data);
  }

  // Filter out non-top 100 tech support questions
  const filteredDatasetOut = datasetOut
    .filter((de) => {
      // Only return top 100 tech support questions
      if (de.tags.includes("tech_support")) {
        if (de.tags.includes("ts_top_100")) {
          return true;
        }
        return false;
      }
      // Otherwise return all
      return true;
    })
    // Add verified_response tag
    .map((de) => {
      return {
        ...de,
        tags: [...de.tags, "verified_response"],
      };
    });

  // Load data into new dataset
  const res = await uploadDatasetToBraintrust({
    apiKey: BRAINTRUST_API_KEY,
    datasetName: topQuestionsConfig.datasets[0].datasetName,
    projectName: topQuestionsConfig.datasets[0].projectName,
    description:
      "Top question dataset. Created by Marketing, Docs, Technical Services, and Product teams. Spring 2025.",
    dataset: filteredDatasetOut,
  });
  console.log(res);
}
main();
