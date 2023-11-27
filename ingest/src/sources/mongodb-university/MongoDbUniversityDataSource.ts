import { Page } from "mongodb-rag-core";
import { DataSource } from "../DataSource";
import { makeFetchUniversityPagesFunc } from "./FetchUniversityPagesFunc";

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
      catalogue. For example, you may want to only ingest items that are
      in public content.
     */
  tiCatalogueFilterFunc: (ti: TiCatalogueItem) => boolean;

  /**
      Metadata for the MongoDB University Data API source.
      Included in the {@link Page.metadata} for each page.
     */
  metadata: Record<string, unknown>;
}
/**
  Source constructor for ingesting data from the MongoDB University Data API.
 */
export function makeMongoDbUniversityDataSource(
  params: MakeMongoDbUniversityDataSourceParams
): DataSource {
  return {
    name: params.sourceName,
    fetchPages: makeFetchUniversityPagesFunc(params),
  };
}
