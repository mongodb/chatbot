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
import { makeGenerateResponse } from "../../config";

async function conversationEval() {
  // Get dotcom question set eval cases from YAML
  const basePath = path.resolve(__dirname, "..", "..", "..", "evalCases");
  const conversationEvalCases = getConversationsEvalCasesFromYaml(
    fs.readFileSync(
      path.resolve(basePath, "uni_skills_evaluation_questions.yml"),
      "utf8"
    )
  );

  // Run the conversation eval
  makeConversationEval({
    projectName: "mongodb-chatbot-conversations",
    experimentName: "mongodb-chatbot-skills-questions",
    metadata: {
      description: "Skills question set evals",
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
    generateResponse: makeGenerateResponse(),
  });
}
conversationEval();
