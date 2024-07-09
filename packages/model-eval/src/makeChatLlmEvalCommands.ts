import {
  ConversationTestCase,
  EvalConfig,
  evaluateQuizQuestionAnswerCorrectness,
  makeEvaluateConversationLastMessageIncludesRegex,
  makeGenerateLlmConversationData,
  makeGenerateLlmQuizQuestionAnswer,
  MakeGenerateQuizDataParams,
  QuizQuestionTestCase,
  reportStatsForBinaryEvalRun,
} from "mongodb-chatbot-evaluation";
import { ChatLlm } from "mongodb-chatbot-server";

export interface ChatLlmQuizEvalConfig {
  generatorConfig: MakeGenerateQuizDataParams;
  name: string;
}

interface MakeChatLlmQuizEvalCommandsParams {
  configs: ChatLlmQuizEvalConfig[];
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
interface MakeChatLlmConversationEvalCommandsParams {
  chatLlmConfigs: {
    chatLlm: ChatLlm;
    name: string;
  }[];
  testCases: ConversationTestCase[];
}

export function makeChatLlmConversationEvalCommands({
  chatLlmConfigs,
  testCases,
}: MakeChatLlmConversationEvalCommandsParams) {
  const generateConfig = chatLlmConfigs
    .map(({ name, chatLlm }) => {
      // Create a deep copy of the test cases so there's no concurrent mutation
      const testCasesDeepCopy = JSON.parse(
        JSON.stringify(testCases)
      ) as ConversationTestCase[];
      return {
        [`${name}_discovery_conversations`]: {
          generator: makeGenerateLlmConversationData({
            chatLlm,
            concurrency: 2,
          }),
          testCases: testCasesDeepCopy,
          type: "conversation",
        },
      };
    })
    .reduce(
      (acc, val) => ({ ...acc, ...val }),
      {}
    ) satisfies EvalConfig["commands"]["generate"];

  const evaluationConfig = {
    mentions_mongodb: {
      evaluator: makeEvaluateConversationLastMessageIncludesRegex({
        regex: /mongodb/i,
      }),
    },
  } satisfies EvalConfig["commands"]["evaluate"];

  const reportConfig = chatLlmConfigs
    .map(({ name }) => {
      return {
        [`${name}_discovery_conversations`]: {
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
