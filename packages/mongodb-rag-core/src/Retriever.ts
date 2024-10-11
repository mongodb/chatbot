import { EmbeddedContent } from "./EmbeddedContent";
import { WithScore } from "./VectorStore";

export interface Retriever<
  QueryFilters extends Record<string, unknown> | undefined = undefined,
  ResultMetadata extends Record<string, unknown> | undefined = undefined
> {
  findContent(
    args: FindContentArgs<QueryFilters>
  ): Promise<FindContentResult<ResultMetadata>>;
}

export type FindContentArgs<
  QueryFilters extends Record<string, unknown> | undefined = undefined
> = {
  /**
    Query to find content for.
   */
  query: string;

  /**
    Filters to apply to the query.
   */
  filters?: QueryFilters;
};

export type FindContentResult<
  ResultMetadata extends Record<string, unknown> | undefined = undefined
> = {
  /**
    Vector embedding of the query.
   */
  queryEmbedding?: number[];

  /**
    Content that was found for the query.
   */
  content: WithScore<EmbeddedContent>[];

  /**
    Metadata about the results.
   */
  metadata: ResultMetadata;
};

// TODO: keep working on this...
export interface PreProcessFindContentQueryArgs<
  T extends Record<string, unknown>
> {
  findContentArgs: FindContentArgs;
  metadata: T;
}

export type PreProcessFindContentQuery<T extends Record<string, unknown>> = (
  args: PreProcessFindContentQueryArgs<T>
) => Promise<{
  findContentFuncArgs: FindContentFuncArgs;
  metadata?: Record<string, unknown>;
}>;

export type PostProcessFindContentResults = (
  args: FindContentResult
) => Promise<{
  findContentResults: FindContentResult;
  metadata?: Record<string, unknown>;
}>;

interface MakeFindContentFuncWithPreAndPostProcessingArgs<
  T extends Record<string, unknown>
> {
  findContentFunc: FindContentFunc;
  postProcessors?: PostProcessFindContentResults[];
  preProcessors?: PreProcessFindContentQuery<T>[];
}

// TODO: test
export function makeFindContentFuncWithPreAndPostProcessing<
  T extends Record<string, unknown>
>({
  findContentFunc,
  postProcessors = [],
  preProcessors = [],
}: MakeFindContentFuncWithPreAndPostProcessingArgs<T>): (
  args: Parameters<FindContentFunc>[0] & { metadata: T }
) => ReturnType<FindContentFunc> {
  return async (args) => {
    // Extract metadata from args
    const { metadata, ...findContentArgs } = args;

    let metadataOut: Record<string, unknown> = {};

    // Pre-process the args if there are preProcessors
    let updatedFindContentArgs = findContentArgs;
    for (const preProcessor of preProcessors) {
      const { findContentFuncArgs, metadata: preProcessorMetadata } =
        await preProcessor({
          findContentArgs: updatedFindContentArgs,
          metadata,
        });
      updatedFindContentArgs = findContentFuncArgs;
      metadataOut = { ...metadataOut, ...(preProcessorMetadata ?? {}) };
    }

    // Call the findContentFunc without metadata
    let result = await findContentFunc(updatedFindContentArgs);

    // Post-process the result if there are postProcessors
    for (const postProcessor of postProcessors) {
      const { findContentResults, metadata: postProcessorMetadata } =
        await postProcessor(result);
      result = findContentResults;
      metadataOut = { ...metadataOut, ...(postProcessorMetadata ?? {}) };
    }

    return {
      ...result,
      metadata: { ...(result.metadata ?? {}), ...metadataOut },
    };
  };
}
