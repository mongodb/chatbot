export type EmbedArgs = {
  /**
    The text to embed.
   */
  text: string;
};

export type EmbedResult = {
  /**
    Vector embedding of the text.
   */
  embedding: number[];
};

/**
  Takes a string of text and returns an array of numbers representing the
  vector embedding of the text.
 */
export type Embedder = {
  embed(args: EmbedArgs): Promise<EmbedResult>;
};
