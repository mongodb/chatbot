import { strict as assert } from "assert";
import { Db, ObjectId } from "mongodb";

import {
  Conversation,
  SomeMessage,
  AssistantMessage,
  FunctionMessage,
} from "mongodb-chatbot-server";
import { clusterize, DbscanOptions } from "./clusterize";
import { barycenter } from "./barycenter";

export type QuestionAndResponses = {
  embedding: number[];
  question: string;
  responses: (AssistantMessage | FunctionMessage)[];
};

export type FaqEntry = {
  embedding: number[];
  embeddings: number[][];
  questions: string[];
  responses: (AssistantMessage | FunctionMessage)[][];
  faqScore: number;
};

export const findFaq = async ({
  db,
  clusterizeOptions,
}: {
  db: Db;
  clusterizeOptions?: Partial<DbscanOptions>;
}): Promise<FaqEntry[]> => {
  const conversationsCollection = db.collection<Conversation>("conversations");
  const originalMessages = conversationsCollection.aggregate<
    SomeMessage & { indexInConvo: number; convoId: ObjectId }
  >([
    {
      $match: {
        // Include only conversations that actually had user input
        "messages.role": "user",
      },
    },
    {
      // With replaceRoot below, pass each message from conversation to next
      // stage in pipeline
      $unwind: {
        path: "$messages",
        includeArrayIndex: "indexInConvo",
      },
    },
    {
      $addFields: {
        "messages.indexInConvo": "$indexInConvo",
        "messages.convoId": "$_id",
      },
    },
    {
      $replaceRoot: { newRoot: "$messages" },
    },
    { $sort: { convoId: 1, createdAt: 1 } },
  ]);

  // Combine user question and responses into individual question & response
  // objects. In the original conversation object, every 'user' message is
  // followed by one or more non-'user' question, which is the response.
  let currentQuestion: Partial<QuestionAndResponses> | undefined;
  const questions: QuestionAndResponses[] = [];
  const addQuestionToList = (
    partialQuestion: Partial<QuestionAndResponses> | undefined
  ) => {
    if (partialQuestion === undefined) {
      return;
    }
    const { embedding, question, responses } = partialQuestion;
    assert(
      embedding !== undefined &&
        question !== undefined &&
        responses !== undefined
    );
    questions.push({ embedding, question, responses });
  };
  for await (const message of originalMessages) {
    switch (message.role) {
      case "user":
        {
          addQuestionToList(currentQuestion);
          currentQuestion = undefined;

          const { embedding, content: question } = message;
          if (embedding === undefined) {
            // Earlier versions did not store user question embedding
            continue;
          }

          currentQuestion = {
            embedding,
            question,
            responses: [],
          };
        }
        break;
      case "assistant":
      case "function":
        {
          currentQuestion?.responses?.push(message);
        }
        break;
      default:
        continue;
    }
  }
  addQuestionToList(currentQuestion);
  currentQuestion = undefined;

  const { clusters, noise } = clusterize(
    questions,
    (q) => {
      assert(q.embedding);
      return q.embedding;
    },
    clusterizeOptions
  );

  const faqEntries = clusters
    .map((cluster) => {
      const embeddings = cluster.map(({ embedding }) => embedding);
      return {
        embedding: barycenter(embeddings),
        embeddings,
        questions: cluster.map(({ question }) => question),
        responses: cluster.map(({ responses }) => responses),
        faqScore: cluster.length / (questions.length - noise.length),
      };
    })
    .sort((a, b) => b.faqScore - a.faqScore);

  return faqEntries;
};
