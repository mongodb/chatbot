import { type ZodObject, type ZodRawShape, type ZodType } from "zod";

/**
  Condense a string to a maximum length by replacing the end of the string with an ellipsis.
  @param str - The string to condense.
  @param ellipsizeAtLength - The length at which to ellipsize the string.
  @returns A condensed string.
  @example
  makeShortName("Hello, world!", 12) // "Hello, wo..."
 */
export const makeShortName = (prompt: string, ellipsizeAtLength = 64) => {
  if (ellipsizeAtLength <= 2) {
    throw new Error("ellipsizeAtLength must be greater than 2");
  }
  return prompt.length > ellipsizeAtLength
    ? prompt.slice(0, ellipsizeAtLength - 3) + "..."
    : prompt;
};

/**
  A dictionary of descriptions for each field in a Zod schema.
  @example
  type SchemaDescriptions = {
    name: string | null;
    age: string | null;
  };
 */
export type ZodSchemaDescriptions<T extends ZodRawShape> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [K in keyof T]: T[K] extends ZodType<any, any, any>
    ? T[K]["description"] extends string
      ? T[K]["description"]
      : null
    : never;
};

/**
  Extract the descriptions from a Zod schema.
  @param schema - The Zod schema to extract descriptions from.
  @returns A dictionary of descriptions for each field in the schema.
  @example
  extractDescriptions(
    z.object({
      name: z.string().describe("The name of the user"),
      age: z.number().describe("The age of the user"),
    })
  )
  // {
  //   name: "The name of the user",
  //   age: "The age of the user",
  // }
 */
export function extractZodSchemaDescriptions<T extends ZodRawShape>(
  schema: ZodObject<T>
): ZodSchemaDescriptions<T> {
  return Object.fromEntries(
    Object.entries(schema.shape).map(([key, zodSchema]) => {
      return [key, (zodSchema as { description?: string }).description ?? null];
    })
  ) as ZodSchemaDescriptions<T>;
}
