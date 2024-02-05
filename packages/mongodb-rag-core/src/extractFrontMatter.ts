import * as matter from "gray-matter";
import toml from "toml";

/**
  This function extracts frontmatter from a string.
  The generic type does not validate that the frontmatter
  conforms to the type. It just provides the type
  for developer convenience.
*/
export function extractFrontMatter<T extends Record<string, unknown>>(
  text: string,
  language?: string,
  delimiter?: string
): {
  metadata?: T;
  body: string;
} {
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
  const metadata = frontmatterResult?.data as T | undefined;

  return {
    metadata,
    body: body.trimStart(),
  };
}
