import { logger } from "../logger";

/**
  Utility function that normalizes a URL.
  Removes http/s protocol, www, trailing backslashes.
  DOES NOT remove query string and anchor tag.
*/
export function normalizeUrl(url: string): string {
  return url
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./, "")
    .replace(/\/+$/, "");
}

/**
  Adds protocol ("https://") to a URL if it is missing. 
  Intended for use in URL constructor.
 */
export function ensureProtocol(url: string): string | null {
  if (!url) return null;

  url = url.trim();
  try {
    new URL(url);
    return url;
  } catch {
    try {
      const withProtocol = `https://${url}`;
      new URL(withProtocol);
      return withProtocol;
    } catch {
      logger.error(`Malformed URL: ${url}`);
      return null;
    }
  }
}
