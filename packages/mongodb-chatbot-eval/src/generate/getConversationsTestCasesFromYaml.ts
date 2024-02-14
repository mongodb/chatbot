import {
  ConversationTestCaseData,
  ConversationTestCaseDataSchema,
} from "./TestCase";
import yaml from "yaml";

/**
  Get conversation test cases from YAML file.
  Throws if the YAML is not correctly formatted.

 */
export function getConversationsTestCasesFromYaml(
  yamlData: string
): ConversationTestCaseData[] {
  const yamlTestCases = yaml.parse(yamlData) as unknown[];
  const testCases = yamlTestCases.map((tc) =>
    ConversationTestCaseDataSchema.parse(tc)
  ) satisfies ConversationTestCaseData[];
  return testCases;
}
