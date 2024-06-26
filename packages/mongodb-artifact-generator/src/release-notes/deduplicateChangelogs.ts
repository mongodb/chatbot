import "dotenv/config";
import { assertEnvVars } from "mongodb-rag-core";
import {
  ChatRequestMessage,
  FunctionDefinition,
  OpenAIClient,
} from "@azure/openai";
import { stripIndents } from "common-tags";
import { RunLogger } from "../runlogger";
import { z } from "zod";
import zodToJsonSchema, { JsonSchema7ObjectType } from "zod-to-json-schema";

export type MakeDeduplicateChangelogsArgs = {
  openAiClient: OpenAIClient;
  logger?: RunLogger;
};

export type ChangelogDeduplicator = (args: {
  changelogs: string[];
}) => Promise<string[]>;

export type DeduplicatedChangelogs = z.infer<typeof DeduplicatedChangelogs>;
export const DeduplicatedChangelogs = z.object({
  deduplicatedChangelogs: z
    .array(z.string().describe("A changelog entry for a particular change."))
    .describe(
      "A list of changelog entries that each describe a distinct, indepedendent change. Only one entry per change."
    ),
});

const DeduplicatedChangelogsJsonSchema = zodToJsonSchema(
  DeduplicatedChangelogs,
  {
    name: "DeduplicatedChangelogs",
    nameStrategy: "title",
    markdownDescription: true,
  }
) as JsonSchema7ObjectType;

const deduplicateChangelogsFunc: FunctionDefinition = {
  name: "dedupe-changelogs",
  description:
    "Given a list of changelogs, combine entries that describe the same change into a single entry. Pass the updated list of changelogs to this function.",
  parameters: DeduplicatedChangelogsJsonSchema,
};

export function makeDeduplicateChangelogs({
  openAiClient,
  logger,
}: MakeDeduplicateChangelogsArgs): ChangelogDeduplicator {
  const { OPENAI_CHAT_COMPLETION_DEPLOYMENT } = assertEnvVars({
    OPENAI_CHAT_COMPLETION_DEPLOYMENT: "",
  });

  const makeSystemPrompt = (changelogs: string[]) => stripIndents`
    You deduplicate changelog entries. Each entry describe a change in a software product release.
    You will be given a list of changelog entries. The list may contain multiple entries that describe the same underlying change.
    Your primary task is to find these duplicates and combine them into a single entry that describes the change.
    This information will be used to drive a generative process, so precision is incredibly important.

    <Example>
    Given the following list of changelog entries:

    - "[external addition]: Adds the \`atlas federatedAuthentication federationSettings connectedOrgConfigs list\` command."
    - "[external addition]: Adds the \`atlas federatedAuthentication federationSettings connectedOrgConfigs update\` command."
    - "[external addition]: Adds the \`atlas federatedAuthentication federationSettings identityProvider revokeJwk\` command."
    - "[external addition]: Adds the \`atlas federatedAuthentication federationSettings connectedOrgConfigs delete\` command."
    - "[external addition]: Added new CLI command: \`connectedOrgs config describe\` to describe the configuration of connected organizations within federated authentication settings."
    - "[external addition]: Adds the \`atlas federatedAuthentication federationSettings connectedOrgConfigs describe\` command."
    - "[external addition]: Added new CLI command: \`identityProvider revokeJwk\` to revoke JWK tokens from specified identity providers."

    The deduplicated list of changelog entries would be:

    - "[external addition]: Adds the \`atlas federatedAuthentication federationSettings connectedOrgConfigs list\` command."
    - "[external addition]: Adds the \`atlas federatedAuthentication federationSettings connectedOrgConfigs describe\` command."
    - "[external addition]: Adds the \`atlas federatedAuthentication federationSettings connectedOrgConfigs update\` command."
    - "[external addition]: Adds the \`atlas federatedAuthentication federationSettings connectedOrgConfigs delete\` command."
    - "[external addition]: Adds the \`atlas federatedAuthentication federationSettings identityProvider revokeJwk\` command."
    </Example>

    <Task>
    Deduplicate the following list of changelog entries:
    ${changelogs.map((changelog) => `- "${changelog}"`).join("\n")}
    </Task>
  `;

  return async function deduplicateChangelogs({
    changelogs,
  }: {
    changelogs: string[];
  }): Promise<string[]> {
    const messages = [
      {
        role: "system",
        content: makeSystemPrompt(changelogs),
      },
    ] satisfies ChatRequestMessage[];
    const result = await openAiClient.getChatCompletions(
      OPENAI_CHAT_COMPLETION_DEPLOYMENT,
      messages,
      {
        temperature: 0,
        maxTokens: 1200,
        functions: [deduplicateChangelogsFunc],
        functionCall: {
          name: deduplicateChangelogsFunc.name,
        },
      }
    );
    const response = result.choices[0].message;
    if (response === undefined) {
      throw new Error("No response from OpenAI");
    }
    if (response.functionCall === undefined) {
      throw new Error("No function call in response from OpenAI");
    }
    const { deduplicatedChangelogs } = DeduplicatedChangelogs.parse(
      JSON.parse(response.functionCall.arguments)
    );

    logger?.appendArtifact(
      `chatTemplates/deduplicateChangelogs-${Date.now()}.json`,
      stripIndents`
        <SystemMessage>
          ${messages[0].content}
        </SystemMessage>
        <DeduplicatedChangelogs>
          ${JSON.stringify(deduplicatedChangelogs)}
        </DeduplicatedChangelogs>
      `
    );

    return deduplicatedChangelogs;
  };
}
