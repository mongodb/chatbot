# Context Engineering

This document discusses how to context engineer the [MongoDB Responses API](./responses-api.md) to make the model provide you with an optimal output.

Context engineering (FKA 'prompt engineering') refers to:

> Context engineering is building dynamic systems to provide the right information and tools in the right format such that the LLM can plausibly accomplish the task.
>
> [The rise of "context engineering"](https://blog.langchain.com/the-rise-of-context-engineering/), *LangChain blog*

This guide covers general context engineering best practices in addition to some specific aspects for the MongoDB Responses API.

## GPT-4.1 Prompting Guide

The [GPT-4.1 Prompting Guide](https://cookbook.openai.com/examples/gpt4-1_prompting_guide) is an excellent general reference for prompting and context engineering. The OpenAI team wrote the guide specifically for the GPT-4.1 family of models, though its applicable to all LLMs. The MongoDB Responses API uses GPT-4.1 under the hood, so this guide is particularly applicable.

## Custom Instructions

Providing custom instructions (also known as a 'system prompt') to the model is one of the best ways to modify model behavior to your use case. To set custom instructions, use the `instructions` parameter on Responses API request body:

```ts
import { OpenAI } from "openai";

const openai = new OpenAI({ baseURL: "https://knowledge.mongodb.com/api/v1" });

const instructions = "You are located on the MongoDB Atlas cloud platform. Use that as context to inform your response."

const response = await openai.responses.create({
  model: "mongodb-chat-latest",
  stream: true,
  input: [
    {
      role: "user",
      content: "So what's MongoDB anyways??",
    },
  ],
  // Custom instructions
  instructions
});
```

You can use custom instructions for things like:

1. Contextualizing what the model about where it is and what it should do.
1. Telling the model how to format its output
1. Providing user-specific information to keep in mind
1. How and when the model should use tools
1. Key facts or pieces of knowledge that the model should always consider when responding

A minimal example of combining different forms of custom instructions for a chatbot in Atlas Charts:

```ts

async function makeCustomInstructions(userId: string){

  const role = `You are a chatbot in MongoDB Atlas Charts. You must help the user create Atlas Charts.`

  const outputFormat = `Your responses to the user should be relatively brief and to the point.
  Ask follow-up questions if you do not know how to help them.
  If the user asks to perform an action not supported by your available tools,
  politely let them know that you cannot do that.`;

  const userSpecificInformation = await getUserPreferences(userId)

  // This assumes you have the following custom tools.
  const toolUsage = {
    create_chart: `ALWAYS confirm with the user before creating a chart.`,
    list_charts: `ALWAYS call this before using the 'read_chart' tool to make sure that it has a valid name.`
    read_chart: `ONLY use if very clear from conversation context that this is what you should do, and you have a valid chart name.`
  }

  // This type of prompt info can be useful
  // if you notice that the model is regularly hallucinating
  // in certain contexts.
  const keyInformation = [
    "Charts supports common visualization types including bar, line, area, pie, scatter, and heat map charts, each with specific data requirements",
    "Charts can be embedded in applications using embed codes or shared via public/private URLs, and can be organized into dashboards for better organization",
    "Charts cannot perform real-time data updates - visualizations refresh based on configured intervals, not live streaming",
    "Charts cannot execute custom JavaScript code or connect to external APIs - functionality is limited to MongoDB's aggregation capabilities"
  ]

  // Note that the custom instructions are formatted as XML.
  // See 'Use XML and Markdown' section for more info on this.
  return `<role>
${role}
</role>

<output-format>
${outputFormat}
</output-format>

<user-specific-information>

This information is applicable to only to the current user:
${userSpecificInformation}
</user-specific information>

<tools>
Keep the following in mind when using these tools:

${Object.entries(toolUsage).map(([toolName, toolDescription]) => {
    return `<tool name=${toolName}>
${toolDescription}
</tool>`
}).join("\n\n")}

</tools>

<key-facts>
Use the following information to inform your response:

${keyInformation.map(info => `- ${info}`).join("\n")}
</key-facts>`
}
```

### Use XML and Markdown

To optimize custom instruction adherence with the MongoDB Responses API, format sections using XML tags and Markdown.
You should do this because the MongoDB Responses API already uses both of these formats internally.

Refer to the example in the previous section to see how to use XML and Markdown in custom instructions.

## Custom Tools

Providing the model with custom tools is one of the most powerful levers of context engineering. For more information on custom tools, refer to the [Responses API Custom Tools documentation](./responses-api.md#use-custom-tools).

Use custom tools for the following:

1. Call external code.
   1. More common for user facing applications like chatbots.
   1. Example: Output a configuration object, which is then used to populate the UI with data.
1. Make the model return structured output. 
   1. Since the Responses API is currently used only for user-facing application,
      it is unlikely you will need to only return structured output without subsequently calling external code.

While custom tools can greatly extend the capabilities of your application, they add meaningful complexity. They can also add latency if the model is calling the custom tools before responding to a user. If you do not need to call external code or generate structured data, prefer using custom instructions to custom tools.

### Elicit Internal Retrieval-Augmented Generation Tool Calls

Even if you do not use custom tools, the MongoDB Responses API uses **internal tools** under the hood. These internal tools perform retrieval-augmented generation over a [variety of MongoDB-related data sources](../data-sources.md). In your custom instructions, you can direct the model whether to use these internal tools, your custom tools, or no tool at all. For more information about the Responses API's RAG system, refer to the [Responses API Retrieval-Augmented Generation documentation](./responses-api.md#retrieval-augmented-generation).

The current internal tools are:

1. `search_content`: Searches over MongoDB content for relevant chunks to inform answer.
2. `fetch_page`: Get a full page of Markdown content to inform answers based on a URL.
  1. Note that you must provide a valid URL in our datasources for this to work. If you are interested in using this feature, [contact the Education AI team](../contact.md) to validate your use case.

Generally, the Responses API will call one of these tools as relevant. If you are observing that the API does not call these tools, you can include custom instructions to help elicit your desired behavior. This is more likely to be necessary if you are already including a lot of other custom instructions, custom tools, and/or long and complex user messages. This is because this additional information can overload the model's context to make it 'forget' when to call the internal tools.

You can elicit the Responses API to call one of these tools by simply telling it to in your custom instructions. A minimal example:

```ts
const internalToolInstructions = `Always call the 'search_content' when asked a technical question
that would benefit from getting relevant info from the documentation.`

const fullCustomInstruction `...
...
...lots of other custom instructions
...that may overload the model context window
...and make it forget to call internal tools as relevant
...
...
<important>
${internalToolInstructions}
</important>
`
```

## Evaluation Loop

Context engineering is an iterative process.
It takes time and iteration to craft the optimal context for your application.
Even if you follow the GPT-4.1 Prompting Guide perfectly,
you will almost certainly need to make changes to your prompting and tool calls
to get your application ready for production.

To make sure that your application works the way you expect, you must **evaluate** it.
To learn more about how to evaluate your application using the MongoDB Responses API, refer to the [Evaluation documentation](./evaluation.md).

## Anti-Patterns to Avoid (and What You Should Do Instead)

*We'll update this list as we encounter anti-patterns in actual usage and remedy them.* 

1. **Anti-pattern**: In your custom instructions, do not tell the model to search for specific docs page(s) by providing URLs. The search system is not currently optimized for this, and it can lead to unexpected behavior and slow, expensive responses.
   - **Best Practice**: Include the relevant information from the docs pages in the custom instructions.