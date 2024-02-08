import {
  BaseChatModel,
  BaseChatModelCallOptions,
} from "@langchain/core/language_models/chat_models";
import { ChatMessage as LangchainChatMessage } from "@langchain/core/messages";
import { ChatLlm, OpenAiChatMessage } from "./ChatLlm";
import { AssistantMessage } from "./ConversationsService";

export interface MakeLangchainChatLlmProps {
  chatModel: BaseChatModel;
  options?: BaseChatModelCallOptions;
}

/**
  Use any Langchain JS [`ChatModel`](https://js.langchain.com/docs/modules/model_io/chat/)
  to talk to an LLM.

  Note: This ChatLLM does not currently support tool calling.
 */
export function makeLangchainChatLlm({
  chatModel,
  options,
}: MakeLangchainChatLlmProps): ChatLlm {
  return {
    async answerQuestionAwaited({ messages }) {
      const res = await chatModel.invoke(
        messages.map((m) => messageBaseToLangchainMessage(m)),
        options
      );
      return {
        role: "assistant",
        content: typeof res.content === "string" ? res.content : "",
      } satisfies AssistantMessage;
    },
    answerQuestionStream: async ({ messages }) =>
      (async function* () {
        const stream = await chatModel.stream(
          messages.map((m) => messageBaseToLangchainMessage(m)),
          options
        );
        let index = 0;
        for await (const chunk of stream) {
          index++;
          yield {
            id: index.toString(),
            created: new Date(),
            choices: [
              {
                finishReason: "N_A",
                index: index,
                delta: {
                  role: "assistant",
                  content:
                    typeof chunk.content === "string" ? chunk.content : "",
                  toolCalls: [],
                },
              },
            ],
            promptFilterResults: [],
          };
        }
      })(),
  };
}

function messageBaseToLangchainMessage(
  message: OpenAiChatMessage
): LangchainChatMessage {
  return new LangchainChatMessage(message.content ?? "", message.role);
}
