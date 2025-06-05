import "dotenv/config";
import { strict as assert } from "assert";
import { Eval } from "../braintrust";
import { Scorer } from "autoevals";
import {
  classifyMongoDbMetadata,
  MongoDbTag,
  classifyMongoDbProduct,
  classifyMongoDbProgrammingLanguage,
  classifyMongoDbTopic,
} from "./";
// import { assertEnvVars } from "../assertEnvVars";
import { createOpenAI } from "@ai-sdk/openai";
import { getOpenAiEndpointAndApiKey, models } from "../models";

// export const {
//   OPENAI_API_KEY,
//   OPENAI_PREPROCESSOR_CHAT_COMPLETION_DEPLOYMENT,
//   OPENAI_ENDPOINT,
//   OPENAI_API_VERSION,
// } = assertEnvVars({
//   OPENAI_API_KEY: "",
//   OPENAI_PREPROCESSOR_CHAT_COMPLETION_DEPLOYMENT: "",
//   OPENAI_ENDPOINT: "",
//   OPENAI_API_VERSION: "",
// });

async function main() {
  // need an  AI client to run the classifier.
  // ok so this gets the models from the list we define
  // and we want to get the gpt4.1 one
  // this is where we'd test with different models if interested
  const modelLabel = "gpt-4.1";
  const modelConfig = models.find((m) => m.label === modelLabel);
  assert(modelConfig, `Model ${modelLabel} not found`);

  const openai = createOpenAI({
    ...(await getOpenAiEndpointAndApiKey(modelConfig)),
  });

  interface ClassifyMongoDbMetadataEvalCase {
    name: string;
    input: string;
    expected: {
      product: Awaited<ReturnType<typeof classifyMongoDbProduct>>;
      programmingLanguage: Awaited<ReturnType<typeof classifyMongoDbProgrammingLanguage>>;
      topic: Awaited<ReturnType<typeof classifyMongoDbTopic>>;
    };
    tags?: MongoDbTag[];
  }

  const evalCases: ClassifyMongoDbMetadataEvalCase[] = [
    {
      name: "should identify MongoDB Atlas Search",
      input: "Does atlas search support copy to fields",
      expected: {
        product: "atlas_search",
        programmingLanguage: null,
        topic: null,
      },
      tags: ["atlas", "atlas_search"],
    },
  ];

  const ProductNameCorrect: Scorer<
    Awaited<ReturnType<typeof classifyMongoDbMetadata>>,
    unknown
  > = (args) => {
    return {
      name: "ProductNameCorrect",
      score: args.expected?.product === args.output.product ? 1 : 0,
    };
  };

  const ProgrammingLanguageCorrect: Scorer<
    Awaited<ReturnType<typeof classifyMongoDbMetadata>>,
    unknown
  > = (args) => {
    return {
      name: "ProgrammingLanguageCorrect",
      score:
        args.expected?.programmingLanguage === args.output.programmingLanguage
          ? 1
          : 0,
    };
  };

  const TopicCorrect: Scorer<Awaited<ReturnType<typeof classifyMongoDbMetadata>>, unknown> = (args) => {
    return {
      name: "TopicCorrect",
      score: args.expected?.topic === args.output.topic ? 1 : 0,
    };
  };


  Eval("classify-mongodb-metadata", {
    data: evalCases,
    experimentName: modelLabel,
    metadata: {
      description:
        "Evaluates whether the MongoDB metadata classifier is working correctly",
      model: modelLabel,
    },
    maxConcurrency: 15,
    timeout: 20000,
    async task(input) {
      try {
        return await classifyMongoDbMetadata(
          openai.languageModel(modelLabel),
          input
        );
      } catch (error) {
        console.log(`Error evaluating input: ${input}`);
        console.log(error);
        throw error;
      }
    },
    scores: [ProductNameCorrect, ProgrammingLanguageCorrect, TopicCorrect],
  });
}

main();
