import { WithId, ObjectId } from "mongodb";
import { ResponseMessage } from "./findFaq";
import { UserMessage } from "mongodb-chatbot-server";
import {
  FaqEntry as FaqEntryWithoutDate,
  randomlySampleQuestions,
} from "./findFaq";

export type FaqEntry = FaqEntryWithoutDate & { created: Date };

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

  created: Date;
};

export type CountUserMessagesFunc = (args: {
  from: Date;
  to: Date;
}) => Promise<number>;

export type FindQuestionsFromFaqDateFunc = (
  date: Date
) => Promise<{ createdAt: Date }[]>;

const deletedProps: Exclude<keyof FaqEntryV0, keyof FaqEntry>[] = [
  "embeddings",
  "questions",
  "responses",
];

export const upgradeFaqEntry = async ({
  entry,
  countUserMessages,
  findQuestionsFromFaqDate,
}: {
  entry: WithId<FaqEntryV0>;
  countUserMessages: CountUserMessagesFunc;
  findQuestionsFromFaqDate: FindQuestionsFromFaqDateFunc;
}): Promise<WithId<FaqEntry> | undefined> => {
  // Only upgrade when schema version is below 1
  const { schemaVersion } = entry;
  if (schemaVersion !== undefined && schemaVersion > 0) {
    return undefined;
  }

  const { questions, faqScore, _id: entryId, created: entryCreated } = entry;
  const [question, ...sampleOriginals] = randomlySampleQuestions(
    questions.map(({ content }) => content)
  );

  const snapshotTotal = await findSnapshotTotal({
    countUserMessages,
    faqScore,
    entryId,
    entryCreated,
    findQuestionsFromFaqDate,
  });

  const upgradedEntry: WithId<FaqEntry> &
    Partial<Omit<WithId<FaqEntryV0>, "schemaVersion">> = {
    ...entry,
    schemaVersion: 1,
    instanceCount: entry.questions.length,
    snapshotTotal,
    sampleOriginals,
    snapshotWindowDays: 5,
    question,
  };
  deletedProps.forEach((k) => delete upgradedEntry[k]);
  return upgradedEntry;
};

/**
  Finds the total number of user messages at the time of the snapshot.
 */
export const findSnapshotTotal = async ({
  entryId,
  entryCreated,
  countUserMessages,
  findQuestionsFromFaqDate,
}: {
  entryId: ObjectId;
  entryCreated: Date;
  countUserMessages: CountUserMessagesFunc;
  findQuestionsFromFaqDate: FindQuestionsFromFaqDateFunc;
  faqScore: number;
}) => {
  try {
    const questions = await findQuestionsFromFaqDate(entryCreated);
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

    // Need to count total user messages from snapshot, because 'questions' only
    // includes FAQs, not 'noise' questions that couldn't be grouped
    const snapshotTotal = await countUserMessages({
      from: minCreatedAt,
      to: maxCreatedAt,
    });

    return snapshotTotal;
  } catch (error) {
    console.error(
      `Failed to reconstruct counts for ${entryId}: ${(error as Error).message}`
    );
    return -1;
  }
};
