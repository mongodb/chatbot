import { Response } from "express";
import { OpenAiStreamingResponse } from "./ChatLlm";
import { logger, References } from "chat-core";

function escapeNewlines(str: string): string {
  return str.replaceAll(`\n`, `\\n`);
}

interface ServerSentEventDispatcher<Data extends object | string> {
  connect(): void;
  disconnect(): void;
  sendData(data: Data): void;
  sendEvent(eventType: string, data: Data): void;
}

type ServerSentEventData = object | string;

function makeServerSentEventDispatcher<
  D extends ServerSentEventData = ServerSentEventData
>(res: Response): ServerSentEventDispatcher<D> {
  return {
    connect() {
      // Define SSE headers and respond to the client to establish a connection
      res.writeHead(200, {
        "Cache-Control": "no-cache",
        "Content-Type": "text/event-stream",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": "true",
        Connection: "keep-alive",
      });
    },
    disconnect() {
      res.end();
    },
    sendData(data) {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    },
    sendEvent(eventType, data) {
      res.write(`event: ${eventType}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    },
  };
}

interface StreamParams {
  stream: OpenAiStreamingResponse;
  references?: string;
}

type ChatbotStreamEvent =
  | { type: "delta"; data: string }
  | { type: "references"; data: References }
  | { type: "finished"; data: string };

export interface DataStreamer {
  connected: boolean;
  connect(res: Response): void;
  disconnect(): void;
  streamData(data: ChatbotStreamEvent): void;
  stream(params: StreamParams): Promise<string>;
}

export function makeDataStreamer(): DataStreamer {
  let connected = false;
  let sse: ServerSentEventDispatcher<ChatbotStreamEvent> | undefined;

  return {
    get connected() {
      return connected;
    },
    connect(res) {
      if (this.connected) {
        throw new Error("Tried to connect SSE, but it was already connected.");
      }
      sse = makeServerSentEventDispatcher<ChatbotStreamEvent>(res);
      // If the client closes the connection, stop sending events
      res.on("close", () => {
        if (this.connected) {
          this.disconnect();
        }
      });
      sse.connect();
      connected = true;
    },

    disconnect() {
      if (!this.connected) {
        throw new Error(
          "Tried to disconnect SSE, but it was already disconnected."
        );
      }
      sse?.disconnect();
      sse = undefined;
      connected = false;
    },

    streamData(data: ChatbotStreamEvent) {
      if (!this.connected) {
        throw new Error(
          `Tried to stream data, but there's no SSE connection. Call DataStreamer.connect() first.`
        );
      }
      sse?.sendData(data);
    },

    async stream({ stream }: StreamParams) {
      if (!this.connected) {
        throw new Error(
          `Tried to stream data, but there's no SSE connection. Call DataStreamer.connect() first.`
        );
      }
      let streamedData = "";
      for await (const event of stream) {
        if (event.choices.length === 0) {
          continue;
        }
        // The event could contain many choices, but we only want the first one
        const choice = event.choices[0];
        if (choice.delta) {
          const content = escapeNewlines(choice.delta.content ?? "");
          this.streamData({
            type: "delta",
            data: content,
          });
          streamedData += content;
        } else if (choice.message) {
          logger.warn(
            `Unexpected message in stream: no delta. Message: ${JSON.stringify(
              choice.message
            )}`
          );
        }
      }
      return streamedData;
    },
  };
}
