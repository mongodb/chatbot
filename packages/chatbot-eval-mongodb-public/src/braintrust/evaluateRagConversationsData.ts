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
  // {
  //   model: "gpt-35",
  //   generatedDataRunId: new Object("669019be0aae97ffdafcd0ff").toString(),
  // },
  // {
  //   model: "gpt-4o",
  //   generatedDataRunId: new Object("66901df714b4b4953729c844").toString(),
  // },
  // {
  //   model: "gpt-4o-mini",
  //   generatedDataRunId: new Object("66c35ec36e955a072a6f8784").toString(),
  // },
  //   {
  //     model: "gpt-35-preprocessor-gpt4o-mini-responder",
  //     generatedDataRunId: new Object("66c37e6c97b47998dd59e87e").toString(),
  //     description: `Uses GPT-3.5 for pre-processsing tasks: metadata extraction, user input guardrail, and query rewriting.
  // Uses GPT-4o mini for the main responder.`,
  //   },
  {
    model: "gpt-35-preprocessor-gpt4o-responder",
    generatedDataRunId: new Object("66cc95022525d293a0ef4cc3").toString(),
    description: `Uses GPT-3.5 for pre-processsing tasks: metadata extraction, user input guardrail, and query rewriting.
Uses GPT-4o for the main responder. Also updated system prompt to include fewer non-answers.`,
  },
];
async function main() {
  const {
    MONGODB_CONNECTION_URI,
    MONGODB_DATABASE_NAME,
    // NOTE: This is using an OpenAI key from OpenAI directly
    // (not Azure OpenAI).
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
    await evaluateRagConversationsReferenceFree({
      projectName: "mongodb-chatbot-conversations",
      conversationGeneratedData,
      evaluatorConfig: {
        apiKey: OPENAI_OPENAI_API_KEY,
        modelName,
      },
      description: run.description,
      experimentName: `${run.model}-${Date.now()}`,
      metadata: run,
    });
  }
  await generatedDataStore.close();
}

function checkConversationGeneratedData(generatedData?: SomeGeneratedData) {
  assert(generatedData?.type === "conversation", "Must be conversation data");
  return generatedData as ConversationGeneratedData;
}
main();
