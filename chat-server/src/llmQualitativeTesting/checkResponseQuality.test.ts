import "dotenv/config";
import { stripIndents } from "common-tags";
import { checkResponseQuality } from "./checkResponseQuality";
import { CORE_ENV_VARS, assertEnvVars } from "chat-core";

const {
  OPENAI_ENDPOINT,
  OPENAI_API_KEY,
  OPENAI_CHAT_COMPLETION_DEPLOYMENT,
  OPENAI_CHAT_COMPLETION_MODEL_VERSION,
} = assertEnvVars(CORE_ENV_VARS);

const azureOpenAiServiceConfig = {
  apiKey: OPENAI_API_KEY,
  baseUrl: OPENAI_ENDPOINT,
  deployment: OPENAI_CHAT_COMPLETION_DEPLOYMENT,
  version: OPENAI_CHAT_COMPLETION_MODEL_VERSION,
};
jest.setTimeout(10000);
describe("checkResponseQuality()", () => {
  test("should return true when the response meets chat quality standards", async () => {
    const conversation = stripIndents`USER: I am a golden retriever named Jasper.
    ASSISTANT: Hi Jasper! What can I help you with today?
    USER: What's my name?
    ASSISTANT: Your name is Jasper.`;
    const expectation =
      "The assistant should correctly respond with the user's name.";
    const result = await checkResponseQuality(
      conversation,
      expectation,
      azureOpenAiServiceConfig
    );
    expect(result.meetsChatQualityStandards).toBe(true);
  });
  test("should return false with explanation when the response does not meet chat quality standards", async () => {
    const conversation = stripIndents`USER: I am a golden retriever named Jasper.
    ASSISTANT: Hi Jasper! What can I help you with today?
    USER: What's my name?
    ASSISTANT: Your name is Chippy.`;
    const expectation =
      "The assistant should correctly respond with the user's name.";
    const result = await checkResponseQuality(
      conversation,
      expectation,
      azureOpenAiServiceConfig
    );
    expect(result.meetsChatQualityStandards).toBe(false);
    expect(result.reason).toBeTruthy();
    expect(result.reason).toContain("name");
  });
  test("should identify when MongoDB chatbot answer is correct", async () => {
    const conversation = stripIndents`USER: what the difference between postgres and mongodb?
    ASSISTANT: PostgreSQL and MongoDB are two different types of databases. PostgreSQL is a relational database management system (RDBMS) that uses SQL to manage and manipulate data. It is a good choice for applications that require complex queries and transactions. On the other hand, MongoDB is a NoSQL document-oriented database that stores data in JSON-like documents. It is a good choice for applications that require flexible and scalable data models. While both databases have their strengths and weaknesses, the choice between them ultimately depends on the specific needs of your application.`;
    const expectation = stripIndents`Explains basic differences and similarities between PostgreSQL and MongoDB. Explains that both are databases.

    Mentions:
    - Postgres is SQL
    - MongoDB is document-based an NoSQL

    Fair and balanced answer`;
    const result = await checkResponseQuality(
      conversation,
      expectation,
      azureOpenAiServiceConfig
    );
    expect(result.meetsChatQualityStandards).toBe(true);
  });
  test("should identify when MongoDB chatbot answer is incorrect", async () => {
    const conversation = stripIndents`USER: $lookup for MongoDB
    ASSISTANT: One way to look up data in MongoDB is by using a find operation such as the \`find()\` or \`findOne()\` methods. These methods allow you to request results based on a set of criteria from the existing set of data. You can also further specify the information you are requesting by including additional parameters or by chaining other methods such as sorting, skipping, limiting, or specifying which fields to return. Another way to look up data is by using an aggregation operation, which allows you to apply an ordered pipeline of transformations to the matched data. Additionally, you can use the watch operation to monitor the database for incoming data that matches a set of criteria and be notified in real-time when matching data is inserted.`;
    const expectation =
      "Provides an explanation of what the $lookup operator is. Include code example of the operator.";
    const result = await checkResponseQuality(
      conversation,
      expectation,
      azureOpenAiServiceConfig
    );
    expect(result.meetsChatQualityStandards).toBe(false);
    expect(result.reason).toContain("example");
    expect(result.reason).toContain("$lookup");
  });
});
