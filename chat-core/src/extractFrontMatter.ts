import * as matter from "gray-matter";
import toml from "toml";

export function extractFrontMatter<T extends Record<string, unknown>>(
  text: string,
  language?: string,
  delimiter?: string
): {
  metadata?: T;
  body: string;
} {
  let metadata: T | undefined;
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
  metadata = frontmatterResult?.data as T | undefined;

  return {
    metadata,
    body: body.trimStart(),
  };
}
