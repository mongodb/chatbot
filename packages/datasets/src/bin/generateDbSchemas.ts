import "dotenv/config";
import yaml from "yaml";
import path from "path";
import fs from "fs";
import { MongoClient } from "mongodb-rag-core/mongodb";
import { assertEnvVars } from "mongodb-rag-core";
import { DATABASE_NL_QUERIES } from "../EnvVars";
import { generateAnnotatedDatabaseInfoNode } from "../treeGeneration/databaseNlQueries/databaseNodes/generateAnnotatedDatabaseInfo";
import { datasetDatabases } from "../treeGeneration/databaseNlQueries/datasetDatabases";
import { prettyPrintMongoDbDocument } from "mongodb-rag-core/executeCode";
import { makeOpenAiClient } from "../openAi";

const dataOutDir = path.resolve(__dirname, "..", "..", "dataOut");

// Validate that dataOutDir exists. Create if it doesn't
if (!fs.existsSync(dataOutDir)) {
  fs.mkdirSync(dataOutDir, { recursive: true });
  console.log(`Created directory: ${dataOutDir}`);
}

const { MONGODB_TEXT_TO_CODE_CONNECTION_URI } = assertEnvVars({
  ...DATABASE_NL_QUERIES,
});

async function generateDbSchema(mongoClient: MongoClient, dbName: string) {
  const model = "gpt-4o";
  const pathOut = path.resolve(
    __dirname,
    "annotatedDbSchema" + "_" + dbName + "_" + model + ".yaml"
  );
  const dbInfo = await generateAnnotatedDatabaseInfoNode({
    mongoDb: {
      mongoClient,
      databaseName: dbName,
      numSamplesPerCollection: 2,
    },
    llmOptions: {
      model,
      temperature: 0,
      max_completion_tokens: 2000,
    },
    openAiClient: makeOpenAiClient(),
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
    for (const { name: databaseName } of datasetDatabases) {
      await generateDbSchema(mongoClient, databaseName);
    }
  } finally {
    await mongoClient.close();
  }
}
main();
