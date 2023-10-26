import { FunctionDefinition } from "@azure/openai";
import { HttpRequestArgsOpenAiFunctionDefinition } from "./HttpRequestArgs";
import { HttpVerb } from "chat-core";

export interface PersistedFunctionDefinition {
  definition: FunctionDefinition;
}
export interface PersistedHttpRequestFunctionDefinition
  extends PersistedFunctionDefinition {
  definition: HttpRequestArgsOpenAiFunctionDefinition;
  httpVerb: HttpVerb;
  path: string;
}
