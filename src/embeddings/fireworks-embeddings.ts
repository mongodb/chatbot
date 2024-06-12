import { FireworksEmbeddings } from "@langchain/community/embeddings/fireworks";
import { BaseEmbeddings } from '../interfaces/base-embeddings.js';

export class NomicEmbeddingsv1 implements BaseEmbeddings {
    private model: FireworksEmbeddings;
        private readonly modelName: string;
        private dimension: number;

    // model names:
    // nomic-ai/nomic-embed-text-v1.5 (recommended)	137M
        constructor(params?: { modelName?: string, dimension: number}) {
            this.dimension = this.dimension;
            this.modelName = params?.modelName ?? "nomic-ai/nomic-embed-text-v1";
            this.model = new FireworksEmbeddings({ modelName: this.modelName, maxConcurrency: 3, maxRetries: 5 });
        }

        getDimensions(): number {
            return this.dimension;
        }

    embedDocuments(texts: string[]): Promise<number[][]> {
        return this.model.embedDocuments(texts);
    }

    embedQuery(text: string): Promise<number[]> {
        return this.model.embedQuery(text);
    }
}

