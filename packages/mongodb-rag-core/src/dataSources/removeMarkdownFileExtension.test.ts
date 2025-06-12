import { removeMarkdownFileExtension } from "./removeMarkdownFileExtension";

describe("removeMarkdownFileExtension", () => {
  it("should remove .md extension from a URL", () => {
    const url = "https://example.com/page.md";
    expect(removeMarkdownFileExtension(url)).toBe("https://example.com/page");
  });

  it("should remove .markdown extension from a URL", () => {
    const url = "https://example.com/another/page.markdown";
    expect(removeMarkdownFileExtension(url)).toBe(
      "https://example.com/another/page"
    );
  });

  it("should not change a URL without a markdown extension", () => {
    const url = "https://example.com/page.html";
    expect(removeMarkdownFileExtension(url)).toBe(
      "https://example.com/page.html"
    );
  });

  it("should return an empty string if an empty string is provided", () => {
    const url = "";
    expect(removeMarkdownFileExtension(url)).toBe("");
  });
});
