import { stripIndent } from "common-tags";
import { OpenAiChatMessage } from "chat-core";
import { GetChatCompletionsOptions } from "@azure/openai";

export const SYSTEM_PROMPT: OpenAiChatMessage = {
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
  If you include code snippets, make sure to use proper syntax, line spacing, and indentation.
  ONLY use code snippets present in the information given to you.
  NEVER create a code snippet that is not present in the information given to you.`,
};

export const ASSISTANT_PROMPT: OpenAiChatMessage = {
  role: "assistant",
  content: "Hello, I'm a MongoDB chatbot. How can I help you today?",
};
export const OPENAI_LLM_CONFIG_OPTIONS: GetChatCompletionsOptions = {
  temperature: 0.3,
  maxTokens: 500,
};

export interface GenerateUserPromptParams {
  question: string;
  chunks: string[];
}

export function GENERATE_USER_PROMPT({
  question,
  chunks,
}: GenerateUserPromptParams): OpenAiChatMessage {
  const context = chunks.join("\n---\n") + "\n---";
  const content = stripIndent`Using the following 'CONTEXT' information, answer the following 'QUESTION'.
  Different pieces of context are separated by "---".

  CONTEXT:
  ${context}

  QUESTION:
  """
  ${question}
  """

  Format answer in Markdown. NEVER include links in your answer.`;
  return { role: "user", content };
}
