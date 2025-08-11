import { assertEnvVars, BRAINTRUST_ENV_VARS } from "mongodb-rag-core";
import { BenchmarkConfig } from "../cli/BenchmarkConfig";
import {
  TextToDriverExpected,
  TextToDriverInput,
  TextToDriverMetadata,
  TextToDriverOutput,
} from "./TextToDriverEval";
import { loadTextToDriverBraintrustEvalCases } from "./loadBraintrustDatasets";
import { BraintrustMiddleware } from "mongodb-rag-core/braintrust";
import { createOpenAI, wrapLanguageModel } from "mongodb-rag-core/aiSdk";
import { makeGenerateAtlasSearchCodeAgenticTask } from "./generateDriverCode/generateAtlasSearchCodeAgentic";
import { atlasSearchPrompt } from "./generateDriverCode/languagePrompts/atlasSearch";
import { MongoClient } from "mongodb-rag-core/mongodb";

export const NL_TO_MONGOSH_PROJECT_NAME = "natural-language-to-atlas-search";

const NL_TO_MONGOSH_DATASET_NAME = "TODO: add";

let mongoClient: MongoClient;
let httpMcpServerConnectionUrl: URL;

export const nlToAtlasSearchBenchmarkConfig: BenchmarkConfig<
  TextToDriverInput,
  TextToDriverOutput,
  TextToDriverExpected,
  TextToDriverMetadata
> = {
  projectName: NL_TO_MONGOSH_PROJECT_NAME,
  datasets: {
    simple_english_wikipedia: {
      description:
        "Synthetically generated NL2AtlasSearch queries over the Simple English Wikpedia dataset",
      async getDataset() {
        // TODO: bring back once the dataset is ready
        // const { BRAINTRUST_API_KEY } = assertEnvVars(BRAINTRUST_ENV_VARS);
        // return await loadTextToDriverBraintrustEvalCases({
        //   apiKey: BRAINTRUST_API_KEY,
        //   projectName: NL_TO_MONGOSH_PROJECT_NAME,
        //   datasetName: NL_TO_MONGOSH_DATASET_NAME,
        // });
        return [
          {
            input: {
              databaseName: "wikipedia_dataset",
              // NOTE: This was the cursor autocomplete, which i find funny
              nlQuery: "Retrieve the page titles of articles about Cheryl Cole",
            },
            expected: {
              dbQuery: "",
              result: [],
            },
            metadata: {
              language: "mongodb-mcp",
            },
            tags: ["atlas_search"],
          },
        ];
      },
    },
  },
  environment: {
    beforeAll: async () => {
      /*
      TODO: setup MCP server in before/afterAll
      when the npm package supports this pattern
      In the meantime, we'll have to set it up manually with the command:
      ```
      npx -y mongodb-mcp-server@latest \
      --transport http --httpHost=0.0.0.0 --httpPort=8080
      \ --connectionString <path-to-mongodb-connection-uri>
      ```
      */
      httpMcpServerConnectionUrl = new URL("http://localhost:8080");
      // TODO: add the MCP server connection URL to the env vars
      const { MONGODB_TEXT_TO_DRIVER_CONNECTION_URI } = assertEnvVars({
        MONGODB_TEXT_TO_DRIVER_CONNECTION_URI: "",
      });
      mongoClient = new MongoClient(MONGODB_TEXT_TO_DRIVER_CONNECTION_URI);
      await mongoClient.connect();
    },
    afterAll: async () => {
      await mongoClient.close();
    },
  },
  tasks: {
    agentic: {
      description: "Agentic workflow-based code generation",
      taskFunc: async (provider, modelConfig) => {
        return makeGenerateAtlasSearchCodeAgenticTask({
          model: wrapLanguageModel({
            model: createOpenAI({
              apiKey: provider.apiKey,
              baseURL: provider.baseUrl,
            }).languageModel(modelConfig.deployment),
            middleware: [BraintrustMiddleware({ debug: true })],
          }),
          systemPrompt: atlasSearchPrompt,
          mongoClient,
          httpMcpServerConnectionUrl,
        });
      },
    },
  },
  // TODO: add scorers
  scorers: {},
  description: "Natural language to Atlas Search code generation",
};
