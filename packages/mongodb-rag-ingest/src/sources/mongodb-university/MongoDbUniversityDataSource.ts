import { PageMetadata } from "mongodb-rag-core";
import { DataSource } from "../DataSource";
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
    Filter parameter for filtering out items from the MongoDB University
    catalog. For example, you may want to only ingest items that are
    in public content.

    To only ingest public, published, and non-legacy
    MongoDB University content, set public_pnly to `true`

    > ⚠️ **Important** ⚠️
    >
    > You should include *only* this content or a subset of it
    > in externally facing applications.
   */
  publicOnly: boolean;

  /**
      Metadata for the MongoDB University Data API source.
      Included in the {@link Page.metadata} for each page.
     */
  metadata?: PageMetadata;
}

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
      const { data: tiCatalogItems } = await uniDataApiClient.getCatalogItems({
        publicOnly: params.publicOnly,
        nestAssociatedContent: true,
      });
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
