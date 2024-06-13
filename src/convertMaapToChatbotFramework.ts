/**
  @fileoverview Convert various constructs created by the MAAP dev team
  to work with the MongoDB Chatbot Framework.
 */
import { Chunk, ExtractChunkData } from './global/types.js';
import { BaseEmbeddings } from './interfaces/base-embeddings.js';
import { BaseLoader } from './interfaces/base-loader.js';
import { BaseModel } from './interfaces/base-model.js';
import { ChatLlm, EmbeddedContent, Page, UserMessage, WithScore } from 'mongodb-chatbot-server';
import { Embedder } from 'mongodb-chatbot-server';
import { DataSource } from 'mongodb-rag-ingest/sources';
import { BaseReranker } from './interfaces/base-reranker.js';
import { Rerank } from './Rerank.js';

export async function convertBaseModelToChatLlm(baseModel: BaseModel): Promise<ChatLlm> {
    await baseModel.init();
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

export function convertBaseLoaderToDataSource(baseLoader: BaseLoader): DataSource {
    // Random name for data source. The BaseLoader should be refactored
    // to include a name.
    const name = `DATA_SOURCE_${Date.now()}`;
    return {
        async fetchPages() {
            await baseLoader.init();
            const pages: Page[] = [];
            for await (const chunk of baseLoader.getChunks()) {
                pages.push({
                    body: chunk.pageContent,
                    url: chunk.metadata.source,
                    // TODO: you should add format to the BaseLoader interface
                    // to support chunking based on format
                    format: 'txt',
                    sourceName: name,
                    metadata: chunk.metadata,
                } satisfies Page);
            }
            return pages;
        },
        name,
    } satisfies DataSource;
}

export function convertBaseRerankerToReranker(baseReranker: BaseReranker): Rerank {
    return async ({ query, results }) => {
        const chunks = results.map((result) => {
            return {
                pageContent: result.text,
                score: result.score,
                metadata: {
                    id: result.chunkAlgoHash ?? '',
                    source: result.url ?? '',
                    uniqueLoaderId: result.sourceName ?? '',
                },
            } satisfies ExtractChunkData;
        }) satisfies ExtractChunkData[];
        const rerankedResults = await baseReranker.reRankDocuments(query, chunks);
        const embeddedContentOut: WithScore<EmbeddedContent>[] = [];
        for (const result of rerankedResults) {
            const foundRes = results.findIndex((r) => {
                r.text === result.pageContent;
            });
            if (foundRes === -1) {
                throw new Error('Could not find the original result in the reranked results');
            }
            embeddedContentOut.push({
                ...results[foundRes],
                score: result.score,
            });
        }
        return {
            results: embeddedContentOut,
        };
    };
}
