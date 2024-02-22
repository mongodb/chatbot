import yargs from "yargs";
import Path from "path";
import { logger } from "mongodb-rag-core";
import { EvalConfig } from "./EvalConfig";

export type LoadConfigArgs = {
  config?: string;
};

export const loadConfig = async ({
  config: configPathIn,
}: LoadConfigArgs): Promise<EvalConfig> => {
  const path = Path.resolve(
    configPathIn === undefined ? "eval.config.cjs" : configPathIn
  );

  const partialConfigConstructor = (await import(path))
    .default as () => Promise<Partial<EvalConfig>>;
  const partialConfig = await partialConfigConstructor();

  const missingProperties: string[] = [];
  const config: EvalConfig = {
    ...partialConfig,
    metadataStore: checkRequiredProperty(
      partialConfig,
      "metadataStore",
      missingProperties
    ),
    generatedDataStore: checkRequiredProperty(
      partialConfig,
      "generatedDataStore",
      missingProperties
    ),
    evaluationStore: checkRequiredProperty(
      partialConfig,
      "evaluationStore",
      missingProperties
    ),
    reportStore: checkRequiredProperty(
      partialConfig,
      "reportStore",
      missingProperties
    ),
    commands: checkRequiredProperty(
      partialConfig,
      "commands",
      missingProperties
    ),
  };

  if (missingProperties.length !== 0) {
    throw new Error(
      `Config is missing the following properties: ${missingProperties.join(
        ", "
      )}`
    );
  }

  return config;
};

export const withConfig = async <T>(
  action: (config: EvalConfig, args: T) => Promise<void>,
  args: LoadConfigArgs & T
) => {
  const config = await loadConfig(args);
  try {
    return await action(config, args);
  } catch (error) {
    logger.error(`Action failed: ${(error as Error).message}`);
    throw error;
  } finally {
    // Close all closable resources
    await Promise.all(
      Object.values(config)
        .filter((v) => v.close !== undefined)
        .map((v) => v.close as () => Promise<void>)
    );
    // Run afterAll if it exists
    config.afterAll && (await config?.afterAll());
    // TODO: how to test this w jest?
    process.exit(0);
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
// NOTE: consider moving the generic configurable CLI stuff to `mongodb-rag-core` or another independent library since we're using across multiple projects.

/**
  Asserts that the given property is defined in the given object and returns
  that value as a definitely not undefined type.
 */
function checkRequiredProperty<T, K extends keyof T>(
  object: T,
  k: K,
  missingProperties: string[]
): Exclude<T[K], undefined> {
  const value = object[k];
  if (value === undefined) {
    missingProperties.push(k.toString());
    // Hack: this is an invalid value. The caller MUST check the errors
    return undefined as Exclude<T[K], undefined>;
  }
  return value as Exclude<T[K], undefined>;
}

type Closeable = {
  close?(): Promise<void>;
};

type CleanupFunc = () => Promise<void>;
