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
import { closeDbConnections, config } from "./config";

async function conversationEval() {
  // Get all the conversation eval cases from YAML
  const basePath = path.resolve(__dirname, "..", "evalCases");
  const miscCases = getConversationsEvalCasesFromYaml(
    fs.readFileSync(path.resolve(basePath, "conversations.yml"), "utf8")
  );
  const faqCases = getConversationsEvalCasesFromYaml(
    fs.readFileSync(path.resolve(basePath, "faq_conversations.yml"), "utf8")
  );
  const dotComCases = await getConversationsEvalCasesFromYaml(
    fs.readFileSync(
      path.resolve(basePath, "dotcom_chatbot_evaluation_questions.yml"),
      "utf8"
    )
  );

  const conversationEvalCases = [...miscCases, ...faqCases, ...dotComCases];

  try {
    // Run the conversation eval
    const evalResult = await makeConversationEval({
      projectName: "mongodb-chatbot-conversations",
      experimentName: "mongodb-chatbot-latest",
      metadata: {
        description:
          "Evaluates how well the MongoDB AI Chatbot RAG pipeline works",
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
      generateResponse: config.conversationsRouterConfig.generateResponse,
    });
    console.log("Eval result", evalResult.summary);
  } catch (error) {
    console.error(error);
  } finally {
    await closeDbConnections();
    console.log("Closed DB connections");
  }
}
conversationEval();
