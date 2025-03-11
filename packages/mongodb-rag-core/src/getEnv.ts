interface GetEnvArgs {
  /**
   A list of environment variables that are required.
   If any of these are missing, an error will be thrown.
   */
  required?: string[];
  /**
   An object of environment variables that are optional.
   If any of these are missing, they will default to the value provided.
   */
  optional?: Record<string, string | undefined>;
}

type SomeEnv = {
  [key: string]: string | undefined;
};

export function getEnv<Env extends SomeEnv>({
  required,
  optional,
}: GetEnvArgs): Env {
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
  return env as Env;
}
