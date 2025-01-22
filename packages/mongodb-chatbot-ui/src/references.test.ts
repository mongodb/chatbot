import {
  type References,
  isReferenceToDomain,
  makePrioritizeReferenceDomain,
} from "./references";

const testReferences = [
  {
    url: "https://mongodb.com/developer/products/atlas/foobar",
    title: "Some MongoDB Developer Center Article",
    metadata: {
      sourceName: "snooty-devcenter",
      sourceType: "Article",
    },
  },
  {
    url: "https://mongodb.com/docs/manual",
    title: "MongoDB Manual",
    metadata: {
      sourceName: "snooty-docs",
      sourceType: "Docs",
      tags: ["manual"],
    },
  },
  {
    url: "https://www.example123.com",
    title: "Example 123",
  },
  {
    url: "https://mongodb.com/docs/atlas",
    title: "MongoDB Atlas Docs",
    metadata: {
      sourceName: "snooty-cloud-docs",
      sourceType: "Docs",
      tags: ["atlas"],
    },
  },
  {
    url: "https://www.example.com",
    title: "Example",
  },
] satisfies References;

describe("makePrioritizeReferenceDomain", () => {
  it("moves references with the given domain ahead of other references", () => {
    const prioritizeReferenceDomain = makePrioritizeReferenceDomain(
      "https://mongodb.com"
    );
    const sortedReferences = [...testReferences].sort(
      prioritizeReferenceDomain
    );
    expect(sortedReferences.map((r) => r.url)).toEqual([
      "https://mongodb.com/developer/products/atlas/foobar",
      "https://mongodb.com/docs/manual",
      "https://mongodb.com/docs/atlas",
      "https://www.example123.com",
      "https://www.example.com",
    ]);
  });

  it("supports prioritizing references with a specific path", () => {
    const prioritizeReferenceDomain = makePrioritizeReferenceDomain(
      new URL("https://mongodb.com/docs")
    );
    const sortedReferences = [...testReferences].sort(
      prioritizeReferenceDomain
    );
    expect(sortedReferences.map((r) => r.url)).toEqual([
      "https://mongodb.com/docs/manual",
      "https://mongodb.com/docs/atlas",
      "https://mongodb.com/developer/products/atlas/foobar",
      "https://www.example123.com",
      "https://www.example.com",
    ]);
  });

  it("throws if you pass an invalid URL string as the argument", () => {
    expect(() => {
      makePrioritizeReferenceDomain("not a url");
    }).toThrow();
  });

  it("supports prioritizing multiple domains with more priority given to domains earlier in the list", () => {
    const prioritizeReferenceDomain = makePrioritizeReferenceDomain([
      "https://mongodb.com/docs/atlas",
      "https://mongodb.com/developer",
      "https://mongodb.com/docs",
      "https://www.example.com",
    ]);
    const sortedReferences = [...testReferences].sort(
      prioritizeReferenceDomain
    );
    expect(sortedReferences.map((r) => r.url)).toEqual([
      "https://mongodb.com/docs/atlas",
      "https://mongodb.com/developer/products/atlas/foobar",
      "https://mongodb.com/docs/manual",
      "https://www.example.com",
      "https://www.example123.com",
    ]);
  });
});

describe("isReferenceToDomain", () => {
  it("returns true if the reference URL matches the given domain", () => {
    const reference = testReferences[0];
    expect(
      isReferenceToDomain(
        new URL(reference.url),
        new URL("https://mongodb.com")
      )
    ).toBe(true);
  });

  it("returns false if the reference URL does not match the given domain", () => {
    const reference = testReferences[0];
    expect(
      isReferenceToDomain(
        new URL(reference.url),
        new URL("https://www.example.com")
      )
    ).toBe(false);
  });
});
