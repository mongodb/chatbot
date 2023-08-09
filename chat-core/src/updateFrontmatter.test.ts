import { updateFrontmatter } from "./updateFrontmatter";
describe("updateFrontmatter()", () => {
  test("should add frontmatter", () => {
    const text = "foo";
    const metadata = { bar: "baz", a: ["b", "c"] };
    const output = updateFrontmatter(text, metadata);
    const expected = `---
bar: baz
a:
  - b
  - c
---

foo`;
    expect(output).toBe(expected);
  });
  test("should update frontmatter", () => {
    const text = `---
bar: baz
lorem: ipsum
---

foo`;
    const metadata = { bar: "qux", a: ["b", "c"] };
    const output = updateFrontmatter(text, metadata);
    const expected = `---
bar: qux
lorem: ipsum
a:
  - b
  - c
---

foo`;
    expect(output).toBe(expected);
  });
});
