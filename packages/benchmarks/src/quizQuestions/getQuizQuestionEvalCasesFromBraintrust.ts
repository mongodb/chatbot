import { getDatasetFromBraintrust } from "mongodb-rag-core/braintrust";
import { QuizQuestionDataSchema } from "./QuizQuestionData";
import { z } from "zod";
import { QuizQuestionEvalCase } from "./QuizQuestionEval";
import { quizQuestionToHelmAnswer } from "./makeHelmQuizQuestionPrompt";
export interface GetQuizQuestionEvalCasesFromBraintrustParams {
  projectName: string;
  datasetName: string;
}

const QuizQuestionDatasetEntrySchema = z.object({
  input: QuizQuestionDataSchema,
});

type QuizQuestionDatasetEntry = z.infer<typeof QuizQuestionDatasetEntrySchema>;

export async function getQuizQuestionEvalCasesFromBraintrust({
  projectName,
  datasetName,
}: GetQuizQuestionEvalCasesFromBraintrustParams): Promise<
  QuizQuestionEvalCase[]
> {
  const datasetRows = await getDatasetFromBraintrust<QuizQuestionDatasetEntry>({
    projectName,
    datasetName,
    datasetRowSchema: QuizQuestionDatasetEntrySchema,
  });
  return datasetRows.map(({ input: qq }) => {
    const tags: string[] = [];
    if (qq.topicType) {
      tags.push(qq.topicType);
    }
    if (qq.questionType) {
      tags.push(qq.questionType);
    }
    if (qq.tags) {
      tags.push(...qq.tags);
    }
    return {
      input: {
        questionText: qq.questionText,
        answers: qq.answers,
        questionType: qq.questionType,
      },
      tags: tags.length > 0 ? tags : undefined,
      expected: quizQuestionToHelmAnswer(qq),
      metadata: {
        contentTitle: qq.contentTitle,
        explanation: qq.explanation,
        title: qq.title,
      },
    } satisfies QuizQuestionEvalCase;
  });
}
