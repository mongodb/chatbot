import {
  Embedder,
  FindNearestNeighborsOptions,
  VerifiedAnswerStore,
} from "mongodb-rag-core";
import { FindVerifiedAnswerFunc } from "./FindVerifiedAnswerFunc";

export type MakeDefaultFindVerifiedAnswerFuncArgs = {
  embedder: Embedder;
  store: VerifiedAnswerStore;
  findNearestNeighborsOptions?: Partial<FindNearestNeighborsOptions>;
};

/**
  Basic implementation of FindVerifiedAnswerFunc.
 */
export const makeDefaultFindVerifiedAnswer = ({
  embedder,
  store,
  findNearestNeighborsOptions,
}: MakeDefaultFindVerifiedAnswerFuncArgs): FindVerifiedAnswerFunc => {
  return async ({ query }) => {
    const { embedding: queryEmbedding } = await embedder.embed({
      text: query,
    });

    const answers = await store.findNearestNeighbors(
      queryEmbedding,
      findNearestNeighborsOptions
    );

    // Sort by score descending
    answers.sort((a, b) => b.score - a.score);

    return { queryEmbedding, answer: answers[0] };
  };
};
