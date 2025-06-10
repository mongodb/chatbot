---
license: apache-2.0
task_categories:
- text-generation
language:
- en
tags:
- mongodb,
- mongosh
- benchmark
- llm
pretty_name: Natural Language to MongoDB Shell (mongosh) Benchmark
size_categories:
- n<1K
---

# Natural Language to MongoDB Shell (mongosh) Benchmark

Benchmark dataset for performing natural language (NL) to MongoDB Shell (mongosh) code generation.

There is an emerging desire from users for NL query generation.
We should systematically understand how LLMs generate MongoDB queries.
We should additionally provide some proactive guidance for anyone making systems that map NL to MongoDB queries. 

## Repository Contents 

This repository contains:

1. Benchmark dataset ([flat CSV file](https://huggingface.co/datasets/mongodb-eai/natural-language-to-mongosh/blob/main/atlas_sample_data_benchmark.flat.csv), [Braintrust evaluation platform-formatted CSV file](https://huggingface.co/datasets/mongodb-eai/natural-language-to-mongosh/blob/main/atlas_sample_data_benchmark.braintrust.csv))
2. Database that the benchmark uses ([database files](https://huggingface.co/datasets/mongodb-eai/natural-language-to-mongosh/tree/main/databases))
3. Benchmark results ([csv](https://huggingface.co/datasets/mongodb-eai/natural-language-to-mongosh/blob/main/natural-language-to-mongosh-experiment-results.csv))
4. Information on running the benchmark (see [Source Code section](#source-code))

## Benchmark Dataset

The benchmark consists of 766 cases across 8 databases. The benchmark uses the [MongoDB Atlas sample databases](https://www.mongodb.com/docs/atlas/sample-data/) as of April 2025.

### Dataset Profile

The following charts contain information about the dataset.

#### Complexity

<div style="max-width: 700px;">

![query_complexity.png](https://cdn-uploads.huggingface.co/production/uploads/63a36e208c0c89dcae3c1172/zC4HHMRTAYVnnYl1vcxzM.png)

</div>


When generating the queries, we classified the 'complexity' of them using an LLM.

#### Databases

<div style="max-width: 700px;">

![distribution_by_dataset_name.png](https://cdn-uploads.huggingface.co/production/uploads/63a36e208c0c89dcae3c1172/UrMN2CF8rFvlGfBESwJAj.png)

</div>


#### MongoDB Methods Used

<div style="max-width: 700px;">

![method_frequency.png](https://cdn-uploads.huggingface.co/production/uploads/63a36e208c0c89dcae3c1172/qY2jpNZXoCHB_FvUNu5aD.png)

</div>

#### Query Operators

<div style="max-width: 700px;">

![query_operator_counts.png](https://cdn-uploads.huggingface.co/production/uploads/63a36e208c0c89dcae3c1172/VDmbYgynp4VT3le-gMdCu.png)

</div>

The benchmark also considered the reasonable bounds by which a query should be used. We specified the following operators in the following ranges:

| Frequency Category | Minimum Representation | Maximum Representation | Operators |
| :---- | :---- | :---- | :---- |
| `most_common` | 0.2 | 1.0 | $eq, $and, $match, $group, $in, $gte, $cond, $lte |
| `common` | 0.01 | 0.3 | $not, $or, $gt, $lt, $first, $convert, $ne, $divide, $ifNull, $arrayElemAt, $addToSet |
| `uncommon` | 0.0001 | 0.05 | $max, $multiply, $objectToArray, $bsonSize, $map, $concat, $dateToString, $concatArray, $min, $meta, $add |
| `not_defined` | 0 | 1 | Catch all for all other operators |

Usage of query operators in the dataset:

<div style="max-width: 700px;">

![operator_usage_vs_bounds.png](https://cdn-uploads.huggingface.co/production/uploads/63a36e208c0c89dcae3c1172/_89YvXShiZqCi4L8n9RlD.png)

</div>

### Benchmark Generation Pipeline

The following process was used to generate the dataset:

![tree-of-generation.png](https://cdn-uploads.huggingface.co/production/uploads/63a36e208c0c89dcae3c1172/T-L4HajV3aQfUE32YZZMl.png)

Source code for the data generation pipeline can be found here: https://github.com/mongodb/chatbot/tree/EAI-897/packages/datasets/src/treeGeneration/databaseNlQueries

#### Advantages of Approach

1. Scalable.   
   1. Generate (N users) \* (M use cases) \* (P NL queries) \* (O MQL queries)  
   2. N\*M\*P\*O total generations. Highly scalable.  
      1. E.g. 8\*8\*8\*8=4096, 20\*20\*20\*20=160,000  
   3. Can scale up/down number of generations at each stage to change results size. This is useful for testing on small sizes before scaling to big for larger runs.   
2. Flexible  
   1. Process applicable to any MongoDB database.  
   2. Can manually intervene at any step in the process to affect all downstream generation.   
3. Extensible  
   1. Can intervene to build targeted datasets for specific products or features.

### Database that the Benchmark Uses

The MongoDB databases used in the benchmark can be found in this repository in the `databases` directory. You can import them using the [`mongorestore` tool](https://www.mongodb.com/docs/database-tools/mongorestore/#mongodb-binary-bin.mongorestore).

> Alternatively, you can download the databases from MongoDB Atlas following the [Load Sample Data](https://www.mongodb.com/docs/atlas/sample-data/) MongoDB Atlas documentation.
> Using the options to download the datasets from MongoDB is more convenient than using `mongorestore`.
> While this will work as of time of writing in April 2025, it is possible that in the future the Atlas sample data changes, so they're out of sync with the benchmark datasets. 
> These sample datasets rarely change, so downloading from MongoDB is likely safe, but there is no guarantee.
> If you want to be precise, use `mongorestore`.

## Evaluation Metrics

| Metric | Description | Reference-Free | Type | Scoring Method | Code |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **SuccessfulExecution** | Whether the generated query successfully executes (i.e. does not throw an error). | Yes | Correctness | Binary (0/1) | [Code](https://github.com/mongodb/chatbot/blob/EAI-897/packages/benchmarks/src/textToDriver/evaluationMetrics.ts#L14) |
| **CorrectOutputFuzzy** | Whether the generated query returns data from the database that fuzzy matches ideal reference data. | No | Correctness | Binary (0/1) | [Code](https://github.com/mongodb/chatbot/blob/EAI-897/packages/benchmarks/src/textToDriver/evaluationMetrics.ts#L25) |
| **NonEmptyOutput** | Whether the generated output is non-empty. Empty results are considered to be `[]`, `{}`, or `0`. All cases in the benchmark are validated to have a non-empty output, so this is a measure of incorrectness. | Yes | Correctness | Binary (0/1) | [Code](https://github.com/mongodb/chatbot/blob/EAI-897/packages/benchmarks/src/textToDriver/evaluationMetrics.ts#L57) |
| **ReasonableOutput** | Whether results in the generated output are non-empty and do not contain `null` values or empty strings `''`. All cases in the benchmark are validated to have reasonable outputs, so this is a measure of incorrectness. | Yes | Correctness | Binary (0/1) | [Code](https://github.com/mongodb/chatbot/blob/EAI-897/packages/benchmarks/src/textToDriver/evaluationMetrics.ts#L57) |
| **NormalizedExecutionTimeNonEmpty** | How the execution time of a generated query compares to the execution time of the reference query. If the generated query is faster than the reference query, it receives score `1`. If the query execution time is slower, penalized on a log-adjusted basis, i.e. bigger penalty for much slower queries. Only ran this if the metric NonEmptyOutput=1. This was so we wouldn't measure a 'fast' query if the query didn't return results, which would not be meaningful.  Unfortunately, we were not able to get reliable measurements of NormalizedExecutionTimeNonEmpty due to limitations of our execution environment. For more information, refer to the [Limitations \> NormalizedExecutionTimeNonEmpty](?tab=t.0#heading=h.86uvw6vvqw6m) section below. | No | Performance | Continuous (0-1) | [Code](https://github.com/mongodb/chatbot/blob/EAI-897/packages/benchmarks/src/textToDriver/evaluationMetrics.ts#L57) |
| **XMaNeR** | Average of the SuccessfulExecution (X), CorrectOutputFuzzy (Ma, for 'Match'), NonEmptyOutput (Ne), and Reasonable Output (R) We used **XMaNeR** as the primary metric as it combines all the correctness metrics, into a single, highly interpretable metric. | No | Compound | Continuous (0-1) | N/A. Computed in Braintrust |
| **NeXMaNeR** | NormalizedExecutionTimeNonEmpty, (Ne), Average of the SuccessfulExecution (X), CorrectOutputFuzzy (Ma, for 'Match'), NonEmptyOutput (Ne), and Reasonable Output (R) | No | Compound | Continuous (0-1) | N/A. Computed in Braintrust |

## Prompting Strategies Evaluated

A large part of this project was to find the 'best' prompting strategies for performing NL to MongoDB queries.We experimented with any tried to optimize a variety of variables. We looked at the following prompting strategies:

1. **Base system prompt**: Instructions for the natural language to Mongosh task. Formats:  
   1. **Lazy**: Minimal prompt instructions to generate mongosh code.   
      1. [Prompt code](https://github.com/mongodb/chatbot/pull/677/files#diff-3817ed1cdd35ebb64f791ab92011d666a6d55b7f4b4b0ad56e4ea04158d3f1efR16-L19)   
   2. **Default**: Lazy prompt plus additional guidance on constructing good mongosh queries.  
      1. [Prompt code](https://github.com/mongodb/chatbot/pull/677/files#diff-3817ed1cdd35ebb64f791ab92011d666a6d55b7f4b4b0ad56e4ea04158d3f1efR4-R27)  
2. **Sample documents**: A few sample documents from MongoDB collections in the query. Always included.   
   1. [Sample documents for databases in the benchmark](https://github.com/mongodb/chatbot/blob/EAI-897/packages/benchmarks/src/textToDriver/generateDriverCode/annotatedDbSchemas.ts#L65)  
   2. All sample documents are truncated to fit well within the prompt. For example, we wouldn't want to include an entire vector embedding or many pages of text in a single document.   
      1. [Truncation code](https://github.com/mongodb/chatbot/blob/EAI-897/packages/mongodb-rag-core/src/executeCode/truncateDbOperationOutputForLlm.ts)  
3. **Schema**: Metadata about the database including collection schemas and indexes. Formats:  
   1. **None**: No schema included  
   2. **Interpreted**: Interpreted programmatically using code. Outputs a JSON-schema like representation of the documents in the collection.  
      1. [getVerySimplifiedSchema](https://github.com/mongodb/chatbot/blob/EAI-897/packages/mongodb-rag-core/src/executeCode/databaseMetadata/getVerySimplifiedSchema.ts) code to interpret schema from documents   
   3. **Annotated:** An annotated version of the collection schema with descriptions on what the various fields and indexes are for. Generated by LLM with manual review and light edits.  
      1. [Annotated schemas used in benchmark](https://github.com/mongodb/chatbot/blob/EAI-897/packages/benchmarks/src/textToDriver/generateDriverCode/annotatedDbSchemas.ts#L32)  
      2. [Code to generate annotated database schema](https://github.com/mongodb/chatbot/blob/EAI-897/packages/mongodb-rag-core/src/executeCode/databaseMetadata/generateAnnotatedDatabaseInfo.ts)  
4. **Chain-of-thought-reasoning**: System prompt instructions for the model to think step-by-step about the query plan before answering.   
   1. **None**: No chain-of-thought reasoning.  
   2. **Query Plan**: Model prompted to think step-by-step about the query plan before generating output.  
      1. [Prompt code](https://github.com/mongodb/chatbot/pull/677/files#diff-3817ed1cdd35ebb64f791ab92011d666a6d55b7f4b4b0ad56e4ea04158d3f1efR27-R41%20)  
5. **Few-shot prompt**:  
   1. **None**: No few-shot examples.   
   2. **Generic**: A few general natural language-to-Mongosh examples. When using chain-of-thought, the few shot examples include a thought chain before the output.  
      1. [Prompt code](https://github.com/mongodb/chatbot/blob/EAI-897/packages/benchmarks/src/textToDriver/generateDriverCode/languagePrompts/mongosh.ts#L43)   
6. **Output format**: The way in which the LLM outputs the generated code. Formats:  
   1. **Tool Call**: Use an [OpenAI-style tool call](https://platform.openai.com/docs/guides/function-calling) to generate code as a structured output.  
      1. [Code](https://github.com/mongodb/chatbot/blob/EAI-897/packages/benchmarks/src/textToDriver/generateDriverCode/generateMongoshCodeSimpleToolCall.ts)  
   2. **Completion**: Use an [OpenAI-style assistant message](https://platform.openai.com/docs/guides/text-generation) to return generated code. Extract the generated code from the message.  
      1. [Code](https://github.com/mongodb/chatbot/blob/EAI-897/packages/benchmarks/src/textToDriver/generateDriverCode/generateMongoshCodePromptCompletion.ts)  
   3. **Agentic workflow**: Allow the LLM to make various tool calls to generate a response. The LLM is provided two tools, a query planner and code execution tool.  
      1. [Code](https://github.com/mongodb/chatbot/blob/EAI-897/packages/benchmarks/src/textToDriver/generateDriverCode/generateMongoshCodeAgentic.ts)

For more information about the specifics of optimal prompting strategies, refer to the [Optimal Prompt Components](?tab=t.0#heading=h.z7zksu3fejjv) section below.

## Benchmark Results

### Models Evaluated

We ran the benchmark with the following models:

| Model Name | Model Developer | Available Hosting Provider(s) | Used In | Open Source | Reasoning Model |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Claude 3.5 Haiku | Anthropic | AWS Bedrock, Anthropic | Claude chatbot | No | No |
| Claude 3.7 Sonnet | Anthropic | AWS Bedrock, Anthropic | Claude chatbot | No | No |
| GPT 4o mini  | OpenAI | Azure OpenAI service, OpenAI | ChatGPT | No | No |
| GPT-4o | OpenAI | Azure OpenAI service, OpenAI | ChatGPT | No | No |
| o3-mini | OpenAI | Azure OpenAI service, OpenAI | ChatGPT | No | Yes |
|  Gemini 2 Flash | Google | Google Gemini API, Google Vertex AI | Gemini chatbot, various Google services (Docs, Gmail, etc.) | No | No |
| Llama 3.3 70b | Meta | AWS Bedrock, Microsoft Azure, etc. | Meta.ai | Yes | No |
| Mistral Large 2 | Mistral | AWS Bedrock, Microsoft Azure, GCP | Le Chat | No | No |
| Amazon Nova Pro | Amazon | AWS Bedrock |  | No | No |

#### Model Selection

These models were chosen because they are popular models from leading AI model developers and used in various popular products.

We were also limited by the models that we have access to.
For example, we would have liked to be able to benchmark Deepseek or other popular Chinese models,
but we do not currently have easy access to them.

### Summary


* There is a strong correlation between model performance on generally available benchmarks and this NL to Mongosh benchmark.  
* Different prompting strategies yielded meaningfully different results. Optimizing on prompting strategy is a good way to improve performance. 


![xmaner_by_model](https://cdn-uploads.huggingface.co/production/uploads/63a36e208c0c89dcae3c1172/vT944BPE5-a0yBoGQw77c.png)

| Model | XMaNeR (Average) | XMaNeR (Max) |
| :---- | ----- | ----- |
| **Claude 3.7 Sonnet** | 0.8671083333 | 0.899 |
| **o3-mini** | 0.8291166667 | 0.8518 |
| **Gemini 2 Flash** | 0.82895 | 0.8661 |
| **GPT-4o** | 0.8252666667 | 0.8613 |
| **Claude 3.5 Haiku** | 0.8145333333 | 0.8602 |
| **GPT-4o-mini** | 0.7826333333 | 0.8417 |
| **Llama 3.3 70b** | 0.7856714286 | 0.8232 |
| **Nova Pro** | 0.77745 | 0.8251 |
| **Mistral Large 2** | 0.7129285714 | 0.7928 |


### Correlation with Other Benchmarks

The results compare model performance on the MongoDB University quiz question dataset to the benchmarks [MMLU-Pro](https://paperswithcode.com/dataset/mmlu), which evaluate general knowledge and understanding, and the [Chatbot Arena ELO](https://huggingface.co/spaces/lmsys/chatbot-arena-leaderboard), which measures user answer preference.

| Model | XMaNeR (Average) | XMaNeR (Max)  | MMLU-Pro[^1] | Chatbot Arena ELO[^2] |
| ----- | ----- | ----- | :---- | :---- |
| GP- 4o mini | .7826 | .8417 | .627 | 1272 |
| GPT-4o | .8253 | .8613 | .7461 | 1285 |
| o3-mini | .8291 | .8518 | .787 | 1305 |
| Claude 3.7 Sonnet | .8671 | .899 | .807 | 1293 |
| Claude 3.5 Haiku | .8145 | .8602 | .641 | 1237 |
| Gemini 2 Flash | .8290 | .8661 | .774 | 1356 |
| Nova Pro | .7774 | .8251 | .69[^3] | 1245 |
| Llama 3.3 70b | .7857 | .8232 | .699 | 1257 |
| Mistral Large 2 | .7129 | .7928 | .8368 | 1249 |
|  |  | **R-Squared for XMaNeR (Average)[^4]** | .615[^5] | .308 |

#### MMLU Pro

![image/png](https://cdn-uploads.huggingface.co/production/uploads/63a36e208c0c89dcae3c1172/Tp0kHuIXa88mvQ0Q0DgwV.png)

#### Chatbot Arena ELO

![image/png](https://cdn-uploads.huggingface.co/production/uploads/63a36e208c0c89dcae3c1172/CVfneJvUpFTwonJlpTd2Z.png)

[^1]: Taken from [https://www.vals.ai/benchmarks/mmlu\_pro-04-04-2025](https://www.vals.ai/benchmarks/mmlu_pro-04-04-2025)  on 2025-04-21 unless otherwise noted.

[^2]:  Taken from [https://openlm.ai/chatbot-arena/](https://openlm.ai/chatbot-arena/) on 2025-04-21  

[^3]:  Taken from [https://artificialanalysis.ai/models/nova-pro](https://artificialanalysis.ai/models/nova-pro) 

[^4]:  R-Squared measures how well the independent variable determines the dependent variable. ([https://www.investopedia.com/terms/r/r-squared.asp](https://www.investopedia.com/terms/r/r-squared.asp))

[^5]:  This calculation omits Mistral 2 Large because it is a massive outlier. Including it in the R^2 calculate dramatically reduced the correlation.

### Prompting Strategies

#### 

| Prompting Strategy |  |  |  |  |  | XMaNeR by Model |  |  |  |  |  |  |  |  |  |  |  |
| :---- | :---- | ----- | ----- | :---- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| **Response Type** | **Base Prompt** | **Chain-of-Thought** | **Sample Documents** | **Schema** | **Few-Shot** | **GPT-4o-mini** | **GPT-4o** | **o3-mini** | **Claude 3.7 Sonnet** | **Claude 3.5 Haiku** | **Gemini 2 Flash** | **Nova Pro** | **Llama 3.3 70b** | **Mistral Large 2** | **Average** | **Range** | **Standard Deviation** |
| Prompt/Completion | Default | TRUE | TRUE | Annotated | FALSE | 0.8068 | 0.8613 | 0.8413 | 0.8877 | 0.7924 | 0.8492 | 0.7924 | 0.7967 | 0.6056 | 0.8037111111 | 0.2821 | 0.006676921111 |
| Prompt/Completion | Default | FALSE | TRUE | Annotated | FALSE | 0.8061 | 0.8572 | 0.8466 | 0.8649 | 0.8332 | 0.8556 | 0.8251 | 0.8224 | 0.7749 | 0.8317777778 | 0.09 | 0.02863467207 |
| Prompt/Completion | Lazy | FALSE | TRUE | Annotated | FALSE | 0.8035 | 0.857 | 0.8371 | 0.8561 | 0.8202 | 0.8529 | 0.8202 | 0.8232 | 0.7928 | 0.8292222222 | 0.0642 | 0.02319481503 |
| Prompt/Completion | Lazy | FALSE | TRUE | None | FALSE | 0.7797 | 0.8209 | 0.8158 | 0.8456 | 0.8169 | 0.8118 | 0.8051 | 0.789 | 0.7654 | 0.8055777778 | 0.0802 | 0.02415293863 |
| Prompt/Completion | Lazy | FALSE | TRUE | Interpreted | FALSE | 0.749 | 0.785 | 0.8039 | 0.8404 | 0.8056 | 0.803 | 0.6989 | 0.7265 | 0.7062 | 0.7687222222 | 0.1415 | 0.05016340244 |
| Prompt/Completion | Default | FALSE | TRUE | Interpreted | FALSE | 0.7435 | 0.8035 | 0.798 | 0.8587 | 0.7872 | 0.7946 | 0.7733 | 0.7824 | 0.7232 | 0.7849333333 | 0.1355 | 0.03828354738 |
| Prompt/Completion | Default | TRUE | TRUE | Interpreted | FALSE | 0.7748 | 0.7911 | 0.7993 | 0.8663 | 0.7477 | 0.777 | 0.7247 | 0.7595 | 0.6224 | 0.7625333333 | 0.2439 | 0.06575813638 |
| Agentic | Default | TRUE | TRUE | Annotated | FALSE | 0.8417 | 0.8587 | 0.8518 | **0.899** | 0.8602 | 0.8661 | 0.8145 |  |  | 0.856 | 0.0845 | 0.02556142928 |
| Tool Call | Default | FALSE | TRUE | Annotated | FALSE | 0.7787 | 0.8264 | 0.8355 | 0.8642 | 0.8384 | 0.8415 | 0.7908 |  |  | 0.8250714286 | 0.0855 | 0.0300387369 |
| Tool Call | Default | TRUE | TRUE | Annotated | FALSE | 0.7856 | 0.835 | 0.8451 | 0.8747 | 0.8391 | 0.8329 | 0.7753 |  |  | 0.8268142857 | 0.0994 | 0.03472445961 |
| Tool Call | Default | FALSE | TRUE | Annotated | TRUE | 0.7699 | 0.8157 | 0.8381 | 0.8786 | 0.8146 | 0.8341 | 0.7787 |  |  | 0.8185285714 | 0.1087 | 0.0369877779 |
| Tool Call | Default | TRUE | TRUE | Annotated | TRUE | 0.7523 | 0.7914 | 0.8369 | 0.8691 | 0.8189 | 0.8287 | 0.7304 |  |  | 0.8039571429 | 0.1387 | 0.04899169512 |
|  |  |  |  |  | **Average** | 0.7826333333 | 0.8252666667 | 0.8291166667 | **0.8671083333** | 0.8145333333 | 0.82895 | 0.77745 | 0.7856714286 | 0.7129285714 |  |  |  |
|  |  |  |  |  | **Range** | 0.0982 | 0.0763 | 0.0538 | 0.0586 | 0.1125 | 0.0891 | 0.1262 | 0.0967 | 0.1872 |  |  |  |
|  |  |  |  |  | **Standard deviation** | 0.02844149764 | 0.02869755559 | 0.01940092937 | 0.01655999881 | 0.02930607549 | 0.02716941797 | 0.04025691358 | 0.03436809151 | 0.07398059913 |  |  |  |

#### Prompting Strategy Names Key 

The below charts use the following components to identify different prompting strategies.

| Label Component | Prompt Strategy |
| :---- | :---- |
| P/C | Response Type=Prompt/Completion |
| Tool | Response Type=Tool Call |
| Agent | Response Type=Agentic |
| Def | Base Prompt=Default |
| Lzy | BasePrompt=Lazy |
| CoT | Chain-of-Thought=True |
| Sch:Ann | Schema=Annotated |
| Sch:Int | Schema=Interpreted |
| FS | Few-shot=True |

#### Heatmap

![prompting heatmap](https://cdn-uploads.huggingface.co/production/uploads/63a36e208c0c89dcae3c1172/u6uCqDEHXFz160WxHB3Kh.png)


#### Performance

The below chart shows the average token usage for each prompting strategy.

![prompting performance](https://cdn-uploads.huggingface.co/production/uploads/63a36e208c0c89dcae3c1172/jqzs5Yg8QMJkwc39By1Of.png)

### Results Analysis

This benchmark demonstrates that there is a meaningful variance between models and prompting strategies.
There is a correlation between performance on other benchmarks and this task.
Models generally recognized as 'best' according to other benchmarks, such as GPT-4o and Claude 3.7 Sonnet, also performed better here.

#### Popular Benchmarks Are Predictive of MongoDB Abilities and Knowledge

There is a correlation between model capability as observed by popular benchmarks (MMLU-Pro, Chatbot ELO, etc.) and capabilities at generating correct driver code.
For this benchmark, MMLU-Pro was the best predictor of model performance, with an R^2 of .615.

Based on these benchmarks, there is reasonable evidence that LLMs get better at MongoDB as they get better *overall*.

**This implies that as models get better generally, they will continue getting better at MongoDB-related tasks.**

#### Prompting Matters Less as Models Improve Overall

It's worth also noting that **prompting strategy mattered less for the higher performing models on the benchmark**.
For instance, the highest performing models Claude-3.7-Sonnet (average XMANeR 86.7%)  and o3-mini (average XMANeR 82.91%)
also had the smallest range between best and worst performing experiments (5.86%).
The worst performing model Mistral 2 Large (average XMANeR 71.2%) had the largest range (18.72%).
The R^2 coefficient between average score and range in scores is .83, indicating a strong correlation between increasing average score and decreasing range.

![prompting avg vs range](https://cdn-uploads.huggingface.co/production/uploads/63a36e208c0c89dcae3c1172/iyuiQsFle_IsSolAmLMDP.png)

#### Prompt Optimization

The follow prompt optimization recommendations:

1. **Prompting strategy matters**: On a high level, there is a meaningful difference in the impact of prompting strategy. How you prompt models matters.  
2. **Include sample documents**: Always include a few representative sample documents for a given collection. This meaningfully improves performance.  
3. **Include latest relevant date**: Include the latest relevant date in the prompt to assist with time-based queries.  
4. **Agentic workflows maximize performance…at a high cost**: Using an Agentic workflow boosts performance across models. This is especially true for models optimized for agentic workflows with tool calling like Claude 3.7  Sonnet, Claude 3.5 Haiku, GPT-4o, and GPT-4o-mini.  
   1. But the trade off is that you get relatively small performance gains for meaningful latency and cost increases.   
   2. For example, the average execution for Claude 3.7 Sonnet with an agentic prompt was 33.4s and used 28639 tokens. This resulted in the highest XMaNeR of the benchmark, at 89.98%. The second best experiment for Claude 3.7 was prompt/completion+default system prompt+chain of thought+annotated schema, which had an XMaNeR of 88.77%. This experiment had an average duration of 9.5 seconds and total tokens of 3202.94. For the 1.21% XMaNeR performance increase, it took 3.5x longer and used 8.94 times more tokens.  
5. **Annotated schemas have a large positive impact:** Including an annotated schema meaningfully improves performance across models.  
   1. You can meaningfully improve performance on NL to Mongosh by including an annotated schema of the database. Example in Optimal Prompt Components section below.   
6. **Interpreted Schemas can have a significant negative impact**: Including an interpreted JSON-schema style schema from documents can confuse the model. This is more evident in less performant models like GPT-4o-mini than more performant ones like Claude 3.7 Sonnet. 

For more information about the specifics of optimal prompting strategies, refer to the [Prompting Recommendations](#prompting-recommendations) section below.

### Developers Should Experiment with Prompting Strategies

These results indicate that prompting strategy has a meaningful impact on performance for text-to-MongoDB code tasks. As noted in the previous section, there are a couple clearly preferable prompting strategies, but others that only work well for given models. Following the general strategies outlined in the 

For instance, providing the chain-of-thought instructions worked quite well for certain models like GPt-4o, but had a significant negative impact on Mistral 2 Large.

## Prompting Recommendations

The following includes sample prompt components for constructing optimal queries. 

### System Prompt Components

You can include the following information in the 'system prompt', applicable to all NL to Mongosh tasks.

#### Base Prompt

```
You are an expert data analyst experienced at using MongoDB.
Your job is to take information about a MongoDB database plus a natural language query and generate a MongoDB shell (mongosh) query to execute to retrieve the information needed to answer the natural language query.

Format the mongosh query in the following structure:

`db.<collection name>.find({/* query */})` or `db.<collection name>.aggregate({/* query */})`
```

#### Default Guidance

```
Some general query-authoring tips:

1. Ensure proper use of MongoDB operators ($eq, $gt, $lt, etc.) and data types (ObjectId, ISODate)
2. For complex queries, use aggregation pipeline with proper stages ($match, $group, $lookup, etc.)
3. Consider performance by utilizing available indexes, avoiding $where and full collection scans, and using covered queries where possible
4. Include sorting (.sort()) and limiting (.limit()) when appropriate for result set management
5. Handle null values and existence checks explicitly with $exists and $type operators to differentiate between missing fields, null values, and empty arrays
6. Do not include `null` in results objects in aggregation, e.g. do not include _id: null
7. For date operations, NEVER use an empty new date object (e.g. `new Date()`). ALWAYS specify the date, such as `new Date("2024-10-24")`. Use the provided 'Latest Date' field to inform dates in queries.
8. For Decimal128 operations, prefer range queries over exact equality
9. When querying arrays, use appropriate operators like $elemMatch for complex matching, $all to match multiple elements, or $size for array length checks
```

#### Chain of Thought Prompt

```
Think step by step by step about the code in the answer before providing it. In your thoughts consider:
1. Which collections are relevant to the query.
2. Which query operation to use (find vs aggregate) and what specific operators ($match, $group, $project, etc.) are needed
3. What fields are relevant to the query.
4. Which indexes you can use to improve performance.
5. Any specific transformations or projections.
6. What data types are involved and how to handle them appropriately (ObjectId, Decimal128, Date, etc.)
7. What edge cases to consider (empty results, null values, missing fields)
8. How to handle any array fields that require special operators ($elemMatch, $all, $size)
9. Any other relevant considerations.
```

### User Message Prompt Components

In the user message, include the database-specific information and the NL query.

#### General User Message Structure

````
Generate MongoDB Shell (mongosh) queries for the following database and natural language query:

## Database Information

Name: <db name>
Description: {{db description}}
Latest Date: {{latest date}}(use this to inform dates in queries)

### Collections

#### Collection `{{collection name. Do for each collection you want to query over}}`
Description: {{collection description}}

Schema:
```
{{interpreted or annotated schema here}}
```

Example documents:
```
{{truncated example documents here}}
```

Indexes:
```
{{collection index descriptions here}}
```

Natural language query: {{Natural language query here}}

````

#### Example Annotated Schema

As structured data:

```javascript
const annotatedDbSchema = {
  name: "sample_supplies",
  description:
    "The 'sample_supplies' database is designed to manage and analyze sales data for a retail business. It captures detailed information about each sale, including the items sold, customer demographics, store location, and purchase methods. This database is essential for understanding sales trends, customer behavior, and inventory management.",
  latestDate: new Date("2025-03-04T21:40:01.112Z"),
  collections: [
    {
      name: "sales",
      description:
        "The 'sales' collection stores detailed records of each sale transaction. It includes information about the sale date, items purchased, store location, customer demographics, and purchase method. This collection is crucial for analyzing sales performance, customer satisfaction, and the effectiveness of marketing strategies. It also helps in tracking inventory levels and understanding customer preferences.",
      schema: `interface Sales {
  /**
   * Unique identifier for the sale.
   */
  _id: ObjectId;
  /**
   * Date and time when the sale was made.
   */
  saleDate: Date;
  /**
   * List of items included in the sale.
   */
  items: Array<{
    /**
     * Name of the item.
     */
    name: string;
    /**
     * Tags associated with the item, useful for categorization.
     */
    tags: string[];
    /**
     * Price of the item.
     */
    price: Decimal128;
    /**
     * Quantity of the item sold.
     */
    quantity: number;
  }>;
  /**
   * Location of the store where the sale was made.
   */
  storeLocation: string;
  /**
   * Information about the customer who made the purchase.
   */
  customer: {
    /**
     * Gender of the customer.
     */
    gender: string;
    /**
     * Age of the customer.
     */
    age: number;
    /**
     * Email address of the customer.
     */
    email: string;
    /**
     * Customer's satisfaction rating for the purchase.
     */
    satisfaction: number;
  };
  /**
   * Indicates whether a coupon was used in the sale.
   */
  couponUsed: boolean;
  /**
   * Method used to make the purchase, e.g., online or in-store.
   */
  purchaseMethod: string;
  /**
   * Hash value for the sale, possibly used for data integrity or quick lookup.
   */
  hash: Long;
}`,
      examples: [
        {
          _id: {
            $oid: "5bd761ddae323e45a93cd590",
          },
          saleDate: {
            $date: "2016-01-03T07:18:22.644Z",
          },
          items: [
            {
              name: "pens",
              tags: ["writing", "office", "school", "...and 1 more items"],
              price: "[Object]",
              quantity: 3,
            },
            {
              name: "laptop",
              tags: ["electronics", "school", "office"],
              price: "[Object]",
              quantity: 3,
            },
            {
              name: "notepad",
              tags: ["office", "writing", "school"],
              price: "[Object]",
              quantity: 2,
            },
            "...and 5 more items",
          ],
          storeLocation: "Denver",
          customer: {
            gender: "M",
            age: 57,
            email: "ce@jucvavih.tj",
            satisfaction: 5,
          },
          couponUsed: true,
          purchaseMethod: "In store",
          hash: {
            low: 1821832792,
            high: -2146986034,
            unsigned: false,
          },
        },
        {
          _id: {
            $oid: "5bd761deae323e45a93ce064",
          },
          saleDate: {
            $date: "2017-08-24T08:56:18.079Z",
          },
          items: [
            {
              name: "binder",
              tags: ["school", "general", "organization"],
              price: "[Object]",
              quantity: 1,
            },
            {
              name: "envelopes",
              tags: ["stationary", "office", "general"],
              price: "[Object]",
              quantity: 6,
            },
            {
              name: "envelopes",
              tags: ["stationary", "office", "general"],
              price: "[Object]",
              quantity: 1,
            },
            "...and 7 more items",
          ],
          storeLocation: "Austin",
          customer: {
            gender: "M",
            age: 45,
            email: "huecu@huffadce.ky",
            satisfaction: 1,
          },
          couponUsed: false,
          purchaseMethod: "In store",
          hash: {
            low: 1867217522,
            high: -2143180348,
            unsigned: false,
          },
        },
      ],
      indexes: [
        {
          v: 2,
          key: {
            _id: 1,
          },
          name: "_id_",
          description:
            "Index on the _id field, which ensures each document has a unique identifier and allows for efficient lookups by _id.",
        },
      ],
    },
  ],
};

```

In prompt:

````
## Database Information

Name: sample_supplies
Description: The 'sample_supplies' database is designed to manage and analyze sales data for a retail business. It captures detailed information about each sale, including the items sold, customer demographics, store location, and purchase methods. This database is essential for understanding sales trends, customer behavior, and inventory management.
Latest Date: Tue Mar 04 2025 16:40:01 GMT-0500 (Eastern Standard Time) (use this to inform dates in queries)

### Collections

#### Collection `sales`
Description: The 'sales' collection stores detailed records of each sale transaction. It includes information about the sale date, items purchased, store location, customer demographics, and purchase method. This collection is crucial for analyzing sales performance, customer satisfaction, and the effectiveness of marketing strategies. It also helps in tracking inventory levels and understanding customer preferences.

Schema:
```
interface Sales {
  /**
   * Unique identifier for the sale.
   */
  _id: ObjectId;
  /**
   * Date and time when the sale was made.
   */
  saleDate: Date;
  /**
   * List of items included in the sale.
   */
  items: Array<{
    /**
     * Name of the item.
     */
    name: string;
    /**
     * Tags associated with the item, useful for categorization.
     */
    tags: string[];
    /**
     * Price of the item.
     */
    price: Decimal128;
    /**
     * Quantity of the item sold.
     */
    quantity: number;
  }>;
  /**
   * Location of the store where the sale was made.
   */
  storeLocation: string;
  /**
   * Information about the customer who made the purchase.
   */
  customer: {
    /**
     * Gender of the customer.
     */
    gender: string;
    /**
     * Age of the customer.
     */
    age: number;
    /**
     * Email address of the customer.
     */
    email: string;
    /**
     * Customer's satisfaction rating for the purchase.
     */
    satisfaction: number;
  };
  /**
   * Indicates whether a coupon was used in the sale.
   */
  couponUsed: boolean;
  /**
   * Method used to make the purchase, e.g., online or in-store.
   */
  purchaseMethod: string;
  /**
   * Hash value for the sale, possibly used for data integrity or quick lookup.
   */
  hash: Long;
}
```

Example documents:
```
{
  "_id": {
    "$oid": "5bd761ddae323e45a93cd590"
  },
  "saleDate": {
    "$date": "2016-01-03T07:18:22.644Z"
  },
  "items": [
    {
      "name": "pens",
      "tags": [
        "writing",
        "office",
        "school",
        "...and 1 more items"
      ],
      "price": "[Object]",
      "quantity": 3
    },
    {
      "name": "laptop",
      "tags": [
        "electronics",
        "school",
        "office"
      ],
      "price": "[Object]",
      "quantity": 3
    },
    {
      "name": "notepad",
      "tags": [
        "office",
        "writing",
        "school"
      ],
      "price": "[Object]",
      "quantity": 2
    },
    "...and 5 more items"
  ],
  "storeLocation": "Denver",
  "customer": {
    "gender": "M",
    "age": 57,
    "email": "ce@jucvavih.tj",
    "satisfaction": 5
  },
  "couponUsed": true,
  "purchaseMethod": "In store",
  "hash": {
    "low": 1821832792,
    "high": -2146986034,
    "unsigned": false
  }
},{
  "_id": {
    "$oid": "5bd761deae323e45a93ce064"
  },
  "saleDate": {
    "$date": "2017-08-24T08:56:18.079Z"
  },
  "items": [
    {
      "name": "binder",
      "tags": [
        "school",
        "general",
        "organization"
      ],
      "price": "[Object]",
      "quantity": 1
    },
    {
      "name": "envelopes",
      "tags": [
        "stationary",
        "office",
        "general"
      ],
      "price": "[Object]",
      "quantity": 6
    },
    {
      "name": "envelopes",
      "tags": [
        "stationary",
        "office",
        "general"
      ],
      "price": "[Object]",
      "quantity": 1
    },
    "...and 7 more items"
  ],
  "storeLocation": "Austin",
  "customer": {
    "gender": "M",
    "age": 45,
    "email": "huecu@huffadce.ky",
    "satisfaction": 1
  },
  "couponUsed": false,
  "purchaseMethod": "In store",
  "hash": {
    "low": 1867217522,
    "high": -2143180348,
    "unsigned": false
  }
}
```

Indexes:
```
{
  "v": 2,
  "key": {
    "_id": 1
  },
  "name": "_id_",
  "description": "Index on the _id field, which ensures each document has a unique identifier and allows for efficient lookups by _id."
}
```
````

### Utility Functions

1. [extractDeterministicSampleOfDocuments()](https://github.com/mongodb/chatbot/blob/EAI-897/packages/benchmarks/src/textToDriver/generateDriverCode/extractDeterministicSampleOfDocuments.ts): Extract random sample of documents from MongoDB collection deterministically. Useful for pulling the same documents for the prompt every time if  you do not have a static set of sample documents to include.  
2. [truncateDbOperationOutputForLlm()](https://github.com/mongodb/chatbot/blob/EAI-897/packages/mongodb-rag-core/src/executeCode/truncateDbOperationOutputForLlm.ts): Truncates documents to make them fit well in the LLM context window.  
3. [getVerySimplifiedSchema()](https://github.com/mongodb/chatbot/blob/EAI-897/packages/mongodb-rag-core/src/executeCode/databaseMetadata/getVerySimplifiedSchema.ts): Interprets a JSON schema-like representation of collection from sample documents. This was used to generate the "interpreted schema" prompt type.  
4. [generateAnnotatedDatabaseInfo()](https://github.com/mongodb/chatbot/blob/EAI-897/packages/mongodb-rag-core/src/executeCode/databaseMetadata/generateAnnotatedDatabaseInfo.ts): Uses LLM to annotate information about a MongoDB database.

## Limitations

### Hard to Compute NormalizedExecutionTimeNonEmpty

We had trouble computing the NormalizedExecutionTimeNonEmpty metric because of the execution environment for the generated code. The executed code was generated in a process spun up by Node.js and run on a laptop. Therefore, there was not clear isolation of the execution environment for the generated code. As a result of separate processes sharing the same resources, there was high variability in the total execution time. Execution times for a given query could vary from approx, 1 second to 10 seconds due to the resource competition.

This made it such that computing NormalizedExecutionTimeNonEmpty was not reliable, and therefore not meaningful.

### Fuzzy Matching Near Misses

While the fuzzy matching logic that we used did a reasonably good job correlating MongoDB query output to the expectations, there were instances where the resulting query was "close" but wrong. For example, this could be a result of an aggregation pipeline that has 7 elements instead of 6, where the extra element is an empty object or some other form of null case.  In these cases, the fuzzy match returns failure, even though the query results were *mostly* correct.

## Source Code

All benchmark source code may be found here: https://github.com/mongodb/chatbot/tree/main/packages/benchmarks/src/textToDriver 

Note that we used the tool [Braintrust](https://braintrust.dev) to orchestrate running the benchmarks.
If you want to run the benchmark yourself, you can either use Braintrust or refactor our orchestration code to suite your use case.
