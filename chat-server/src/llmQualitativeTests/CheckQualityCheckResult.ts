/**
  The result of a check for whether a response meets quality standards.
 */
export interface CheckQualityCheckResult {
  /** Whether the response meets chat quality standards based on the Expectation. */
  meetsChatQualityStandards: boolean;
  /** The concise explanation of reason the response does not meet chat quality standards. */
  reason?: string;
}
