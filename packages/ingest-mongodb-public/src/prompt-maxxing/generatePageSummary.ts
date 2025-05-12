import { Page, SomeTokenizer, chunkMd } from "mongodb-rag-core";
import { encode } from "gpt-tokenizer/model/gpt-4o";
import { OpenAI } from "mongodb-rag-core/openai";
import { LlmOptions } from "./LlmOptions";

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

const makeSystemPrompt = (
  topic: string,
  percentToInclude = 15,
  customInstructions?: string
) =>
  `You are an expert technical writer. Your job is to compress the text in the following technical documentation about ${topic} to at most approximately ${percentToInclude}% its size while preserving as much information as possible.

This text will be used in the prompt of a LLM to answer questions about the product, so precisely adhering to the original text is important.

ONLY respond with the compressed text, no introduction/conclusion statements.

<general_guidelines>
1. Keep code examples showing important behaviors, like API usage.
2. This compressed text will be used as part of a guide given to LLMs to use to help them generate code related to this product. 
3. An LLM is the main consumer of the compressed text, not a human.
4. Be mindful to compress the text as much as reasonably possible while still preserving the important information.
5. Skew towards more concise summaries than the ${percentToInclude}% target if you can make a reasonable LLM summary in less than that percentage of the original text.
</general_guidelines>

<formatting_notes>
1. Format text in Github Flavored Markdown.
2. Use code blocks as relevant (e.g. \`\`\`python\ncode\n\`\`\`).
3. Include a H1 title for each page. (e.g. # My Page Title)
</formatting_notes>

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
