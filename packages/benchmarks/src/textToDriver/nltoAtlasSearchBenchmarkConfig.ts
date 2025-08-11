import { assertEnvVars } from "mongodb-rag-core";
import { BenchmarkConfig } from "../cli/BenchmarkConfig";
import {
  TextToDriverExpected,
  TextToDriverInput,
  TextToDriverMetadata,
  TextToDriverOutput,
} from "./TextToDriverEval";
import { BraintrustMiddleware } from "mongodb-rag-core/braintrust";
import { createOpenAI, wrapLanguageModel } from "mongodb-rag-core/aiSdk";
import { makeGenerateAtlasSearchCodeAgenticTask } from "./generateDriverCode/generateAtlasSearchCodeAgentic";
import { atlasSearchPrompt } from "./generateDriverCode/languagePrompts/atlasSearch";
import { MongoClient, ObjectId } from "mongodb-rag-core/mongodb";
import { SuccessfulExecution } from "./scorers/evaluationMetrics";
import {
  makeNdcgAtK,
  NonEmptyArrayOutput,
  SearchOperatorUsed,
} from "./scorers/atlasSearch";
import { MatchFunc } from "mongodb-rag-core/eval";

export const NL_TO_MONGOSH_PROJECT_NAME = "natural-language-to-atlas-search";

const NL_TO_MONGOSH_DATASET_NAME = "TODO: add";

let mongoClient: MongoClient;
let httpMcpServerConnectionUrl: URL;

interface MatchableDocument {
  _id: string | ObjectId | number;
}
const ndcgMatchFunc: MatchFunc<MatchableDocument> = (
  a: MatchableDocument,
  b: MatchableDocument
) => {
  // Can't just use === for ObjectId because it's a class
  if (ObjectId.isValid(a._id) && ObjectId.isValid(b._id)) {
    return a._id.toString() === b._id.toString();
  }
  // Otherwise, it's a number or string, and we can use ===
  if (a._id === b._id) {
    return true;
  }
  return false;
};

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
  scorers: {
    successful_execution: {
      description: "Successful execution of the generated code",
      scorerFunc: SuccessfulExecution,
    },
    non_empty_array_output: {
      description: "Non-empty array output",
      scorerFunc: NonEmptyArrayOutput,
    },
    search_operator_used: {
      description:
        "Search operator ($search or $knnBeta) used in the generated code",
      scorerFunc: SearchOperatorUsed,
    },
    ndcg_at_10: {
      description: "NDCG@10 score",
      scorerFunc: makeNdcgAtK({ k: 10, matchFunc: ndcgMatchFunc }),
    },
  },
  description: "Natural language to Atlas Search code generation",
};
