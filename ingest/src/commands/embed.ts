import { CommandModule } from "yargs";
import { updateEmbeddedContent } from "../updateEmbeddedContent";

type EmbeddedContentCommandArgs = {
  since: string;
};

const commandModule: CommandModule<
  Record<string, unknown>,
  EmbeddedContentCommandArgs
> = {
  command: "embed",
  builder(args) {
    return args.string("since");
  },
  async handler({ since }) {
    try {
      await updateEmbeddedContent({
        since: new Date(since),

        // TODO: PageStore is a stand-in for Atlas (but can be mocked for testing)
        pageStore: {
          async loadPages() {
            return [];
          },
          async updatePages() {
            return;
          },
        },

        // TODO: EmbeddedContentStore is a stand-in for Atlas (but can be mocked for testing)
        embeddedContentStore: {
          async loadEmbeddedContent() {
            return [];
          },
          async deleteEmbeddedContent() {
            return;
          },
          async updateEmbeddedContent() {
            return;
          },
        },
      });
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  },
  describe: "Update embedded content data from pages",
};

export default commandModule;
