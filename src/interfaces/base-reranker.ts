import { ExtractChunkData } from "../global/types.js";

export interface BaseReranker {
    reRankDocuments(query:string, documents: ExtractChunkData[]): Promise<ExtractChunkData[]>;
    
}
