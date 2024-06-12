import { BedrockEmbeddings } from "@langchain/community/embeddings/bedrock";
import { BaseEmbeddings } from '../interfaces/base-embeddings.js';

export class TitanEmbeddings implements BaseEmbeddings {
    private model: BedrockEmbeddings;


    constructor() {
        this.model = new BedrockEmbeddings({ region: process.env.BEDROCK_AWS_REGION!,
            credentials: {
              accessKeyId: process.env.BEDROCK_AWS_ACCESS_KEY_ID!,
              secretAccessKey: process.env.BEDROCK_AWS_SECRET_ACCESS_KEY!,
            },
            model: "amazon.titan-embed-text-v1", maxConcurrency: 3, maxRetries: 5 });
    }

    getDimensions(): number {
        return 1024;
    }

    embedDocuments(texts: string[]): Promise<number[][]> {
        return this.model.embedDocuments(texts);
    }

    embedQuery(text: string): Promise<number[]> {
        return this.model.embedQuery(text);
    }
}

