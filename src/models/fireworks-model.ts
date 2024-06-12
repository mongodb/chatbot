import createDebugMessages from 'debug';
import { ChatFireworks } from "@langchain/community/chat_models/fireworks";
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';

import { BaseModel } from '../interfaces/base-model.js';
import { Chunk, ConversationHistory } from '../global/types.js';

export class Fireworks extends BaseModel {
    private readonly debug = createDebugMessages('maap:model:Fireworks');
    private readonly modelName: string;
    private apiKey: string;
    private model: ChatFireworks;

    constructor(params?: { temperature?: number; modelName?: string; apiKey?: string}) {
        super(params?.temperature);
        this.modelName = params?.modelName ?? 'llama-v3-70b-instruct';
        this.apiKey = params?.apiKey ?? process.env.FIREWORKS_API_KEY;
    }

    override async init(): Promise<void> {
        this.model = new ChatFireworks({ temperature: this.temperature, model: this.modelName, apiKey: this.apiKey});
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

        this.debug('Executing Fireworks model with prompt -', userQuery);
        const result = await this.model.invoke(pastMessages);
        this.debug('Fireworks response -', result);
        return result.content.toString();
    }
}
