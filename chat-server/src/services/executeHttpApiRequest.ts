/**
  @fileoverview This file contains a service for executing HTTP API requests based on the parameters.
  This is used to call the API based on the parameters returned by the LLM function.
 */
import { HttpVerb, logger } from "chat-core";
import axios, { AxiosResponse, AxiosError } from 'axios';

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
    Sample API endpoint: https://cloud.mongodb.com/api/atlas/v2/clusters
   */
export async function executeHttpApiRequest(
  params: ExecuteHttpApiRequestParams
): Promise<unknown> {
  const apiUrl = baseUrl + endPoint;
  const apiData = JSON.stringify({ parameters });

  if (["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"].includes(httpVerb)) {
    try {
      const response: AxiosResponse = await axios.[httpVerb.toLowerCase()](apiUrl, apiData, { headers });
      logger.info(`Request Response: ${response.data}`);
    } catch (error) {
      handleAxiosError(error);
    }
  } else {
    return "Invalid httpVerb";
  }

  // Function to handle Axios errors
  function handleAxiosError(error: AxiosError) {
    if (error.response) {
      // The request was made, but the server responded with a status code that falls out of the range of 2xx
      logger.error(`Error Response Data: ${error.response.data}`);
      logger.error(`Status Code: ${error.response.status}`);
      return error.response.data;
    } else if (error.request) {
      // The request was made, but no response was received
      logger.error(`No response received: ${error.request}`);
      return error.request;
    } else {
      // Something happened in setting up the request that triggered an error
      logger.error(`Request setup error: ${error.message}`);
      return error.message;
    }
  }

  return response.data;
}
