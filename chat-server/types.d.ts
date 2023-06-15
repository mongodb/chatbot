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
  last_updated: Date;
  /** Website the chunk belongs to. */
  site: Site;
  /** The tags associated with the chunk. */
  tags?: string[];
}

interface Message {
  /** Unique identifier for the message. */
  id: ObjectId;
  /** The role of the message in the context of the conversation. */
  role: "system" | "assistant" | "user";
  /** Markdown-formatted response to user's chat message in the context of the conversation. */
  content: string;
  /** Set to `true` if the user liked the response, `false` if the user didn't like the response. No value if user didn't rate the response. Note that only messages with `role: "assistant"` can be rated. */
  rating?: boolean;
  /** The date the message was created. */
  time_created: Date;
}

interface Conversation {
  _id: ObjectId;
  /** Messages in the conversation. */
  messages: Message[];
  /** The IP address of the user performing the conversation. */
  ipAddress: string;
  /** The date the conversation was created. */
  timeCreated: Date;
}

interface Page {
  /** Unique identifier */
  _id: ObjectId;
  /** The URL of the page with the chunk content. */
  url: string;
  /** The text content of the chunk. */
  body: string;
  /** The date the page was last updated. */
  lastUpdated: Date;
  /** The website the page belongs to. */
  site: Site;
  /** The action that should be taken with the page. */
  action: "added" | "updated" | "deleted";
  /** The tags associated with the chunk. */
  tags?: string[];
}
