import "dotenv/config";
import { getConversationsEvalCasesFromYaml } from "mongodb-rag-core/eval";
import {
  JUDGE_EMBEDDING_MODEL,
  JUDGE_LLM,
  OPENAI_API_KEY,
  OPENAI_API_VERSION,
  OPENAI_ENDPOINT,
} from "../evalHelpers";
import fs from "fs";
import path from "path";
import { makeConversationEval } from "../ConversationEval";
import { systemPrompt } from "../../systemPrompt";
import { config, conversations } from "../../config";

async function conversationEval() {
  // Get ONLY architecture center conversations
  const basePath = path.resolve(__dirname, "..", "..", "..", "evalCases");
  const conversationEvalCases = getConversationsEvalCasesFromYaml(
    fs.readFileSync(path.resolve(basePath, "conversations.yml"), "utf8")
  ).filter((c) => c.tags?.includes("atlas-architecture"));

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
    experimentName: "mongodb-chatbot-architecture",
    metadata: {
      description: "Architecture center ingest evals",
    },
    maxConcurrency: 5,
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
