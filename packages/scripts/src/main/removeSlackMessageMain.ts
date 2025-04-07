import dotenv from "dotenv";
import { WebClient } from "@slack/web-api";
import path from "path";

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

/**
 Removes a message from a Slack channel
 
 @param channelId - The ID of the Slack channel
 @param messageTs - The timestamp of the message to remove
 */
export async function removeSlackMessage(
  channelId: string,
  messageTs: string
): Promise<void> {
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

    console.log(
      `Attempting to delete message with timestamp ${messageTs} from channel ${channelId}`
    );

    // Call the chat.delete method to remove the message
    const result = await client.chat.delete({
      channel: channelId,
      ts: messageTs,
      as_user: true, // Delete as the authenticated user
    });

    if (result.ok) {
      console.log("Message successfully deleted");
    } else {
      console.error("Failed to delete message:", result.error);
    }
  } catch (error) {
    console.error("Error deleting message:", error);
    process.exit(1);
  }
}

// Main function to run when script is executed directly
if (require.main === module) {
  // Get channel ID and message timestamp from command line arguments
  const args = process.argv.slice(2);
  if (args.length !== 2) {
    console.error(
      "Usage: npm run removeSlackMessage -- <channel_id> <message_timestamp>"
    );
    console.error(
      "Example: npm run removeSlackMessage -- C01234ABCDE 1623456789.123456"
    );
    process.exit(1);
  }

  const [channelId, messageTs] = args;
  removeSlackMessage(channelId, messageTs).catch(console.error);
}
