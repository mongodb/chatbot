import "dotenv/config";
import { getConversationsEvalCasesFromYaml } from "mongodb-rag-core/eval";
import {
  JUDGE_EMBEDDING_MODEL,
  JUDGE_LLM,
  OPENAI_API_KEY,
  OPENAI_API_VERSION,
  OPENAI_ENDPOINT,
} from "./eval/evalHelpers";
import fs from "fs";
import path from "path";
import { makeConversationEval } from "./eval/ConversationEval";
import { systemPrompt } from "./systemPrompt";
import { config, conversations } from "./config";
console.log("api key", console.log(process.env.BRAINTRUST_API_KEY));
console.log(
  JUDGE_EMBEDDING_MODEL,
  JUDGE_LLM,
  OPENAI_API_KEY,
  OPENAI_API_VERSION,
  OPENAI_ENDPOINT
);
async function conversationEval() {
  // Get all the conversation eval cases from YAML
  const basePath = path.resolve(__dirname, "..", "evalCases");
  const conversationEvalCases = getConversationsEvalCasesFromYaml(
    fs.readFileSync(path.resolve(basePath, "full_package.yml"), "utf8")
  );

  const generateConfig = {
    systemPrompt,
    llm: config.conversationsRouterConfig.llm,
    llmNotWorkingMessage: conversations.conversationConstants.LLM_NOT_WORKING,
    noRelevantContentMessage:
      conversations.conversationConstants.NO_RELEVANT_CONTENT,
    filterPreviousMessages:
      config.conversationsRouterConfig.filterPreviousMessages,
    generateUserPrompt: config.conversationsRouterConfig.generateUserPrompt,
  };

  // Run the conversation eval
  makeConversationEval({
    projectName: "mongodb-chatbot-conversations",
    experimentName: "mongodb-chatbot-full",
    metadata: {
      description:
        "Evaluates how well the MongoDB AI Chatbot RAG pipeline works",
    },
    maxConcurrency: 2,
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
    generate: generateConfig,
  });
}
conversationEval();
