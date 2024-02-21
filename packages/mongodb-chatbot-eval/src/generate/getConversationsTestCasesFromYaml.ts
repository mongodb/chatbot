import {
  ConversationTestCase,
  ConversationTestCaseDataSchema,
} from "./TestCase";
import yaml from "yaml";

/**
  Get conversation test cases from YAML file.
  Throws if the YAML is not correctly formatted.

 */
export function getConversationsTestCasesFromYaml(
  yamlData: string
): ConversationTestCase[] {
  const yamlTestCases = yaml.parse(yamlData) as unknown[];
  const testCases = yamlTestCases.map(
    (tc) =>
      ({
        name: "conversation",
        data: ConversationTestCaseDataSchema.parse(tc),
      } satisfies ConversationTestCase)
  );
  return testCases;
}
