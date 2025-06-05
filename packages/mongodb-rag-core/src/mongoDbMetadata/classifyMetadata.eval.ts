import "dotenv/config";
import { wrapOpenAI, Eval } from "mongodb-rag-core/braintrust";
import { Scorer } from "autoevals";
import { 
  classifyMongoDbMetadata,
  MongoDbTag,
  classifyMongoDbProduct,
  classifyMongoDbProgrammingLanguage,
  classifyMongoDbTopic
} from "./";
import { assertEnvVars } from "../assertEnvVars"


// need an  AI client to run the classifier
// from evalHelpers
import { AzureOpenAI } from "openai";
export const {
  OPENAI_API_KEY,
  OPENAI_PREPROCESSOR_CHAT_COMPLETION_DEPLOYMENT,
  OPENAI_ENDPOINT,
  OPENAI_API_VERSION,
} = assertEnvVars({
  OPENAI_API_KEY: "",
  OPENAI_PREPROCESSOR_CHAT_COMPLETION_DEPLOYMENT: "",
  OPENAI_ENDPOINT: "",
  OPENAI_API_VERSION: "",
});

export const openAiClient = wrapOpenAI(
  new AzureOpenAI({
    apiKey: OPENAI_API_KEY,
    endpoint: OPENAI_ENDPOINT,
    apiVersion: OPENAI_API_VERSION,
  })
);

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


const model = "";

Eval("BT project name", {
  data: evalCases,
  experimentName: model,
  async task(input) {
    try {
      return await classifyMongoDbMetadata({
        model: openAiClient,
        data: input,
      });
    } catch (error) {
      console.log(`Error evaluating input: ${input}`);
      console.log(error);
      throw error;
    }
  },
  scores: [ProductNameCorrect, ProgrammingLanguageCorrect, TopicCorrect],
});