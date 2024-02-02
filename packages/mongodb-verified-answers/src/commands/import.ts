import { CommandModule } from "yargs";
import { promises as fs } from "fs";
import { MongoClient } from "mongodb";
import {
  assertEnvVars,
  CORE_ENV_VARS,
  makeOpenAiEmbedder,
  OpenAIClient,
  AzureKeyCredential,
} from "mongodb-rag-core";
import { parseVerifiedAnswerYaml } from "../parseVerifiedAnswersYaml";
import { importVerifiedAnswers } from "../importVerifiedAnswers";

import "dotenv/config";

const commandModule: CommandModule<
  Record<string, unknown>,
  ImportCommandArgs
> = {
  command: "pages <path>",
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
  describe: "Update pages data from sources",
};

export default commandModule;

export type ImportCommandArgs = { path: string };

export const doImportCommand = async ({ path }: ImportCommandArgs) => {
  const {
    MONGODB_DATABASE_NAME,
    MONGODB_CONNECTION_URI,
    OPENAI_EMBEDDING_MODEL: embeddingModel,
    OPENAI_EMBEDDING_MODEL_VERSION: embeddingModelVersion,
    OPENAI_EMBEDDING_DEPLOYMENT: deployment,
    OPENAI_ENDPOINT,
    OPENAI_API_KEY,
  } = assertEnvVars(CORE_ENV_VARS);
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
    const result = await importVerifiedAnswers({
      embedder,
      db,
      verifiedAnswerSpecs,
      embeddingModel,
      embeddingModelVersion,
    });
    console.log(result);
  } finally {
    await client.close();
  }
};
