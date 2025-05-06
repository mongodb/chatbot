function stripLiteralQuotes(str?: string) {
  return str?.replace(/^"|"$/g, "");
}

/**
 * Get Segment IDs from the browser's local storage.
 */
export function getSegmentIds() {
  const analytics =
    typeof window !== "undefined" && window.analytics ? window.analytics : null;

  const userId = stripLiteralQuotes(
    analytics?.user().id() ?? localStorage.getItem("ajs_user_id") ?? undefined
  );
  const anonymousId = stripLiteralQuotes(
    analytics?.user().anonymousId() ??
      localStorage.getItem("ajs_anonymous_id") ??
      undefined
  );
  return {
    userId,
    anonymousId,
  };
}

/**
 * Set Segment ID headers based on values from the browser's local storage.
 */
export function getSegmentIdHeaders() {
  const { userId, anonymousId } = getSegmentIds();
  const headers = new Headers();
  if (userId) {
    headers.set("X-Segment-User-Id", userId);
  }
  if (anonymousId) {
    headers.set("X-Segment-Anonymous-Id", anonymousId);
  }
  return headers;
}
