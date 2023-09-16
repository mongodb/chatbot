import { DevCenterProjectConfig } from "./DevCenterDataSource";
import { SnootyProjectConfig } from "./SnootyDataSource";
import { makeRstOnGitHubDataSource } from "./RstOnGitHubDataSource";
import { DataSource } from "./DataSource";
import { makeDevCenterDataSource } from "./DevCenterDataSource";
import { prepareSnootySources } from "./SnootyProjectsInfo";
import { snootyProjects, devCenterProject } from "./ingest.config";
/**
  Async constructor for specific data sources -- parameters baked in.
 */
export type SourceConstructor = () => Promise<DataSource | DataSource[]>;

// `baseUrl` and `currentBranch` to be filled in by the Snooty Data API GET
// projects endpoint - unless you want to specify one to override whatever the
// Data API says. `currentBranch` will be the name of the first branch entry has
// `isStableBranch` set to true in the Data API response.
export type LocallySpecifiedSnootyProjectConfig = Omit<
  SnootyProjectConfig,
  "baseUrl" | "currentBranch" | "version"
> & {
  baseUrl?: string;
  currentBranch?: string;
  versionNameOverride?: string;
};

export const snootyProjectConfig: LocallySpecifiedSnootyProjectConfig[] = snootyProjects;

export const devCenterProjectConfig: DevCenterProjectConfig = devCenterProject;

export const pyMongoSourceConstructor = async () => {
  return await makeRstOnGitHubDataSource({
    name: "pymongo",
    repoUrl: "https://github.com/mongodb/mongo-python-driver",
    repoLoaderOptions: {
      branch: "master",
      ignoreFiles: [/^(?!^doc\/).*/], // Everything BUT doc/
    },
    pathToPageUrl(path) {
      return path
        .replace(/^doc\//, "https://pymongo.readthedocs.io/en/stable/")
        .replace(/\.rst$/, ".html");
    },
  });
};

/**
  The constructors for the sources used by the docs chatbot.
 */
export const sourceConstructors: SourceConstructor[] = [
  () =>
    prepareSnootySources({
      projects: snootyProjectConfig,
      snootyDataApiBaseUrl: "https://snooty-data-api.mongodb.com/prod/",
    }),
  () => makeDevCenterDataSource(devCenterProjectConfig),
  pyMongoSourceConstructor,
];
