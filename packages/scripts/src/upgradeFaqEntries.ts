import { WithId } from "mongodb";
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

  /**
    An id unique to this category of questions.
   */
  faqId?: string;
};

const deletedProps: Exclude<keyof FaqEntryV0, keyof FaqEntry>[] = [
  "embeddings",
  "questions",
  "responses",
];

export const upgradeFaqEntries = async ({
  entries,
}: {
  entries: WithId<FaqEntryV0>[];
}): Promise<WithId<FaqEntry>[]> => {
  return entries
    .filter(
      // Only upgrade when schema version is below 1
      ({ schemaVersion }) => schemaVersion === undefined || schemaVersion < 1
    )
    .map((entry) => {
      const { questions } = entry;
      const [question, ...sampleOriginals] = randomlySampleQuestions(
        questions.map(({ content }) => content)
      );
      const upgradedEntry: WithId<FaqEntry> &
        Partial<Omit<WithId<FaqEntryV0>, "schemaVersion">> = {
        ...entry,
        schemaVersion: 1,
        instanceCount: 0, // No real way to restore instanceCount/snapshotTotal from faqScore
        snapshotTotal: 0,
        sampleOriginals,
        question,
      };
      deletedProps.forEach((k) => delete upgradedEntry[k]);
      return upgradedEntry;
    });
};
