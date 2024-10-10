import { EmbeddedContent } from "./EmbeddedContent";
import { WithScore } from "./VectorStore";

export type FindContentFuncArgs = {
  query: string;
};

export type FindContentResult = {
  queryEmbedding: number[];
  content: WithScore<EmbeddedContent>[];
  metadata: Record<string, unknown>;
};

export type FindContentFunc = (
  args: FindContentFuncArgs
) => Promise<FindContentResult>;

export interface PreProcessFindContentQueryArgs<
  T extends Record<string, unknown>
> {
  findContentArgs: FindContentFuncArgs;
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

    return result;
  };
}
