/**
 * MongoDB Connection Utility
 * 
 * This module provides functions to connect to a MongoDB database
 * and execute operations against it.
 */

import { MongoClient, Db } from 'mongodb';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connection variables
let client: MongoClient | null = null;
let db: Db | null = null;

// Default connection string
const DEFAULT_CONNECTION_STRING = 'mongodb://localhost:27017/mongodb-mcp';

/**
 * Get the MongoDB connection string from environment variables
 * or use the default connection string
 */
export function getConnectionString(): string {
  return process.env.MONGODB_URI || DEFAULT_CONNECTION_STRING;
}

/**
 * Connect to MongoDB database
 */
export async function connectToMongoDB(): Promise<Db> {
  try {
    if (db) {
      return db;
    }

    const uri = getConnectionString();
    console.log(`Connecting to MongoDB at ${uri}...`);
    
    client = new MongoClient(uri);
    await client.connect();
    
    // Get database name from connection string or use default
    const dbName = uri.split('/').pop()?.split('?')[0] || 'mongodb-mcp';
    db = client.db(dbName);
    
    console.log(`Connected to MongoDB database: ${dbName}`);
    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

/**
 * Close MongoDB connection
 */
export async function closeMongoDB(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('MongoDB connection closed');
  }
}

/**
 * Get the MongoDB database instance
 * If not connected, it will connect automatically
 */
export async function getDatabase(): Promise<Db> {
  if (!db) {
    return connectToMongoDB();
  }
  return db;
}

/**
 * Execute a MongoDB operation with error handling
 */
export async function executeMongoOperation<T>(operation: (db: Db) => Promise<T>): Promise<T> {
  try {
    const database = await getDatabase();
    console.log(`[MCP MongoDB] Executing operation on database: ${database.databaseName}`);
    const result = await operation(database);
    console.log(`[MCP MongoDB] Operation executed successfully`);
    return result;
  } catch (error) {
    console.error(`[MCP MongoDB] Error executing operation:`, error);
    throw error;
  }
}
