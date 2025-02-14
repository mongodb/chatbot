import { makeMongoDbPageStore } from "./MongoDbPageStore";
import { makeMongoDbTransformedContentStore } from "./MongoDbTransformedContentStore";
import { Page } from "./Page";
import { TransformedContent } from "./TransformedContent";
import { persistPages } from "./updatePages";
import { updateTransformedContent } from "./updateTransformedContent";

const examplePage: Page = {
  title: "Example",
  body: "this is a test page. testy test test test test test test test test. more tokens!",
  format: "md",
  sourceName: "test",
  metadata: {
    tags: [],
  },
  url: "https://example.com/test",
};

const exampleTransformed: TransformedContent[] = [
  {
    sourceName: "test",
    text: "FOOBAR!! this is a test page. testy test test test test test test test test. more tokens!",
    url: "https://example.com/test",
    updated: new Date(),
  },
];

const transformPage = async () => {
  return exampleTransformed;
};

describe("updateEmbeddedContent", () => {
  const pageStore = makeMongoDbPageStore({
    // TODO: use in-memory database for testing
  });
  const transformedContentStore = makeMongoDbTransformedContentStore({
    // TODO: use in-memory database for testing
  });
  it("deletes embedded content for deleted page", async () => {
    await persistPages({
      pages: [{ ...examplePage }],
      store: pageStore,
      sourceName: "test",
    });
    let pages = await pageStore.loadPages();
    expect(pages).toHaveLength(1);

    const since = new Date("2000-01-01");

    await updateTransformedContent({
      transformedContentStore,
      pageStore,
      since,
      transformPage,
    });

    let embeddedContent = await transformedContentStore.loadContent({
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

    await updateTransformedContent({
      pageStore,
      since,
      transformedContentStore,
      transformPage,
    });
    embeddedContent = await transformedContentStore.loadContent({
      page: examplePage,
    });
    // Embedded content for page was deleted
    expect(embeddedContent).toHaveLength(0);
  });
  // TODO: this will need updates...should prob be more clever than current test
  it("updates page if chunk algorithm changes", async () => {
    await persistPages({
      pages: [{ ...examplePage }],
      store: pageStore,
      sourceName: "test",
    });
    const pages = await pageStore.loadPages();
    expect(pages).toHaveLength(1);

    const since = new Date("2000-01-01");

    await updateTransformedContent({
      transformedContentStore,
      pageStore,
      since,
      transformPage,
    });

    const embeddedContent = await transformedContentStore.loadContent({
      page: examplePage,
    });
    expect(embeddedContent).toHaveLength(1);
    expect(embeddedContent[0].transformAlgoHash).toBe(
      // You might need to update this expectation when the standard chunkPage
      // function changes
      "49d78a1d6b12ee6f433a2156060ed5ebfdefb8a90301f1c2fb04e4524944c5eb"
    );
    await updateTransformedContent({
      transformedContentStore,
      pageStore,
      since,
      transformPage,
    });
    const embeddedContent2 = await transformedContentStore.loadContent({
      page: examplePage,
    });
    expect(embeddedContent2).toHaveLength(1);
    expect(embeddedContent2[0].transformAlgoHash).toBe(
      // You might need to update this expectation when the standard chunkPage
      // function changes
      "2cbfe9901657ca15260fe7f58c3132ac1ebd0d610896082ca1aaad0335f2e3f1"
    );
  });

  // TODO: this'll need some update too
  describe("updateEmbeddedContent handles concurrency", () => {
    const startTimes: number[] = [];
    const endTimes: number[] = [];

    let chunkPageSpy: jest.SpyInstance;

    it("processes pages concurrently", async () => {
      const concurrentPages: Page[] = [
        { ...examplePage, url: "https://example.com/test1" },
        { ...examplePage, url: "https://example.com/test2" },
        { ...examplePage, url: "https://example.com/test3" },
      ];

      await persistPages({
        pages: concurrentPages,
        store: pageStore,
        sourceName: "test",
      });

      const since = new Date("2000-01-01");

      await updateTransformedContent({
        transformedContentStore,
        pageStore,
        since,
        transformPage,
      });

      const executionPairs = startTimes.map((startTime, i) => ({
        startTime,
        endTime: endTimes[i],
      }));

      // Ensure some overlaps indicating concurrency
      expect(
        executionPairs.some((pair, i, pairs) =>
          pairs.some(
            (otherPair, j) =>
              i !== j &&
              pair.startTime < otherPair.endTime &&
              otherPair.startTime < pair.endTime
          )
        )
      ).toBe(true);
    });
  });
});
