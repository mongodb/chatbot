import "dotenv/config";
import { CORE_ENV_VARS, assertEnvVars } from "chat-core";
import {
  AzureOpenAiServiceConfig,
  generateMongoDbQueryPreProcessorPrompt,
  makePreprocessMongoDbUserQuery,
} from "./makePreprocessMongoDbUserQuery";
import { stripIndent } from "common-tags";
import { QueryPreprocessorMessage } from "./QueryPreprocessorFunc";

const {
  OPENAI_ENDPOINT,
  OPENAI_API_KEY,
  OPENAI_CHAT_COMPLETION_DEPLOYMENT,
  OPENAI_CHAT_COMPLETION_MODEL_VERSION,
} = assertEnvVars(CORE_ENV_VARS);

const azureOpenAiServiceConfig: AzureOpenAiServiceConfig = {
  apiKey: OPENAI_API_KEY,
  baseUrl: OPENAI_ENDPOINT,
  deployment: OPENAI_CHAT_COMPLETION_DEPLOYMENT,
  version: OPENAI_CHAT_COMPLETION_MODEL_VERSION,
};

const messages = [
  {
    content: "aggregation",
    role: "user",
  },
  {
    content:
      "The MongoDB aggregation framework is a powerful set of tools that allows for analytics to be done on a cluster of servers without having to move the data to another platform. Aggregation operations process data in MongoDB collections based on specifications in the aggregation pipeline. The pipeline consists of one or more stages, each performing an operation based on its expression operators. After the driver executes the aggregation pipeline, it returns an aggregated result. The aggregation pipeline is a framework for data aggregation modeled on the concept of data processing pipelines. Documents enter a multi-stage pipeline that transforms the documents into aggregated results. The aggregation framework has grown since its introduction in MongoDB version 2.2 to cover over 35 different stages and over 130 different operators.",
    role: "assistant",
  },
];
const query = "code example";

jest.setTimeout(30000);

describe("makePreprocessMongoDbUserQuery()", () => {
  const preprocessMongoDbUserQuery = makePreprocessMongoDbUserQuery({
    azureOpenAiServiceConfig,
  });
  test("should convert user message into something that's more conversationally relevant", async () => {
    const response = await preprocessMongoDbUserQuery({
      query,
      messages,
    });
    const {
      query: outputQuery,
      programmingLanguages,
      mongoDbProducts,
    } = response;
    expect(outputQuery).toContain("MongoDB");
    expect(outputQuery).toContain("code example");
    expect(outputQuery).toContain("aggregation");
    expect(outputQuery).toContain("?");
    expect(programmingLanguages).toHaveLength(0);
    expect(mongoDbProducts[0]).toBe("driver");
  });
  test("should ID programming languages", async () => {
    const query = "python aggregation";
    const messages: QueryPreprocessorMessage[] = [];
    const response = await preprocessMongoDbUserQuery({
      query,
      messages,
    });
    const { programmingLanguages } = response;
    expect(programmingLanguages[0]).toBe("python");
  });
  test("should ID products", async () => {
    const query = "create a chart";
    const messages: QueryPreprocessorMessage[] = [];
    const response = await preprocessMongoDbUserQuery({
      query,
      messages,
    });
    const { mongoDbProducts } = response;
    expect(mongoDbProducts[0]).toBe("charts");
  });
  test("should be aware of MongoDB", async () => {
    const query = "ruby lookup example";
    const messages: QueryPreprocessorMessage[] = [];
    const response = await preprocessMongoDbUserQuery({
      query,
      messages,
    });
    expect(response.query).toContain("MongoDB");
    expect(response.query).toContain("lookup");
    expect(response.query).toContain("Ruby");
    expect(response.programmingLanguages[0]).toBe("ruby");
  });
});

describe("generateMongoDbQueryPreProcessorPrompt()", () => {
  test("should return a correctly formatted prompt", () => {
    const prompt = generateMongoDbQueryPreProcessorPrompt({ query, messages });
    const expected = stripIndent`Given a conversation (between USER and ASSISTANT) and a follow up message from USER, rewrite the message to be a standalone question that captures all relevant context from the conversation.

<Conversation History>
USER:
aggregation

ASSISTANT:
The MongoDB aggregation framework is a powerful set of tools that allows for analytics to be done on a cluster of servers without having to move the data to another platform. Aggregation operations process data in MongoDB collections based on specifications in the aggregation pipeline. The pipeline consists of one or more stages, each performing an operation based on its expression operators. After the driver executes the aggregation pipeline, it returns an aggregated result. The aggregation pipeline is a framework for data aggregation modeled on the concept of data processing pipelines. Documents enter a multi-stage pipeline that transforms the documents into aggregated results. The aggregation framework has grown since its introduction in MongoDB version 2.2 to cover over 35 different stages and over 130 different operators.


<USER Follow Up Message>
code example

<Standalone question>`;
    expect(prompt).toBe(expected);
  });
});
