export const listExamplesInPrompt = (topics: string[]) =>
  topics.map((topic, i) => `${i + 1}. ${topic}`).join("\n");
