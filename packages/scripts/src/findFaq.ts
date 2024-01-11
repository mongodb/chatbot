import { strict as assert } from "assert";
import { Db, ObjectId } from "mongodb";

import {
  Conversation,
  SomeMessage,
  AssistantMessage,
  FunctionMessage,
  UserMessage,
} from "mongodb-chatbot-server";
import { clusterize, DbscanOptions } from "./clusterize";
import { findCentroid } from "./findCentroid";

export type ResponseMessage = AssistantMessage | FunctionMessage;

export type QuestionAndResponses = {
  embedding: number[];
  question: UserMessage;
  responses: ResponseMessage[];
};

export type FaqEntry = {
  /**
    An arbitrarily-selected representative question from the questions array.
   */
  question: string;

  /**
    The centroid (mean) of all of the question embeddings in the cluster.
   */
  embedding: number[];

  /**
    The original question embeddings.
   */
  embeddings: number[][];

  /**
    The original question user messages.
   */
  questions: UserMessage[];

  /**
    The original response(s) to the user message.
   */
  responses: ResponseMessage[][];

  /**
    The relative frequency of this question, which is determined by cluster size
    (a cluster with more objects in it is a more frequently asked question).
   */
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

          const { embedding } = message;
          if (embedding === undefined) {
            // Earlier versions did not store user question embedding
            continue;
          }

          currentQuestion = {
            embedding,
            question: message,
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

  const { clusters } = clusterize(
    questions,
    (q) => {
      assert(q.embedding);
      return q.embedding;
    },
    clusterizeOptions
  );

  const faqEntries = clusters
    .map((cluster): FaqEntry => {
      const embeddings = cluster.map(({ embedding }) => embedding);
      return {
        embedding: findCentroid(embeddings),
        embeddings,
        question: cluster[0].question.content,
        questions: cluster.map(({ question }) => question),
        responses: cluster.map(({ responses }) => responses),
        faqScore: cluster.length / questions.length,
      };
    })
    .sort((a, b) => b.faqScore - a.faqScore);

  return faqEntries;
};
