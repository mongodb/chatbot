import { CommandModule } from "yargs";
import { LoadConfigArgs } from "./withConfig";

type CMD<T extends { [k: string]: unknown } = Record<string, never>> =
  CommandModule<unknown, LoadConfigArgs & T>;

export function createCommand<
  T extends { [k: string]: unknown } = Record<string, never>
>(commandModule: CMD<T>) {
  return commandModule;
}
