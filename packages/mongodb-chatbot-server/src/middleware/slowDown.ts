import slowDown, { Options } from "express-slow-down";
import { ipAddressKeyGenerator } from "./ipAddressKeyGenerator";

export type SlowDownOptions = Partial<Options>;

export const defaultSlowDownOptions = {
  windowMs: 60 * 1000,
  delayAfter: 20,
  delayMs: 500,
  keyGenerator: ipAddressKeyGenerator,
} satisfies SlowDownOptions;

export function makeSlowDown(options?: SlowDownOptions) {
  return slowDown({
    ...defaultSlowDownOptions,
    ...options,
  });
}
