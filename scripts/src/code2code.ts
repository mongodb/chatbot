// import { AzureKeyCredential, OpenAIClient } from "@azure/openai";
// import {
//   makeDatabaseConnection,
//   assertEnvVars,
//   CORE_ENV_VARS,
//   makeOpenAiEmbedFunc,
// } from "chat-core";
// import { makeDefaultFindContentFunc, FindContentFunc } from "chat-server";

// import "dotenv/config";

// async function main() {
//   const topic = process.argv[2];
//   if (topic === undefined) {
//     console.error(`Missing argument: topic`);
//     return;
//   }

//   const {
//     MONGODB_CONNECTION_URI: connectionUri,
//     MONGODB_DATABASE_NAME: databaseName,
//     OPENAI_API_KEY: apiKey,
//     OPENAI_EMBEDDING_MODEL_VERSION: apiVersion,
//     OPENAI_EMBEDDING_DEPLOYMENT: deployment,
//     OPENAI_ENDPOINT: baseUrl,
//   } = assertEnvVars(CORE_ENV_VARS);

//   const store = makeDatabaseConnection({
//     connectionUri,
//     databaseName,
//   });

//   try {
//     const findContent = makeDefaultFindContentFunc({
//       embed: makeOpenAiEmbedFunc({
//         apiKey,
//         apiVersion,
//         baseUrl,
//         deployment,
//       }),
//       store,
//       findNearestNeighborsOptions: {
//         k: 25,
//       },
//     });

//     await unidraft({ findContent, topic, generate: makeGenerateFunc() });
//   } finally {
//     await store.close();
//   }
// }

// main();

// async function unidraft({
//   findContent,
//   topic,
//   generate,
// }: {
//   findContent: FindContentFunc;
//   topic: string;
//   generate: GenerateFunc;
// }) {
//   console.log(`Finding content related to ${topic}...`);

//   const { content } = await findContent({
//     query: `About ${topic}`,
//     ipAddress: "::1",
//   });

//   console.log(`Found content: ${content.length}`);
//   content.sort((a, b) => b.score - a.score);

//   console.log(`Creating outline...`);

//   const chat = [
//     `Your task is to create the outline for an online course on the topic "${topic}".
// A course is made of modules. Each module should be between 30 and 60 minutes long. A course should have 4 to 6 modules.
// Use the following information to inform what should be covered in this course outline.
// Don't worry if the information is incomplete. It should give you an idea of what needs to be covered in the outline.
// <Begin additional information>
// ${content.map((chunk) => `- ${chunk.text}`).join("\n\n")}
// <End additional information>
// Now create an outline for an online course that covers this topic in 3-5 modules of 30 minutes each.
// `,
//   ];

//   const outline = await generate(chat);
//   if (!outline) {
//     throw new Error("Could not generate outline for query");
//   }

//   console.log(`Created outline:\n\n${outline}\n`);

//   console.log(`Refining outline...`);

//   chat.push(`Improve the following outline for the online course. Ensure a clear learning path through all topics. Combine or discard modules if necessary. Limit the number of modules to 5; prefer fewer modules if possible.
//     Outline: ${outline}`);

//   const improvedOutline = await generate(chat);

//   console.log(`Refined outline:\n\n${improvedOutline}\n`);

//   console.log(`Generating quiz sample...`);
//   chat.push(
//     `Generate a sample quiz of 3 multiple-choice questions for the second module of this outline. Each question should include 4 options, exactly one of which must be correct.`
//   );

//   const quiz = await generate(chat);

//   console.log(`Quiz sample:\n\n${quiz}`);
// }

// export type GenerateFunc = (messages: string[]) => Promise<string | undefined>;

// function makeGenerateFunc(): GenerateFunc {
//   const { OPENAI_API_KEY, OPENAI_CHAT_COMPLETION_DEPLOYMENT, OPENAI_ENDPOINT } =
//     assertEnvVars(CORE_ENV_VARS);

//   const openAiClient = new OpenAIClient(
//     OPENAI_ENDPOINT,
//     new AzureKeyCredential(OPENAI_API_KEY)
//   );

//   return async (messages) => {
//     const {
//       choices: [choice],
//     } = await openAiClient.getChatCompletions(
//       OPENAI_CHAT_COMPLETION_DEPLOYMENT,
//       messages.map((content) => ({
//         role: "user",
//         content,
//       }))
//     );
//     const { message } = choice;
//     return message?.content ?? undefined;
//   };
// }
