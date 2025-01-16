import { Response } from "express";
import { OpenAiStreamingResponse } from "./llm";
import { References } from "./References";
import { logger } from "./logger";

export function escapeNewlines(str: string): string {
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
export type DeltaStreamEvent = StreamEvent & { type: "delta"; data: string };

/**
  Event for when the server is processing a request.
 */
export type ProcessingStreamEvent = StreamEvent & {
  type: "processing";
  /**
    Information about processing that is occurring.
    @example "Searching for related content"
   */
  data: string;
};

/**
  Event when server streams single {@link References} object to the client.
 */
export type ReferencesStreamEvent = StreamEvent & {
  type: "references";
  data: References;
};

/**
  Event when server streams a metadata object to the client.
 */
export type MetadataStreamEvent = StreamEvent & {
  type: "metadata";
  data: Record<string, unknown>;
};

/**
  Event denoting the end of streaming.
 */
export type FinishedStreamEvent = StreamEvent & {
  type: "finished";
  data: string;
};

/**
  Event when server streams the conversation ID to the client.
 */
export type ConversationIdStreamEvent = StreamEvent & {
  type: "conversationId";
  data: string;
};

/**
  The event types streamed from the chat server to the client.
 */
export type SomeStreamEvent =
  | DeltaStreamEvent
  | MetadataStreamEvent
  | ProcessingStreamEvent
  | ReferencesStreamEvent
  | FinishedStreamEvent
  | ConversationIdStreamEvent;

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
      res.on("close", () => {
        logger.info("SSE connection was closed.");
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

    /**
      Streams single item of data in an event stream.
     */
    streamData(data: SomeStreamEvent) {
      if (!this.connected) {
        throw new Error(
          `Tried to stream data, but there's no SSE connection. Call DataStreamer.connect() first.`
        );
      }
      sse?.sendData(data);
    },

    /**
      Streams all message events in an event stream.
     */
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
        }
      }
      return streamedData;
    },
  };
}
