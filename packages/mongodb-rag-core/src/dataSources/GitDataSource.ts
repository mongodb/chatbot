import simpleGit, { TaskOptions } from "simple-git";
import fs from "fs";
import Path from "path";
import os from "os";
import { rimrafSync } from "rimraf";
import { DataSource } from "./DataSource";
import { filterDefined, filterFulfilled } from "../arrayFilters";
import { logger } from "../logger";
import { Page, PageMetadata } from "../contentStore";

/**
  Function to convert a file in the repo into a `Page` or `Page[]`.
  @param path - Path to file in repo
  @param content - Contents of file in repo
  */
export type HandlePageFunc = (
  path: string,
  content: string
) => Promise<undefined | Omit<Page, "sourceName"> | Omit<Page, "sourceName">[]>;

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
  metadata?: PageMetadata;

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
      try {
        logger.info(`Created ${randomTmpDir} for ${repoUri}`);

        await getRepoLocally({
          repoPath: repoUri,
          localPath: randomTmpDir,
          options: { "--depth": 1, ...(repoOptions ?? {}) },
        });
        logger.info(`Cloned ${repoUri} to ${randomTmpDir}`);

        const pathsAndContents = await getRelevantFilesAsStrings({
          directoryPath: randomTmpDir,
          filter(path) {
            // pathInRepo is leading slash + path within the repo
            const pathInRepo = path.replace(randomTmpDir, "");
            return filter(pathInRepo);
          },
        });

        const pagesPromises = Object.entries(pathsAndContents).map(
          async ([path, content]) => handlePage(path, content)
        );

        return filterDefined(
          filterFulfilled(await Promise.allSettled(pagesPromises)).map(
            ({ value }) => value
          )
        )
          .flat(1)
          .map(
            (page): Page => ({
              ...page,
              sourceName: name,
              metadata:
                metadata || page.metadata
                  ? { ...(metadata ?? {}), ...(page.metadata ?? {}) }
                  : undefined,
            })
          );
      } finally {
        rimrafSync(randomTmpDir);
        logger.info(`Deleted ${randomTmpDir}`);
      }
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
  const randomTmpDir = fs.mkdtempSync(Path.resolve(tmpDir, prefix));
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
    const itemPath = Path.resolve(directoryPath, item);
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
