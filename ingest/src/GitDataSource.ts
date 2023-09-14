import simpleGit, { TaskOptions } from "simple-git";
import fs from "fs";
import path from "path";
import os from "os";
import { rimrafSync } from "rimraf";
import { Page, logger } from "chat-core";
import { DataSource } from "./DataSource";

export interface HandlePageFuncOptions {
  /** Name of data source */
  sourceName: string;

  /** `Page.metadata` passed from config. Included in all documents  */
  metadata?: Record<string, unknown>; // TODO: replace with PageMetadata when other PR is merged
}

/**
  Function to convert a file in the repo into a `Page` or `Page[]`.
  @param path - Path to file in repo
  @param content - Contents of file in repo
  @param options - Options for `handlePage` function
  */
export type HandlePageFunc = (
  path: string,
  content: string,
  options: HandlePageFuncOptions
) => Promise<Page | Page[]>;

export interface MakeGitDataSourceParams {
  /** Name of project */
  name: string;

  /**
    URI for git repo
    @example
    "https://github.com/mongodb/mongo-java-driver.git"
   */
  repoUri: string;

  /**
    Options for `simple-git` clone command.
    @default
    { "--depth": 1 }
   */
  repoOptions?: TaskOptions;

  /**
    Filter function for selecting files in the repo to parse to pages.
    @example
    (path: string) => path.endsWith(".html")
   */
  filter: FilterFunc;

  /**
    Metadata to be included in all pages.
   */
  metadata?: Record<string, unknown>; // TODO: replace with PageMetadata when other PR is merged

  handlePage: HandlePageFunc;
}

/**
  Loads and processes files from a Git repo (can be hosted anywhere).
 */
export function makeGitDataSource({
  name,
  handlePage,
  filter,
  metadata,
  repoUri,
  repoOptions,
}: MakeGitDataSourceParams): DataSource {
  return {
    name,
    fetchPages: async () => {
      const randomTmpDir = makeRandomTmp(name);
      logger.info(`Created ${randomTmpDir} for ${repoUri}`);
      await getRepoLocally({
        repoPath: repoUri,
        localPath: randomTmpDir,
        options: { "--depth": 1, ...(repoOptions ?? {}) },
      });
      logger.info(`Cloned ${repoUri} to ${randomTmpDir}`);

      const pathsAndContents = await getRelevantFilesAsStrings({
        directoryPath: randomTmpDir,
        filter,
      });
      const pagesPromises = Object.entries(pathsAndContents).map(
        ([path, content]) =>
          handlePage(path, content, {
            metadata,
            sourceName: name,
          })
      );
      const fulfilledPromises = (
        await Promise.allSettled(pagesPromises)
      ).filter(
        (promiseResult) => promiseResult.status === "fulfilled"
      ) as PromiseFulfilledResult<Page | Page[]>[];
      const pages = fulfilledPromises.map(({ value }) => value).flat(1);

      rimrafSync(randomTmpDir);
      logger.info(`Deleted ${randomTmpDir}`);
      return pages;
    },
  };
}

// ----------------
// Helper functions
// ----------------

/**
  @param prefix - prefix for the temporary directory name
 */
export function makeRandomTmp(prefix: string) {
  // Get the system's default temporary directory
  const tmpDir = os.tmpdir();

  // Create a unique temporary directory and get its path
  const randomTmpDir = fs.mkdtempSync(path.join(tmpDir, prefix));
  return randomTmpDir;
}
export async function getRepoLocally({
  repoPath,
  localPath,
  options,
}: {
  repoPath: string;
  localPath: string;
  options?: TaskOptions;
}) {
  const git = simpleGit();
  logger.info(
    `Started cloning ${repoPath} to ${localPath} with options ${JSON.stringify(
      options
    )}`
  );
  await git.clone(repoPath, localPath, options);
  logger.info(
    `Successfully cloned ${repoPath} to ${localPath} with options ${JSON.stringify(
      options
    )}`
  );
}

export type FilterFunc = (path: string) => boolean;

export function getRelevantFilePathsInDir(
  directoryPath: string,
  filter: FilterFunc,
  fileList: string[] = []
) {
  const items = fs.readdirSync(directoryPath);

  items.forEach((item) => {
    const itemPath = path.join(directoryPath, item);
    const itemStat = fs.statSync(itemPath);

    if (itemStat.isDirectory()) {
      getRelevantFilePathsInDir(itemPath, filter, fileList);
    } else if (filter(itemPath)) {
      fileList.push(itemPath);
    }
  });

  return fileList;
}

export async function getRelevantFilesAsStrings({
  directoryPath,
  filter,
}: {
  directoryPath: string;
  filter: FilterFunc;
}) {
  const paths = getRelevantFilePathsInDir(directoryPath, filter);
  const pathsAndContents: Record<string, string> = {};
  paths.forEach((path) => {
    const content = fs.readFileSync(path, "utf8");
    pathsAndContents[path.replace(directoryPath, "")] = content;
  });
  return pathsAndContents;
}
