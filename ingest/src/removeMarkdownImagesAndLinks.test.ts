import { removeMarkdownImagesAndLinks } from "./removeMarkdownImagesAndLinks";

describe("removeMarkdownImagesAndLinks()", () => {
  it("should remove images", () => {
    const content = `![metadata](foo.png)`;
    const cleanedContent = removeMarkdownImagesAndLinks(content);
    expect(cleanedContent).toBe("");
  });
  it("should remove links", () => {
    const content = `[link text](https://example.com)`;
    const cleanedContent = removeMarkdownImagesAndLinks(content);
    expect(cleanedContent).toBe("link text");
  });
  it("should remove unnecessary new lines", () => {
    const content = `# Title


Some text. [some link](https://example.com)

![image](foo.png)


`;
    const cleanedContent = removeMarkdownImagesAndLinks(content);
    const expected = `# Title

Some text. some link

`;
    expect(cleanedContent).toBe(expected);
  });
});
