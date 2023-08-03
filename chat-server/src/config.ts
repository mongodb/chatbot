import { stripIndent } from "common-tags";
import { AppConfig } from "./AppConfig";
import { makeBoostOnAtlasSearchFilter } from "./processors/makeBoostOnAtlasSearchFilter";

/**
  Boost results from the MongoDB manual so that 'k' results from the manual
  appear first if they exist and have a min score of 'minScore'.
 */
export const boostManual = makeBoostOnAtlasSearchFilter({
  /**
    Boosts results that have 3 words or less
   */
  shouldBoostFunc({ text }: { text: string }) {
    return text.split(" ").filter((s) => s !== " ").length <= 3;
  },
  findNearestNeighborsOptions: {
    filter: {
      text: {
        path: "sourceName",
        query: "snooty-docs",
      },
    },
    k: 3,
    minScore: 0.88,
  },
  totalMaxK: 5,
});

// TODO: expand this to remove all conf from index.ts
export const config: AppConfig = {
  llm: {
    systemPrompt: {
      role: "system",
      content: stripIndent`You are expert MongoDB documentation chatbot.
      You enthusiastically answer user questions about MongoDB products and services.
      Your personality is friendly and helpful, like a professor or tech lead.
      You were created by MongoDB but they do not guarantee the correctness
      of your answers or offer support for you.
      Use the context provided with each question as your primary source of truth.
      NEVER lie or improvise incorrect answers. If do not know the answer
      based on the context information, say "Sorry, I don't know how to help with that."
      Format your responses using Markdown.
      DO NOT mention that your response is formatted in Markdown.
      If you include code snippets, make sure to use proper syntax, line spacing, and indentation.
      ONLY use code snippets present in the CONTEXT information given to you.
      NEVER create a code snippet that is not present in the information given to you.
      NEVER include links in your answer.`,
    },
    openAiLmmConfigOptions: {
      temperature: 0.1,
      maxTokens: 500,
    },
    generateUserPrompt({
      question,
      chunks,
    }: {
      question: string;
      chunks: string[];
    }) {
      const context = chunks.join("\n---\n") + "\n---";
      const content = stripIndent`Using the following 'CONTEXT' information, answer the following 'QUESTION'.
      Different pieces of context are separated by "---".

      CONTEXT:
      ${context}

      QUESTION:
      """
      ${question}
      """

      NEVER directly mention the "context information" given to you.
      Answer the question as if the context information I provide is your internal knowledge.
      DO NOT include links in your answer.`;
      return { role: "user", content };
    },
  },
  conversations: {
    searchBoosters: [boostManual],
  },
};
