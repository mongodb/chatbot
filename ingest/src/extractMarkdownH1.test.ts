import { extractMarkdownH1 } from "./extractMarkdownH1";

describe("extractMarkdownH1()", () => {
  it("extracts the H1 from a markdown page", () => {
    const page = `# My Page Title

Some content

## H2`;
    const h1 = extractMarkdownH1(page);
    expect(h1).toEqual("My Page Title");
  });
  it("returns null if no H1 exists", () => {
    const page = `## H2

Some content`;
    const h1 = extractMarkdownH1(page);
    expect(h1).toBeUndefined();
  });
  it("finds H1 not at top of page", () => {
    const page = `## H2

# My Page Title

Some content`;
    const h1 = extractMarkdownH1(page);
    expect(h1).toEqual("My Page Title");
  });
});
