type NormalizeUrlParams = {
  url: string;
  removeHash?: boolean;
  removeQueryString?: boolean;
};

// Regex used to get just the "front part" of a URL
const optionalRegex = {
  REMOVE_HASH: /^[^#]+/,
  REMOVE_QUERY: /^[^?]+/,
  REMOVE_BOTH: /^[^?#]+/,
};

/**
  Utility function that normalizes a URL.
  Removes http/s protocol, www, trailing backslashes.
  Also removes query string and hash fragment (optional behavior).
*/
export function normalizeUrl({
  url,
  removeHash = true,
  removeQueryString = true,
}: NormalizeUrlParams): string {
  if (removeHash && removeQueryString) {
    url = (url.match(optionalRegex.REMOVE_BOTH) ?? [url])[0];
  } else if (removeHash) {
    url = (url.match(optionalRegex.REMOVE_HASH) ?? [url])[0];
  } else if (removeQueryString) {
    // Splitting on hash so we retain the hash fragment
    const [frontUrl, hashFragment] = url.split("#");
    url = (frontUrl.match(optionalRegex.REMOVE_QUERY) ?? [url])[0];
    url += hashFragment ? `#${hashFragment}` : "";
  }
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
