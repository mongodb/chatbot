import { getSegmentIds, getSegmentIdHeaders } from "./segment";

describe("getSegmentIds", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("returns both segment IDs from the browser's local storage if both are present", () => {
    localStorage.setItem("ajs_user_id", "test-segment-user-id");
    localStorage.setItem("ajs_anonymous_id", "test-segment-anonymous-id");
    const segmentIds = getSegmentIds();
    expect(segmentIds.userId).toBe("test-segment-user-id");
    expect(segmentIds.anonymousId).toBe("test-segment-anonymous-id");
  });

  it("returns the user ID if only the user ID is present", () => {
    localStorage.setItem("ajs_user_id", "test-segment-user-id");
    const segmentIds = getSegmentIds();
    expect(segmentIds.userId).toBe("test-segment-user-id");
    expect(segmentIds.anonymousId).toBeUndefined();
  });

  it("returns the anonymous ID if only the anonymous ID is present", () => {
    localStorage.setItem("ajs_anonymous_id", "test-segment-anonymous-id");
    const segmentIds = getSegmentIds();
    expect(segmentIds.userId).toBeUndefined();
    expect(segmentIds.anonymousId).toBe("test-segment-anonymous-id");
  });

  it("returns undefined for both segment IDs if neither are in the browser's local storage", () => {
    const segmentIds = getSegmentIds();
    expect(segmentIds.userId).toBeUndefined();
    expect(segmentIds.anonymousId).toBeUndefined();
  });
});

describe("getSegmentIdHeaders", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("returns the segment ID headers from the browser's local storage", () => {
    localStorage.setItem("ajs_user_id", "test-segment-user-id");
    localStorage.setItem("ajs_anonymous_id", "test-segment-anonymous-id");
    const headers = getSegmentIdHeaders();
    expect(headers.get("X-Segment-User-Id")).toBe("test-segment-user-id");
    expect(headers.get("X-Segment-Anonymous-Id")).toBe(
      "test-segment-anonymous-id"
    );
  });

  it("returns the header for the user ID if only the user ID is present", () => {
    localStorage.setItem("ajs_user_id", "test-segment-user-id");
    const headers = getSegmentIdHeaders();
    expect(headers.get("X-Segment-User-Id")).toBe("test-segment-user-id");
    expect(headers.get("X-Segment-Anonymous-Id")).toBeNull();
  });

  it("returns the header for the anonymous ID if only the anonymous ID is present", () => {
    localStorage.setItem("ajs_anonymous_id", "test-segment-anonymous-id");
    const headers = getSegmentIdHeaders();
    expect(headers.get("X-Segment-User-Id")).toBeNull();
    expect(headers.get("X-Segment-Anonymous-Id")).toBe(
      "test-segment-anonymous-id"
    );
  });

  it("returns an empty object if neither segment ID is present", () => {
    const headers = getSegmentIdHeaders();
    expect(headers.get("X-Segment-User-Id")).toBeNull();
    expect(headers.get("X-Segment-Anonymous-Id")).toBeNull();
  });
});
