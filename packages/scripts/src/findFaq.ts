import { strict as assert } from "assert";
import { ObjectId, Collection, WithId } from "mongodb-rag-core/mongodb";
import randomSampleImpl from "@stdlib/random-sample";
import {
  Conversation,
  SomeMessage,
  AssistantMessage,
  FunctionMessage,
  UserMessage,
  VectorStore,
  FindNearestNeighborsOptions,
  WithScore,
  ChatLlm,
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
    FaqEntry schema version.
   */
  schemaVersion: 1;

  /**
    An arbitrarily-selected representative question from the questions array.
   */
  question: string;

  /**
    The centroid (mean) of all of the question embeddings in the cluster.
   */
  embedding: number[];

  /**
    A randomly selected sample of original question user messages.
   */
  sampleOriginals: string[];

  /**
    The number of questions in the similarity cluster.
   */
  instanceCount: number;

  /**
    The total number of questions at the time of this findFaq run.
   */
  snapshotTotal: number;

  /**
    How many days before snapshotDate 
   */
  snapshotWindowDays: number;

  /**
    The relative frequency of this question, which is determined by cluster size
    (a cluster with more objects in it is a more frequently asked question).
   */
  faqScore: number;

  /**
    An id unique to this category of questions.
   */
  faqId?: string;
};

export const findFaq = async ({
  conversationsCollection,
  snapshotWindowDays,
  clusterizeOptions,
}: {
  conversationsCollection: Collection<Conversation>;
  snapshotWindowDays: number;
  clusterizeOptions?: Partial<DbscanOptions>;
}): Promise<FaqEntry[]> => {
  const originalMessages = conversationsCollection.aggregate<
    SomeMessage & { indexInConvo: number; convoId: ObjectId }
  >([
    {
      $match: {
        // Include only conversations that actually had user input
        "messages.role": "user",
        createdAt: {
          $gte: new Date(Date.now() - snapshotWindowDays * 24 * 60 * 60 * 1000),
        },
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

      // Get a random sample of questions to represent the question cluster
      const [question, ...sampleOriginals] = randomlySampleQuestions(
        cluster.map(({ question }) => question.content)
      );

      return {
        schemaVersion: 1,
        embedding: findCentroid(embeddings),
        question,
        sampleOriginals,
        instanceCount: cluster.length,
        snapshotTotal: questions.length,
        snapshotWindowDays,
        faqScore: cluster.length / questions.length,
      };
    })
    .sort((a, b) => b.faqScore - a.faqScore);

  return faqEntries;
};

/**
  Make a wrapper around the given collection that conforms to the VectorStore
  interface.

  Does not manage the collection - callers are still responsible for closing the
  client.
 */
export const makeFaqVectorStoreCollectionWrapper = (
  collection: Collection<WithId<FaqEntry & { created: Date; epsilon: number }>>
): VectorStore<WithId<FaqEntry>> => {
  return {
    findNearestNeighbors(vector, options) {
      const {
        indexName,
        path,
        k,
        minScore,
        filter = {},
        numCandidates,
      }: Partial<FindNearestNeighborsOptions> = {
        // Default options
        indexName: "vector_index",
        path: "embedding",
        k: 10,
        minScore: 0.95,
        // User options override
        ...(options ?? {}),
      };
      return collection
        .aggregate<WithScore<WithId<FaqEntry>>>([
          {
            $vectorSearch: {
              index: indexName,
              queryVector: vector,
              path,
              limit: k,
              numCandidates: numCandidates ?? k * 15,
              filter,
            },
          },
          {
            $addFields: {
              score: {
                $meta: "vectorSearchScore",
              },
            },
          },
          {
            $match: {
              score: { $gte: minScore },
            },
          },
        ])
        .toArray();
    },
  };
};

/**
  For each given question, finds if any similar messages already have a faqId.
  If so, adopts the faqId. Otherwise, invents a new faqId for this category of
  question.
 */
export const assignFaqIds = async ({
  faqEntries,
  faqStore,
}: {
  faqEntries: FaqEntry[];
  faqStore: VectorStore<WithId<FaqEntry>>;
}): Promise<(FaqEntry & { faqId: string })[]> => {
  return await Promise.all(
    faqEntries.map(async (q) => {
      // See if there already is an ID for this FAQ.
      const previousFaqs = await faqStore.findNearestNeighbors(q.embedding);
      const previousFaqsWithFaqIds = previousFaqs.filter(
        (q) => q.faqId !== undefined
      );
      previousFaqsWithFaqIds.sort((a, b) => b.score - a.score);

      // Use the pre-existing faqId or generate a new one for this category
      const faqId =
        previousFaqsWithFaqIds[0]?.faqId ?? ObjectId.generate().toString();
      console.log(
        `${
          previousFaqsWithFaqIds[0]?.faqId === undefined
            ? "Generated new"
            : "Reused existing"
        } faqId ${faqId} for question category "${q.question}"`
      );

      return { ...q, faqId };
    })
  );
};

export const assignRepresentativeQuestion = async ({
  faq,
  llm,
}: {
  faq: FaqEntry[];
  llm: ChatLlm;
}): Promise<FaqEntry[]> => {
  return await Promise.all(
    faq.map(async (q) => {
      try {
        const representativeQuestion = await llm.answerQuestionAwaited({
          messages: [
            {
              role: "user",
              content: `Generate a single question that captures the gist of the following similar questions. Do not include any personally identifiable information. Use proper grammar.\n\n${q.sampleOriginals
                .map((content) => `- ${content.replaceAll(/\n/g, "...")}`)
                .join("\n")}`,
            },
          ],
        });
        console.log(
          `Generated representative question: "${q.question}" -> "${representativeQuestion.content}"`
        );
        if (representativeQuestion.content === null) {
          throw new Error("llm returned null!");
        }
        return { ...q, question: representativeQuestion.content };
      } catch (error) {
        console.warn(
          `Failed to generate representation question for '${q.question}': ${
            (error as Error).message
          }`
        );
        return q;
      }
    })
  );
};

// Make @std-lib/randomSample type-friendly
export const randomSample = <T>(
  a: ArrayLike<T>,
  options: {
    size?: number;
    probs?: Array<number>;
    replace?: boolean;
  }
) => randomSampleImpl(a, options) as T[];

export const randomlySampleQuestions = (questions: string[]) =>
  questions.length < 11
    ? [...questions]
    : randomSample(questions, {
        size: 11,
        replace: false, // no repeats
      });
