import fs from "fs";
import path from "path";
import yaml from "yaml";
import { TestCase } from "./TestCase";

export function getTestCasesFromYaml(fileName: string) {
  const yamlFile = fs.readFileSync(path.join(__dirname, fileName), "utf8");
  const testCases = yaml.parse(yamlFile);
  return testCases as TestCase[];
}
