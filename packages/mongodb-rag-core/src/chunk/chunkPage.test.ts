import fs from "fs";
import Path from "path";
import { chunkPage } from "./chunkPage";
import { standardChunkFrontMatterUpdater } from "./ChunkTransformer";
import { Page } from "../contentStore";

const SRC_ROOT = Path.resolve(__dirname, "..");

describe("chunkPage", () => {
  const page: Page = {
    url: "test",
    title: "Test Page",
    body: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam tempus mattis turpis sed ornare. Etiam fermentum malesuada mauris at feugiat. Proin vel augue vel velit pellentesque eleifend. Integer elit nisl, mattis non felis mollis, efficitur ornare nunc. Etiam eu semper magna. Proin molestie suscipit quam egestas ultrices. Donec eget eleifend libero. Morbi euismod, turpis sit amet convallis egestas, enim metus ornare nisi, vel egestas est purus vel arcu. Duis ut augue nec purus ultrices ultrices. Sed quis mauris felis.

Morbi lacinia pharetra vestibulum. Aliquam fringilla, arcu in porta mollis, ligula felis vulputate nibh, sed dignissim libero velit ac leo. In bibendum a eros id imperdiet. Pellentesque ac nulla id nisl maximus vulputate. Vivamus in luctus ante. Curabitur blandit lobortis nunc, id consequat diam dignissim semper. Proin quis sem purus. Duis nibh risus, tempor eget elementum id, mattis eget odio. Donec eu nisl quis leo posuere iaculis eu eu libero. Aenean non elit tincidunt, tincidunt nisl at, commodo lectus.

In orci massa, vulputate eu eros non, venenatis commodo nibh. Donec nec faucibus orci, euismod vehicula arcu. Phasellus dictum, turpis eget mattis bibendum, odio dui blandit augue, ut pretium est leo ac metus. Aenean quis velit mi. Nam dapibus porttitor tincidunt. Nulla luctus, ex ac porttitor dapibus, lorem nibh tempus est, sed tempor massa nisi eu nisi. Fusce sagittis ac risus sit amet hendrerit. Sed congue sapien et libero tempus ultricies. Nulla vel neque molestie, pellentesque velit vel, sagittis ex. Duis eleifend sapien sed diam ultrices, eu rutrum elit aliquam. Etiam in aliquam ipsum. Mauris tortor arcu, feugiat quis tincidunt sed, feugiat congue tellus. Vivamus laoreet, mauris ac ornare viverra, purus ante tristique elit, nec pretium tortor dolor a velit. Nullam ornare maximus sem, vitae euismod risus viverra eu. Maecenas eros urna, ornare id tincidunt sed, vehicula at dui.

Praesent a neque diam. Sed ultricies nunc quam, sed maximus risus dignissim sit amet. Phasellus scelerisque massa hendrerit urna convallis finibus. Fusce ornare odio eros, id ultrices nisl sodales quis. Aenean sed ullamcorper enim, sit amet varius lectus. Duis ut vestibulum eros. Maecenas bibendum felis at laoreet eleifend.

Vestibulum tempus aliquet convallis. Aenean ac dolor sed tortor malesuada bibendum in vel diam. Pellentesque varius dapibus molestie. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Mauris blandit metus sit amet libero pretium, sit amet cursus sem tempor. Proin euismod ut mi vitae luctus. Etiam pulvinar lacus nulla, vel placerat lacus pharetra auctor.`,
    format: "md",
    sourceName: "test-source",
    metadata: {
      tags: ["a", "b"],
    },
  };
  it("chunks pages", async () => {
    const chunks = await chunkPage(page, {
      maxChunkSize: 500,
      chunkOverlap: 0,
    });
    expect(chunks).toHaveLength(3);
    expect(chunks).toStrictEqual([
      {
        chunkIndex: 0,
        sourceName: "test-source",
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam tempus mattis turpis sed ornare. Etiam fermentum malesuada mauris at feugiat. Proin vel augue vel velit pellentesque eleifend. Integer elit nisl, mattis non felis mollis, efficitur ornare nunc. Etiam eu semper magna. Proin molestie suscipit quam egestas ultrices. Donec eget eleifend libero. Morbi euismod, turpis sit amet convallis egestas, enim metus ornare nisi, vel egestas est purus vel arcu. Duis ut augue nec purus ultrices ultrices. Sed quis mauris felis.\n\nMorbi lacinia pharetra vestibulum. Aliquam fringilla, arcu in porta mollis, ligula felis vulputate nibh, sed dignissim libero velit ac leo. In bibendum a eros id imperdiet. Pellentesque ac nulla id nisl maximus vulputate. Vivamus in luctus ante. Curabitur blandit lobortis nunc, id consequat diam dignissim semper. Proin quis sem purus. Duis nibh risus, tempor eget elementum id, mattis eget odio. Donec eu nisl quis leo posuere iaculis eu eu libero. Aenean non elit tincidunt, tincidunt nisl at, commodo lectus.",
        tokenCount: 370,
        url: "test",
      },
      {
        chunkIndex: 1,
        sourceName: "test-source",
        text: "In orci massa, vulputate eu eros non, venenatis commodo nibh. Donec nec faucibus orci, euismod vehicula arcu. Phasellus dictum, turpis eget mattis bibendum, odio dui blandit augue, ut pretium est leo ac metus. Aenean quis velit mi. Nam dapibus porttitor tincidunt. Nulla luctus, ex ac porttitor dapibus, lorem nibh tempus est, sed tempor massa nisi eu nisi. Fusce sagittis ac risus sit amet hendrerit. Sed congue sapien et libero tempus ultricies. Nulla vel neque molestie, pellentesque velit vel, sagittis ex. Duis eleifend sapien sed diam ultrices, eu rutrum elit aliquam. Etiam in aliquam ipsum. Mauris tortor arcu, feugiat quis tincidunt sed, feugiat congue tellus. Vivamus laoreet, mauris ac ornare viverra, purus ante tristique elit, nec pretium tortor dolor a velit. Nullam ornare maximus sem, vitae euismod risus viverra eu. Maecenas eros urna, ornare id tincidunt sed, vehicula at dui.\n\nPraesent a neque diam. Sed ultricies nunc quam, sed maximus risus dignissim sit amet. Phasellus scelerisque massa hendrerit urna convallis finibus. Fusce ornare odio eros, id ultrices nisl sodales quis. Aenean sed ullamcorper enim, sit amet varius lectus. Duis ut vestibulum eros. Maecenas bibendum felis at laoreet eleifend.",
        tokenCount: 449,
        url: "test",
      },
      {
        chunkIndex: 2,
        sourceName: "test-source",
        text: "Vestibulum tempus aliquet convallis. Aenean ac dolor sed tortor malesuada bibendum in vel diam. Pellentesque varius dapibus molestie. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Mauris blandit metus sit amet libero pretium, sit amet cursus sem tempor. Proin euismod ut mi vitae luctus. Etiam pulvinar lacus nulla, vel placerat lacus pharetra auctor.",
        tokenCount: 132,
        url: "test",
      },
    ]);
  });

  it("allows transformation", async () => {
    const chunks = await chunkPage(page, {
      maxChunkSize: 500,
      chunkOverlap: 0,
      async transform(chunk) {
        return { ...chunk, text: "Transformed!" };
      },
    });
    expect(chunks).toHaveLength(3);
    expect(chunks).toStrictEqual([
      {
        chunkIndex: 0,
        sourceName: "test-source",
        text: "Transformed!",
        tokenCount: 3, // Calculated after transformation
        url: "test",
      },
      {
        chunkIndex: 1,
        sourceName: "test-source",
        text: "Transformed!",
        tokenCount: 3, // Calculated after transformation
        url: "test",
      },
      {
        chunkIndex: 2,
        sourceName: "test-source",
        text: "Transformed!",
        tokenCount: 3,
        url: "test",
      },
    ]);
  });

  it("can add frontmatter", async () => {
    const chunks = await chunkPage(
      { ...page, body: "This is some text.\nLorem ipsum blah, blah, blah!!!" },
      {
        transform: standardChunkFrontMatterUpdater,
      }
    );
    expect(chunks).toHaveLength(1);

    const expected = [
      {
        chunkIndex: 0,
        sourceName: "test-source",
        metadata: {
          hasCodeBlock: false,
          pageTitle: "Test Page",
          tags: ["a", "b"],
        },
        text: `---
tags:
  - a
  - b
pageTitle: Test Page
hasCodeBlock: false
---

This is some text.
Lorem ipsum blah, blah, blah!!!`,
        tokenCount: 45, // Calculated after transformation
        url: "test",
      },
    ];
    expect(chunks).toStrictEqual(expected);

    const codeBlockChunks = await chunkPage(
      {
        ...page,
        body: "This text has a code example:\n\n```js\nlet foo = 1 + 1;\n```\n\nNeat, huh?",
      },
      {
        transform: standardChunkFrontMatterUpdater,
      }
    );
    expect(codeBlockChunks).toHaveLength(1);
    expect(codeBlockChunks).toStrictEqual([
      {
        chunkIndex: 0,
        sourceName: "test-source",
        metadata: {
          hasCodeBlock: true,
          pageTitle: "Test Page",
          codeBlockLanguages: ["js"],
          tags: ["a", "b"],
        },
        text: `---
tags:
  - a
  - b
pageTitle: Test Page
hasCodeBlock: true
codeBlockLanguages:
  - js
---

This text has a code example:

\`\`\`js
let foo = 1 + 1;
\`\`\`

Neat, huh?`,
        tokenCount: 68,
        url: "test",
      },
    ]);

    const unspecifiedCodeBlockChunks = await chunkPage(
      {
        ...page,
        body: "This text has an unspecified code example:\n\n```\nlet foo = 1 + 1;\n```\n\nNeat, huh?",
      },
      {
        transform: standardChunkFrontMatterUpdater,
      }
    );
    expect(unspecifiedCodeBlockChunks).toHaveLength(1);
    expect(unspecifiedCodeBlockChunks).toStrictEqual([
      {
        chunkIndex: 0,
        sourceName: "test-source",
        metadata: {
          hasCodeBlock: true,
          pageTitle: "Test Page",
          tags: ["a", "b"],
        },
        text: `---
tags:
  - a
  - b
pageTitle: Test Page
hasCodeBlock: true
---

This text has an unspecified code example:

\`\`\`
let foo = 1 + 1;
\`\`\`

Neat, huh?`,
        tokenCount: 58,
        url: "test",
      },
    ]);
  });

  it("can update existing frontmatter", async () => {
    const chunks = await chunkPage(
      {
        ...page,
        body: `---
someString: Who knows
someArray:
  - 1
  - 2
  - foo
hasCodeBlock: true
---

This is some text\n`,
      },
      {
        transform: standardChunkFrontMatterUpdater,
      }
    );
    expect(chunks).toHaveLength(1);

    // Note that it includes the original frontmatter and only overrides the
    // field that would be set by the standardChunkFrontMatterUpdater (hasCodeBlock)
    expect(chunks[0].text).toBe(`---
someString: Who knows
someArray:
  - 1
  - 2
  - foo
hasCodeBlock: false
tags:
  - a
  - b
pageTitle: Test Page
---

This is some text`);
  });
  it("can add arbitrary page metadata", async () => {
    const body =
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
    const pageWithMetadata: Page = {
      ...page,
      body,
      metadata: {
        ...page.metadata,
        arbitrary: "metadata",
      },
    };
    const chunks = await chunkPage(pageWithMetadata, {
      transform: standardChunkFrontMatterUpdater,
    });
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toStrictEqual({
      chunkIndex: 0,
      sourceName: "test-source",
      metadata: {
        pageTitle: "Test Page",
        hasCodeBlock: false,
        tags: ["a", "b"],
        arbitrary: "metadata",
      },
      text: `---
tags:
  - a
  - b
arbitrary: metadata
pageTitle: Test Page
hasCodeBlock: false
---

${body}`,
      tokenCount: 78,
      url: "test",
    });
  });
  it("chunks page with tabs", async () => {
    const samplePageWithTabs = fs.readFileSync(
      Path.resolve(SRC_ROOT, "../testData/samplePageWithTabs.md"),
      {
        encoding: "utf-8",
      }
    );

    const pageWithTabs: Page = {
      url: "test",
      title: "Test Page",
      body: samplePageWithTabs,
      format: "md",
      sourceName: "test-source",
      metadata: {
        tags: ["a", "b"],
      },
    };

    const chunks = await chunkPage(pageWithTabs, {
      maxChunkSize: 300,
      chunkOverlap: 0,
    });
    expect(chunks).toHaveLength(3);
    expect(chunks[1].text.startsWith('<Tab name="App Services UI">')).toBe(
      true
    );
    expect(chunks[2].text.startsWith('<Tab name="App Services CLI">')).toBe(
      true
    );
  });
  it("excludes chunks with fewer than minChunkSize tokens", async () => {
    const chunks = await chunkPage(
      {
        ...page,
        body: `less than 25 tokens`,
      },
      {
        transform: standardChunkFrontMatterUpdater,
        minChunkSize: 25,
      }
    );
    expect(chunks).toHaveLength(0);
  });
});
