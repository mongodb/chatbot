import { rateLimit, Options } from "express-rate-limit";
import { ipAddressKeyGenerator } from "./ipAddressKeyGenerator";

export const defaultRateLimitResponse = {
  error: "Too many requests, please try again later.",
};

export type RateLimitOptions = Partial<Options>;

export const defaultRateLimitOptions = {
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 500, // limit each IP to 500 requests per windowMs
  standardHeaders: "draft-7", // draft-6: RateLimit-* headers; draft-7: combined RateLimit header
  legacyHeaders: true, // X-RateLimit-* headers
  message: defaultRateLimitResponse,
  keyGenerator: ipAddressKeyGenerator,
} satisfies RateLimitOptions;

/**
 Rate limit middleware. Applies {@link defaultRateLimitOptions} by default.
 */
export function makeRateLimit(options?: RateLimitOptions) {
  return rateLimit({
    ...defaultRateLimitOptions,
    ...options,
  });
}
