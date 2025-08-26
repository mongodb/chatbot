import { PromptResponseRating } from "mercury-case-analysis";
import { ModelMessage } from "mongodb-rag-core/aiSdk";
import {
  MongoClient,
  type Collection,
  type ObjectId,
  type Filter,
} from "mongodb-rag-core/mongodb";

export type MercuryReport = {
  _id: ObjectId;
  slug: string;
  name: string;
  description: string;
  updatedAt: Date;
  query: Filter<MercuryPrompt>;
};

export type MercuryPrompt = {
  _id: ObjectId;
  type: string;
  tags: string[];
  name: string;
  prompt: ModelMessage[];
  expected: string;
  metadata: {
    category: string;
    profoundPromptId: string;
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
      judgementModel?: string;
    }
  >;
};

export type MercuryAnswer = {
  _id: ObjectId;
  profoundRunId: string;
  caseId: ObjectId;
  promptId: ObjectId; // same as caseId
  category: string;
  citations: {
    url: string;
    hostname: string;
    path: string;
  }[];
  dataset: {
    name: string;
    slug: string;
  };
  createdAt: Date;
  date: Date;
  expectedResponse: string;
  metrics: Record<
    string,
    {
      score: number;
      label?: string;
      rationale?: string;
      judgementModel?: string;
    }
  >;
  platformId: string;
  platformName: string;
  profoundPromptId: string;
  prompt: string;
  region: string;
  response: string;
  tags: string[];
  type: "answer-engine";
};

export interface MakeMercuryDatabaseParams {
  connectionUri: string;
  databaseName: string;
  promptsCollectionName: string;
  resultsCollectionName: string;
  reportsCollectionName: string;
  answersCollectionName: string;
}

export interface MercuryDatabase {
  client: MongoClient;
  connect: () => Promise<MongoClient>;
  disconnect: () => Promise<void>;
  promptsCollection: Collection<MercuryPrompt>;
  resultsCollection: Collection<MercuryResult>;
  reportsCollection: Collection<MercuryReport>;
  answersCollection: Collection<MercuryAnswer>;
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
    reportsCollection: client
      .db(params.databaseName)
      .collection<MercuryReport>(params.reportsCollectionName),
    answersCollection: client
      .db(params.databaseName)
      .collection<MercuryAnswer>(params.answersCollectionName),
  } satisfies MercuryDatabase;
}
