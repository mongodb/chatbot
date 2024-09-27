import { vi } from "vitest";
import { References } from "mongodb-rag-core";
import {
  formatReferences,
  makePrioritizeCurrentMongoDbReferenceDomain,
} from "./messageLinks";

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

describe("formatReferences", () => {
  test("returns an array of rich link props", () => {
    const richLinkProps = formatReferences(testReferences);
    expect(richLinkProps).toEqual([
      {
        href: "https://mongodb.com/developer/products/atlas/foobar",
        children: "Some MongoDB Developer Center Article",
        variant: "Article",
      },
      {
        href: "https://mongodb.com/docs/manual",
        children: "MongoDB Manual",
        variant: "Docs",
      },
      {
        href: "https://www.example123.com",
        children: "Example 123",
      },
      {
        href: "https://mongodb.com/docs/atlas",
        children: "MongoDB Atlas Docs",
        variant: "Docs",
      },
      {
        href: "https://www.example.com",
        children: "Example",
      },
    ]);
  });
});

describe("makePrioritizeCurrentMongoDbReferenceDomain", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  test("returns a sort function that automatically prioritizes the current MongoDB domain", () => {
    vi.stubGlobal("location", {
      href: "https://mongodb.com/docs",
    });
    const prioritizeCurrentMongoDbReferenceDomain =
      makePrioritizeCurrentMongoDbReferenceDomain();
    const sortedReferences = testReferences.toSorted(
      prioritizeCurrentMongoDbReferenceDomain
    );
    expect(sortedReferences.map((r) => r.url)).toEqual([
      "https://mongodb.com/docs/manual",
      "https://mongodb.com/docs/atlas",
      "https://mongodb.com/developer/products/atlas/foobar",
      "https://www.example123.com",
      "https://www.example.com",
    ]);
  });

  test("doesn't prioritize any domain when the current domain isn't a well-known MongoDB domain", () => {
    vi.stubGlobal("location", {
      href: "https://www.example.com",
    });
    const prioritizeCurrentMongoDbReferenceDomain =
      makePrioritizeCurrentMongoDbReferenceDomain();
    const sortedReferences = testReferences.toSorted(
      prioritizeCurrentMongoDbReferenceDomain
    );
    expect(sortedReferences.map((r) => r.url)).toEqual([
      "https://mongodb.com/developer/products/atlas/foobar",
      "https://mongodb.com/docs/manual",
      "https://www.example123.com",
      "https://mongodb.com/docs/atlas",
      "https://www.example.com",
    ]);
  });

  test("returns a no-op sort function when the current domain can't be determined", () => {
    vi.stubGlobal("window", undefined);
    const prioritizeCurrentMongoDbReferenceDomain =
      makePrioritizeCurrentMongoDbReferenceDomain();
    const sortedReferences = testReferences.toSorted(
      prioritizeCurrentMongoDbReferenceDomain
    );
    expect(sortedReferences.map((r) => r.url)).toEqual([
      "https://mongodb.com/developer/products/atlas/foobar",
      "https://mongodb.com/docs/manual",
      "https://www.example123.com",
      "https://mongodb.com/docs/atlas",
      "https://www.example.com",
    ]);
  });
});
