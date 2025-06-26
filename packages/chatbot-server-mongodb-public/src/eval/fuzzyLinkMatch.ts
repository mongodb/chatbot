import { normalizeUrl } from "mongodb-rag-core/dataSources";

export function fuzzyLinkMatch(expected: string, actual: string) {
  const cleanActualPath = getCleanPath(actual);
  const cleanExpectedPath = getCleanPath(expected);

  // if cleaned path is not an empty string, compare cleaned paths
  if (cleanActualPath && cleanExpectedPath) {
    return cleanActualPath.endsWith(cleanExpectedPath);
  } else {
    // compare normalized full URLs
    const normalizedActual = normalizeUrl(actual);
    const normalizedExpected = normalizeUrl(expected);
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
