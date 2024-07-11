import "dotenv/config";
import { App, ExpressReceiver } from "@slack/bolt";
import {
  SLACK_BOT_SERVER_PORT,
  SLACK_BOT_TOKEN,
  SLACK_SIGNING_SECRET,
} from "./config";

const receiver = new ExpressReceiver({
  signingSecret: SLACK_SIGNING_SECRET,
});

export const boltApp = new App({
  token: SLACK_BOT_TOKEN,
  receiver,
});

boltApp.message("hello", async ({ message, say }) => {
  await say(`Hello, <@${message.channel} at <@${message.ts}>!`);
});

boltApp.message(":wave:", async ({ message, say }) => {
  // Handle only newly posted messages here
  if (
    message.subtype === undefined ||
    message.subtype === "bot_message" ||
    message.subtype === "file_share" ||
    message.subtype === "thread_broadcast"
  ) {
    await say(`Hello, <@${message.user}>`);
  }
});

// export const slackbotServer = createServer(receiver.app);

export const startSlackbotServer = async () => {
  await boltApp.start(SLACK_BOT_SERVER_PORT);
  console.log(`Slack Bolt server is running on port ${SLACK_BOT_SERVER_PORT}`);
};
