/**
  @fileoverview Convert various constructs created by the MAAP dev team
  to work with the MongoDB Chatbot Framework.
 */
import { Chunk } from './global/types.js';
import { BaseEmbeddings } from './interfaces/base-embeddings.js';
import { BaseLoader } from './interfaces/base-loader.js';
import { BaseModel } from './interfaces/base-model.js';
import { ChatLlm, UserMessage } from 'mongodb-chatbot-server';
import { Embedder } from 'mongodb-chatbot-server';
import { DataSource } from 'mongodb-rag-ingest/sources';

/**
  Note: this only takes into account the latest user message
  because the `BaseModel` implementation maintains conversations
  in its internal state, which is not compatible with the chatbot framework.
 */
export function convertBaseModelToChatLlm(baseModel: BaseModel): ChatLlm {
    return {
        async answerQuestionAwaited({ messages }) {
            const systemMessage = messages.find((m) => m.role === 'system');
            const userMessage = messages[messages.length - 1] as UserMessage;
            const context = userMessage.contextContent.map(
                (c) =>
                    ({
                        pageContent: c.text,
                        metadata: {
                            id: c.url,
                            source: c.sourceName,
                            uniqueLoaderId: 'TODO: what is this?',
                        },
                    } satisfies Chunk),
            );
            const modelResponse = await baseModel.query(systemMessage.content, userMessage.content, context);
            return {
                role: 'assistant',
                content: modelResponse,
            };
        },
        answerQuestionStream({ messages }) {
            throw new Error('Not implemented');
        },
    } satisfies ChatLlm;
}

export function convertBaseEmbeddingsToEmbeddings(baseEmbeddings: BaseEmbeddings): Embedder {
    return {
        async embed({ text }) {
            const embedding = await baseEmbeddings.embedQuery(text);
            return {
                embedding,
            };
        },
    } satisfies Embedder;
}

// Note: I tried to implement the converter of BaseLoader to DataSource,
// but I got confused with what's going on there.
// Let's discuss tomorrow.
// export function convertBaseLoaderToDataSource(baseLoader: BaseLoader): DataSource {
//     return {
//         name: baseLoader.,
//     } satisfies DataSource;
// }
