import fs from "fs";
import { createInterface } from "readline";
import { DataSource } from "./DataSource";
import { Page } from "./updatePages";
import { snootyAstToMd } from "./snootyAstToMd";

// These types are what's in the snooty manifest jsonl file.
export type SnootyTimestampEntry = {
  type: "timestamp";
  data: number;
};

export type SnootyMetadataEntry = {
  type: "metadata";
  data: Record<string, unknown>;
};

// TODO
export type SnootyAsset = Record<string, unknown>;

export type SnootyNode = {
  type: string;
  children?: (SnootyNode | SnootyTextNode)[];
  [key: string]: unknown;
};

export type SnootyTextNode = SnootyNode & {
  type: "text";
  children: never;
  value: string;
};

export type SnootyPage = {
  page_id: string;
  ast: SnootyNode;
};

export type SnootyPageEntry = {
  type: "page";
  data: SnootyPage;
};

export type SnootyAssetEntry = {
  type: "asset";
  data: Record<string, unknown>;
};

export const makeSnootyDataSource = async ({
  name,
  manifestUrl,
  baseUrl,
}: {
  name: string;
  manifestUrl: string;

  /**
    The base url used in links etc
   */
  baseUrl: string;
}): Promise<DataSource> => {
  const fetch =
    new URL(manifestUrl).protocol === "file:"
      ? async (url: string) => ({
          body: fs.createReadStream(new URL(url).pathname),
        })
      : (await import("node-fetch")).default;

  return {
    name,
    async fetchPages() {
      // TODO: The manifest can be quite large (>100MB) so this could stand to
      // be re-architected to use AsyncGenerators and update page-by-page. For
      // now we can just accept the memory cost.
      const { body } = await fetch(manifestUrl);
      if (body === null) {
        return [];
      }
      const stream = createInterface(body);
      const linePromises: Promise<void>[] = [];
      const pages: Page[] = [];
      await new Promise<void>((resolve, reject) => {
        stream.on("line", async (line) => {
          const entry = JSON.parse(line) as
            | SnootyAssetEntry
            | SnootyTimestampEntry
            | SnootyMetadataEntry
            | SnootyPageEntry;
          switch (entry.type) {
            case "asset":
              return linePromises.push(
                handleAsset((entry as SnootyAssetEntry).data)
              );
            case "page":
              return linePromises.push(
                (async () => {
                  const page = await handlePage(
                    (entry as SnootyPageEntry).data,
                    { sourceName: name, baseUrl }
                  );
                  pages.push(page);
                })()
              );
            case "metadata":
            case "timestamp":
              return; // TODO?
            default:
              return reject(
                new Error(
                  `unexpected entry type from ${manifestUrl}: ${
                    (entry as Record<string, unknown>).type as string
                  }`
                )
              );
          }
        });
        stream.on("close", () => {
          resolve();
        });
      });
      await Promise.allSettled(linePromises);
      return pages;
    },
  };
};

const handleAsset = async (asset: SnootyAsset): Promise<void> => {
  // TODO
};

const handlePage = async (
  page: SnootyPage,
  {
    sourceName,
    baseUrl,
  }: {
    sourceName: string;
    baseUrl: string;
  }
): Promise<Page> => {
  return {
    url: page.page_id,
    sourceName,
    body: snootyAstToMd(page.ast, { baseUrl }),
    format: "md",
    tags: [],
  };
};
