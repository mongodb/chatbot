import { BaseReranker } from '../interfaces/base-reranker.js';
import { CohereRerank } from "@langchain/cohere";
import { Document } from "@langchain/core/documents";
import { ExtractChunkData} from '../global/types.js';
export class CohereReranker implements BaseReranker {
    private cohereRerank: CohereRerank;
    private modelName: string;
    private topN: number;
    

    constructor(params) {

        this.modelName = params?.modelName ?? "rerank-english-v2.0";
        this.topN = params?.k ?? 5;

        this.cohereRerank = new CohereRerank({
            apiKey: process.env.COHERE_API_KEY, 
            topN: this.topN, 
            model: this.modelName,
          });
    }
    
    reRankDocuments(query: string, documents: ExtractChunkData[]): Promise<ExtractChunkData[]> {
        const docs = documents.map(doc => new Document({
            pageContent: doc.pageContent,
            metadata: doc.metadata
        }));
        return this.cohereRerank.compressDocuments(docs, query).then((rerankedDocuments) => {
            return rerankedDocuments.map((doc) => {
                return <ExtractChunkData>{
                    pageContent: doc.pageContent,
                    score: doc.metadata.relevanceScore,
                    metadata: doc.metadata
                }
            });
        });

    }

}