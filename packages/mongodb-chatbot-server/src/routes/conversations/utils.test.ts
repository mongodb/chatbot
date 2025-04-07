import { strict as assert } from "assert";
import {
  areEquivalentIpAddresses,
  convertConversationFromDbToApi,
  convertMessageFromDbToApi,
  isValidIp,
} from "./utils";
import { Conversation } from "mongodb-rag-core";
import { ObjectId } from "mongodb-rag-core/mongodb";

describe("Conversation routes utils", () => {
  describe("isValidIp()", () => {
    test("should return true for valid IPv4 addresses", () => {
      const ipv4 = "92.0.2.146";
      expect(isValidIp(ipv4)).toBe(true);
    });
    test("should return true for valid IPv6 addresses", () => {
      const ipv6 = "2001:0db8:85a3:0000:0000:8a2e:0370:7334";
      expect(isValidIp(ipv6)).toBe(true);
    });
    test("should return false for invalid IP addresses", () => {
      const invalidIp = "notAnIp";
      expect(isValidIp(invalidIp)).toBe(false);
    });
  });
  describe("areEquivalentIpAddresses()", () => {
    test("should return true for equivalent IPv4 addresses", () => {
      const ipv4 = "92.0.2.146";
      expect(areEquivalentIpAddresses(ipv4, ipv4)).toBe(true);
    });
    test("should return true for equivalent IPv6 addresses", () => {
      const ipv6 = "2001:0db8:85a3:0000:0000:8a2e:0370:7334";
      expect(areEquivalentIpAddresses(ipv6, ipv6)).toBe(true);
    });
    test("should return true for equivalent IPv4 and IPv6 addresses", () => {
      const ipv4 = "127.0.0.1";
      const ipv6 = "::ffff:127.0.0.1";
      expect(areEquivalentIpAddresses(ipv4, ipv6)).toBe(true);
      expect(areEquivalentIpAddresses(ipv6, ipv4)).toBe(true);
    });
  });
});

const exampleConversationInDatabase: Conversation = {
  _id: new ObjectId("65ca743910cae16a93ff3548"),
  createdAt: new Date("2024-01-01T00:00:00Z"),
  messages: [
    {
      id: new ObjectId("65ca766ab564b694eba8c330"),
      role: "system",
      content:
        "You are an expert conversationalist! You can chat about anything with anyone.",
      createdAt: new Date("2024-01-01T00:00:01Z"),
    },
    {
      id: new ObjectId("65ca76775a57e51c3b4c286d"),
      role: "user",
      content:
        "Hello! I'm looking for a new book to read. I like fantasy and science fiction novels. Can you recommend one?",
      createdAt: new Date("2024-01-01T00:00:42Z"),
    },
    {
      id: new ObjectId("65ca767e30116ce068e17bb5"),
      role: "assistant",
      content: "",
      functionCall: {
        name: "getBookRecommendations",
        arguments: JSON.stringify({ genre: ["fantasy", "sci-fi"] }),
      },
      createdAt: new Date("2024-01-01T00:00:45Z"),
    },
    {
      id: new ObjectId("65ca768341f9ea61d048aaa8"),
      role: "function",
      name: "getBookRecommendations",
      content: JSON.stringify([
        { title: "The Way of Kings", author: "Brandon Sanderson" },
        { title: "Neuromancer", author: "William Gibson" },
        { title: "Snow Crash", author: "Neal Stephenson" },
      ]),
      createdAt: new Date("2024-01-01T00:00:47Z"),
    },
    {
      id: new ObjectId("65ca76874e1df9cf2742bf86"),
      role: "assistant",
      content: `I recommend "The Way of Kings" by Brandon Sanderson. You may also enjoy "Neuromancer" by William Gibson or "Snow Crash" by Neal Stephenson.`,
      createdAt: new Date("2024-01-01T00:00:52Z"),
    },
  ],
};

