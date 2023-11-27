import { Page } from "mongodb-rag-core";
import {
  TiCatalogItem,
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
  tiCatalogFilterFunc,
  metadata,
}: MakeMongoDbUniversityDataSourceParams) {
  const uniDataApiClient = makeMongoDbUniversityDataApiClient({
    baseUrl,
    apiKey,
  });
  return async () => {
    const { data: allTiCatalogItems } =
      await uniDataApiClient.getAllCatalogItems();
    const tiCatalogItems = allTiCatalogItems.filter(tiCatalogFilterFunc);
    const { data: videos } = await uniDataApiClient.getAllVideos();
    const universityPages = makeUniversityPages({
      tiCatalogItems,
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
  tiCatalogItems,
  videos,
  metadata,
}: {
  tiCatalogItems: TiCatalogItem[];
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
export function convertVideoTranscriptFromSrtToTxt(transcript: string): string {
  const withoutTimestamps = transcript.replace(
    /^\d+\n\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}\n/gm,
    ""
  );

  return withoutTimestamps.trim();
}
