import { Page } from "mongodb-rag-core";
import {
  TiCatalogueItem,
  UniversityVideo,
  makeMongoDbUniversityDataApiClient,
} from "./MongoDbUniversityDataApiClient";
import { MakeMongoDbUniversityDataSourceParams } from "./MongoDbUniversityDataSource";

/**
  Create a {@link DataSource.fetchPages()} function
  for the MongoDB University Data API.
 */
export function makeFetchUniversityPagesFunc({
  baseUrl,
  apiKey,
  tiCatalogueFilterFunc,
  metadata,
}: MakeMongoDbUniversityDataSourceParams) {
  const uniDataApiClient = makeMongoDbUniversityDataApiClient({
    baseUrl,
    apiKey,
  });
  return async () => {
    const allTiCatalogueItems = await uniDataApiClient.getAllTiCatalogueItems();
    const tiCatalogueItems = allTiCatalogueItems.filter(tiCatalogueFilterFunc);
    const videos = await uniDataApiClient.getAllDataApiVideos();
    const universityPages = makeUniversityPages({
      tiCatalogueItems,
      videos,
      metadata,
    });
    return universityPages;
  };
}

/**
  Helper function to create {@link Page} objects
  for MongoDB University content.
 */
export function makeUniversityPages({
  tiCatalogueItems,
  videos,
  metadata,
}: {
  tiCatalogueItems: TiCatalogueItem[];
  videos: UniversityVideo[];
  metadata: Record<string, unknown>;
}): Page[] {
  // TODO
  return [];
}

/**
  Helper function to convert MongoDB University video transcripts from
  [SRT format](https://mailchimp.com/resources/what-is-an-srt-file/) to plain text.
 */
export function cleanVideoTranscript(transcript: string): string {
  const withoutTimestamps = transcript.replace(
    /^\d+\n\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}\n/gm,
    ""
  );

  return withoutTimestamps.trim();
}
