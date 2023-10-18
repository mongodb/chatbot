import yargs from "yargs";
import Path from "path";
import { Config, Constructor } from "./Config";

export type LoadConfigArgs = {
  config?: string;
};

export const loadConfig = async ({
  config: configPathIn,
}: LoadConfigArgs): Promise<Config> => {
  const path = Path.resolve(
    configPathIn === undefined ? "ingest.config.cjs" : configPathIn
  );

  const configArray = (await import(path)).default as Partial<Config>[];

  // Validate config
  if (!Array.isArray(configArray)) {
    throw new Error(
      `Invalid config at ${path}: expected default exported array of Config objects`
    );
  }
  // TODO: further validation

  // Flatten config
  const partialConfig: Partial<Config> = configArray.reduce((acc, cur) => ({
    ...acc,
    ...cur,
  }));

  const config: Config = {
    ...partialConfig,
    dataSources: checkRequiredProperty(partialConfig, "dataSources"),
    embeddedContentStore: checkRequiredProperty(
      partialConfig,
      "embeddedContentStore"
    ),
    embedder: checkRequiredProperty(partialConfig, "embedder"),
    ingestMetaStore: checkRequiredProperty(partialConfig, "ingestMetaStore"),
    pageStore: checkRequiredProperty(partialConfig, "pageStore"),
  };

  return config;
};

export const withConfig = async <T>(
  action: (config: ResolvedConfig, args: T) => Promise<void>,
  args: LoadConfigArgs & T
) => {
  const config = await loadConfig(args);
  const resolvedConfig = await resolveConfig(config);

  console.log(`resolved config: ${resolvedConfig.dataSources[0]}`);
  try {
    return await action(resolvedConfig, args);
  } finally {
    // TODO
    // config.embeddedContentStore.close();
  }
};

/**
  Apply config options to CLI command.
 */
export const withConfigOptions = <T>(
  args: yargs.Argv<T>
): yargs.Argv<T & LoadConfigArgs> => {
  return args.option("config", {
    string: true,
    description: "Path to config JS file.",
  });
};

/**
  Config with promises resolved.
 */
export type ResolvedConfig = {
  [K in keyof Config]: Constructed<Config[K]>;
};

type Constructed<T> = Awaited<T extends () => infer R ? R : T>;

/**
  Resolve any promises in the config object.
 */
const resolveConfig = async (config: Config): Promise<ResolvedConfig> => {
  return Object.fromEntries(
    await Promise.all(
      Object.entries(config).map(async ([k, v]) => [k, await resolve(v)])
    )
  );
};

const resolve = async <T>(v: Constructor<T>): Promise<T | Constructed<T>> => {
  if (typeof v === "function") {
    return (v as () => T)();
  }
  return v;
};

/**
  Asserts that the given property is defined in the given object and returns
  that value as a definitely not undefined type.
 */
function checkRequiredProperty<T, K extends keyof T>(
  object: T,
  k: K
): Exclude<T[K], undefined> {
  const value = object[k];
  if (value === undefined) {
    throw new Error(`Config is missing property: ${k.toString()}`);
  }
  return value as Exclude<T[K], undefined>;
}
