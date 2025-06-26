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
