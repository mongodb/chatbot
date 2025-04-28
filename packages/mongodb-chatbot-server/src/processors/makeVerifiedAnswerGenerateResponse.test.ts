import { ObjectId } from "mongodb-rag-core/mongodb";
import { makeVerifiedAnswerGenerateResponse } from "./makeVerifiedAnswerGenerateResponse";
import { VerifiedAnswer, WithScore } from "mongodb-rag-core";

describe("makeVerifiedAnswerGenerateResponse", () => {
  const MAGIC_VERIFIABLE = "VERIFIABLE";
  const references = [
    {
      title: "title",
      url: "url",
    },
  ];
  const generateResponse = makeVerifiedAnswerGenerateResponse({
    findVerifiedAnswer: async ({ query }) => {
      return {
        queryEmbedding: [1, 2, 3],
        answer:
          query === MAGIC_VERIFIABLE
            ? ({
                answer: "verified answer",
                _id: "123",
                author_email: "example@mongodb.com",
                created: new Date(),
                references,
                question: {
                  text: "question",
                  embedding: [1, 2, 3],
                  embedding_model: "model",
                  embedding_model_version: "version",
                },
                updated: new Date(),
                score: 1,
              } satisfies WithScore<VerifiedAnswer>)
            : undefined,
      };
    },
    onNoVerifiedAnswerFound: async () => {
      return {
        messages: [
          {
            role: "user",
            content: "returned from onNoVerifiedAnswerFound",
          },
        ],
      };
    },
  });
  it("uses onNoVerifiedAnswerFound if no verified answer is found", async () => {
    // Given message text will not turn up verified answer
    const answer = await generateResponse({
      reqId: "",
      latestMessageText: "not verified",
      shouldStream: false,
      conversation: {
        _id: new ObjectId(),
        messages: [],
        createdAt: new Date(),
      },
    });
    expect(answer.messages).toHaveLength(1);
    expect(answer.messages[0].content).toBe(
      "returned from onNoVerifiedAnswerFound"
    );
  });
  it("uses verified answer if available, onNoVerifiedAnswerFound otherwise", async () => {
    // This will find a verified answer
    const answer = await generateResponse({
      reqId: "",
      latestMessageText: MAGIC_VERIFIABLE,
      shouldStream: false,
      conversation: {
        _id: new ObjectId(),
        messages: [],
        createdAt: new Date(),
      },
    });
    expect(answer.messages).toHaveLength(2);
    expect(answer.messages[0].content).toBe(MAGIC_VERIFIABLE);
  });
});
