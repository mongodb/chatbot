import { stripIndent } from "common-tags";
import {
  coerceValuesFromEnvironment,
  csvArrayOf,
  fromEnvironment,
  ValuesFromEnvironment,
  type EnvironmentConfig,
} from "./environment";

import { z } from "zod";

const originalEnv = process.env;

describe("fromEnvironment", () => {
  beforeEach(() => {
    process.env = {};
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("sources required environment variables", () => {
    process.env.REQUIRED_ONE = "required1";
    process.env.REQUIRED_TWO = "required2";
    const env = fromEnvironment({
      required: ["REQUIRED_ONE", "REQUIRED_TWO"],
    });

    expect(env.REQUIRED_ONE).toEqual("required1");
    expect(env.REQUIRED_TWO).toEqual("required2");
  });

  it("sources optional environment variables with defaults", () => {
    process.env.OPTIONAL_ONE = "optional1";
    process.env.OPTIONAL_TWO = "optional2";
    const env = fromEnvironment({
      optional: {
        OPTIONAL_ONE: "default1",
        OPTIONAL_TWO: "default2",
        OPTIONAL_THREE: "default3",
        OPTIONAL_FOUR: "default4",
      },
    });

    expect(env.OPTIONAL_ONE).toEqual("optional1");
    expect(env.OPTIONAL_TWO).toEqual("optional2");
    expect(env.OPTIONAL_THREE).toEqual("default3");
    expect(env.OPTIONAL_FOUR).toEqual("default4");
  });

  it("sources required and optional environment variables in the same call", () => {
    process.env.REQUIRED_ONE = "required1";
    process.env.REQUIRED_TWO = "required2";
    process.env.OPTIONAL_ONE = "optional1";
    process.env.OPTIONAL_TWO = "optional2";
    const env = fromEnvironment({
      required: ["REQUIRED_ONE", "REQUIRED_TWO"],
      optional: {
        OPTIONAL_ONE: "default1",
        OPTIONAL_TWO: "default2",
        OPTIONAL_THREE: "default3",
      },
    });

    expect(env.REQUIRED_ONE).toEqual("required1");
    expect(env.REQUIRED_TWO).toEqual("required2");
    expect(env.OPTIONAL_ONE).toEqual("optional1");
    expect(env.OPTIONAL_TWO).toEqual("optional2");
    expect(env.OPTIONAL_THREE).toEqual("default3");
  });

  it("throws an error when one or more required environment variables are missing", () => {
    process.env.REQUIRED_ONE = "required1";
    expect(() => {
      fromEnvironment({
        required: ["REQUIRED_ONE", "MISSING_ONE", "MISSING_TWO"],
      });
    }).toThrow(stripIndent`
      Missing required environment variable(s):
      - MISSING_ONE
      - MISSING_TWO
    `);
  });

  it("throws an error when one or more optional environment variables have invalid values", () => {
    process.env.OPTIONAL_ONE = 1 as unknown as string;
    process.env.OPTIONAL_TWO = true as unknown as string;
    expect(() => {
      fromEnvironment({
        optional: {
          OPTIONAL_ONE: "default1",
          OPTIONAL_TWO: "default2",
        },
      });
    }).toThrow(stripIndent`
      Invalid values for optional environment variable(s):
      - OPTIONAL_ONE: Expected string, received number
      - OPTIONAL_TWO: Expected string, received boolean
    `);
  });

  it("throws an error when one or more required and/or optional environment variables have invalid values", () => {
    process.env.REQUIRED_ONE = "required1";
    process.env.REQUIRED_TWO = 42 as unknown as string;
    process.env.OPTIONAL_ONE = 1 as unknown as string;
    process.env.OPTIONAL_TWO = true as unknown as string;
    expect(() => {
      fromEnvironment({
        required: ["REQUIRED_ONE", "REQUIRED_TWO", "MISSING_ONE"],
        optional: {
          OPTIONAL_ONE: "default1",
          OPTIONAL_TWO: "default2",
        },
      });
    }).toThrow(stripIndent`
      Missing required environment variable(s):
      - MISSING_ONE

      Invalid values for required environment variable(s):
      - REQUIRED_TWO: Expected string, received number

      Invalid values for optional environment variable(s):
      - OPTIONAL_ONE: Expected string, received number
      - OPTIONAL_TWO: Expected string, received boolean
    `);
  });
});

describe("coerceValuesFromEnvironment", () => {
  it("coerces fromEnvironment values to more specific types", () => {
    process.env.NUMBER = "1";
    process.env.BOOLEAN = "true";
    process.env.ARRAY_OF_STRINGS = "a,b,c";
    process.env.ARRAY_OF_NUMBERS = "1,2,3";
    const env = fromEnvironment({
      required: ["NUMBER", "BOOLEAN", "ARRAY_OF_STRINGS", "ARRAY_OF_NUMBERS"],
    });

    expect(env.NUMBER).toEqual("1");
    expect(env.BOOLEAN).toEqual("true");
    expect(env.ARRAY_OF_STRINGS).toEqual("a,b,c");
    expect(env.ARRAY_OF_NUMBERS).toEqual("1,2,3");

    const coercedEnv = coerceValuesFromEnvironment(
      fromEnvironment({
        required: ["NUMBER", "BOOLEAN", "ARRAY_OF_STRINGS", "ARRAY_OF_NUMBERS"],
        optional: {
          ARRAY_OF_DATES:
            "2021-01-01T12:12:12.012Z,2021-02-02T21:21:21.456Z,2021-03-03,2021-04-04",
        },
      }),
      {
        NUMBER: z.coerce.number(),
        BOOLEAN: z.coerce.boolean(),
        ARRAY_OF_STRINGS: csvArrayOf(z.string()),
        ARRAY_OF_NUMBERS: csvArrayOf(z.coerce.number()),
        ARRAY_OF_DATES: csvArrayOf(z.coerce.date()),
      }
    );

    expect(coercedEnv.NUMBER).toEqual(1);
    expect(coercedEnv.BOOLEAN).toEqual(true);
    expect(coercedEnv.ARRAY_OF_STRINGS).toEqual(["a", "b", "c"]);
    expect(coercedEnv.ARRAY_OF_NUMBERS).toEqual([1, 2, 3]);
    expect(coercedEnv.ARRAY_OF_DATES).toEqual([
      new Date("2021-01-01T12:12:12.012Z"),
      new Date("2021-02-02T21:21:21.456Z"),
      new Date("2021-03-03T00:00:00.000Z"),
      new Date("2021-04-04"),
    ]);
    expect(coercedEnv.foo).toBeUndefined();
  });
});
