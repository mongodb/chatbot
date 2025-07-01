import slowDown, { Options } from "express-slow-down";
import { ipAddressKeyGenerator } from "./ipAddressKeyGenerator";

export type SlowDownOptions = Partial<Options>;

export const defaultSlowDownOptions = {
  windowMs: 60 * 1000, // 1 minute
  delayAfter: 20, // allow 20 requests per windowMs before starting to delay
  delayMs: 500, // delay 500ms for each request after the 20th request
  keyGenerator: ipAddressKeyGenerator,
} satisfies SlowDownOptions;

export function makeSlowDown(options?: SlowDownOptions) {
  return slowDown({
    ...defaultSlowDownOptions,
    ...options,
  });
}
