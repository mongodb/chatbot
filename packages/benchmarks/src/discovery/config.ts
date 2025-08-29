import { BraintrustMiddleware } from "mongodb-rag-core/braintrust";
import { BenchmarkConfig } from "../cli/BenchmarkConfig";
import {
  DiscoveryEvalCaseInput,
  DiscoveryTaskOutput,
  getDiscoveryConversationEvalDataFromYamlFile,
  makeDiscoveryTask,
  makeMatchScorers,
} from "./DiscoveryEval";
import path from "path";
import { createOpenAI, wrapLanguageModel } from "mongodb-rag-core/aiSdk";

export const discoveryBenchmarkConfig: BenchmarkConfig<
  DiscoveryEvalCaseInput,
  DiscoveryTaskOutput,
  void
> = {
  projectName: "discovery-benchmark",
  description:
    "Discovery benchmark checks if MongoDB is mentioned in a response",
  datasets: {
    original: {
      description:
        "Set of questions generated with help of LLM about MongoDB-related areas.",
      getDataset: async () =>
        getDiscoveryConversationEvalDataFromYamlFile(
          path.resolve(__dirname, "..", "..", "datasets", "discovery.yml"),
        ),
    },
  },
  tasks: {
    default: {
      taskFunc: (provider, config) => {
        const model = wrapLanguageModel({
          model: createOpenAI({
            apiKey: provider.apiKey,
            baseURL: provider.baseUrl,
          }).chat(config.deployment),
          middleware: [BraintrustMiddleware({ debug: true })],
        });
        return makeDiscoveryTask({
          model,
          llmOptions: {
            temperature: 0,
          },
          iterations: 1,
        });
      },
    },
  },
  scorers: {
    MentionsMongoDb: {
      scorerFunc: makeMatchScorers(/mongodb/i),
      description:
        "Checks if MongoDB is mentioned in the response using regex.",
    },
  },
};
