import { PersistedPage } from "./updatePages";

export const updateChunks = async (args: { since: Date }): Promise<void> => {
  const changedPages = await loadChangedPages(args);

  // TODO: This is a stand-in for an Atlas collection
  const store = {
    async deleteChunks() {
      // TODO
    },
    async updateChunks() {
      // TODO
    },
  };

  const promises = changedPages.map(async (page) => {
    switch (page.action) {
      case "deleted":
        return deleteChunksForPage({ store, page });
      case "created": // fallthrough
      case "updated":
        return updateChunksForPage({ store, page });
    }
  });

  await Promise.all(promises);
};

export type ChunkStore = {
  deleteChunks(): Promise<void>;
  updateChunks(args: {
    page: PersistedPage;
    chunks: EmbeddedChunk[];
  }): Promise<void>;
};

export const loadChangedPages = async (args: {
  since: Date;
}): Promise<PersistedPage[]> => {
  // TODO
  return [];
};

export const deleteChunksForPage = async (args: {
  page: PersistedPage;
  store: ChunkStore;
}): Promise<void> => {
  // TODO: Delete chunks for page
};

export const updateChunksForPage = async ({
  page,
  store,
}: {
  page: PersistedPage;
  store: ChunkStore;
}): Promise<void> => {
  const chunks = await chunkPage(page);

  const embeddedChunks = await Promise.all(chunks.map(embedChunk));

  await store.updateChunks({ page, chunks: embeddedChunks });
};

export type Chunk = {
  url: string;
  text: string;
  // ... TODO ...
};

export const chunkPage = async (page: PersistedPage): Promise<Chunk[]> => {
  // TODO
  return [];
};

export type EmbeddedChunk = Chunk & {
  embedding: number[];
};

export const embedChunk = async (chunk: Chunk): Promise<EmbeddedChunk> => {
  // TODO
  return { ...chunk, embedding: [] };
};
