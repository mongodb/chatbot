import { WithId, ObjectId } from "mongodb";
import { ResponseMessage } from "./findFaq";
import { UserMessage } from "mongodb-chatbot-server";
import { FaqEntry, randomlySampleQuestions } from "./findFaq";

export type FaqEntryV0 = {
  /**
    FaqEntry schema version.
   */
  schemaVersion?: 0;

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
  questions: (UserMessage & { createdAt: Date })[];

  /**
    The original response(s) to the user message.
   */
  responses: ResponseMessage[][];

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

export type CountUserMessagesFunc = (args: {
  from: Date;
  to: Date;
}) => Promise<number>;

const deletedProps: Exclude<keyof FaqEntryV0, keyof FaqEntry>[] = [
  "embeddings",
  "questions",
  "responses",
];

export const upgradeFaqEntries = async ({
  entries,
  countUserMessages,
}: {
  entries: WithId<FaqEntryV0>[];
  countUserMessages: CountUserMessagesFunc;
}): Promise<WithId<FaqEntry>[]> => {
  return await Promise.all(
    entries
      .filter(
        // Only upgrade when schema version is below 1
        ({ schemaVersion }) => schemaVersion === undefined || schemaVersion < 1
      )
      .map(async (entry) => {
        const { questions, faqScore } = entry;
        const [question, ...sampleOriginals] = randomlySampleQuestions(
          questions.map(({ content }) => content)
        );

        const { instanceCount, snapshotTotal } = await reconstructCounts({
          questions,
          countUserMessages,
          faqScore,
          entryId: entry._id,
        });

        const upgradedEntry: WithId<FaqEntry> &
          Partial<Omit<WithId<FaqEntryV0>, "schemaVersion">> = {
          ...entry,
          schemaVersion: 1,
          instanceCount,
          snapshotTotal,
          sampleOriginals,
          question,
        };
        deletedProps.forEach((k) => delete upgradedEntry[k]);
        return upgradedEntry;
      })
  );
};

export const reconstructCounts = async ({
  entryId,
  questions,
  countUserMessages,
  faqScore,
}: {
  entryId: ObjectId;
  questions: (UserMessage & { createdAt: Date })[];
  countUserMessages: CountUserMessagesFunc;
  faqScore: number;
}) => {
  try {
    const [minCreatedAt, maxCreatedAt] = questions.reduce(
      (acc, { createdAt }) => {
        const minTime = acc[0].getTime();
        const maxTime = acc[0].getTime();
        const curTime = createdAt.getTime();
        return [
          curTime < minTime ? createdAt : acc[0],
          curTime > maxTime ? createdAt : acc[1],
        ];
      },
      [questions[0].createdAt, questions[0].createdAt]
    );

    const snapshotTotal = await countUserMessages({
      from: minCreatedAt,
      to: maxCreatedAt,
    });

    // faqScore = instanceCount / snapshotTotal
    // -> instanceCount = faqScore * snapshotTotal
    const instanceCount = Math.floor(faqScore * snapshotTotal);
    return { snapshotTotal, instanceCount };
  } catch (error) {
    console.error(
      `Failed to reconstruct counts for ${entryId}: ${(error as Error).message}`
    );
    return { snapshotTotal: -1, instanceCount: -1 };
  }
};
