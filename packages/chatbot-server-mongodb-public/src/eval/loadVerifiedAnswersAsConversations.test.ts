import { loadVerifiedAnswersAsConversations } from "./loadVerifiedAnswersAsConversations";
import { VerifiedAnswerSpec } from "mongodb-chatbot-verified-answers";
import yaml from "yaml";

const verifiedAnswerYamlSpecs = [
  {
    answer: "Register today!",
    author_email: "steve.o@mongodb.com",
    questions: ["How do I register for Atlas?", "Register for Atlas"],
    references: [
      {
        url: "https://www.mongodb.com/cloud/atlas/register",
        title: "MongoDB Atlas Registration",
      },
    ],
  },
  {
    questions: ["Get started with MongoDB"],
    answer: "npm install mongodb",
    author_email: "johnny.knoxville@mongodb.com",
    references: [
      {
        url: "https://mongodb.com/docs/manual/tutorial/getting-started/",
        title: "Getting Started with MongoDB",
      },
    ],
  },
] satisfies VerifiedAnswerSpec[];

describe("loadVerifiedAnswersAsConversations", () => {
  it("loads verified answers as conversations", () => {
    const conversations = loadVerifiedAnswersAsConversations(
      yaml.stringify(verifiedAnswerYamlSpecs)
    );
    expect(conversations).toHaveLength(3);
    expect(conversations[0].messages).toMatchObject([
      { role: "user", content: verifiedAnswerYamlSpecs[0].questions[0] },
      { role: "assistant", content: verifiedAnswerYamlSpecs[0].answer },
    ]);
    expect(conversations[0].messages[1].content).toBe(
      conversations[1].messages[1].content
    );
    expect(conversations[0].messages[1].content).not.toBe(
      conversations[2].messages[1].content
    );
  });
});
