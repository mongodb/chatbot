import type { NextApiRequest, NextApiResponse } from 'next'
import {
  OpenAIClient,
  OpenAIKeyCredential,
  makeDefaultFindContentFunc,
  makeMongoDbEmbeddedContentStore,
  makeOpenAiEmbedder
  } from 'mongodb-chatbot-server';
import { strict } from 'assert';
import yaml from "yaml"

const {
  MONGODB_CONNECTION_URI,
  MONGODB_DATABASE_NAME,
  OPENAI_API_KEY,
  OPENAI_EMBEDDING_DEPLOYMENT,
  VECTOR_SEARCH_INDEX_NAME,
} = process.env;

strict(MONGODB_CONNECTION_URI, "Missing MONGODB_CONNECTION_URI");
strict(MONGODB_DATABASE_NAME, "Missing MONGODB_DATABASE_NAME");
strict(OPENAI_API_KEY, "Missing OPENAI_API_KEY");
strict(OPENAI_EMBEDDING_DEPLOYMENT, "Missing OPENAI_EMBEDDING_DEPLOYMENT");
strict(VECTOR_SEARCH_INDEX_NAME, "Missing VECTOR_SEARCH_INDEX_NAME");


const openAiClient = new OpenAIClient(
  new OpenAIKeyCredential(OPENAI_API_KEY)
);

const embeddedContentStore = makeMongoDbEmbeddedContentStore({
  connectionUri: MONGODB_CONNECTION_URI,
  databaseName: MONGODB_DATABASE_NAME,
});

const embedder = makeOpenAiEmbedder({
  openAiClient,
  deployment: OPENAI_EMBEDDING_DEPLOYMENT,
  backoffOptions: {
    numOfAttempts: 3,
    maxDelay: 5000,
  },
});


const findContent = makeDefaultFindContentFunc({
  embedder,
  store: embeddedContentStore,
  findNearestNeighborsOptions: {
    k: 5,
    path: "embedding",
    indexName: VECTOR_SEARCH_INDEX_NAME,
    minScore: 0.9,
  },
});
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if(req.method !== "GET") {
    return res.status(405).json({ message: 'Method not allowed' })
  }
  const {q} = req.query;
  if(typeof q !== "string") {
    return res.status(400).json({ message: 'Invalid query "q"' })
  }try {

  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: 'Internal server error' })
  }
  const query = makeQuery(q);
  const {content: dbContent} = await findContent({query, ipAddress: "🤷"});
  const content = dbContent.map(({text, url}) => ({text, url}));
  const description = "Use this content to answer the user's question."
  res.status(200).json({ description, content } satisfies ContentResponse)
}

function makeQuery(query: string): string {
  try {
    // Try parsing the string as JSON
    const parsedJson = JSON.parse(query);
    // If parsing is successful, return the YAML stringification of the parsed JSON
    return yaml.stringify(parsedJson);
  } catch (error) {
    // If it's not valid JSON, return the original string
    return query;
  }
}

interface ContentResponse {
  description: string;
  content: {
    url: string;
    text: string;
  }[]
}
