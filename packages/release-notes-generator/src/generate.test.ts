import { stripIndents } from "common-tags";
import { vi } from "vitest";
import { generate } from "./generate";
import type { Change, ClassifiedChange } from "./change";
import {
  type ExtractChanges,
  type FetchArtifacts,
  type ProjectInfo,
  type SummarizeArtifact,
  validateConfig,
} from "./config";
import atlasCliConfig from "./configs/atlasCli.config";
import mongoshConfig from "./configs/mongosh.config";
import opsManagerConfig from "./configs/opsManager.config";
import relationalMigratorConfig from "./configs/relationalMigrator.config";

const mockProjectInfo: ProjectInfo = {
  name: "Release Notes Generator Test Project",
  description: stripIndents`
    This is a test project for the release notes generator.
    It is used to test the release notes generator.
    It is not a real project.
    It is not used in any real way.
  `,
};

const mockConfig = validateConfig({
  project: mockProjectInfo,
  fetchArtifacts: vi
    .fn()
    .mockImplementation((_args: Parameters<FetchArtifacts>[0]) => {
      return Promise.resolve([
        {
          id: "1",
          type: "mock-artifact",
          data: {
            title: "Test",
          },
        },
      ]);
    }),
  summarizeArtifact: vi
    .fn()
    .mockImplementation((_args: Parameters<SummarizeArtifact>[0]) => {
      return Promise.resolve("Mock summary");
    }),
  extractChanges: vi
    .fn()
    .mockImplementation((_args: Parameters<ExtractChanges>[0]) => {
      return Promise.resolve([
        {
          description: "Mock change description",
          sourceIdentifier: "mock-artifact::1",
        },
      ]);
    }),
  classifyChange: vi.fn().mockImplementation((_change: Change) => {
    return Promise.resolve({
      audience: "external" as const,
      scope: "added" as const,
    });
  }),
  filterChange: vi.fn().mockImplementation((_change: ClassifiedChange) => {
    return true;
  }),
});

describe("generate", () => {
  it("generates changelogs based on a mock config", async () => {
    const changes = await generate(mockConfig, {
      current: "0.0.1",
      previous: "0.0.0",
    });
    expect(changes).toBeDefined();
    expect(changes.length).toBeGreaterThan(0);
  });
  // Skip this test because it uses real LLM calls and is slow
  it.skip("generates changelogs for a real config (Atlas CLI)", async () => {
    const changes = await generate(validateConfig(atlasCliConfig), {
      current: "1.22.0",
      previous: "1.21.0",
    });
    expect(changes).toBeDefined();
    expect(changes.length).toBeGreaterThan(0);
  }, 300000);
  // Skip this test because it uses real LLM calls and is slow
  it.skip("generates changelogs for a real config (mongosh)", async () => {
    const changes = await generate(validateConfig(mongoshConfig), {
      current: "2.3.8",
      previous: "2.3.7",
    });
    expect(changes).toBeDefined();
    expect(changes.length).toBeGreaterThan(0);
  }, 300000);
  // Skip this test because it uses real LLM calls and is slow
  it.skip("generates changelogs for a real config (opsManager)", async () => {
    const changes = await generate(validateConfig(opsManagerConfig), {
      current: "20250219",
    });
    expect(changes).toBeDefined();
    expect(changes.length).toBeGreaterThan(0);
  }, 3600000);
  // Skip this test because it uses real LLM calls and is slow
  it.skip("generates changelogs for a real config (relational-migrator)", async () => {
    const changes = await generate(validateConfig(relationalMigratorConfig), {
      current: "1.11.0",
      previous: "1.10.0",
    });
    expect(changes).toBeDefined();
    expect(changes.length).toBeGreaterThan(0);
  }, 300000);
});
