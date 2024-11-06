/**
  Performs a case-insensitive, partial match
  of the `expected` link or link fragment
  within the `actual` link or link fragment.
  Checks based solely on path, ignoring domain, query, and fragment.

  If either input is not a valid URL,
  it treats the input as a plain string
  and performs a substring match.

  @param expected - The expected link or link fragment to match within `actual`.
  @param actual - The actual link or link fragment where the search is performed.
  @returns `true` if the `expected` link or link fragment is found within `actual`, `false` otherwise.
 */
export function fuzzyLinkMatch(expected: string, actual: string) {
  return getPath(actual)
    .toLowerCase()
    .includes(getPath(expected).toLowerCase());
}

function getPath(maybeUrl: string) {
  try {
    const url = new URL(maybeUrl);
    return url.pathname;
  } catch (error) {
    // If it's not a valid URL, return the input string as is
    return maybeUrl;
  }
}
