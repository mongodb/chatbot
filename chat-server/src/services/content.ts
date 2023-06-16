import { Collection, Db, ObjectId } from "mongodb";
import { mongodb } from "../integrations/mongodb";

export interface Site {
  /** The name of the website the chunk belongs to. */
  name: string;
  /** The base URL of the website the chunk belongs to. */
  url: string;
}

export interface Content {
  /** Unique identifier */
  _id: ObjectId;
  /** The URL of the page with the chunk content. */
  url: string;
  /** The text content of the chunk. */
  text: string;
  /** The number of embedding tokens in the chunk. */
  numTokens: number;
  /** The vector embedding of the chunk. */
  embedding: number[];
  /** The date the chunk was last updated. */
  lastUpdated: Date;
  /** Website the chunk belongs to. */
  site: Site;
  /** The tags associated with the chunk. */
  tags?: string[];
}

export interface ContentServiceInterface {
  findVectorMatches({ embedding }: { embedding: number[] }): Promise<Content[]>;
}

export interface ContentServiceOptions {
  k: number;
  path: string;
  indexName: string;
  minScore: number;
}

class ContentService implements ContentServiceInterface {
  private database: Db;
  private contentCollection: Collection<Content>;
  private options: ContentServiceOptions;
  constructor(db: Db, options: ContentServiceOptions) {
    this.database = db;
    this.contentCollection = this.database.collection("content");
    this.options = options;
  }
  async findVectorMatches({ embedding }: { embedding: number[] }) {
    const matchingContent = await this.contentCollection
      .aggregate<Content>([
        {
          $search: {
            index: this.options.indexName,
            knnBeta: {
              vector: embedding,
              path: this.options.path,
              k: this.options.k,
              // TODO: get it so only returns score >= .9
            },
          },
        },
      ])
      .toArray();
    return matchingContent;
  }
}

const options: ContentServiceOptions = {
  k: 10,
  path: "embedding",
  indexName: mongodb.vectorSearchIndexName || "default",
  minScore: 0.9,
};

export const content = new ContentService(mongodb.db, options);
