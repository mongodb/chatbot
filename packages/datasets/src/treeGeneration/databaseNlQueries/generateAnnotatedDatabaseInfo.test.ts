import "dotenv/config";
import yaml from "yaml";
import path from "path";
import fs from "fs";
import { generateAnnotatedDatabaseInfo } from "./generateAnnotatedDatabaseInfo";
import { MongoClient } from "mongodb-rag-core/mongodb";
import { OpenAI } from "mongodb-rag-core/openai";
import { assertEnvVars } from "mongodb-rag-core";
import { DATABASE_NL_QUERIES } from "../../EnvVars";
import { BRAINTRUST_ENV_VARS } from "mongodb-rag-core";
import { prettyPrintMongoDbDocument } from "./databaseMetadata/prettyPrintMongoDbDocument";

describe("generateAnnotatedDatabaseInfo", () => {
  jest.setTimeout(3000000); // Increase timeout for OpenAI API calls

  const {
    MONGODB_TEXT_TO_CODE_CONNECTION_URI,
    BRAINTRUST_API_KEY,
    BRAINTRUST_ENDPOINT,
  } = assertEnvVars({
    ...DATABASE_NL_QUERIES,
    ...BRAINTRUST_ENV_VARS,
  });
  const mongoClient = new MongoClient(MONGODB_TEXT_TO_CODE_CONNECTION_URI);
  beforeAll(async () => {
    await mongoClient.connect();
  });
  afterAll(async () => {
    await mongoClient.close();
  });

  it("should generate annotated DB info", async () => {
    const dbInfo = await generateAnnotatedDatabaseInfo({
      mongoDb: {
        mongoClient,
        databaseName: "sample_mflix",
        numSamplesPerCollection: 2,
      },
      llm: {
        model: "gpt-4o-mini",
        openAiClient: new OpenAI({
          baseURL: BRAINTRUST_ENDPOINT,
          apiKey: BRAINTRUST_API_KEY,
        }),
        temperature: 0,
        max_completion_tokens: 2000,
      },
    });
    const pathOut = path.resolve(__dirname, "annotatedDbSchema.yaml");
    fs.writeFileSync(
      pathOut,
      yaml.stringify(JSON.parse(prettyPrintMongoDbDocument(dbInfo.data)))
    );
    console.log("Saved to", pathOut);
  });
});
