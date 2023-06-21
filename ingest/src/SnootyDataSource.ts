import fetch from "node-fetch";
import { createInterface } from "readline";
import { DataSource } from "./DataSource.js";

export const makeSnootyDataSource = async ({
  name,
  manifestUrl,
}: {
  name: string;
  manifestUrl: string;
}): Promise<DataSource> => {
  return {
    name,
    async fetchPages() {
      const { body } = await fetch(manifestUrl);
      if (body === null) {
        return [];
      }
      const rl = createInterface(body);
      return [];
    },
  };
};
