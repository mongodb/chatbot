import { CommandModule } from "yargs";
import { updatePages } from "../updatePages";
import { makeSnootyDataSource } from "../SnootyDataSource";
import { makeDevCenterDataSource } from "../DevCenterDataSource";
import { snootyProjects } from "../snootyProjects";

// TODO: Option for which data source
type PagesCommandArgs = Record<string, never>;

const commandModule: CommandModule<PagesCommandArgs> = {
  command: "pages",
  handler: async (args) => {
    const { DEVCENTER_CONNECTION_URI } = process.env;
    if (!DEVCENTER_CONNECTION_URI) {
      throw new Error(
        `missing env var: DEVCENTER_CONNECTION_URI. Did you copy .env.example and fill it out?`
      );
    }

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

    try {
      await updatePages({
        sources: [...snootySources, devCenterSource],

        // TODO: PageStore is a stand-in for Atlas (but can be mocked for testing)
        pageStore: {
          async loadPages() {
            return [];
          },
          async updatePages() {
            return;
          },
        },
      });
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  },
  describe: "Update pages data from sources",
};

export default commandModule;
