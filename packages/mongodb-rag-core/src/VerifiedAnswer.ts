import { Reference } from "./services/conversations";
import { VectorStore } from "./VectorStore";

export type Question = {
  embedding: number[];
  embedding_model: string;
  embedding_model_version: string;
  text: string;
};

export type VerifiedAnswer = {
  _id: string;
  question: Question;
  answer: string;
  author_email: string;
  hidden?: boolean;
  references: Reference[];
  created: Date;
  updated?: Date;
};

export type VerifiedAnswerStore = VectorStore<VerifiedAnswer>;
