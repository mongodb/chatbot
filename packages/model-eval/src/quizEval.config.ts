import {
  EvalConfig,
  QuizQuestionTestCaseData,
  QuizQuestionTestCase,
} from "mongodb-chatbot-evaluation";

import "dotenv/config";
import { MongoClient, assertEnvVars } from "mongodb-rag-core";
import { envVars } from "./envVars";
import {
  ChatLlmQuizEvalConfig,
  makeChatLlmQuizEvalCommands,
} from "./makeChatLlmEvalCommands";
import { makeRadiantChatLlm } from "./makeRadiantChatLlm";
import { radiantModels } from "./radiantModels";
import { makeBaseConfig } from "./baseConfig";

// Few-shot examples
const quizQuestionExamples = [
  {
    questionText:
      "Which of the following are valid data types in MongoDB? (Select all that apply.)",
    answers: [
      {
        label: "A",
        answer: "String",
        isCorrect: true,
      },
      {
        label: "B",
        answer: "Integer",
        isCorrect: true,
      },
      {
        label: "C",
        answer: "Boolean",
        isCorrect: true,
      },
      {
        label: "D",
        answer: "Money",
        isCorrect: false,
      },
    ],
  },
  {
    questionText:
      "What type of data structure does MongoDB use to store data? (Select one.)",
    answers: [
      {
        label: "A",
        answer: "Tuples",
        isCorrect: false,
      },
      {
        label: "B",
        answer: "Tables",
        isCorrect: false,
      },
      {
        label: "C",
        answer: "Documents",
        isCorrect: true,
      },
      {
        label: "D",
        answer: "Rows",
        isCorrect: false,
      },
    ],
  },
] satisfies QuizQuestionTestCaseData[];

export default async () => {
  const {
    MONGODB_DATABASE_NAME,
    MONGODB_CONNECTION_URI,
    MONGODB_QUIZ_QUESTIONS_DATABASE_NAME,
    MONGODB_QUIZ_QUESTIONS_CONNECTION_URI,
    MONGODB_QUIZ_QUESTIONS_COLLECTION_NAME,
    RADIANT_API_KEY,
    RADIANT_ENDPOINT,
    MONGODB_AUTH_COOKIE,
  } = assertEnvVars(envVars);

  const storeDbOptions = {
    connectionUri: MONGODB_CONNECTION_URI,
    databaseName: MONGODB_DATABASE_NAME,
  };

  const mongodb = new MongoClient(MONGODB_CONNECTION_URI);
  await mongodb.connect();

  const quizMongodb = new MongoClient(MONGODB_QUIZ_QUESTIONS_CONNECTION_URI);
  await quizMongodb.connect();
  const quizQuestions = await quizMongodb
    .db(MONGODB_QUIZ_QUESTIONS_DATABASE_NAME)
    .collection<QuizQuestionTestCaseData>(
      MONGODB_QUIZ_QUESTIONS_COLLECTION_NAME
    )
    .find()
    .toArray();

  const quizQuestionTestCases = quizQuestions.map((quizQuestion) => ({
    name: "quiz",
    data: quizQuestion,
  })) satisfies QuizQuestionTestCase[];

  const modelsConfig = await Promise.all(
    radiantModels.map(async (model) => {
      return {
        name: model.label,
        generatorConfig: {
          modelName: model.label,
          subject: "MongoDB",
          quizQuestionExamples,
          chatLlm: await makeRadiantChatLlm({
            apiKey: RADIANT_API_KEY,
            endpoint: RADIANT_ENDPOINT,
            deployment: model.radiantModelDeployment,
            mongoDbAuthCookie: MONGODB_AUTH_COOKIE,
            lmmConfigOptions: {
              temperature: 0,
            },
          }),
        },
      } satisfies ChatLlmQuizEvalConfig;
    })
  );

  const evalConfig = {
    ...makeBaseConfig(MONGODB_CONNECTION_URI, MONGODB_DATABASE_NAME),

    commands: makeChatLlmQuizEvalCommands({
      configs: modelsConfig,
      quizQuestions: quizQuestionTestCases,
    }),
    async afterAll() {
      await mongodb.close();
      await quizMongodb.close();
    },
  } satisfies EvalConfig;
  return evalConfig;
};
