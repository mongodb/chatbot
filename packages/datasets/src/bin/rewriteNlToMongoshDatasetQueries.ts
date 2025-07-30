import { makeRewriteNlQueryPrompt } from "../treeGeneration/databaseNlQueries/rewriteNlQuery/rewriteNlQuery";
import { makeOpenAiProvider } from "../openAi";
import { BraintrustMiddleware } from "mongodb-rag-core/braintrust";
import { models } from "mongodb-rag-core/models";
import { DatabaseNlQueryDatasetEntryBraintrustSchema } from "../treeGeneration/databaseNlQueries/DatabaseNlQueryDatasetEntry";
import yaml from "yaml";
import PromisePool from "@supercharge/promise-pool";
import fs from "fs";
import path from "path";
import { wrapLanguageModel } from "mongodb-rag-core/aiSdk";

async function runRewriteNlQueryToMongoshDataset(config: {
  modelDeployment: (typeof models)[number]["deployment"];
  maxConcurrency: number;
  generationId: string;
  shuffle?: boolean;
  limit?: number;
}) {
  // Note: maybe switch to Opus for the real run
  const modelDeployment = config.modelDeployment;

  const model = wrapLanguageModel({
    model: makeOpenAiProvider()(modelDeployment),
    middleware: [BraintrustMiddleware({ debug: true })],
  });

  const rewriteNlQueryPrompt = makeRewriteNlQueryPrompt(model);

  const dataOutDir = path.join(__dirname, "..", "..", "dataOut");
  // rewriting the latest rewrite
  const datasetInPath = path.join(
    dataOutDir,
    "atlas-sample-dataset-claude-rewritten.v1.json"
  );

  const intermediateDatasetOutPath = path.join(
    dataOutDir,
    `atlas-sample-dataset-claude-rewritten.${config.generationId}.yaml`
  );
  const datasetOutPath = path.join(
    dataOutDir,
    `atlas-sample-dataset-claude-rewritten.${config.generationId}.json`
  );

  let datasetEntries = config.shuffle
    ? shuffle(
        DatabaseNlQueryDatasetEntryBraintrustSchema.array().parse(
          JSON.parse(fs.readFileSync(datasetInPath, "utf-8"))
        )
      )
    : DatabaseNlQueryDatasetEntryBraintrustSchema.array().parse(
        JSON.parse(fs.readFileSync(datasetInPath, "utf-8"))
      );
  if (config.limit) {
    datasetEntries = datasetEntries.slice(0, config.limit);
  }

  console.log("Processing", datasetEntries.length, "dataset entries");
  let start = 1;

  console.log("Writing intermediate results to", intermediateDatasetOutPath);
  const { results } = await PromisePool.for(datasetEntries)
    .withConcurrency(config.maxConcurrency)
    .handleError((error) => {
      console.error(error);
    })
    .process(async (entry) => {
      console.log(`Processing entry ${start++}/${datasetEntries.length}.
Entry NL query: ${entry.input.nlQuery}`);
      const result = await rewriteNlQueryPrompt(entry);
      fs.appendFileSync(
        intermediateDatasetOutPath,
        yaml.stringify([result.datasetEntry])
      );
      return result;
    });

  console.log(results.length, "total result(s)");
  console.log(
    results.filter(
      (result) => result.classification.classification === "ambiguous"
    ).length,
    "ambiguous result(s)"
  );

  console.log("Writing full dataset to", datasetOutPath);
  fs.writeFileSync(
    datasetOutPath,
    JSON.stringify(
      results.map((r) => r.datasetEntry),
      null,
      2
    )
  );
}

function shuffle<T>(items: T[]) {
  return items.sort(() => Math.random() - 0.5);
}

async function main() {
  const config = {
    modelDeployment: "claude-opus-4-20250514",
    maxConcurrency: 15,
    generationId: Date.now().toString(),
    // shuffle: true,
    // limit: 200,
  } satisfies Parameters<typeof runRewriteNlQueryToMongoshDataset>[0];
  await runRewriteNlQueryToMongoshDataset(config);
}

main();
