/**
  Utility function that normalizes a URL.
  Removes http/s protocol, www, trailing backslash. Makes lowercase.
  DOES NOT remove query string and anchor tag.
*/
export function normalizeUrl(url: string): string {
  return url
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "");
}
