import createDebugMessages from 'debug';
import { BedrockChat } from "@langchain/community/chat_models/bedrock";
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';

import { BaseModel } from '../interfaces/base-model.js';
import { Chunk, ConversationHistory } from '../global/types.js';

export class Bedrock extends BaseModel {
    private readonly debug = createDebugMessages('maap:model:Bedrock');
    private readonly modelName: string;
    private readonly region: string;
    private model: BedrockChat;

    constructor(params?: { region?: string; modelName?: string; }) {
        super();
        this.region = params?.region;
        this.modelName = params?.modelName;
    }

    override async init(): Promise<void> {
        this.model = new BedrockChat({ region: this.region, model: this.modelName, });
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

        this.debug('Executing Bedrock model with prompt -', userQuery);
        const result = await this.model.invoke(pastMessages);
        this.debug('Bedrock response -', result);
        return result.content.toString();
    }
}
