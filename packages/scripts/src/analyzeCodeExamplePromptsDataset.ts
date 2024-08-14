import { parse } from "csv-parse";
import { createObjectCsvWriter as createCsvWriter } from "csv-writer";
import { promises as fs } from "fs";
import { z } from "zod";

const codeExamplePromptSchema = z.object({
  classification: z.string(),
  code: z.string(),
  pageTitle: z.string(),
  pageUrl: z.string(),
  programmingLanguage: z.string(),
  // prompts: z.array(z.string()).length(3),
  prompt1: z.string(),
  prompt2: z.string(),
  prompt3: z.string(),
  sourceName: z.string(),
  tags: z
    .string()
    .transform((val) => val.split(",").map((item) => item.trim())),
});

type CodeExamplePrompt = z.infer<typeof codeExamplePromptSchema>;

async function importCodeExamplePromptsCsv(
  csv: string
): Promise<CodeExamplePrompt[]> {
  const records = await new Promise<CodeExamplePrompt[]>((resolve, reject) => {
    const records: CodeExamplePrompt[] = [];
    parse(csv, {
      columns: true,
      skip_empty_lines: true,
    })
      .on("data", (record) => {
        try {
          const fieldMap = {
            classification: "classification",
            code: "code",
            page_title: "pageTitle",
            page_url: "pageUrl",
            programming_language: "programmingLanguage",
            prompt_1: "prompt1",
            prompt_2: "prompt2",
            prompt_3: "prompt3",
            source_name: "sourceName",
            tags: "tags",
          } as const;
          const parsedRecord = codeExamplePromptSchema.parse(
            Object.fromEntries(
              Object.entries(record).map(([field, value]) => {
                const mappedField = fieldMap[field as keyof typeof fieldMap];
                if (!mappedField) {
                  throw new Error(`Unexpected field: ${field}`);
                }
                return [mappedField, value];
              })
            )
          );
          records.push(parsedRecord);
        } catch (error) {
          console.error("Error parsing record", record, error);
        }
      })
      .on("end", () => {
        resolve(records);
      })
      .on("error", reject);
  });
  return records;
}

const codeExamplePromptsCsvPath = `/Users/nlarew/mongodb/huggingface/code-example-prompts/docs-chatbot.code-examples-with-prompts-filtered-for-export-1716238834626.csv`;

async function main() {
  const codeExamplePromptsCsv = await fs.readFile(codeExamplePromptsCsvPath, {
    encoding: "utf-8",
  });
  const codeExamplePrompts = await importCodeExamplePromptsCsv(
    codeExamplePromptsCsv
  );

  console.log(`Imported ${codeExamplePrompts.length} code example prompts`);

  /**
   Analyze code example prompts by tag
   */
  console.log("Code example prompts by tag:");
  type PromptsByTagData = {
    prompts: CodeExamplePrompt[];
    count: number;
    programmingLanguages: Map<string, number>;
  };
  const byTag = new Map<string, PromptsByTagData>();
  codeExamplePrompts.forEach((prompt) => {
    prompt.tags.forEach((tag) => {
      const entry = byTag.get(tag) ?? {
        prompts: [],
        count: 0,
        programmingLanguages: new Map<string, number>(),
      };
      entry.prompts.push(prompt);
      entry.count++;
      if (prompt.programmingLanguage !== "") {
        entry.programmingLanguages.set(
          prompt.programmingLanguage,
          (entry.programmingLanguages.get(prompt.programmingLanguage) ?? 0) + 1
        );
      }
      byTag.set(tag, entry);
    });
  });
  const byTagCsvWriter = createCsvWriter({
    path: `/Users/nlarew/Desktop/analyzeCodeExamplePromptsDataset-byTag-${Date.now()}.csv`,
    header: [
      { id: "tag", title: "Tag" },
      { id: "count", title: "Count" },
      { id: "languages", title: "Programming Languages" },
    ],
  });
  const byTagRecords = Array.from(byTag.entries()).map(([tag, entry]) => ({
    tag,
    count: entry.count,
    languages: Array.from(entry.programmingLanguages.entries())
      .sort((a, b) => b[1] - a[1]) // Sort by count descending
      .map(([language, count]) => `${language} (${count})`)
      .join("\n"),
  }));
  await byTagCsvWriter.writeRecords(byTagRecords);

  /**
   Analyze code example prompts by programming language
   */
  console.log("Code example prompts by programming language:");
  type PromptsByProgrammingLanguageData = {
    prompts: CodeExamplePrompt[];
    count: number;
    tags: Map<string, number>;
  };
  const byProgrammingLanguage = new Map<
    string,
    PromptsByProgrammingLanguageData
  >();
  codeExamplePrompts.forEach((prompt) => {
    const programmingLanguage =
      prompt.programmingLanguage !== ""
        ? prompt.programmingLanguage
        : "NoLanguageSpecified";
    const entry = byProgrammingLanguage.get(programmingLanguage) ?? {
      prompts: [],
      count: 0,
      tags: new Map<string, number>(),
    };
    entry.prompts.push(prompt);
    entry.count++;
    prompt.tags.forEach((tag) => {
      entry.tags.set(tag, (entry.tags.get(tag) ?? 0) + 1);
    });
    byProgrammingLanguage.set(programmingLanguage, entry);
  });
  const byProgrammingLanguageCsvWriter = createCsvWriter({
    path: `/Users/nlarew/Desktop/analyzeCodeExamplePromptsDataset-byProgrammingLanguage-${Date.now()}.csv`,
    header: [
      { id: "language", title: "Programming Language" },
      { id: "count", title: "Count" },
      { id: "tags", title: "Tags" },
    ],
  });
  const byProgrammingLanguageRecords = Array.from(
    byProgrammingLanguage.entries()
  )
    .map(([language, entry]) => ({
      language,
      count: entry.count,
      tags: Array.from(entry.tags.entries())
        .sort((a, b) => b[1] - a[1]) // Sort by count descending
        .map(([tag, count]) => `${tag} (${count})`)
        .join("\n"),
    }))
    .sort((a, b) => b.count - a.count); // Sort by count descending
  await byProgrammingLanguageCsvWriter.writeRecords(
    byProgrammingLanguageRecords
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
