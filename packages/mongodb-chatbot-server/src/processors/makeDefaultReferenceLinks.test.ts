import { EmbeddedContent } from "mongodb-rag-core";
import { ObjectId } from "mongodb-rag-core/mongodb";
import { makeDefaultReferenceLinks } from "./makeDefaultReferenceLinks";

describe("makeDefaultReferenceLinks()", () => {
  const embeddings = {
    modelName: [0.1, 0.2, 0.3],
  };
  // Chunk 1 and 2 are the same page. Chunk 3 is a different page.
  const chunk1 = {
    _id: new ObjectId(),
    url: "https://mongodb.com/docs/realm/sdk/node/",
    text: "blah blah blah",
    tokenCount: 100,
    embeddings,
    updated: new Date(),
    sourceName: "realm",
  };
  const chunk2 = {
    _id: new ObjectId(),
    url: "https://mongodb.com/docs/realm/sdk/node/",
    text: "blah blah blah",
    tokenCount: 100,
    embeddings,
    updated: new Date(),
    sourceName: "realm",
  };
  const chunk3 = {
    _id: new ObjectId(),
    url: "https://mongodb.com/docs/realm/sdk/node/xyz",
    text: "blah blah blah",
    tokenCount: 100,
    embeddings,
    updated: new Date(),
    sourceName: "realm",
  };
  const chunkWithTitle = {
    _id: new ObjectId(),
    url: "https://mongodb.com/docs/realm/sdk/node/xyz",
    text: "blah blah blah",
    metadata: {
      pageTitle: "title",
    },
    tokenCount: 100,
    embeddings,
    updated: new Date(),
    sourceName: "realm",
  };
  test("No sources should return empty string", () => {
    const noChunks: EmbeddedContent[] = [];
    const noReferences = makeDefaultReferenceLinks(noChunks);
    expect(noReferences).toEqual([]);
  });
  test("One source should return one link", () => {
    const oneChunk: EmbeddedContent[] = [chunk1];
    const oneReference = makeDefaultReferenceLinks(oneChunk);
    const expectedOneReference = [
      {
        title: "https://mongodb.com/docs/realm/sdk/node/",
        url: "https://mongodb.com/docs/realm/sdk/node/",
        metadata: {
          sourceName: "realm",
          tags: [],
        },
      },
    ];
    expect(oneReference).toEqual(expectedOneReference);
  });
  test("Chunk with title should return title in reference", () => {
    const oneChunk: EmbeddedContent[] = [chunkWithTitle];
    const oneReference = makeDefaultReferenceLinks(oneChunk);
    const expectedOneReference = [
      {
        title: "title",
        url: "https://mongodb.com/docs/realm/sdk/node/xyz",
        metadata: {
          sourceName: "realm",
          tags: [],
        },
      },
    ];
    expect(oneReference).toEqual(expectedOneReference);
  });
  test("Multiple sources from same page should return one link", () => {
    const twoChunksSamePage: EmbeddedContent[] = [chunk1, chunk2];
    const oneReferenceSamePage = makeDefaultReferenceLinks(twoChunksSamePage);
    const expectedOneReferenceSamePage = [
      {
        title: "https://mongodb.com/docs/realm/sdk/node/",
        url: "https://mongodb.com/docs/realm/sdk/node/",
        metadata: {
          sourceName: "realm",
          tags: [],
        },
      },
    ];
    expect(oneReferenceSamePage).toEqual(expectedOneReferenceSamePage);
  });
  test("Multiple sources from different pages should return 1 link per page", () => {
    const twoChunksDifferentPage: EmbeddedContent[] = [chunk1, chunk3];
    const multipleReferencesDifferentPage = makeDefaultReferenceLinks(
      twoChunksDifferentPage
    );
    const expectedMultipleReferencesDifferentPage = [
      {
        title: "https://mongodb.com/docs/realm/sdk/node/",
        url: "https://mongodb.com/docs/realm/sdk/node/",
        metadata: {
          sourceName: "realm",
          tags: [],
        },
      },
      {
        title: "https://mongodb.com/docs/realm/sdk/node/xyz",
        url: "https://mongodb.com/docs/realm/sdk/node/xyz",
        metadata: {
          sourceName: "realm",
          tags: [],
        },
      },
    ];
    expect(multipleReferencesDifferentPage).toEqual(
      expectedMultipleReferencesDifferentPage
    );
    // All three sources. Two from the same page. One from a different page.
    const threeChunks: EmbeddedContent[] = [chunk1, chunk2, chunk3];
    const multipleSourcesWithSomePageOverlap =
      makeDefaultReferenceLinks(threeChunks);
    const expectedMultipleSourcesWithSomePageOverlap = [
      {
        title: "https://mongodb.com/docs/realm/sdk/node/",
        url: "https://mongodb.com/docs/realm/sdk/node/",
        metadata: {
          sourceName: "realm",
          tags: [],
        },
      },
      {
        title: "https://mongodb.com/docs/realm/sdk/node/xyz",
        url: "https://mongodb.com/docs/realm/sdk/node/xyz",
        metadata: {
          sourceName: "realm",
          tags: [],
        },
      },
    ];
    expect(multipleSourcesWithSomePageOverlap).toEqual(
      expectedMultipleSourcesWithSomePageOverlap
    );
  });
});
