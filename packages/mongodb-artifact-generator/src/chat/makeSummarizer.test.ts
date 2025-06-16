import { CORE_ENV_VARS, assertEnvVars } from "mongodb-rag-core";
import { AzureOpenAI } from "mongodb-rag-core/openai";
import { makeSummarizer } from "./makeSummarizer";
import { PromptExamplePair } from "./utils";

const {
  OPENAI_CHAT_COMPLETION_DEPLOYMENT,
  OPENAI_ENDPOINT,
  OPENAI_API_KEY,
  OPENAI_API_VERSION,
} = assertEnvVars(CORE_ENV_VARS);

const openAiClient = new AzureOpenAI({
  apiKey: OPENAI_API_KEY,
  endpoint: OPENAI_ENDPOINT,
  apiVersion: OPENAI_API_VERSION,
});

// TODO: Convert this into a .eval file
describe.skip("makeSummarizer", () => {
  it("creates a summarizer for content", async () => {
    const summarizePoem = makeSummarizer({
      openAi: {
        client: openAiClient,
        model: OPENAI_CHAT_COMPLETION_DEPLOYMENT,
      },
      directions: "The provided content will be a poem.",
      examples: [
        [
          "Two roads diverged in a yellow wood,\nAnd sorry I could not travel both\nAnd be one traveler, long I stood\nAnd looked down one as far as I could\nTo where it bent in the undergrowth;",
          {
            description:
              "A traveler encounters a fork in a road in a forest and reflects on the decision of choosing a path.",
            topics: ["travel", "decisions", "forests", "fork in the road"],
          },
        ],
        [
          "Hope is the thing with feathers\nThat perches in the soul,\nAnd sings the tune without the words,\nAnd never stops at all,",
          {
            description:
              "Hope is described as a bird that lives in the soul, continuously singing a wordless tune.",
            // topics: ["hope", "soul", "birds", "music"],
          },
        ],
        [
          "I wandered lonely as a cloud\nThat floats on high o'er vales and hills,\nWhen all at once I saw a crowd,\nA host, of golden daffodils;",
          {
            descriptionz:
              "A person feels lonely but then finds joy upon seeing a field of daffodils.",
            topics: ["loneliness", "flowers"],
          },
        ],
      ],
    });

    const testCases = [
      [
        "The moon has a face like the clock in the hall;\nShe shines on thieves on the garden wall,\nOn streets and fields and harbor quays,\nAnd birdies asleep in the forks of the trees.",
        {
          description:
            "The moon is compared to a clock, casting its light over different scenes, from thieves to sleeping birds.",
          topics: ["moon", "night", "nature", "light"],
        },
      ],
      [
        "The rose is a rose,\nAnd was always a rose.\nBut the theory now goes\nThat the apple’s a rose,\nAnd the pear is, and so’s\nThe plum, I suppose.",
        {
          description:
            "The poem reflects on the constancy and transformation of things, suggesting all things can be seen as a rose.",
          topics: ["roses", "nature", "change", "metaphor"],
        },
      ],
      [
        "Fog drifts in,\nSoftly, softly,\nBlanketing the world\nIn a whisper.",
        {
          description:
            "A quiet fog moves in, gently covering the surroundings in silence.",
          topics: ["fog", "silence", "nature", "stillness"],
        },
      ],
    ] satisfies PromptExamplePair[];

    for (const [poem, expected] of testCases) {
      // TODO: Make this a better test
      const summary = await summarizePoem({ input: poem });
      expect(summary).toEqual(expected);
    }
  });
});
