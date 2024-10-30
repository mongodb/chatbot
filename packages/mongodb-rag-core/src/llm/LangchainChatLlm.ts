import {
  BaseChatModel,
  BaseChatModelCallOptions,
} from "@langchain/core/language_models/chat_models";
import {
  BaseMessagePromptTemplateLike,
  ChatPromptTemplate,
} from "@langchain/core/prompts";
import { ChatLlm, OpenAiChatMessage } from "./ChatLlm";
import { AssistantMessage } from "../conversations";

export interface MakeLangchainChatLlmProps {
  chatModel: BaseChatModel;
  callOptions?: BaseChatModelCallOptions;
}

/**
  Use any Langchain JS [`ChatModel`](https://js.langchain.com/docs/modules/model_io/chat/)
  to talk to an LLM.

  Note: This ChatLLM does not currently support tool calling.
 */
export function makeLangchainChatLlm({
  chatModel,
  callOptions,
}: MakeLangchainChatLlmProps): ChatLlm {
  return {
    async answerQuestionAwaited({ messages }) {
      const prompts = ChatPromptTemplate.fromMessages(
        messages.map((m) => messageBaseMessagePromptTemplateLike(m))
      );
      const chain = prompts.pipe(chatModel);
      const res = await chain.invoke({}, callOptions);
      return {
        role: "assistant",
        content: typeof res.content === "string" ? res.content : "",
      } satisfies AssistantMessage;
    },
    answerQuestionStream: async ({ messages }) =>
      (async function* () {
        const prompts = ChatPromptTemplate.fromMessages(
          messages.map((m) => messageBaseMessagePromptTemplateLike(m))
        );
        const chain = prompts.pipe(chatModel);
        const stream = await chain.stream({}, callOptions);
        let index = 0;
        for await (const chunk of stream) {
          index++;
          yield {
            id: index.toString(),
            created: Date.now(),
            choices: [
              {
                finish_reason: null,
                index: index,
                delta: {
                  role: "assistant",
                  content:
                    typeof chunk.content === "string" ? chunk.content : "",
                  tool_calls: [],
                },
              },
            ],
            promptFilterResults: [],
          };
        }
      })(),
  };
}

function messageBaseMessagePromptTemplateLike(
  message: OpenAiChatMessage
): BaseMessagePromptTemplateLike {
  return [message.role, message.content ?? ""];
}
