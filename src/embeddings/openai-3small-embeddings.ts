import { OpenAIEmbeddings, AzureOpenAIEmbeddings } from '@langchain/openai';
import { BaseEmbeddings } from '../interfaces/base-embeddings.js';

export class OpenAi3SmallEmbeddings implements BaseEmbeddings {
    private model: OpenAIEmbeddings;
    private azureOpenAIApiInstanceName: string;
    private modelName: string;


    constructor(params?: {azureOpenAIApiInstanceName?:string, modelName?:string }) {
        this.azureOpenAIApiInstanceName= params?.azureOpenAIApiInstanceName;
        this.modelName= params?.modelName ?? 'text-embedding-3-small';

        this.model = new AzureOpenAIEmbeddings({
            azureOpenAIApiInstanceName: this.azureOpenAIApiInstanceName,
            azureOpenAIApiEmbeddingsDeploymentName:this.modelName,
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

    // constructor() {
    //     this.model = new AzureOpenAIEmbeddings({ azureOpenAIEmbeddingsApiDeploymentName: 'text-embedding-3-small', maxConcurrency: 3, maxRetries: 5 });
    // }

    getDimensions(): number {
        return 1536;
    }

    embedDocuments(texts: string[]): Promise<number[][]> {
        return this.model.embedDocuments(texts);
    }

    embedQuery(text: string): Promise<number[]> {
        return this.model.embedQuery(text);
    }
}
