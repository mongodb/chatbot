import fetch from "node-fetch";
/**
  Item in the Thought Industries catalog as returned from the
  MongoDB University Data API.
 */
export interface TiCatalogItem {
  id: string;
  ti_id: string;
  /**
    IDs for videos associated with the catalog item.
   */
  associated_videos: string[];
  /**
    Learning format for the catalog item.
   */
  learning_format: TiCatalogLearningFormat;
  name: string;
  slug: string;
  status: string;
  tags: string[];
  legacy: boolean;
  /**
    Thought Industries microsites associated with the catalog item.
    @example ["University", "Technical Services"]
   */
  microsites: string[];
  /**
    IDs of labs associated with the catalog item.
   */
  associated_labs: string[];
  // TODO: is this always null?
  associated_content: null | unknown;
  /**
    Whether or not the catalog item is in development.
   */
  in_development: boolean;
  created_at: string;
  /**
    Sections in the catalog item. This contains metadata
    about the sections and lessons.
   */
  sections: TiCatalogSection[];
}

type TiCatalogLearningFormat =
  | "Certification"
  | "Course"
  | "Educator Content"
  | "Instructor Led"
  | "Lab"
  | "Learning Bytes"
  | "Learning Path"
  | "Resource"
  | "Unit"
  | "Video";

interface TiCatalogSection {
  slug: string;
  title: string;
  lessons: TiCatalogLesson[];
}

interface TiCatalogLesson {
  slug: string;
  title: string;
  labs: string[];
  videos: string[];
}

/**
  MongoDB University Video as returned from the MongoDB University Data API.
 */
export interface UniversityVideo {
  id: string;
  hashed_id: string;
  created: string;
  description: string;
  duration: number;
  name: string;
  progress: number;
  statistics: VideoStatistics;
  status: string;
  updated: string;
  caption: VideoCaption | null;
}

interface VideoStatistics {
  avg_rating: number;
  number_of_ratings: number;
  play_count: number;
  hours_watched: number;
  engagement: number;
}

interface VideoCaption {
  video_catalog_id: string;
  name: string;
  hashed_id: string;
  /**
    Transcript for the video.
   */
  text: string;
  language: string;
  status: string;
  updated: string;
}

interface ResponseMetadata {
  count: number;
  extra: null | unknown;
  total_count: number;
  has_more: boolean;
  limit: number;
  offset: number;
  filter: null | unknown;
}

interface GetAllCatalogItemsResponseData {
  data: TiCatalogItem[];
  metadata: ResponseMetadata;
}

interface GetAllVideosResponseData {
  /**
    All the videos from the MongoDB University Data API.
    Note that the API requires pagination through the videos,
    while this array contains all the videos.
   */
  data: UniversityVideo[];
  metadata: ResponseMetadata;
}

export interface MongoDbUniversityDataApiClient {
  /**
    Load all the catalog items from the MongoDB University
    Data API.
   */
  getAllCatalogItems(): Promise<GetAllCatalogItemsResponseData>;
  /**
    Load all the videos from the MongoDB University Data API.
   */
  getAllVideos(): Promise<GetAllVideosResponseData>;
}

/**
  Construct a {@link MongoDbUniversityDataApiClient}.
 */
export function makeMongoDbUniversityDataApiClient({
  baseUrl,
  apiKey,
}: {
  baseUrl: string;
  apiKey: string;
}) {
  const headers = {
    "X-API-KEY": apiKey,
  };

  return {
    async getAllCatalogItems() {
      const response = await fetch(`${baseUrl}/ti`, {
        headers,
      });
      const json = await response.json();
      return json as GetAllCatalogItemsResponseData;
    },
    async getAllVideos() {
      let offset = 0;
      const LIMIT = 300; // Maximum allowed by the MongoDB University Data API.
      let hasMoreVideos = true;
      const videos: UniversityVideo[] = [];
      let metadata: ResponseMetadata | undefined = undefined;
      while (hasMoreVideos === true) {
        const response = await fetch(
          `${baseUrl}/videos?limit=${LIMIT}&offset=${offset}`,
          {
            headers,
          }
        );
        const { data, metadata: resMetadata } =
          (await response.json()) as GetAllVideosResponseData;
        hasMoreVideos = resMetadata.has_more;
        offset += LIMIT;
        videos.push(...(data as UniversityVideo[]));
        metadata = resMetadata;
      }
      return { data: videos, metadata } as GetAllVideosResponseData;
    },
  };
}
