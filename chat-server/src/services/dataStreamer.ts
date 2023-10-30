import { Response } from "express";
import { OpenAiStreamingResponse } from "./ChatLlm";
import { logger, References } from "mongodb-rag-core";

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

type StreamEvent = { type: string; data: unknown };

/**
  Event when server streams additional message response to the client.
 */
type DeltaStreamEvent = StreamEvent & { type: "delta"; data: string };

/**
  Event when server streams single {@link References} object to the client.
 */
type ReferencesStreamEvent = StreamEvent & {
  type: "references";
  data: References;
};

/**
  Event denoting the end of streaming.
 */
type FinishedStreamEvent = StreamEvent & {
  type: "finished";
  data: string;
};

/**
  The event types streamed from the chat server to the client.
 */
type SomeStreamEvent =
  | DeltaStreamEvent
  | ReferencesStreamEvent
  | FinishedStreamEvent;

/**
  Service that streams data to the client.
 */
export interface DataStreamer {
  connected: boolean;
  connect(res: Response): void;
  disconnect(): void;
  streamData(data: SomeStreamEvent): void;
  stream(params: StreamParams): Promise<string>;
}

/**
  Create a {@link DataStreamer} that streams data to the client.
 */
export function makeDataStreamer(): DataStreamer {
  let connected = false;
  let sse: ServerSentEventDispatcher<SomeStreamEvent> | undefined;

  return {
    get connected() {
      return connected;
    },
    connect(res) {
      if (this.connected) {
        throw new Error("Tried to connect SSE, but it was already connected.");
      }
      sse = makeServerSentEventDispatcher<SomeStreamEvent>(res);
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

    streamData(data: SomeStreamEvent) {
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
