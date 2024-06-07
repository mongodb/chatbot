import { Reference } from "mongodb-rag-core";
import { mongodbReferenceType } from "./mongodbReferenceType";

describe("mongodbReferenceType", () => {
  it("maps sourceName to ReferenceVariant", () => {
    expect(
      mongodbReferenceType({
        url: "https://www.example.com",
        title: "Some Page Title",
        metadata: { sourceName: "c" },
      })
    ).toBe("Docs");
    expect(
      mongodbReferenceType({
        url: "https://www.example.com",
        title: "Aggregate Is The New Find",
        metadata: { sourceName: "practical-aggregations-book" },
      })
    ).toBe("Book");
    expect(
      mongodbReferenceType({
        url: "https://www.example.com",
        title: "Some Page Title",
        metadata: { sourceName: "snooty-docs" },
      })
    ).toBe("Docs");
    expect(
      mongodbReferenceType({
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
      mongodbReferenceType({
        url: "https://www.example.com",
        title: "Some Page Title",
        metadata: { tags: ["docs"] },
      })
    ).toBe("Docs");
    expect(
      mongodbReferenceType({
        url: "https://www.example.com",
        title: "Some Page Title",
        metadata: { tags: ["video"] },
      })
    ).toBe("Video");
  });

  it("maps URLs to ReferenceVariant", () => {
    expect(
      mongodbReferenceType({
        url: "https://www.mongodb.com/docs/foo/bar",
        title: "Some Page Title",
      })
    ).toBe("Docs");
    expect(
      mongodbReferenceType({
        url: "https://learn.mongodb.com/catalog",
        title: "Some Page Title",
      })
    ).toBe("Learn");
  });

  it("returns undefined if no variant matches", () => {
    expect(
      mongodbReferenceType({
        url: "https://www.example.com",
        title: "Some Page Title",
        metadata: { sourceName: "unknown" },
      })
    ).toBe(undefined);
    expect(
      mongodbReferenceType({
        url: "https://www.example.com",
        title: "Some Page Title",
        metadata: { tags: ["unknown"] },
      })
    ).toBe(undefined);
    expect(
      mongodbReferenceType({
        url: "https://www.example.com",
        title: "Some Page Title",
        metadata: {},
      })
    ).toBe(undefined);
    expect(
      mongodbReferenceType({
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
    expect(mongodbReferenceType(base)).toBeUndefined();
    base.metadata = {};
    expect(mongodbReferenceType(base)).toBeUndefined();
    base.url = "https://learn.mongodb.com/catalog";
    expect(mongodbReferenceType(base)).toBe("Learn");
    base.metadata = { tags: ["video"] };
    expect(mongodbReferenceType(base)).toBe("Video");
    base.metadata = { sourceName: "snooty-docs" };
    expect(mongodbReferenceType(base)).toBe("Docs");
  });
});
