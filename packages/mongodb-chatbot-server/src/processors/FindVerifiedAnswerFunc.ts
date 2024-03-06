import { WithScore, VerifiedAnswer } from "mongodb-rag-core";

export type FindVerifiedAnswerFuncArgs = {
  query: string;
};

export type FindVerifiedAnswerFunc = (
  args: FindVerifiedAnswerFuncArgs
) => Promise<FindVerifiedAnswerResult>;

export type FindVerifiedAnswerResult = {
  queryEmbedding: number[];
  answer?: WithScore<VerifiedAnswer>;
};
