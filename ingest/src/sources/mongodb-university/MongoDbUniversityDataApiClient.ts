/**
  Item in the Thought Industries catalogue as returned from the
  MongoDB University Data API.
 */
export interface TiCatalogueItem {
  id: string;
  ti_id: string;
  /**
        IDs for videos associated with the catalogue item.
       */
  associated_videos: string[];
  /**
        Learning format for the catalogue item.
        @example "Unit" || "Course" || "Lab" || "...etc"
       */
  learning_format: string;
  name: string;
  slug: string;
  status: string;
  tags: string[];
  legacy: boolean;
  /**
        Thought Industries microsites associated with the catalogue item.
        @example ["University", "Technical Services"]
       */
  microsites: string[];
  /**
        IDs of labs associated with the catalogue item.
       */
  associated_labs: string[];
  // TODO: is this always null?
  associated_content: null | any;
  /**
        Whether or not the catalogue item is in development.
        TODO: does this mean the item is not yet published?
       */
  in_development: boolean;
  created_at: string;
  /**
        Sections in the catalogue item. This contains metadata
        about the sections and lessons.
       */
  sections: TiCatalogueSection[];
}

interface TiCatalogueSection {
  slug: string;
  title: string;
  lessons: TiCatalogueLesson[];
}

interface TiCatalogueLesson {
  slug: string;
  title: string;
  labs: string[]; // Assuming 'labs' is an array of strings, similar to 'videos'.
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
  caption: VideoCaption;
}

type VideoStatistics = {
  avg_rating: number;
  number_of_ratings: number;
  play_count: number;
  hours_watched: number;
  engagement: number;
};

type VideoCaption = {
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
};

export interface MongoDbUniversityDataApiClient {
  /**
    Load all the catalogue items from the MongoDB University
    Data API.
   */
  getAllTiCatalogueItems(): Promise<TiCatalogueItem[]>;
  /**
    Helper function to load all the videos from the MongoDB University Data API.
   */
  getAllDataApiVideos(): Promise<UniversityVideo[]>;
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
  return {
    async getAllTiCatalogueItems() {
      // TODO: add logic. straightforward fetch operation
      return [];
    },
    async getAllDataApiVideos() {
      // TODO: add logic...will have pagination
      return [];
    },
  };
}
