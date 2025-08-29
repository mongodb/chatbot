import { getConversationsEvalCasesFromYaml } from "mongodb-rag-core/eval";
import {
  JUDGE_EMBEDDING_MODEL,
  JUDGE_LLM,
  OPENAI_API_KEY,
  OPENAI_API_VERSION,
  OPENAI_ENDPOINT,
  BRAINTRUST_API_KEY,
  BRAINTRUST_ENDPOINT,
} from "./eval/evalHelpers";
import fs from "fs";
import path from "path";
import { makeConversationEval } from "./eval/ConversationEval";
import { getConversationEvalCasesFromBraintrust } from "mongodb-rag-core/eval";
import { closeDbConnections, makeGenerateResponse } from "./config";
import { strict as assert } from "assert";

export const CONVERSATION_EVAL_PROJECT_NAME = "mongodb-chatbot-conversations";

async function conversationEval() {
  // Get all the conversation eval cases from YAML
  const basePath = path.resolve(__dirname, "..", "evalCases");
  const miscCases = await getConversationsEvalCasesFromYaml(
    fs.readFileSync(path.resolve(basePath, "conversations.yml"), "utf8"),
  );
  const faqCases = await getConversationsEvalCasesFromYaml(
    fs.readFileSync(path.resolve(basePath, "faq_conversations.yml"), "utf8"),
  );
  const dotComCases = await getConversationsEvalCasesFromYaml(
    fs.readFileSync(
      path.resolve(basePath, "dotcom_chatbot_evaluation_questions.yml"),
      "utf8",
    ),
  );
  const voyageCases = await getConversationEvalCasesFromBraintrust({
    projectName: CONVERSATION_EVAL_PROJECT_NAME,
    datasetName: "voyage-ai",
  });
  assert(voyageCases.length > 0);
  const systemPromptCases = await getConversationsEvalCasesFromYaml(
    fs.readFileSync(
      path.resolve(basePath, "system_prompt_conversations.yml"),
      "utf8",
    ),
  );
  const internalToolCases = await getConversationsEvalCasesFromYaml(
    fs.readFileSync(
      path.resolve(basePath, "internal_tools_conversations.yml"),
      "utf8",
    ),
  );
  const customToolCases = await getConversationsEvalCasesFromYaml(
    fs.readFileSync(
      path.resolve(basePath, "custom_tool_conversations.yml"),
      "utf8",
    ),
  );

  const conversationEvalCases = [
    ...miscCases,
    ...faqCases,
    ...dotComCases,
    ...voyageCases,
    ...systemPromptCases,
    ...internalToolCases,
    ...customToolCases,
  ];

  try {
    // Run the conversation eval
    const evalResult = await makeConversationEval({
      projectName: CONVERSATION_EVAL_PROJECT_NAME,
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
        braintrustProxy: {
          apiKey: BRAINTRUST_API_KEY,
          endpoint: BRAINTRUST_ENDPOINT,
        },
      },
      generateResponse: makeGenerateResponse(),
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
