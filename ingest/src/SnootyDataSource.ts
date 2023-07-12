import fs from "fs";
import { createInterface } from "readline";
import { Page } from "chat-core";
import nodeFetch from "node-fetch";
import { DataSource } from "./DataSource";
import { snootyAstToMd } from "./snootyAstToMd";

// These types are what's in the snooty manifest jsonl file.
export type SnootyManifestEntry = {
  type: "page" | "timestamp" | "metadata" | "asset";
  data: unknown;
};

/**
  Represents a page entry in a Snooty manifest file.
 */
export type SnootyPageEntry = SnootyManifestEntry & {
  type: "page";
  data: SnootyPageData;
};

/**
  A node in the Snooty AST.
 */
export type SnootyNode = {
  type: string;
  children?: (SnootyNode | SnootyTextNode)[];
  [key: string]: unknown;
};

/**
  A Snooty AST node with a text value.
 */
export type SnootyTextNode = SnootyNode & {
  type: "text";
  children: never;
  value: string;
};

/**
  A page in the Snooty manifest.
 */
export type SnootyPageData = {
  page_id: string;
  ast: SnootyNode;
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
  // Use a different fetcher depending on whether we are opening a local or
  // remote file
  const fetch =
    new URL(manifestUrl).protocol === "file:"
      ? async (url: string) => ({
          body: fs.createReadStream(new URL(url).pathname),
        })
      : nodeFetch;

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
          const entry = JSON.parse(line) as SnootyManifestEntry;
          switch (entry.type) {
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
            case "asset":
              // Nothing to do with assets (images...) for now
              return;
            case "metadata":
              // Nothing to do with metadata document for now
              return;
            case "timestamp":
              // Nothing to do with timestamp document for now
              return;
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

const handlePage = async (
  page: SnootyPageData,
  {
    sourceName,
    baseUrl,
  }: {
    sourceName: string;
    baseUrl: string;
  }
): Promise<Page> => {
  // Strip first three path segments - according to Snooty team, they'll always
  // be ${property}/docsworker-xlarge/${branch}
  const pagePath = page.page_id.split("/").slice(3).join("/");
  return {
    url: new URL(pagePath, baseUrl.replace(/\/?$/, "/")).href,
    sourceName,
    body: snootyAstToMd(page.ast, { baseUrl }),
    format: "md",
    tags: [],
  };
};
