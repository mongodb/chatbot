import { MongoClient } from "mongodb";
import { BaseDb } from '../interfaces/base-db.js';

import { ExtractChunkData, InsertChunkData } from '../global/types.js';
import AxiosDigestAuth from '@mhoc/axios-digest-auth';
const AxiosDigestAuthval = AxiosDigestAuth.default;

export class MongoDBAtlas implements BaseDb {
    private static readonly INDEX_NAME = "vector_index";
    private static readonly EMBEDDING_KEY = "embedding";
    private static readonly TEXT_KEY = "text";
    private readonly connectionString: string;
    private readonly dbName: string;
    private readonly collectionName: string;
    private readonly client: MongoClient;
    private readonly embeddingKey: string;
    private readonly textKey: string;
    private collection: any;

    constructor({ connectionString, dbName, collectionName, embeddingKey = MongoDBAtlas.EMBEDDING_KEY, textKey = MongoDBAtlas.TEXT_KEY }: { connectionString: string; dbName: string; collectionName: string; embeddingKey?: string; textKey?: string }
    ) {
        this.connectionString = connectionString;
        this.dbName = dbName;
        this.collectionName = collectionName;
        this.client = new MongoClient(this.connectionString);
        this.embeddingKey = embeddingKey;
        this.textKey = textKey;
    }

    async init() {
        this.collection = this.client.db(this.dbName).collection(this.collectionName); // Add this line
    }

    async insertChunks(chunks: InsertChunkData[]): Promise<number> {
        const mapped = chunks.map((chunk) => {
            return {
                id: chunk.metadata.id,
                [this.textKey]: chunk.pageContent,
                embedding: chunk.vector,
                metadata: chunk.metadata,
            };
        });

        await this.collection.insertMany(mapped);

        return mapped.length;
    }

    async similaritySearch(query: number[], k: number): Promise<ExtractChunkData[]> {
        const query_object = [await this.getVectorSearchQuery(query, k), { "$project": { "_id": 0, "score": { "$meta": "vectorSearchScore" }, "text": 1, "metadata": 1 } }];
        // console.log(query_object);
        const results = await this.collection.aggregate(query_object).toArray(); // Modify this line

        return results.map((result) => {

            const pageContent = (<any>result)[this.textKey]; // Fix the line

            delete (<any>result.metadata).pageContent;

            return <ExtractChunkData>{
                score: result.score,
                pageContent,
                metadata: result.metadata,
            }
        });
    }

    async getVectorSearchQuery(searchVector: number[], k: number): Promise<{}> {
        return {
            "$vectorSearch": {
                "index": MongoDBAtlas.INDEX_NAME,
                "path": this.embeddingKey,
                "queryVector": searchVector,
                "numCandidates": 100,
                "limit": k
            }
        };
    }

    async getVectorCount(): Promise<number> {
        return this.collection.countDocuments();
    }

    async deleteKeys(uniqueLoaderId: string): Promise<boolean> {
        await this.collection.deleteOne({
            "$match": {
                "id": uniqueLoaderId,
            }
        });
        return true;
    }

    async reset(): Promise<void> {
        this.collection.deleteMany({});
    }

    // Create Atlas Search Index
    async createVectorIndex(): Promise<void> {
        // Define your public and private keys
        const publicKey = 'ltpttido';
        const privateKey = 'f23bdca2-0d60-45bb-b069-918cd192c6ea';

        const data = JSON.stringify({
            "collectionName": "training_data",
            "database": "chatter",
            "name": "vectorIndex",
            "type": "vectorSearch",
            "definition": {
                "fields": [
                    {
                        "numDimensions": 1536,
                        "path": "text_embedding",
                        "similarity": "cosine",
                        "type": "vector"
                    }
                ]
            }
        });


        const digestAuth = new AxiosDigestAuthval({
            username: publicKey,
            password: privateKey,
        });


        const response = await digestAuth.request({
            headers: {
                'Accept': 'application/vnd.atlas.2024-05-30+json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            data: data,
            url: "https://cloud.mongodb.com/api/atlas/v2/groups/62c679e0f373002ad29fdc35/clusters/demo/search/indexes",
        });
        console.log(response);
    }


    async createVectorIndexSdk(): Promise<void> {
        try {

            // define your Atlas Vector Search index
            const index = {
                name: "vector_index",
                type: "vectorSearch",
                definition: {
                    "fields": [
                        {
                            "type": "vector",
                            "numDimensions": 1536,
                            "path": "plot_embedding",
                            "similarity": "euclidean"
                        }
                    ]
                }
            }
            // run the helper method
            const result = await this.collection.createSearchIndex(index);
            console.log(result);
        } catch (e) {
            console.error(e);
        }
    }

}