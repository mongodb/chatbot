import { GenerateResponseParams } from "../routes/conversations/addMessageToConversation";

export type InputGuardrail<
  Metadata extends Record<string, unknown> | undefined = Record<string, unknown>
> = (generateResponseParams: Omit<GenerateResponseParams, "llm">) => Promise<{
  rejected: boolean;
  reason?: string;
  message: string;
  metadata: Metadata;
}>;

export function withAbortControllerGuardrail<T, G>(
  fn: (abortController: AbortController) => Promise<T>,
  guardrailPromise?: Promise<G>
): Promise<{ result: T | null; guardrailResult: Awaited<G> | undefined }> {
  const abortController = new AbortController();
  return (async () => {
    try {
      // Run both the main function and guardrail function in parallel
      const [result, guardrailResult] = await Promise.all([
        fn(abortController).catch((error) => {
          // If the main function was aborted by the guardrail, return null
          if (error.name === "AbortError") {
            return null as T | null;
          }
          throw error;
        }),
        guardrailPromise,
      ]);

      return { result, guardrailResult };
    } catch (error) {
      // If an unexpected error occurs, abort any ongoing operations
      if (!abortController.signal.aborted) {
        abortController.abort();
      }
      throw error;
    }
  })();
}
