import "dotenv/config";
import { EmbeddedContent, FindContentFunc } from "mongodb-rag-core";
import {
  MakeRagGenerateUserPromptParams,
  MakeUserMessageFunc,
  includeChunksForMaxTokensPossible,
  makeRagGenerateUserPrompt,
} from "./makeRagGenerateUserPrompt";
import { QueryPreprocessorFunc } from "./QueryPreprocessorFunc";
import { MakeReferenceLinksFunc } from "./MakeReferenceLinksFunc";

const embeddings = {
  modelName: [0.1, 0.2, 0.3],
};
const mockContent = [
  {
    url: "https://mongodb.com/docs/realm/sdk/node/",
    text: "foo foo foo",
    tokenCount: 3,
    embeddings,
    sourceName: "realm",
    updated: new Date(),
    score: 0.1,
  },
  {
    url: "https://mongodb.com/docs/realm/sdk/java/",
    text: "bar bar bar",
    tokenCount: 3,
    embeddings,
    sourceName: "realm",
    updated: new Date(),
    score: 0.2,
  },
  {
    url: "https://mongodb.com/docs/realm/sdk/flutter/",
    text: "baz baz baz",
    tokenCount: 3,
    embeddings,
    sourceName: "realm",
    updated: new Date(),
    score: 0.3,
  },
];

const mockTransformText = (text: string) => {
  return text + "\n\n Answer like a pirate.";
};
const mockPreprocessor: QueryPreprocessorFunc = async ({ query }) => ({
  query: mockTransformText(query),
  rejectQuery: false,
});
const mockFindContent: FindContentFunc = async () => {
  return {
    queryEmbedding: [0.1, 0.2, 0.3],
    content: mockContent,
  };
};

const mockMakeUserMessage: MakeUserMessageFunc = async ({
  preprocessedUserMessage,
}) => ({
  role: "user",
  content: preprocessedUserMessage ?? "",
});

const mockMakeReferences: MakeReferenceLinksFunc = (content) => {
  return content.map((c) => ({ url: c.url, title: "foobar" }));
};

const mockConfig: MakeRagGenerateUserPromptParams = {
  maxChunkContextTokens: 1000,
  findContent: mockFindContent,
  makeUserMessage: mockMakeUserMessage,
  queryPreprocessor: mockPreprocessor,
  makeReferenceLinks: mockMakeReferences,
};

describe("makeRagGenerateUserPrompt()", () => {
  test("should preprocess queries", async () => {
    const generateUserPromptFunc = makeRagGenerateUserPrompt(mockConfig);
    const response = await generateUserPromptFunc({
      userMessageText: "foo",
      reqId: "foo",
    });
    expect(response.userMessage.content).toBe(mockTransformText("foo"));
  });
  test("should reject queries with preprocessor", async () => {
    const generateUserPromptFunc = makeRagGenerateUserPrompt({
      ...mockConfig,
      queryPreprocessor: async ({ query }) => ({ query, rejectQuery: true }),
    });
    const response = await generateUserPromptFunc({
      userMessageText: "foo",
      reqId: "foo",
    });
    expect(response.rejectQuery).toBe(true);
  });
  test("should pass through queries without preprocessor", async () => {
    const generateUserPromptFunc = makeRagGenerateUserPrompt({
      ...mockConfig,
      queryPreprocessor: undefined,
    });
    const response = await generateUserPromptFunc({
      userMessageText: "foo",
      reqId: "foo",
    });
    expect(response.userMessage.content).toBe("foo");
  });
  test("should include found content with findContent", async () => {
    const generateUserPromptFunc = makeRagGenerateUserPrompt({
      ...mockConfig,
      makeUserMessage: async ({ content }) => ({
        role: "user",
        content: content[0].text,
      }),
    });
    const response = await generateUserPromptFunc({
      userMessageText: "foo",
      reqId: "foo",
    });
    expect(response.userMessage.content).toBe(mockContent[0].text);
  });
  test("should reject queries with no matching content", async () => {
    const generateUserPromptFunc = makeRagGenerateUserPrompt({
      ...mockConfig,
      findContent: async () => ({ queryEmbedding: [], content: [] }),
    });
    const response = await generateUserPromptFunc({
      userMessageText: "foo",
      reqId: "foo",
    });
    expect(response.rejectQuery).toBe(true);
  });
  test("should pass original user message, preprocessed user message, and content to makeUserMessage", async () => {
    const originalUserMessage = "foo";
    const preprocessedUserMessage = mockTransformText(originalUserMessage);
    const generateUserPromptFunc = makeRagGenerateUserPrompt({
      ...mockConfig,
      makeUserMessage: async ({
        content,
        originalUserMessage,
        preprocessedUserMessage,
      }) => ({
        role: "user",
        content: `${originalUserMessage} ${preprocessedUserMessage} ${content[0].text}`,
      }),
    });
    const response = await generateUserPromptFunc({
      userMessageText: originalUserMessage,
      reqId: "foo",
    });
    expect(response.userMessage.content).toBe(
      `${originalUserMessage} ${preprocessedUserMessage} ${mockContent[0].text}`
    );
  });
  test("should include references from found content", async () => {
    const generateUserPromptFunc = makeRagGenerateUserPrompt(mockConfig);
    const response = await generateUserPromptFunc({
      userMessageText: "foo",
      reqId: "foo",
    });
    expect(response.references).toStrictEqual(mockMakeReferences(mockContent));
  });
  test("should include content with max tokens", async () => {
    const calledFunc = jest.fn();
    const generateUserPromptFunc = makeRagGenerateUserPrompt({
      ...mockConfig,
      maxChunkContextTokens: 3,
      makeUserMessage: async ({ content }) => {
        if (content.length === 1) {
          calledFunc();
        }
        return {
          role: "user",
          content: "blah",
        };
      },
    });
    await generateUserPromptFunc({
      userMessageText: "foo",
      reqId: "foo",
    });
    expect(calledFunc).toHaveBeenCalled();
  });
});

describe("includeChunksForMaxTokensPossible()", () => {
  const content: EmbeddedContent[] = [
    {
      url: "https://mongodb.com/docs/realm/sdk/node/",
      text: "foo foo foo",
      tokenCount: 100,
      embeddings,
      sourceName: "realm",
      updated: new Date(),
    },
    {
      url: "https://mongodb.com/docs/realm/sdk/node/",
      text: "bar bar bar",
      tokenCount: 100,
      embeddings,
      sourceName: "realm",
      updated: new Date(),
    },
    {
      url: "https://mongodb.com/docs/realm/sdk/node/",
      text: "baz baz baz",
      tokenCount: 100,
      embeddings,
      sourceName: "realm",
      updated: new Date(),
    },
  ];
  test("Should include all chunks if less that max tokens", () => {
    const maxTokens = 1000;
    const includedChunks = includeChunksForMaxTokensPossible({
      content,
      maxTokens,
    });
    expect(includedChunks).toStrictEqual(content);
  });
  test("should only include subset of chunks that fit within max tokens, inclusive", () => {
    const maxTokens = 200;
    const includedChunks = includeChunksForMaxTokensPossible({
      content,
      maxTokens,
    });
    expect(includedChunks).toStrictEqual(content.slice(0, 2));
    const maxTokens2 = maxTokens + 1;
    const includedChunks2 = includeChunksForMaxTokensPossible({
      content,
      maxTokens: maxTokens2,
    });
    expect(includedChunks2).toStrictEqual(content.slice(0, 2));
  });
});
