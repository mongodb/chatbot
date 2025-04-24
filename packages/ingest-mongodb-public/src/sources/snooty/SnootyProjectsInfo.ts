import fetch from "node-fetch";
import { logger } from "mongodb-rag-core";
import {
  SnootyProject,
  makeSnootyDataSource,
  Branch,
  LocallySpecifiedSnootyProjectConfig,
} from "./SnootyDataSource";
import { filterFulfilled } from "mongodb-rag-core";

/** Schema for API response from https://snooty-data-api.mongodb.com/prod/projects */
export type GetSnootyProjectsResponse = {
  data: SnootyProject[];
};

export type SnootyProjectsInfo = {
  getBaseUrl(args: {
    projectName: string;
    branchName: string;
  }): Promise<string>;

  getCurrentBranch(args: { projectName: string }): Promise<Branch>;

  getCurrentVersionName(args: {
    projectName: string;
  }): Promise<string | undefined>;

  getAllBranches(args: {
    projectName: string
  }): Promise<Branch[] | undefined>;
};

/**
  Creates a SnootyProjectsInfo object from the Snooty Data API GET projects
  endpoint.
 */
export const makeSnootyProjectsInfo = async ({
  snootyDataApiBaseUrl,
}: {
  snootyDataApiBaseUrl: string;
}): Promise<SnootyProjectsInfo & { _data: typeof data }> => {
  const response = await fetch(new URL("projects", snootyDataApiBaseUrl));
  const { data } =
    (await response.json()) as unknown as GetSnootyProjectsResponse;

  // Preprocess data into a Map for faster lookups
  const projectMap = new Map(data.map((project) => [project.project, project]));

  // Fix Snooty API data
  data.forEach((project) => {
    project.branches.forEach((branch) => {
      // Fix booleans that might be string "true" instead of boolean `true`. For more
      // context, see https://jira.mongodb.org/browse/DOP-3862
      branch.active =
        (branch.active as unknown) === "true" || branch.active === true;

      // Some urls are http instead of https
      branch.fullUrl = branch.fullUrl.replace("http://", "https://");
    });
  });

  return {
    _data: data,

    async getBaseUrl({ projectName, branchName }) {
      const metadata = projectMap.get(projectName);
      const branchMetaData = metadata?.branches.find(
        (branch) => branch.active && branch.gitBranchName === branchName
      );
      // Make sure there is an active branch at the specified branch name
      if (branchMetaData === undefined) {
        throw new Error(
          `For project '${projectName}', no active branch found for '${branchName}'.`
        );
      }
      return branchMetaData.fullUrl.replace("http://", "https://");
    },

    async getCurrentBranch({ projectName }) {
      return await getCurrentBranch(data, projectName);
    },
    async getCurrentVersionName({ projectName }) {
      const currentBranch = await getCurrentBranch(data, projectName);
      if (currentBranch.gitBranchName !== "master") {
        return currentBranch.gitBranchName;
      } else return;
    },
    async getAllBranches({ projectName }) {
      const project = projectMap.get(projectName);
      return project?.branches;
    },
  };
};

/**
  Helper function used in methods of makeSnootyProjectsInfo()
 */
async function getCurrentBranch(data: SnootyProject[], projectName: string) {
  const metadata = data.find(({ project }) => project === projectName);
  const currentBranch = metadata?.branches.find(
    ({ active, isStableBranch }) => active && isStableBranch
  );
  if (currentBranch === undefined) {
    throw new Error(
      `For project '${projectName}', no active branch found with isStableBranch == true.`
    );
  }
  return currentBranch;
}
/**
  Fill the details of the defined Snooty data sources with the info in the
  Snooty Data API projects endpoint.
 */
export const prepareSnootySources = async ({
  projects,
  snootyDataApiBaseUrl,
}: {
  projects: LocallySpecifiedSnootyProjectConfig[];
  snootyDataApiBaseUrl: string;
}) => {
  const snootyProjectsInfo = await makeSnootyProjectsInfo({
    snootyDataApiBaseUrl,
  });
  return filterFulfilled(
    await Promise.allSettled(
      projects.map(async (project) => {
        const { name: projectName } = project;
        let branches = await snootyProjectsInfo.getAllBranches({
          projectName,
        }) as Branch[];
        // modify branches if there is a currentVersionOverride
        if (project.currentVersionOverride) {
          branches = branches.map((branch) => {
            if (branch.gitBranchName !== project.currentVersionOverride) {
              return { ...branch, isStableBranch: false };
            }
            if (branch.gitBranchName === project.currentVersionOverride) {
              return { ...branch, isStableBranch: true };
            }
            return branch;
          });
        }
        try {
          return makeSnootyDataSource({
            name: project.name,
            project: {
              ...project,
              branches,
            },
            snootyDataApiBaseUrl,
          });
        } catch (error) {
          logger.error(
            `Failed to prepare snooty data source '${project.name}': ${
              (error as Error).message
            }`
          );
          throw error;
        }
      })
    )
  ).map((result) => result.value);
};

