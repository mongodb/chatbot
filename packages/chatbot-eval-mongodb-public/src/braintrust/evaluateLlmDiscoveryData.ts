import { assertEnvVars, ObjectId } from "mongodb-rag-core";
import "dotenv/config";
import { makeMongoDbGeneratedDataStore } from "mongodb-chatbot-evaluation";
import { checkConversationGeneratedData } from "./utils";
import { evaluateRegexMatch } from "./evaluateRegexMatch";

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
  const { MONGODB_CONNECTION_URI, MONGODB_DATABASE_NAME } = assertEnvVars({
    MONGODB_DATABASE_NAME: "",
    MONGODB_CONNECTION_URI: "",
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
      projectName: "mdb-test",
      conversationGeneratedData,
      regExp: /mongodb/i,
      description: "Evaluates whether the output mentions MongoDB",
      experimentName: `llm-discovery-${run.model}`,
      metadata: run,
    });
  }
  await generatedDataStore.close();
}

main();
