import { WithScore } from "../VectorStore";
import { VerifiedAnswer } from "./VerifiedAnswer";

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
