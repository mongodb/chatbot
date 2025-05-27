declare module "turndown-plugin-gfm" {
  import { Plugin as TurndownPlugin } from "turndown";
  export function gfm(): TurndownPlugin;
}
