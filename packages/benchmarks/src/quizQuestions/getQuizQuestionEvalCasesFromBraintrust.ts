import { initDataset } from "mongodb-rag-core/braintrust";
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
  return quizQuestionData;
}
