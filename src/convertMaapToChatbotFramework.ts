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

export function convertBaseModelToChatLlm(baseModel: BaseModel): ChatLlm {
    return {
        async answerQuestionAwaited({ messages }) {
            const systemMessage = messages.find((m) => m.role === 'system');
            // this only takes into account the latest user message,
            // which should have previous messages and retrieved context information
            // all in the `userMessage.contentForLlm` field.
            const userMessage = messages[messages.length - 1] as UserMessage;
            const modelResponse = await baseModel.query(
                systemMessage.content,
                // User content for LLM if it exists (which it should in the implementation),
                // otherwise use the original content
                userMessage.contentForLlm ?? userMessage.content,
                // we shouldn't need to add context b/c this comes from the UserMessage.contentForLlm
                // Putting empty array b/c need placeholder
                [],
            );
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

export function convertBaseEmbeddingsToEmbedder(baseEmbeddings: BaseEmbeddings): Embedder {
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
