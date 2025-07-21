import { wrapOpenAI } from "mongodb-rag-core/braintrust";
import { BenchmarkConfig } from "../cli/BenchmarkConfig";
import {
  DiscoveryEvalCaseInput,
  DiscoveryTaskOutput,
  getDiscoveryConversationEvalDataFromYamlFile,
  makeDiscoveryTask,
  makeMatchScorers,
} from "./DiscoveryEval";
import { OpenAI } from "mongodb-rag-core/openai";
import path from "path";

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
          path.resolve(__dirname, "..", "..", "datasets", "discovery.yml")
        ),
    },
  },
  tasks: {
    default: {
      taskFunc: (provider, deployment) => {
        const openAiClient = wrapOpenAI(
          new OpenAI({
            baseURL: provider.baseUrl,
            apiKey: provider.apiKey,
          })
        );
        return makeDiscoveryTask({
          openaiClient: openAiClient,
          model: deployment,
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
