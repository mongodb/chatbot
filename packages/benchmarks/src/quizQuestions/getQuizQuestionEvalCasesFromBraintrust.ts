import { initDataset } from "braintrust";
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

export async function getQuizQuestionEvalCasesFromBraintrust({
  projectName,
  datasetName,
}: GetQuizQuestionEvalCasesFromBraintrustParams): Promise<
  QuizQuestionEvalCase[]
> {
  const dataset = await initDataset({
    project: projectName,
    dataset: datasetName,
  });
  const quizQuestionData = (await dataset.fetchedData())
    .map((d) => QuizQuestionDatasetEntrySchema.parse(d).input)
    .map((qq) => {
      const tags: string[] = [];
      if (qq.topicType) {
        tags.push(qq.topicType);
      }
      if (qq.questionType) {
        tags.push(qq.questionType);
      }
      return {
        input: qq,
        tags: tags.length > 0 ? tags : undefined,
        expected: quizQuestionToHelmAnswer(qq),
      } satisfies QuizQuestionEvalCase;
    });
  return quizQuestionData;
}
