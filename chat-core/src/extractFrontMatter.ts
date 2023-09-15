import * as matter from "gray-matter";
import toml from "toml";

export function extractFrontMatter(
  text: string,
  language?: string,
  delimiter?: string
): {
  metadata?: Record<string, unknown>;
  body: string;
} {
  let metadata: Record<string, unknown> | undefined;
  let body = text;
  const options = {
    delimiters: delimiter,
    language,
    engines: {
      toml: toml.parse.bind(toml),
    },
  };

  const frontmatterResult = matter.test(text, options)
    ? matter.default(text, options)
    : undefined;
  body = frontmatterResult?.content ?? text;
  metadata = frontmatterResult?.data;

  return {
    metadata,
    body: body.trimStart(),
  };
}
