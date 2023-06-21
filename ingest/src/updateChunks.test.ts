import { loadChangedPages } from "./updateChunks";
import { MockPageStore } from "./updatePages.test";

describe("loadChangedPages", () => {
  it("loads pages that have changed since the given date", async () => {
    const pageStore = new MockPageStore();

    await pageStore.updatePages([
      {
        action: "created",
        body: "The Matrix (1999) comes out",
        format: "md",
        sourceName: "",
        tags: [],
        updated: new Date("1999-03-31"),
        url: "matrix1",
      },
      {
        action: "created",
        body: "The Matrix: Reloaded (2003) comes out",
        format: "md",
        sourceName: "",
        tags: [],
        updated: new Date("2003-05-15"),
        url: "matrix2",
      },
    ]);

    const changedPages = await loadChangedPages({
      since: new Date("2000-01-01"),
      pageStore,
    });

    expect(changedPages.length).toBe(1);
    expect(changedPages[0].url).toBe("matrix2");
  });
});

// TODO
