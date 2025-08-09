import dotenv from "dotenv";
import { AzureOpenAI } from "mongodb-rag-core/openai";
import { PromisePool } from "@supercharge/promise-pool";

dotenv.config();

type FewShotExample = {
  input: string;
  output: string;
};

// Add your few-shot examples here. Keep them concise and style-aligned.
const FEW_SHOT_EXAMPLES: FewShotExample[] = [
  {
    input: "can we migrate data from commmunity edition to enterprise edition?",
    output:
      "How do I migrate data from MongoDB Community Edition to MongoDB Enterprise Edition?",
  },
  {
    input: "can we use mongodb atlas sql odbc driver with mongo v7",
    output:
      "Can I use the MongoDB Atlas SQL ODBC Driver with MongoDB version 7?",
  },
  {
    input:
      "can we use single srv connection string in case of multi-region private link",
    output:
      "Can I use a single MongoDB srv connection string for a multi-region cluster with private link?",
  },
  {
    input: "does atlas use mongodump or take a file system backup?",
    output: "Does MongoDB Atlas use mongodump or take a file system backup?",
  },
];

const INPUTS: string[] = [
  "does compact  command block writes and read on a collection and is performance degrade while compact is running",
  "does mongodb server restart create new connection pool?",
  "how can i downgrade my atlas cluster",
  "how can i view the performance metrics of online archive?",
  "how do i make our compass database string access more secure",
  "how do i set up an initial subscription?",
  "how does clsuter auto scaling and storage work",
  "how does ops manager capture backups for deployments using fcv 4.2 and later?",
  "how many collections will be created in the logical db of one replicaset?",
  "how many snapshot per policy",
  "how migrate specific cluster database to new cluster",
  "how mongodb uses memory",
  "how much oplog  storage is needed in ops manager",
  "how shrink database size in mongodb",
  "how to add labels in cluster",
  "how to audit queries run in data explorer",
  "how to avoid rollback",
  "how to cancel our developer support",
  "how to check collection for last access date",
  "how to check long running queries",
  "how to check operational metrics in mongodb cluster",
  "how to check support subscription",
  "how to configure azure service principal in atlas",
  "how to connect private endpoint",
  "how to disable tls for a replicaset via ops manager",
  "how to enable a set of alerts for all projects being created in an ops manager organization",
  "how to enable autocompact in atlas",
  "how to enable replica for read operations",
  "how to establish connect from atlas mongodb to gcp cloud",
  "how to find connection string for cluster",
  "how to find if it's a full or incr backup that is running right now via ops manager?",
  "how to find the ip address of replica set",
  "how to get back from global shard cluster to normal replica set cluster",
  "how to handle failover errors",
  "how to improve initial syncprocess",
  "how to investigate data loss due to collection deletion on shared clusters",
  "how to know which collection utilize more connections",
  "how to manage socket exception in mongodb atlas",
  "how to migrate in mongodb version 8.0",
  "how to monitor disk in warming state",
  "how to move mongodb deployment cluster project from ops manger 4.2 to ops maanger 7.0",
  "how to optimize ram on the cluster",
  "how to raise a case for enterprise advanced",
  "how to reduce the ram usage on mongodb?",
  "how to rename a mongodb replica set",
  "how to repair  corruption in mongodb collection",
  "how to restore a specific database or collection from an atlas snapshot",
  "how to restore data onlinbe archive",
  "how to run mongosync in background?",
  "how to speed up restores",
  "i want to create a case",
  "i want to have metrics for my clusters",
  "i want to learn monitoring for my cluster and about the indexes and query also in the detailed",
  "i want to review the database whether its functioning well or not",
  "i want to understand how cloud backup costs are calculated. i see that i am billed for 1200 gb of data",
  "is atlas connection secured with tls by default",
  "is mongodb data encryption at rest enabled in default?",
  "is my cluster safe to downscale",
  "is there any impact on the cluster if we delete a index",
  "what cloud manager or ops manager alerts should i configure to monitor my deployment",
  "what could happen if the ops manager backup database is a standalone node?",
  "what happens if we don't run flushclusterconfig before upgrading a mongodb sharded cluster from 5.0 to  6.0",
  "what happens of ocsp server not avaialble",
  'what is meaning metric "wiredtiger.cache.bytes dirty in the cache cumulative"?',
  "what is source of data from billing invoices and dashboards?",
  "what is the impact of upcoming change to ip connectivity for mongodb atlas",
  "where does atlas stores slow query logs",
  "where to download 8.0?",
  "where we can reduce the instnace size and save cost in the atlas",
  "which compound indexes can i remove from: ```@compoundindex(name = \"createddate_eventtype\", def = \"{'createddate' : 1, 'eventtype': 1}\") @compoundindex(name = \"createddate_eventtype_status_sellerid\", def = \"{'createddate': 1, 'eventtype' : 1, 'status': 1, 'sellerid': 1}\") @compoundindex(name = \"eventtype_status_createddate\", def = \"{'eventtype' : 1, 'status': 1, 'createddate': 1}\")```",
  "whitelist the control plane ip addresses in azure keyvault",
  "why does node go into rollback during election",
];

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function _getAzureResourceName(): string {
  const explicit = process.env["OPENAI_RESOURCE_NAME"];
  if (explicit && explicit.trim() !== "") {
    return explicit.trim();
  }
  const endpointRaw = process.env["OPENAI_ENDPOINT"];
  if (!endpointRaw || endpointRaw.trim() === "") {
    throw new Error(
      "Missing required environment variable: OPENAI_RESOURCE_NAME (or provide OPENAI_ENDPOINT to derive it)"
    );
  }
  // Normalize minor mistakes like missing colon in https://
  const normalized = endpointRaw.replace(/^https\/\//, "https://");
  let url: URL;
  try {
    url = new URL(normalized);
  } catch (e) {
    throw new Error(
      `Invalid OPENAI_ENDPOINT. Expected a full https URL like https://<resource>.openai.azure.com; received: ${endpointRaw}`
    );
  }
  const host = url.hostname; // e.g. docs-ai-chatbot-useast2resource-sandbox.openai.azure.com
  const parts = host.split(".");
  if (parts.length < 4 || !host.endsWith(".openai.azure.com")) {
    throw new Error(
      `OPENAI_ENDPOINT host does not look like an Azure OpenAI endpoint: ${host}`
    );
  }
  return parts[0];
}

function buildPrompt(input: string, examples: FewShotExample[]): string {
  const guidelines = [
    "Rewrite the input as a single, well-formed question.",
    "The question should clearly reference MongoDB. If necessary, add the word 'MongoDB' to the question.",
    "Use American English, correct capitalization, and end with a question mark.",
    "Preserve the user's intent and technical meaning.",
    "Be concise but complete.",
    "Do not add information not implied by the input.",
    "Output only the rewritten question with no quotes or extra text.",
  ];

  const examplesStr =
    examples.length > 0
      ? `\nExamples:\n${examples
          .map((e) => `Input: ${e.input}\nOutput: ${e.output}`)
          .join("\n\n")}`
      : "";

  return `You transform terse user phrases into clean questions.\n\nGuidelines:\n- ${guidelines.join(
    "\n- "
  )}${examplesStr}\n\nInput: ${input}\nOutput:`;
}

async function rewriteOneWithAzureChat(
  client: AzureOpenAI,
  deployment: string,
  input: string
): Promise<string> {
  const prompt = buildPrompt(input, FEW_SHOT_EXAMPLES);
  const resp = await client.chat.completions.create({
    model: deployment,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
    max_tokens: 64,
  });
  const text = resp.choices[0]?.message?.content ?? "";
  return text.trim();
}

async function main() {
  const apiKey = requireEnv("OPENAI_API_KEY");
  const endpoint = requireEnv("OPENAI_ENDPOINT");
  const apiVersion = requireEnv("OPENAI_API_VERSION");
  const deployment = requireEnv("OPENAI_CHAT_COMPLETION_DEPLOYMENT");

  const client = new AzureOpenAI({ apiKey, endpoint, apiVersion });

  const rewritten = await PromisePool.withConcurrency(10)
    .for(INPUTS)
    .process(async (input, i) => {
      const output = await rewriteOneWithAzureChat(client, deployment, input);
      return { input, output };
    });

  // Output only the rewritten list (JSON array) for easy downstream use
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(rewritten, null, 2));
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
