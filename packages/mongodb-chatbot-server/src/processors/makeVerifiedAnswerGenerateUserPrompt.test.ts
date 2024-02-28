import { makeVerifiedAnswerGenerateUserPrompt } from "./makeVerifiedAnswerGenerateUserPrompt";
import { VerifiedAnswer, WithScore } from "mongodb-rag-core";

describe("makeVerifiedAnswerGenerateUserPrompt", () => {
  it("uses verified answer if available, continuation otherwise", async () => {
    const MAGIC_VERIFIABLE = "VERIFIABLE";
    const generatePrompt = makeVerifiedAnswerGenerateUserPrompt({
      findVerifiedAnswer: async ({ query }) => {
        return {
          queryEmbedding: [1, 2, 3],
          answer:
            query === MAGIC_VERIFIABLE
              ? ({
                  answer: "verified answer",
                } as unknown as WithScore<VerifiedAnswer>)
              : undefined,
        };
      },
      continuation: async () => {
        return {
          userMessage: {
            role: "user",
            content: "returned from continuation",
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
    expect(answer.userMessage.content).toBe("returned from continuation"); // continuation called

    // This will find a verified answer
    answer = await generatePrompt({
      reqId: "",
      userMessageText: MAGIC_VERIFIABLE,
    });
    expect(answer.staticResponse).toBeDefined();
    expect(answer.staticResponse?.content).toBe("verified answer");
    expect(answer.userMessage.content).toBe(MAGIC_VERIFIABLE); // continuation not called
  });
});
