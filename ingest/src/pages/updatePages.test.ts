import { Page, PersistedPage } from "chat-core";
import { persistPages } from "./updatePages";
import { makeMockPageStore } from "../test/MockPageStore";

const examplePage: Page = {
  title: "Example",
  body: "",
  format: "md",
  sourceName: "test",
  metadata: {
    tags: [],
  },
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

  it("deletes pages when the base url changed", async () => {
    const store = makeMockPageStore();

    await persistPages({
      pages: [{ ...examplePage }],
      store,
      sourceName: "test",
    });

    let pages = await store.loadPages();
    expect(pages.length).toBe(1);
    expect(pages[0]).toMatchObject<Partial<PersistedPage>>({
      ...examplePage,
      action: "created",
    });
    const v2Url = `${examplePage.url}/v2`;
    await persistPages({
      pages: [{ ...examplePage, url: v2Url }],
      store,
      sourceName: "test",
    });

    pages = await store.loadPages();
    expect(pages.length).toBe(2);
    expect(pages[0]).toMatchObject<Partial<PersistedPage>>({
      ...examplePage,
      action: "deleted",
    });
    expect(pages[1]).toMatchObject<Partial<PersistedPage>>({
      ...examplePage,
      url: v2Url,
      action: "created",
    });
  });
});
