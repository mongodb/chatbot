import "dotenv/config";
import {
  CORE_ENV_VARS,
  assertEnvVars,
  AzureOpenAiServiceConfig,
} from "chat-core";
import {
  appendMetadataToPreprocessorResponse,
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
    content: "system_prompt",
    role: "system",
  },
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
    numRetries: 0,
    retryDelayMs: 5000,
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
    expect(outputQuery.toLowerCase()).toContain("aggregation");
    expect(outputQuery).toContain("?");
    expect(programmingLanguages).toStrictEqual(["shell"]);
    expect(mongoDbProducts[0]).toBeDefined();
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
    expect(mongoDbProducts[0]).toBe("Atlas Charts");
  });
  test("should be aware of MongoDB", async () => {
    const query = "node.js lookup example";
    const messages: QueryPreprocessorMessage[] = [];
    const response = await preprocessMongoDbUserQuery({
      query,
      messages,
    });
    expect(response.query).toContain("MongoDB");
    expect(response.query).toContain("look");
    expect(response.query).toContain("up");
    expect(response.query).toContain("Node");
    expect(response.programmingLanguages[0]).toBe("javascript");
  });
  test("should respond 'DO_NOT_ANSWER' if the query is gibberish", async () => {
    const query = "asdf dasgsd";
    const messages: QueryPreprocessorMessage[] = [];
    const response = await preprocessMongoDbUserQuery({
      query,
      messages,
    });
    expect(response.query).toContain("DO_NOT_ANSWER");
  });
  test("should respond 'DO_NOT_ANSWER' if the query is negative toward MongoDB", async () => {
    const query = "why is MongoDB the worst database";
    const messages: QueryPreprocessorMessage[] = [];
    const response = await preprocessMongoDbUserQuery({
      query,
      messages,
    });
    expect(response.query).toContain("DO_NOT_ANSWER");
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
  test("should remove the system prompt", () => {
    const prompt = generateMongoDbQueryPreProcessorPrompt({
      query,
      messages: messages,
    });
    expect(prompt).not.toContain("SYSTEM:");
  });
  test("should expand one word queries", () => {
    const query = "oneWord";
    const messages: QueryPreprocessorMessage[] = [];
    const prompt = generateMongoDbQueryPreProcessorPrompt({ query, messages });
    expect(prompt).toContain("oneWord for MongoDB");
  });
  test("should not expand queries with multiple words", () => {
    const query = "multiple words";
    const messages: QueryPreprocessorMessage[] = [];
    const prompt = generateMongoDbQueryPreProcessorPrompt({ query, messages });
    expect(prompt).not.toContain("multiple words for MongoDB");
  });
  test("should not expand queries word 'mongodb'", () => {
    const messages: QueryPreprocessorMessage[] = [];
    expect(
      generateMongoDbQueryPreProcessorPrompt({
        query: "MongoDB",
        messages,
      })
    ).not.toContain("MongoDB for MongoDB");
    expect(
      generateMongoDbQueryPreProcessorPrompt({
        query: "mongodb",
        messages,
      })
    ).not.toContain("mongodb for MongoDB");
    expect(
      generateMongoDbQueryPreProcessorPrompt({
        query: "mongoDb",
        messages,
      })
    ).not.toContain("mongoDb for MongoDB");
  });
});
describe("appendMetadataToPreprocessorResponse()", () => {
  test("should append metadata to the query", () => {
    const response = {
      query: "foo",
      programmingLanguages: ["javascript"],
      mongoDbProducts: ["charts"],
      abort: false,
    };
    const output = appendMetadataToPreprocessorResponse(response);
    const expected = `---
programmingLanguages:
  - javascript
mongoDbProducts:
  - charts
---

foo`;
    expect(output.query).toBe(expected);
  });
});
