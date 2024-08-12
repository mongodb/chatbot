import { assertEnvVars, ObjectId } from "mongodb-rag-core";
import "dotenv/config";
import { makeMongoDbGeneratedDataStore } from "mongodb-chatbot-evaluation";
import { evaluateRegexMatch } from "./evaluateRegexMatch";
import { checkConversationGeneratedData } from "../braintrust/utils";

const runs = [
  {
    model: "gpt-35",
    generatedDataRunId: new Object("6697d593e310cb2895dd98ab").toString(),
  },
  {
    model: "gpt-4o",
    generatedDataRunId: new Object("668bee7ef618eee7c5856151").toString(),
  },
];
async function main() {
  const {
    MONGODB_CONNECTION_URI,
    MONGODB_DATABASE_NAME,
    LANGFUSE_BASE_URL,
    LANGFUSE_SECRET_KEY,
    LANGFUSE_PUBLIC_KEY,
  } = assertEnvVars({
    MONGODB_DATABASE_NAME: "",
    MONGODB_CONNECTION_URI: "",
    LANGFUSE_SECRET_KEY: "",
    LANGFUSE_PUBLIC_KEY: "",
    LANGFUSE_BASE_URL: "",
  });
  const generatedDataStore = makeMongoDbGeneratedDataStore({
    connectionUri: MONGODB_CONNECTION_URI,
    databaseName: MONGODB_DATABASE_NAME,
  });
  for (const run of runs) {
    const generatedDataRunId = new ObjectId(run.generatedDataRunId);
    const genData =
      (await generatedDataStore.findByCommandRunId(generatedDataRunId)) ?? [];
    const conversationGeneratedData = genData.map((gd) =>
      checkConversationGeneratedData(gd)
    );
    await evaluateRegexMatch({
      conversationGeneratedData,
      regExp: /mongodb/i,
      description: "Evaluates whether the output mentions MongoDB",
      experimentName: `llm-discovery-${run.model}`,
      metadata: run,
      projectName: "mdb-test",
      baseUrl: LANGFUSE_BASE_URL,
      publicKey: LANGFUSE_PUBLIC_KEY,
      secretKey: LANGFUSE_SECRET_KEY,
    });
  }
  await generatedDataStore.close();
}

main();
