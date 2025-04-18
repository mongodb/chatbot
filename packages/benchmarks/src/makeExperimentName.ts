/**
 Generate Braintrust experiment name
 */
export function makeExperimentName({
  baseName,
  experimentType,
  model,
  ...rest
}: {
  baseName: string;
  experimentType: string;
  model: string;
  [k: string]: string;
}): string {
  return `${baseName}?experimentType=${experimentType}&model=${model}${
    rest && Object.entries(rest).length > 0
      ? `&${Object.entries(rest)
          .map(([k, v]) => `${k}=${v}`)
          .join("&")}`
      : ""
  }`;
}
