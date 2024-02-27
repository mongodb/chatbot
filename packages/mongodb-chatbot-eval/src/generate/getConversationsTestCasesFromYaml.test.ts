import { getConversationsTestCasesFromYaml } from "./getConversationsTestCasesFromYaml";
import { improperlyFormattedTestCases, testCases } from "../test/mockTestCases";

describe("getConversationsTestCasesFromYaml", () => {
  it("should parse yaml to object", () => {
    // If the above doesn't throw and the array has elements, we're good
    expect(testCases.length).toBeGreaterThan(0);
  });
  it("should throw if yaml is not correctly formatted", () => {
    expect(() =>
      getConversationsTestCasesFromYaml(improperlyFormattedTestCases)
    ).toThrow();

    const notEvenYaml = "thisIsInvalidYaml { answer: 42 }"
    expect(() => getConversationsTestCasesFromYaml(notEvenYaml)).toThrow();
  });
});
