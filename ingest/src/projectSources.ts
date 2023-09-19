import { DevCenterProjectConfig } from "./DevCenterDataSource";
import { makeRstOnGitHubDataSource } from "./RstOnGitHubDataSource";
import { DataSource } from "./DataSource";
import { makeDevCenterDataSource } from "./DevCenterDataSource";
import { prepareSnootySources } from "./SnootyProjectsInfo";
import { 
    snootyProjects, 
    devCenterProject, 
    LocallySpecifiedSnootyProjectConfig 
} from "./ingest.config";

/**
  Async constructor for specific data sources -- parameters baked in.
 */
export type SourceConstructor = () => Promise<DataSource | DataSource[]>;

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
