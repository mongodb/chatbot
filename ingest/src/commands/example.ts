import { CommandModule } from "yargs";

type ExampleCommandArgs = { paths: string[] };

const commandModule: CommandModule<ExampleCommandArgs> = {
  command: "example <paths..>",
  handler: async (args) => {
    try {
      // do something
      console.log(args);
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  },
  describe: "example command",
};

export default commandModule;
