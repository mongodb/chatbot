import { readYamlDir } from "./yaml";
import { parse as parsePath } from "path";
import * as z from "zod";

export const tdbxContentTypeIds = [
  "compatibility-table",
  "contribution-guide",
  "faq",
  "fundamental",
  "issue-help",
  "landing-page",
  "migrate-legacy-version",
  "quick-reference",
  "settings-reference",
  "troubleshooting",
  "tutorial",
  "upgrade-version",
  "usage-example",
  "whats-new",
  "quick-start",
] as const;

export type TdbxContentTypeId = (typeof tdbxContentTypeIds)[number];

const TdbxContentTypeSchema = z.object({
  type: z.enum(tdbxContentTypeIds),
  name: z.string(),
  objectives: z.array(z.string()),
  pageStructure: z.string(),
  examples: z.array(z.string()),
});

export type TdbxContentType = z.infer<typeof TdbxContentTypeSchema>;

export function isTdbxContentType(obj: unknown): obj is TdbxContentType {
  const parseResult = TdbxContentTypeSchema.safeParse(obj);
  if (parseResult.success) {
    return true;
  }
  return false;
}

export function asTdbxContentType(obj: unknown): TdbxContentType {
  const parseResult = TdbxContentTypeSchema.parse(obj);
  return parseResult;
}
export async function loadTdbxContentTypes(
  dir: string
): Promise<TdbxContentType[]> {
  const yamlDocs = await readYamlDir(dir);

  const tdbxContentTypes: TdbxContentType[] = [];
  const errors = [];
  for (const [filename, doc] of yamlDocs) {
    if (!isTdbxContentType(doc)) {
      const currentFileName = parsePath(__filename).name;
      errors.push(
        `Invalid content type defintion: ${filename}\n\tDo you need to add it to the content type definition in ${currentFileName}?`
      );
      continue;
    }
    tdbxContentTypes.push(doc);
  }
  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
  }
  return tdbxContentTypes;
}

export async function importTdbxContentTypes() {
  return loadTdbxContentTypes("context/tdbx-content-types/");
}
