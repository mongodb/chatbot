import "dotenv/config";
import { ObjectId } from "mongodb-rag-core";
import { Message } from "mongodb-chatbot-server";
import { evaluateConversationAverageRetrievalScore } from "./evaluateConversationAverageRetrievalScore";
import { mockConversationGeneratedDataFromMessages } from "../test/mockConversationGeneratedDataFromMessages";

jest.setTimeout(30000);

describe("evaluateConversationAverageRetrievalScore", () => {
  const runId = new ObjectId();
  test("should calculate the average retrieval score for conversation", async () => {
    const messages = [
      {
        id: new ObjectId(),
        createdAt: new Date(),
        role: "user",
        content: "What color is the sky",
        preprocessedContent: "What color is the sky",
        contextContent: [
          {
            text: "The sky is blue",
            score: 1,
          },
          {
            text: "The sky is red",
            score: 0,
          },
        ],
      },
      {
        id: new ObjectId(),
        createdAt: new Date(),
        role: "assistant",
        content: "The sky is blue today",
      },
    ] satisfies Message[];
    const generatedData = mockConversationGeneratedDataFromMessages(messages);

    const evalResult = await evaluateConversationAverageRetrievalScore({
      runId,
      generatedData,
    });
    expect(evalResult).toMatchObject({
      generatedDataId: generatedData._id,
      result: 0.5,
      type: "conversation_retrieval_avg_score",
      _id: expect.any(ObjectId),
      createdAt: expect.any(Date),
      commandRunMetadataId: runId,
      metadata: {
        contextContent: messages[0].contextContent,
        userQueryContent: messages[0].content,
        preprocessedUserQueryContent: messages[0].preprocessedContent,
      },
    });
  });
  test("should throw if contextContent score doesn't exist", async () => {
    const messages = [
      {
        id: new ObjectId(),
        createdAt: new Date(),
        role: "user",
        content: "What color is the sky",
        preprocessedContent: "What color is the sky",
        contextContent: [
          {
            text: "The sky is blue",
          },
        ],
      },
      {
        id: new ObjectId(),
        createdAt: new Date(),
        role: "assistant",
        content: "The sky is blue today",
      },
    ] satisfies Message[];
    const generatedData = mockConversationGeneratedDataFromMessages(messages);

    expect(
      async () =>
        await evaluateConversationAverageRetrievalScore({
          runId,
          generatedData,
        })
    ).rejects.toThrow();
  });
});
