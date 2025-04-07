import { PageMetadata } from "mongodb-rag-core";
import { DataSource } from "mongodb-rag-core/dataSources";
import { makeUniversityPages } from "./makeUniversityPages";
import { makeMongoDbUniversityDataApiClient } from "./MongoDbUniversityDataApiClient";

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
   Filter parameters for University's /catalog/ti endpoint 
   of the MongoDB University Data API.
   */
  tiCatalogItems?: {
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
    publicOnly?: boolean;

    /**
     Whether to nest associated content in the catalog items.
     If true, content with associated content (such as Learning Paths and Courses)
     will have a nested_content field of type TiCatalogItems[].
    */
    nestAssociatedContent?: boolean;
  };

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
        publicOnly: params.tiCatalogItems?.publicOnly,
        nestAssociatedContent: params.tiCatalogItems?.nestAssociatedContent,
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
