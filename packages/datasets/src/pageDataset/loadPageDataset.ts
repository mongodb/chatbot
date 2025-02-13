import { MongoDbPageStore, PersistedPage } from "mongodb-rag-core";

export type PageDatasetEntry = Pick<
  PersistedPage,
  "url" | "body" | "metadata" | "title" | "sourceName" | "updated" | "format"
>;

/**
  @param pageStore - datastore for pages
  @param dataSourceRegex - regular expression to filter pages by dataSource
  @param forbiddenUrls - set of urls to exclude from the dataset
 */
export async function loadPagesDataset(
  pageStore: MongoDbPageStore,
  dataSourceRegex: RegExp,
  forbiddenUrls: string[],
  updatedSince?: Date
): Promise<PageDatasetEntry[]> {
  return pageStore.aggregatePages<PageDatasetEntry>([
    {
      $match: {
        sourceName: { $regex: dataSourceRegex },
        url: { $nin: forbiddenUrls },
        action: { $ne: "deleted" },
        ...(updatedSince && { updated: { $gt: updatedSince } }),
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
