import { z } from "zod";

export interface BaseTestCase {
  name: string;
  data: Record<string, unknown>;
}

export const ConversationTestCaseDataSchema = z.object({
  name: z.string(),
  expectation: z
    .string()
    .optional()
    .describe(
      "Description of what the test case assesses. Used to evaluate against."
    ),
  messages: z
    .array(
      z.object({
        role: z.enum(["assistant", "user"]),
        content: z.string(),
      })
    )
    .min(1),
  tags: z.array(z.string()).optional(),
  skip: z.boolean().optional(),
  expectedLinks: z
    .array(z.string())
    .optional()
    .describe("Sections of links to relevant sources"),
});

export type ConversationTestCaseData = z.infer<
  typeof ConversationTestCaseDataSchema
>;

export interface ConversationTestCase extends BaseTestCase {
  data: ConversationTestCaseData;
  name: "conversation";
}

export const QuizQuestionTestCaseDataSchema = z.object({
  questionText: z.string(),
  contentTitle: z.string(),
  title: z.string(),
  topicType: z.string(),
  questionType: z.string(),
  answers: z.array(
    z.object({
      answer: z.string(),
      isCorrect: z.boolean(),
      label: z.string(),
    })
  ),
});

export type QuizQuestionTestCaseData = z.infer<
  typeof QuizQuestionTestCaseDataSchema
>;

export interface QuizQuestionTestCase extends BaseTestCase {
  data: QuizQuestionTestCaseData;
  name: "quiz";
}

export type SomeTestCase =
  | QuizQuestionTestCase
  | ConversationTestCase
  | BaseTestCase;

export function isConversationTestCase(
  testCase: SomeTestCase
): testCase is ConversationTestCase {
  return ConversationTestCaseDataSchema.safeParse(testCase.data).success;
}

export function isQuizQuestionTestCase(
  testCase: SomeTestCase
): testCase is QuizQuestionTestCase {
  return QuizQuestionTestCaseDataSchema.safeParse(testCase.data).success;
}
