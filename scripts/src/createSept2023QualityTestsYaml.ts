import { parse } from "csv-parse/sync";
import path from "path";
import { readFileSync, writeFileSync } from "fs";
import "dotenv/config";
import { ObjectId, MongoClient, Db } from "mongodb";
import yaml from "yaml";

const basePath = path.resolve(__dirname, "..", "assets", "qaTests");
const testDatabaseName = "docs-chatbot-qa-2023-09-01";

const testsFilePath = path.resolve(
  basePath,
  "sept-2023-manual-testing-round.csv"
);

const csvFilePaths = [testsFilePath];

interface TestCsvRow {
  Test: string;
  "Conversation ID": string;
  Tester: string;
  "Expected Output": string;
  "Generated Text Status": TestResultStatus;
  "Search Results Status": TestResultStatus;
  Evidence: string;
  "Additional Notes": string;
  "Data to the right not needed for testers": string;
  "Previous Conversation ID": string;
  "Original Question Set": OriginalQuestionSet;
}
type TestResultStatus =
  | "FAIL"
  | "PARTIAL FAIL"
  | "PARTIAL PASS"
  | "PASS"
  | "BAD QUERY";

type OriginalQuestionSet = "Top 250/Missing 50" | "Security" | "General";

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
    name: csvObject.Test.replaceAll("\n", " ").replaceAll("\r", ""),
    messages,
    expectation: csvObject["Expected Output"],
    tags: [
      createTagFromOriginalQuestionSet(csvObject["Original Question Set"]),
    ],
  };
}

function createTagFromOriginalQuestionSet(
  originalQuestionSet: OriginalQuestionSet
): string {
  switch (originalQuestionSet) {
    case "Top 250/Missing 50":
      return "top_query";
    case "Security":
      return "security";
    default:
      return "";
  }
}

function convertTestCasesToYaml(testCases: TestCase[]): string {
  return yaml.stringify(testCases, { lineWidth: 0 });
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
    process.env.MONGODB_QA_CONNECTION_URI as string
  );
  const db = mongoDb.db(testDatabaseName as string);
  for (const csvFilePath of csvFilePaths) {
    await convertCsvToYamlAndWriteToFile(csvFilePath, db);
    console.log("successfully converted", csvFilePath, "to yaml");
  }
  console.log("done! find the yaml files in the directory", basePath);
  await mongoDb.close();
}
main();
