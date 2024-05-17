import { z } from "zod";
import { TimeoutError } from "./errors";

export function assert(
  condition: boolean | string | number | object | null | undefined,
  message?: string
): asserts condition {
  const cond = Boolean(condition);
  if (!cond) {
    throw new Error(message ?? "Assertion failed");
  }
}

export function mergeHeaders(
  headers1: Headers,
  headers2: Headers,
  ...headersN: Headers[]
): Headers {
  const mergedHeaders = new Headers();

  // Append headers from the first Headers object
  for (const [key, value] of headers1.entries()) {
    mergedHeaders.append(key, value);
  }

  // Append headers from the second Headers object, adding to existing or creating new entries
  for (const [key, value] of headers2.entries()) {
    mergedHeaders.append(key, value);
  }

  // Recursively merge remaining headers
  if (headersN.length > 0) {
    const nextHeader = headersN.shift();
    assert(nextHeader);
    return mergeHeaders(mergedHeaders, nextHeader, ...headersN);
  }

  return mergedHeaders;
}

export function typeGuard<Z extends z.ZodSchema, T extends z.infer<Z>>(
  schema: Z,
  value: unknown
): value is T {
  return schema.safeParse(value).success;
}

export function createTypeGuard<Z extends z.ZodSchema, T extends z.infer<Z>>(
  schema: Z
) {
  return (value: unknown): value is T => typeGuard(schema, value);
}

export function makeGetEndpointUrl(baseUrl: string) {
  return function getEndpointUrl(
    path: string,
    queryParams: Record<string, string> = {}
  ) {
    if (!path.startsWith("/")) {
      throw new Error(
        `Invalid path: ${path} - ConversationService paths must start with /`
      );
    }
    const url = new URL(
      path.replace(/^\/?/, ""), // Strip leading slash (if present) to not clobber baseUrl path
      baseUrl.replace(/\/?$/, "/") // Add trailing slash to not lose last segment of baseUrl
    );
    for (const [key, value] of new URLSearchParams(queryParams)) {
      url.searchParams.append(key, value);
    }
    return url.href;
  };
}

type Validator<T> = (t: unknown) => t is T;

export async function parseResponse<T>(
  resp: Response,
  validator?: Validator<T>
): Promise<T> {
  const data: T | { error: string } = await resp.json();
  const errorText = (fallback: string) =>
    `${resp.statusText}: ${(data as { error: string }).error ?? fallback}`;
  switch (true) {
    case resp.status === 504:
      throw new TimeoutError(errorText("Gateway timeout"));
    case resp.status >= 500:
      throw new Error(errorText("Server error"));
    case resp.status === 429:
      throw new Error(errorText("Rate limited"));
    case resp.status === 404:
      throw new Error(errorText("Not found"));
    case resp.status >= 400:
      throw new Error(errorText("Something went wrong"));
  }
  const isValid = ((t) => validator?.(t) ?? true) as Validator<T>;
  if (!isValid(data)) {
    throw new Error("Invalid response");
  }
  return data;
}
