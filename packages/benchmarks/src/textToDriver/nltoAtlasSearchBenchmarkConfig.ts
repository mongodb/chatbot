import { assertEnvVars } from "mongodb-rag-core";
import { BenchmarkConfig } from "../cli/BenchmarkConfig";
import {
  TextToDriverExpected,
  TextToDriverInput,
  TextToDriverMetadata,
  TextToDriverOutput,
} from "./TextToDriverEval";
import { BraintrustMiddleware } from "mongodb-rag-core/braintrust";
import {
  createOpenAI,
  experimental_createMCPClient,
  wrapLanguageModel,
} from "mongodb-rag-core/aiSdk";
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
import { BRAINTRUST_ENV_VARS } from "./TextToDriverEnvVars";
import { loadTextToDriverBraintrustEvalCases } from "./loadBraintrustDatasets";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

export const NL_TO_ATLAS_SEARCH_PROJECT_NAME =
  "natural-language-to-atlas-search";

// TODO: will update this later once we have final dataset
const NL_TO_ATLAS_SEARCH_DATASET_NAME = "atlas-search-dataset-claude-sonnet-4";

let mongoClient: MongoClient;
let mcpClient: Awaited<ReturnType<typeof experimental_createMCPClient>>;

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
  projectName: NL_TO_ATLAS_SEARCH_PROJECT_NAME,
  datasets: {
    simple_english_wikipedia: {
      description:
        "Synthetically generated NL2AtlasSearch queries over the Simple English Wikpedia dataset",
      async getDataset() {
        const { BRAINTRUST_API_KEY } = assertEnvVars(BRAINTRUST_ENV_VARS);
        return (
          (
            await loadTextToDriverBraintrustEvalCases({
              apiKey: BRAINTRUST_API_KEY,
              projectName: NL_TO_ATLAS_SEARCH_PROJECT_NAME,
              datasetName: NL_TO_ATLAS_SEARCH_DATASET_NAME,
            })
          )
            // small set for testing...
            .slice(0, 10)
        );
      },
    },
  },
  environment: {
    beforeAll: async () => {
      const { MONGODB_TEXT_TO_DRIVER_CONNECTION_URI } = assertEnvVars({
        MONGODB_TEXT_TO_DRIVER_CONNECTION_URI: "",
      });
      mcpClient = await experimental_createMCPClient({
        transport: new StdioClientTransport({
          command: "npx",
          args: [
            "-y",
            "mongodb-mcp-server@latest",
            "--connectionString",
            MONGODB_TEXT_TO_DRIVER_CONNECTION_URI,
          ],
        }),
        name: "mongodb-mcp-server",
      });
      mongoClient = new MongoClient(MONGODB_TEXT_TO_DRIVER_CONNECTION_URI);
      await mongoClient.connect();
    },
    afterAll: async () => {
      await mongoClient.close();
      console.log("Closed MongoDB client");
      await mcpClient.close();
      console.log("Closed MCP client");
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
            }).chat(modelConfig.deployment),
            middleware: [BraintrustMiddleware({ debug: true })],
          }),
          systemPrompt: atlasSearchPrompt,
          mongoClient,
          mongoDbMcpClient: mcpClient,
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
