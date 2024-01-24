import { OpenAIClient } from "@azure/openai";
import { makeStepBackUserQuery } from "./makeStepBackUserQuery";
import {
  openAiClient,
  OPENAI_CHAT_COMPLETION_DEPLOYMENT,
  cosineSimilarity,
} from "../test/testHelpers";
import { embedder } from "../config";
import { ObjectId } from "mongodb-chatbot-server";

const args: Parameters<typeof makeStepBackUserQuery>[0] = {
  openAiClient,
  deploymentName: OPENAI_CHAT_COMPLETION_DEPLOYMENT,
  userMessageText: "hi",
};

const mockOpenAIClient = {
  async getChatCompletions() {
    // Return a mock response or use jest.fn() for more control
    return {
      choices: [
        {
          message: {
            functionCall: {
              name: "step_back_user_query",
              arguments: JSON.stringify({
                transformedUserQuery: "foo",
              }),
            },
          },
        },
      ],
    };
  },
};

describe("makeStepBackUserQuery - unit tests", () => {
  test("should return step back user query", async () => {
    expect(
      await makeStepBackUserQuery({
        ...args,
        openAiClient: mockOpenAIClient as unknown as OpenAIClient,
      })
    ).toEqual("foo");
  });
});
describe("makeStepBackUserQuery - qualitative tests", () => {
  it("Should return a step back user query", async () => {
    const stepBackUserQuery = await makeStepBackUserQuery({
      ...args,
      openAiClient,
      userMessageText:
        "how do i add the values of sale_price in aggregation pipeline?",
    });
    const modelAnswer =
      "How to calculate the sum of field in MongoDB aggregation?";
    const modelEmbedding = await embedder.embed({
      text: modelAnswer,
    });
    const actualEmbedding = await embedder.embed({
      text: stepBackUserQuery,
    });
    const semanticSimilarity = cosineSimilarity(
      modelEmbedding.embedding,
      actualEmbedding.embedding
    );

    expect(semanticSimilarity).toBeGreaterThan(0.95);
  });
  it("should step back based on previous messages", async () => {
    const stepBackUserQuery = await makeStepBackUserQuery({
      ...args,
      openAiClient,
      messages: [
        {
          role: "user",
          content: "add documents node.js",
          createdAt: new Date(),
          id: new ObjectId(),
        },
        {
          role: "assistant",
          content:
            "you can add documents with the node.js driver insert and insertMany methods",
          createdAt: new Date(),
          id: new ObjectId(),
        },
      ],
      userMessageText: "code example",
    });
    const modelAnswer =
      "Code example of how to add documents to MongoDB using the Node.js Driver";
    const modelEmbedding = await embedder.embed({
      text: modelAnswer,
    });
    const actualEmbedding = await embedder.embed({
      text: stepBackUserQuery,
    });
    const semanticSimilarity = cosineSimilarity(
      modelEmbedding.embedding,
      actualEmbedding.embedding
    );

    expect(semanticSimilarity).toBeGreaterThan(0.95);
  });
  it("should not do step back if original message doesn't need to be mutated", async () => {
    const userMessageText = "How do I connect to MongoDB Atlas?";
    const stepBackUserQuery = await makeStepBackUserQuery({
      ...args,
      openAiClient,
      userMessageText,
    });
    const modelAnswer = userMessageText; // Model is the actual message
    const modelEmbedding = await embedder.embed({
      text: modelAnswer,
    });
    const actualEmbedding = await embedder.embed({
      text: stepBackUserQuery,
    });
    const semanticSimilarity = cosineSimilarity(
      modelEmbedding.embedding,
      actualEmbedding.embedding
    );

    expect(semanticSimilarity).toBeGreaterThan(0.99);
  });
});
