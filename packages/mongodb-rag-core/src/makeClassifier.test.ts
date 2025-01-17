import { assertEnvVars } from "./assertEnvVars";
import { CORE_OPENAI_CHAT_COMPLETION_ENV_VARS } from "./CoreEnvVars";
import { Classification, makeClassifier } from "./makeClassifier";
import { AzureOpenAI } from "./openai";

const {
  OPENAI_ENDPOINT,
  OPENAI_API_KEY,
  OPENAI_API_VERSION,
  OPENAI_CHAT_COMPLETION_DEPLOYMENT,
} = assertEnvVars(CORE_OPENAI_CHAT_COMPLETION_ENV_VARS);

const hotdogInputs = [
  "A New York-style hotdog with sauerkraut and mustard",
  "A top cut bun with a ballpark frank inside",
  "A hamburger",
  "A hotdog bun with no sausage",
  "MongoDB Atlas",
  "A bratwurst in a hoagie roll",
  "Mozzarella sticks and marinara in a large hotdog bun",
];

const hotdogClassificationTypes = [
  {
    type: "hotdog",
    description:
      "A hotdog is a sausage (either vienna or frankfurter) with a uniform interior, with or without casing, often served as a sandwich in the slit of a partially sliced soft roll.",
    examples: [
      {
        text: "A top cut bun with a ballpark frank inside",
        reason: "This is a classic example of a hotdog.",
      },
    ],
  },
  {
    type: "not_hotdog",
    description: "Not a hotdog",
    examples: [
      {
        text: "A hamburger",
        reason: "This is not a hotdog.",
      },
      {
        text: "A hotdog bun with no sausage",
        reason: "This is not a hotdog.",
      },
      {
        text: "A bratwurst in a split top bun",
        reason:
          "This resembles a hot dog but the sausage is not vienna or frankfurter.",
      },
      {
        text: "MongoDB Atlas",
        reason:
          'While it might make you say "hot dog!", it is, in fact, cloud software and thus not a hotdog.',
      },
    ],
  },
];

const openAiClient = new AzureOpenAI({
  apiKey: OPENAI_API_KEY,
  endpoint: OPENAI_ENDPOINT,
  apiVersion: OPENAI_API_VERSION,
});

jest.setTimeout(10000);

describe("makeClassifier", () => {
  it("creates an LLM-driven classifier function for user-defined classes", async () => {
    const classifyIsHotdog = makeClassifier({
      openAiClient,
      classificationTypes: hotdogClassificationTypes,
      model: OPENAI_CHAT_COMPLETION_DEPLOYMENT,
    });
    const results: string[] = [];
    for (const input of hotdogInputs) {
      const result = await classifyIsHotdog({ input });
      results.push(result.classification.type);
    }
    expect(results).toEqual([
      "hotdog",
      "hotdog",
      "not_hotdog",
      "not_hotdog",
      "not_hotdog",
      "not_hotdog",
      "not_hotdog",
    ]);
  }, 10000);

  it("supports chain-of-thought classification", async () => {
    const classifyIsHotdog = makeClassifier({
      openAiClient,
      classificationTypes: hotdogClassificationTypes,
      chainOfThought: true,
      model: OPENAI_CHAT_COMPLETION_DEPLOYMENT,
    });
    const results: Classification[] = [];
    for (const input of hotdogInputs) {
      const result = await classifyIsHotdog({ input });
      results.push(result.classification);
    }
    const resultTypes = results.map((r) => r.type);
    expect(resultTypes).toEqual([
      "hotdog",
      "hotdog",
      "not_hotdog",
      "not_hotdog",
      "not_hotdog",
      "not_hotdog",
      "not_hotdog",
    ]);
    for (const result of results) {
      expect(result.reason).toBeDefined();
    }
  }, 40000);
});
