import { TestCase } from "./generateChatTranscript";
import fs from "fs";
import path from "path";
import yaml from "yaml";

export function getTestCasesFromYaml(fileName: string) {
  const yamlFile = fs.readFileSync(path.join(__dirname, fileName), "utf8");
  const testCases = yaml.parse(yamlFile);
  return testCases as TestCase[];
}
