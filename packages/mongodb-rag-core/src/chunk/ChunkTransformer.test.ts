import { Page } from "../contentStore";
import { ContentChunk } from "./chunkPage";
import {
  makeChunkFrontMatterUpdater,
  standardMetadataGetter,
} from "./ChunkTransformer";
const programmingLanguage = "txt";
const chunk: ContentChunk = {
  text: `---
pageTitle: Old title
---

test
\`\`\`${programmingLanguage}
ok
\`\`\`
`,
  tokenCount: 0,
  sourceName: "test",
  url: "test",
};

const page: Page = {
  url: "test",
  sourceName: "test",
  title: "New title",
  body: "test",
  format: "md",
  metadata: {
    a: "b,c",
    page: {
      foo: "bar",
    },
  },
};

describe("makeChunkFrontMatterUpdater", () => {
  const standardChunkFrontMatterUpdater = makeChunkFrontMatterUpdater(
    standardMetadataGetter
  );
  it("should update front matter with new metadata", async () => {
    const updatedChunk = await standardChunkFrontMatterUpdater(chunk, { page });

    expect(updatedChunk.text).toContain(`pageTitle: ${page.title}`);
  });

  it("should retain existing front matter if not overwritten", async () => {
    const chunkFrontMatterUpdater = makeChunkFrontMatterUpdater(
      standardMetadataGetter
    );
    const updatedChunk = await chunkFrontMatterUpdater(chunk, { page });

    expect(updatedChunk.text).toContain("a: b,c");
  });
});

describe("standardMetadataGetter", () => {
  let metadata: Record<string, unknown>;
  beforeEach(async () => {
    metadata = await standardMetadataGetter({
      chunk,
      page,
      text: chunk.text,
    });
  });

  it("should extract programming language info", async () => {
    expect(metadata).toMatchObject({
      codeBlockLanguages: [programmingLanguage],
      hasCodeBlock: true,
    });
  });

  it("should extract title", async () => {
    expect(metadata).toMatchObject({
      pageTitle: page.title,
    });
  });

  it("should extract relevant metadata", async () => {
    expect(metadata).not.toMatchObject({
      page: page.metadata?.page,
    });
  });
});
