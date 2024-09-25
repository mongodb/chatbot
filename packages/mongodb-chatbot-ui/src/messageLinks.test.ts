import { References } from "mongodb-rag-core";
import { formatReferences, getMessageLinks } from "./messageLinks";
import { MessageData } from "./services/conversations";

const testReferences = [
  {
    url: "https://mongodb.com/developer/products/atlas/foobar",
    title: "Some MongoDB Developer Center Article",
    metadata: {
      sourceName: "devcenter",
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

describe("getMessageLinks", () => {
  test("converts a message data object to an array of rich link props", () => {
    const messageData = {
      id: "123",
      createdAt: new Date().toISOString(),
      role: "assistant",
      content: "Here are some links",
      references: testReferences,
    } satisfies MessageData;
    const richLinkProps = getMessageLinks(messageData);
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
