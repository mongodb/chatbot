import { persistPages, Page, PageStore, PersistedPage } from "./updatePages";

export class MockPageStore implements PageStore {
  pages: PersistedPage[] = [];

  loadPages = async (): Promise<PersistedPage[]> => {
    return this.pages;
  };

  updatePages = async (args: PersistedPage[]): Promise<void> => {
    this.pages = [...args];
  };
}

const examplePage: Page = {
  body: "",
  format: "md",
  sourceName: "test",
  tags: [],
  url: "https://example.com/test",
};

describe("persistPages", () => {
  it("persists pages in the page store", async () => {
    const store = new MockPageStore();

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
