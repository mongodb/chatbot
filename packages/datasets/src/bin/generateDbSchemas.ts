import "dotenv/config";
import yaml from "yaml";
import path from "path";
import fs from "fs";
import { MongoClient } from "mongodb-rag-core/mongodb";
import { OpenAI } from "mongodb-rag-core/openai";
import { assertEnvVars } from "mongodb-rag-core";
import { BRAINTRUST_ENV_VARS } from "mongodb-rag-core";
import { DATABASE_NL_QUERIES } from "../EnvVars";
import { prettyPrintMongoDbDocument } from "../treeGeneration/databaseNlQueries/databaseMetadata/prettyPrintMongoDbDocument";
import { generateAnnotatedDatabaseInfo } from "../treeGeneration/databaseNlQueries/generateAnnotatedDatabaseInfo";
import { datasetDatabases } from "../treeGeneration/databaseNlQueries/datasetDatabases";

const dataOutDir = path.resolve(__dirname, "..", "..", "dataOut");

// Validate that dataOutDir exists. Create if it doesn't
if (!fs.existsSync(dataOutDir)) {
  fs.mkdirSync(dataOutDir, { recursive: true });
  console.log(`Created directory: ${dataOutDir}`);
}

const {
  MONGODB_TEXT_TO_CODE_CONNECTION_URI,
  BRAINTRUST_API_KEY,
  BRAINTRUST_ENDPOINT,
} = assertEnvVars({
  ...DATABASE_NL_QUERIES,
  ...BRAINTRUST_ENV_VARS,
});

async function generateDbSchema(mongoClient: MongoClient, dbName: string) {
  const model = "gpt-4o";
  const pathOut = path.resolve(
    __dirname,
    "annotatedDbSchema" + "_" + dbName + "_" + model + ".yaml"
  );
  const dbInfo = await generateAnnotatedDatabaseInfo({
    mongoDb: {
      mongoClient,
      databaseName: dbName,
      numSamplesPerCollection: 2,
    },
    llm: {
      model,
      openAiClient: new OpenAI({
        baseURL: BRAINTRUST_ENDPOINT,
        apiKey: BRAINTRUST_API_KEY,
      }),
      temperature: 0,
      max_completion_tokens: 2000,
    },
  });

  fs.writeFileSync(
    pathOut,
    yaml.stringify(JSON.parse(prettyPrintMongoDbDocument(dbInfo.data)))
  );
}

async function main() {
  const mongoClient = new MongoClient(MONGODB_TEXT_TO_CODE_CONNECTION_URI);
  try {
    await mongoClient.connect();
    for (const databaseName of datasetDatabases) {
      await generateDbSchema(mongoClient, databaseName);
    }
  } finally {
    await mongoClient.close();
  }
}
main();
