import {
  AzureKeyCredential,
  CORE_ENV_VARS,
  OpenAIClient,
  assertEnvVars,
} from "mongodb-rag-core";
import { Classification, makeClassifier } from "./makeClassifier";

const { OPENAI_ENDPOINT, OPENAI_API_KEY } = assertEnvVars(CORE_ENV_VARS);

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

const openAiClient = new OpenAIClient(
  OPENAI_ENDPOINT,
  new AzureKeyCredential(OPENAI_API_KEY)
);

jest.setTimeout(10000);

describe("makeClassifier", () => {
  it("creates an LLM-driven classifier function for user-defined classes", async () => {
    const classifyIsHotdog = makeClassifier({
      openAiClient,
      classificationTypes: hotdogClassificationTypes,
    });
    const results: string[] = [];
    for (const input of hotdogInputs) {
      const result = await classifyIsHotdog({ input });
      results.push(result.type);
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
    });
    const results: Classification[] = [];
    for (const input of hotdogInputs) {
      const result = await classifyIsHotdog({ input });
      results.push(result);
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
