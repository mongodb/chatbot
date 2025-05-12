import type { SomeArtifact } from "./artifact";
import {
  changeSchema,
  classifiedChangeSchema,
  changelogClassificationSchema,
} from "./change";
import { loggerSchema } from "./logger";
import { z } from "zod";

export const versionRangeSchema = z.object({
  current: z.string(),
  previous: z.string().optional(),
});

export type VersionRange = z.infer<typeof versionRangeSchema>;

export const projectInfoSchema = z.object({
  /**
   The name of the project
   */
  name: z.string(),
  /**
   A description of what the project does and its purpose
   */
  description: z.string(),
});

export type ProjectInfo = z.infer<typeof projectInfoSchema>;

export const configSchema = z.object({
  /**
   Information about the project
   */
  project: projectInfoSchema,
  /**
   A function that fetches artifacts for a release.
   */
  fetchArtifacts: z
    .function()
    .args(versionRangeSchema)
    .returns(z.promise(z.array(z.custom<SomeArtifact>()))),
  /**
   A function that summarizes a given release artifact.
   */
  summarizeArtifact: z
    .function()
    .args(
      z.object({
        project: projectInfoSchema,
        artifact: z.custom<SomeArtifact>(),
      }),
    )
    .returns(z.promise(z.string())),
  /**
   A function that extracts changes from a given release artifact.
   */
  extractChanges: z
    .function()
    .args(
      z.object({
        project: projectInfoSchema,
        artifact: z.custom<SomeArtifact>(),
      }),
    )
    .returns(z.promise(z.array(changeSchema))),
  /**
   A function that classifies a change.
   */
  classifyChange: z
    .function()
    .args(changeSchema)
    .returns(z.promise(changelogClassificationSchema)),
  /**
   A function that includes (i.e. returns true) or excludes (returns false) changes
   from the changelog based on their classification or other metadata.
   */
  filterChange: z.function().args(classifiedChangeSchema).returns(z.boolean()),
  /**
   Logger instance for recording progress and debugging information
   */
  logger: loggerSchema.optional(),
  /**
   The maximum number of concurrent requests to the LLM API.
   */
  llmMaxConcurrency: z.number().optional().default(1),
});

export type ConfigInput = z.input<typeof configSchema>;

export type Config = z.infer<typeof configSchema>;

// If you need individual function types, derive them from the schema
export type FetchArtifacts = Config["fetchArtifacts"];
export type SummarizeArtifact = Config["summarizeArtifact"];
export type ExtractChanges = Config["extractChanges"];
export type ClassifyChange = Config["classifyChange"];
export type FilterChange = Config["filterChange"];

export function createConfig(config: ConfigInput): Config {
  return configSchema.parse(config);
}

export function validateConfig(config: unknown): Config {
  return configSchema.parse(config);
}

export async function loadConfigFile(path: string): Promise<Config> {
  const { default: configModule } = (await import(path)) as { default: Config };
  return validateConfig(configModule);
}
