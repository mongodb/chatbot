import { CommandModule } from "yargs";
import { promises as fs } from "fs";
import { MongoClient } from "mongodb-rag-core/mongodb";
import {
  assertEnvVars,
  makeOpenAiEmbedder,
  CORE_CHATBOT_APP_ENV_VARS,
  CORE_OPENAI_ENV_VARS,
} from "mongodb-rag-core";
import { AzureOpenAI } from "mongodb-rag-core/openai";
import { parseVerifiedAnswerYaml } from "../parseVerifiedAnswersYaml";
import { importVerifiedAnswers } from "../importVerifiedAnswers";

import "dotenv/config";

const commandModule: CommandModule<
  Record<string, unknown>,
  ImportCommandArgs
> = {
  command: "import <path>",
  builder(args) {
    return args.positional("path", {
      description: "Path to the configuration yaml file.",
      demandOption: true,
      type: "string",
    });
  },
  handler(args) {
    return doImportCommand(args);
  },
  describe: "Import verified answers from a yaml file",
};

export default commandModule;

export type ImportCommandArgs = { path: string };

export const doImportCommand = async ({ path }: ImportCommandArgs) => {
  const {
    MONGODB_DATABASE_NAME,
    MONGODB_CONNECTION_URI,
    OPENAI_EMBEDDING_MODEL_NAME: embeddingModelName,
    OPENAI_EMBEDDING_MODEL_VERSION: embeddingModelVersion,
    OPENAI_VERIFIED_ANSWER_EMBEDDING_DEPLOYMENT: deployment,
    OPENAI_ENDPOINT,
    OPENAI_API_KEY,
    OPENAI_API_VERSION,
  } = assertEnvVars({
    ...CORE_CHATBOT_APP_ENV_VARS,
    ...CORE_OPENAI_ENV_VARS,
    OPENAI_EMBEDDING_MODEL_NAME: "",
    OPENAI_EMBEDDING_MODEL_VERSION: "",
  });
  const yaml = await fs.readFile(path, "utf-8");
  const verifiedAnswerSpecs = parseVerifiedAnswerYaml(yaml);
  const openAiClient = new AzureOpenAI({
    apiKey: OPENAI_API_KEY,
    endpoint: OPENAI_ENDPOINT,
    apiVersion: OPENAI_API_VERSION,
  });
  const embedder = makeOpenAiEmbedder({
    deployment,
    openAiClient,
  });
  const client = await MongoClient.connect(MONGODB_CONNECTION_URI);
  try {
    const db = client.db(MONGODB_DATABASE_NAME);
    const result = await importVerifiedAnswers({
      embedder,
      db,
      verifiedAnswerSpecs,
      embeddingModelName,
      embeddingModelVersion,
      verifiedAnswersCollectionName: "verified_answers",
    });
    console.log(result);
  } finally {
    await client.close();
  }
};
