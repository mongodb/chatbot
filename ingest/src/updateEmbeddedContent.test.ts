import { EmbeddedContentStore, EmbeddedContent, Page } from "chat-core";
import { updateEmbeddedContent } from "./updateEmbeddedContent";
import { makeMockPageStore } from "./updatePages.test";
import { persistPages } from "./updatePages";

export const makeMockEmbeddedContentStore = (): EmbeddedContentStore => {
  const content: Map<string /* page url */, EmbeddedContent[]> = new Map();
  return {
    async deleteEmbeddedContent({ page }) {
      content.set(page.url, []);
    },
    async findNearestNeighbors() {
      return [];
    },
    async loadEmbeddedContent({ page }) {
      return content.get(page.url) ?? [];
    },
    async updateEmbeddedContent({ embeddedContent, page }) {
      content.set(page.url, [...embeddedContent]);
    },
  };
};

const examplePage: Page = {
  title: "Example",
  body: "this is a test page",
  format: "md",
  sourceName: "test",
  metadata: {
    tags: [],
  },
  url: "https://example.com/test",
};

const embed = async () => {
  return { embedding: [1, 2, 3] };
};

describe("updateEmbeddedContent", () => {
  it("deletes embedded content for deleted page", async () => {
    const pageStore = makeMockPageStore();

    await persistPages({
      pages: [{ ...examplePage }],
      store: pageStore,
      sourceName: "test",
    });
    let pages = await pageStore.loadPages();
    expect(pages).toHaveLength(1);

    const embeddedContentStore = makeMockEmbeddedContentStore();

    const since = new Date("2000-01-01");

    await updateEmbeddedContent({
      embed,
      embeddedContentStore,
      pageStore,
      since,
    });

    let embeddedContent = await embeddedContentStore.loadEmbeddedContent({
      page: examplePage,
    });
    expect(embeddedContent).toHaveLength(1);

    await persistPages({
      pages: [],
      store: pageStore,
      sourceName: "test",
    });
    pages = await pageStore.loadPages();
    expect(pages).toHaveLength(1);
    expect(pages[0].action).toBe("deleted");

    await updateEmbeddedContent({
      embed,
      embeddedContentStore,
      pageStore,
      since,
    });
    embeddedContent = await embeddedContentStore.loadEmbeddedContent({
      page: examplePage,
    });
    // Embedded content for page was deleted
    expect(embeddedContent).toHaveLength(0);
  });
  it("updates page if chunk algorithm changes", async () => {
    const pageStore = makeMockPageStore();

    await persistPages({
      pages: [{ ...examplePage }],
      store: pageStore,
      sourceName: "test",
    });
    const pages = await pageStore.loadPages();
    expect(pages).toHaveLength(1);

    const embeddedContentStore = makeMockEmbeddedContentStore();

    const since = new Date("2000-01-01");

    await updateEmbeddedContent({
      embed,
      embeddedContentStore,
      pageStore,
      since,
    });

    const embeddedContent = await embeddedContentStore.loadEmbeddedContent({
      page: examplePage,
    });
    expect(embeddedContent).toHaveLength(1);
    expect(embeddedContent[0].chunkAlgoHash).toBe(
      // You might need to update this expectation when the standard chunkPage
      // function changes
      "677e6ae06deadac2df75f74a131227a93e03f95b833edcd57f41e70d7e5589ed"
    );
    await updateEmbeddedContent({
      embed,
      embeddedContentStore,
      pageStore,
      since,
      chunkOptions: {
        // Changing options impacts the chunkAlgoHash
        chunkOverlap: 2,
      },
    });
    const embeddedContent2 = await embeddedContentStore.loadEmbeddedContent({
      page: examplePage,
    });
    expect(embeddedContent2).toHaveLength(1);
    expect(embeddedContent2[0].chunkAlgoHash).toBe(
      // You might need to update this expectation when the standard chunkPage
      // function changes
      "826958f2461ad5c12822dda95731981d293fb677407bd3ae568d29691a38eb3f"
    );
  });
});
