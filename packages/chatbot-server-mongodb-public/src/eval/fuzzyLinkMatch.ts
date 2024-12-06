/**
  Performs a case-insensitive, partial match
  that the `expected` link or link fragment
  ends with the `actual` link or link fragment.
  Removes trailing `/` from paths.
  Checks based solely on path, ignoring domain, query, and fragment.

  If either input is not a valid URL,
  it treats the input as a plain string
  and performs a substring match.

  @param expected - The expected link or link fragment to match within `actual`.
  @param actual - The actual link or link fragment where the search is performed.
  @returns `true` if the `expected` link or link fragment is found within `actual`, `false` otherwise.
 */
export function fuzzyLinkMatch(expected: string, actual: string) {
  return getCleanPath(actual).endsWith(getCleanPath(expected));
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
