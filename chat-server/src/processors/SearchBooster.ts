import { WithScore, EmbeddedContent, EmbeddedContentStore } from "chat-core";

/**
 OSS_TODO: add tsdoc description of this
 */
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
