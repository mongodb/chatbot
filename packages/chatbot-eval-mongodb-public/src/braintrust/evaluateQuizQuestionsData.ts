import { assertEnvVars, ObjectId } from "mongodb-rag-core";
import "dotenv/config";
import { strict as assert } from "assert";
import {
  ConversationGeneratedData,
  makeMongoDbGeneratedDataStore,
  SomeGeneratedData,
} from "mongodb-chatbot-evaluation";
import { evaluateQuizQuestions } from "./evaluateQuizQuestions";

const runs = [
  {
    model: "gpt-35",
    generatedDataRunId: new Object("6684174d7db25ec3ea206f4e").toString(),
  },
  {
    model: "gpt-4o",
    generatedDataRunId: new Object("6684174d7db25ec3ea206f50").toString(),
  },
];
async function main() {
  const {
    MONGODB_CONNECTION_URI,
    MONGODB_DATABASE_NAME,
    OPENAI_OPENAI_API_KEY,
  } = assertEnvVars({
    MONGODB_DATABASE_NAME: "",
    MONGODB_CONNECTION_URI: "",
    OPENAI_OPENAI_API_KEY: "",
  });
  const generatedDataStore = makeMongoDbGeneratedDataStore({
    connectionUri: MONGODB_CONNECTION_URI,
    databaseName: MONGODB_DATABASE_NAME,
  });
  for (const run of runs) {
    const generatedDataRunId = new ObjectId(run.generatedDataRunId);
    const generatedData =
      (await generatedDataStore.findByCommandRunId(generatedDataRunId)) ?? [];

    await evaluateQuizQuestions({
      projectName: "mdb-test",
      description: "MongoDB University quiz question dataset",
      experimentName: `mdbu-quiz-${run.model}`,
      metadata: run,
      generatedData,
    });
  }
  await generatedDataStore.close();
}

main();
