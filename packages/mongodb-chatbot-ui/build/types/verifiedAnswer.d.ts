import { z } from "zod";
export declare const Question: z.ZodObject<{
    embedding: z.ZodArray<z.ZodNumber, "many">;
    embedding_model: z.ZodString;
    embedding_model_version: z.ZodString;
    text: z.ZodString;
}, "strip", z.ZodTypeAny, {
    embedding: number[];
    embedding_model: string;
    embedding_model_version: string;
    text: string;
}, {
    embedding: number[];
    embedding_model: string;
    embedding_model_version: string;
    text: string;
}>;
export type Question = z.infer<typeof Question>;
export declare const VerifiedAnswer: z.ZodObject<{
    _id: z.ZodString;
    question: z.ZodObject<{
        embedding: z.ZodArray<z.ZodNumber, "many">;
        embedding_model: z.ZodString;
        embedding_model_version: z.ZodString;
        text: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        embedding: number[];
        embedding_model: string;
        embedding_model_version: string;
        text: string;
    }, {
        embedding: number[];
        embedding_model: string;
        embedding_model_version: string;
        text: string;
    }>;
    answer: z.ZodString;
    author_email: z.ZodString;
    hidden: z.ZodOptional<z.ZodBoolean>;
    references: z.ZodArray<z.ZodObject<{
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
    created: z.ZodDate;
    updated: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    _id: string;
    question: {
        embedding: number[];
        embedding_model: string;
        embedding_model_version: string;
        text: string;
    };
    answer: string;
    author_email: string;
    references: {
        url: string;
        title: string;
        metadata?: z.objectOutputType<{
            sourceName: z.ZodOptional<z.ZodString>;
            sourceType: z.ZodOptional<z.ZodString>;
            tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
    }[];
    created: Date;
    hidden?: boolean | undefined;
    updated?: Date | undefined;
}, {
    _id: string;
    question: {
        embedding: number[];
        embedding_model: string;
        embedding_model_version: string;
        text: string;
    };
    answer: string;
    author_email: string;
    references: {
        url: string;
        title: string;
        metadata?: z.objectInputType<{
            sourceName: z.ZodOptional<z.ZodString>;
            sourceType: z.ZodOptional<z.ZodString>;
            tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, z.ZodTypeAny, "passthrough"> | undefined;
    }[];
    created: Date;
    hidden?: boolean | undefined;
    updated?: Date | undefined;
}>;
export type VerifiedAnswer = z.infer<typeof VerifiedAnswer>;
