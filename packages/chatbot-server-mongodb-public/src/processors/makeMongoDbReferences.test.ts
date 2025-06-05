import { EmbeddedContent, Reference } from "mongodb-rag-core";
import {
  makeMongoDbReferences,
  addReferenceSourceType,
  mongodbReferenceType,
} from "./makeMongoDbReferences";

describe("makeMongoDbReferences", () => {
  const embeddings = {
    modelName: [0.1, 0.2, 0.3],
  };
  it("returns standard references with sourceType metadata", () => {
    const chunks = [
      {
        url: "https://www.example.com/blog",
        sourceName: "example",
        text: "# Example Blog\n\nThis is my example blog.\n\n",
        tokenCount: 4,
        embeddings,
        updated: new Date(),
        metadata: {
          pageTitle: "Example Blog",
          tags: ["external", "example"],
        },
        chunkIndex: 0,
      },
      {
        url: "https://www.example.com/blog",
        sourceName: "example",
        text: "It is a very cool blog.",
        tokenCount: 12,
        embeddings,
        updated: new Date(),
        metadata: {
          pageTitle: "Example Blog",
          tags: ["external", "example"],
        },
        chunkIndex: 1,
      },
      {
        url: "https://www.mongodb.com/love-your-developers",
        sourceName: "mongodb-dotcom",
        text: "Love Your Developers",
        tokenCount: 5,
        embeddings,
        updated: new Date(),
        metadata: {
          pageTitle: "Love Your Developers",
          tags: ["external", "example"],
        },
        chunkIndex: 0,
      },
      {
        url: "https://www.mongodb.com/developer/products/mongodb/best-practices-flask-mongodb",
        sourceName: "devcenter",
        text: "In this article, we will be going through some of the best practices for getting started with Flask...",
        tokenCount: 222,
        embeddings: {
          embeddingName: [0.31, 0.32, 0.33],
        },
        updated: new Date(),
        metadata: {
          pageTitle: "Best Practices for Using Flask and MongoDB",
          tags: ["devcenter", "example", "python", "flask"],
        },
        chunkIndex: 0,
      },
    ] satisfies EmbeddedContent[];
    const result = makeMongoDbReferences(chunks);
    expect(result).toEqual([
      {
        url: "https://www.example.com/blog",
        title: "Example Blog",
        metadata: {
          sourceName: "example",
          sourceType: "Blog",
          tags: ["external", "example"],
        },
      },
      {
        url: "https://www.mongodb.com/love-your-developers",
        title: "Love Your Developers",
        metadata: {
          sourceName: "mongodb-dotcom",
          sourceType: "Article",
          tags: ["external", "example"],
        },
      },
      {
        url: "https://www.mongodb.com/developer/products/mongodb/best-practices-flask-mongodb",
        title: "Best Practices for Using Flask and MongoDB",
        metadata: {
          sourceName: "devcenter",
          sourceType: "Article",
          tags: ["devcenter", "example", "python", "flask"],
        },
      },
    ]);
  });

  it("returns standard references without a sourceType if no sourceType can be determined", () => {
    const chunks = [
      {
        url: "https://www.example.com/somepage",
        sourceName: "example",
        text: "Lorem ipsum",
        tokenCount: 5,
        embeddings,
        updated: new Date(),
        metadata: {
          pageTitle: "Some Page",
          tags: ["external", "example"],
        },
        chunkIndex: 0,
      },
    ];
    const result = makeMongoDbReferences(chunks);
    expect(result).toEqual([
      {
        url: "https://www.example.com/somepage",
        title: "Some Page",
        metadata: {
          sourceName: "example",
          tags: ["external", "example"],
        },
      },
    ]);
  });
});

describe("addReferenceSourceType", () => {
  it("adds sourceType to metadata if it can", () => {
    const reference: Reference = {
      url: "https://mongodb.com/docs/manual/reference/operator/query/eq/",
      title: "$eq",
      metadata: {
        sourceName: "snooty-docs",
        tags: ["docs", "manual"],
      },
    };
    const result = addReferenceSourceType(reference);
    expect(result.metadata).toEqual({
      sourceName: reference.metadata?.sourceName,
      tags: reference.metadata?.tags,
      sourceType: "Docs",
    });
  });

  it("overwrites an existing metadata.sourceType key if one is present", () => {
    const reference: Reference = {
      url: "https://mongodb.com/docs/manual/reference/operator/query/eq/",
      title: "$eq",
      metadata: {
        sourceName: "snooty-docs",
        sourceType: "ThinAir",
        tags: ["docs", "manual"],
      },
    };
    const result = addReferenceSourceType(reference);
    expect(result.metadata).toEqual({
      sourceName: reference.metadata?.sourceName,
      tags: reference.metadata?.tags,
      sourceType: "Docs",
    });
  });

  it("totally omits the metadata.sourceType key if no sourceType applies", () => {
    const reference: Reference = {
      url: "https://example.com/random-thoughts/hotdogs-are-tacos",
      title: "Hotdogs Are Just Tacos",
      metadata: {
        sourceName: "some-random-blog",
        tags: ["external"],
      },
    };
    const result = addReferenceSourceType(reference);
    expect(result).toEqual(reference);
  });
});

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
