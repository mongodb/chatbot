import { extractFrontMatter } from "./extractFrontMatter";
import yaml from "yaml";

export function updateFrontMatter(
  text: string,
  metadataIn: Record<string, unknown>
): string {
  const { metadata: existingMetadata, body } = extractFrontMatter(text);
  const metadata = {
    ...(existingMetadata ?? {}),
    ...metadataIn,
  };
  return ["---", yaml.stringify(metadata).trim(), "---", "", body].join("\n");
}
