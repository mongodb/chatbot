import { z } from "zod";

export type EnvironmentConfig<
  RequiredKeys extends string,
  OptionalKeys extends string | undefined
> = {
  /**
   A list of required environment variable names. Each value resolves to a
   string. If any of these are not defined, an error is thrown.
   */
  required?: RequiredKeys[];
  /**
   A map of optional environment variable names to default values. Each value
   resolves to a string. If the environment variable is not defined, the
   default value is used instead.
   * */
  optional?: Record<
    OptionalKeys extends undefined ? never : OptionalKeys,
    string
  >;
};

type RequiredValuesFromEnvironment<
  T extends EnvironmentConfig<string, string>,
  Required = T["required"]
  // > = Required extends undefined ? Record<string, never> : Required;
> = Required extends string[]
  ? { [k in Required[number]]: string }
  : Record<string, never>;

type OptionalValuesFromEnvironment<
  T extends EnvironmentConfig<string, string>,
  Optionals = T["optional"]
> = Optionals extends undefined
  ? Record<string, never>
  : { [K in keyof Optionals]: string };

export type ValuesFromEnvironment<T extends EnvironmentConfig<string, string>> =
  RequiredValuesFromEnvironment<T> & OptionalValuesFromEnvironment<T>;

type FromEnvironmentErrors = {
  required: z.ZodIssue[];
  optional: z.ZodIssue[];
};

function foo<X extends Record<string, string>>(x: X): boolean {
  return true;
}

const y: ValuesFromEnvironment<{
  required: ["REQUIRED_ONE", "REQUIRED_TWO"];
  optional: {
    OPTIONAL_ONE: "default1";
    OPTIONAL_TWO: "default2";
  };
}> = {
  REQUIRED_ONE: "foo",
  REQUIRED_TWO: "bar",
  OPTIONAL_ONE: "default1",
  OPTIONAL_TWO: "default2",
};

function formatFromEnvironmentErrorMessage(
  errors: FromEnvironmentErrors
): string {
  console.log("errors", errors);

  function bullet(errorPath: (string | number)[], value?: string) {
    const key = errorPath.join(".");
    return value ? `- ${key}: ${value}` : `- ${key}`;
  }

  const requiredMissingErrorLines = errors.required
    .filter((error) => error.message === "Required")
    .map((error) => bullet(error.path));

  const isInvalidTypeError = (error: z.ZodIssue) =>
    error.code === "invalid_type" && /^Expected/.test(error.message);

  const requiredInvalidErrorLines = errors.required
    .filter(isInvalidTypeError)
    .map((error) => bullet(error.path, error.message));

  const optionalInvalidErrorLines = errors.optional
    .filter(isInvalidTypeError)
    .map((error) => bullet(error.path, error.message));

  const messageLines: (string | string[])[] = [];
  if (requiredMissingErrorLines.length > 0) {
    messageLines.push(
      "Missing required environment variable(s):",
      ...requiredMissingErrorLines
    );
  }
  if (requiredInvalidErrorLines.length > 0) {
    messageLines.push(
      "\nInvalid values for required environment variable(s):",
      ...requiredInvalidErrorLines
    );
  }
  if (optionalInvalidErrorLines.length > 0) {
    messageLines.push(
      "\nInvalid values for optional environment variable(s):",
      ...optionalInvalidErrorLines
    );
  }

  return messageLines
    .map((line) => (typeof line === "string" ? line : line.join("\n")))
    .join("\n");
}

export function fromEnvironment<
  RequiredKeys extends string,
  OptionalKeys extends string
>(
  config: EnvironmentConfig<RequiredKeys, OptionalKeys>
): ValuesFromEnvironment<typeof config> {
  // Define Zod schema for required fields as strings
  const requiredSchema = z.object(
    Object.fromEntries((config.required ?? []).map((key) => [key, z.string()]))
  );

  // Define Zod schema for optional fields with defaults
  const optionalSchema = z.object(
    Object.fromEntries(
      Object.entries(config.optional ?? {}).map(([key, defaultValue]) => {
        return [key, z.string().default(z.string().parse(defaultValue))];
      })
    )
  );

  const { data: requiredEnv, error: requiredEnvError } =
    requiredSchema.safeParse(process.env);
  const { data: optionalEnv, error: optionalEnvError } =
    optionalSchema.safeParse(process.env);

  const errors: FromEnvironmentErrors = {
    required: requiredEnvError?.errors ?? [],
    optional: optionalEnvError?.errors ?? [],
  };

  if (errors.required.length > 0 || errors.optional.length > 0) {
    throw new Error(formatFromEnvironmentErrorMessage(errors));
  }

  return { ...requiredEnv, ...optionalEnv } as ValuesFromEnvironment<
    typeof config
  >;
}

export function coerceValuesFromEnvironment<
  Env extends ValuesFromEnvironment<
    EnvironmentConfig<string, string | undefined>
  >
>(rawEnvironment: Env, map: Record<Partial<keyof Env>, z.ZodTypeAny>) {
  const env = { ...rawEnvironment } satisfies Env;
  const mapKeys = new Set(Object.keys(map));
  for (const key in rawEnvironment) {
    if (key in map) {
      env[key] = map[key].parse(rawEnvironment[key]);
      mapKeys.delete(key);
    }
  }
  for (const key of mapKeys) {
    console.warn(`Unused env variable mapping: ${key}`);
  }
  return env;
}

export function csvArrayOf<T>(type: z.ZodType<T>) {
  return z
    .string()
    .transform((value) => value.split(","))
    .pipe(z.array(type));
}
