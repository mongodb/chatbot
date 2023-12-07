---
id: "EmbeddedContent"
title: "Interface: EmbeddedContent"
sidebar_label: "EmbeddedContent"
sidebar_position: 0
custom_edit_url: null
---

The embedded content of a chunk of text stored in the database.

## Properties

### chunkAlgoHash

• `Optional` **chunkAlgoHash**: `string`

Non-cryptographic hash of the actual chunking function (and its options)
used to produce this chunk. Used to detect whether the chunk should be
updated because the function or options have changed.

#### Defined in

packages/mongodb-rag-core/build/EmbeddedContent.d.ts:47

___

### chunkIndex

• `Optional` **chunkIndex**: `number`

The order of the chunk if this content was chunked from a larger page.

#### Defined in

packages/mongodb-rag-core/build/EmbeddedContent.d.ts:41

___

### embedding

• **embedding**: `number`[]

The vector embedding of the text.

#### Defined in

packages/mongodb-rag-core/build/EmbeddedContent.d.ts:25

___

### metadata

• `Optional` **metadata**: `Object`

Arbitrary metadata associated with the content. If the content text has
metadata in Front Matter format, this metadata should match that metadata.

#### Index signature

▪ [k: `string`]: `unknown`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `tags?` | `string`[] |

#### Defined in

packages/mongodb-rag-core/build/EmbeddedContent.d.ts:34

___

### sourceName

• **sourceName**: `string`

The name of the data source the page was loaded from.

#### Defined in

packages/mongodb-rag-core/build/EmbeddedContent.d.ts:13

___

### text

• **text**: `string`

The text represented by the vector embedding.

#### Defined in

packages/mongodb-rag-core/build/EmbeddedContent.d.ts:17

___

### tokenCount

• **tokenCount**: `number`

The number of embedding tokens in the content.

#### Defined in

packages/mongodb-rag-core/build/EmbeddedContent.d.ts:21

___

### updated

• **updated**: `Date`

The date the content was last updated.

#### Defined in

packages/mongodb-rag-core/build/EmbeddedContent.d.ts:29

___

### url

• **url**: `string`

The URL of the page with the content.

#### Defined in

packages/mongodb-rag-core/build/EmbeddedContent.d.ts:9
