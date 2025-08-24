import { PromptResponseRating } from "mercury-case-analysis";
import { ModelMessage } from "mongodb-rag-core/aiSdk";
import { Collection, MongoClient, ObjectId } from "mongodb-rag-core/mongodb";

export type MercuryPrompt = {
  _id: ObjectId;
  type: string;
  tags: string[];
  name: string;
  prompt: ModelMessage[];
  expected: string;
  metadata: {
    category: string;
    promptId?: string;
    reviewer?: string;
  };
  analysis: {
    quality: PromptResponseRating;
    relevance: number;
  };
};

export type MercuryResult = {
  _id: ObjectId;
  promptId: ObjectId;
  model: string;
  developer: string;
  provider: string; // Legacy - delete this in refactor
  date: Date;
  prompt: MercuryPrompt["name"];
  response: string;
  metrics: Record<
    string,
    {
      score: number;
      label?: string;
      rationale?: string;
    }
  >;
};

export interface MakeMercuryDatabaseParams {
  connectionUri: string;
  databaseName: string;
  promptsCollectionName: string;
  resultsCollectionName: string;
}

export interface MercuryDatabase {
  client: MongoClient;
  connect: () => Promise<MongoClient>;
  disconnect: () => Promise<void>;
  promptsCollection: Collection<MercuryPrompt>;
  resultsCollection: Collection<MercuryResult>;
}

export function makeMercuryDatabase(
  params: MakeMercuryDatabaseParams
): MercuryDatabase {
  const client = new MongoClient(params.connectionUri);

  return {
    client,
    connect() {
      return client.connect();
    },
    disconnect() {
      return client.close();
    },
    promptsCollection: client
      .db(params.databaseName)
      .collection<MercuryPrompt>(params.promptsCollectionName),
    resultsCollection: client
      .db(params.databaseName)
      .collection<MercuryResult>(params.resultsCollectionName),
  } satisfies MercuryDatabase;
}
