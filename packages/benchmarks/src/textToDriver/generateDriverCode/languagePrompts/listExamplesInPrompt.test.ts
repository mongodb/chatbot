import { listExamplesInPrompt } from "./listExamplesInPrompt";

describe("listExamplesInPrompt", () => {
  it("formats an empty list correctly", () => {
    const result = listExamplesInPrompt([]);
    expect(result).toBe("");
  });

  it("formats a single item list correctly", () => {
    const result = listExamplesInPrompt(["Test item"]);
    expect(result).toBe("1. Test item");
  });

  it("formats multiple items correctly", () => {
    const result = listExamplesInPrompt(["Item one", "Item two", "Item three"]);
    expect(result).toBe("1. Item one\n2. Item two\n3. Item three");
  });
});
