import { Response } from "express";
import { OpenAiStreamingResponse } from "./llm";

function escapeNewlines(str: string) {
  return str.replaceAll(`\n`, `\\n`);
}

interface AnswerParams {
  res: Response;
  answerStream: OpenAiStreamingResponse;
  furtherReading?: string;
}

interface ServerSentEventDispatcher {
  sendData(args: { res: Response; data: object }): void;
  sendEvent(args: { res: Response; eventType: string; data: object }): void;
}
type SendDataArgs = Parameters<ServerSentEventDispatcher["sendData"]>[0];
type SendEventArgs = Parameters<ServerSentEventDispatcher["sendEvent"]>[0];

export class DataStreamerService implements ServerSentEventDispatcher {
  static setServerSentEventHeaders(res: Response) {
    const CacheControl = res.getHeader("Cache-Control");
    const ContentType = res.getHeader("Content-Type");
    const Connection = res.getHeader("Connection");

    if (!CacheControl && !ContentType && !Connection) {
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders(); // flush the headers to establish SSE with client
    }

    return res;
  }

  setServerSentEventHeaders(res: Response) {
    return DataStreamerService.setServerSentEventHeaders(res);
  }

  static sendData({ res, data }: SendDataArgs) {
    res = DataStreamerService.setServerSentEventHeaders(res);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  static sendEvent({ res, eventType, data }: SendEventArgs) {
    res = DataStreamerService.setServerSentEventHeaders(res);
    res.write(`event: ${eventType}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  sendData(args: SendDataArgs) {
    return DataStreamerService.sendData(args);
  }

  sendEvent(args: SendEventArgs) {
    return DataStreamerService.sendEvent(args);
  }

  // NOTE: for example streaming data, see https://github.com/openai/openai-node/issues/18#issuecomment-1369996933
  async answer({ res, answerStream, furtherReading }: AnswerParams) {
    // If the client closes the connection, stop sending events
    res.on("close", () => {
      res.end();
    });

    let str = "";
    for await (const event of answerStream) {
      for (const choice of event.choices) {
        if (choice.delta) {
          const content = escapeNewlines(choice.delta.content ?? "");
          this.sendData({
            res,
            data: { type: "delta", data: content },
          });
          str += content;
        }
      }
    }
    if (furtherReading) {
      this.sendData({
        res,
        data: { type: "delta", data: furtherReading },
      });
    }
    return str;
  }
}
