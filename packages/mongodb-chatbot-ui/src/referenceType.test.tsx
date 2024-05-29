import { Reference } from "mongodb-rag-core";
import { referenceType } from "./referenceType";

describe("referenceType", () => {
  it("maps sourceName to ReferenceVariant", () => {
    expect(
      referenceType({
        url: "https://www.example.com",
        title: "Some Page Title",
        metadata: { sourceName: "c" },
      })
    ).toBe("Docs");
    expect(
      referenceType({
        url: "https://www.example.com",
        title: "Aggregate Is The New Find",
        metadata: { sourceName: "practical-aggregations-book" },
      })
    ).toBe("Book");
    expect(
      referenceType({
        url: "https://www.example.com",
        title: "Some Page Title",
        metadata: { sourceName: "snooty-docs" },
      })
    ).toBe("Docs");
    expect(
      referenceType({
        url: "https://www.example.com",
        title: "Some Page Title",
        metadata: {
          sourceName: "mongodb-university",
        },
      })
    ).toBe("Learn");
  });

  it("maps tags to ReferenceVariant", () => {
    expect(
      referenceType({
        url: "https://www.example.com",
        title: "Some Page Title",
        metadata: { tags: ["docs"] },
      })
    ).toBe("Docs");
    expect(
      referenceType({
        url: "https://www.example.com",
        title: "Some Page Title",
        metadata: { tags: ["video"] },
      })
    ).toBe("Video");
  });

  it("maps URLs to ReferenceVariant", () => {
    expect(
      referenceType({
        url: "https://www.mongodb.com/docs/foo/bar",
        title: "Some Page Title",
      })
    ).toBe("Docs");
    expect(
      referenceType({
        url: "https://learn.mongodb.com/catalog",
        title: "Some Page Title",
      })
    ).toBe("Learn");
  });

  it("returns undefined if no variant matches", () => {
    expect(
      referenceType({
        url: "https://www.example.com",
        title: "Some Page Title",
        metadata: { sourceName: "unknown" },
      })
    ).toBe(undefined);
    expect(
      referenceType({
        url: "https://www.example.com",
        title: "Some Page Title",
        metadata: { tags: ["unknown"] },
      })
    ).toBe(undefined);
    expect(
      referenceType({
        url: "https://www.example.com",
        title: "Some Page Title",
        metadata: {},
      })
    ).toBe(undefined);
    expect(
      referenceType({
        url: "https://www.example.com",
        title: "Some Page Title",
      })
    ).toBe(undefined);
  });

  it("Prioritizes: sourceName > tags > URL", () => {
    const base: Reference = {
      url: "https://www.example.com",
      title: "Some Page Title",
    };
    expect(referenceType(base)).toBeUndefined();
    base.metadata = {};
    expect(referenceType(base)).toBeUndefined();
    base.url = "https://learn.mongodb.com/catalog";
    expect(referenceType(base)).toBe("Learn");
    base.metadata = { tags: ["video"] };
    expect(referenceType(base)).toBe("Video");
    base.metadata = { sourceName: "snooty-docs" };
    expect(referenceType(base)).toBe("Docs");
  });
});
