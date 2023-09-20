export type EmbedArgs = {
  text: string;
  userIp: string;
};

export type EmbedResult = {
  embedding: number[];
};

/**
 OSS_TODO: add tsdoc description of this
 */
export type EmbedFunc = (args: EmbedArgs) => Promise<EmbedResult>;
