import { assertEnvVars, ObjectId } from "mongodb-rag-core";
import "dotenv/config";
import { makeMongoDbGeneratedDataStore } from "mongodb-chatbot-evaluation";
import { evaluateQuizQuestions } from "./evaluateQuizQuestions";

const runs = [
  {
    model: "gpt-35",
    generatedDataRunId: new Object("66a2832f1b5f11cf652b9228").toString(),
  },
  {
    model: "gpt-4o",
    generatedDataRunId: new Object("66a2832f1b5f11cf652b922a").toString(),
  },
  {
    model: "gpt-4",
    generatedDataRunId: new Object("66a2832f1b5f11cf652b9229").toString(),
  },
  {
    model: "llama-3-70b",
    generatedDataRunId: new Object("66a2832f1b5f11cf652b922b").toString(),
  },
  {
    model: "claude-3-haiku",
    generatedDataRunId: new Object("66a2832f1b5f11cf652b922d").toString(),
  },
  {
    model: "claude-3-sonnet",
    generatedDataRunId: new Object("66a2832f1b5f11cf652b922e").toString(),
  },
  {
    model: "claude-35-sonnet",
    generatedDataRunId: new Object("66a2832f1b5f11cf652b922c").toString(),
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
