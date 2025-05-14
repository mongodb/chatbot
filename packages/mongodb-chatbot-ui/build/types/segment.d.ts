/**
 * Get Segment IDs from the browser's local storage.
 */
export declare function getSegmentIds(): {
    userId: string | undefined;
    anonymousId: string | undefined;
};
/**
 * Set Segment ID headers based on values from the browser's local storage.
 */
export declare function getSegmentIdHeaders(): Headers;
