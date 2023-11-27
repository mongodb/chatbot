import { Page } from "mongodb-rag-core";
import {
  TiCatalogItem,
  UniversityVideo,
} from "./MongoDbUniversityDataApiClient";

/**
  Helper function to create {@link Page} objects
  for MongoDB University content.
 */
export function makeUniversityPages({
  sourceName,
  tiCatalogItems,
  videos,
  metadata,
}: {
  sourceName: string;
  tiCatalogItems: TiCatalogItem[];
  videos: UniversityVideo[];
  metadata?: Record<string, unknown>;
}): Page[] {
  // Create a dictionary of videos keyed by their hashed ID.
  // This is used to efficiently look up the video for a lesson.
  const videoDict = makeVideosDictionary(videos);

  const catalogItemPages = makeCatalogItemPages({
    sourceName,
    tiCatalogItems,
    videoDict,
    metadata,
  });
  return catalogItemPages;
}

function makeCatalogItemPages({
  sourceName,
  tiCatalogItems,
  videoDict,
  metadata,
}: {
  sourceName: string;
  tiCatalogItems: TiCatalogItem[];
  videoDict: VideosDict;
  metadata?: Record<string, unknown>;
}): Page[] {
  const pages: Page[] = [];
  for (const catalogItem of tiCatalogItems) {
    for (const section of catalogItem.sections) {
      for (const lesson of section.lessons) {
        // Don't create a page for lessons without videos.
        if (lesson.videos.length === 0) {
          continue;
        }
        const courseTitle = catalogItem.name;
        const sectionTitle = section.title;
        const lessonTitle = lesson.title;
        const page: Page = {
          sourceName,
          url: makeUniversityPageUrl({
            catalogItemSlug: catalogItem.slug,
            sectionSlug: section.slug,
            lessonSlug: lesson.slug,
          }),
          title: makeUniversityPageTitle({
            courseTitle,
            sectionTitle,
            lessonTitle,
          }),
          format: "txt",
          body: makeUniversityPageBody({
            videoIds: lesson.videos,
            videoDict,
          }),
          metadata: {
            ...(metadata ?? {}),
            tags: [
              // eslint-disable-next-line no-unsafe-optional-chaining
              // @ts-ignore
              ...(Array.isArray(metadata?.tags) ? metadata.tags : []),
              ...catalogItem.tags,
            ],
            courseTitle,
            sectionTitle,
            lessonTitle,
          },
        };
        pages.push(page);
      }
    }
  }

  return pages;
}

/**
  Helper function to create the body of a MongoDB University page.
  This is the transcript of the videos in the lesson.
 */
function makeUniversityPageBody({
  videoIds,
  videoDict,
}: {
  videoIds: string[];
  videoDict: VideosDict;
}): string {
  const videoTranscripts = videoIds.map((videoId) => {
    const video = videoDict[videoId];
    // If video is not found, return an empty string.
    if (video === undefined) {
      return "";
    }

    return convertVideoTranscriptFromSrtToTxt(video.caption.text);
  });
  return videoTranscripts.join("\n");
}

type VideosDict = Record<string, UniversityVideo>;
/**
  Helper function to create a dictionary of MongoDB University videos
  keyed by their hashed ID.
 */
function makeVideosDictionary(videos: UniversityVideo[]): VideosDict {
  const videosDictionary: VideosDict = {};
  for (const video of videos) {
    videosDictionary[video.hashed_id] = video;
  }
  return videosDictionary;
}

/**
  Helper function to create the page title for a MongoDB University lesson.
 */
function makeUniversityPageTitle({
  courseTitle,
  sectionTitle,
  lessonTitle,
}: {
  courseTitle: string;
  sectionTitle: string;
  lessonTitle: string;
}): string {
  return `${courseTitle} - ${sectionTitle} - ${lessonTitle}`;
}

/**
  Helper function to create the page URL for a MongoDB University lesson.
 */
function makeUniversityPageUrl({
  catalogItemSlug,
  sectionSlug,
  lessonSlug,
}: {
  catalogItemSlug: string;
  sectionSlug: string;
  lessonSlug: string;
}) {
  return `https://learn.mongodb.com/learn/course/${catalogItemSlug}/${sectionSlug}/${lessonSlug}`;
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
  return withoutTimestamps
    .split(/\n+/)
    .map((line) => line.trim())
    .join(" ")
    .trim();
}
