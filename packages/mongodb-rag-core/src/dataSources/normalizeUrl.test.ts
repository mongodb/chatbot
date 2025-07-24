import { normalizeUrl, ensureProtocol } from "./normalizeUrl";

describe("normalizeUrl", () => {
  it("should handle URLs with https:// domain", () => {
    const params = {
      url: "https://example.com",
    };
    expect(normalizeUrl(params)).toBe("example.com");
  });

  it("should handle URLs with https:// domain", () => {
    const params = {
      url: "http://example.com",
    };
    expect(normalizeUrl(params)).toBe("example.com");
  });
  it("should remove www prefix", () => {
    const params = {
      url: "www.example.com/path",
    };
    expect(normalizeUrl(params)).toBe("example.com/path");
  });

  it("should remove trailing slashes", () => {
    const params = {
      url: "example.com/path/",
    };
    expect(normalizeUrl(params)).toBe("example.com/path");
  });

  it("should handle URLs with a domain and a trailing slash", () => {
    const params = {
      url: "https://example.com/",
    };
    expect(normalizeUrl(params)).toBe("example.com");
  });

  it("should handle URLs with https://www. prefix", () => {
    const params = {
      url: "https://www.example.com/path",
    };
    expect(normalizeUrl(params)).toBe("example.com/path");
  });

  it("should handle URLs with http://www. prefix", () => {
    const params = {
      url: "http://www.example.com/path",
    };
    expect(normalizeUrl(params)).toBe("example.com/path");
  });

  it("should handle complex URLs with many normalizations needed", () => {
    const params = {
      url: "http://www.example.com/path/to/resource/",
    };
    expect(normalizeUrl(params)).toBe("example.com/path/to/resource");
  });

  it("should not remove hash fragment if removeHash=false", () => {
    const params = {
      url: "https://www.mongodb.com/docs/atlas/atlas-vector-search/rag/#why-use-rag-",
      removeHash: false,
    };
    expect(normalizeUrl(params)).toBe(
      "mongodb.com/docs/atlas/atlas-vector-search/rag/#why-use-rag-"
    );
  });

  it("should remove hash fragment if removeHash=true", () => {
    const params = {
      url: "https://www.mongodb.com/docs/atlas/atlas-vector-search/rag/#why-use-rag-",
      removeHash: true,
    };
    expect(normalizeUrl(params)).toBe(
      "mongodb.com/docs/atlas/atlas-vector-search/rag"
    );
  });

  it("should not remove query string if removeQueryString=false", () => {
    const params = {
      url: "https://learn.mongodb.com/skills?openTab=query",
      removeQueryString: false,
    };
    expect(normalizeUrl(params)).toBe("learn.mongodb.com/skills?openTab=query");
  });

  it("should remove query string if removeQueryString=true", () => {
    const params = {
      url: "https://learn.mongodb.com/skills?openTab=query",
      removeQueryString: true,
    };
    expect(normalizeUrl(params)).toBe("learn.mongodb.com/skills");
  });

  it("should remove both query string & hash if both true", () => {
    const params = {
      url: "https://www.mongodb.com/docs/manual/core/read-preference/?tck=mongodb_ai_chatbot#configure-read-preference",
      removeHash: true,
      removeQueryString: true,
    };
    expect(normalizeUrl(params)).toBe(
      "mongodb.com/docs/manual/core/read-preference"
    );
  });

  it("should not remove both query string & hash if both false", () => {
    const params = {
      url: "https://www.mongodb.com/docs/manual/core/read-preference/?tck=mongodb_ai_chatbot#configure-read-preference",
      removeHash: false,
      removeQueryString: false,
    };
    expect(normalizeUrl(params)).toBe(
      "mongodb.com/docs/manual/core/read-preference/?tck=mongodb_ai_chatbot#configure-read-preference"
    );
  });

  it("should only remove query string", () => {
    const params = {
      url: "https://www.mongodb.com/docs/manual/core/read-preference/?tck=mongodb_ai_chatbot#configure-read-preference",
      removeHash: false,
      removeQueryString: true,
    };
    expect(normalizeUrl(params)).toBe(
      "mongodb.com/docs/manual/core/read-preference/#configure-read-preference"
    );
  });

  it("should only remove query string (no hash fragment in URL)", () => {
    const params = {
      url: "https://www.mongodb.com/docs/manual/core/read-preference/?tck=mongodb_ai_chatbot",
      removeHash: false,
      removeQueryString: true,
    };
    expect(normalizeUrl(params)).toBe(
      "mongodb.com/docs/manual/core/read-preference"
    );
  });

  it("should only remove hash fragment", () => {
    const params = {
      url: "https://www.mongodb.com/docs/manual/core/read-preference/?tck=mongodb_ai_chatbot#configure-read-preference",
      removeHash: true,
      removeQueryString: false,
    };
    expect(normalizeUrl(params)).toBe(
      "mongodb.com/docs/manual/core/read-preference/?tck=mongodb_ai_chatbot"
    );
  });

  it("should return the URL unchanged if it is already normalized", () => {
    const params = {
      url: "example.com/path/to/resource",
    };
    expect(normalizeUrl(params)).toBe(params.url);
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
    expect(ensureProtocol("")).toBe("https://");
  });
});
