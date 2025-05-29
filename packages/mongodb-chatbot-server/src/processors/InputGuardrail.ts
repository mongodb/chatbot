import { GenerateResponseParams } from "./GenerateResponse";

export interface InputGuardrailResult<
  Metadata extends Record<string, unknown> | undefined = Record<string, unknown>
> {
  rejected: boolean;
  reason?: string;
  metadata: Metadata;
}

export const guardrailFailedResult: InputGuardrailResult = {
  rejected: true,
  reason: "Guardrail failed",
  metadata: {},
};

export type InputGuardrail<
  Metadata extends Record<string, unknown> | undefined = Record<string, unknown>
> = (
  generateResponseParams: GenerateResponseParams
) => Promise<InputGuardrailResult<Metadata>>;

export function withAbortControllerGuardrail<T>(
  fn: (abortController: AbortController) => Promise<T>,
  guardrailPromise?: Promise<InputGuardrailResult>
): Promise<{
  result: T | null;
  guardrailResult: InputGuardrailResult | undefined;
}> {
  const abortController = new AbortController();
  return (async () => {
    try {
      // Run both the main function and guardrail function in parallel
      const [result, guardrailResult] = await Promise.all([
        fn(abortController),
        guardrailPromise
          ?.then((guardrailResult) => {
            if (guardrailResult.rejected) {
              abortController.abort();
            }
            return guardrailResult;
          })
          .catch((error) => {
            abortController.abort();
            return { ...guardrailFailedResult, metadata: { error } };
          }),
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
