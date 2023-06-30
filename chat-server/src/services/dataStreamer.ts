// TODO: understand what's happening here
import { Response } from "express";
import { Conversation } from "./conversations";
import { Content } from "chat-core";
import { OpenAiStreamingResponse } from "./llm";

interface AnswerParams {
  res: Response;
  answerStream: OpenAiStreamingResponse;
  furtherReading?: string;
  // conversation: Conversation;
  // chunks: Content[];
}

function escapeNewlines(str: string) {
  return str.replaceAll(`\n`, `\\n`);
}

export interface DataStreamerServiceInterface {
  answer(params: AnswerParams): Promise<string>;
}
export class DataStreamerService {
  // NOTE: for example streaming data, see https://github.com/openai/openai-node/issues/18#issuecomment-1369996933
  async answer({ res, answerStream, furtherReading }: AnswerParams) {
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders(); // flush the headers to establish SSE with client

    // If the client closes the connection, stop sending events
    res.on("close", () => {
      res.end();
    });

    let str = "";
    for await (const event of answerStream) {
      for (const choice of event.choices) {
        if (choice.delta) {
          const content = escapeNewlines(choice.delta.content ?? "");
          const event = { type: "delta", data: content };
          res.write(`data: ${JSON.stringify(event)}\n\n`);
          str += content;
        }
      }
    }
    if (furtherReading) {
      const event = { type: "delta", data: furtherReading };
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    }
    return str;
  }
}
