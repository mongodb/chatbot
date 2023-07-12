import { CommandModule } from "yargs";

const commandModule: CommandModule = {
  command: "all",
  async handler() {
    console.log("Hello all!");
    console.log("The time is:", new Date().toISOString());
  },
  describe: "Testing command",
};

export default commandModule;
