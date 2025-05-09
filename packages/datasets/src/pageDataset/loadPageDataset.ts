import { MongoDbPageStore, PersistedPage } from "mongodb-rag-core";

type PageDatasetEntry = Pick<
  PersistedPage,
  "url" | "body" | "metadata" | "title" | "sourceName" | "updated" | "format"
>;

export interface LoadPagesDatasetParams {
  pageStore: MongoDbPageStore;
  /**
    Regular expression to filter pages by `Page.dataSource`
   */
  dataSourceTypes: string[];
  /**
    Set of urls to exclude from the dataset
   */
  forbiddenUrls: string[];
}

export async function loadPagesDataset({
  pageStore,
  dataSourceTypes,
  forbiddenUrls,
}: LoadPagesDatasetParams): Promise<PageDatasetEntry[]> {
  return pageStore.aggregatePages<PageDatasetEntry>([
    {
      $match: {
        sourceType: {$in: dataSourceTypes},
        url: { $nin: forbiddenUrls },
        action: { $ne: "deleted" },
        $or: [
          { "metadata.version.isCurrent": { $exists: false } },
          { "metadata.version.isCurrent": true },
        ],
      },
    },
    {
      $project: {
        url: 1,
        body: 1,
        title: 1,
        format: 1,
        metadata: 1,
        sourceName: 1,
        updated: 1,
      },
    },
  ]);
}
