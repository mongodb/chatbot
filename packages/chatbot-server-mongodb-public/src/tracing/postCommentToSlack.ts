import { AssistantMessage, Conversation } from "mongodb-rag-core";
import { ObjectId } from "mongodb-rag-core/mongodb";
import { WebClient } from "@slack/web-api";
import { Blocks, Message as BuilderMessage, Md } from "slack-block-builder";
import { extractTracingData } from "./extractTracingData";
import { strict as assert } from "assert";
import slackify from "slackify-markdown";

export interface PostCommentToSlackParams {
  slackToken: string;
  slackConversationId: string;
  conversation: Conversation;
  messageWithCommentId: ObjectId;
}
export async function postCommentToSlack({
  slackToken,
  slackConversationId,
  conversation,
  messageWithCommentId,
}: PostCommentToSlackParams) {
  const client = new WebClient(slackToken);
  const builder = makeSlackMessageText(
    conversation,
    messageWithCommentId,
    slackConversationId
  );
  const res = await client.chat.postMessage(builder);
  return res;
}

function makeSlackMessageText(
  conversation: Conversation,
  messageWithCommentId: ObjectId,
  slackConversationId: string
) {
  const {
    isVerifiedAnswer,
    llmDoesNotKnow,
    rejectQuery,
    tags,
    numRetrievedChunks,
    assistantMessage,
    userMessage,
  } = extractTracingData(conversation.messages, messageWithCommentId);

  assert(assistantMessage, "Assistant message not found");
  assert(userMessage, "User message not found");
  const { rating, userComment } = extractFeedback(assistantMessage);
  assert(rating, "Rating not found");
  assert(userComment, "User comment not found");
  const feedbackMd = `${Md.bold(
    rating === true ? "👍 Positive Feedback" : "👎 Negative Feedback"
  )}

${Md.bold("User Comment:")}
${userComment}`;

  const messagesMd = `${Md.blockquote(
    `${Md.bold(Md.emoji("bust_in_silhouette") + ` User`)}`
  )}

${slackify(fixNewLines(userMessage.content))}

${`${Md.blockquote(Md.bold(Md.emoji("robot_face") + ` Assistant`))}`}

${slackify(fixNewLines(assistantMessage.content))}`;

  const messageMetadataMd = `${Md.bold("Metadata:")}

${Md.listBullet(`Verified Answer: ${isVerifiedAnswer ? "Yes" : "No"}`)}
${Md.listBullet(`LLM Does Not Know: ${llmDoesNotKnow ? "Yes" : "No"}`)}
${Md.listBullet(`Rejected Query: ${rejectQuery ? "Yes" : "No"}`)}
${Md.listBullet(`Number of Retrieved Chunks: ${numRetrievedChunks}`)}
${Md.listBullet(`Tags: ${tags.map(Md.codeInline).join(", ")}`)}`;

  const idMetadataMd = `Conversation ID: ${Md.codeInline(
    conversation._id.toHexString()
  )}
Message ID: ${Md.codeInline(messageWithCommentId.toHexString())}`;

  return BuilderMessage({
    channel: slackConversationId,
    text: "User Feedback",
  })
    .blocks(
      Blocks.Section({ text: feedbackMd }),
      Blocks.Divider(),
      Blocks.Section({ text: messagesMd }),
      Blocks.Divider(),
      Blocks.Section({ text: messageMetadataMd }),
      Blocks.Divider(),
      Blocks.Section({ text: idMetadataMd })
    )
    .asUser()
    .buildToObject();
}

function fixNewLines(text: string) {
  return text.replaceAll("\\n", "\n");
}

function extractFeedback(assistantMessage: AssistantMessage) {
  return {
    rating: assistantMessage.rating,
    userComment: assistantMessage.userComment,
  };
}
