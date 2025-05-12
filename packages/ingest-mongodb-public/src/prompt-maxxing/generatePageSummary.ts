import { Page, SomeTokenizer, chunkMd } from "mongodb-rag-core";
import { encode } from "gpt-tokenizer/model/gpt-4o";
import { OpenAI } from "mongodb-rag-core/openai";
import { LlmOptions } from "./LlmOptions";
import { makeBulletPrompt } from "./makeBulletPrompt";

const gpt4oTokenizer: SomeTokenizer = {
  encode(text) {
    return {
      bpe: encode(text, { allowedSpecial: "all" }),
      text: [],
    };
  },
};
export function makeGeneratePageSummary({
  openAiClient,
}: {
  openAiClient: OpenAI;
}) {
  return async function generatePageSummary({
    page,
    topic,
    maxChunkSize = 80000,
    percentToInclude = 15,
    options,
    customInstructions,
  }: {
    page: Page;
    topic: string;
    customInstructions?: string;
    maxChunkSize?: number;
    percentToInclude?: number;
    options: LlmOptions;
  }) {
    const pageChunks = await chunkMd(page, {
      maxChunkSize: maxChunkSize,
      tokenizer: gpt4oTokenizer,
    });
    const chunkSummaries: string[] = [];
    for (const chunk of pageChunks) {
      const summary = await summarizeContent({
        openAiClient,
        content: chunk.text,
        topic,
        customInstructions,
        percentToInclude,
        options,
      });
      if (summary !== null) {
        chunkSummaries.push(summary);
      }
    }
    const pageSummary = chunkSummaries.join("\n\n");
    return pageSummary;
  };
}

const generalGuidelines = [
  "Prioritize actionable content: steps, code examples (with language identifiers), API usage, configuration, command syntax.",
  "Crucial details MUST be preserved: required parameters, flags, error conditions, security notes, configuration steps.",
  "This compressed text will be used as part of a guide given to LLMs to use to help them generate code related to this product.",
  "An LLM is the main consumer of the compressed text, not a human. Write for LLM consumption.",
  "Be mindful to compress the text as much as reasonably possible while still preserving the important information.",
  "Use concise language that maximizes information density while maintaining clarity.",
  "Skew towards more concise summaries than the target percentage if you can make a reasonable LLM summary in less than that percentage of the original text.",
  "Only maintain the most important markdown headings",
];

const whatToAvoid = [
  "Avoid marketing language, subjective statements, and overly verbose conceptual explanations.",
  "Avoid explanations of why a feature exists (unless critical)",
  "Avoid repetition of information already present in structured elements (like parameters described in a table).",
];

const formattingNotes = [
  "Format text in Github Flavored Markdown.",
  "Use code blocks as relevant (e.g. ```python\ncode\n```).",
  "Include a H1 title for each page. (e.g. # My Page Title)",
];

const makeSystemPrompt = (
  topic: string,
  percentToInclude = 15,
  customInstructions?: string
) =>
  `You are an expert technical writer. Your job is to compress the text in the following technical documentation about ${topic} to at most approximately ${percentToInclude}% its size while preserving as much information as possible.

This text will be used in the prompt of a LLM to answer questions about the product, so precisely adhering to the original text is important.

ONLY respond with the compressed text, no introduction/conclusion statements.

<general_guidelines>
${makeBulletPrompt(generalGuidelines)}
</general_guidelines>

<formatting_notes>
${makeBulletPrompt(formattingNotes)}
</formatting_notes>

<what_to_avoid>
${makeBulletPrompt(whatToAvoid)}
</what_to_avoid>

${
  customInstructions
    ? `<custom_instructions>
${customInstructions}
</custom_instructions>
`
    : ""
}

Again, make sure to adhere to the summarization of approximately ${percentToInclude}% of the original text. 

Text to compress in the following message.
`
    .trim()
    // replace multiple newlines with double newlines
    .replace(/\n\n+/g, "\n\n");

async function summarizeContent({
  openAiClient,
  content,
  topic,
  percentToInclude,
  options,
  customInstructions,
}: {
  openAiClient: OpenAI;
  content: string;
  topic: string;
  customInstructions?: string;
  percentToInclude: number;
  options: LlmOptions;
}) {
  const response = await openAiClient.chat.completions.create({
    ...options,
    model: options.model ?? "gpt-4o",
    messages: [
      {
        role: "system",
        content: makeSystemPrompt(topic, percentToInclude, customInstructions),
      },
      {
        role: "user",
        content,
      },
    ],
    max_completion_tokens: 4000,
    stream: false,
  });

  const summary = response.choices[0].message.content;
  return summary;
}
