import path from "path";
import { getConversationEvalCasesFromCSV } from "./getConversationEvalCasesFromCSV";
import { ConversationEvalCase } from "./getConversationEvalCasesFromYaml";

const SRC_ROOT = path.resolve(__dirname, "../");

describe("getConversationEvalCasesFromCSV", () => {
  it("should parse CSV data to produce evaluation cases", async () => {
    const csvFilePath = path.join(
      SRC_ROOT,
      "../testData/sampleChatbotEvaluationQuestions.csv"
    );
    const records = await getConversationEvalCasesFromCSV(csvFilePath);
    expect(records.length).toBe(4);
    expect(records[0]).toMatchObject({
      name: "What is MongoDB?",
      messages: [{ role: "user", content: "What is MongoDB?" }],
      reference:
        "MongoDB is a document database designed for ease of application development and scaling. You can store hierarchical structured data in documents, which are similar to JSON objects. MongoDB is available in different environments, including MongoDB Atlas (a fully managed service in the cloud), MongoDB Enterprise (a subscription-based, self-managed version), and MongoDB Community (a free-to-use, self-managed version). It is popular among development teams that use agile methodologies due to its flexible schema approach. Let me know if you have any more questions!",
      expectedLinks: [
        "https://www.mongodb.com/docs/manual/introduction/",
        "https://www.mongodb.com/why-use-mongodb",
        "https://www.mongodb.com/developer/products/mongodb/everything-you-know-is-wrong",
        "https://mongodb.com/docs/manual/",
      ],
    });
  });
  it("should apply a tranform function that allows for customization of fields", async () => {
    const csvFilePath = path.join(
      SRC_ROOT,
      "../testData/sampleChatbotEvaluationQuestions.csv"
    );
    function addTestDataSourceTag(evalCases: ConversationEvalCase[]) {
      return evalCases.map((caseItem) => {
        const tags = caseItem.tags || [];
        if (!tags.includes("test")) {
          tags.push("test");
        }
        return {
          ...caseItem,
          tags,
        };
      });
    }
    const records = await getConversationEvalCasesFromCSV(
      csvFilePath,
      addTestDataSourceTag
    );
    expect(records[0]).toMatchObject({
      tags: ["test"],
    });
  });
});
