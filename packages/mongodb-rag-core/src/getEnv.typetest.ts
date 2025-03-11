import { getEnv } from "./getEnv";

// This file is not meant to be executed, just type-checked

// Test with only required env vars
const requiredOnly = getEnv({
  required: ["API_KEY", "DATABASE_URL"],
});
// Should infer type: { API_KEY: string; DATABASE_URL: string }
const _requiredOnlyTest1: string = requiredOnly.API_KEY;
const _requiredOnlyTest2: string = requiredOnly.DATABASE_URL;
// @ts-expect-error - NON_EXISTENT is not in the required list
const _requiredOnlyError = requiredOnly.NON_EXISTENT;

// Test with only optional env vars
const optionalOnly = getEnv({
  optional: {
    PORT: "3000",
    HOST: "localhost",
    DEBUG: undefined,
  },
});
// Should infer type: { PORT: string | undefined; HOST: string | undefined; DEBUG: string | undefined }
const _optionalOnlyTest1: string | undefined = optionalOnly.PORT;
const _optionalOnlyTest2: string | undefined = optionalOnly.HOST;
const _optionalOnlyTest3: string | undefined = optionalOnly.DEBUG;
// @ts-expect-error - NON_EXISTENT is not in the optional object
const _optionalOnlyError = optionalOnly.NON_EXISTENT;

// Test with both required and optional env vars
const mixed = getEnv({
  required: ["API_KEY", "DATABASE_URL"],
  optional: {
    PORT: "3000",
    HOST: "localhost",
  },
});
// Should infer type: { API_KEY: string; DATABASE_URL: string; PORT: string | undefined; HOST: string | undefined }
const _mixedTest1: string = mixed.API_KEY;
const _mixedTest2: string = mixed.DATABASE_URL;
const _mixedTest3: string | undefined = mixed.PORT;
const _mixedTest4: string | undefined = mixed.HOST;
// @ts-expect-error - NON_EXISTENT is not in either required or optional
const _mixedError = mixed.NON_EXISTENT;

// Test with empty args
const empty = getEnv({});
// Should infer type: {}
// @ts-expect-error - ANY_KEY should not exist on empty
const _emptyError = empty.ANY_KEY;

// Test with explicit type parameters
interface MyEnv {
  API_KEY: string;
  DATABASE_URL: string;
  PORT: string | undefined;
  HOST: string | undefined;
}

// The following should all be assignable to MyEnv
const explicit1: MyEnv = getEnv({
  required: ["API_KEY", "DATABASE_URL"],
  optional: {
    PORT: "3000",
    HOST: "localhost",
  },
});

// Test with as const for literal string types
const requiredAsConst = getEnv({
  required: ["API_KEY", "DATABASE_URL"] as const,
});
// This should still work the same way
const _requiredAsConstTest: string = requiredAsConst.API_KEY;

// Test that required variables can't be undefined
// @ts-expect-error - API_KEY is string, not string | undefined, so this assignment should fail
const _requiredNotUndefined: undefined = requiredAsConst.API_KEY;
