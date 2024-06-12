import { OpenAIEmbeddings, AzureOpenAIEmbeddings } from '@langchain/openai';
import { BaseEmbeddings } from '../interfaces/base-embeddings.js';

export class OpenAi3LargeEmbeddings implements BaseEmbeddings {
    private model: OpenAIEmbeddings;
    private readonly dynamicDimension: number;
    private azureOpenAIApiInstanceName: string;
    private modelName: string;



    constructor(params?: { dynamicDimension?: number,azureOpenAIApiInstanceName?:string, modelName?:string }) {
        this.azureOpenAIApiInstanceName= params?.azureOpenAIApiInstanceName;
        this.modelName= params?.modelName ?? 'text-embedding-3-large';
        this.dynamicDimension = params?.dynamicDimension ?? 3072;

        this.model = new AzureOpenAIEmbeddings({
            azureOpenAIApiInstanceName: this.azureOpenAIApiInstanceName,
            azureOpenAIApiEmbeddingsDeploymentName:this.modelName,
            dimensions: this.dynamicDimension,
            maxConcurrency: 3,
            maxRetries: 5
          });

        // this.model = new OpenAIEmbeddings({
        //     modelName: 'text-embedding-3-large',
        //     maxConcurrency: 3,
        //     maxRetries: 5,
        //     dimensions: this.dynamicDimension,
        // });
    }

    getDimensions(): number {
        return this.dynamicDimension;
    }

    embedDocuments(texts: string[]): Promise<number[][]> {
        return this.model.embedDocuments(texts);
    }

    embedQuery(text: string): Promise<number[]> {
        return this.model.embedQuery(text);
    }
}
