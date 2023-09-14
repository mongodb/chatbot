import { extractFrontMatter } from "./extractFrontMatter";
describe("extractFrontMatter()", () => {
  it("extracts standard yaml frontmatter from a markdown page", () => {
    const page = `---
foo: bar
---

baz`;
    const { metadata, body } = extractFrontMatter(page);
    expect(metadata).toEqual({ foo: "bar" });
    expect(body).toEqual("baz");
  });
  it("extracts toml frontmatter with '---' delimiters from a markdown page", () => {
    const page = `---
foo = "bar"
---

baz`;

    const { metadata, body } = extractFrontMatter(page, "toml");
    expect(metadata).toEqual({ foo: "bar" });
    expect(body).toEqual("baz");
  });
  it("extracts toml frontmatter with '+++' delimiters from a markdown page", () => {
    const page = `+++
foo = "bar"
+++

baz`;
    const { metadata, body } = extractFrontMatter(page, "toml", "+++");
    expect(metadata).toEqual({ foo: "bar" });
    expect(body).toEqual("baz");
  });
});
