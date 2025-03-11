import { getEnv } from "./getEnv";

// Mock process.env
const mockProcessEnv = {
  TEST_ENV_VAR: "test",
};

jest.mock("process", () => ({
  env: mockProcessEnv,
}));

describe("getEnv", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it("returns required env vars that are defined", () => {
    process.env.TEST_ENV_VAR = "test";
    const env = getEnv({ required: ["TEST_ENV_VAR"] });
    expect(env).toEqual({ TEST_ENV_VAR: "test" });
  });

  it("throws an error if a required env var is not defined", () => {
    process.env.TEST_ENV_VAR = "test";
    expect(() =>
      getEnv({
        required: ["TEST_ENV_VAR", "MISSING_ENV_VAR", "MISSING_ENV_VAR_2"],
      })
    ).toThrow(
      "Missing required environment variables:\n - MISSING_ENV_VAR\n - MISSING_ENV_VAR_2"
    );
  });

  it("returns optional env vars that are defined", () => {
    process.env.TEST_ENV_VAR = "test";
    process.env.TEST_ENV_VAR_2 = "test";
    const env = getEnv({
      optional: { TEST_ENV_VAR: "default", TEST_ENV_VAR_2: "default" },
    });
    expect(env).toEqual({ TEST_ENV_VAR: "test", TEST_ENV_VAR_2: "test" });
  });

  it("returns default values for optional env vars that don't exist", () => {
    process.env.TEST_ENV_VAR = "test";
    const env = getEnv({
      optional: { TEST_ENV_VAR: "default", UNDEFINED_TEST_ENV_VAR: "default" },
    });
    expect(env).toEqual({
      TEST_ENV_VAR: "test",
      UNDEFINED_TEST_ENV_VAR: "default",
    });
  });

  it("can default to a string or undefined", () => {
    process.env.TEST_ENV_VAR = "test";
    const env = getEnv({
      optional: {
        TEST_ENV_VAR: "default",
        TEST_ENV_VAR_2: undefined,
        UNDEFINED_TEST_ENV_VAR: "default",
      },
    });
    expect(env).toEqual({
      TEST_ENV_VAR: "test",
      TEST_ENV_VAR_2: undefined,
      UNDEFINED_TEST_ENV_VAR: "default",
    });
  });

  it("works with a mix of required and optional env vars", () => {
    process.env.TEST_ENV_VAR = "test";
    process.env.TEST_ENV_VAR_2 = "test";
    const env = getEnv({
      required: ["TEST_ENV_VAR"],
      optional: {
        TEST_ENV_VAR_2: "default",
        UNDEFINED_TEST_ENV_VAR: "default",
      },
    });
    // env.TEST_ENV_VAR;
    // env.TEST_ENV_VAR_2;
    // env.UNDEFINED_TEST_ENV_VAR;
    expect(env).toEqual({
      TEST_ENV_VAR: "test",
      TEST_ENV_VAR_2: "test",
      UNDEFINED_TEST_ENV_VAR: "default",
    });
  });

  it("returns an empty object if no env vars are requested", () => {
    const env = getEnv({});
    expect(env).toEqual({});
  });
});
