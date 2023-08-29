import { createInterface } from "readline";
import { Page, PageFormat } from "chat-core";
import fetch from "node-fetch";
import { DataSource } from "./DataSource";
import { snootyAstToMd, getTitleFromSnootyAst } from "./snootyAstToMd";
import { ProjectBase } from "./ProjectBase";
import {
  getTitleFromSnootyOpenApiSpecAst,
  snootyAstToOpenApiSpec,
} from "./snootyAstToOpenApiSpec";

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
  options?: Record<string, unknown>;
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
  tags?: string[];
};

export type SnootyProjectConfig = ProjectBase & {
  type: "snooty";

  /**
    Git branch name for the current (search indexed) version of the site.
    @example "v4.10"
   */
  currentBranch: string;

  // TODO: we don't need the following config option yet, but we will when we
  // implement versions in the chatbot.
  // /**
  //  * Additional non-current branches to index
  //  * @example ["master", "v4.11"]
  //  */
  // additionalBranches?: string[];

  /**
    The base URL of pages within the project site.
   */
  baseUrl: string;
};

export type MakeSnootyDataSourceArgs = {
  /**
    The data source name.
   */
  name: string;

  /**
    The configuration for the Snooty project.
   */
  project: SnootyProjectConfig;

  /**
    The base URL for Snooty Data API requests.
   */
  snootyDataApiBaseUrl: string;

  version?: string;
};

export const makeSnootyDataSource = async ({
  name: sourceName,
  project,
  snootyDataApiBaseUrl,
}: MakeSnootyDataSourceArgs): Promise<
  DataSource & {
    _baseUrl: string;
    _currentBranch: string;
    _snootyProjectName: string;
    _version?: string;
  }
> => {
  const {
    baseUrl,
    currentBranch,
    name: snootyProjectName,
    tags,
    productName,
    version,
  } = project;
  return {
    // Additional members for testing purposes
    _baseUrl: baseUrl,
    _currentBranch: currentBranch,
    _snootyProjectName: snootyProjectName,
    _version: version,
    name: sourceName,
    async fetchPages() {
      // TODO: The manifest can be quite large (>100MB) so this could stand to
      // be re-architected to use AsyncGenerators and update page-by-page. For
      // now we can just accept the memory cost.
      const getBranchDocumentsUrl = new URL(
        `projects/${snootyProjectName}/${currentBranch}/documents`,
        snootyDataApiBaseUrl
      );
      const { body } = await fetch(getBranchDocumentsUrl);
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
                    {
                      sourceName,
                      baseUrl,
                      tags: tags ?? [],
                      productName,
                      version,
                    }
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
                  `unexpected entry type from '${getBranchDocumentsUrl}': ${
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

/**
  Branch with site
 */
export interface Branch {
  /**
    Name of git branch
    @example "master"
   */
  gitBranchName: string;

  /**
    Whether or not the branch is active.
    @example true
   */
  active: boolean;

  /**
    Base URL of the site
    @example "https://mongodb.com/docs/kotlin/coroutine/upcoming"
   */
  fullUrl: string;

  /**
    Whether this is the 'current, active branch' (rather than a previous or
    upcoming version).
   */
  isStableBranch: boolean;
}

export interface SnootyProject {
  /**
    Snooty repo name
    @example "docs-kotlin"
   */
  repoName: string;
  /**
    Snooty project name
    @example "kotlin"
   */
  project: string;
  /**
    Branches of repo that correspond to a site
   */
  branches: Branch[];
}

export const handlePage = async (
  page: SnootyPageData,
  {
    sourceName,
    baseUrl,
    tags: tagsIn = [],
    productName,
    version,
  }: {
    sourceName: string;
    baseUrl: string;
    tags: string[];
    productName?: string;
    version?: string;
  }
): Promise<Page> => {
  // Strip first three path segments - according to Snooty team, they'll always
  // be ${property}/docsworker-xlarge/${branch}
  const pagePath = page.page_id
    .split("/")
    .slice(3)
    .filter((segment, i) => {
      // Remove `index` if it's the only segment, as that would create broken links.
      // `index` in subdirectories is fine - Snooty has special case handling for
      // `/index` only.
      return i !== 0 || segment !== "index";
    })
    .join("/");

  const tags: string[] = [...tagsIn];
  let body = "";
  let title: string | undefined;
  let format: PageFormat;
  if (page.ast.options?.template === "openapi") {
    format = "openapi-yaml";
    body = await snootyAstToOpenApiSpec(page.ast);
    title = getTitleFromSnootyOpenApiSpecAst(page.ast);
    tags.push("openapi");
  } else {
    format = "md";
    body = snootyAstToMd(page.ast, { baseUrl });
    title = getTitleFromSnootyAst(page.ast);
  }

  return {
    url: new URL(pagePath, baseUrl.replace(/\/?$/, "/")).href.replace(
      /\/?$/, // Add trailing slash
      "/"
    ),
    sourceName,
    title,
    body,
    format,
    metadata: {
      tags,
      productName,
      version,
    },
  };
};
