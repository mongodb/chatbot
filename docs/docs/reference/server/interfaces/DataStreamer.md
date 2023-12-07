---
id: "DataStreamer"
title: "Interface: DataStreamer"
sidebar_label: "DataStreamer"
sidebar_position: 0
custom_edit_url: null
---

Service that streams data to the client.

## Properties

### connected

• **connected**: `boolean`

#### Defined in

[packages/mongodb-chatbot-server/src/services/dataStreamer.ts:85](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/services/dataStreamer.ts#L85)

## Methods

### connect

▸ **connect**(`res`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `res` | `Response`\<`any`, `Record`\<`string`, `any`\>\> |

#### Returns

`void`

#### Defined in

[packages/mongodb-chatbot-server/src/services/dataStreamer.ts:86](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/services/dataStreamer.ts#L86)

___

### disconnect

▸ **disconnect**(): `void`

#### Returns

`void`

#### Defined in

[packages/mongodb-chatbot-server/src/services/dataStreamer.ts:87](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/services/dataStreamer.ts#L87)

___

### stream

▸ **stream**(`params`): `Promise`\<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `params` | `StreamParams` |

#### Returns

`Promise`\<`string`\>

#### Defined in

[packages/mongodb-chatbot-server/src/services/dataStreamer.ts:89](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/services/dataStreamer.ts#L89)

___

### streamData

▸ **streamData**(`data`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `SomeStreamEvent` |

#### Returns

`void`

#### Defined in

[packages/mongodb-chatbot-server/src/services/dataStreamer.ts:88](https://github.com/mongodben/chatbot/blob/dbe6fdb/packages/mongodb-chatbot-server/src/services/dataStreamer.ts#L88)
