import { FireworksEmbeddings } from "@langchain/community/embeddings/fireworks";
import { BaseEmbeddings } from '../interfaces/base-embeddings.js';

export class NomicEmbeddingsv1 implements BaseEmbeddings {
    private model: FireworksEmbeddings;

// model names:
// nomic-ai/nomic-embed-text-v1.5 (recommended)	137M
    constructor() {
        this.model = new FireworksEmbeddings({ modelName: "nomic-ai/nomic-embed-text-v1", maxConcurrency: 3, maxRetries: 5 });
    }

    getDimensions(): number {
        return 768;
    }

    embedDocuments(texts: string[]): Promise<number[][]> {
        return this.model.embedDocuments(texts);
    }

    embedQuery(text: string): Promise<number[]> {
        return this.model.embedQuery(text);
    }
}

