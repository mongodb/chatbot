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
import {
  ChatLlmEvalConfig,
  makeChatLlmQuizEvalCommands,
} from "./makeChatLlmQuizEvalCommands";
import { makeRadiantChatLlm } from "./makeRadiantChatLlm";
import { radiantModels } from "./radiantModels";

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

  // TODO: add few shot examples
  const quizQuestionExamples = [] satisfies QuizQuestionTestCaseData[];
  const modelsConfig = await Promise.all(
    radiantModels.map(async (model) => {
      return {
        name: model.label,
        generatorConfig: {
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
      } satisfies ChatLlmEvalConfig;
    })
  );

  const evalConfig = {
    metadataStore: makeMongoDbCommandMetadataStore(storeDbOptions),
    generatedDataStore: makeMongoDbGeneratedDataStore(storeDbOptions),
    evaluationStore: makeMongoDbEvaluationStore(storeDbOptions),
    reportStore: makeMongoDbReportStore(storeDbOptions),

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
