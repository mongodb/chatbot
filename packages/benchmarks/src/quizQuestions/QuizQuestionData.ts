import { z } from "zod";

export const QuizQuestionDataSchema = z.object({
  questionText: z.string().describe("The question text"),
  contentTitle: z
    .string()
    .optional()
    .describe("The title of the content associated with the assessment"),
  title: z.string().optional().describe("The title of the assessment"),
  topicType: z.enum(["quiz", "badge"]).optional(),
  questionType: z.enum(["multipleCorrect", "singleCorrect"]).optional(),
  answers: z.array(
    z.object({
      answer: z.string(),
      isCorrect: z.boolean(),
      label: z.string(),
    })
  ),
  explanation: z
    .string()
    .optional()
    .describe("Brief explanation of the answer"),
  tags: z.array(z.string()).optional(),
});

export type QuizQuestionData = z.infer<typeof QuizQuestionDataSchema>;
