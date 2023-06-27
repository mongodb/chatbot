import { PersistedPage, PageStore } from "./updatePages";

/**
  (Re-)embeddedContent the pages in the page store that have changed since the given date
  and stores the embeddedContent in the embeddedContent store.
 */
export const updateEmbeddedContent = async ({
  since,
  embeddedContentStore,
  pageStore,
}: {
  since: Date;
  embeddedContentStore: EmbeddedContentStore;
  pageStore: PageStore;
}): Promise<void> => {
  const changedPages = await loadChangedPages({ since, pageStore });

  const promises = changedPages.map(async (page) => {
    switch (page.action) {
      case "deleted":
        return deleteEmbeddedContentForPage({
          store: embeddedContentStore,
          page,
        });
      case "created": // fallthrough
      case "updated":
        return updateEmbeddedContentForPage({
          store: embeddedContentStore,
          page,
        });
    }
  });

  await Promise.all(promises);
};

export type EmbeddedContentStore = {
  /**
    Load the embeddedContent for the given page.
   */
  loadEmbeddedContent(args: { page: PersistedPage }): Promise<ContentChunk[]>;

  /**
    Delete all embeddedContent for the given page.
   */
  deleteEmbeddedContent(args: { page: PersistedPage }): Promise<void>;

  /**
    Replace all embeddedContent for the given page with the given embeddedContent.
   */
  updateEmbeddedContent(args: {
    page: PersistedPage;
    embeddedContent: EmbeddedContent[];
  }): Promise<void>;
};

export const loadChangedPages = async (args: {
  since: Date;
  pageStore: PageStore;
}): Promise<PersistedPage[]> => {
  // TODO
  return [];
};

export const deleteEmbeddedContentForPage = async (args: {
  page: PersistedPage;
  store: EmbeddedContentStore;
}): Promise<void> => {
  // TODO: Delete embeddedContent for page
};

export const updateEmbeddedContentForPage = async ({
  page,
  store,
}: {
  page: PersistedPage;
  store: EmbeddedContentStore;
}): Promise<void> => {
  const chunks = await chunkPage(page);

  const embeddedEmbeddedContent = await Promise.all(chunks.map(embedContent));

  await store.updateEmbeddedContent({
    page,
    embeddedContent: embeddedEmbeddedContent,
  });
};

export type ContentChunk = {
  source: string;
  url: string;
  text: string;
  // ... TODO ...
};

export const chunkPage = async (
  page: PersistedPage
): Promise<ContentChunk[]> => {
  // TODO
  return [];
};

export type EmbeddedContent = ContentChunk & {
  embedding: number[];
};

export const embedContent = async (
  content: ContentChunk
): Promise<EmbeddedContent> => {
  // TODO
  return { ...content, embedding: [] };
};
