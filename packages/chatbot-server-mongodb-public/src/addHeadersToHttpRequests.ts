import https, { request, RequestOptions } from "https";
import http from "http";
import { URL } from "url";
import { logger } from "mongodb-chatbot-server";
/**
  This function appends arbitrary headers to HTTPS requests made to a specific hostname.
 */
export function addHeadersToHttpsRequests(
  targetHostname: string,
  headers: Record<string, string>
) {
  const originalHttpsRequest = request;

  function requestWrapper(originalRequest: typeof request): typeof request {
    const wrappedRequest = function (
      arg1: string | RequestOptions | URL,
      arg2?: RequestOptions | ((res: http.IncomingMessage) => void),
      arg3?: (res: http.IncomingMessage) => void
    ) {
      let options: RequestOptions | undefined;

      if (typeof arg1 === "string" || arg1 instanceof URL) {
        if (typeof arg2 === "function") {
          options = {};
        } else {
          options = arg2 || {};
        }
      } else {
        options = arg1;
      }

      // Extract hostname from options
      const hostname =
        options.hostname ||
        (typeof arg1 === "string" ? new URL(arg1).hostname : arg1.hostname);

      // Check if the hostname is 'targetHostname' and modify headers
      if (hostname === targetHostname) {
        logger.info("Adding headers for Request to:", options.path);
        options.headers = options.headers || {};
        for (const [key, value] of Object.entries(headers)) {
          options.headers[key] = value;
        }
      }

      // Call the original request function with correct parameters
      return originalRequest(arg1 as any, arg2 as any, arg3);
    };

    return wrappedRequest;
  }

  https.request = requestWrapper(originalHttpsRequest);
}
