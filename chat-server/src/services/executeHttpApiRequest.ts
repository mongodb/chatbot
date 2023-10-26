/**
  @fileoverview This file contains a service for executing HTTP API requests based on the parameters.
  This is used to call the API based on the parameters returned by the LLM function.
 */
import { HttpVerb, logger } from "chat-core";
import { HttpRequestArgs } from "./HttpRequestArgs";
import DigestClient from "digest-fetch";
export interface ExecuteHttpApiRequestParams {
  httpVerb: HttpVerb;
  resourcePath: string;
  staticHttpRequestArgs: HttpRequestArgs;
  dynamicHttpRequestArgs: HttpRequestArgs;
  digestAuth?: {
    username: string;
    password: string;
  };
}

/**
    Execute request to an HTTP API endpoint.
   */
export async function executeHttpApiRequest({
  httpVerb,
  resourcePath,
  staticHttpRequestArgs,
  dynamicHttpRequestArgs,
  digestAuth,
}: ExecuteHttpApiRequestParams): Promise<unknown> {
  if (
    ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"].includes(
      httpVerb
    )
  ) {
    // Replace path params
    for (const pathParametersKey in dynamicHttpRequestArgs.pathParameters) {
      resourcePath = resourcePath.replace(
        `{${pathParametersKey}}`,
        dynamicHttpRequestArgs.pathParameters[pathParametersKey] as string
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

    const client = constructFetchClient(digestAuth);
    try {
      const response = await client.fetch(resourcePath, {
        method: httpVerb,
        headers: {
          ...(dynamicHttpRequestArgs.headers ?? {}),
          ...(staticHttpRequestArgs.headers ?? {}),
        },
        body: JSON.stringify({
          ...dynamicHttpRequestArgs.body,
          ...staticHttpRequestArgs.body,
        }),
      });
      const data = await response.json();
      logger.info(`Request Response: ${data}`);
      return data;
    } catch (err) {
      logger.error(`Error: ${err}`);
    }
  } else {
    return "Invalid httpVerb";
  }
}

function constructFetchClient(
  digestAuth: ExecuteHttpApiRequestParams["digestAuth"]
) {
  if (digestAuth) {
    return new DigestClient(digestAuth.username, digestAuth.password);
  } else {
    return new DigestClient("username", "password", { basic: true });
  }
}
