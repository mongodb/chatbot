import fetch from "node-fetch";
import {
  SnootyProjectConfig,
  SnootyProject,
  makeSnootyDataSource,
} from "./SnootyDataSource";

/** Schema for API response from https://snooty-data-api.mongodb.com/prod/projects */
type GetSnootyProjectsResponse = {
  data: SnootyProject[];
};

export type SnootyProjectsInfo = {
  getBaseUrl(args: {
    projectName: string;
    branchName: string;
  }): Promise<string>;
};

/**
  Creates a SnootyProjectsInfo object from the Snooty Data API GET projects endpoint.
 */
export const makeSnootyProjectsInfo = async ({
  snootyDataApiBaseUrl,
}: {
  snootyDataApiBaseUrl: string;
}): Promise<SnootyProjectsInfo> => {
  const response = await fetch(new URL("projects", snootyDataApiBaseUrl));
  const { data }: GetSnootyProjectsResponse = await response.json();
  return {
    async getBaseUrl({ projectName, branchName }) {
      const siteMetadata = data.find(
        (snootyProject) => snootyProject.project === projectName
      );
      const branchMetaData = siteMetadata?.branches.find(
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
  };
};

/**
  Fill the details of the defined Snooty data sources with the info in the
  Snooty Data API projects endpoint.
 */
export const prepareSnootySources = async ({
  projects,
  snootyDataApiBaseUrl,
}: {
  projects: (Omit<SnootyProjectConfig, "baseUrl"> & {
    baseUrl?: string;
  })[];
  snootyDataApiBaseUrl: string;
}) => {
  const snootyProjectsInfo = await makeSnootyProjectsInfo({
    snootyDataApiBaseUrl,
  });
  return await Promise.all(
    projects.map(async (project) => {
      return await makeSnootyDataSource({
        name: `snooty-${project.name}`,
        project: {
          ...project,
          baseUrl:
            project.baseUrl?.replace(/\/?$/, "/") ??
            (await snootyProjectsInfo.getBaseUrl({
              projectName: project.name,
              branchName: project.currentBranch,
            })),
        },
        snootyDataApiBaseUrl,
      });
    })
  );
};
