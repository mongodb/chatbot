import { z } from "zod";

export const QuizQuestionDataSchema = z.object({
  questionText: z.string(),
  contentTitle: z.string().optional(),
  title: z.string().optional(),
  topicType: z.string().optional(),
  questionType: z.string().optional(),
  answers: z.array(
    z.object({
      answer: z.string(),
      isCorrect: z.boolean(),
      label: z.string(),
    })
  ),
});

export type QuizQuestionData = z.infer<typeof QuizQuestionDataSchema>;
