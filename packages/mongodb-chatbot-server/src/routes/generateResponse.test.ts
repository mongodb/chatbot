import { References } from "mongodb-rag-core";
import {
  AwaitGenerateResponseParams,
  awaitGenerateResponse,
} from "./generateResponse";
import { Conversation } from "../services";

const llm = {};
const llmConversation = [];
const references: References = [];
const reqId = "foo";
const llmNotWorkingMessage = "llm not working";
const noRelevantContentMessage = "no relevant content";
const conversation: Conversation = {};

describe("awaitGenerateResponse", () => {
  const baseArgs = {
    llm,
    llmConversation,
    references,
    reqId,
    llmNotWorkingMessage,
    noRelevantContentMessage,
    conversation,
  } satisfies AwaitGenerateResponseParams;
  it("should generate assistant response if no tools", async () => {
    const { messages } = await awaitGenerateResponse({ llmNotWorkingMessage });
  });
  it("should include references with final assistant message", async () => {
    // TODO
  });
  it("should call tool before responding", async () => {
    // TODO
  });
  it("should pass references from a tool call", async () => {
    // TODO
  });
  it("should call multiple tools before responding", async () => {
    // TODO
  });
  it("should have a tool direct subsequent LLM call", async () => {
    // TODO
  });
  it("should reject input in a tool call", async () => {
    // TODO
  });
  it("should only send vector search results + references if LLM not working", async () => {
    // TODO
  });
});
