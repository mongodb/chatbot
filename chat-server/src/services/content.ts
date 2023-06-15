import { ObjectId } from "mongodb";
interface Site {
  /** The name of the website the chunk belongs to. */
  name: string;
  /** The base URL of the website the chunk belongs to. */
  url: string;
}

interface Content {
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

// TODO: implement content service
export const content = {
  findVectorMatches: async ({ embedding }: { embedding: number[] }) => {
    const dummyContent: Content[] = [
      {
        _id: new ObjectId(),
        url: "https://www.mongodb.com/",
        text: "MongoDB is a general purpose, document-based, distributed database built for modern application developers and for the cloud era.",
        numTokens: 100,
        embedding: [0.1, 0.2, 0.3],
        lastUpdated: new Date(),
        site: {
          name: "MongoDB",
          url: "https://www.mongodb.com/",
        },
        tags: ["database", "cloud"],
      },
    ];
    return dummyContent;
  },
};
