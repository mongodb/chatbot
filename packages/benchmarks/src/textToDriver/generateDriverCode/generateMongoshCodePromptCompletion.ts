import { generateText, LanguageModelV1 } from "ai";
import {
  DatabaseInfo,
  executeMongoshQuery,
  extractCodeFromMarkdown,
  LlmOptions,
} from "mongodb-rag-core/executeCode";
import {
  chainOfThoughtConsiderations,
  mongoshBaseSystemPrompt,
  mongoshSystemPromptGeneralInstruction,
} from "./languagePrompts/mongosh";
import { TextToDriverEvalTask, TextToDriverOutput } from "../TextToDriverEval";
import {
  makeDatabaseInfoPrompt,
  SchemaStrategy,
} from "./makeDatabaseInfoPrompt";

export const markdownPromptFormatting = `Format your output in a Markdown code block as such:
\`\`\`mongosh
<your code here>
\`\`\`

Only include a single code block in your response.`;

export const chainOfThoughtPrompt = `Write some thoughts about the query strategy before providing the code. ${chainOfThoughtConsiderations}

For example:

<your query plan here>

\`\`\`mongosh
<your code here>
\`\`\``;

export const nlQuerySystemPrompt = `${mongoshBaseSystemPrompt}

${markdownPromptFormatting}
`;

export const nlQuerySystemPromptCoT = `${mongoshBaseSystemPrompt}

${chainOfThoughtPrompt}

${markdownPromptFormatting}
`;

/**
  Maximally lazy prompting strategy.
 */
export const nlQuerySystemPromptLazy = `${mongoshSystemPromptGeneralInstruction}

${markdownPromptFormatting}
`;

export type SystemPromptStrategy = "chainOfThought" | "lazy" | "default";

export interface MakeGenerateMongoshCodePromptCompletionParams {
  uri: string;
  databaseInfos: Record<string, DatabaseInfo>;
  openai: LanguageModelV1;
  llmOptions: Omit<LlmOptions, "openAiClient">;
  schemaStrategy: SchemaStrategy;
  systemPromptStrategy?: SystemPromptStrategy;
}

/**
  Generates a MongoDB Shell (mongosh) query and executes it.
  Uses prompt-completion to generate the code.
 */
export function makeGenerateMongoshCodePromptCompletionTask({
  uri,
  databaseInfos,
  openai,
  llmOptions,
  schemaStrategy = "annotated",
  systemPromptStrategy = "default",
}: MakeGenerateMongoshCodePromptCompletionParams): TextToDriverEvalTask {
  const systemPrompt =
    systemPromptStrategy === "chainOfThought"
      ? nlQuerySystemPromptCoT
      : systemPromptStrategy === "lazy"
      ? nlQuerySystemPromptLazy
      : nlQuerySystemPrompt;
  const generateMongoshCodePromptCompletion: TextToDriverEvalTask =
    async function generateMongoshCodePromptCompletion({
      databaseName,
      nlQuery,
    }) {
      const { text } = await generateText({
        temperature: llmOptions.temperature ?? undefined,
        seed: llmOptions.seed ?? undefined,
        maxTokens:
          llmOptions.max_tokens ??
          llmOptions.max_completion_tokens ??
          undefined,
        model: openai,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: `Generate MongoDB Shell (mongosh) queries for the following database and natural language query:

${await makeDatabaseInfoPrompt(databaseInfos[databaseName], schemaStrategy)}

Natural language query: ${nlQuery}`,
          },
        ],
      });

      const codeBlock = extractCodeFromMarkdown(text);
      const execution = await executeMongoshQuery({
        databaseName,
        query: codeBlock,
        uri,
      });
      return {
        execution,
        generatedCode: codeBlock,
      } satisfies TextToDriverOutput;
    };
  return generateMongoshCodePromptCompletion;
}
