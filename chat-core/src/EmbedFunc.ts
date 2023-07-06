export type EmbedArgs = {
  text: string;
  userIp: string;
};

export type EmbedResult = {
  embedding: number[];
};

export type EmbedFunc = (args: EmbedArgs) => Promise<EmbedResult>;
