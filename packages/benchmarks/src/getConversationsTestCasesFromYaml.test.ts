import { getConversationsTestCasesFromYaml } from "./getConversationsTestCasesFromYaml";

describe("getConversationsTestCasesFromYaml", () => {
  it("should parse yaml to object", () => {
    expect(
      getConversationsTestCasesFromYaml("TODO: properly formatted test cases")
    ).toBeGreaterThan(0);
  });
  it("should throw if yaml is not correctly formatted", () => {
    expect(() =>
      getConversationsTestCasesFromYaml("TODO: improperlyFormattedTestCases")
    ).toThrow();

    const notEvenYaml = "thisIsInvalidYaml { answer: 42 }";
    expect(() => getConversationsTestCasesFromYaml(notEvenYaml)).toThrow();
  });
});
