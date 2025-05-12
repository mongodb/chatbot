import { classifiedChangeSchema } from "./change";
import { z } from "zod";

export const artifactSchema = <T extends string, D>(
  type: T,
  dataSchema: z.ZodType<D>,
) =>
  z.object({
    /** A unique identifier for the artifact. */
    id: z.string(),
    /** The type of the artifact. */
    type: z.literal(type),
    /** The data contained in the artifact. */
    data: dataSchema,
    /** The changes associated with the artifact. */
    changes: z.array(classifiedChangeSchema).default([]),
    /** A human-readable summary of the artifact. */
    summary: z.string().optional(),
  });

export type Artifact<T extends string, D> = z.infer<
  ReturnType<typeof artifactSchema<T, D>>
>;

export function getArtifactIdentifier<T extends string, D>(
  artifact: Artifact<T, D>,
): string {
  return `${artifact.type}::${artifact.id}`;
}

export function getCondensedArtifact<T extends string, D>(
  artifact: Artifact<T, D>,
): Required<Pick<Artifact<T, D>, "id" | "type" | "summary">> {
  return {
    id: artifact.id,
    type: artifact.type as T,
    summary: artifact.summary ?? "No summary provided",
  };
}

export type SomeArtifact = Artifact<string, unknown>;

export const artifactGroupDataSchema = z.object({
  artifacts: z.array(z.custom<SomeArtifact>()),
});

export const artifactGroupSchema = artifactSchema(
  "group",
  artifactGroupDataSchema,
);

export type ArtifactGroup = z.infer<typeof artifactGroupSchema>;

export function makeArtifactGroup(args: {
  id: string;
  artifacts: SomeArtifact[];
}): ArtifactGroup {
  return artifactGroupSchema.parse({
    id: args.id,
    type: "group",
    data: { artifacts: args.artifacts },
  });
}

export function getCondensedArtifactGroup(group: ArtifactGroup) {
  return {
    ...getCondensedArtifact(group),
    artifacts: group.data.artifacts.map(getCondensedArtifact),
  };
}
