import { ResponseMessage } from "./findFaq";
import { UserMessage } from "mongodb-chatbot-server";
import { FaqEntry, randomlySampleQuestions } from "./findFaq";

export type FaqEntryV0 = {
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
  entries: FaqEntryV0[];
}): Promise<FaqEntry[]> => {
  return entries.map((entry) => {
    const { questions } = entry;
    const [question, ...sampleOriginals] = randomlySampleQuestions(
      questions.map(({ content }) => content)
    );
    const upgradedEntry: FaqEntry & Partial<FaqEntryV0> = {
      ...entry,
      instanceCount: 10,
      snapshotTotal: 100,
      sampleOriginals,
      question,
    };
    deletedProps.forEach((k) => delete upgradedEntry[k]);
    return upgradedEntry;
  });
};
