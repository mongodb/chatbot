"use strict";
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
const sync_1 = require("csv-parse/sync");
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
require("dotenv/config");
const mongodb_1 = require("mongodb");
const yaml_1 = __importDefault(require("yaml"));
const basePath = path_1.default.resolve(__dirname, "..", "assets", "qaTests");
const generalTestsFilePath = path_1.default.resolve(basePath, "general.csv");
const csvFilePaths = [generalTestsFilePath];
function parseCsvToObject(csvFilePath) {
    const input = (0, fs_1.readFileSync)(generalTestsFilePath, "utf8");
    const records = (0, sync_1.parse)(input, {
        columns: true,
        skip_empty_lines: true,
    });
    return records;
}
function getMessagesForTest(db, collectionName, oidString) {
    return __awaiter(this, void 0, void 0, function* () {
        const conversations = db.collection(collectionName);
        const conversationId = mongodb_1.ObjectId.isValid(oidString)
            ? new mongodb_1.ObjectId(oidString)
            : null;
        let testConversation = [];
        if (conversationId) {
            const conversation = yield conversations.findOne({ _id: conversationId });
            if (!conversation) {
                console.log("conversation not found:", oidString);
                return testConversation;
            }
            const { messages } = conversation;
            testConversation = messages
                .map((message) => ({
                content: message.content,
                role: message.role,
            }))
                .filter((message) => message.role !== "system");
            testConversation.pop(); // remove last message, which is the assistant generated message we're testing
        }
        return testConversation;
    });
}
function cleanDataToTestCase(csvObject, messages) {
    return {
        name: csvObject.Hypothesis,
        messages,
        expectation: csvObject["Expected Output"],
    };
}
function convertTestCasesToYaml(testCases) {
    return yaml_1.default.stringify(testCases);
}
function writeYamlToFile(yamlString, filePath) {
    (0, fs_1.writeFileSync)(filePath, yamlString);
}
function convertCsvToYamlAndWriteToFile(csvFilePath, db) {
    return __awaiter(this, void 0, void 0, function* () {
        const csvObjects = parseCsvToObject(csvFilePath);
        const testCases = [];
        for (const csvObject of csvObjects) {
            const messages = yield getMessagesForTest(db, "conversations", csvObject["Conversation ID(s)"]);
            const testCase = cleanDataToTestCase(csvObject, messages);
            testCases.push(testCase);
        }
        const yamlString = convertTestCasesToYaml(testCases);
        const yamlFilePath = csvFilePath.replace(".csv", ".yaml");
        writeYamlToFile(yamlString, yamlFilePath);
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const mongoDb = yield mongodb_1.MongoClient.connect(process.env.MONGODB_QA_CONNECTION_URI);
        const qaDb = mongoDb.db(process.env.MONGODB_QA_DATABASE_NAME);
        for (const csvFilePath of csvFilePaths) {
            yield convertCsvToYamlAndWriteToFile(csvFilePath, qaDb);
            console.log("successfully converted", csvFilePath, "to yaml");
        }
        console.log("done! find the yaml files in the assets/qaTests directory");
        yield mongoDb.close();
    });
}
main();
