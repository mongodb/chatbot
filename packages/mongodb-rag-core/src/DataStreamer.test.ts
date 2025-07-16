import {
  DataStreamer,
  makeDataStreamer,
  type ResponsesStreamParams,
} from "./DataStreamer";
import { OpenAI } from "openai";
import { createResponse } from "node-mocks-http";
import { EventEmitter } from "events";
import { Response } from "express";

describe("Data Streaming", () => {
  let dataStreamer: DataStreamer;
  let res: ReturnType<typeof createResponse> & Response;

  beforeAll(() => {
    dataStreamer = makeDataStreamer();
  });

  beforeEach(() => {
    res = createResponse({ eventEmitter: EventEmitter });
    dataStreamer.connect(res);
  });

  afterEach(() => {
    if (dataStreamer.connected) {
      dataStreamer?.disconnect();
    }
  });

  it("Flushes headers on connect to begin an SSE stream", () => {
    expect(res.header("Content-Type")).toBe("text/event-stream");
    expect(res.header("Cache-Control")).toBe("no-cache");
    expect(res.header("Access-Control-Allow-Credentials")).toBe("true");
    expect(res.header("Connection")).toBe("keep-alive");
  });

  it("Only connects through one Response at a time and safely rejects additional connections", () => {
    expect(() => dataStreamer.connect(res)).toThrow(Error);
  });

  it("Streams SSE data manually to the client", () => {
    dataStreamer.streamData({
      type: "delta",
      data: "test",
    });
    dataStreamer.streamData({
      type: "delta",
      data: "Once upon",
    });
    dataStreamer.streamData({
      type: "delta",
      data: " a time there was a",
    });
    dataStreamer.streamData({
      type: "delta",
      data: " very long string.",
    });
    const data = res._getData();
    expect(data).toBe(
      `data: {"type":"delta","data":"test"}\n\ndata: {"type":"delta","data":"Once upon"}\n\ndata: {"type":"delta","data":" a time there was a"}\n\ndata: {"type":"delta","data":" very long string."}\n\n`
    );
  });

  it("Streams events from an AsyncIterable to the client", async () => {
    const stream: Parameters<DataStreamer["stream"]>[0]["stream"] = {
      [Symbol.asyncIterator]() {
        let current = 0;
        const msgs = ["Once upon", " a time there was a", " very long string."];
        const completions = msgs.map(createChatCompletionWithDelta);
        return {
          async next() {
            if (current < completions.length) {
              return { done: false, value: completions[current++] };
            } else {
              return { done: true, value: "" };
            }
          },
        };
      },
    };

    const streamedText = await dataStreamer.stream({ stream });
    expect(streamedText).toBe("Once upon a time there was a very long string.");
    const data = res._getData();
    expect(data).toBe(
      `data: {"type":"delta","data":"Once upon"}\n\ndata: {"type":"delta","data":" a time there was a"}\n\ndata: {"type":"delta","data":" very long string."}\n\n`
    );
  });

  it("Streams Responses API events as valid SSE events to the client", () => {
    dataStreamer.streamResponses({
      type: "response.created",
      id: "test1",
    } as ResponsesStreamParams);
    dataStreamer.streamResponses({
      type: "response.in_progress",
      id: "test2",
    } as ResponsesStreamParams);
    dataStreamer.streamResponses({
      type: "response.output_text.delta",
      id: "test3",
    } as ResponsesStreamParams);
    dataStreamer.streamResponses({
      type: "response.completed",
      id: "test4",
    } as ResponsesStreamParams);

    const data = res._getData();
    expect(data).toBe(
      `event: response.created\ndata: {"type":"response.created","id":"test1","sequence_number":0}\n\nevent: response.in_progress\ndata: {"type":"response.in_progress","id":"test2","sequence_number":1}\n\nevent: response.output_text.delta\ndata: {"type":"response.output_text.delta","id":"test3","sequence_number":2}\n\nevent: response.completed\ndata: {"type":"response.completed","id":"test4","sequence_number":3}\n\n`
    );
  });
});

function createChatCompletionWithDelta(
  deltaText: string,
  i: number
): Omit<OpenAI.ChatCompletionChunk, "object" | "model"> {
  return {
    id: "test",
    created: Date.now(),
    choices: [
      {
        index: i,
        delta: {
          content: deltaText,
        },
        finish_reason: null,
      },
    ],
  };
}
