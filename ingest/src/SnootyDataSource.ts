import fs from "fs";
import { createInterface } from "readline";
import { DataSource } from "./DataSource.js";
import { Page } from "./updatePages.js";

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
  ast: Record<string, SnootyNode>;
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
}: {
  name: string;
  manifestUrl: string;
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
                    { sourceName: name }
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
  }: {
    sourceName: string;
  }
): Promise<Page> => {
  return {
    url: page.page_id,
    sourceName,
    body: "This is a page", // TODO
    format: "md",
    tags: [],
  };
};
