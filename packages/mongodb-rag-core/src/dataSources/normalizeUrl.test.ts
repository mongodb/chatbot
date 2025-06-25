import { normalizeUrl } from "./normalizeUrl";

describe("normalizeUrl", () => {
  it("should handle URLs with https:// domain", () => {
    expect(normalizeUrl("https://example.com")).toBe("example.com");
  });

  it("should handle URLs with https:// domain", () => {
    expect(normalizeUrl("https://example.com")).toBe("example.com");
  });

  it("should remove www prefix", () => {
    expect(normalizeUrl("www.example.com/path")).toBe("example.com/path");
  });

  it("should remove trailing slashes", () => {
    const url = "example.com/path/";
    expect(normalizeUrl(url)).toBe("example.com/path");
  });

  it("should convert scheme and host to lowercase", () => {
    expect(normalizeUrl("HTTP://EXAMPLE.COM/Path")).toBe(
      "http://example.com/Path"
    );
  });

  it("should handle URLs with a domain and a trailing slash", () => {
    expect(normalizeUrl("https://example.com/")).toBe("https://example.com");
  });

  it("should handle URLs with https://www. prefix", () => {
    expect(normalizeUrl("https://www.example.com/path")).toBe(
      "example.com/path"
    );
  });

  it("should handle URLs with http://www. prefix", () => {
    expect(normalizeUrl("http://www.example.com/path")).toBe(
      "example.com/path"
    );
  });

  it("should handle complex URLs with many normalizations needed", () => {
    const url = "HTTP://www.EXAMPLE.COM/path/to/resource/";
    expect(normalizeUrl(url)).toBe("example.com/path/to/resource");
  });

  it("should not remove query string", () => {
    const url = "https://learn.mongodb.com/skills?openTab=query";
    expect(normalizeUrl(url)).toBe("learn.mongodb.com/skills?openTab=query");
  });

  it("should return the URL unchanged if it is already normalized", () => {
    const url = "example.com/path/to/resource";
    expect(normalizeUrl(url)).toBe(url);
  });
});
