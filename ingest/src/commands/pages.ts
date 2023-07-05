import { CommandModule } from "yargs";
import { assertEnvVars, makeDatabaseConnection } from "chat-core";
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

    const pageStore = await makeDatabaseConnection({
      connectionUri: MONGODB_CONNECTION_URI,
      databaseName: MONGODB_DATABASE_NAME,
    });

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

    const sources = [...snootySources, devCenterSource].filter(({ name }) =>
      requestedSources.has(name)
    );

    if (sources.length === 0) {
      console.error("Request at least one source.");
      return;
    }

    console.log(`Loaded sources:\n${sources.map(({ name }) => `- ${name}\n`)}`);

    try {
      await updatePages({
        sources,
        pageStore,
      });
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  },
  describe: "Update pages data from sources",
};

export default commandModule;
