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
