import { jest } from "@jest/globals";
import {
  makeClassifySkill,
  SkillClassiferFunction,
  SkillGenerationObject,
} from "./makeClassifySkill";
import { MockLanguageModelV2 } from "mongodb-rag-core/aiSdk";
import * as skillRefreshManagerModule from "./skillRefreshManager";

jest.mock("./skillRefreshManager");

const mockCreateSkillRefreshManager = jest.mocked(
  skillRefreshManagerModule.createSkillRefreshManager
);

const mockTopicsToSkills = {
  "Database Administration": [
    {
      name: "MongoDB Atlas Admin",
      description: "Learn MongoDB Atlas administration",
      url: "https://learn.mongodb.com/skills/atlas-admin",
    },
    {
      name: "Database Security",
      description: "Secure your MongoDB database",
      url: "https://learn.mongodb.com/skills/security",
    },
  ],
  "Application Development": [
    {
      name: "Node.js Developer Path",
      description: "Build apps with Node.js and MongoDB",
      url: "https://learn.mongodb.com/skills/nodejs-dev",
    },
  ],
};

const mockResult: SkillGenerationObject = {
  reasoning: "Valid related to MongoDB: Database Administration",
  topic: "Database Administration",
  skill: "MongoDB Atlas Admin",
};

const makeMockLanguageModel = (
  mockContent: SkillGenerationObject = mockResult
) => {
  return new MockLanguageModelV2({
    doGenerate: async () => ({
      finishReason: "stop",
      usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
      content: [{ type: "text", text: JSON.stringify(mockContent) }],
      warnings: [],
    }),
  });
};

describe("makeClassifySkill", () => {
  let mockModel: MockLanguageModelV2;
  let mockRefreshManager: {
    getTopicsToSkillsMap: jest.MockedFunction<() => any>;
    cleanup: jest.MockedFunction<() => void>;
  };
  let originalConsoleLog: typeof console.log;

  beforeAll(() => {
    originalConsoleLog = console.log;
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mocks
    console.log = jest.fn(); // Avoids cluttering test output
    mockModel = makeMockLanguageModel();
    mockRefreshManager = {
      getTopicsToSkillsMap: jest.fn(),
      cleanup: jest.fn(),
    };
    mockCreateSkillRefreshManager.mockReturnValue(mockRefreshManager);
  });

  afterAll(() => {
    console.log = originalConsoleLog;
  });

  describe("makeClassifySkill factory", () => {
    it("should return classifySkill function and cleanup function", () => {
      const result = makeClassifySkill(mockModel);

      expect(result).toHaveProperty("classifySkill");
      expect(result).toHaveProperty("cleanupSkillClassifier");
      expect(typeof result.classifySkill).toBe("function");
      expect(typeof result.cleanupSkillClassifier).toBe("function");
    });

    it("should create skill refresh manager on initialization", () => {
      makeClassifySkill(mockModel);

      expect(mockCreateSkillRefreshManager).toHaveBeenCalledTimes(1);
    });

    it("should wire cleanup function to refresh manager cleanup", () => {
      const { cleanupSkillClassifier } = makeClassifySkill(mockModel);

      cleanupSkillClassifier();

      expect(mockRefreshManager.cleanup).toHaveBeenCalledTimes(1);
    });
  });

  describe("classifySkill function", () => {
    let classifySkill: SkillClassiferFunction;

    beforeEach(() => {
      mockRefreshManager.getTopicsToSkillsMap.mockReturnValue(
        mockTopicsToSkills
      );
      const result = makeClassifySkill(mockModel);
      classifySkill = result.classifySkill;
    });

    it("should return null when AI response has no topic or skill", async () => {
      const cannotClassifyModel = makeMockLanguageModel({
        reasoning: "No related skill",
        topic: null,
        skill: null,
      });
      const cannotClassifySkill =
        makeClassifySkill(cannotClassifyModel).classifySkill;

      const result = await cannotClassifySkill("What's the weather like?");

      expect(result).toBeNull();
      expect(console.log).toHaveBeenCalledWith("No skill identified.");
    });

    it("should return null when topic is present but skill is empty", async () => {
      const cannotClassifyModel = makeMockLanguageModel({
        reasoning: "Topic is valid but no related skill",
        topic: "Database Administration",
        skill: null,
      });
      const cannotClassifySkill =
        makeClassifySkill(cannotClassifyModel).classifySkill;

      const result = await cannotClassifySkill("What's the weather like?");

      expect(result).toBeNull();
      expect(console.log).toHaveBeenCalledWith("No skill identified.");
    });

    it("should return null when skill is present but topic is empty", async () => {
      const hallucinateClassifyModel = makeMockLanguageModel({
        reasoning: "(Bad output) Found a related skill but no topic for it",
        topic: null,
        skill: "<Likely some hallucinated skill>",
      });
      const cannotClassifySkill = makeClassifySkill(
        hallucinateClassifyModel
      ).classifySkill;

      const result = await cannotClassifySkill("What's the weather like?");

      expect(result).toBeNull();
      expect(console.log).toHaveBeenCalledWith("No skill identified.");
    });

    it("should return promotion object when valid topic and skill are identified", async () => {
      const result = await classifySkill("How do I set up MongoDB Atlas?");

      expect(result).toEqual({
        type: "skill",
        topic: "Database Administration",
        title: "MongoDB Atlas Admin",
        url: "https://learn.mongodb.com/skills/atlas-admin?tck=mongodb_ai_chatbot",
        description:
          "Want to learn more? Take the [MongoDB Atlas Admin](https://learn.mongodb.com/skills/atlas-admin?tck=mongodb_ai_chatbot) skill!",
      });
    });

    it("should handle URLs that already have query parameters", async () => {
      const topicsWithQueryParams = {
        "Database Administration": [
          {
            name: "MongoDB Atlas Admin",
            description: "Learn MongoDB Atlas administration",
            url: "https://learn.mongodb.com/skills/atlas-admin?existing=param",
          },
        ],
      };
      mockRefreshManager.getTopicsToSkillsMap.mockReturnValue(
        topicsWithQueryParams
      );

      const result = await classifySkill("How do I set up MongoDB Atlas?");

      expect(result?.url).toBe(
        "https://learn.mongodb.com/skills/atlas-admin?existing=param&tck=mongodb_ai_chatbot"
      );
    });
  });

  describe("edge cases & error handling", () => {
    let classifySkill: SkillClassiferFunction;

    beforeEach(() => {
      const result = makeClassifySkill(mockModel);
      classifySkill = result.classifySkill;
    });

    it("should handle undefined topicsToSkillsMap", async () => {
      mockRefreshManager.getTopicsToSkillsMap.mockReturnValue(undefined);

      const result = await classifySkill("How do I set up MongoDB Atlas?");

      expect(result).toBeNull();
    });

    it("should handle null topicsToSkillsMap", async () => {
      mockRefreshManager.getTopicsToSkillsMap.mockReturnValue(null);

      const result = await classifySkill("How do I set up MongoDB Atlas?");

      expect(result).toBeNull();
    });

    it("should handle empty topicsToSkillsMap", async () => {
      mockRefreshManager.getTopicsToSkillsMap.mockReturnValue({});

      const result = await classifySkill("How do I set up MongoDB Atlas?");

      expect(result).toBeNull();
    });
  });
});
