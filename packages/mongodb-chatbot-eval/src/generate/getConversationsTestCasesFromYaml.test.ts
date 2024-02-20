import { getConversationsTestCasesFromYaml } from "./getConversationsTestCasesFromYaml";
import path from "path";
import fs from "fs";

const testDataBasePath = path.resolve(__dirname, "..", "..", "testData");

describe("getConversationsTestCasesFromYaml", () => {
  it("should parse yaml to object", () => {
    const yamlData = fs.readFileSync(
      path.join(testDataBasePath, "conversation_tests.yaml"),
      "utf8"
    );
    const testCases = getConversationsTestCasesFromYaml(yamlData);
    // If the above doesn't throw and the array has elements, we're good
    expect(testCases.length).toBeGreaterThan(0);
  });
  it("should throw if yaml is not correctly formatted", () => {
    const yamlData = fs.readFileSync(
      path.join(testDataBasePath, "not_conversation_test.yaml"),
      "utf8"
    );
    expect(() => getConversationsTestCasesFromYaml(yamlData)).toThrow();

    const notEvenYaml = `{foo: "bar"}`;
    expect(() => getConversationsTestCasesFromYaml(notEvenYaml)).toThrow();
  });
});
