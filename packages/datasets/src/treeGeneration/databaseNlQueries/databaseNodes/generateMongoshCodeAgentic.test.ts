import { ObjectId } from "mongodb-rag-core/mongodb";
import {
  DatabaseUserNode,
  DatabaseInfoNode,
  DatabaseUseCaseSchema,
} from "./nodeTypes";
import {
  sampleMovieDbInfo,
  sampleDatabaseUsers,
  sampleUseCases,
  sampleNlQueries,
  makeSampleLlmOptions,
} from "./sampleData";
import PromisePool from "@supercharge/promise-pool";
import { strict as assert } from "assert";
import { generateMongoshCode } from "./generateMongoshCodeAgentic";
import yaml from "yaml";
import path from "path";
import fs from "fs";
import { assertEnvVars, BRAINTRUST_ENV_VARS } from "mongodb-rag-core";
import { DATABASE_NL_QUERIES } from "../../../EnvVars";
import { createOpenAI } from "@ai-sdk/openai";

// Skipping LLM call tests
describe("generateMqlCode", () => {
  jest.setTimeout(300000); // Increase timeout for OpenAI API calls

  const {
    BRAINTRUST_API_KEY,
    BRAINTRUST_ENDPOINT,
    MONGODB_TEXT_TO_CODE_CONNECTION_URI,
  } = assertEnvVars({
    ...DATABASE_NL_QUERIES,
    ...BRAINTRUST_ENV_VARS,
  });
  const openai = createOpenAI({
    apiKey: BRAINTRUST_API_KEY,
    baseURL: BRAINTRUST_ENDPOINT,
  });
  const llmOptions = makeSampleLlmOptions();
  const dbName = "sample_mflix";

  it("should generate MQL code for a NL query", async () => {
    // Create a parent node with the database info
    const databaseInfoNode: DatabaseInfoNode = {
      _id: new ObjectId(),
      parent: null,
      data: sampleMovieDbInfo,
      updated: new Date(),
    };

    // Get a sample user and their use cases
    const sampleUser = sampleDatabaseUsers[0]; // Alice Chen
    const userUseCases = sampleUseCases[sampleUser.name];

    // Create a user node with the parent reference
    const userNode: DatabaseUserNode = {
      _id: new ObjectId(),
      parent: databaseInfoNode,
      data: sampleUser,
      updated: new Date(),
    };

    const useCaseNodes = userUseCases.map((useCase) => ({
      _id: new ObjectId(),
      parent: userNode,
      data: DatabaseUseCaseSchema.parse(useCase),
      updated: new Date(),
    }));

    const nlQueryNodes = Object.entries(sampleNlQueries["Alice Chen"]).flatMap(
      ([useCaseTitle, nlQueries]) =>
        nlQueries.map((nlQuery) => ({
          _id: new ObjectId(),
          parent: useCaseNodes.find(
            (useCase) => useCase.data.title === useCaseTitle
          )!,
          data: nlQuery,
          updated: new Date(),
        }))
    );

    assert(
      nlQueryNodes.length ===
        Object.entries(sampleNlQueries["Alice Chen"]).reduce(
          (sum, [_, queries]) => sum + queries.length,
          0
        )
    );
    console.log("Generating", nlQueryNodes.length, "MQL queries");

    const { results, errors } = await PromisePool.for(nlQueryNodes)
      .handleError((err) => {
        console.error(err);
      })
      .process(async (nlQueryNode) => {
        const mqlCode = await generateMongoshCode({
          dbInfo: {
            name: dbName,
            uri: MONGODB_TEXT_TO_CODE_CONNECTION_URI,
          },
          llmOptions,
          nlQueryNode,
          openai,
        });

        console.log("GeneratedMqlCode", mqlCode);
        return mqlCode;
      });
    // Check for any errors during processing
    expect(errors).toHaveLength(0);

    const pathOut = path.resolve(__dirname, "generatedMqlCode.yaml");
    fs.writeFileSync(
      pathOut,
      yaml.stringify(
        results.flat().map((query) => ({
          nlQuery: query.parent.data.query,
          ...query.data,
        }))
      )
    );
    console.log("Saved to", pathOut);
  });
});
