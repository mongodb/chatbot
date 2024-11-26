import { HybridSearchConfig } from "../contentStore";

export interface HybridSearchConfigParams {
  vectorSearch: Omit<
    HybridSearchConfig["vectorSearch"],
    "embedding" | "embeddingPath"
  >;
  fts: Omit<HybridSearchConfig["fts"], "query">;
  limit: HybridSearchConfig["limit"];
}
