/**
 * Get Segment IDs from the browser's local storage.
 */
export function getSegmentIds() {
  const userId = localStorage.getItem("ajs_user_id") ?? undefined;
  const anonymousId = localStorage.getItem("ajs_anonymous_id") ?? undefined;
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
