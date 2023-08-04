import { WithScore, EmbeddedContent, EmbeddedContentStore } from "chat-core";

export interface SearchBooster {
  shouldBoost: ({ text }: { text: string }) => boolean;
  boost: ({
    existingResults,
    embedding,
    store,
  }: {
    embedding: number[];
    existingResults: WithScore<EmbeddedContent>[];
    store: EmbeddedContentStore;
  }) => Promise<WithScore<EmbeddedContent>[]>;
}
