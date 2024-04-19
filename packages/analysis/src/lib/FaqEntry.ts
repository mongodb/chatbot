export type FaqEntry = {
  created: string;

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
