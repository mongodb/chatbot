import { Analytics } from "@segment/analytics-node";
import { ObjectId } from "mongodb-rag-core/mongodb";
import {
  makeTrackUserSentMessage,
  makeTrackAssistantResponded,
  makeTrackUserRatedMessage,
  makeTrackUserCommentedMessage,
} from "./segment";

jest.mock("@segment/analytics-node");

describe("Segment Tracking", () => {
  const mockAnalytics = {
    track: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (Analytics as jest.Mock).mockImplementation(() => mockAnalytics);
  });

  const commonParams = {
    conversationId: new ObjectId(),
    origin: "https://example.com/chat",
    createdAt: new Date(),
  };

  describe("trackUserSentMessage", () => {
    it("should track user message with both user IDs", async () => {
      const trackUserSentMessage = makeTrackUserSentMessage({
        writeKey: "test-key",
      });

      await trackUserSentMessage({
        ...commonParams,
        userId: "user123",
        anonymousId: "anon123",
        tags: ["tag1", "tag2"],
      });

      expect(mockAnalytics.track).toHaveBeenCalledWith({
        event: "AI Chat User Sent Message",
        userId: "user123",
        anonymousId: "anon123",
        timestamp: commonParams.createdAt.toISOString(),
        properties: {
          userId: "user123",
          anonymousId: "anon123",
          path: "/chat",
          url: "https://example.com/chat",
          ai_chat_conversation_id: commonParams.conversationId.toString(),
          ai_chat_tags: "tag1,tag2",
        },
      });
    });

    it("should track with only userId", async () => {
      const trackUserSentMessage = makeTrackUserSentMessage({
        writeKey: "test-key",
      });

      await trackUserSentMessage({
        ...commonParams,
        userId: "user123",
        tags: ["tag1"],
      });

      expect(mockAnalytics.track).toHaveBeenCalledWith({
        event: "AI Chat User Sent Message",
        userId: "user123",
        anonymousId: undefined,
        timestamp: commonParams.createdAt.toISOString(),
        properties: {
          userId: "user123",
          anonymousId: undefined,
          path: "/chat",
          url: "https://example.com/chat",
          ai_chat_conversation_id: commonParams.conversationId.toString(),
          ai_chat_tags: "tag1",
        },
      });
    });

    it("should track with only anonymousId", async () => {
      const trackUserSentMessage = makeTrackUserSentMessage({
        writeKey: "test-key",
      });

      await trackUserSentMessage({
        ...commonParams,
        anonymousId: "anon123",
        tags: ["tag1"],
      });

      expect(mockAnalytics.track).toHaveBeenCalledWith({
        event: "AI Chat User Sent Message",
        userId: undefined,
        anonymousId: "anon123",
        timestamp: commonParams.createdAt.toISOString(),
        properties: {
          userId: undefined,
          anonymousId: "anon123",
          path: "/chat",
          url: "https://example.com/chat",
          ai_chat_conversation_id: commonParams.conversationId.toString(),
          ai_chat_tags: "tag1",
        },
      });
    });

    it("should not track when both userId and anonymousId are missing", async () => {
      const trackUserSentMessage = makeTrackUserSentMessage({
        writeKey: "test-key",
      });

      await expect(
        trackUserSentMessage({
          ...commonParams,
          tags: ["tag1"],
        })
      ).rejects.toThrow(
        /Unable to create track event params for trackUserSentMessage/
      );

      expect(mockAnalytics.track).not.toHaveBeenCalled();
    });

    it("should not track when origin URL is invalid", async () => {
      const trackUserSentMessage = makeTrackUserSentMessage({
        writeKey: "test-key",
      });

      await expect(
        trackUserSentMessage({
          ...commonParams,
          origin: "invalid-url",
          tags: ["tag1"],
        })
      ).rejects.toThrow(
        /Unable to create track event params for trackUserSentMessage/
      );

      expect(mockAnalytics.track).not.toHaveBeenCalled();
    });
  });

  describe("trackAssistantResponded", () => {
    it("should track assistant response with verified answer", async () => {
      const trackAssistantResponded = makeTrackAssistantResponded({
        writeKey: "test-key",
      });

      await trackAssistantResponded({
        ...commonParams,
        userId: "user123",
        anonymousId: "anon123",
        isVerifiedAnswer: true,
      });

      expect(mockAnalytics.track).toHaveBeenCalledWith({
        event: "AI Chat Assistant Responded",
        userId: "user123",
        anonymousId: "anon123",
        timestamp: commonParams.createdAt.toISOString(),
        properties: {
          userId: "user123",
          anonymousId: "anon123",
          path: "/chat",
          url: "https://example.com/chat",
          ai_chat_conversation_id: commonParams.conversationId.toString(),
          ai_chat_verified_answer: "true",
        },
      });
    });

    it("should track assistant response with rejection reason", async () => {
      const trackAssistantResponded = makeTrackAssistantResponded({
        writeKey: "test-key",
      });

      await trackAssistantResponded({
        ...commonParams,
        userId: "user123",
        anonymousId: "anon123",
        isVerifiedAnswer: false,
        rejectionReason: "off-topic",
      });

      expect(mockAnalytics.track).toHaveBeenCalledWith({
        event: "AI Chat Assistant Responded",
        userId: "user123",
        anonymousId: "anon123",
        timestamp: commonParams.createdAt.toISOString(),
        properties: {
          userId: "user123",
          anonymousId: "anon123",
          path: "/chat",
          url: "https://example.com/chat",
          ai_chat_conversation_id: commonParams.conversationId.toString(),
          ai_chat_verified_answer: "false",
          ai_chat_rejected_reason: "off-topic",
        },
      });
    });

    it("should track assistant response with both user IDs", async () => {
      const trackAssistantResponded = makeTrackAssistantResponded({
        writeKey: "test-key",
      });

      await trackAssistantResponded({
        ...commonParams,
        userId: "user123",
        anonymousId: "anon123",
        isVerifiedAnswer: false,
      });

      expect(mockAnalytics.track).toHaveBeenCalledWith({
        event: "AI Chat Assistant Responded",
        userId: "user123",
        anonymousId: "anon123",
        timestamp: commonParams.createdAt.toISOString(),
        properties: {
          userId: "user123",
          anonymousId: "anon123",
          path: "/chat",
          url: "https://example.com/chat",
          ai_chat_conversation_id: commonParams.conversationId.toString(),
          ai_chat_verified_answer: "false",
        },
      });
    });

    it("should track with only userId", async () => {
      const trackAssistantResponded = makeTrackAssistantResponded({
        writeKey: "test-key",
      });

      await trackAssistantResponded({
        ...commonParams,
        userId: "user123",
        isVerifiedAnswer: false,
      });

      expect(mockAnalytics.track).toHaveBeenCalledWith({
        event: "AI Chat Assistant Responded",
        userId: "user123",
        anonymousId: undefined,
        timestamp: commonParams.createdAt.toISOString(),
        properties: {
          userId: "user123",
          anonymousId: undefined,
          path: "/chat",
          url: "https://example.com/chat",
          ai_chat_conversation_id: commonParams.conversationId.toString(),
          ai_chat_verified_answer: "false",
        },
      });
    });

    it("should track with only anonymousId", async () => {
      const trackAssistantResponded = makeTrackAssistantResponded({
        writeKey: "test-key",
      });

      await trackAssistantResponded({
        ...commonParams,
        anonymousId: "anon123",
        isVerifiedAnswer: false,
      });

      expect(mockAnalytics.track).toHaveBeenCalledWith({
        event: "AI Chat Assistant Responded",
        userId: undefined,
        anonymousId: "anon123",
        timestamp: commonParams.createdAt.toISOString(),
        properties: {
          userId: undefined,
          anonymousId: "anon123",
          path: "/chat",
          url: "https://example.com/chat",
          ai_chat_conversation_id: commonParams.conversationId.toString(),
          ai_chat_verified_answer: "false",
        },
      });
    });

    it("should not track when both userId and anonymousId are missing", async () => {
      const trackAssistantResponded = makeTrackAssistantResponded({
        writeKey: "test-key",
      });

      await expect(
        trackAssistantResponded({
          ...commonParams,
          isVerifiedAnswer: false,
        })
      ).rejects.toThrow(
        /Unable to create track event params for trackAssistantResponded/
      );

      expect(mockAnalytics.track).not.toHaveBeenCalled();
    });

    it("should not track when origin URL is invalid", async () => {
      const trackAssistantResponded = makeTrackAssistantResponded({
        writeKey: "test-key",
      });

      await expect(
        trackAssistantResponded({
          ...commonParams,
          origin: "invalid-url",
          isVerifiedAnswer: true,
        })
      ).rejects.toThrow(
        /Unable to create track event params for trackAssistantResponded/
      );

      expect(mockAnalytics.track).not.toHaveBeenCalled();
    });
  });

  describe("trackUserRatedMessage", () => {
    it("should track positive rating", async () => {
      const trackUserRatedMessage = makeTrackUserRatedMessage({
        writeKey: "test-key",
      });

      await trackUserRatedMessage({
        ...commonParams,
        userId: "user123",
        anonymousId: "anon123",
        rating: true,
      });

      expect(mockAnalytics.track).toHaveBeenCalledWith({
        event: "AI Chat User Rated Message",
        userId: "user123",
        anonymousId: "anon123",
        timestamp: commonParams.createdAt.toISOString(),
        properties: {
          userId: "user123",
          anonymousId: "anon123",
          path: "/chat",
          url: "https://example.com/chat",
          ai_chat_conversation_id: commonParams.conversationId.toString(),
          ai_chat_rating: "positive",
        },
      });
    });

    it("should track negative rating", async () => {
      const trackUserRatedMessage = makeTrackUserRatedMessage({
        writeKey: "test-key",
      });

      await trackUserRatedMessage({
        ...commonParams,
        userId: "user123",
        anonymousId: "anon123",
        rating: false,
      });

      expect(mockAnalytics.track).toHaveBeenCalledWith({
        event: "AI Chat User Rated Message",
        userId: "user123",
        anonymousId: "anon123",
        timestamp: commonParams.createdAt.toISOString(),
        properties: {
          userId: "user123",
          anonymousId: "anon123",
          path: "/chat",
          url: "https://example.com/chat",
          ai_chat_conversation_id: commonParams.conversationId.toString(),
          ai_chat_rating: "negative",
        },
      });
    });

    it("should track assistant response with both user IDs", async () => {
      const trackUserRatedMessage = makeTrackUserRatedMessage({
        writeKey: "test-key",
      });

      await trackUserRatedMessage({
        ...commonParams,
        userId: "user123",
        anonymousId: "anon123",
        rating: true,
      });

      expect(mockAnalytics.track).toHaveBeenCalledWith({
        event: "AI Chat User Rated Message",
        userId: "user123",
        anonymousId: "anon123",
        timestamp: commonParams.createdAt.toISOString(),
        properties: {
          userId: "user123",
          anonymousId: "anon123",
          path: "/chat",
          url: "https://example.com/chat",
          ai_chat_conversation_id: commonParams.conversationId.toString(),
          ai_chat_rating: "positive",
        },
      });
    });

    it("should track with only userId", async () => {
      const trackUserRatedMessage = makeTrackUserRatedMessage({
        writeKey: "test-key",
      });

      await trackUserRatedMessage({
        ...commonParams,
        userId: "user123",
        rating: true,
      });

      expect(mockAnalytics.track).toHaveBeenCalledWith({
        event: "AI Chat User Rated Message",
        userId: "user123",
        anonymousId: undefined,
        timestamp: commonParams.createdAt.toISOString(),
        properties: {
          userId: "user123",
          anonymousId: undefined,
          path: "/chat",
          url: "https://example.com/chat",
          ai_chat_conversation_id: commonParams.conversationId.toString(),
          ai_chat_rating: "positive",
        },
      });
    });

    it("should track with only anonymousId", async () => {
      const trackUserRatedMessage = makeTrackUserRatedMessage({
        writeKey: "test-key",
      });

      await trackUserRatedMessage({
        ...commonParams,
        anonymousId: "anon123",
        rating: true,
      });

      expect(mockAnalytics.track).toHaveBeenCalledWith({
        event: "AI Chat User Rated Message",
        userId: undefined,
        anonymousId: "anon123",
        timestamp: commonParams.createdAt.toISOString(),
        properties: {
          userId: undefined,
          anonymousId: "anon123",
          path: "/chat",
          url: "https://example.com/chat",
          ai_chat_conversation_id: commonParams.conversationId.toString(),
          ai_chat_rating: "positive",
        },
      });
    });

    it("should not track when both userId and anonymousId are missing", async () => {
      const trackUserRatedMessage = makeTrackUserRatedMessage({
        writeKey: "test-key",
      });

      await expect(
        trackUserRatedMessage({
          ...commonParams,
          rating: true,
        })
      ).rejects.toThrow(
        /Unable to create track event params for trackUserRatedMessage/
      );

      expect(mockAnalytics.track).not.toHaveBeenCalled();
    });

    it("should not track when origin URL is invalid", async () => {
      const trackUserRatedMessage = makeTrackUserRatedMessage({
        writeKey: "test-key",
      });

      await expect(
        trackUserRatedMessage({
          ...commonParams,
          origin: "invalid-url",
          rating: true,
        })
      ).rejects.toThrow(
        /Unable to create track event params for trackUserRatedMessage/
      );

      expect(mockAnalytics.track).not.toHaveBeenCalled();
    });
  });

  describe("trackUserCommentedMessage", () => {
    it("should track user comment with positive rating", async () => {
      const trackUserCommentedMessage = makeTrackUserCommentedMessage({
        writeKey: "test-key",
      });

      await trackUserCommentedMessage({
        ...commonParams,
        userId: "user123",
        anonymousId: "anon123",
        comment: "This was very helpful!",
        rating: true,
      });

      expect(mockAnalytics.track).toHaveBeenCalledWith({
        event: "AI Chat User Commented Message",
        userId: "user123",
        anonymousId: "anon123",
        timestamp: commonParams.createdAt.toISOString(),
        properties: {
          userId: "user123",
          anonymousId: "anon123",
          path: "/chat",
          url: "https://example.com/chat",
          ai_chat_conversation_id: commonParams.conversationId.toString(),
          ai_chat_user_comment: "This was very helpful!",
          ai_chat_rating: "positive",
        },
      });
    });

    it("should track user comment with negative rating", async () => {
      const trackUserCommentedMessage = makeTrackUserCommentedMessage({
        writeKey: "test-key",
      });

      await trackUserCommentedMessage({
        ...commonParams,
        userId: "user123",
        anonymousId: "anon123",
        comment: "This wasn't helpful at all.",
        rating: false,
      });

      expect(mockAnalytics.track).toHaveBeenCalledWith({
        event: "AI Chat User Commented Message",
        userId: "user123",
        anonymousId: "anon123",
        timestamp: commonParams.createdAt.toISOString(),
        properties: {
          userId: "user123",
          anonymousId: "anon123",
          path: "/chat",
          url: "https://example.com/chat",
          ai_chat_conversation_id: commonParams.conversationId.toString(),
          ai_chat_user_comment: "This wasn't helpful at all.",
          ai_chat_rating: "negative",
        },
      });
    });

    it("should track user comment with both user IDs", async () => {
      const trackUserCommentedMessage = makeTrackUserCommentedMessage({
        writeKey: "test-key",
      });

      await trackUserCommentedMessage({
        ...commonParams,
        userId: "user123",
        anonymousId: "anon123",
        comment: "This was very helpful!",
        rating: true,
      });

      expect(mockAnalytics.track).toHaveBeenCalledWith({
        event: "AI Chat User Commented Message",
        userId: "user123",
        anonymousId: "anon123",
        timestamp: commonParams.createdAt.toISOString(),
        properties: {
          userId: "user123",
          anonymousId: "anon123",
          path: "/chat",
          url: "https://example.com/chat",
          ai_chat_conversation_id: commonParams.conversationId.toString(),
          ai_chat_user_comment: "This was very helpful!",
          ai_chat_rating: "positive",
        },
      });
    });

    it("should track with only userId", async () => {
      const trackUserCommentedMessage = makeTrackUserCommentedMessage({
        writeKey: "test-key",
      });

      await trackUserCommentedMessage({
        ...commonParams,
        userId: "user123",
        comment: "This was very helpful!",
        rating: true,
      });

      expect(mockAnalytics.track).toHaveBeenCalledWith({
        event: "AI Chat User Commented Message",
        userId: "user123",
        anonymousId: undefined,
        timestamp: commonParams.createdAt.toISOString(),
        properties: {
          userId: "user123",
          anonymousId: undefined,
          path: "/chat",
          url: "https://example.com/chat",
          ai_chat_conversation_id: commonParams.conversationId.toString(),
          ai_chat_user_comment: "This was very helpful!",
          ai_chat_rating: "positive",
        },
      });
    });

    it("should track with only anonymousId", async () => {
      const trackUserCommentedMessage = makeTrackUserCommentedMessage({
        writeKey: "test-key",
      });

      await trackUserCommentedMessage({
        ...commonParams,
        anonymousId: "anon123",
        comment: "This was very helpful!",
        rating: true,
      });

      expect(mockAnalytics.track).toHaveBeenCalledWith({
        event: "AI Chat User Commented Message",
        userId: undefined,
        anonymousId: "anon123",
        timestamp: commonParams.createdAt.toISOString(),
        properties: {
          userId: undefined,
          anonymousId: "anon123",
          path: "/chat",
          url: "https://example.com/chat",
          ai_chat_conversation_id: commonParams.conversationId.toString(),
          ai_chat_user_comment: "This was very helpful!",
          ai_chat_rating: "positive",
        },
      });
    });

    it("should not track when both userId and anonymousId are missing", async () => {
      const trackUserCommentedMessage = makeTrackUserCommentedMessage({
        writeKey: "test-key",
      });

      await expect(
        trackUserCommentedMessage({
          ...commonParams,
          comment: "This was very helpful!",
          rating: true,
        })
      ).rejects.toThrow(
        /Unable to create track event params for trackUserCommentedMessage/
      );

      expect(mockAnalytics.track).not.toHaveBeenCalled();
    });

    it("should not track when origin URL is invalid", async () => {
      const trackUserCommentedMessage = makeTrackUserCommentedMessage({
        writeKey: "test-key",
      });

      await expect(
        trackUserCommentedMessage({
          ...commonParams,
          origin: "invalid-url",
          comment: "Test comment",
          rating: true,
        })
      ).rejects.toThrow(
        /Unable to create track event params for trackUserCommentedMessage/
      );
      expect(mockAnalytics.track).not.toHaveBeenCalled();
    });
  });
});
