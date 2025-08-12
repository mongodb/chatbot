import "dotenv/config";
import { getConversationsEvalCasesFromYaml } from "mongodb-rag-core/eval";
import {
  JUDGE_EMBEDDING_MODEL,
  JUDGE_LLM,
  OPENAI_API_KEY,
  OPENAI_API_VERSION,
  OPENAI_ENDPOINT,
  BRAINTRUST_API_KEY,
  BRAINTRUST_ENDPOINT,
} from "../evalHelpers";
import fs from "fs";
import path from "path";
import { makeConversationEval } from "../ConversationEval";
import { makeGenerateResponse } from "../../config";

async function conversationEval() {
  // Get all the conversation eval cases from YAML
  const basePath = path.resolve(__dirname, "..", "..", "..", "evalCases");
  const conversationEvalCases = getConversationsEvalCasesFromYaml(
    fs.readFileSync(path.resolve(basePath, "all_scorers.yml"), "utf8")
  );

  // Run the conversation eval
  makeConversationEval({
    projectName: "mongodb-chatbot-conversations",
    experimentName: "mongodb-chatbot-full",
    metadata: {
      description: "Smoke test for different scorers",
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
      braintrustProxy: {
        apiKey: BRAINTRUST_API_KEY,
        endpoint: BRAINTRUST_ENDPOINT,
      },
    },
    generateResponse: makeGenerateResponse(),
  });
}
conversationEval();
