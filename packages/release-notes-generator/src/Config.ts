import { type SomeArtifact } from "./Artifact";
import {
  type Change,
  type ClassifiedChange,
  type ChangelogClassification,
} from "./Change";
import { type Logger, type LogLevel, logLevelSchema } from "./logger";
import { z } from "zod";

export type VersionRange = {
  current: string;
  previous: string;
};

export const versionRangeSchema = z.object({
  current: z.string(),
  previous: z.string(),
});

/**
 A function that fetches artifacts for a release.
 */
export type FetchArtifacts = (version: VersionRange) => Promise<SomeArtifact[]>;

/**
 A function that summarizes a given release artifact.
 */
export type SummarizeArtifact = (artifact: SomeArtifact) => Promise<string>;

/**
 A function that summarizes a given release artifact.
 */
export type ExtractChanges = (artifact: SomeArtifact) => Promise<Change[]>;

/**
 A function that summarizes a given release artifact.
 */
export type ClassifyChange = (
  change: Change
) => Promise<ChangelogClassification>;

/**
 A function that includes (i.e. returns true) or excludes (returns false) changes from the changelog based on their classification or other metadata.
 */
export type FilterChange = (change: ClassifiedChange) => boolean;

export type Config = {
  /**
   The name of the project.
   */
  projectName: string;
  fetchArtifacts: FetchArtifacts;
  summarizeArtifact: SummarizeArtifact;
  extractChanges: ExtractChanges;
  classifyChange: ClassifyChange;
  filterChange: FilterChange;
  /**
   Logger instance for recording progress and debugging information
   */
  logger?: Logger;
};

export const configSchema = z.object({
  projectName: z.string(),
  fetchArtifacts: z
    .function()
    .args(versionRangeSchema)
    .returns(z.promise(z.array(z.any()))),
  summarizeArtifact: z.function().args(z.any()).returns(z.promise(z.string())),
  extractChanges: z
    .function()
    .args(z.any())
    .returns(z.promise(z.array(z.any()))),
  classifyChange: z.function().args(z.any()).returns(z.promise(z.any())),
  filterChange: z.function().args(z.any()).returns(z.boolean()),
  logger: z
    .object({
      log: z
        .function()
        .args(logLevelSchema, z.string(), z.unknown().optional())
        .returns(z.promise(z.void())),
      getOutputPath: z
        .function()
        .args()
        .returns(z.string().or(z.undefined()))
        .optional(),
    })
    .optional(),
});

export function createChangelogConfig(config: Config): Config {
  // Validate the config at creation time
  return configSchema.parse(config);
}

export async function loadConfig(path: string): Promise<Config> {
  const { default: configModule } = await import(path);
  // Validate the loaded config
  return configSchema.parse(configModule.default);
}
