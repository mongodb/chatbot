import {
  EvalConfig,
  makeMongoDbCommandMetadataStore,
  makeMongoDbGeneratedDataStore,
  makeMongoDbEvaluationStore,
  makeMongoDbReportStore,
  QuizQuestionTestCaseData,
  QuizQuestionTestCase,
} from "mongodb-chatbot-evaluation";

import "dotenv/config";
import { MongoClient, assertEnvVars } from "mongodb-rag-core";
import { envVars } from "./envVars";
import { makeChatLlmQuizEvalCommands } from "./makeChatLlmQuizEvalCommands";

const quizEnvVars = {
  MONGODB_QUIZ_QUESTIONS_DATABASE_NAME: "",
  MONGODB_QUIZ_QUESTIONS_CONNECTION_URI: "",
  MONGODB_QUIZ_QUESTIONS_COLLECTION_NAME: "",
} as const;

export default async () => {
  const {
    MONGODB_DATABASE_NAME,
    MONGODB_CONNECTION_URI,
    MONGODB_QUIZ_QUESTIONS_DATABASE_NAME,
    MONGODB_QUIZ_QUESTIONS_CONNECTION_URI,
    MONGODB_QUIZ_QUESTIONS_COLLECTION_NAME,
  } = assertEnvVars({ ...envVars, ...quizEnvVars });

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

  const evalConfig = {
    metadataStore: makeMongoDbCommandMetadataStore(storeDbOptions),
    generatedDataStore: makeMongoDbGeneratedDataStore(storeDbOptions),
    evaluationStore: makeMongoDbEvaluationStore(storeDbOptions),
    reportStore: makeMongoDbReportStore(storeDbOptions),

    commands: makeChatLlmQuizEvalCommands({
      // TODO: config
      configs: [],
      quizQuestions: quizQuestionTestCases,
    }),
    async afterAll() {
      await mongodb.close();
      await quizMongodb.close();
    },
  } satisfies EvalConfig;
  return evalConfig;
};
