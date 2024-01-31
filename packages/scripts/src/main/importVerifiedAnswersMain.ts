import { MongoClient } from "mongodb";
import { promises as fs } from "fs";
import {
  assertEnvVars,
  CORE_ENV_VARS,
  makeOpenAiEmbedder,
  OpenAIClient,
  AzureKeyCredential,
} from "mongodb-rag-core";
import { parseVerifiedAnswerYaml } from "../verifiedAnswers/parseVerifiedAnswersYaml";
import { importVerifiedAnswers } from "../verifiedAnswers/importVerifiedAnswers";

import "dotenv/config";

const {
  MONGODB_DATABASE_NAME,
  MONGODB_CONNECTION_URI,
  OPENAI_EMBEDDING_MODEL: embeddingModel,
  OPENAI_EMBEDDING_MODEL_VERSION: embeddingModelVersion,
  OPENAI_EMBEDDING_DEPLOYMENT: deployment,
  OPENAI_ENDPOINT,
  OPENAI_API_KEY,
} = assertEnvVars(CORE_ENV_VARS);

async function main() {
  const args = process.argv.slice(-2);
  if (args[1] === "--path") {
    throw new Error("Expected 1 argument to --path flag");
  }

  const path = args[0] === "--path" ? args[1] : "verified-answers.yaml";
  const yaml = await fs.readFile(path, "utf-8");
  const verifiedAnswerSpecs = parseVerifiedAnswerYaml(yaml);
  const openAiClient = new OpenAIClient(
    OPENAI_ENDPOINT,
    new AzureKeyCredential(OPENAI_API_KEY)
  );
  const embedder = makeOpenAiEmbedder({
    deployment,
    openAiClient,
  });
  const client = await MongoClient.connect(MONGODB_CONNECTION_URI);
  try {
    const db = client.db(MONGODB_DATABASE_NAME);
    await importVerifiedAnswers({
      embedder,
      db,
      verifiedAnswerSpecs,
      embeddingModel,
      embeddingModelVersion,
    });
  } finally {
    await client.close();
  }
}

main();
