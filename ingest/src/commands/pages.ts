import { CommandModule } from "yargs";
import { updatePages } from "../updatePages";
import { makeSnootyDataSource } from "../SnootyDataSource";

// TODO: Option for which data source
type PagesCommandArgs = Record<string, never>;

const commandModule: CommandModule<PagesCommandArgs> = {
  command: "pages",
  handler: async (args) => {
    const snootySource = await makeSnootyDataSource({
      baseUrl: "https://mongodb.com/docs/",
      manifestUrl:
        "https://snooty-data-api.docs.prod.mongodb.com/projects/docs/master/documents",
      name: "snooty",
    });

    try {
      await updatePages({
        sources: [snootySource],

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
