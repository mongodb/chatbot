import createDebugMessages from 'debug';
import { AzureChatOpenAI } from "@langchain/azure-openai";
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';

import { BaseModel } from '../interfaces/base-model.js';
import { Chunk, ConversationHistory } from '../global/types.js';

export class AzureOpenAI extends BaseModel {
    private readonly debug = createDebugMessages('maap:model:AzureOpenAI');
    private readonly azureOpenAIEndpoint: string;
    private readonly apiKey: string;
    private readonly azureOpenAIApiDeploymentName: string;
    private model: AzureChatOpenAI;
    private readonly modelName: string;


    constructor(params?: { temperature?:number,azureOpenAIEndpoint?:string, apiKey?:string, azureOpenAIApiDeploymentName?:string, modelName?:string }) {
        super(params?.temperature);
        this.azureOpenAIEndpoint= params?.azureOpenAIEndpoint;
        this.apiKey= params?.apiKey;
        this.azureOpenAIApiDeploymentName= params?.azureOpenAIApiDeploymentName;
        this.modelName= params?.modelName;
      
    }

    override async init(): Promise<void> {
        this.model = new AzureChatOpenAI({
            temperature: this.temperature,
            azureOpenAIEndpoint: this.azureOpenAIEndpoint,
            apiKey: this.apiKey,
            azureOpenAIApiDeploymentName: this.azureOpenAIApiDeploymentName,
            model: this.modelName,
           });
    }

    override async runQuery(
        system: string,
        userQuery: string,
        supportingContext: Chunk[],
        pastConversations: ConversationHistory[],
    ): Promise<string> {
        const pastMessages: (AIMessage | SystemMessage | HumanMessage)[] = [
            new SystemMessage(
                `${system}. Supporting context: ${supportingContext.map((s) => s.pageContent).join('; ')}`,
            ),
        ];

        pastMessages.push.apply(
            pastMessages,
            pastConversations.map((c) => {
                if (c.sender === 'AI') return new AIMessage({ content: c.message });
                else if (c.sender === 'SYSTEM') return new SystemMessage({ content: c.message });
                else return new HumanMessage({ content: c.message });
            }),
        );
        pastMessages.push(new HumanMessage(`${userQuery}?`));

        this.debug('Executing AzureOpenAI model with prompt -', userQuery);
        const result = await this.model.invoke(pastMessages);
        this.debug('AzureOpenAI response -', result);
        return result.content.toString();
    }
}
