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

const radiantHostedModels: { label: string; radiantModelName: string }[] = [
  {
    label: "gpt-4",
    radiantModelName: "gpt-4-eai-experimentation",
  },
  {
    label: "gpt-4o",
    radiantModelName: "gpt-4o-eai-experimentation",
  },
  {
    label: "mistral-large",
    radiantModelName: "Mistral-large-eai",
  },
  {
    label: "gpt-35-turbo",
    radiantModelName: "gpt-35-turbo-eai-experimentation",
  },
];

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
