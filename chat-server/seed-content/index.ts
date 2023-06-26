import fs from "fs";
import dotenv from "dotenv";
import { Content } from "../src/services/content";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "langchain/dist/document";
import GPT3Tokenizer from "gpt3-tokenizer";
import { MongoClient, ObjectId } from "mongodb";
// TODO:(DOCSP-30994) refactor the chat-core to not export the instantiated object. weird stuff happens when using staging env
// import { embeddings } from "chat-core";

const [_, __, envFile] = process.argv;
dotenv.config({ path: envFile });
console.log("envFile", envFile);

const { MONGODB_CONNECTION_URI, MONGODB_DATABASE_NAME } = process.env;
console.log("MONGODB_CONNECTION_URI", MONGODB_CONNECTION_URI!);
console.log("MONGODB_DATABASE_NAME", MONGODB_DATABASE_NAME!);
const mongodb = new MongoClient(MONGODB_CONNECTION_URI!);

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
// TODO: see above TODO
// async function createChunksForDevHubDocument({
//   splitter,
//   tokenizer,
//   devHubDoc,
//   baseUrl,
// }: CreateChunkForDevhubDocParams): Promise<Content[]> {
//   console.log("Chunking doc:", devHubDoc.name);
//   let chunks: Document<Record<string, any>>[] = [];
//   try {
//     chunks = await splitter.createDocuments([devHubDoc.content]);
//   } catch (e) {
//     console.log("Error splitting document", devHubDoc.name);
//   }
//   const contentWithoutEmbeddings = chunks.map<Content>((chunk) => ({
//     _id: new ObjectId(),
//     text: chunk.pageContent,
//     url: `${baseUrl}${devHubDoc.calculated_slug}`,
//     site: {
//       name: "dev-center",
//       url: baseUrl,
//     },
//     tags: ["dev-center"],
//     numTokens: tokenizer.encode(chunk.pageContent).bpe.length,
//     embedding: [],
//     lastUpdated: new Date(),
//   }));
//   const contentWithEmbeddings = await Promise.all(
//     contentWithoutEmbeddings.map(async (content) => {
//       const chunkEmbedding = await embeddings.createEmbedding({
//         text: content.text,
//         userIp: "",
//       });
//       content.embedding = chunkEmbedding.embedding || [];
//       return content;
//     })
//   );
//   return contentWithEmbeddings;
// }

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function main() {
  const baseUrl = "https://mongodb.com/developer";
  const content: Content[] = [];
  const fileOut = "./seed-content/data/dev-center/sample-out.json";
  // comment out start -- comment out if only want to push existing data to MongoDB
  // for await (const devHubDoc of sampleDevCenterData) {
  //   const chunks = await createChunksForDevHubDocument({
  //     splitter,
  //     tokenizer,
  //     devHubDoc,
  //     baseUrl,
  //   });
  //   await sleep(1000); // need to sleep to avoid rate limiting from AI API 😢
  //   content.push(...chunks);
  // }
  // const flattenedContent = content.flat();
  // const flattedContentWithOutEmptyEmbeddings = flattenedContent.filter(
  //   (content) => !!content.embedding.length
  // );
  // fs.writeFileSync(
  //   fileOut,
  //   JSON.stringify(flattedContentWithOutEmptyEmbeddings, null, 2)
  // );
  // console.log(
  //   `Wrote ${flattedContentWithOutEmptyEmbeddings.length} chunks to ${fileOut}`
  // );
  // comment out end

  console.log("Adding data to MongoDB");
  const contentCollection = mongodb
    .db(MONGODB_DATABASE_NAME!)
    .collection("content");
  const flattedContentWithOutEmptyEmbeddings = JSON.parse(
    fs.readFileSync(fileOut, "utf-8")
  );
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
