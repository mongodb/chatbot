/**
  @fileoverview This file contains a service for executing HTTP API requests based on the parameters.
  This is used to call the API based on the parameters returned by the LLM function.
 */
import { HttpVerb } from "chat-core";
import { HttpRequestArgs } from "./HttpRequestArgs";

export interface ExecuteHttpApiRequestParams {
  httpVerb: HttpVerb;
  resourcePath: string;
  staticHttpRequestArgs: HttpRequestArgs;
  dynamicHttpRequestArgs: HttpRequestArgs;
}
/**
    Execute request to an HTTP API endpoint.
   */
export async function executeHttpApiRequest(
  params: ExecuteHttpApiRequestParams
): Promise<unknown> {
  // SKUNK_TODO: make this..think can just wrap the axios client
  return "Hey here's a response from the API!";
}
