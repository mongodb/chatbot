import { CommandModule } from "yargs";
import { promises as fs } from "fs";

const commandModule: CommandModule<
  Record<string, unknown>,
  ImportCommandArgs
> = {
  command: "pages",
  builder(args) {
    return args.positional("path", {
      description: "Path to the configuration yaml file.",
      demandOption: true,
      type: "string",
    });
  },
  handler(args) {
    return doImportCommand(args);
  },
  describe: "Update pages data from sources",
};

export default commandModule;

export type ImportCommandArgs = { path: string };

export const doImportCommand = async ({ path }: ImportCommandArgs) => {
  const yaml = await fs.readFile(path, "utf-8");
  await importVerifiedAnswers(yamls);
};
