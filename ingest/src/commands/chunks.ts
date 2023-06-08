import { CommandModule } from "yargs";
import { updateChunks } from "../updateChunks";

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
      await updateChunks({ since: new Date(since) });
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  },
  describe: "Update chunks data from pages",
};

export default commandModule;
