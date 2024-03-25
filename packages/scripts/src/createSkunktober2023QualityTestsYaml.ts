import { parse } from "csv-parse/sync";
import path from "path";
import { readFileSync, writeFileSync } from "fs";
import "dotenv/config";
import { ObjectId, MongoClient, Db } from "mongodb";
import yaml from "yaml";

const basePath = path.resolve(__dirname, "..", "assets", "qaTests");

const generalTestsFilePath = path.resolve(basePath, "skunktober.csv");

const csvFilePaths = [generalTestsFilePath];

interface TestCsvRow {
  "Test Name": string;
  "Conversation ID": string;
  Tester: string;
  Tag1: string;
  Tag2?: string;
  Tag3?: string;
  Tag4?: string;
  "Expected Output": string;
  "Generated Text Status": TestResultStatus;
  "Search Results Status": TestResultStatus;
  "Additional Notes": string;
}
type TestResultStatus = "FAIL" | "PARTIAL FAIL" | "PARTIAL PASS" | "PASS";

interface Message {
  content: string;
  role: "user" | "assistant";
}

interface DbMessage {
  content: string;
  role: "user" | "assistant" | "system";
}

interface TestCase {
  name: string;
  messages: Message[];
  expectation: string;
  tags: string[];
}

function parseCsvToObject(csvFilePath: string) {
  const input = readFileSync(csvFilePath, "utf8");
  const records: TestCsvRow[] = parse(input, {
    columns: true,
    skip_empty_lines: true,
  });
  return records;
}

async function getMessagesForTest(
  db: Db,
  collectionName: string,
  oidString: string
): Promise<Message[]> {
  const conversations = db.collection(collectionName);
  const conversationId = ObjectId.isValid(oidString)
    ? new ObjectId(oidString)
    : null;
  let testConversation: Message[] = [];
  if (conversationId) {
    const conversation = await conversations.findOne<{ messages: DbMessage[] }>(
      { _id: conversationId }
    );
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
      .filter((message) => message.role !== "system") as Message[];
    testConversation.pop(); // remove last message, which is the assistant generated message we're testing
  }
  return testConversation;
}

function cleanDataToTestCase(
  csvObject: TestCsvRow,
  messages: Message[]
): TestCase {
  return {
    name: csvObject["Test Name"],
    messages,
    expectation: csvObject["Expected Output"],
    tags: [csvObject.Tag1, csvObject.Tag2, csvObject.Tag3, csvObject.Tag4]
      .filter((tag) => !!tag)
      .map((tag) => tag?.toLowerCase().split(" ").join("_").trim()) as string[],
  };
}

function convertTestCasesToYaml(testCases: TestCase[]): string {
  return yaml.stringify(testCases);
}

function writeYamlToFile(yamlString: string, filePath: string) {
  writeFileSync(filePath, yamlString);
}

async function convertCsvToYamlAndWriteToFile(csvFilePath: string, db: Db) {
  const csvObjects = parseCsvToObject(csvFilePath);
  const testCases: TestCase[] = [];
  for (const csvObject of csvObjects) {
    const messages = await getMessagesForTest(
      db,
      "conversations",
      csvObject["Conversation ID"]
    );
    const testCase = cleanDataToTestCase(csvObject, messages);
    testCases.push(testCase);
  }
  const yamlString = convertTestCasesToYaml(testCases);
  const yamlFilePath = csvFilePath.replace(".csv", ".yaml");
  writeYamlToFile(yamlString, yamlFilePath);
}

async function main() {
  const mongoDb = await MongoClient.connect(
    process.env.MONGODB_CONNECTION_URI as string
  );
  const db = mongoDb.db("docs-chatbot-qa-2023-10-19");
  for (const csvFilePath of csvFilePaths) {
    await convertCsvToYamlAndWriteToFile(csvFilePath, db);
    console.log("successfully converted", csvFilePath, "to yaml");
  }
  console.log("done! find the yaml files in the directory", basePath);
  await mongoDb.close();
}
main();
