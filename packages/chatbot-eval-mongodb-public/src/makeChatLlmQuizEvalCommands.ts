import {
  EvalConfig,
  evaluateQuizQuestionAnswerCorrectness,
  makeGenerateLlmQuizQuestionAnswer,
  MakeGenerateQuizDataParams,
  QuizQuestionTestCase,
  reportStatsForBinaryEvalRun,
} from "mongodb-chatbot-evaluation";
export interface ChatLlmEvalConfig {
  generatorConfig: MakeGenerateQuizDataParams;
  name: string;
}

interface MakeChatLlmQuizEvalCommandsParams {
  configs: ChatLlmEvalConfig[];
  quizQuestions: QuizQuestionTestCase[];
}

export function makeChatLlmQuizEvalCommands({
  configs,
  quizQuestions,
}: MakeChatLlmQuizEvalCommandsParams) {
  const generateConfig = configs
    .map((chatLlmEvalConfig) => {
      const { generatorConfig, name } = chatLlmEvalConfig;
      return {
        [name]: {
          generator: makeGenerateLlmQuizQuestionAnswer(generatorConfig),
          testCases: quizQuestions,
          type: "quiz",
        },
      };
    })
    .reduce(
      (acc, val) => ({ ...acc, ...val }),
      {}
    ) satisfies EvalConfig["commands"]["generate"];

  const evaluationConfig = {
    quizQuestionCorrect: {
      evaluator: evaluateQuizQuestionAnswerCorrectness,
    },
  } satisfies EvalConfig["commands"]["evaluate"];

  const reportConfig = configs
    .map((chatLlmEvalConfig) => {
      const { name } = chatLlmEvalConfig;
      return {
        [name]: {
          reporter: reportStatsForBinaryEvalRun,
        },
      };
    })
    .reduce(
      (acc, val) => ({ ...acc, ...val }),
      {}
    ) satisfies EvalConfig["commands"]["report"];

  const commands = {
    generate: generateConfig,
    evaluate: evaluationConfig,
    report: reportConfig,
  } satisfies EvalConfig["commands"];
  return commands;
}
