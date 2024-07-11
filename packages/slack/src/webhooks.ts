import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { boltApp } from "./slackbot";
import { SLACK_FEEDBACK_CHANNEL, SLACK_WEBHOOK_SERVER_PORT } from "./config";
import { ZodRawShape, z } from "zod";
import { stripIndents } from "common-tags";

function pascalCase(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const honoApp = new Hono();

const SomeWebhookEvent = z.object({
  type: z.string(),
  data: z.unknown(),
});

function createWebhookEvent<
  T extends z.ZodLiteral<string>,
  D extends z.ZodObject<ZodRawShape>
>(type: T, data: D) {
  return SomeWebhookEvent.extend({
    type,
    data,
  });
}

const UserMessage = z.object({
  role: z.literal("user"),
  content: z.string(),
});

const AssistantMessage = z.object({
  role: z.literal("assistant"),
  content: z.string(),
});

const HistoryMessage = z.discriminatedUnion("role", [
  UserMessage,
  AssistantMessage,
]);

const UserRatedMessageWebhookEvent = createWebhookEvent(
  z.literal("user_rated_message"),
  z.object({
    conversationId: z.string(),
    messageId: z.string(),
    rating: z.boolean(),
    userComment: z.string(),
    conversationHistory: z
      .array(HistoryMessage)
      .describe(
        "Relevant conversation history leading up to and including the rated message"
      ),
  })
);

const UserSentMessageWebhookEvent = createWebhookEvent(
  z.literal("user_sent_message"),
  z.object({
    conversationId: z.string(),
    messageId: z.string(),
    messageContent: z.string(),
  })
);

const WebhookEvent = z.discriminatedUnion("type", [
  UserSentMessageWebhookEvent,
  UserRatedMessageWebhookEvent,
]);

honoApp.post("/events", async (c) => {
  const requestBody = await c.req.json();
  const eventData = WebhookEvent.parse(requestBody);
  switch (eventData.type) {
    case "user_rated_message": {
      const {
        conversationId,
        messageId,
        rating,
        userComment,
        conversationHistory,
      } = eventData.data;

      const ratingType = rating ? "positive" : "negative";
      const ratingIcon = rating ? ":thumbsup:" : ":thumbsdown:";

      const postResult = await boltApp.client.chat.postMessage({
        channel: SLACK_FEEDBACK_CHANNEL,
        text: `A user rated a message ${ratingType}ly and left the following comment: ${userComment}.`,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: stripIndents`
                ${ratingIcon} *${pascalCase(ratingType)} Feedback*
                Conversation: \`${conversationId}\`
                Message: \`${messageId}\`

                ${userComment}`,
            },
          },
          ...conversationHistory.map((message) => {
            const roleIcon =
              message.role === "user" ? ":bust_in_silhouette:" : ":robot_face:";
            return {
              type: "section",
              text: {
                type: "mrkdwn",
                text: stripIndents`
                  > *${roleIcon} ${pascalCase(message.role)}*
                  > ${message.content.split("\n").join("\n> ")}
                `,
              },
            };
          }),
          {
            type: "divider",
          },
        ],
      });
      return c.json({
        success: postResult.ok,
        channel: postResult.channel,
        ts: postResult.ts,
      });
    }

    case "user_sent_message": {
      break;
    }
    default:
      break;
  }
});

export const webhookServer = {
  fetch: honoApp.fetch,
  port: SLACK_WEBHOOK_SERVER_PORT,
  overrideGlobalObjects: false,
};

export const startWebhookServer = () => {
  serve(webhookServer, () => {
    console.log(`Webhook server is running on port ${webhookServer.port}`);
  });
};
