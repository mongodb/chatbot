import fs from "fs";
import "dotenv/config";
import { Content } from "../src/services/content";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "langchain/dist/document";
import GPT3Tokenizer from "gpt3-tokenizer";
import { embeddings } from "../src/services/embeddings";
import { ObjectId } from "mongodb";
import { mongodb } from "../src/integrations/mongodb";

/**
 * Note that not capturing all fields, just ones used in the content mapping.
 */
interface DevHubSearchManifestDocument {
  /** Markdown string with all the site content */
  content: string;
  /** Title of page */
  name: string;
  /** Short description of the page.
   * Note: should probably pre-prend to content
   */
  description: string;
  /** Slug of the page (no base URL)*/
  calculated_slug: string;
}

const sampleDevCenterData: DevHubSearchManifestDocument[] = JSON.parse(
  fs.readFileSync("./seed-content/data/dev-center/sample-in.json", "utf8")
);

const dataForAtlas = [];

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 2000,
  chunkOverlap: 0,
});
const tokenizer = new GPT3Tokenizer({ type: "gpt3" }); // or 'codex'

interface CreateChunkForDevhubDocParams {
  splitter: RecursiveCharacterTextSplitter;
  devHubDoc: DevHubSearchManifestDocument;
  baseUrl: string;
  tokenizer: GPT3Tokenizer;
}
async function createChunksForDevHubDocument({
  splitter,
  tokenizer,
  devHubDoc,
  baseUrl,
}: CreateChunkForDevhubDocParams): Promise<Content[]> {
  console.log("Chunking doc:", devHubDoc.name);
  let chunks: Document<Record<string, any>>[] = [];
  try {
    chunks = await splitter.createDocuments([devHubDoc.content]);
  } catch (e) {
    console.log("Error splitting document", devHubDoc.name);
  }
  const contentWithoutEmbeddings = chunks.map<Content>((chunk) => ({
    _id: new ObjectId(),
    text: chunk.pageContent,
    url: `${baseUrl}${devHubDoc.calculated_slug}`,
    site: {
      name: "dev-center",
      url: baseUrl,
    },
    tags: ["dev-center"],
    numTokens: tokenizer.encode(chunk.pageContent).bpe.length,
    embedding: [],
    lastUpdated: new Date(),
  }));
  const contentWithEmbeddings = await Promise.all(
    contentWithoutEmbeddings.map(async (content) => {
      const chunkEmbedding = await embeddings.createEmbedding({
        text: content.text,
        userIp: "",
      });
      content.embedding = chunkEmbedding.embeddings || [];
      return content;
    })
  );
  return contentWithEmbeddings;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function main() {
  const baseUrl = "https://mongodb.com/developer";
  const content = [];
  for await (const devHubDoc of sampleDevCenterData) {
    const chunks = await createChunksForDevHubDocument({
      splitter,
      tokenizer,
      devHubDoc,
      baseUrl,
    });
    await sleep(1000); // need to sleep to avoid rate limiting from AI API 😢
    content.push(chunks);
  }
  const flattenedContent = content.flat();
  const flattedContentWithOutEmptyEmbeddings = flattenedContent.filter(
    (content) => !!content.embedding.length
  );
  const fileOut = "./seed-content/data/dev-center/sample-out.json";
  fs.writeFileSync(
    fileOut,
    JSON.stringify(flattedContentWithOutEmptyEmbeddings, null, 2)
  );
  console.log(
    `Wrote ${flattedContentWithOutEmptyEmbeddings.length} chunks to ${fileOut}`
  );

  console.log("Adding data to MongoDB");
  const contentCollection = mongodb.db.collection("content");
  console.log("Deleting existing data from MongoDB");
  await contentCollection.deleteMany({});
  console.log("Inserting data into MongoDB");
  await contentCollection.insertMany(flattedContentWithOutEmptyEmbeddings);
  console.log(
    `Inserted ${flattedContentWithOutEmptyEmbeddings.length} documents into MongoDB collection 'content'`
  );
  await mongodb.close();
}
main();
