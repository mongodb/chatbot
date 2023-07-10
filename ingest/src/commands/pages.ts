import { CommandModule } from "yargs";
import { assertEnvVars, logger, makeDatabaseConnection } from "chat-core";
import { updatePages } from "../updatePages";
import { makeSnootyDataSource } from "../SnootyDataSource";
import { makeDevCenterDataSource } from "../DevCenterDataSource";
import { snootyProjects } from "../snootyProjects";
import { INGEST_ENV_VARS } from "../IngestEnvVars";

type PagesCommandArgs = {
  source: string | string[];
};

const commandModule: CommandModule<
  Record<string, unknown>,
  PagesCommandArgs
> = {
  command: "pages",
  builder(args) {
    return args.string("source").demandOption("source");
  },
  handler: async ({ source }) => {
    const requestedSources = new Set(Array.isArray(source) ? source : [source]);

    const {
      DEVCENTER_CONNECTION_URI,
      MONGODB_CONNECTION_URI,
      MONGODB_DATABASE_NAME,
    } = assertEnvVars(INGEST_ENV_VARS);

    const snootySources = await Promise.all(
      snootyProjects.map(({ project, baseUrl }) =>
        makeSnootyDataSource({
          baseUrl,
          manifestUrl: `https://snooty-data-api.mongodb.com/projects/${project}/master/documents`,
          name: `snooty-${project}`,
        })
      )
    );

    const devCenterSource = await makeDevCenterDataSource({
      name: "devcenter",
      collectionName: "search_content_prod",
      databaseName: "devcenter",
      connectionUri: DEVCENTER_CONNECTION_URI,
      baseUrl: "https://www.mongodb.com/developer",
    });

    const availableSources = [...snootySources, devCenterSource];

    const sources = availableSources.filter(({ name }) =>
      requestedSources.has(name)
    );

    const pageStore = await makeDatabaseConnection({
      connectionUri: MONGODB_CONNECTION_URI,
      databaseName: MONGODB_DATABASE_NAME,
    });

    try {
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
        pageStore,
      });
    } finally {
      await pageStore.close();
    }
  },
  describe: "Update pages data from sources",
};

export default commandModule;
