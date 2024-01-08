import "dotenv/config";
import {
  CORE_ENV_VARS,
  assertEnvVars,
  ObjectId,
  Message,
  OpenAIClient,
  AzureKeyCredential,
} from "mongodb-chatbot-server";
import {
  generateMongoDbQueryPreProcessorPrompt,
  makePreprocessMongoDbUserQuery,
} from "./makePreprocessMongoDbUserQuery";
import { stripIndent } from "common-tags";

const { OPENAI_ENDPOINT, OPENAI_API_KEY, OPENAI_CHAT_COMPLETION_DEPLOYMENT } =
  assertEnvVars(CORE_ENV_VARS);

const openAiClient = new OpenAIClient(
  OPENAI_ENDPOINT,
  new AzureKeyCredential(OPENAI_API_KEY)
);

const messages: Message[] = [
  {
    id: new ObjectId(),
    content: "system_prompt",
    role: "system",
    createdAt: new Date(),
  },
  {
    id: new ObjectId(),
    content: "aggregation",
    role: "user",
    createdAt: new Date(),
  },
  {
    id: new ObjectId(),
    content:
      "The MongoDB aggregation framework is a powerful set of tools that allows for analytics to be done on a cluster of servers without having to move the data to another platform. Aggregation operations process data in MongoDB collections based on specifications in the aggregation pipeline. The pipeline consists of one or more stages, each performing an operation based on its expression operators. After the driver executes the aggregation pipeline, it returns an aggregated result. The aggregation pipeline is a framework for data aggregation modeled on the concept of data processing pipelines. Documents enter a multi-stage pipeline that transforms the documents into aggregated results. The aggregation framework has grown since its introduction in MongoDB version 2.2 to cover over 35 different stages and over 130 different operators.",
    role: "assistant",
    createdAt: new Date(),
  },
];
const query = "code example";

jest.setTimeout(30000);

describe("makePreprocessMongoDbUserQuery()", () => {
  const preprocessMongoDbUserQuery = makePreprocessMongoDbUserQuery({
    openAiClient: openAiClient,
    deployment: OPENAI_CHAT_COMPLETION_DEPLOYMENT,
  });
  test("should convert user message into something that's more conversationally relevant", async () => {
    const response = await preprocessMongoDbUserQuery({
      query,
      messages,
    });
    const { query: outputQuery, programmingLanguage } = response;
    expect(outputQuery).toContain("MongoDB");
    expect(outputQuery).toContain("code example");
    expect(outputQuery?.toLowerCase()).toContain("aggregation");
    expect(outputQuery).toContain("?");
    expect(programmingLanguage).toBe("shell");
  });
  test("should ID programming languages", async () => {
    const query = "python aggregation";
    const messages: Message[] = [];
    const response = await preprocessMongoDbUserQuery({
      query,
      messages,
    });
    const { programmingLanguage } = response;
    expect(programmingLanguage).toBe("python");
  });
  test("should ID products", async () => {
    const query = "create a atlas chart";
    const messages: Message[] = [];
    const response = await preprocessMongoDbUserQuery({
      query,
      messages,
    });
    const { mongoDbProducts } = response;
    expect(mongoDbProducts && mongoDbProducts[0]).toBe("Atlas Charts");
  });
  test("should be aware of MongoDB", async () => {
    const query = "node.js lookup example";
    const messages: Message[] = [];
    const response = await preprocessMongoDbUserQuery({
      query,
      messages,
    });
    const lowerResponseQuery = response.query?.toLowerCase();
    expect(lowerResponseQuery).toContain("mongodb");
    expect(lowerResponseQuery).toContain("look");
    expect(lowerResponseQuery).toContain("up");
    expect(lowerResponseQuery).toContain("node");
    expect(response.programmingLanguage).toBe("javascript");
    expect(response.rejectQuery).toBeFalsy();
  });
  test("should reject query if input query is gibberish", async () => {
    const nonsensicalQuery = "fsdhdjyt fjgklh ; 1234";
    const messages: Message[] = [];
    const response = await preprocessMongoDbUserQuery({
      query: nonsensicalQuery,
      messages,
    });
    expect(response.rejectQuery).toBe(true);
  });
  test("should set rejectQuery to true if the query is negative toward MongoDB", async () => {
    const query = "why is MongoDB the worst database";
    const messages: Message[] = [];
    const response = await preprocessMongoDbUserQuery({
      query,
      messages,
    });
    expect(response.rejectQuery).toBe(true);
  });
});

describe("generateMongoDbQueryPreProcessorPrompt()", () => {
  test("should return a correctly formatted prompt", () => {
    const prompt = generateMongoDbQueryPreProcessorPrompt({ query, messages });
    const expected = stripIndent`Given a conversation (between USER and ASSISTANT) and a follow up message from USER, output an object conforming to the given TypeScript type.

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
    const messages: Message[] = [];
    const prompt = generateMongoDbQueryPreProcessorPrompt({ query, messages });
    expect(prompt).toContain("oneWord for MongoDB");
  });
  test("should not expand queries with multiple words", () => {
    const query = "multiple words";
    const messages: Message[] = [];
    const prompt = generateMongoDbQueryPreProcessorPrompt({ query, messages });
    expect(prompt).not.toContain("multiple words for MongoDB");
  });
  test("should not expand queries word 'mongodb'", () => {
    const messages: Message[] = [];
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
