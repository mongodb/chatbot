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
export function ensureProtocol(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `https://${url}`;
}
