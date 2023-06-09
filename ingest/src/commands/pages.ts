import { CommandModule } from "yargs";
import { updatePages } from "../updatePages";

// TODO: Option for which data source
type PagesCommandArgs = Record<string, never>;

const commandModule: CommandModule<PagesCommandArgs> = {
  command: "pages",
  handler: async (args) => {
    try {
      await updatePages({
        sources: [], // TODO: Load data source interfaces based on args

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
