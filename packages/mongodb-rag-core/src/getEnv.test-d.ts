import { expectType, expectError } from "jest-tsd";
import { getEnv } from "./getEnv";

const originalEnv = process.env;

beforeEach(() => {
  process.env = { ...originalEnv };
});

afterEach(() => {
  process.env = originalEnv;
});

test("required env vars are strings", () => {
  process.env.TEST_ENV_VAR = "test";
  const env = getEnv({ required: ["TEST_ENV_VAR"] });
  expectType<string>(env.TEST_ENV_VAR);
});

test("optional env vars with string defaults are strings", () => {
  process.env.TEST_ENV_VAR = "test";
  const env = getEnv({
    optional: { TEST_ENV_VAR: "default", TEST_ENV_VAR_2: "default" },
  });
  expectType<string>(env.TEST_ENV_VAR);
  expectType<string>(env.TEST_ENV_VAR_2);
});

test("optional env vars with undefined defaults are strings or undefined", () => {
  process.env.TEST_ENV_VAR = "test";
  const env = getEnv({
    optional: { TEST_ENV_VAR: "default", UNDEFINED_TEST_ENV_VAR: undefined },
  });
  expectType<string>(env.TEST_ENV_VAR);
  expectType<string | undefined>(env.UNDEFINED_TEST_ENV_VAR);
});

test("accessing an unspecified env var is a type error", () => {
  expectError(getEnv({}).FOO);
});

test("mixed env vars are the correct type", () => {
  process.env.TEST_ENV_VAR = "test";
  process.env.TEST_ENV_VAR_2 = "test";
  const env = getEnv({
    required: ["TEST_ENV_VAR"],
    optional: {
      TEST_ENV_VAR_2: "default",
      TEST_ENV_VAR_3: "default",
      TEST_ENV_VAR_4: undefined,
    },
  });
  expectType<string>(env.TEST_ENV_VAR);
  expectType<string>(env.TEST_ENV_VAR_2);
  expectType<string>(env.TEST_ENV_VAR_3);
  expectType<string | undefined>(env.TEST_ENV_VAR_4);
});
