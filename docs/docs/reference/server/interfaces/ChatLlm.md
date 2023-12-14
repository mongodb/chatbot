---
id: "ChatLlm"
title: "Interface: ChatLlm"
sidebar_label: "ChatLlm"
sidebar_position: 0
custom_edit_url: null
---

LLM that responds to user queries. Provides both streaming and awaited options.

## Methods

### answerQuestionAwaited

▸ **answerQuestionAwaited**(`«destructured»`): `Promise`\<[`OpenAiChatMessage`](OpenAiChatMessage.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`LlmAnswerQuestionParams`](LlmAnswerQuestionParams.md) |

#### Returns

`Promise`\<[`OpenAiChatMessage`](OpenAiChatMessage.md)\>

#### Defined in

[packages/mongodb-chatbot-server/src/services/ChatLlm.ts:43](https://github.com/mongodben/chatbot/blob/4bc75a7/packages/mongodb-chatbot-server/src/services/ChatLlm.ts#L43)

___

### answerQuestionStream

▸ **answerQuestionStream**(`«destructured»`): `Promise`\<[`OpenAiStreamingResponse`](../modules.md#openaistreamingresponse)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`LlmAnswerQuestionParams`](LlmAnswerQuestionParams.md) |

#### Returns

`Promise`\<[`OpenAiStreamingResponse`](../modules.md#openaistreamingresponse)\>

#### Defined in

[packages/mongodb-chatbot-server/src/services/ChatLlm.ts:39](https://github.com/mongodben/chatbot/blob/4bc75a7/packages/mongodb-chatbot-server/src/services/ChatLlm.ts#L39)
