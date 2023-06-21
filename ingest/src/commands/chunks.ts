import { CommandModule } from "yargs";
import { updateChunks } from "../updateChunks.js";

type ChunksCommandArgs = {
  since: string;
};

const commandModule: CommandModule<
  Record<string, unknown>,
  ChunksCommandArgs
> = {
  command: "chunks",
  builder(args) {
    return args.string("since");
  },
  async handler({ since }) {
    try {
      await updateChunks({
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

        // TODO: ChunkStore is a stand-in for Atlas (but can be mocked for testing)
        chunkStore: {
          async loadChunks() {
            return [];
          },
          async deleteChunks() {
            return;
          },
          async updateChunks() {
            return;
          },
        },
      });
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  },
  describe: "Update chunks data from pages",
};

export default commandModule;
