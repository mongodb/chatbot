import { strict as assert } from "assert";
import {
  GetSnootyProjectsResponse,
  makeSnootyProjectsInfo,
  prepareSnootySources,
} from "./SnootyProjectsInfo";

const snootyDataApiBaseUrl = "https://snooty-data-api.mongodb.com/prod/";

describe("SnootyProjectsInfo", () => {
  let projectsInfo:
    | Awaited<ReturnType<typeof makeSnootyProjectsInfo>>
    | undefined;
  beforeAll(async () => {
    projectsInfo = await makeSnootyProjectsInfo({
      snootyDataApiBaseUrl,
    });
  });
  afterAll(() => {
    projectsInfo = undefined;
  });

  it("gets project base url", async () => {
    const baseUrl = await projectsInfo?.getBaseUrl({
      projectName: "docs",
      branchName: "v6.0",
    });
    expect(baseUrl).toBe("https://mongodb.com/docs/v6.0");
  });
  it("throws for invalid branch", async () => {
    const baseUrlPromise = projectsInfo?.getBaseUrl({
      projectName: "docs",
      branchName: "not-a-branch",
    });
    await expect(baseUrlPromise).rejects.toThrow();
  });
  it("throws for invalid project", async () => {
    const baseUrlPromise = projectsInfo?.getBaseUrl({
      projectName: "not-a-project",
      branchName: "v6.0",
    });
    await expect(baseUrlPromise).rejects.toThrow();
  });

  it("corrects any string 'true' instead of boolean", async () => {
    // First let's check whether the original data had some errors
    const response = await fetch(new URL("projects", snootyDataApiBaseUrl));
    const { data }: GetSnootyProjectsResponse = await response.json();
    const findBadBoolBranches = (theData?: typeof data) =>
      theData?.find(({ branches }) => {
        return (
          branches.find(({ active }) => (active as unknown) === "true") !==
          undefined
        );
      });

    const branch = data[0].branches[0];

    // Check implementation of findBadBoolBranches
    expect(
      findBadBoolBranches([
        {
          project: "x",
          repoName: "x",
          branches: [
            {
              active: "true" as unknown as boolean,
            } as unknown as typeof branch,
          ],
        },
      ])
    ).toBeDefined();
    expect(
      findBadBoolBranches([
        {
          project: "x",
          repoName: "x",
          branches: [
            {
              active: true,
            } as unknown as typeof branch,
          ],
        },
      ])
    ).toBeUndefined();

    if (findBadBoolBranches(data) !== undefined) {
      console.log("Found bad bools in Snooty Data API response.");
    }
    expect(findBadBoolBranches(projectsInfo?._data)).toBeUndefined();
  });

  describe("prepareSnootySources", () => {
    it("allows override baseUrl", async () => {
      const sources = await prepareSnootySources({
        projects: [
          {
            type: "snooty",
            name: "cloud-docs",
            currentBranch: "master",
            tags: ["atlas", "docs"],
            // No override
          },
          {
            type: "snooty",
            name: "cloud-docs",
            currentBranch: "master",
            tags: ["atlas", "docs"],
            baseUrl: "https://override.example.com", // Override
          },
        ],
        snootyDataApiBaseUrl,
      });
      expect(sources[0]._baseUrl).toBe("https://mongodb.com/docs/atlas/");
      expect(sources[1]._baseUrl).toBe("https://override.example.com/");
    });

    it("allows override currentBranch", async () => {
      // Find some real branch names to test with in the data so that
      // prepareSnootySources() doesn't throw exceptions about unknown branches.
      const testProject = projectsInfo?._data.find(
        ({ branches }) =>
          branches.length > 1 &&
          branches.find(({ isStableBranch }) => isStableBranch) &&
          branches.find(
            ({ isStableBranch, active }) => !isStableBranch && active
          )
      );
      expect(testProject).toBeDefined();
      assert(testProject !== undefined);
      const actualCurrentBranch = testProject?.branches.find(
        ({ isStableBranch }) => isStableBranch
      );
      expect(actualCurrentBranch).toBeDefined();
      const someOtherBranch = testProject?.branches.find(
        ({ isStableBranch, active }) => !isStableBranch && active
      );
      expect(someOtherBranch).toBeDefined();
      assert(someOtherBranch !== undefined);
      const sources = await prepareSnootySources({
        projects: [
          {
            type: "snooty",
            name: testProject.project,
            tags: [],
            // No currentBranch override
          },
          {
            type: "snooty",
            name: testProject.project,
            tags: [],
            // currentBranch override
            currentBranch: someOtherBranch.gitBranchName,
          },
        ],
        snootyDataApiBaseUrl,
      });
      expect(sources).toHaveLength(2);
      expect(sources[0]._currentBranch).toBe(
        actualCurrentBranch?.gitBranchName
      );
      expect(sources[1]._currentBranch).toBe(someOtherBranch.gitBranchName);
    });
    it("allows override version with versionNameOverride", async () => {
      const sources = await prepareSnootySources({
        projects: [
          {
            type: "snooty",
            name: "cloud-docs",
            currentBranch: "master",
            tags: ["atlas", "docs"],
            // No override
          },
          {
            type: "snooty",
            name: "docs",
            currentBranch: "v6.0",
            tags: ["manual", "docs"],
            versionNameOverride: "override",
          },
          {
            type: "snooty",
            name: "node",
            tags: ["driver", "docs"],
          },
        ],
        snootyDataApiBaseUrl,
      });
      expect(sources[0]._version).toBeUndefined();
      expect(sources[1]._version).toBe("override (current)");
      expect(sources[2]._version).toContain(" (current)");
    });
  });
});
