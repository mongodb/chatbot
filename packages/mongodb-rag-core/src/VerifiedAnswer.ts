import { z } from "zod";
import { Reference } from "./services/conversations";
import { VectorStore } from "./VectorStore";

export const Question = z.object({
  embedding: z.array(z.number()),
  embedding_model: z.string(),
  embedding_model_version: z.string(),
  text: z.string(),
});

export type Question = z.infer<typeof Question>;

export const VerifiedAnswer = z.object({
  _id: z.string(),
  question: Question,
  answer: z.string(),
  author_email: z.string(),
  hidden: z.boolean().optional(),
  references: z.array(Reference),
  created: z.date(),
  updated: z.date().optional(),
});

export type VerifiedAnswer = z.infer<typeof VerifiedAnswer>;
export type VerifiedAnswerStore = VectorStore<VerifiedAnswer>;
