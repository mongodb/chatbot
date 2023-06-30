import { Page, PageStore, PersistedPage } from "chat-core";
import { persistPages } from "./updatePages";

export const makeMockPageStore = (): PageStore => {
  let pages: PersistedPage[] = [];
  return {
    async loadPages() {
      return pages;
    },
    async updatePages(args: PersistedPage[]) {
      pages = [...args];
    },
  };
};

const examplePage: Page = {
  body: "",
  format: "md",
  sourceName: "test",
  tags: [],
  url: "https://example.com/test",
};

describe("persistPages", () => {
  it("persists pages in the page store", async () => {
    const store = makeMockPageStore();

    await persistPages({
      pages: [{ ...examplePage }],
      store,
      sourceName: "test",
    });

    const pages = await store.loadPages();
    expect(pages.length).toBe(1);
    expect(pages[0]).toMatchObject<Partial<PersistedPage>>({
      ...examplePage,
      action: "created",
    });
  });
});
