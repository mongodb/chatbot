/**
  Performs a case-insensitive match between two URLs or URL fragments.
  
  First attempts to match based on paths:
  - Removes trailing slashes
  - Checks if actual path ends with expected path (ignoring domain, query, and fragment)
  
  If either path is empty/invalid, falls back to exact match of normalized URLs.
  
  @param expected - The expected URL or URL fragment
  @param actual - The actual URL or URL fragment to compare against
  @returns true if URLs match according to above rules, false otherwise
 */
import { normalizeUrl } from "mongodb-rag-core/dataSources";

export function fuzzyLinkMatch(expected: string, actual: string) {
  const cleanActualPath = getCleanPath(actual);
  const cleanExpectedPath = getCleanPath(expected);

  // if cleaned path is not an empty string, compare cleaned paths
  if (cleanActualPath && cleanExpectedPath) {
    return cleanActualPath.endsWith(cleanExpectedPath);
  } else {
    // compare normalized full URLs
    const normalizedActual = normalizeUrl({ url: actual });
    const normalizedExpected = normalizeUrl({ url: expected });
    return normalizedActual === normalizedExpected;
  }
}

function cleanPath(path: string) {
  return path.toLowerCase().replace(/\/$/, "");
}

function getCleanPath(maybeUrl: string) {
  let out = "";
  try {
    const url = new URL(maybeUrl);
    out = cleanPath(url.pathname);
  } catch (error) {
    // If it's not a valid URL, return the input string as is
    out = cleanPath(maybeUrl);
  }
  return out;
}
