import fs from 'fs';
import path from 'path';
import yaml from "yaml";
import { getConversationEvalCasesFromCSV } from "mongodb-rag-core/eval"

const SRC_ROOT = path.resolve(__dirname, "../");

async function main() {
  const csvFilePath = path.resolve(
    SRC_ROOT,
    "../eval/bin/dotcomChatbotEvaluationQuestions.csv"
  );
  const evalCases = await getConversationEvalCasesFromCSV(csvFilePath)
  const yamlFilePath = path.resolve(
    SRC_ROOT,
    "../../evalCases/dotcom_chatbot_evaluation_questions.yml"
  );
  const yamlContent = yaml.stringify(evalCases)
  fs.writeFileSync(yamlFilePath, yamlContent, 'utf8')
}

main()