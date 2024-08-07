import { assertEnvVars, ObjectId } from "mongodb-rag-core";
import "dotenv/config";
import { strict as assert } from "assert";
import {
  ConversationGeneratedData,
  makeMongoDbGeneratedDataStore,
  SomeGeneratedData,
} from "mongodb-chatbot-evaluation";
import { evaluateRagConversationsReferenceFree } from "./evaluateRagConversationsReferenceFree";

const runs = [
  {
    model: "gpt-35",
    generatedDataRunId: new Object("669019be0aae97ffdafcd0ff").toString(),
  },
  {
    model: "gpt-4o",
    generatedDataRunId: new Object("66901df714b4b4953729c844").toString(),
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
  const modelName = "gpt-4o-mini";
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
    console.log("starting run", run);
    await evaluateRagConversationsReferenceFree({
      conversationGeneratedData,
      evaluatorConfig: {
        apiKey: OPENAI_OPENAI_API_KEY,
        modelName,
      },
      experimentName: `rag-conversations-${run.model}`,
      metadata: run,
      maxConcurrency: 3,
    });
  }
  await generatedDataStore.close();
  console.log("finished up");
}

function checkConversationGeneratedData(generatedData?: SomeGeneratedData) {
  assert(generatedData?.type === "conversation", "Must be conversation data");
  return generatedData as ConversationGeneratedData;
}
main();
