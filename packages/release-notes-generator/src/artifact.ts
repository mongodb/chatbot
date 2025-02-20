import { type ClassifiedChange, classifiedChangeSchema } from "./change";
import { z } from "zod";

export type ArtifactArgs<T extends string, D> = {
  id: string;
  type: T;
  summary?: string;
  changes?: ClassifiedChange[];
  data: D;
  metadata?: Record<string, unknown>;
};

export type Artifact<T extends string, D> = {
  /** A unique identifier for the artifact. */
  id: string;
  /** The type of the artifact. */
  type: T;
  /** The data contained in the artifact. */
  data: D;
  /** A human-readable summary of the artifact. */
  summary?: string;
  /** The changes associated with the artifact. */
  changes: ClassifiedChange[];
  /** Additional metadata associated with the artifact. */
  metadata?: Record<string, unknown>;
};

export const createArtifactArgsSchema = <T extends string, D>(
  typeSchema: z.ZodLiteral<T>,
  dataSchema: z.ZodType<D>,
) =>
  z.object({
    id: z.string(),
    type: typeSchema,
    summary: z.string().optional(),
    changes: z.array(classifiedChangeSchema).optional(),
    data: dataSchema,
    metadata: z.record(z.unknown()).optional(),
  });

export const createArtifactSchema = <T extends string, D>(
  typeSchema: z.ZodLiteral<T>,
  dataSchema: z.ZodType<D>,
) =>
  z.object({
    /** A unique identifier for the artifact. */
    id: z.string(),
    /** The type of the artifact. */
    type: typeSchema,
    /** The data contained in the artifact. */
    data: dataSchema,
    /** A human-readable summary of the artifact. */
    summary: z.string().optional(),
    /** The changes associated with the artifact. */
    changes: z.array(classifiedChangeSchema),
    /** Additional metadata associated with the artifact. */
    metadata: z.record(z.unknown()).optional(),
  });

export function makeArtifact<T extends string, D>(
  args: ArtifactArgs<T, D>,
  schema: ReturnType<typeof createArtifactSchema<T, D>>,
): Artifact<T, D> {
  const validatedArgsResult = createArtifactArgsSchema(
    schema.shape.type,
    schema.shape.data,
  ).safeParse(args);

  if (!validatedArgsResult.success) {
    throw new Error(
      `Failed to validate artifact arguments:\n${validatedArgsResult.error.errors
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join("\n")}`,
    );
  }

  const validatedArgs = validatedArgsResult.data;

  const artifact = {
    id: validatedArgs.id,
    type: validatedArgs.type,
    summary: validatedArgs.summary,
    changes: validatedArgs.changes ?? [],
    data: validatedArgs.data,
    metadata: validatedArgs.metadata,
  };

  const artifactResult = schema.safeParse(artifact);
  if (!artifactResult.success) {
    throw new Error(
      `Failed to validate artifact:\n${artifactResult.error.errors
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join("\n")}`,
    );
  }

  return artifactResult.data as Artifact<T, D>;
}

export function getArtifactIdentifier<T extends string, D>(
  artifact: Artifact<T, D>,
): string {
  return `${artifact.type}::${artifact.id}`;
}

export function getCondensedArtifact<T extends string, D>(
  artifact: Artifact<T, D>,
): Required<Pick<Artifact<T, D>, "id" | "type" | "summary">> &
  Record<string, unknown> {
  return {
    id: artifact.id,
    type: artifact.type,
    summary: artifact.summary ?? "No summary provided",
  };
}

export type SomeArtifact = Artifact<string, unknown>;

export const artifactGroupDataSchema = z.object({
  artifacts: z.array(z.custom<SomeArtifact>()),
});

export const artifactGroupSchema = createArtifactSchema(
  z.literal("group"),
  artifactGroupDataSchema,
);

export type ArtifactGroup = Artifact<"group", { artifacts: SomeArtifact[] }>;

export function makeArtifactGroup(args: {
  id: string;
  artifacts: SomeArtifact[];
}): ArtifactGroup {
  return makeArtifact(
    {
      id: args.id,
      type: "group",
      data: { artifacts: args.artifacts },
    },
    artifactGroupSchema,
  );
}

export function getCondensedArtifactGroup(group: ArtifactGroup) {
  return {
    ...getCondensedArtifact(group),
    artifacts: group.data.artifacts.map(getCondensedArtifact),
  };
}
