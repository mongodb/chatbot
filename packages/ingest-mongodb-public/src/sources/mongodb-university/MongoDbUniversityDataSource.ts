import { PageMetadata } from "mongodb-rag-core";
import { DataSource } from "../../../../mongodb-rag-ingest/src/sources/DataSource";
import { makeUniversityPages } from "./makeUniversityPages";
import {
  TiCatalogItem,
  makeMongoDbUniversityDataApiClient,
} from "./MongoDbUniversityDataApiClient";

/**
  Parameters for constructing a MongoDB University Data API source.
 */
export interface MakeMongoDbUniversityDataSourceParams {
  /**
    Name of the MongoDB University Data API source.
    Maps to the {@link DataSource.name}.
   */
  sourceName: string;

  /**
    Base URL for the MongoDB University Data API.
   */
  baseUrl: string;

  /**
    API key for the MongoDB University Data API.
   */
  apiKey: string;

  /**
    Filter function for filtering out items from the MongoDB University
    catalog. For example, you may want to only ingest items that are
    in public content.

    To only ingest public, published, and non-legacy
    MongoDB University content, use the
    {@link filterOnlyPublicActiveTiCatalogItems} filter function.
   */
  tiCatalogFilterFunc: (item: TiCatalogItem) => boolean;

  /**
      Metadata for the MongoDB University Data API source.
      Included in the {@link Page.metadata} for each page.
     */
  metadata?: PageMetadata;
}

/**
  Filter function to only include public, published,
  and non-legacy MongoDB University content.

  > ⚠️ **Important** ⚠️
  >
  > You should include *only* this content or a subset of it
  > in externally facing applications.
 */
export const filterOnlyPublicActiveTiCatalogItems: MakeMongoDbUniversityDataSourceParams["tiCatalogFilterFunc"] =
  (item: TiCatalogItem) =>
    item.microsites.includes("University") &&
    item.status === "published" &&
    item.in_development === false &&
    item.legacy === false &&
    item.associated_videos.length > 0;

/**
  Data source constructor function for ingesting data
  from the MongoDB University Data API.
  (This is an internal API.)
 */
export function makeMongoDbUniversityDataSource(
  params: MakeMongoDbUniversityDataSourceParams
): DataSource {
  return {
    name: params.sourceName,
    async fetchPages() {
      const uniDataApiClient = makeMongoDbUniversityDataApiClient({
        baseUrl: params.baseUrl,
        apiKey: params.apiKey,
      });
      const { data: allTiCatalogItems } =
        await uniDataApiClient.getAllCatalogItems();
      const tiCatalogItems = allTiCatalogItems.filter(
        params.tiCatalogFilterFunc
      );
      const { data: videos } = await uniDataApiClient.getAllVideos();
      const universityPages = makeUniversityPages({
        sourceName: params.sourceName,
        tiCatalogItems,
        videos,
        metadata: params.metadata,
      });
      return universityPages;
    },
  };
}
