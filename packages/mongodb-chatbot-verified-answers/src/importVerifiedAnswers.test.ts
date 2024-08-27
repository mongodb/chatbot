import crypto from "crypto";
import { Embedder, VerifiedAnswer } from "mongodb-rag-core";
import {
  makeQuestionId,
  prepareVerifiedAnswers,
} from "./importVerifiedAnswers";
import { VerifiedAnswerSpec } from "./parseVerifiedAnswersYaml";

describe("makeQuestionId", () => {
  it("always produces the same hash for the same input", () => {
    expect(makeQuestionId("How do you get to Carnegie Hall?")).toEqual(
      "rRea4KS7uOQMc754xb1xPpu8b1B84k1aVr/3itM+EBI="
    );
    expect(makeQuestionId("Why did the chicken cross the road?")).toEqual(
      "XjSwKAU59yICpH8iOy4O2mjLGKQseJdLINBu3cFO9qU="
    );
  });
});

// Mock embedder
const doEmbed = (text: string) =>
  crypto
    .createHash("sha256")
    .update(text, "utf8")
    .digest("hex")
    .split("")
    .map((x) => parseInt(`0x${x}`));
const embedder: Embedder = {
  embed: async ({ text }) => ({
    // Use a non-cryptographic hash just to be sure that different text
    // produces different results (and same text produces same results)
    embedding: doEmbed(text),
  }),
};
const embeddingModelName = "mock-hash";
const embeddingModelVersion = "1.0";
const mockPrepareVerifiedAnswersArgs = {
  embedder,
  embeddingModelName,
  embeddingModelVersion,
};

const makeMockVerifiedAnswer = (
  question: string,
  answer: string,
  more?: Omit<Partial<VerifiedAnswer>, "question" | "answer">
): VerifiedAnswer => {
  return {
    _id: makeQuestionId(question),
    question: {
      embedding: doEmbed(question),
      embedding_model: embeddingModelName,
      embedding_model_version: embeddingModelVersion,
      text: question,
    },
    answer,
    author_email: "foo@example.com",
    created: new Date("1999-03-31"),
    references: [],
    hidden: false,
    ...(more ?? {}),
  };
};

const makeMockVerifiedAnswerSpec = (
  questions: string | string[],
  answer: string,
  more?: Omit<Partial<VerifiedAnswerSpec>, "questions" | "answer">
): VerifiedAnswerSpec => {
  return {
    questions: Array.isArray(questions) ? questions : [questions],
    answer,
    author_email: "foo@example.com",
    references: [],
    hidden: false,
    ...(more ?? {}),
  };
};

describe("prepareVerifiedAnswers", () => {
  it("correctly performs set difference", async () => {
    const { idsToDelete, answersToUpsert } = await prepareVerifiedAnswers({
      ...mockPrepareVerifiedAnswersArgs,
      storedAnswers: [
        makeMockVerifiedAnswer(
          "How do you get to Carnegie Hall?",
          "Practice, practice, practice!"
        ),
        makeMockVerifiedAnswer(
          "Why did the chicken cross the road?",
          "To get to the other side."
        ),
        makeMockVerifiedAnswer("What is the meaning of life?", "42."),
      ],
      verifiedAnswerSpecs: [
        // 1. Unchanged
        makeMockVerifiedAnswerSpec(
          "How do you get to Carnegie Hall?",
          "Practice, practice, practice!"
        ),
        // 2. Brand new
        makeMockVerifiedAnswerSpec("What's in the box?", "..."),
        // 3. Modified
        makeMockVerifiedAnswerSpec(
          "Why did the chicken cross the road?",
          "To get to the other side.",
          {
            author_email: "best.jokes@mongodb.com",
          }
        ),
        // 4. Omitted: 'What is the meaning of life?'
      ],
    });
    expect(idsToDelete).toStrictEqual([
      makeQuestionId("What is the meaning of life?"),
    ]);
    expect(answersToUpsert).toHaveLength(2);
    expect(answersToUpsert.map(({ question }) => question.text)).toStrictEqual([
      "What's in the box?",
      "Why did the chicken cross the road?",
    ]);
  });
});
