import { Page, PageMetadata } from "mongodb-rag-core";
import {
  TiCatalogItem,
  UniversityVideo,
} from "./MongoDbUniversityDataApiClient";

export const UNI_BASE_URL = "https://learn.mongodb.com";

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
  metadata?: PageMetadata;
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
  metadata?: PageMetadata;
}): Page[] {
  const pages: Page[] = [];
  for (const catalogItem of tiCatalogItems) {
    /* Create page for higher level courses.
     * Higher level courses are Leanring Paths and Courses that have nested content.
     * Nested content is made up of other TiCatalogItems such as Units and Learning Bytes.
     * Note: Higher level courses do not have videos, but their nested content does.
     */
    if (
      catalogItem.learning_format === "Learning Path" ||
      catalogItem.learning_format === "Course"
    ) {
      const page: Page = {
        sourceName,
        url: `${UNI_BASE_URL}/learning-paths/${catalogItem.slug}`,
        title: catalogItem.name,
        format: "md",
        body: generateContentDescriptionMarkdown({
          tiCatalogItem: catalogItem,
        }),
        metadata: {
          ...(metadata ?? {}),
          tags: [...(metadata?.tags ?? []), "landing page"],
          learningFormat: catalogItem.learning_format,
        },
      };
      pages.push(page);
      continue;
    }
    for (const section of catalogItem.sections ?? []) {
      for (const lesson of section.lessons ?? []) {
        // Don't create a page for lessons without videos.
        if (lesson.videos.length === 0) {
          continue;
        }
        const courseTitle = catalogItem.name;
        const sectionTitle = section.title;
        const lessonTitle = lesson.title;
        // If cannot find videos for page, skip adding it.
        const body = makeUniversityPageBody({
          videoIds: lesson.videos,
          videoDict,
        });
        if (body.length === 0) {
          continue;
        }
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
          body,
          metadata: {
            ...(metadata ?? {}),
            // We choose to not include tags returned by the API (i.e.
            // `catalogItem.tags`) here and instead only use tags we specify in
            // our config. The API tags may contain internal or customer-specific
            // data that we don't want to include in the embeddings.
            tags: [...(metadata?.tags ?? []), "transcript"],
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
    if (
      video === undefined ||
      video.caption === undefined ||
      video.caption === null
    ) {
      return "";
    }

    return convertVideoTranscriptFromSrtToTxt(video.caption.text);
  });
  return videoTranscripts.join("\n").trim();
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
  return `${UNI_BASE_URL}/learn/course/${catalogItemSlug}/${sectionSlug}/${lessonSlug}`;
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

/**
  Helper function to create Markdown content for MongoDB University Learning Paths and Courses
  based on titles, duration, and descriptions.
 */
export function generateContentDescriptionMarkdown({
  tiCatalogItem,
}: {
  tiCatalogItem: TiCatalogItem;
}): string {
  const { name, description, nested_content } = tiCatalogItem;
  const title = `# ${name}`;
  let markdownContent = title + "\n\n" + description + "\n\n";
  if (nested_content) {
    for (const nested of nested_content) {
      const { name, duration, description, slug } = nested;
      const title = `## ${name}`;
      const link = `[View Details](${UNI_BASE_URL}/courses/${slug})`;
      markdownContent +=
        title +
        "\n\n" +
        duration +
        "\n\n" +
        description +
        "\n\n" +
        link +
        "\n\n";
    }
  }
  return markdownContent.slice(0, -2); // Remove the last 2 newlines
}