describe("Data Conversion Functions", () => {
  describe("convertMessageFromDbToApi", () => {
    test("serializes values", () => {
      const [
        systemMessage,
        userMessage,
        functionCallMessage,
        functionResultMessage,
        assistantMessage,
      ] = exampleConversationInDatabase.messages;

      expect(convertMessageFromDbToApi(systemMessage)).toEqual({
        id: "65ca766ab564b694eba8c330",
        role: "system",
        content:
          "You are an expert conversationalist! You can chat about anything with anyone.",
        createdAt: 1704067201000,
      });

      expect(convertMessageFromDbToApi(userMessage)).toEqual({
        id: "65ca76775a57e51c3b4c286d",
        role: "user",
        content:
          "Hello! I'm looking for a new book to read. I like fantasy and science fiction novels. Can you recommend one?",
        createdAt: 1704067242000,
      });

      expect(convertMessageFromDbToApi(functionCallMessage)).toEqual({
        id: "65ca767e30116ce068e17bb5",
        role: "assistant",
        content: "",
        createdAt: 1704067245000,
      });

      expect(convertMessageFromDbToApi(functionResultMessage)).toEqual({
        id: "65ca768341f9ea61d048aaa8",
        role: "function",
        content: JSON.stringify([
          { title: "The Way of Kings", author: "Brandon Sanderson" },
          { title: "Neuromancer", author: "William Gibson" },
          { title: "Snow Crash", author: "Neal Stephenson" },
        ]),
        createdAt: 1704067247000,
      });

      expect(convertMessageFromDbToApi(assistantMessage)).toEqual({
        id: "65ca76874e1df9cf2742bf86",
        role: "assistant",
        content: `I recommend "The Way of Kings" by Brandon Sanderson. You may also enjoy "Neuromancer" by William Gibson or "Snow Crash" by Neal Stephenson.`,
        createdAt: 1704067252000,
        rating: undefined,
        references: undefined,
      });
    });
    test("do not include conversationId if not provided", () => {
      const message = exampleConversationInDatabase.messages[0];
      expect(convertMessageFromDbToApi(message)).not.toMatchObject({
        metadata: { conversationId: expect.any(String) },
      });
    });
    test("include conversationId in assistant message if provided", () => {
      const message = exampleConversationInDatabase.messages.find(
        (m) => m.role === "assistant"
      );
      assert(message);
      const convoId = new ObjectId();
      expect(convertMessageFromDbToApi(message, convoId)).toMatchObject({
        metadata: { conversationId: convoId.toString() },
      });
    });
    test("don't include conversationId in non-assistant messages", () => {
      const message = exampleConversationInDatabase.messages.find(
        (m) => m.role !== "assistant"
      );
      assert(message);
      const convoId = new ObjectId();
      expect(convertMessageFromDbToApi(message, convoId)).not.toMatchObject({
        metadata: { conversationId: expect.any(String) },
      });
    });
  });

  describe("convertConversationFromDbToApi", () => {
    test("serializes values & removes system, assistant:functionCall, and function messages", () => {
      const apiConversation = convertConversationFromDbToApi(
        exampleConversationInDatabase
      );
      expect(apiConversation).toEqual({
        _id: "65ca743910cae16a93ff3548",
        createdAt: 1704067200000,
        messages: [
          {
            id: "65ca76775a57e51c3b4c286d",
            role: "user",
            content:
              "Hello! I'm looking for a new book to read. I like fantasy and science fiction novels. Can you recommend one?",
            createdAt: 1704067242000,
          },
          {
            id: "65ca76874e1df9cf2742bf86",
            role: "assistant",
            content: `I recommend "The Way of Kings" by Brandon Sanderson. You may also enjoy "Neuromancer" by William Gibson or "Snow Crash" by Neal Stephenson.`,
            createdAt: 1704067252000,
            rating: undefined,
            references: undefined,
          },
        ],
      });
    });
  });
});
