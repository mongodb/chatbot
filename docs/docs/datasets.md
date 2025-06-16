# Datasets

The Education AI team maintains various datasets for use with AI systems. All datasets can be found in the [MongoDB Education AI HuggingFace](https://huggingface.co/mongodb-eai).

## Content

Content datasets can be useful for building RAG systems and training models.

| Name | Type | Description  | Visibility | Use Cases | Links |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Public documentation | Long-form content  | Markdown version of docs and developer center content. | Public | RAG, model training | https://huggingface.co/datasets/mongodb-eai/docs  |
| Code example dataset | Prompt-completion | Code examples extracted from the MongoDB docs and developer center with prompts that could be used to generate the code.  | Public  | Model fine-tuning | https://huggingface.co/datasets/mongodb-eai/code-example-prompts  |

## Benchmarks

| Name | Type | Description  | Visibility |  |
| :---- | :---- | :---- | :---- | :---- |
| Natural language-to-Node.js Mongosh | Code generation | Assess how well LLMs generate `mongosh` code given a natural language prompt and information about a database. | External | https://huggingface.co/datasets/mongodb-eai/natural-language-to-mongosh |

