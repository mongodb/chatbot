import fs from "fs";
import path from "path";
import yaml from "yaml";
import { getConversationEvalCasesFromCSV } from "mongodb-rag-core/eval";

const SRC_ROOT = path.resolve(__dirname, "../");

async function main({
  csvFileName,
  yamlFileName,
}: {
  csvFileName: string;
  yamlFileName: string;
}): Promise<void> {
  const csvFilePath = path.resolve(SRC_ROOT, `../eval/bin/${csvFileName}.csv`);
  console.log(`Reading from: ${csvFilePath}`);
  const evalCases = await getConversationEvalCasesFromCSV(csvFilePath);
  const yamlFilePath = path.resolve(
    SRC_ROOT,
    `../../evalCases/${yamlFileName}.yml`
  );
  console.log(`Writing to: ${yamlFilePath}`);
  const yamlContent = yaml.stringify(evalCases);
  fs.writeFileSync(yamlFilePath, yamlContent, "utf8");
  console.log("YAML file written successfully");
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length !== 2) {
    console.error(
      "Usage: node generateEvalCasesYamlFromCSV.js <csvFileName> <yamlFileName> \nReceived args:",
      args
    );
    process.exit(1);
  }
  const [csvFileName, yamlFileName] = args;
  main({
    csvFileName,
    yamlFileName,
  }).catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
}
