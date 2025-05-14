import { z } from "zod";
/**
  A formatted reference for an assistant message.

  For example, a Reference might be a docs page, dev center article, or
  a MongoDB University module.
 */
export type Reference = z.infer<typeof Reference>;
export declare const Reference: z.ZodObject<{
    url: z.ZodString;
    title: z.ZodString;
    metadata: z.ZodOptional<z.ZodObject<{
        sourceName: z.ZodOptional<z.ZodString>;
        sourceType: z.ZodOptional<z.ZodString>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        sourceName: z.ZodOptional<z.ZodString>;
        sourceType: z.ZodOptional<z.ZodString>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        sourceName: z.ZodOptional<z.ZodString>;
        sourceType: z.ZodOptional<z.ZodString>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, z.ZodTypeAny, "passthrough">>>;
}, "strip", z.ZodTypeAny, {
    url: string;
    title: string;
    metadata?: z.objectOutputType<{
        sourceName: z.ZodOptional<z.ZodString>;
        sourceType: z.ZodOptional<z.ZodString>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
}, {
    url: string;
    title: string;
    metadata?: z.objectInputType<{
        sourceName: z.ZodOptional<z.ZodString>;
        sourceType: z.ZodOptional<z.ZodString>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
}>;
export type References = z.infer<typeof References>;
export declare const References: z.ZodArray<z.ZodObject<{
    url: z.ZodString;
    title: z.ZodString;
    metadata: z.ZodOptional<z.ZodObject<{
        sourceName: z.ZodOptional<z.ZodString>;
        sourceType: z.ZodOptional<z.ZodString>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        sourceName: z.ZodOptional<z.ZodString>;
        sourceType: z.ZodOptional<z.ZodString>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        sourceName: z.ZodOptional<z.ZodString>;
        sourceType: z.ZodOptional<z.ZodString>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, z.ZodTypeAny, "passthrough">>>;
}, "strip", z.ZodTypeAny, {
    url: string;
    title: string;
    metadata?: z.objectOutputType<{
        sourceName: z.ZodOptional<z.ZodString>;
        sourceType: z.ZodOptional<z.ZodString>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
}, {
    url: string;
    title: string;
    metadata?: z.objectInputType<{
        sourceName: z.ZodOptional<z.ZodString>;
        sourceType: z.ZodOptional<z.ZodString>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
}>, "many">;
export type SortReferences = (left: Reference, right: Reference) => -1 | 0 | 1;
export type ReferenceDomain = string | URL;
export declare function makePrioritizeReferenceDomain(domains: ReferenceDomain | ReferenceDomain[]): SortReferences;
/**
 * Determine if a reference is to a specific domain/path.
 */
export declare function isReferenceToDomain(referenceUrl: URL, domainUrl: URL): boolean;
