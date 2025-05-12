import { PageStore, SomeTokenizer, chunkMd } from "mongodb-rag-core";
import { encode } from "gpt-tokenizer/model/gpt-4o";
import { OpenAI } from "mongodb-rag-core/openai";

const gpt4oTokenizer: SomeTokenizer = {
  encode(text) {
    return {
      bpe: encode(text, { allowedSpecial: "all" }),
      text: [],
    };
  },
};
export async function synthesizePages({
  pageStore,
  urls,
  openAiClient,
  model,
  topic,
}: {
  pageStore: PageStore;
  urls: string[];
  openAiClient: OpenAI;
  model: string;
  topic: string;
}) {
  const pages = await pageStore.loadPages({
    urls,
  });
  console.log("loaded", pages.length, "page(s)");

  // Note: AI generated...validate correctness
  // Sort pages in place so that the order of the pages is the same as the order of the urls
  const urlToIndex = new Map(urls.map((url, index) => [url, index]));
  pages.sort((a, b) => {
    const aIndex = urlToIndex.get(a.url) ?? -1;
    const bIndex = urlToIndex.get(b.url) ?? -1;
    return aIndex - bIndex;
  });

  // Chunk pages as necessary
  const summaries: { url: string; summary: string }[] = [];
  for (const [idx, page] of Object.entries(pages)) {
    console.log(
      "summarizing",
      page.url,
      `(${parseInt(idx) + 1}/${pages.length})`
    );
    const pageChunks = await chunkMd(page, {
      maxChunkSize: 80000,
      tokenizer: gpt4oTokenizer,
    });
    console.log(pageChunks.length, "chunk(s) for page", page.url);
    const chunkSummaries: string[] = [];
    for (const chunk of pageChunks) {
      const summary = await summarizeContent(
        openAiClient,
        model,
        chunk.text,
        topic
      );
      if (summary !== null) {
        chunkSummaries.push(summary);
      }
    }
    const pageSummary = chunkSummaries.join("\n\n");
    summaries.push({
      url: page.url,
      summary: pageSummary,
    });
  }
  const starter = `You are an expert on ${topic}. Base your answers on the following content:\n\n`;
  return summaries.reduce((acc, curr) => {
    return acc.concat(`---\npage_url: ${curr.url}\n---\n${curr.summary}\n\n`);
  }, starter);
}

const makeSystemPrompt = (
  topic: string,
  percentToInclude = 15
) => `You are an expert technical writer. Your job is to compress the text in the following technical documentation about ${topic} to approximately ${percentToInclude}% its size while preserving as much information as possible.

This text will be used in the prompt of a LLM to answer questions about the product, so precisely adhering to the original text is important.

ONLY respond with the compressed text, no introduction/conclusion statements.

A few things to keep in mind:
1. Keep code examples showing important behaviors, like API usage.
2. This compressed text will be used as part of a guide given to LLMs to use to help them generate code related to this product. 
3. An LLM is the main consumer of the compressed text, not a human.
4. Be mindful to compress the text as much as reasonably possible while still preserving the important information.

Notes on formatting:
1. Format text in Github Flavored Markdown.
2. Use code blocks as relevant (e.g. \`\`\`python\ncode\n\`\`\`).
3. Include a H1 title for each page. (e.g. # My Page Title)

Text to compress in the following message.
`;

async function summarizeContent(
  openAiClient: OpenAI,
  model: string,
  content: string,
  topic: string
) {
  const response = await openAiClient.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: makeSystemPrompt(topic),
      },
      {
        role: "user",
        content,
      },
    ],
    max_completion_tokens: 4000,
    // temperature: 0.0,
    stream: false,
  });

  const summary = response.choices[0].message.content;
  return summary;
}
