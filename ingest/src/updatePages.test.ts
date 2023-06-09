import {
  fetchPages,
  persistPages,
  Page,
  PageStore,
  PersistedPage,
} from "./updatePages";

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
  source: "test",
  tags: [],
  url: "https://example.com/test",
};

describe("fetchPages", () => {
  it("fetches pages from the data source", async () => {
    const pages = await fetchPages({
      sources: [
        {
          name: "test",
          async fetchPages() {
            return [{ ...examplePage }];
          },
        },
      ],
    });

    expect(pages.length).toBe(1);
    expect(pages[0]).toStrictEqual(examplePage);
  });
});

describe("persistPages", () => {
  it("persists pages in the page store", async () => {
    const store = new MockPageStore();

    await persistPages({
      pages: [{ ...examplePage }],
      store,
    });

    const pages = await store.loadPages();
    expect(pages.length).toBe(1);
    expect(pages[0]).toMatchObject<Partial<PersistedPage>>({
      ...examplePage,
      action: "created",
    });
  });
});
