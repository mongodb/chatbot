// TODO: add DB methods relevant for this project
import { Db, MongoClient, ObjectId } from 'mongodb';
import { initiateLogger } from './logger';

// TODO: define interfaces for database documents
interface StaticAsset {
  checksum: string;
  key: string;
}

export interface AssetDocument {
  _id: string;
  data: BinaryData;
}

interface PageDocument {
  _id: ObjectId;
  page_id: string;
  filename: string;
  ast: object;
  source: string;
  static_assets: StaticAsset[];
  build_id: ObjectId;
  created_at: Date;
}

interface UpdatedPageDocument {
  _id: ObjectId;
  page_id: string;
  filename: string;
  ast: object;
  static_assets: StaticAsset[];
  created_at: Date;
  updated_at: Date;
  deleted: boolean;
}

export type PageDocType = PageDocument | UpdatedPageDocument;

const ATLAS_URI = process.env.ATLAS_URI || '';
const METADATA_COLLECTION = 'metadata';
const PAGES_COLLECTION = 'documents';
const UPDATED_PAGES_COLLECTION = 'updated_documents';
const ASSETS_COLLECTION = 'assets';

const logger = initiateLogger();

let client: MongoClient;
let dbInstance: Db;

const getPageIdQuery = (projectName: string, branch: string) => {
  const user = process.env.BUILDER_USER ?? 'docsworker-xlarge';
  const pageIdPrefix = `${projectName}/${user}/${branch}`;
  return { $regex: new RegExp(`^${pageIdPrefix}/`) };
};

// Set up MongoClient for application
export const setupClient = async (mongoClient: MongoClient) => {
  client = mongoClient;
  await client.connect();
  const dbName = process.env.SNOOTY_DB_NAME || 'snooty_dev';
  dbInstance = client.db(dbName);
};

// Sets up the MongoClient and returns the newly created db instance, if they don't
// already exist
export const db = async () => {
  if (!dbInstance) {
    try {
      await setupClient(new MongoClient(ATLAS_URI));
    } catch (e) {
      logger.error(e);
      throw e;
    }
  }
  return dbInstance;
};

export const closeDBConnection = async () => {
  if (client) {
    await client.close();
    logger.info('MongoDB Client closed successfully');
  }
};

export const findAssetsByChecksums = async (checksums: string[]) => {
  const dbSession = await db();
  return dbSession.collection<AssetDocument>(ASSETS_COLLECTION).find({ _id: { $in: checksums } });
};

export const findPagesByBuildId = async (buildId: string | ObjectId) => {
  const id = new ObjectId(buildId);
  const query = { build_id: id };
  const dbSession = await db();
  return dbSession.collection<PageDocument>(PAGES_COLLECTION).find(query);
};

export const findPagesByProject = async (project: string, branch: string) => {
  const pageIdQuery = getPageIdQuery(project, branch);
  const query = { page_id: pageIdQuery };
  const dbSession = await db();
  return dbSession.collection<UpdatedPageDocument>(UPDATED_PAGES_COLLECTION).find(query);
};

export const findUpdatedPagesByProject = async (project: string, branch: string, timestamp: number) => {
  const pageIdQuery = getPageIdQuery(project, branch);
  const updatedAtQuery = new Date(timestamp);
  const query = { page_id: pageIdQuery, updated_at: { $gt: updatedAtQuery } };
  const dbSession = await db();
  return dbSession.collection<UpdatedPageDocument>(UPDATED_PAGES_COLLECTION).find(query);
};

export const findOneMetadataByBuildId = async (buildId: string | ObjectId) => {
  const id = new ObjectId(buildId);
  const query = { build_id: id };
  const dbSession = await db();
  return dbSession.collection(METADATA_COLLECTION).findOne(query);
};

export const findLatestMetadata = async (project: string, branch: string) => {
  const filter = { project, branch };
  const dbSession = await db();
  const res = await dbSession.collection(METADATA_COLLECTION).find(filter).sort('created_at', -1).limit(1).toArray();
  if (!res || res.length !== 1) {
    return null;
  }
  return res[0];
};
