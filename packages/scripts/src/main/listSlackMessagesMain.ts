import dotenv from "dotenv";
import { WebClient } from "@slack/web-api";
import path from "path";

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

/**
 Lists the last 25 messages from a Slack channel
 
 @param channelId - The ID of the Slack channel to fetch messages from
 */
export async function listSlackMessages(channelId: string): Promise<void> {
  // Check if SLACK_BOT_TOKEN is available in environment variables
  const slackToken = process.env.SLACK_BOT_TOKEN;
  if (!slackToken) {
    console.error("Error: SLACK_BOT_TOKEN environment variable is not set");
    console.error("Please add it to your .env file");
    process.exit(1);
  }

  try {
    // Initialize the Slack Web API client
    const client = new WebClient(slackToken);

    console.log(`Fetching the last 25 messages from channel: ${channelId}`);

    // Call the conversations.history method
    const result = await client.conversations.history({
      channel: channelId,
      limit: 25,
    });

    if (!result.messages || result.messages.length === 0) {
      console.log("No messages found in this channel");
      return;
    }

    // Display the messages
    console.log(`Found ${result.messages.length} messages:`);
    console.log("-----------------------------------");

    result.messages.forEach((message, index) => {
      const timestamp = new Date(Number(message.ts) * 1000).toLocaleString();
      console.log(`[${index + 1}] ${timestamp}`);
      console.log(`User: ${message.user || "Unknown"}`);
      console.log(`Text: ${message.text || "No text content"}`);
      console.log("-----------------------------------");
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    process.exit(1);
  }
}

// Main function to run when script is executed directly
if (require.main === module) {
  // Get channel ID from command line arguments
  const args = process.argv.slice(2);
  if (args.length !== 1) {
    console.error("Usage: npm run listSlackMessages -- <channel_id>");
    process.exit(1);
  }

  console.info(
    `NOTE: You can find a specific message ID (i.e. its \`ts\` value) by opening a channel in the Slack Web UI and inspecting the message in dev tools. For example, id="1741289525.588509".\n`
  );

  const channelId = args[0];
  listSlackMessages(channelId).catch(console.error);
}
