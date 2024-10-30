# Optimize Ingestion

You can optimize your data ingestion process for your application.

This page contains some information on optimizing ingestion
based on our experience building RAG applications and emerging best practices.

## Standardize Data Formats

We recommend that you standardize the data formats for the content that you ingest
into your RAG application. This is advantageous for the following reasons:

- It's easier for the LLM to reason about the content when generating responses
- You can share helper methods across data sources

### Text

[Markdown](https://www.markdownguide.org/) works well as the standard format for most text-based content. LLMs can reason with Markdown,
and even respond in Markdown. (This is actually how ChatGPT creates rich text).
There are lots of tools in the JavaScript ecosystem for working with Markdown as well.

HTML is generally a suboptimal format for RAG. While LLMs can reason with HTML,
it has a much higher token density for the same content as compared to Markdown
for most tokenization algorithms. This is because of all those HTML tags.

And if you need to include some HTML semantic meaning in your content that
Markdown doesn't support, you can use that HTML in your Markdown. This works because:

1. LLMs aren't sticklers for language syntax, generally speaking.
2. In some Markdown dialects, like [Github Flavored Markdown](https://github.github.com/gfm/), you can include HTML in Markdown. This further reduces potential LLM confusion and means that
   there exist non-AI libraries and tools to work with hybrid Markdown/HTML content programmatically.

### Structured Data

If you are embedding structured data, you can use [YAML](https://yaml.org/)
or [JSON](https://www.json.org/json-en.html).
LLMs are effective at reasoning with both of these formats. There are also
lots of JavaScript utilities for working with these formats.

## Clean up Text as You Ingest

You may want to clean up text as you ingest it. We recommend that you do this
during the `pages` command stage. The `pages` command is the
stage where you have access to the raw text from the data source.

:::note[Why You Shouldn't Clean up Text in the `embed` Command Stage]

You could technically clean up text during the `embed` command stage,
but this would be something of an anti-pattern since the `embed` command
is supposed to be for chunking and creating embeddings, not manipulating the original content.

:::

To clean up text during the `pages` stage, include the logic in your `DataSource.fetchPages()` method.
The cleaned text will be persisted to the `pages` collection, and used down stream by the `embed` command.

Some content that you may want to clean up includes:

- Remove HTML tags.
- Remove Markdown images and links.

The `mongodb-rag-ingest` package comes with utilities for both of these.
Learn more about them in the [Data Sources](./data-sources.md#data-source-helpers) documentation.

## Refine the Chunking Strategy

In the context of building RAG apps, chunking refers to breaking down large pieces
of text into smaller segments. It's important to optimize the content that
you get back from the vector database and then use with the large language model.

We have provided reasonable defaults that should work for many RAG apps,
but you can customize the chunking strategy to be optimized for your application.

You can configure the [`ChunkOptions`](./configuration-reference.md#chunkoptions)
in your configuration file to customize the chunking strategy.

For example, you could change the `maxChunkSize` to be smaller or larger
or make the chunks overlap.

```ts
const chunkOptions: ChunkOptions = {
  maxChunkSize: 1000,
  overlap: 100,
  // ...other properties
};
```

## Add Metadata to Chunks

One of the most important things you can do to optimize your ingestion process
is add metadata to the chunks sent to the embedding API.

For example, you can add metadata for things like the title of the page that
the content came from and the name of the data source that the content came from.

To add metadata to chunks, you can use the `ChunkOptions.transform()` function in the `mongodb-rag-ingest` package. The `mongodb-rag-ingest` package comes with the
`standardChunkFrontMatterUpdater()` function which adds all the properties from the
`Page.metadata` object and the `Page.title` as [Front Matter](https://jekyllrb.com/docs/front-matter/)
to the chunk.

Say you have this document in the `pages` collection:

```ts
{
  title: "My Page",
  body: "This is my page...",
  metadata: {
    tags: ["tag1", "tag2"],
    productName: "Product Name",
  },
  // ...other properties
}
```

When chunking the page, `standardChunkFrontMatterUpdater()` transforms
the page text into the following chunk text:

```yaml
---
title: My Page
tags:
  - tag1
  - tag2
productName: Product Name
---
This is my page...
```

You then use this chunk with metadata to create the embedding.
The embedding then has the semantic meaning of both the chunk content and metadata.

Here's how you can add the `standardChunkFrontMatterUpdater()` function to your configuration:

```ts
import { standardChunkFrontMatterUpdater } from "mongodb-rag-core";
import { ChunkOptions } from "mongodb-rag-core";

const chunkOptions: ChunkOptions = {
  transform: standardChunkFrontMatterUpdater,
  // ...other properties
};
```

For more information on how to configure `ChunkOptions`,
refer to the [Configuration Reference](./configuration-reference.md#chunkoptions) documentation.
