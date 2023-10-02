"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
const chat_core_1 = require("chat-core");
const Path = __importStar(require("path"));
const text_splitter_1 = require("langchain/text_splitter");
const gpt3_tokenizer_1 = __importDefault(require("gpt3-tokenizer"));
const [_, __, envFile] = process.argv;
dotenv_1.default.config({ path: envFile });
console.log("envFile", envFile);
const { MONGODB_CONNECTION_URI, MONGODB_DATABASE_NAME, OPENAI_ENDPOINT, OPENAI_API_KEY, OPENAI_EMBEDDING_DEPLOYMENT, OPENAI_EMBEDDING_MODEL_VERSION, } = (0, chat_core_1.assertEnvVars)(chat_core_1.CORE_ENV_VARS);
const mongodb = new chat_core_1.MongoClient(MONGODB_CONNECTION_URI);
const embed = (0, chat_core_1.makeOpenAiEmbedFunc)({
    apiKey: OPENAI_API_KEY,
    apiVersion: OPENAI_EMBEDDING_MODEL_VERSION,
    baseUrl: OPENAI_ENDPOINT,
    deployment: OPENAI_EMBEDDING_DEPLOYMENT,
});
const sampleDevCenterData = JSON.parse(fs_1.default.readFileSync(Path.resolve(__dirname, "../data/dev-center/sample-in.json"), "utf8"));
const splitter = new text_splitter_1.RecursiveCharacterTextSplitter({
    chunkSize: 2000,
    chunkOverlap: 0,
});
const tokenizer = new gpt3_tokenizer_1.default({ type: "gpt3" }); // or 'codex'
//TODO: see above TODO
function createChunksForDevHubDocument({ splitter, tokenizer, devHubDoc, baseUrl, }) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Chunking doc:", devHubDoc.name);
        let chunks = [];
        try {
            chunks = yield splitter.createDocuments([devHubDoc.content]);
        }
        catch (e) {
            console.log("Error splitting document", devHubDoc.name);
        }
        const contentWithoutEmbeddings = chunks.map((chunk) => ({
            _id: new chat_core_1.ObjectId(),
            text: chunk.pageContent,
            url: `${baseUrl}${devHubDoc.calculated_slug}`,
            sourceName: "dev-center",
            tags: [],
            tokenCount: tokenizer.encode(chunk.pageContent).bpe.length,
            embedding: [],
            updated: new Date(),
        }));
        const contentWithEmbeddings = yield Promise.all(contentWithoutEmbeddings.map((content) => __awaiter(this, void 0, void 0, function* () {
            const chunkEmbedding = yield embed({
                text: content.text,
                userIp: "",
            });
            content.embedding = chunkEmbedding.embedding || [];
            return content;
        })));
        return contentWithEmbeddings;
    });
}
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const fileOut = Path.resolve(__dirname, "../data/dev-center/sample-out.json");
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
            .db(MONGODB_DATABASE_NAME)
            .collection("embedded_content");
        const flattedContentWithOutEmptyEmbeddings = JSON.parse(fs_1.default.readFileSync(fileOut, "utf-8"));
        console.log("Deleting existing data from MongoDB");
        yield contentCollection.deleteMany({});
        console.log("Inserting data into MongoDB");
        yield contentCollection.insertMany(flattedContentWithOutEmptyEmbeddings);
        console.log(`Inserted ${flattedContentWithOutEmptyEmbeddings.length} documents into MongoDB collection 'embedded_content'`);
        yield mongodb.close();
    });
}
main();
