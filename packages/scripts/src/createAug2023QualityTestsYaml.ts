import { parse } from "csv-parse/sync";
import path from "path";
import { readFileSync, writeFileSync } from "fs";
import "dotenv/config";
import { ObjectId, MongoClient, Db } from "mongodb";
import yaml from "yaml";

const basePath = path.resolve(__dirname, "..", "assets", "qaTests");

const generalTestsFilePath = path.resolve(basePath, "general.csv");

const csvFilePaths = [generalTestsFilePath];

interface TestCsvRow {
  Hypothesis: string;
  "Conversation ID(s)": string;
  "Tester (MongoDB ID)": string;
  Team: string;
  "Expected Output": string;
  "Generated Text Status": TestResultStatus;
  "Search Results Status": TestResultStatus;
  "Additional Evidence": string;
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
}

function parseCsvToObject() {
  const input = readFileSync(generalTestsFilePath, "utf8");
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
    name: csvObject.Hypothesis,
    messages,
    expectation: csvObject["Expected Output"],
  };
}

function convertTestCasesToYaml(testCases: TestCase[]): string {
  return yaml.stringify(testCases);
}

function writeYamlToFile(yamlString: string, filePath: string) {
  writeFileSync(filePath, yamlString);
}

async function convertCsvToYamlAndWriteToFile(csvFilePath: string, db: Db) {
  const csvObjects = parseCsvToObject();
  const testCases: TestCase[] = [];
  for (const csvObject of csvObjects) {
    const messages = await getMessagesForTest(
      db,
      "conversations",
      csvObject["Conversation ID(s)"]
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
  const db = mongoDb.db(process.env.MONGODB_DATABASE_NAME as string);
  for (const csvFilePath of csvFilePaths) {
    await convertCsvToYamlAndWriteToFile(csvFilePath, db);
    console.log("successfully converted", csvFilePath, "to yaml");
  }
  console.log("done! find the yaml files in the directory", basePath);
  await mongoDb.close();
}
main();
