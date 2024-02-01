import {
  AzureKeyCredential,
  CORE_ENV_VARS,
  OpenAIClient,
  assertEnvVars,
} from "mongodb-rag-core";
const { OPENAI_CHAT_COMPLETION_DEPLOYMENT, OPENAI_ENDPOINT, OPENAI_API_KEY } =
  assertEnvVars(CORE_ENV_VARS);
it("sees what happens when stream function call", async () => {
  const openAiClient = new OpenAIClient(
    OPENAI_ENDPOINT,
    new AzureKeyCredential(OPENAI_API_KEY)
  );
  const stream = await openAiClient.streamChatCompletions(
    OPENAI_CHAT_COMPLETION_DEPLOYMENT,
    [
      {
        role: "user",
        content: "call the function",
      },
    ],
    {
      functions: [
        {
          name: "meow",
          description:
            "you are a cat. make cat sounds like meow, meowwwww, etc.",
          parameters: {
            type: "object",
            properties: {
              sound: {
                type: "string",
                description: "make a cat sound responding to the user",
              },
            },
          },
        },
      ],
      functionCall: {
        name: "meow",
      },
    }
  );

  let res = "";
  for await (const event of stream) {
    console.log("Event:", JSON.stringify(event, null, 2));
    res += event.choices[0]?.delta?.content ?? "";
  }
  console.log("final res:", res);
});
