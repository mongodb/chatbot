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
  it("should remove same-source images and links", () => {
    const content = `[\`BsonValue\`](/mongo-java-driver/4.10/apidocs/mongo-scala-driver/org/mongodb/scala/bson/index.html)`;
    const cleanedContent = removeMarkdownImagesAndLinks(content);
    expect(cleanedContent).toBe("`BsonValue`");
  });

  it("should remove links across multiple lines", () => {
    const content = `[link text](https://example.com
)

![image 
metadata](foo.png)`;
    const cleanedContent = removeMarkdownImagesAndLinks(content);
    expect(cleanedContent).toBe("link text\n\n");
  });
});
