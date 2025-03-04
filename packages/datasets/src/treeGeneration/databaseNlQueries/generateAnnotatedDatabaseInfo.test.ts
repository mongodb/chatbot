import "dotenv/config";
import yaml from "yaml";
import path from "path";
import fs from "fs";
import { generateAnnotatedDatabaseMetadata } from "./generateAnnotatedDatabaseInfo";
import { MongoClient } from "mongodb-rag-core/mongodb";
import { OpenAI } from "mongodb-rag-core/openai";
import { assertEnvVars } from "mongodb-rag-core";
import { DATABASE_NL_QUERIES } from "../../EnvVars";

describe("generateAnnotatedDatabaseInfo", () => {
  jest.setTimeout(3000000); // Increase timeout for OpenAI API calls

  const { MONGODB_TEXT_TO_CODE_CONNECTION_URI } =
    assertEnvVars(DATABASE_NL_QUERIES);
  const mongoClient = new MongoClient(MONGODB_TEXT_TO_CODE_CONNECTION_URI);

  it("should generate annotated DB info", async () => {
    const dbInfo = await generateAnnotatedDatabaseMetadata({
      mongoDb: {
        mongoClient,
        databaseName: "sample_mflix",
        numSamplesPerCollection: 2,
      },
      llm: {
        model: "gpt-4o",
        // TODO:...
        openAiClient: new OpenAI(),
        temperature: 0,
        max_completion_tokens: 2000,
      },
    });
    const pathOut = path.resolve(__dirname, "annotatedDbSchema.yaml");
    fs.writeFileSync(pathOut, yaml.stringify(dbInfo.data));
    console.log("Saved to", pathOut);
  });
});
