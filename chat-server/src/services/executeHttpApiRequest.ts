/**
  @fileoverview This file contains a service for executing HTTP API requests based on the parameters.
  This is used to call the API based on the parameters returned by the LLM function.
 */
import { HttpVerb, logger } from "chat-core";
import { HttpApiCredentials, HttpRequestArgs } from "./HttpRequestArgs";
import DigestClient from "digest-fetch";
export interface ExecuteHttpApiRequestParams {
  httpVerb: HttpVerb;
  resourcePath: string;
  staticHttpRequestArgs: HttpRequestArgs;
  dynamicHttpRequestArgs: HttpRequestArgs;
  apiCredentials: HttpApiCredentials;
}

/**
    Execute request to an HTTP API endpoint.
   */
export async function executeHttpApiRequest({
  httpVerb,
  resourcePath,
  staticHttpRequestArgs,
  dynamicHttpRequestArgs,
  apiCredentials,
}: ExecuteHttpApiRequestParams): Promise<unknown> {
  if (
    ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"].includes(
      httpVerb
    )
  ) {
    console.log("starting resource path::", resourcePath);
    // Replace path params
    for (const pathParametersKey in dynamicHttpRequestArgs.pathParameters) {
      resourcePath = resourcePath.replace(
        `{${pathParametersKey}}`,
        dynamicHttpRequestArgs.pathParameters[pathParametersKey] as string
      );
    }
    for (const pathParametersKey in staticHttpRequestArgs.pathParameters) {
      console.log("path param keys::", pathParametersKey);
      resourcePath = resourcePath.replace(
        `{${pathParametersKey}}`,
        staticHttpRequestArgs.pathParameters[pathParametersKey] as string
      );
    }
    // add query params
    for (const queryParametersKey in dynamicHttpRequestArgs.queryParameters) {
      const url = new URL(resourcePath);
      url.searchParams.append(
        queryParametersKey,
        dynamicHttpRequestArgs.queryParameters[queryParametersKey] as string
      );
    }
    for (const queryParametersKey in staticHttpRequestArgs.queryParameters) {
      const url = new URL(resourcePath);
      url.searchParams.append(
        queryParametersKey,
        staticHttpRequestArgs.queryParameters[queryParametersKey] as string
      );
    }

    const client = constructFetchClient(apiCredentials);
    console.log("ending resource path::", resourcePath);
    try {
      const response = await client.fetch(resourcePath, {
        method: httpVerb,
        headers: {
          ...(dynamicHttpRequestArgs.headers ?? {}),
          ...(staticHttpRequestArgs.headers ?? {}),
        },
        body:
          dynamicHttpRequestArgs.body && staticHttpRequestArgs.body
            ? JSON.stringify({
                ...dynamicHttpRequestArgs.body,
                ...staticHttpRequestArgs.body,
              })
            : undefined,
      });
      const data = await response.json();
      logger.info(`Request Response: ${data}`);
      return JSON.stringify({ status: response.status, data });
    } catch (err) {
      console.log(err);
      logger.error(`Error: ${err}`);
      return "An unexpected error occurred. Please to do something else";
    }
  } else {
    return "Invalid httpVerb";
  }
}

function constructFetchClient(creds: HttpApiCredentials) {
  if (creds.type === "digest") {
    return new DigestClient(creds.username, creds.password);
  } else {
    return new DigestClient(creds.username, creds.password, { basic: true });
  }
}
