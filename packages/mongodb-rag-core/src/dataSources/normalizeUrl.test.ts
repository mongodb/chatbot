import { normalizeUrl, ensureProtocol } from "./normalizeUrl";

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

  it("should handle URLs with a domain and a trailing slash", () => {
    expect(normalizeUrl("https://example.com/")).toBe("example.com");
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
    const url = "http://www.example.com/path/to/resource/";
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

describe("ensureProtocol", () => {
  it("should add https:// to a normalized url without protocol", () => {
    expect(ensureProtocol("example.com")).toBe("https://example.com");
    expect(ensureProtocol("example.com/path")).toBe("https://example.com/path");
  });

  it("should not add https:// if url already has https://", () => {
    expect(ensureProtocol("https://example.com")).toBe("https://example.com");
    expect(ensureProtocol("https://example.com/path")).toBe(
      "https://example.com/path"
    );
  });

  it("should not add https:// if url already has http://", () => {
    expect(ensureProtocol("http://example.com")).toBe("http://example.com");
    expect(ensureProtocol("http://example.com/path")).toBe(
      "http://example.com/path"
    );
  });

  it("should handle www prefix", () => {
    expect(ensureProtocol("www.example.com")).toBe("https://www.example.com");
  });

  it("should handle empty string", () => {
    expect(ensureProtocol("")).toBe(null);
  });
});
