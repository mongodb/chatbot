import { makeVerifiedAnswerGenerateUserPrompt } from "./makeVerifiedAnswerGenerateUserPrompt";
import { VerifiedAnswer, WithScore } from "mongodb-rag-core";

describe("makeVerifiedAnswerGenerateUserPrompt", () => {
  it("uses verified answer if available, onNoVerifiedAnswerFound otherwise", async () => {
    const MAGIC_VERIFIABLE = "VERIFIABLE";
    const references = [
      {
        title: "title",
        url: "url",
      },
    ];
    const generatePrompt = makeVerifiedAnswerGenerateUserPrompt({
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
          userMessage: {
            role: "user",
            content: "returned from onNoVerifiedAnswerFound",
          },
        };
      },
    });

    // Given message text will not turn up verified answer
    let answer = await generatePrompt({
      reqId: "",
      userMessageText: "not verified",
    });
    expect(answer.staticResponse).toBeUndefined();
    expect(answer.userMessage.content).toBe(
      "returned from onNoVerifiedAnswerFound"
    ); // onNoVerifiedAnswerFound called

    // This will find a verified answer
    answer = await generatePrompt({
      reqId: "",
      userMessageText: MAGIC_VERIFIABLE,
    });
    expect(answer.staticResponse).toBeDefined();
    expect(answer.references).toHaveLength(1);
    expect(answer.references).toMatchObject(references);
    expect(answer.staticResponse?.content).toBe("verified answer");
    expect(answer.userMessage.content).toBe(MAGIC_VERIFIABLE); // onNoVerifiedAnswerFound not called
  });
});
