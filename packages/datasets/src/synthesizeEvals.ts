import { PageStore, SomeTokenizer, chunkMd } from "mongodb-rag-core";
import { encode } from "gpt-tokenizer/model/gpt-4o";
import { OpenAI } from "mongodb-rag-core/openai";
import { z } from "zod";
import { getOpenAiFunctionResponse } from "./treeGeneration/databaseNlQueries/databaseMetadata/getOpenAiFunctionResponse";
import { PromisePool } from "@supercharge/promise-pool";

const gpt4oTokenizer: SomeTokenizer = {
  encode(text) {
    return {
      bpe: encode(text, { allowedSpecial: "all" }),
      text: [],
    };
  },
};

export const PromptResponseSchema = z.object({
  difficulty: z.enum(["basic", "intermediate", "advanced"]),
  type: z.enum(["question", "code_example"]),
  prompt: z
    .string()
    .describe(
      "A question that can be answered by the content, in markdown format."
    ),
  response: z
    .string()
    .describe(
      "The answer to the question, in markdown format, based only on the provided content."
    ),
});

const functionName = "generate_eval_questions";
const functionDescription =
  "Generate a list of questions and answers (PromptResponse) that can be answered by the provided content. Each item should have a 'prompt' (the question) and a 'response' (the answer), both in markdown format.";

export type PromptResponse = z.infer<typeof PromptResponseSchema>;

export async function synthesizeEvals({
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
  // const generatedEvals: { url: string; evals: PromptResponse[] }[] = [];
  const { results: generatedEvals } = await PromisePool.for(pages)
    .withConcurrency(5)
    .process(async (page, idx) => {
      console.log(
        "generating evals for",
        page.url,
        `(${idx + 1}/${pages.length})`
      );
      const pageChunks = await chunkMd(page, {
        maxChunkSize: 80000,
        tokenizer: gpt4oTokenizer,
      });
      console.log(pageChunks.length, "chunk(s) for page", page.url);
      const chunkEvals: PromptResponse[] = [];
      for (const chunk of pageChunks) {
        const evals = await generateEvals(
          openAiClient,
          model,
          chunk.text,
          topic
        );
        if (evals.length > 0) {
          chunkEvals.push(...evals);
        }
      }
      return {
        url: page.url,
        urlIndex: urlToIndex.get(page.url) ?? -1,
        evals: chunkEvals,
      };
    });
  return generatedEvals;
}

const makeSystemPrompt = (args: {
  topic: string;
}) => `You are an expert technical writer and software engineer. Your job is to analyze text from a technical documentation site about ${args.topic} and then generate a set of questions that can be answered by the content.

These questions will be used to evaluate the ability of an LLM to answer questions about the product, so precisely adhering to the facts presented in the text is important.

ONLY respond with the questions, no introduction/conclusion statements.

You should generate questions at varying levels of difficulty, including:
- Basic questions that can be answered by the content (e.g. "How do I do X?", "Can I do Y?", "What is Z?")
- Questions that require the LLM to reason about the content (e.g. "Does X work with Y?", "What is the difference between X and Y?", "How does this compare to external system Z?")
- Questions that require the LLM to use the content to generate code (e.g. "How do I do X in Python?", "Can you write a script to do Y?", "Show me an example of how to do Z?")

Notes on formatting:
1. Format text in Github Flavored Markdown.
2. Use code blocks as relevant (e.g. \`\`\`python\ncode\n\`\`\`).

The user will provide the text to analyze and generate questions from in the following message.
`;

async function generateEvals(
  openAiClient: OpenAI,
  model: string,
  content: string,
  topic: string
): Promise<PromptResponse[]> {
  const messages = [
    {
      role: "system" as const,
      content: makeSystemPrompt({ topic }),
    },
    // Few-shot example 1
    {
      role: "user" as const,
      content: `MongoDB Atlas is a fully managed cloud database developed by MongoDB, Inc. It provides automated deployment, scaling, and management of MongoDB databases in the cloud. Atlas supports features such as global clusters, automated backups, and advanced security controls.`,
    },
    {
      role: "assistant" as const,
      function_call: {
        name: functionName,
        arguments: JSON.stringify({
          evals: [
            {
              difficulty: "basic",
              type: "question",
              prompt: "What is MongoDB Atlas?",
              response:
                "MongoDB Atlas is a fully managed cloud database service developed by MongoDB, Inc. that automates deployment, scaling, and management of MongoDB databases in the cloud.",
            },
            {
              difficulty: "intermediate",
              type: "question",
              prompt: "What are some features of MongoDB Atlas?",
              response:
                "MongoDB Atlas supports features such as global clusters, automated backups, and advanced security controls.",
            },
            {
              difficulty: "advanced",
              type: "question",
              prompt: "How does MongoDB Atlas handle database scaling?",
              response:
                "MongoDB Atlas provides automated scaling of MongoDB databases in the cloud, allowing resources to be adjusted based on workload requirements.",
            },
          ],
        }),
      },
    },
    // Few-shot example 2
    {
      role: "user" as const,
      content: `To connect to MongoDB Atlas from Python, you can use the PyMongo driver. First, install PyMongo using pip. Then, use the MongoClient class to connect to your cluster using the connection string provided by Atlas.`,
    },
    {
      role: "assistant" as const,
      function_call: {
        name: functionName,
        arguments: JSON.stringify({
          evals: [
            {
              difficulty: "basic",
              type: "question",
              prompt: "How do you connect to MongoDB Atlas from Python?",
              response:
                "You can connect to MongoDB Atlas from Python using the PyMongo driver and the MongoClient class with your Atlas connection string.",
            },
            {
              difficulty: "intermediate",
              type: "code_example",
              prompt:
                "Show an example of connecting to MongoDB Atlas from Python using PyMongo.",
              response:
                "```python\nfrom pymongo import MongoClient\nclient = MongoClient('your_connection_string')\n# Now you can use client to access your database\n```",
            },
          ],
        }),
      },
    },
    // Actual user content
    {
      role: "user" as const,
      content,
    },
  ];
  const schema = z.object({
    evals: z.array(PromptResponseSchema),
  });
  const result = await getOpenAiFunctionResponse({
    messages,
    llmOptions: { openAiClient, model },
    schema,
    functionName,
    functionDescription,
  });
  return result.evals;
}
