/**
 Generate Braintrust experiment name
 */
export function makeExperimentName({
  baseName,
  experimentType,
  model,
  systemPromptStrategy,
  schemaStrategy,
  fewShot,
}: {
  baseName: string;
  experimentType: string;
  model: string;
  systemPromptStrategy?: string;
  schemaStrategy?: string;
  fewShot?: boolean;
}): string {
  return `${baseName}?experimentType=${experimentType}&model=${model}${
    systemPromptStrategy ? `&prompt=${systemPromptStrategy}` : ""
  }${schemaStrategy ? `&schema=${schemaStrategy}` : ""}${
    fewShot ? "&fewShot=true" : ""
  }`;
}
