import { z } from "zod";
import { Reference } from "./references";

export const Question = z.object({
  embedding: z
    .array(z.number())
    .describe("The vector embedding of the question text."),
  embedding_model: z
    .string()
    .describe(
      "The name of the embedding model used to generate the embedding."
    ),
  embedding_model_version: z
    .string()
    .describe(
      "The version of the embedding model used to generate the embedding."
    ),
  text: z.string().describe("The text of the question."),
});

export type Question = z.infer<typeof Question>;

export const VerifiedAnswer = z.object({
  _id: z.string().describe("A unique identifier for the answer."),
  question: Question,
  answer: z
    .string()
    .describe(
      "The text of the verified answer. This is returned verbatim to the user as the response to their question."
    ),
  author_email: z
    .string()
    .email()
    .describe("The email address of the author or source of the answer."),
  hidden: z.boolean().optional(),
  references: z
    .array(Reference)
    .describe(
      "Reference links with additional information related to the answer."
    ),
  created: z.date().describe("The date and time the answer was created."),
  updated: z
    .date()
    .optional()
    .describe("The date and time the answer was most recently updated."),
});

export type VerifiedAnswer = z.infer<typeof VerifiedAnswer>;
