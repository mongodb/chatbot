import { Page } from "chat-core";
import { getChangedPages } from "./getChangedPages";

describe("getChangedPages", () => {
  it("gets changed pages", async () => {
    const pageTemplate: Omit<Page, "url"> = {
      body: "abc",
      format: "md",
      sourceName: "test",
      tags: [],
    };
    const [page0, page1, page2, page3] = Array(4)
      .fill(0)
      .map(
        (_, i): Page => ({
          ...pageTemplate,
          url: `https://example.com/page/${i}`,
        })
      );

    expect(
      page0.url !== page1.url &&
        page1.url !== page2.url &&
        page2.url !== page3.url
    ).toBeTruthy();
    const changedPages = await getChangedPages({
      oldPages: [page0, page1, page2],
      newPages: [
        { ...page1, body: "modified!" }, // modified page
        page3, // new page
        page0, // unmodified page -- order shouldn't matter
        // no page2 --> deleted
      ],
    });

    expect(changedPages.length).toBe(3);
    expect(changedPages[0]).toMatchObject({
      action: "created",
      url: "https://example.com/page/3",
    });
    expect(changedPages[1]).toMatchObject({
      action: "deleted",
      url: "https://example.com/page/2",
    });
    expect(changedPages[2]).toMatchObject({
      action: "updated",
      url: "https://example.com/page/1",
    });
  });
  it("detects changed tags", async () => {
    const page: Page = {
      body: "abc",
      format: "md",
      sourceName: "test",
      url: "test",
      tags: ["test1", "test2"],
    };

    const changedPages = await getChangedPages({
      oldPages: [page],
      newPages: [{ ...page, tags: ["newTag", ...page.tags] }],
    });

    expect(changedPages.length).toBe(1);
    expect(changedPages[0]).toMatchObject({
      action: "updated",
      tags: ["newTag", ...page.tags],
    });
  });
});
