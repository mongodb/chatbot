import {
  createConfiguredAction,
  withConfig,
  withConfigOptions,
} from "../withConfig";
import { createCommand } from "../createCommand";
import { stripIndents } from "common-tags";
// import { makeFindContent } from "../vectorSearch";
import { makeGenerateChatCompletion } from "../chat";
import { generatePage, rewriteAsRst, summarizePage } from "../operations";
import { makeRunLogger, type RunLogger } from "../runlogger";
import {
  TdbxContentTypeId,
  importTdbxContentTypes,
  tdbxContentTypeIds,
} from "../tdbxContentTypes";

let logger: RunLogger;

type GenerateDocsPageCommandArgs = {
  runId?: string;
  targetDescription: string;
  template?: TdbxContentTypeId;
};

export default createCommand<GenerateDocsPageCommandArgs>({
  command: "generateDocsPage",
  builder(args) {
    return withConfigOptions(args)
      .option("runId", {
        type: "string",
        demandOption: false,
        description: "A (hopefully unique) name for the run.",
      })
      .option("targetDescription", {
        type: "string",
        demandOption: true,
        description: "A text description of the desired output.",
      })
      .option("template", {
        type: "string",
        choices: tdbxContentTypeIds,
        demandOption: true,
        description: "One of the TDBX content types.",
      });
  },
  async handler(args) {
    logger = makeRunLogger({ topic: "generateDocsPage", runId: args.runId });
    logger.logInfo(`Running command with args: ${JSON.stringify(args)}`);
    const result = await withConfig(action, args);
    logger.logInfo(`Success`);
    await logger.flushArtifacts();
    await logger.flushLogs();
    return result;
  },
  describe: "Generate a new documentation page based on a prompt.",
});

export const action = createConfiguredAction<GenerateDocsPageCommandArgs>(
  async ({ pageStore }, { targetDescription, template }) => {
    logger.logInfo(`Setting up...`);
    const generate = makeGenerateChatCompletion();
    // const { findContent, cleanup: cleanupFindContent } = makeFindContent({
    //   embedder,
    //   embeddedContentStore,
    //   findNearestNeighborsOptions: {
    //     k: 3,
    //     minScore: 0.85,
    //   },
    // });

    try {
      // console.log(`Analyzing page...`);
      // const analyzePageOutput = await summarizePage({
      //   generate,
      //   sourcePage,
      // });
      // console.log(`Input analysis:\n\n${analyzePageOutput}\n`);

      console.log(`Finding Relevant Content...`);
      // Find content in the existing off-site docs if we have them
      // e.g. if the target is C++ then we'd want to find content from https://mongocxx.org
      // e.g. if the target is PHP then we'd want to find content from https://www.mongodb.com/docs/php-library/current/
      // const { content } = await findContent({
      //   // query: "How does the driver version API and ABI?",
      //   query: analyzePageOutput,
      // });
      // Log the search results
      // TODO: run the search results through a preprocessor that summarizes them in a useful way for this process
      // const searchResults = stringifyVectorSearchChunks(content).join("\n");
      // console.log(searchResults);
      // console.log(`Logged ${searchResults.length} search result chunks`);

      const contentTypes = await importTdbxContentTypes();
      const pageTemplate = contentTypes.find((ct) => ct.type === template);
      // const pageTemplate = {
      //   type: "quick-start",
      //   name: "Quick Start",
      //   objectives: [
      //     "Help readers set up a sample development environment that accomplishes a specific goal – usually establishing a connection and running a command – to be able to observe the results.",
      //   ],
      //   pageStructure:
      //     "===========\nQuick Start\n===========\n\nIdentify what the content of the page shows. Refer to related resources if they landed in the wrong place.\n\nDefine any terms that a new user may not be familiar with (e.g. MongoDB driver, MongoDB Atlas, etc.)\n\nExplain what the rest of the page demonstrates.\n\n<Setup/Requirements>\n--------------------\n\nProvide steps required to set up a project or development environment including installation of dependencies or setting them up using a build tool.\n\n<Optional Atlas Setup>\n----------------------\n\nIf the project can be run using a free tier MongoDB Atlas cluster, provide instructions on setup. Add steps for loading sample data if required.\n\n<Additional Instructions>\n-------------------------\n\nProvide steps for any other instructions and code examples to achieve the goal of the tutorial. \n\nEach enumerated step is presented in the recommended/essential order to complete the task. Each step should have a title that describes the task. Each step description should provide instructions on how to complete that task and verify success.\n\nDescribe what the developer accomplished at the completion of the tutorial.\n\nNext Steps\n----------\n\nRecommend next steps in the learning journey.\n",
      //   examples: [
      //     "https://www.mongodb.com/docs/drivers/node/v5.7/quick-start/",
      //   ],
      // };
      // console.log("pageTemplate.examples", pageTemplate?.examples);
      const exampleRegexes =
        pageTemplate?.examples.map((example) => new RegExp(example)) ?? [];
      const templateExamplePages = pageTemplate?.examples
        ? await pageStore.loadPages({
            query: {
              $or: exampleRegexes.map((regex) => ({
                url: { $regex: regex, $options: "i" },
              })),
            },
          })
        : [];
      logger.logInfo(
        `Found ${
          templateExamplePages.length
        } templateExamplePages: [${templateExamplePages
          .map((p) => `"${p.url}"`)
          .join(", ")}]`
      );
      // for (const [i, example] of Object.entries(templateExamplePages)) {
      //   logger.logInfo(`templateExamplePages ${i}: ${JSON.stringify(example)}`);
      // }
      const maxTemplateExamplePages = 3;
      logger.logInfo(
        `Limiting to ${maxTemplateExamplePages} templateExamplePages`
      );
      const templateExamples = templateExamplePages
        .slice(0, maxTemplateExamplePages)
        .map((page) => page.body);

      logger.logInfo(`Generating page...`);
      const transformed = await generatePage({
        generate,
        targetDescription: stripIndents`
            A new documentation page covering topic(s) and using a content type specified by the user.

            The new page should use the following template:

            Page Objectives:
            ${" - " + pageTemplate?.objectives.join("\n - ")}

            Page Structure:
            ${pageTemplate?.pageStructure ?? "None provided."}

            Examples:
            ${templateExamples.join("\n\n")}

            ${
              !targetDescription
                ? ""
                : stripIndents`
              The user provided the following description of the desired output:

              ${targetDescription}
            `
            }
          `,
      });

      console.log(`Created output:\n\n${transformed}\n`);
      const pageSummary = await summarizePage({
        generate,
        sourcePage: transformed,
      });
      const rstVersion = await rewriteAsRst({
        page: transformed,
        pageSummary,
      });
      console.log("writing");
      logger.appendArtifact("output.md", transformed);
      logger.appendArtifact("output.rst", rstVersion);
      console.log("written");
    } finally {
      // await cleanupFindContent();
    }
  }
);
