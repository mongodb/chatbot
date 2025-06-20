import { expect, it } from "tstyche";
import { getEnv } from "./getEnv";

it("required env vars are strings", () => {
  const env = getEnv({ required: ["TEST_ENV_VAR"] });
  expect(env.TEST_ENV_VAR).type.toBe<string>();
});

it("optional env vars with string defaults are strings", () => {
  const env = getEnv({
    optional: { TEST_ENV_VAR: "default", TEST_ENV_VAR_2: "default" },
  });
  expect(env.TEST_ENV_VAR).type.toBe<string>();
  expect(env.TEST_ENV_VAR_2).type.toBe<string>();
});

it("optional env vars with undefined defaults are strings or undefined", () => {
  const env = getEnv({
    optional: { TEST_ENV_VAR: "default", UNDEFINED_TEST_ENV_VAR: undefined },
  });
  expect(env.TEST_ENV_VAR).type.toBe<string>();
  expect(env.UNDEFINED_TEST_ENV_VAR).type.toBe<string | undefined>();
});

it("accessing an unspecified env var is not allowed", () => {
  expect(getEnv({})).type.not.toHaveProperty("FOO");
});

it("mixed env vars are the correct type", () => {
  const env = getEnv({
    required: ["TEST_ENV_VAR"],
    optional: {
      TEST_ENV_VAR_2: "default",
      TEST_ENV_VAR_3: "default",
      TEST_ENV_VAR_4: undefined,
    },
  });
  expect(env.TEST_ENV_VAR).type.toBe<string>();
  expect(env.TEST_ENV_VAR_2).type.toBe<string>();
  expect(env.TEST_ENV_VAR_3).type.toBe<string>();
  expect(env.TEST_ENV_VAR_4).type.toBe<string | undefined>();
});
