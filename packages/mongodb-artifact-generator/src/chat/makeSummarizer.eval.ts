import { Eval, EvalCase, traced, EvalScorer } from "braintrust";
import { PromptExamplePair } from "./utils";
import { makeSummarizer } from "./makeSummarizer";
import {
  assertEnvVars,
  AzureKeyCredential,
  OpenAIClient,
} from "mongodb-rag-core";

interface SummarizerEvalCaseInput {
  text: string;
}
type SummarizerEvalCase = EvalCase<
  SummarizerEvalCaseInput,
  unknown,
  unknown
> & {
  name: string;
};

const poems = [
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

const { OPENAI_ENDPOINT, OPENAI_API_KEY, OPENAI_CHAT_COMPLETION_DEPLOYMENT } =
  assertEnvVars({
    OPENAI_ENDPOINT: "",
    OPENAI_API_KEY: "",
    OPENAI_CHAT_COMPLETION_DEPLOYMENT: "",
  });

const summarizePoem = makeSummarizer({
  openAi: {
    client: new OpenAIClient(
      OPENAI_ENDPOINT,
      new AzureKeyCredential(OPENAI_API_KEY)
    ),
    deployment: OPENAI_CHAT_COMPLETION_DEPLOYMENT,
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
        topics: ["hope", "soul", "birds", "music"],
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

Eval("mongodb-artifact-generator/chat/summarizer", {
  experimentName: "summarizer-poetry",
  metadata: {
    description:
      "Evaluates how well the MongoDB Artifact Generator summarizer works on poetry",
  },
  maxConcurrency: 2,
  data: async () => {
    return poems.map(([text, expected]) => {
      return {
        name: `summarizes poem: ${expected.description}`,
        input: { text },
        expected,
        metadata: null,
      } satisfies SummarizerEvalCase;
    });
  },
  task: async (input) => {
    return traced(
      async () => {
        const summary = await summarizePoem({ input: input.text });
        return summary;
      },
      {
        name: "summarizePoem",
      }
    );
  },
  scores: [
    // TODO: Add a scorer
  ],
});
