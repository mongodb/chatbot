import "dotenv/config";
import fs from "fs";
import path from "path";
import { ConversationEvalCase } from "mongodb-rag-core/eval";
import {
  JUDGE_EMBEDDING_MODEL,
  JUDGE_LLM,
  OPENAI_API_KEY,
  OPENAI_API_VERSION,
  OPENAI_ENDPOINT,
} from "../evalHelpers";
import { makeConversationEval } from "../ConversationEval";
import { getConversationsEvalCasesFromYaml } from "mongodb-rag-core/eval";
import { closeDbConnections, makeGenerateResponse } from "../../config";

async function conversationEval() {
  const basePath = path.resolve(__dirname, "..", "..", "..", "evalCases");
  const conversationEvalCases: ConversationEvalCase[] =
    getConversationsEvalCasesFromYaml(
      fs.readFileSync(
        path.resolve(basePath, "system_prompt_conversations.yml"),
        "utf8"
      )
    );

  // Run the conversation eval
  await makeConversationEval({
    projectName: "mongodb-chatbot-conversations",
    experimentName: "mongodb-chatbot-custom-system-prompt",
    metadata: {
      description: "Custom system prompt evals",
    },
    maxConcurrency: 10,
    conversationEvalCases,
    judgeModelConfig: {
      model: JUDGE_LLM,
      embeddingModel: JUDGE_EMBEDDING_MODEL,
      azureOpenAi: {
        apiKey: OPENAI_API_KEY,
        endpoint: OPENAI_ENDPOINT,
        apiVersion: OPENAI_API_VERSION,
      },
    },
    generateResponse: makeGenerateResponse(),
  });
}
conversationEval().then(() => {
  console.log("Conversation eval complete");
  try {
    closeDbConnections();
  } catch (error) {
    console.error("Error closing database connections");
    console.error(error);
  }
});
