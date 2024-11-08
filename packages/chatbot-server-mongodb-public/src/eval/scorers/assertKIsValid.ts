import { strict as assert } from "assert";
export const assertKIsValid = (k: number) =>
  assert(k > 0 && Number.isInteger(k), "k must be a positive integer");
