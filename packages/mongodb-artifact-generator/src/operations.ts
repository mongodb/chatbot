import { stripIndents } from "common-tags";
import { GenerateChatCompletion, makeGenerateChatCompletion } from "./chat";
import { systemMessage, userMessage } from "./chat";

export async function summarize({
  generate,
  sourceCode,
}: {
  generate?: GenerateChatCompletion;
  sourceCode: string;
}) {
  generate = generate ?? makeGenerateChatCompletion();
  const analyzeCodeChat = [
    systemMessage(stripIndents`
        Your task is to analyze a provided code snippet and write a succinct
        description of the code's purpose as well as its style and other
        notable choices. Limit your response to 100 words.
      `),
    userMessage(stripIndents`
        Analyze the following code snippet and describe its purpose:

        ${sourceCode}
      `),
  ];

  const analyzeCodeOutput = await generate(analyzeCodeChat);
  if (!analyzeCodeOutput) {
    throw new Error("Could not analyze code");
  }
  return analyzeCodeOutput;
}

export async function summarizePage({
  generate,
  sourcePage,
}: {
  generate?: GenerateChatCompletion;
  sourcePage: string;
}) {
  generate = generate ?? makeGenerateChatCompletion();
  const analyzeCodeChat = [
    systemMessage(stripIndents`
      Your task is to analyze a provided documentation page and write a succinct
      description of the content as well as its style and other notable choices.
      Limit your response to 100 words.
    `),
    userMessage(stripIndents`
      Analyze the following page and describe its contents:

      ${sourcePage}
    `),
  ];

  const analyzeCodeOutput = await generate(analyzeCodeChat);
  if (!analyzeCodeOutput) {
    throw new Error("Could not analyze code");
  }
  return analyzeCodeOutput;
}

export async function translate({
  generate,
  sourceCode,
  sourceDescription,
  targetDescription,
}: {
  generate?: GenerateChatCompletion;
  sourceCode: string;
  sourceDescription?: string;
  targetDescription?: string;
}) {
  generate = generate ?? makeGenerateChatCompletion();
  const translateCodeChat = [
    systemMessage(stripIndents`
      You transform source code files from one programming language into another programming language.
      Assume the provided code is correct.
      Use idiomatic code and style conventions in the tranformed output.
      Output only the transformed code with no additional text.
    `),
    userMessage(stripIndents`
      The source code snippet has the following description:

      ${sourceDescription}

      The desired output has the following description:

      ${targetDescription}

      Here is the source code snippet:

      ${sourceCode}

      Now translate to the desired output. Return only the transformed code with no additional text.`),
  ];

  const output = await generate(translateCodeChat);
  if (!output) {
    throw new Error("Could not generate output for query");
  }
  return output;
}

export async function translatePage({
  generate,
  sourcePage,
  searchResults,
  sourceDescription,
  targetDescription,
}: {
  generate?: GenerateChatCompletion;
  sourcePage: string;
  sourceDescription?: string;
  targetDescription?: string;
  searchResults?: string;
}) {
  generate = generate ?? makeGenerateChatCompletion();
  const translateCodeChat = [
    systemMessage(stripIndents`
      You transform technical documentation pages based on a user's requests. The user will provide the content to transform and a description of the desired output.

      For example, you might translate a documentation page from one programming language to another, or from one platform to another.

      Assume the provided information is correct and do your best to completely and accurately represent all of relevant provided information in your output.

      Use idiomatic suggestions and style conventions in the tranformed output.
    `),
    userMessage(stripIndents`
      ${
        !searchResults
          ? ""
          : stripIndents`
        Here is some helpful context for the page you will be translating:

        ${searchResults}
      `
      }

      This is a description of the original page:

      ${sourceDescription}

      The desired output has the following description:

      ${targetDescription}

      Now translate the following original page text to match desired output. Return only the translated page with no additional text.

      ${sourcePage}
    `),
  ];

  const output = await generate(translateCodeChat);
  if (!output) {
    throw new Error("Could not generate output for query");
  }
  return output;
}

export async function bluehawkify({
  generate,
  sourceCode,
  sourceDescription,
  targetDescription,
}: {
  generate?: GenerateChatCompletion;
  sourceCode: string;
  sourceDescription?: string;
  targetDescription?: string;
}) {
  generate = generate ?? makeGenerateChatCompletion();
  const bluehawkifyChat = [
    systemMessage(stripIndents`
      You transform source code files into unit test files that ensure the behavior of the provided source code.
      The unit test files should include the provided source code rather than importing from another file or otherwise obfuscating the source code.
      Assume the provided code is correct.
      Use idiomatic code and style conventions in the test code.
      Output only the test file code with no additional text.
    `),
    userMessage(stripIndents`
      Adapt the following code snippet into a file that tests the provided source code. Make sure to import the necessary dependencies and declare any necessary types, classes, structs, etc.

      The source code snippet has the following description:

      ${sourceDescription}

      The desired output has the following description:

      ${targetDescription}

      Here is the source code snippet:

      ${sourceCode}

      Now generate the desired output. Return only the code with no additional text.,
    `),
  ];

  console.log("bluehawkifying - here's the chat", bluehawkifyChat);

  const output = await generate(bluehawkifyChat);
  if (!output) {
    throw new Error("Could not bluehawkify");
  }
  return output;
}

export async function generatePage({
  generate,
  searchResults,
  targetDescription,
}: {
  generate?: GenerateChatCompletion;
  searchResults?: string;
  targetDescription?: string;
}) {
  generate = generate ?? makeGenerateChatCompletion();
  const translateCodeChat = [
    systemMessage(stripIndents`
      Generate a new MongoDB documentation page based on the provided description.
    `),
    userMessage(stripIndents`
      ${
        !searchResults
          ? ""
          : stripIndents`
        Here is some helpful context for the page you will be creating:

        ${searchResults}
      `
      }

      The desired output has the following description:

      ${targetDescription}

      Here is a template

      Now create the documentation page matching the desired output. Return only the translated page with no additional text.
    `),
  ];

  const output = await generate(translateCodeChat);
  if (!output) {
    throw new Error("Could not generate output for query");
  }
  return output;
}
