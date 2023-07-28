import { CommandModule } from "yargs";
import { strict as assert } from "assert";
import {
  assertEnvVars,
  logger,
  makeDatabaseConnection,
  PageStore,
} from "chat-core";
import { updatePages } from "../updatePages";
import {
  DevCenterProjectConfig,
  makeDevCenterDataSource,
} from "../DevCenterDataSource";
import { projectSourcesConfig, snootyProjectConfig } from "../projectSources";
import { INGEST_ENV_VARS } from "../IngestEnvVars";
import { prepareSnootySources } from "../SnootyProjectsInfo";

type PagesCommandArgs = {
  source?: string | string[];
};

const commandModule: CommandModule<
  Record<string, unknown>,
  PagesCommandArgs
> = {
  command: "pages",
  builder(args) {
    return args.option("source", {
      string: true,
      description: "A source name to load. If unspecified, loads all sources.",
    });
  },
  handler: async ({ source }) => {
    const { MONGODB_CONNECTION_URI, MONGODB_DATABASE_NAME } =
      assertEnvVars(INGEST_ENV_VARS);

    const store = await makeDatabaseConnection({
      connectionUri: MONGODB_CONNECTION_URI,
      databaseName: MONGODB_DATABASE_NAME,
    });

    try {
      await doPagesCommand({ source, store });
    } finally {
      await store.close();
    }
  },
  describe: "Update pages data from sources",
};

export default commandModule;

export const doPagesCommand = async ({
  source,
  store,
}: PagesCommandArgs & {
  store: PageStore;
}) => {
  const requestedSources = new Set(Array.isArray(source) ? source : [source]);

  const snootySources = await prepareSnootySources({
    projects: snootyProjectConfig,
    snootyDataApiBaseUrl: "https://snooty-data-api.mongodb.com/prod/",
  });

  const devCenterConfig = projectSourcesConfig.find(
    (project) => project.type === "devcenter"
  ) as DevCenterProjectConfig | undefined;
  assert(devCenterConfig !== undefined);
  const devCenterSource = await makeDevCenterDataSource(devCenterConfig);

  const availableSources = [...snootySources, devCenterSource];

  const sources =
    source === undefined
      ? availableSources
      : availableSources.filter(({ name }) => requestedSources.has(name));

  if (sources.length === 0) {
    throw new Error(
      `Request at least one valid source. Available sources:\n${availableSources
        .map(({ name }) => `- ${name}`)
        .join("\n")}`
    );
  }

  logger.info(
    `Loaded sources:\n${sources.map(({ name }) => `- ${name}`).join("\n")}`
  );

  await updatePages({
    sources,
    pageStore: store,
  });
};
