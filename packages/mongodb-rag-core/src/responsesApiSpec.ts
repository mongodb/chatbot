import { ObjectId } from "mongodb";
import OpenAI from "openai";
import { References } from "./References";
import { Conversation } from "./conversations";

async function main() {
  //----------------
  // Data model
  //----------------

  // Store in database using the same data model as our normal conversations.
  // Update the model to have a few additional fields:
  type ResponseConversation = Conversation & {
    store?: boolean; // true by default
    userId?: string;
  };

  //----------------
  // Calling the API
  //----------------

  // "mongodb-latest-search" performs RAG under the hood, similar to https://platform.openai.com/docs/guides/tools-web-search
  // "mongodb-latest" is the standard model. No server-defined RAG
  type Model = "mongodb-latest-search";

  const options = {
    model: "mongodb-latest-search",
    input: "hello",
    metadata: {
      // if the client wants to store any conversation metadata, they can do so here.
      // This metadata is persisted on the server.
      // For example:
      conversationId: "CLIENT_DEFINED",
    },
    tools: [
      // Client-defined tool calls here
      {
        name: "something_compass_related",
        parameters: {
          // client can specify what they want
        },
        strict: true,
        type: "function",
      },
    ],
    user: "CLIENT_DEFINED", // client can define a user ID. saved in database.

    // If the client has a previous response ID, they can pass it in here.
    // By including this, the server will use the previous response as a context for the new response.
    // We'll need to add serverside logic to handle finding previous response ID, and adding it to the
    // messages array.
    // For MongoDB, can do this by indexing messages.id and then doing an update like
    // db.collection.updateOne({ "messages.id": "SOME_VALUE"}, {$push: {messages: {role: "assistant", content: "new!"}}})
    previous_response_id: "SOME_VALUE",
    store: true, // client defines whether or not to store the messages. If false, only store the metadata.
  } satisfies OpenAI.Responses.ResponseCreateParams;
  const oai = new OpenAI();

  // Streaming
  const streamedRes = await oai.responses.create({
    ...options,
    stream: true,
  });

  const out: Record<string, unknown> & {
    content: string;
  } = {
    content: "",
  };

  // how request comes back
  // Based on https://platform.openai.com/docs/api-reference/responses-streaming/response
  for await (const event of streamedRes) {
    switch (event.type) {
      case "response.created":
        out.id = event.response.id;
        out.createdAt = event.response.created_at;
        out.conversationId = event.response.metadata?.conversationId;
        break;
      case "response.output_text.delta":
        out.content += event.delta;

        break;
      // Note: "response.output_text_annotation.added" supports arbitrary annotations.
      case "response.output_text_annotation.added":
        if (
          event.annotation &&
          typeof event.annotation === "object" &&
          "type" in event.annotation &&
          typeof event.annotation.type === "string"
        ) {
          if (event.annotation.type === "references") {
            out.references = (
              event.annotation as ReferencesAnnotation
            ).references;
          }
          if (event.annotation.type === "verified_answer") {
            out.isVerified = (
              event.annotation as VerifiedAnswerAnnotation
            ).isVerified;
          }
        }
        break;
    }

    // Non-streaming
    // Note: consider not supporting this for first pass. Only streaming at first.
    // Also, I don't think will have users any time soon.
  }
}

type VerifiedAnswerAnnotation = {
  type: "verified_answer";
  isVerified: true;
};

type ReferencesAnnotation = {
  type: "references";
  references: References;
};
