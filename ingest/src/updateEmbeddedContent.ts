import {
  EmbedFunc,
  EmbeddedContent,
  EmbeddedContentStore,
  PersistedPage,
  PageStore,
  logger,
} from "chat-core";
import { chunkPage, ChunkOptions } from "./chunkPage";

/**
  (Re-)embeddedContent the pages in the page store that have changed since the given date
  and stores the embeddedContent in the embeddedContent store.
 */
export const updateEmbeddedContent = async ({
  since,
  embeddedContentStore,
  pageStore,
  embed,
  chunkOptions,
}: {
  since: Date;
  embeddedContentStore: EmbeddedContentStore;
  pageStore: PageStore;
  embed: EmbedFunc;
  chunkOptions?: Partial<ChunkOptions>;
}): Promise<void> => {
  const changedPages = await pageStore.loadPages({ updated: since });
  logger.info(`Found ${changedPages.length} changed pages since ${since}`);
  for await (const page of changedPages) {
    switch (page.action) {
      case "deleted":
        logger.info(
          `Deleting embedded content for ${page.sourceName}:${page.url}`
        );
        await embeddedContentStore.deleteEmbeddedContent({
          page,
        });
        break;
      case "created": // fallthrough
      case "updated":
        logger.info(
          `${
            page.action === "created" ? "Creating" : "Updating"
          } embedded content for ${page.sourceName}:${page.url}`
        );
        await updateEmbeddedContentForPage({
          store: embeddedContentStore,
          page,
          chunkOptions,
          embed,
        });
    }
  }
};

export const updateEmbeddedContentForPage = async ({
  page,
  store,
  embed,
  chunkOptions,
}: {
  page: PersistedPage;
  store: EmbeddedContentStore;
  embed: EmbedFunc;
  chunkOptions?: Partial<ChunkOptions>;
}): Promise<void> => {
  const contentChunks = await chunkPage(page, chunkOptions);

  const embeddedContent = await Promise.all(
    contentChunks.map(async (chunk): Promise<EmbeddedContent> => {
      const { embedding } = await embed({
        text: chunk.text,
        userIp: "127.0.0.1",
      });
      return {
        ...chunk,
        embedding,
        updated: new Date(),
      };
    })
  );

  await store.updateEmbeddedContent({
    page,
    embeddedContent,
  });
};
