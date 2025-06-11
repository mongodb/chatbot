import {
  makeMarkdownUrlDataSource,
  MakeMarkdownUrlDataSourceParams,
  removeDotMdFromUrl,
} from "./MarkdownUrlDataSource";

describe("MarkdownUrlDataSource", () => {
  it("should get markdown content as Page from urls", async () => {
    const params: MakeMarkdownUrlDataSourceParams = {
      sourceName: "test-source",
      markdownUrls: ["https://docs.voyageai.com/docs/introduction.md"],
      sourceType: "source-type",
      metadata: {
        arbitrary: "data",
      },
    };
    const mdUrlDataSource = makeMarkdownUrlDataSource(params);

    const pages = await mdUrlDataSource.fetchPages();

    // Page got
    expect(pages.length).toBe(1);

    // Page attrs are correct
    const page = pages[0];
    expect(page.url).toBe(params.markdownUrls[0]);
    expect(page.sourceType).toBe(params.sourceType);
    expect(page.title).toBeTruthy();
    expect(page.format).toBe("md");
    expect(page.body).toBeTruthy();
    expect(page.sourceName).toBe(params.sourceName);
  });

  it("should exclude non-markdown pages from result", async () => {
    const urlsWithInvalidUrl: string[] = [
      "https://docs.voyageai.com/docs/introduction.md",
      "https://docs.voyageai.com/discuss.md", // There is no markdown content on this page
    ];

    const params: MakeMarkdownUrlDataSourceParams = {
      sourceName: "test-source",
      markdownUrls: urlsWithInvalidUrl,
      sourceType: "source-type",
      metadata: {
        arbitrary: "data",
      },
    };
    const mdUrlDataSource = makeMarkdownUrlDataSource(params);

    const pages = await mdUrlDataSource.fetchPages();

    // Only retrieved valid Pages
    expect(pages.length).toBe(1);
    expect(pages[0].url).toBe(urlsWithInvalidUrl[0]);
  });
});
