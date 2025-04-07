interface GetEnvArgs<
  R extends string,
  O extends Record<string, string | undefined>
> {
  /**
   A list of environment variables that are required.
   If any of these are missing, an error will be thrown.
   */
  required?: readonly R[];
  /**
   An object of environment variables that are optional.
   If any of these are missing, they will default to the value provided.
   */
  optional?: O;
}

// Helper type to determine the type of an optional env var based on its default value
type OptionalEnvType<T extends string | undefined> = T extends undefined
  ? string | undefined
  : string;

type EnvFromArgs<
  R extends string,
  O extends Record<string, string | undefined>
> = {
  [K in R]: string;
} & {
  [K in keyof O]: OptionalEnvType<O[K]>;
};

export function getEnv<
  R extends string = never,
  O extends Record<string, string | undefined> = Record<never, never>
>({ required, optional }: GetEnvArgs<R, O>): EnvFromArgs<R, O> {
  const env = { ...optional };
  const missingRequired: string[] = [];
  if (required) {
    required.forEach((key) => {
      env[key] = process.env[key];
      if (!env[key]) {
        missingRequired.push(key);
      }
    });
  }
  if (missingRequired.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missingRequired
        .map((r) => ` - ${r}`)
        .join("\n")}`
    );
  }
  for (const key in optional) {
    env[key] = process.env[key] ?? optional[key];
  }
  return env as EnvFromArgs<R, O>;
}
