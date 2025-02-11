import { MongoDbPageStore, PersistedPage } from "mongodb-rag-core";

type PageDatasetEntry = Pick<
  PersistedPage,
  "url" | "body" | "metadata" | "title" | "sourceName" | "updated" | "format"
>;

export async function loadPagesDataset(
  pageStore: MongoDbPageStore,
  dataSources: string[],
  forbiddenUrls: Set<string>
): Promise<PageDatasetEntry[]> {
  const pages = await pageStore.loadPages({
    query: {
      dataSources,
      url: { $nin: Array.from(forbiddenUrls) },
      action: { $ne: "deleted" },
    },
  });
  const pagesToExport = pages.map((page) => {
    return {
      url: page.url,
      body: page.body,
      title: page.title,
      format: page.format,
      metadata: page.metadata,
      sourceName: page.sourceName,
      updated: page.updated,
    } satisfies PageDatasetEntry;
  });
  return pagesToExport;
}
