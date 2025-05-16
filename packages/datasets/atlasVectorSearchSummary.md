You are an expert on MongoDB Atlas Vector Search. Base your answers on the following content:

Page Url: https://mongodb.com/docs/atlas/atlas-vector-search/vector-search-overview/
# Atlas Vector Search Overview

Atlas Vector Search allows querying data based on semantic meaning, supporting use cases like semantic, hybrid, and generative search, including RAG (Retrieval-Augmented Generation). It supports ANN (Approximate Nearest Neighbor) and ENN (Exact Nearest Neighbor) search on specific MongoDB versions.

## What is Vector Search?

Vector search returns results based on semantic meaning, unlike traditional full-text search. It finds vectors close to your query in multi-dimensional space, considering searcher's intent and context.

## Use Cases

- **Semantic Search**: Query vector embeddings using ANN or ENN.
- **Hybrid Search**: Combine semantic and full-text search results.
- **Generative Search**: Implement RAG by ingesting data, retrieving documents, and generating responses using an LLM.

### AI Integrations

Integrate with AI models from OpenAI, AWS, and Google. MongoDB provides tools for implementing RAG.

## Key Concepts

Vectors represent data in multiple dimensions. Dense vectors capture complex relationships. Vector embeddings, created by embedding models, capture meaningful data relationships. Embedding models use LLMs to generate embeddings.

## Atlas Vector Search Indexes

Create indexes to retrieve documents with vector embeddings. Index fields with embeddings and pre-filter data by indexing other fields. Supports embeddings up to 4096 dimensions.

## Atlas Vector Search Queries

Supports ANN and ENN search. Queries use the `$vectorSearch` stage in aggregation pipelines. Customize queries with MQL match expressions and additional aggregation stages.

## Next Steps

For hands-on experience, try the Atlas Vector Search Course on MongoDB University and tutorials. Deploy separate search nodes for optimal performance.

Page Url: https://mongodb.com/docs/atlas/atlas-vector-search/tutorials/vector-search-quick-start/
## Atlas Vector Search Quick Start

This quick start describes how to load sample documents with vector embeddings into an Atlas cluster, create an Atlas Vector Search index, and perform semantic search to return documents similar to your query.

### Objectives

1. Create an index definition for the `sample_mflix.embedded_movies` collection that indexes the `plot_embedding` field as the `vector` type with `1536` dimensions and `dotProduct` similarity.
2. Run an Atlas Vector Search query on the `sample_mflix.embedded_movies` collection using the `$vectorSearch` stage to search the `plot_embedding` field with vector embeddings for the string *time travel*, considering up to `150` nearest neighbors, and returning `10` documents.

### Create a Vector Search Index

#### Atlas UI

1. Create a free Atlas account or sign in.
2. Create a free M0 cluster if you don't have one.
3. Load the sample dataset onto your cluster.
4. Create a Vector Search index using the following JSON definition:
   ```json
   {
       "fields": [{
       "type": "vector",
       "path": "plot_embedding",
       "numDimensions": 1536,
       "similarity": "dotProduct"
       }]
   }
   ```

#### MongoDB Shell

1. Connect to the Atlas cluster using `mongosh`.
2. Switch to the `sample_mflix` database.
3. Run the `db.collection.createSearchIndex()` method:
   ```shell
   db.embedded_movies.createSearchIndex(
     "vector_index",
     "vectorSearch",
     {
       "fields": [
         {
           "type": "vector",
           "path": "plot_embedding",
           "numDimensions": 1536,
           "similarity": "dotProduct"
         }
       ]
     }
   );
   ```

### Run a Vector Search Query

#### Atlas UI

1. Go to the Aggregation tab for the `sample_mflix.embedded_movies` collection.
2. Copy and paste the following query:
   ```json
   [
     {
       "$vectorSearch": {
         "index": "vector_index",
         "path": "plot_embedding",
         "queryVector": [-0.0016261312, -0.028070757, ...],
         "numCandidates": 150,
         "limit": 10
       }
     },
     {
       "$project": {
         "_id": 0,
         "plot": 1,
         "title": 1,
         "score": { $meta: "vectorSearchScore" }
       }
     }
   ]
   ```

#### MongoDB Shell

1. Run the following query using `mongosh`:
   ```json
   db.embedded_movies.aggregate([
     {
       "$vectorSearch": {
         "index": "vector_index",
         "path": "plot_embedding",
         "queryVector": [-0.0016261312, -0.028070757, ...],
         "numCandidates": 150,
         "limit": 10
       }
     },
     {
       "$project": {
         "_id": 0,
         "plot": 1,
         "title": 1,
         "score": { $meta: "vectorSearchScore" }
       }
     }
   ])
   ```

### Learning Summary

- The `sample_mflix.embedded_movies` collection contains movie details with `plot_embedding` field vector embeddings.
- Vector embeddings were created using OpenAI's `text-embedding-ada-002` model.
- The vector search index specifies `1536` dimensions and `dotProduct` similarity.
- The query uses the `$vectorSearch` stage for Approximate Nearest Neighbor (ANN) search and the `$project` stage to refine results.

### Next Steps

- Learn how to create embeddings from data and load them into Atlas.
- Implement retrieval-augmented generation (RAG) with Atlas Vector Search.
- Integrate Atlas Vector Search with AI frameworks and services.
- Build production-ready AI chatbots using Atlas Vector Search.

Page Url: https://mongodb.com/docs/atlas/atlas-vector-search/create-embeddings/
# How to Create Vector Embeddings

Store vector embeddings in Atlas to perform semantic search and implement RAG with Atlas Vector Search.

## Get Started

1. Define a function to generate vector embeddings.
2. Create embeddings from your data and store them in Atlas.
3. Create embeddings from search terms and run a vector search query.

### Prerequisites

- Atlas account with a cluster running MongoDB 6.0.11, 7.0.2, or later.
- Environment to run your project (e.g., terminal, code editor).
- API key from Hugging Face or OpenAI.

### Define an Embedding Function

#### C#

```csharp
namespace MyCompany.Embeddings;
using System;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using System.Net.Http.Headers;

public class AIService
{
    private static readonly string? HuggingFaceAccessToken = Environment.GetEnvironmentVariable("HUGGINGFACE_ACCESS_TOKEN");
    private static readonly HttpClient Client = new HttpClient();
    public async Task<Dictionary<string, float[]>> GetEmbeddingsAsync(string[] texts)
    {
        const string modelName = "mixedbread-ai/mxbai-embed-large-v1";
        const string url = $"https://api-inference.huggingface.co/models/{modelName}";
        Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", HuggingFaceAccessToken);
        var data = new { inputs = texts };
        var dataJson = JsonSerializer.Serialize(data);
        var content = new StringContent(dataJson, null, "application/json");
        var response = await Client.PostAsync(url, content);
        response.EnsureSuccessStatusCode();
        var responseString = await response.Content.ReadAsStringAsync();
        var embeddings = JsonSerializer.Deserialize<float[][]>(responseString);
        if (embeddings is null) throw new ApplicationException("Failed to deserialize embeddings response.");
        Dictionary<string, float[]> documentData = new Dictionary<string, float[]>();
        for (int i = 0; i < embeddings.Length; i++) documentData[texts[i]] = embeddings[i];
        return documentData;
    }
}
```

### Create Embeddings from Data

#### C#

```csharp
namespace MyCompany.Embeddings;
using MongoDB.Driver;
using MongoDB.Bson;

public class DataService
{
    private static readonly string? ConnectionString = Environment.GetEnvironmentVariable("ATLAS_CONNECTION_STRING");
    private static readonly MongoClient Client = new MongoClient(ConnectionString);
    private static readonly IMongoDatabase Database = Client.GetDatabase("sample_db");
    private static readonly IMongoCollection<BsonDocument> Collection = Database.GetCollection<BsonDocument>("embeddings");

    public async Task AddDocumentsAsync(Dictionary<string, float[]> embeddings)
    {
        var documents = new List<BsonDocument>();
        foreach (var kvp in embeddings)
        {
            var document = new BsonDocument { { "text", kvp.Key }, { "embedding", new BsonArray(kvp.Value) } };
            documents.Add(document);
        }
        await Collection.InsertManyAsync(documents);
        Console.WriteLine($"Successfully inserted {embeddings.Count} documents into Atlas");
    }
}
```

### Create Embeddings for Queries

#### C#

```csharp
namespace MyCompany.Embeddings;
using MongoDB.Driver;
using MongoDB.Bson;

public class DataService
{
    private static readonly string? ConnectionString = Environment.GetEnvironmentVariable("ATLAS_CONNECTION_STRING");
    private static readonly MongoClient Client = new MongoClient(ConnectionString);
    private static readonly IMongoDatabase Database = Client.GetDatabase("sample_db");
    private static readonly IMongoCollection<BsonDocument> Collection = Database.GetCollection<BsonDocument>("embeddings");

    public void CreateVectorIndex()
    {
        var searchIndexView = Collection.SearchIndexes;
        var name = "vector_index";
        var type = SearchIndexType.VectorSearch;
        var definition = new BsonDocument
        {
            { "fields", new BsonArray { new BsonDocument { { "type", "vector" }, { "path", "embedding" }, { "numDimensions", 1024 }, { "similarity", "dotProduct" } } } }
        };
        var model = new CreateSearchIndexModel(name, type, definition);
        searchIndexView.CreateOne(model);
        Console.WriteLine($"New search index named {name} is building.");
        bool queryable = false;
        while (!queryable)
        {
            var indexes = searchIndexView.List();
            foreach (var index in indexes.ToEnumerable())
            {
                if (index["name"] == name) queryable = index["queryable"].AsBoolean;
            }
            if (!queryable) Thread.Sleep(5000);
        }
        Console.WriteLine($"{name} is ready for querying.");
    }

    public List<BsonDocument>? PerformVectorQuery(float[] vector)
    {
        var vectorSearchStage = new BsonDocument
        {
            { "$vectorSearch", new BsonDocument { { "index", "vector_index" }, { "path", "embedding" }, { "queryVector", new BsonArray(vector) }, { "exact", true }, { "limit", 5 } } }
        };
        var projectStage = new BsonDocument
        {
            { "$project", new BsonDocument { { "_id", 0 }, { "text", 1 }, { "score", new BsonDocument { { "$meta", "vectorSearchScore" } } } } }
        };
        var pipeline = new[] { vectorSearchStage, projectStage };
        return Collection.Aggregate<BsonDocument>(pipeline).ToList();
    }
}
```

### Considerations

#### Choosing a Method to Create Embeddings

- **Load an open-source model**: No API key needed.
- **Use a proprietary model**: Requires API key.
- **Leverage an integration**: Connect to open-source and proprietary models.

#### Choosing an Embedding Model

- **Embedding Dimensions**: Balance between efficiency and complexity.
- **Max Tokens**: Number of tokens in a single embedding.
- **Model Size**: Larger models require more resources.
- **Retrieval Average**: Higher score indicates better ranking of relevant documents.

#### Validating Your Embeddings

- **Test functions and scripts**: Use a small subset of data.
- **Create embeddings in batches**: Avoid memory issues.
- **Evaluate performance**: Check relevance and ranking of search results.

#### Troubleshooting

- **Verify your environment**: Ensure dependencies are up-to-date.
- **Monitor memory usage**: Check RAM, CPU, and disk usage.
- **Ensure consistent dimensions**: Match index and query embedding dimensions.

## Next Steps

- Implement retrieval-augmented generation (RAG) with Atlas Vector Search.
- Convert embeddings to BSON vectors for efficient storage.

Page Url: https://mongodb.com/docs/atlas/atlas-vector-search/vector-search-type/
# How to Index Fields for Vector Search

Use the `vectorSearch` type to index fields for `$vectorSearch` queries. Define the index for vector embeddings and values (boolean, date, objectId, numeric, string, UUID) for pre-filtering data. Use Atlas UI, API, CLI, `mongosh`, or MongoDB Driver to create the index.

## Considerations

- Index arrays with a single element.
- Convert embeddings to BSON BinData `vector` subtype `float32`, `int1`, or `int8`.
- Preview features: BSON BinData `vector` subtype `int1`, automatic scalar and binary quantization.
- Elevated resource consumption on idle nodes due to mongot process.

## Supported Clients

Supported MongoDB Drivers: C (1.28.0+), C++ (3.11.0+), C# (3.1.0+), Go (1.16.0+), Java (5.2.0+), Kotlin (5.2.0+), Node (6.6.0+), PHP (1.20.0+), Python (4.7+), Rust (3.1.0+), Scala (5.2.0+).

## Syntax

```json
{
  "fields":[
    {
      "type": "vector",
      "path": "<field-to-index>",
      "numDimensions": <number-of-dimensions>,
      "similarity": "euclidean | cosine | dotProduct",
      "quantization": "none | scalar | binary"
    },
    {
      "type": "filter",
      "path": "<field-to-index>"
    }
  ]
}
```

## Atlas Vector Search Index Fields

- `fields`: Array of documents, required.
- `fields.type`: String, required (`vector` or `filter`).
- `fields.path`: String, required.
- `fields.numDimensions`: Int, required for `vector` type.
- `fields.similarity`: String, required for `vector` type (`euclidean`, `cosine`, `dotProduct`).
- `fields.quantization`: String, optional (`none`, `scalar`, `binary`).

### About the `vector` Type

- Types: BSON `double`, BinData `vector` subtype `float32`, `int1`, `int8`.

### About the Similarity Functions

- `euclidean`: Measures distance between vector ends.
- `cosine`: Measures similarity based on angle.
- `dotProduct`: Measures similarity considering vector magnitude.

## Create an Atlas Vector Search Index

### Prerequisites

- MongoDB version `6.0.11`, `7.0.2`, or higher.
- Collection for the index.

### Required Access

- `Project Data Access Admin` or higher role.

### Procedure

Use Atlas API, CLI, UI, `mongosh`, or supported MongoDB Driver.

### Example (Atlas API)

```shell
curl --user "{PUBLIC-KEY}:{PRIVATE-KEY}" --digest \
--header "Accept: application/json" \
--header "Content-Type: application/json" \
--include \
--request POST "https://cloud.mongodb.com/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/search/indexes" \
--data '
  {
    "database": "sample_mflix",
    "collectionName": "embedded_movies",
    "type": "vectorSearch",
    "name": "vector_index",
    "definition": {
      "fields":[
        {
          "type": "vector",
          "path": "plot_embedding",
          "numDimensions": 1536,
          "similarity": "dotProduct"
        },
        {
          "type": "filter",
          "path": "genres"
        },
        {
          "type": "filter",
          "path": "year"
        }
      ]
    }
  }'
```

## View an Atlas Vector Search Index

### Required Access

- `Project Search Index Editor` or higher role.

### Procedure

Use Atlas API, CLI, UI, `mongosh`, or supported MongoDB Driver.

### Example (Atlas API)

```shell
curl --user "{PUBLIC-KEY}:{PRIVATE-KEY}" --digest \
     --header "Accept: application/json" \
     --include \
     --request GET "https://cloud.mongodb.com/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/search/indexes/{databaseName}/{collectionName}"
```

## Edit an Atlas Vector Search Index

### Required Access

- `Project Search Index Editor` or higher role.

### Procedure

Use Atlas API, CLI, UI, `mongosh`, or supported MongoDB Driver.

### Example (Atlas API)

```shell
curl --user "{PUBLIC-KEY}:{PRIVATE-KEY}" --digest --include \
     --header "Accept: application/json" \
     --header "Content-Type: application/json" \
     --request PATCH "https://cloud.mongodb.com/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/search/indexes/{indexId}" \
     --data'
       {
         "database": "sample_mflix",
         "collectionName": "embedded_movies",
         "type": "vectorSearch",
         "name": "vector_index",
           "definition": {
             "fields":[
               {
                 "type": "vector",
                 "path": "plot_embedding",
                 "numDimensions": 1536,
                 "similarity": "dotProduct"
               },
               {
                 "type": "filter",
                 "path": "genres"
               },
               {
                 "type": "filter",
                 "path": "year"
               }
             ]
           ]
         }'
```

## Delete an Atlas Vector Search Index

### Required Access

- `Project Search Index Editor` or higher role.

### Procedure

Use Atlas API, CLI, UI, `mongosh`, or supported MongoDB Driver.

### Example (Atlas API)

```shell
curl --user "{PUBLIC-KEY}:{PRIVATE-KEY}" --digest \
     --header "Accept: application/json" \
     --include \
     --request DELETE "https://cloud.mongodb.com/api/atlas/v2/groups/{groupId}/clusters/{clusterName}/search/indexes/{indexId}"
```

## Index Status

- `Not Started`: Index build not started.
- `Initial Sync`: Index building or rebuilding.
- `Active`: Index ready to use.
- `Recovering`: Replication error.
- `Failed`: Index build failed.
- `Delete in Progress`: Index being deleted.

Page Url: https://mongodb.com/docs/atlas/atlas-vector-search/vector-search-stage/
# Run Vector Search Queries

Atlas Vector Search queries take the form of an aggregation pipeline stage. For the `$vectorSearch` queries, Atlas Vector Search returns the results of your semantic search.

## Definition

The `$vectorSearch` stage performs an ANN (Approximate Nearest Neighbor) or ENN (Exact Nearest Neighbor) search on a vector in the specified field.

### ANN (Approximate Nearest Neighbor) Search

Atlas Vector Search finds vector embeddings closest to the query vector using the Hierarchical Navigable Small Worlds algorithm, ideal for large datasets without significant filtering.

### ENN (Exact Nearest Neighbor) Search

Atlas Vector Search exhaustively searches all indexed vector embeddings to find the exact nearest neighbor, recommended for determining recall and accuracy, querying less than 10000 documents, or using selective pre-filters.

## Syntax

The field to search must be indexed as Atlas Vector Search vector type inside a vectorSearch index type.

```json
{
  "$vectorSearch": {
    "exact": true | false,
    "filter": {<filter-specification>},
    "index": "<index-name>",
    "limit": <number-of-results>,
    "numCandidates": <number-of-candidates>,
    "path": "<field-to-search>",
    "queryVector": [<array-of-numbers>]
  }
}
```

## Fields

- `exact`: Optional boolean to specify ENN or ANN search.
- `filter`: Optional document for pre-filtering.
- `index`: Required string for the index name.
- `limit`: Required number of documents to return.
- `numCandidates`: Optional number of nearest neighbors to consider.
- `path`: Required string for the indexed vector field.
- `queryVector`: Required array of numbers representing the query vector.

## Behavior

`$vectorSearch` must be the first stage of any pipeline where it appears.

### Atlas Vector Search Index

Index fields to search using the `$vectorSearch` stage inside a vectorSearch type index definition.

### Atlas Vector Search Score

Atlas Vector Search assigns a score from `0` to `1` to every document it returns. Use `$project` stage to include the score in the results.

```javascript
db.<collection>.aggregate([
  {
    "$vectorSearch": {
      <query-syntax>
    }
  },
  {
    "$project": {
      "<field-to-include>": 1,
      "<field-to-exclude>": 0,
      "score": { "$meta": "vectorSearchScore" }
    }
  }
])
```

### Atlas Vector Search Pre-Filter

The `$vectorSearch` `filter` option matches BSON boolean, date, objectId, numeric, string, and UUID values. Supported MQL match expressions include `$gt`, `$lt`, `$gte`, `$lte`, `$eq`, `$ne`, `$in`, `$nin`, `$nor`, `$not`, `$and`, `$or`.

### Limitations

`$vectorSearch` is supported only on Atlas clusters running MongoDB v6.0.11, v7.0.2, or later. It can't be used in view definition and certain pipeline stages.

### Supported Clients

Run `$vectorSearch` queries using the Atlas UI, `mongosh`, and any MongoDB driver.

### Parallel Query Execution Across Segments

Dedicated Search Nodes are recommended for improved query performance. Atlas Vector Search parallelizes query execution across segments of data.

## Examples

### ANN (Approximate Nearest Neighbor) Examples

#### MongoDB Shell

```json
db.embedded_movies.aggregate([
  {
    "$vectorSearch": {
      "index": "vector_index",
      "path": "plot_embedding",
      "queryVector": [-0.0016261312, -0.028070757, ...],
      "numCandidates": 150,
      "limit": 10
    }
  },
  {
    "$project": {
      "_id": 0,
      "plot": 1,
      "title": 1,
      "score": { $meta: "vectorSearchScore" }
    }
  }
])
```

#### Filter Example

```json
db.embedded_movies.aggregate([
  {
    "$vectorSearch": {
      "index": "vector_index",
      "path": "plot_embedding",
      "filter": {
        "$and": [
          { "year": { "$gt": 1955 } },
          { "year": { "$lt": 1975 } }
        ]
      },
      "queryVector": [0.02421053, -0.022372592, ...],
      "numCandidates": 150,
      "limit": 10
    }
  },
  {
    "$project": {
      "_id": 0,
      "title": 1,
      "plot": 1,
      "year": 1,
      "score": { $meta: "vectorSearchScore" }
    }
  }
])
```

### ENN (Exact Nearest Neighbor) Example

#### MongoDB Shell

```shell
db.embedded_movies.aggregate([
  {
    "$vectorSearch": {
      "index": "vector_index",
      "path": "plot_embedding",
      "queryVector": [-0.006954097, -0.009932499, ...],
      "exact": true,
      "limit": 10
    }
  },
  {
    "$project": {
      "_id": 0,
      "plot": 1,
      "title": 1,
      "score": { $meta: "vectorSearchScore" }
    }
  }
])
```

Page Url: https://mongodb.com/docs/atlas/atlas-vector-search/vector-quantization/
# Vector Quantization

Atlas Vector Search supports:
- Ingestion of BSON BinData `vector` subtype `int1`.
- Automatic scalar and binary quantization.

Quantization reduces memory usage by shrinking vectors into fewer bits, improving storage and speed. Recommended for applications with over 10M vectors.

### Scalar Quantization
Maps float values to discrete integers, reducing RAM cost to one fourth.

### Binary Quantization
Assigns binary values based on a midpoint, reducing RAM cost to one twenty-fourth. Efficient for embeddings normalized to length `1`.

## Requirements

| Requirement | For `int1` Ingestion | For `int8` Ingestion | For Automatic Scalar Quantization | For Automatic Binary Quantization |
|-------------|----------------------|----------------------|-----------------------------------|-----------------------------------|
| Index settings | No | No | Yes | Yes |
| BSON `binData` format | Yes | Yes | No | No |
| Storage on mongod | `binData(int1)` | `binData(int8)` | `binData(float32)`, `array(float32)` | `binData(float32)`, `array(float32)` |
| Similarity method | `euclidean` | `cosine`, `euclidean`, `dotProduct` | `cosine`, `euclidean`, `dotProduct` | `cosine`, `euclidean`, `dotProduct` |
| Number of Dimensions | Multiple of 8 | 1 to 4096 | 1 to 4096 | Multiple of 8 |
| ENN Search | ENN on `int1` | ENN on `int8` | ENN on `float32` | ENN on `float32` |

## Enable Automatic Quantization

Specify quantization type in `fields.quantization`:
- `scalar`: byte vectors from 32-bit input vectors.
- `binary`: bit vectors from 32-bit input vectors.

## Ingest Pre-Quantized Vectors

Convert embeddings to BSON BinData `vector` subtype `float32`, `int1`, or `int8`.

### Procedure

#### Install Libraries
```shell
pip install pymongo --quiet --upgrade pymongo cohere
```

#### Load Data
```shell
data = [
   "The Great Wall of China is visible from space.",
   "The Eiffel Tower was completed in Paris in 1889.",
   "Mount Everest is the highest peak on Earth at 8,848m.",
   "Shakespeare wrote 37 plays and 154 sonnets during his lifetime.",
   "The Mona Lisa was painted by Leonardo da Vinci.",
]
```

#### Generate Embeddings
```python
import os
import cohere

os.environ["COHERE_API_KEY"] = "<COHERE-API-KEY>"
cohere_client = cohere.Client(os.environ["COHERE_API_KEY"])

generated_embeddings = cohere_client.embed(
   texts=data,
   model="embed-english-v3.0",
   input_type="search_document",
   embedding_types=["float", "int8", "ubinary"]
).embeddings

float32_embeddings = generated_embeddings.float
int8_embeddings = generated_embeddings.int8
int1_embeddings = generated_embeddings.ubinary
```

#### Generate BSON Vectors
```python
from bson.binary import Binary, BinaryVectorDtype

def generate_bson_vector(vector, vector_dtype):
   return Binary.from_vector(vector, vector_dtype)

bson_float32_embeddings = [generate_bson_vector(f32_emb, BinaryVectorDtype.FLOAT32) for f32_emb in float32_embeddings]
bson_int8_embeddings = [generate_bson_vector(int8_emb, BinaryVectorDtype.INT8) for int8_emb in int8_embeddings]
bson_int1_embeddings = [generate_bson_vector(int1_emb, BinaryVectorDtype.PACKED_BIT) for int1_emb in int1_embeddings]
```

#### Create Documents
```python
float32_field = "<FIELD-NAME-FOR-FLOAT32-TYPE>"
int8_field = "<FIELD-NAME-FOR-INT8-TYPE>"
int1_field = "<FIELD-NAME-FOR-INT1-TYPE>"

documents = [
    {
        "_id": i,
        "data": text,
        float32_field: bson_f32_emb,
        int8_field: bson_int8_emb,
        int1_field: bson_int1_emb
    }
    for i, (bson_f32_emb, bson_int8_emb, bson_int1_emb, text) in enumerate(zip(bson_float32_embeddings, bson_int8_embeddings, bson_int1_embeddings, data))
]
```

#### Load Data into Atlas
```python
import pymongo

mongo_client = pymongo.MongoClient("<ATLAS-CONNECTION-STRING>")
db = mongo_client["<DB-NAME>"]
collection = db["<COLLECTION-NAME>"]
collection.insert_many(documents)
```

#### Create Vector Search Index
```python
from pymongo.operations import SearchIndexModel
import time

index_name = "<INDEX-NAME>"
search_index_model = SearchIndexModel(
  definition={
    "fields": [
      {"type": "vector", "path": float32_field, "similarity": "dotProduct", "numDimensions": 1024},
      {"type": "vector", "path": int8_field, "similarity": "dotProduct", "numDimensions": 1024},
      {"type": "vector", "path": int1_field, "similarity": "euclidean", "numDimensions": 1024}
    ]
  },
  name=index_name,
  type="vectorSearch"
)
result = collection.create_search_index(model=search_index_model)
```

#### Run Vector Search Query
```python
def run_vector_search(query_text, collection, path):
  query_text_embeddings = cohere_client.embed(
    texts=[query_text],
    model="embed-english-v3.0",
    input_type="search_query",
    embedding_types=["float", "int8", "ubinary"]
  ).embeddings

  if path == float32_field:
    query_vector = query_text_embeddings.float[0]
    vector_dtype = BinaryVectorDtype.FLOAT32
  elif path == int8_field:
    query_vector = query_text_embeddings.int8[0]
    vector_dtype = BinaryVectorDtype.INT8
  elif path == int1_field:
    query_vector = query_text_embeddings.ubinary[0]
    vector_dtype = BinaryVectorDtype.PACKED_BIT
  bson_query_vector = generate_bson_vector(query_vector, vector_dtype)

  pipeline = [
    {'$vectorSearch': {'index': index_name, 'path': path, 'queryVector': bson_query_vector, 'numCandidates': 5, 'limit': 2}},
    {'$project': {'_id': 0, 'data': 1, 'score': {'$meta': 'vectorSearchScore'}}}
  ]

  return collection.aggregate(pipeline)

query_text = "tell me a science fact"
float32_results = run_vector_search(query_text, collection, float32_field)
int8_results = run_vector_search(query_text, collection, int8_field)
int1_results = run_vector_search(query_text, collection, int1_field)
```

Page Url: https://mongodb.com/docs/atlas/atlas-vector-search/rag/
# Retrieval-Augmented Generation (RAG) with Atlas Vector Search

Retrieval-augmented generation (RAG) augments large language models (LLMs) with additional data for more accurate responses. Implement RAG by combining an LLM with Atlas Vector Search.

## Why use RAG?

LLMs have limitations like stale data, no access to local data, and hallucinations. RAG addresses these by:
1. **Ingestion:** Store custom data as vector embeddings in MongoDB Atlas.
2. **Retrieval:** Retrieve semantically similar documents using Atlas Vector Search.
3. **Generation:** Use retrieved documents as context for the LLM to generate accurate responses.

## RAG with Atlas Vector Search

### Ingestion

Store custom data in Atlas as vector embeddings:

```go
// Go example
package main

import (
	"context"
	"log"
	"os"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func main() {
	ctx := context.Background()
	if err := godotenv.Load(); err != nil {
		log.Fatal("no .env file found")
	}
	uri := os.Getenv("ATLAS_CONNECTION_STRING")
	clientOptions := options.Client().ApplyURI(uri)
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatalf("failed to connect to the server: %v", err)
	}
	defer client.Disconnect(ctx)
	coll := client.Database("rag_db").Collection("test")
	// Ingest data logic here
}
```

### Retrieval

Retrieve relevant documents with Atlas Vector Search:

```go
// Go example
package main

import (
	"context"
	"log"
	"os"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func main() {
	ctx := context.Background()
	if err := godotenv.Load(); err != nil {
		log.Fatal("no .env file found")
	}
	uri := os.Getenv("ATLAS_CONNECTION_STRING")
	clientOptions := options.Client().ApplyURI(uri)
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatalf("failed to connect to the server: %v", err)
	}
	defer client.Disconnect(ctx)
	coll := client.Database("rag_db").Collection("test")
	queryEmbedding := []float32{ /* embedding data */ }
	vectorSearchStage := bson.D{
		{"$vectorSearch", bson.D{
			{"index", "vector_index"},
			{"path", "embedding"},
			{"queryVector", queryEmbedding},
			{"exact", true},
			{"limit", 5},
		}},
	}
	projectStage := bson.D{
		{"$project", bson.D{
			{"_id", 0},
			{"pageContent", 1},
			{"score", bson.D{{"$meta", "vectorSearchScore"}}},
		}},
	}
	cursor, err := coll.Aggregate(ctx, mongo.Pipeline{vectorSearchStage, projectStage})
	if err != nil {
		log.Fatalf("failed to execute the aggregation pipeline: %v", err)
	}
	var results []bson.M
	if err = cursor.All(ctx, &results); err != nil {
		log.Fatalf("failed to unmarshal retrieved documents: %v", err)
	}
	log.Println(results)
}
```

### Generation

Generate responses using an LLM:

```go
// Go example
package main

import (
	"context"
	"log"
	"strings"
	"github.com/tmc/langchaingo/llms"
	"github.com/tmc/langchaingo/llms/huggingface"
	"github.com/tmc/langchaingo/prompts"
)

func main() {
	ctx := context.Background()
	query := "AI Technology"
	documents := []string{ /* retrieved documents */ }
	var textDocuments strings.Builder
	for _, doc := range documents {
		textDocuments.WriteString(doc)
	}
	question := "In a few sentences, what are MongoDB's latest AI announcements?"
	template := prompts.NewPromptTemplate(
		`Answer the following question based on the given context.
			Question: {{.question}}
			Context: {{.context}}`,
		[]string{"question", "context"},
	)
	prompt, err := template.Format(map[string]any{
		"question": question,
		"context":  textDocuments.String(),
	})
	opts := llms.CallOptions{
		Model:       "mistralai/Mistral-7B-Instruct-v0.3",
		MaxTokens:   150,
		Temperature: 0.1,
	}
	llm, err := huggingface.New(huggingface.WithModel("mistralai/Mistral-7B-Instruct-v0.3"))
	if err != nil {
		log.Fatalf("failed to initialize a Hugging Face LLM: %v", err)
	}
	completion, err := llms.GenerateFromSinglePrompt(ctx, llm, prompt, llms.WithOptions(opts))
	if err != nil {
		log.Fatalf("failed to generate a response from the prompt: %v", err)
	}
	response := strings.Split(completion, "\n\n")
	if len(response) == 2 {
		log.Printf("Prompt: %v\n\n", response[0])
		log.Printf("Response: %v\n", response[1])
	}
}
```

## Get Started

### Prerequisites

- Atlas account with a cluster running MongoDB version 6.0.11, 7.0.2, or later.
- Hugging Face Access Token.
- Development environment setup (Go, Java, Node.js, Python).

### Procedure

1. **Set up the environment.**
2. **Create functions for ingestion, retrieval, and generation.**
3. **Run the code to ingest data, retrieve documents, and generate responses.**

## Next Steps

- Integrate Vector Search with AI Technologies.
- Build a Local RAG Implementation with Atlas Vector Search.
- Use the MongoDB Chatbot Framework for production-ready chatbots.
- Optimize and fine-tune your RAG applications.

Page Url: https://mongodb.com/docs/atlas/atlas-vector-search/deployment-options/
# Review Deployment Options

Structure your Atlas cluster with different deployment types, cloud providers, and cluster tiers to meet pre-production or production needs.

| Environment            | Deployment Type                          | Cluster Tier                          | Cloud Provider Region | Node Architecture                                  |
|------------------------|------------------------------------------|---------------------------------------|-----------------------|----------------------------------------------------|
| Testing Queries        | Shared or dedicated cluster              | `M0`, `M2`, `M5`, or higher tier      | All                   | MongoDB and Search processes on the same node      |
| Prototyping Applications | Dedicated cluster                        | `M10`, `M20`, or higher tier          | All                   | MongoDB and Search processes on the same node      |
| Production             | Dedicated cluster with separate Search Nodes | `M10` or higher cluster tier, `S30` or higher search tier | AWS, Azure, Google Cloud | MongoDB and Search processes on different nodes    |

## Testing and Prototyping Environments

### Deployment Type

For testing, use shared or dedicated clusters or local deployments.

#### Cluster Tiers

- Shared clusters: `M0`, `M2`, `M5`
- Dedicated clusters: `M10` and higher

#### Cloud Provider and Region

All cluster tiers are available in all supported cloud provider regions.

### Node Architecture

Search `mongot` process runs alongside `mongod` on each node.

### Limitations

Resource contention between `mongod` and `mongot` processes may impact performance. Recommended for testing and prototyping only.

## Production Environment

### Deployment Type

Use dedicated clusters.

### Cluster Tiers

- Dedicated clusters: `M10` and higher
- Deploy dedicated Search Nodes for workload isolation.

### Cloud Provider and Region

Search Nodes available in all Google Cloud regions, subset of AWS and Azure regions.

### Node Architecture

`mongot` process runs on separate Search Nodes. Atlas deploys Search Nodes with each cluster or shard.

### Benefits

- Efficient resource utilization
- Independent scaling of search deployment
- Concurrent query processing

### Size and Scale Your Cluster

Ensure enough memory for Atlas Vector Search index and JVM. Index size depends on vector size and metadata.

| Embedding Model          | Vector Dimension | Space Requirement |
|--------------------------|------------------|-------------------|
| OpenAI `text-embedding-ada-002` | 1536             | 6kb               |
| Google `text-embedding-gecko`   | 768              | 3kb               |
| Cohere `embed-english-v3.0`     | 1024             | 1.07kb            |

Use BinData or quantized vectors to reduce storage and RAM requirements.

### Migrate to Dedicated Search Nodes

1. Upgrade to `M10` or higher cluster tier.
2. Ensure deployment in regions where Search Nodes are available.
3. Enable and configure Search Nodes for workload isolation.

Page Url: https://mongodb.com/docs/atlas/atlas-vector-search/tutorials/vector-search-tutorial/
## How to Perform Semantic Search Against Data in Your Atlas Cluster

### Prerequisites
- Atlas cluster with MongoDB v6.0.11 or v7.0.2+
- Sample data loaded into your Atlas cluster
- MongoDB Driver: `mongosh`, MongoDB C# Driver, MongoDB Go Driver, MongoDB Java Driver, MongoDB Node Driver, PyMongo

### Create the Atlas Vector Search Index

#### Atlas UI
1. Go to Clusters page, select project, click Clusters.
2. Go to Atlas Search page, click Create Search Index.
3. Select JSON Editor, enter `vector_index` as Index Name.
4. Replace default definition:
```json
{
  "fields": [
    {
      "type": "vector",
      "path": "plot_embedding",
      "numDimensions": 1536,
      "similarity": "dotProduct"
    },
    {
      "type": "filter",
      "path": "genres"
    },
    {
      "type": "filter",
      "path": "year"
    }
  ]
}
```
5. Click Create Search Index.

#### MongoDB Shell
```shell
use sample_mflix
db.embedded_movies.createSearchIndex(
  "vector_index",
  "vectorSearch",
  {
    "fields": [
      {
        "type": "vector",
        "path": "plot_embedding",
        "numDimensions": 1536,
        "similarity": "dotProduct"
      },
      {
        "type": "filter",
        "path": "genres"
      },
      {
        "type": "filter",
        "path": "year"
      }
    ]
  }
);
```

#### C#
```csharp
var client = new MongoClient("<connection-string>");
var database = client.GetDatabase("sample_mflix");
var collection = database.GetCollection<BsonDocument>("embedded_movies");
var searchIndexView = collection.SearchIndexes;
var name = "vector_index";
var type = SearchIndexType.VectorSearch;
var definition = new BsonDocument
{
    { "fields", new BsonArray
        {
            new BsonDocument
            {
                { "type", "vector" },
                { "path", "plot_embedding" },
                { "numDimensions", 1536 },
                { "similarity", "dotProduct" }
            },
            new BsonDocument
            {
                {"type", "filter"},
                {"path", "genres"}
            },
            new BsonDocument
            {
                {"type", "filter"},
                {"path", "year"}
            }
        }
    }
};
var model = new CreateSearchIndexModel(name, type, definition);
searchIndexView.CreateOne(model);
```

#### Go
```go
clientOptions := options.Client().ApplyURI("<connectionString>")
client, err := mongo.Connect(ctx, clientOptions)
coll := client.Database("sample_mflix").Collection("embedded_movies")
indexName := "vector_index"
opts := options.SearchIndexes().SetName(indexName).SetType("vectorSearch")
vectorDefinition := vectorDefinitionField{
    Type: "vector", Path: "plot_embedding", NumDimensions: 1536, Similarity: "dotProduct"}
genreFilterDefinition := filterField{"filter", "genres"}
yearFilterDefinition := filterField{"filter", "year"}
indexModel := mongo.SearchIndexModel{
    Definition: bson.D{{"fields", [3]interface{}{
        vectorDefinition, genreFilterDefinition, yearFilterDefinition}}},
    Options: opts,
}
searchIndexName, err := coll.SearchIndexes().CreateOne(ctx, indexModel)
```

#### Java (Sync)
```java
String uri = "<connectionString>";
try (MongoClient mongoClient = MongoClients.create(uri)) {
    MongoDatabase database = mongoClient.getDatabase("sample_mflix");
    MongoCollection<Document> collection = database.getCollection("embedded_movies");
    String indexName = "vector_index";
    Bson definition = new Document(
        "fields",
        Arrays.asList(
            new Document("type", "vector")
                .append("path", "plot_embedding")
                .append("numDimensions", 1536)
                .append("similarity", "dotProduct"),
            new Document("type", "filter")
                .append("path", "genres"),
            new Document("type", "filter")
                .append("path", "year")));
    SearchIndexModel indexModel = new SearchIndexModel(
        indexName, definition, SearchIndexType.vectorSearch());
    collection.createSearchIndexes(Collections.singletonList(indexModel));
}
```

#### Node.js
```javascript
const { MongoClient } = require("mongodb");
const uri = "<connectionString>";
const client = new MongoClient(uri);
async function run() {
    const database = client.db("sample_mflix");
    const collection = database.collection("embedded_movies");
    const index = {
        name: "vector_index",
        type: "vectorSearch",
        definition: {
            "fields": [
                {
                    "type": "vector",
                    "numDimensions": 1536,
                    "path": "plot_embedding",
                    "similarity": "dotProduct"
                },
                {
                    "type": "filter",
                    "path": "genres"
                },
                {
                    "type": "filter",
                    "path": "year"
                }
            ]
        }
    }
    await collection.createSearchIndex(index);
}
run().catch(console.dir);
```

#### Python
```python
from pymongo.mongo_client import MongoClient
from pymongo.operations import SearchIndexModel
client = MongoClient("<connectionString>")
database = client["sample_mflix"]
collection = database["embedded_movies"]
search_index_model = SearchIndexModel(
  definition={
    "fields": [
      {
        "type": "vector",
        "path": "plot_embedding",
        "numDimensions": 1536,
        "similarity": "dotProduct"
      },
      {
        "type": "filter",
        "path": "genres"
      },
      {
        "type": "filter",
        "path": "year"
      }
    ]
  },
  name="vector_index",
  type="vectorSearch",
)
collection.create_search_index(model=search_index_model)
```

### Run Queries Using the `$vectorSearch` Aggregation Pipeline Stage

#### MongoDB Shell
```shell
use sample_mflix
db.embedded_movies.aggregate([
  {
    "$vectorSearch": {
      "index": "vector_index",
      "path": "plot_embedding",
      "filter": {
        "$and": [{
          "genres": {
            "$nin": ["Drama", "Western", "Crime"] ,
            "$in": ["Action", "Adventure", "Family"]
          },
        }, {
          "year": {
            "$gte": 1960,
            "$lte": 2000
          }
        }]
      },
      "queryVector": [-0.020156775, -0.024996493, ...],
      "numCandidates": 200,
      "limit": 10
    }
  },
  {
    "$project": {
      "_id": 0,
      "title": 1,
      "genres": 1,
      "plot": 1,
      "year": 1,
      "score": { $meta: "vectorSearchScore" }
    }
  }
])
```

#### C#
```csharp
var filter = Builders<BsonDocument>.Filter.And(
    Builders<BsonDocument>.Filter.And(
        Builders<BsonDocument>.Filter.Nin("genres", ["Drama", "Western", "Crime"]),
        Builders<BsonDocument>.Filter.In("genres", ["Action", "Adventure", "Family"])
    ),
    Builders<BsonDocument>.Filter.And(
        Builders<BsonDocument>.Filter.Gte("year", 1960),
        Builders<BsonDocument>.Filter.Lte("year", 2000)
    )
);
var options = new VectorSearchOptions<BsonDocument>()
{
    IndexName = "vector_index",
    Filter = filter,
    NumberOfCandidates = 200,
};
var pipeline = new EmptyPipelineDefinition<BsonDocument>()
    .VectorSearch("plot_embedding", queryVector, 10, options)
    .Project(Builders<BsonDocument>.Projection
        .Exclude("_id")
        .Include("title")
        .Include("genres")
        .Include("plot")
        .Include("year")
        .Meta("score", "vectorSearchScore")
    );
return Collection.Aggregate<BsonDocument>(pipeline).ToList();
```

#### Go
```go
queryVector := [1536]float64{-0.020156775, -0.024996493, ...}
genresFilterCondition := bson.D{
    {"$and", bson.A{
        bson.D{{"genres", bson.D{{"$nin", bson.A{"Drama", "Western", "Crime"}}}}},
        bson.D{{"genres", bson.D{{"$in", bson.A{"Action", "Adventure", "Family"}}}}},
    }}}
yearFilterCondition := bson.D{
    {"$and", bson.A{
        bson.D{{"year", bson.D{{"$gte", 1960}}}},
        bson.D{{"year", bson.D{{"$lte", 2000}}}},
    }},
}
filter := bson.D{{"$and", bson.A{genresFilterCondition, yearFilterCondition}}}
vectorSearchStage := bson.D{
    {"$vectorSearch", bson.D{
        {"index", "vector_index"},
        {"path", "plot_embedding"},
        {"filter", filter},
        {"queryVector", queryVector},
        {"numCandidates", 200},
        {"limit", 10},
    }},
}
projectStage := bson.D{
    {"$project", bson.D{
        {"_id", 0},
        {"plot", 1},
        {"title", 1},
        {"genres", 1},
        {"year", 1},
        {"score", bson.D{{"$meta", "vectorSearchScore"}}},
    }}}
cursor, err := coll.Aggregate(ctx, mongo.Pipeline{vectorSearchStage, projectStage})
```

#### Java (Sync)
```java
List<Double> queryVector = (asList(-0.020156775, -0.024996493, ...));
String indexName = "vector_index";
FieldSearchPath fieldSearchPath = fieldPath("plot_embedding");
int numCandidates = 200;
int limit = 10;
List<String> genresNotInCriteria = Arrays.asList("Drama", "Western", "Crime");
List<String> genresInCriteria = Arrays.asList("Action", "Adventure", "Family");
Bson criteria = Filters.and(
    Filters.nin("genres", genresNotInCriteria),
    Filters.in("genres", genresInCriteria),
    Filters.gte("year", 1960),
    Filters.lte("year", 2000));
VectorSearchOptions options = VectorSearchOptions
    .approximateVectorSearchOptions(numCandidates)
    .filter(criteria);
List<Bson> pipeline = asList(
    vectorSearch(fieldSearchPath, queryVector, indexName, limit, options),
    project(fields(exclude("_id"), include("title"), include("plot"), include("year"), include("genres"), metaVectorSearchScore("score"))));
collection.aggregate(pipeline).forEach(doc -> System.out.println(doc.toJson()));
```

#### Node.js
```javascript
const agg = [
  {
    '$vectorSearch': {
      'index': 'vector_index',
      'path': 'plot_embedding',
      'filter': {
        '$and': [
          {
            'genres': {
              '$nin': ['Drama', 'Western', 'Crime'],
              '$in': ['Action', 'Adventure', 'Family']
            }
          }, {
            'year': {
              '$gte': 1960,
              '$lte': 2000
            }
          }
        ]
      },
      'queryVector': [-0.020156775, -0.024996493, ...],
      'numCandidates': 200,
      'limit': 10
    }
  }, {
    '$project': {
      '_id': 0,
      'title': 1,
      'genres': 1,
      'plot': 1,
      'year': 1,
      'score': {'$meta': 'vectorSearchScore'}
    }
  }
];
const result = coll.aggregate(agg);
await result.forEach((doc) => console.dir(JSON.stringify(doc)));
```

#### Python
```python
pipeline = [
  {
    '$vectorSearch': {
      'index': 'vector_index',
      'path': 'plot_embedding',
      'filter': {
        '$and': [
          {
            'genres': {
              '$nin': ['Drama', 'Western', 'Crime'],
              '$in': ['Action', 'Adventure', 'Family']
            }
          }, {
            'year': {
              '$gte': 1960,
              '$lte': 2000
            }
          }
        ]
      },
      'queryVector': [-0.020156775, -0.024996493, ...],
      'numCandidates': 200,
      'limit': 10
    }
  }, {
    '$project': {
      '_id': 0,
      'title': 1,
      'genres': 1,
      'plot': 1,
      'year': 1,
      'score': {'$meta': 'vectorSearchScore'}
    }
  }
]
result = client["sample_mflix"]["embedded_movies"].aggregate(pipeline)
for i in result:
    print(i)
```

Page Url: https://mongodb.com/docs/atlas/atlas-vector-search/tutorials/reciprocal-rank-fusion/
# Perform Hybrid Search with Atlas Vector Search and Atlas Search

Combine Atlas Vector Search and Atlas Search queries for unified results.

## Steps:

1. Create an Atlas Vector Search index on `plot_embedding`.
2. Create an Atlas Search index on `title`.
3. Run a query using reciprocal rank fusion to combine `$vectorSearch` and `$search` results.

## Why Hybrid Search?

Combines full-text and semantic search for comprehensive results. Set weights for each method per query.

## Reciprocal Rank Fusion

Combines results from different search methods:
1. Calculate reciprocal rank: `reciprocal_rank = 1 / (r + rank_constant)`.
2. Apply weights: `weighted_reciprocal_rank = w x reciprocal_rank`.
3. Combine and sort results by combined score.

## Prerequisites

- Atlas cluster with MongoDB v6.0.11 or v7.0.2+.
- Sample data loaded.
- Clients: Search Tester, `mongosh`, Compass, C#, Java, Node, PyMongo.
- `Project Data Access Admin` access.

## Create Indexes

### MongoDB Shell

#### Vector Search Index

```shell
use sample_mflix
db.embedded_movies.createSearchIndex(
  "rrf-vector-search",
  "vectorSearch",
  {
    "fields": [
      {
        "type": "vector",
        "path": "plot_embedding",
        "numDimensions": 1536,
        "similarity": "dotProduct"
      }
    ]
  }
);
```

#### Full-Text Search Index

```shell
use sample_mflix
db.embedded_movies.createSearchIndex(
  "rrf-full-text-search",
  "search",
  {
    "mappings": {
      "dynamic": false,
      "fields": {
        "title": [{
          "type": "string"
        }]
      }
    }
  }
);
```

### Node.js

#### Vector Search Index

```javascript
import { MongoClient } from 'mongodb';
const client = new MongoClient(process.env.ATLAS_CONNECTION_STRING);

async function run() {
  try {
    const database = client.db("sample_mflix");
    const collection = database.collection("embedded_movies");
    const index = {
      name: "rrf-vector-search",
      type: "vectorSearch",
      definition: {
        "fields": [
          {
            "type": "vector",
            "numDimensions": 1536,
            "path": "plot_embedding",
            "similarity": "dotProduct"
          }
        ]
      }
    }
    const result = await collection.createSearchIndex(index);
    console.log(result);
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
```

#### Full-Text Search Index

```javascript
import { MongoClient } from 'mongodb';
const client = new MongoClient(process.env.ATLAS_CONNECTION_STRING);

async function run() {
  try {
    const database = client.db("sample_mflix");
    const collection = database.collection("embedded_movies");
    const index = {
      name: "rrf-full-text-search",
      type: "search",
      definition: {
        "mappings": {
          "dynamic": false,
          "fields": {
            "title": [{
              "type": "string"
            }]
          }
        }
      }
    }
    const result = await collection.createSearchIndex(index);
    console.log(result);
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
```

## Run Combined Query

### MongoDB Shell

```js
var vector_weight = 0.1;
var full_text_weight = 0.9;
db.embedded_movies.aggregate([
  {
    "$vectorSearch": {
      "index": "rrf-vector-search",
      "path": "plot_embedding",
      "queryVector": [-0.003091304, -0.018973768, ...],
      "numCandidates": 100,
      "limit": 20
    }
  }, {
    "$group": {
      "_id": null,
      "docs": {"$push": "$$ROOT"}
    }
  }, {
    "$unwind": {
      "path": "$docs",
      "includeArrayIndex": "rank"
    }
  }, {
    "$addFields": {
      "vs_score": {
        "$multiply": [
          vector_weight, {
            "$divide": [
              1.0, {
                "$add": ["$rank", 60]
              }
            ]
          }
        ]
      }
    }
  }, {
    "$project": {
      "vs_score": 1,
      "_id": "$docs._id",
      "title": "$docs.title"
    }
  },
  {
    "$unionWith": {
      "coll": "embedded_movies",
      "pipeline": [
        {
          "$search": {
            "index": "rrf-full-text-search",
            "phrase": {
              "query": "star wars",
              "path": "title"
            }
          }
        }, {
          "$limit": 20
        }, {
          "$group": {
            "_id": null,
            "docs": {"$push": "$$ROOT"}
          }
        }, {
          "$unwind": {
            "path": "$docs",
            "includeArrayIndex": "rank"
          }
        }, {
          "$addFields": {
            "fts_score": {
              "$multiply": [
                full_text_weight, {
                  "$divide": [
                    1.0, {
                      "$add": ["$rank", 60]
                    }
                  ]
                }
              ]
            }
          }
        },
        {
          "$project": {
            "fts_score": 1,
            "_id": "$docs._id",
            "title": "$docs.title"
          }
        }
      ]
    }
  },
  {
    "$group": {
      "_id": "$_id",
      "title": {"$first": "$title"},
      "vs_score": {"$max": "$vs_score"},
      "fts_score": {"$max": "$fts_score"}
    }
  },
  {
    "$project": {
      "_id": 1,
      "title": 1,
      "vs_score": {"$ifNull": ["$vs_score", 0]},
      "fts_score": {"$ifNull": ["$fts_score", 0]}
    }
  },
  {
    "$project": {
      "score": {"$add": ["$fts_score", "$vs_score"]},
      "_id": 1,
      "title": 1,
      "vs_score": 1,
      "fts_score": 1
    }
  },
  {"$sort": {"score": -1}},
  {"$limit": 10}
])
```

### Node.js

```javascript
import { MongoClient } from 'mongodb';

async function run() {
  const client = new MongoClient(process.env.ATLAS_CONNECTION_STRING);
  try {
    await client.connect();
    const database = client.db("sample_mflix");
    const collection = database.collection("embedded_movies");

    const vectorWeight = 0.1;
    const fullTextWeight = 0.9;
    const pipeline = [
      {
        "$vectorSearch": {
          "index": "rrf-vector-search",
          "path": "plot_embedding",
          "queryVector": [-0.003091304, -0.018973768, ...],
          "numCandidates": 100,
          "limit": 20
        }
      }, {
        "$group": {
          "_id": null,
          "docs": {"$push": "$$ROOT"}
        }
      }, {
        "$unwind": {
          "path": "$docs",
          "includeArrayIndex": "rank"
        }
      }, {
        "$addFields": {
          "vs_score": {
            "$multiply": [
              vectorWeight, {
                "$divide": [
                  1.0, {
                    "$add": ["$rank", 60]
                  }
                ]
              }
            ]
          }
        }
      }, {
        "$project": {
          "vs_score": 1,
          "_id": "$docs._id",
          "title": "$docs.title"
        }
      }, {
        "$unionWith": {
          "coll": "embedded_movies",
          "pipeline": [
            {
              "$search": {
                "index": "rrf-full-text-search",
                "phrase": {
                  "query": "star wars",
                  "path": "title"
                }
              }
            }, {
              "$limit": 20
            }, {
              "$group": {
                "_id": null,
                "docs": {"$push": "$$ROOT"}
              }
            }, {
              "$unwind": {
                "path": "$docs",
                "includeArrayIndex": "rank"
              }
            }, {
              "$addFields": {
                "fts_score": {
                  "$multiply": [
                    fullTextWeight, {
                      "$divide": [
                        1.0, {
                          "$add": ["$rank", 60]
                        }
                      ]
                    }
                  ]
                }
              }
            },
            {
              "$project": {
                "fts_score": 1,
                "_id": "$docs._id",
                "title": "$docs.title"
              }
            }
          ]
        }
      }, {
        "$group": {
          "_id": "$_id",
          "title": {"$first": "$title"},
          "vs_score": {"$max": "$vs_score"},
          "fts_score": {"$max": "$fts_score"}
        }
      }, {
        "$project": {
          "_id": 1,
          "title": 1,
          "vs_score": {"$ifNull": ["$vs_score", 0]},
          "fts_score": {"$ifNull": ["$fts_score", 0]}
        }
      }, {
        "$project": {
          "score": {"$add": ["$fts_score", "$vs_score"]},
          "_id": 1,
          "title": 1,
          "vs_score": 1,
          "fts_score": 1
        }
      },
      {"$sort": {"score": -1}},
      {"$limit": 10}
    ];

    const result = collection.aggregate(pipeline);
    for await (const doc of result) {
      console.log(doc);
    }
  } catch (err) {
    console.log(err.stack);
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
```

Page Url: https://mongodb.com/docs/atlas/atlas-vector-search/tutorials/local-rag/
# Build a Local RAG Implementation with Atlas Vector Search

This tutorial demonstrates how to implement retrieval-augmented generation (RAG) locally. Actions include:

1. Create a local Atlas deployment or deploy a cluster on the cloud.
2. Set up the environment.
3. Use a local embedding model to generate vector embeddings.
4. Create an Atlas Vector Search index on your data.
5. Use a local LLM to answer questions on your data.

## Background

Create a local Atlas deployment using the Atlas CLI or deploy a cluster on the cloud. Local deployments are for testing only.

## Prerequisites

Install the Atlas CLI, MongoDB Command Line Database Tools, and other necessary tools for your chosen language (C#, Go, Java, Node.js, Python).

## Create a Local Deployment or Atlas Cluster

Create a local deployment using the Atlas CLI or deploy a cluster on the cloud. Load the sample AirBnB listings dataset.

## Set Up the Environment

### C#

Initialize your .NET project, install dependencies, and set your connection string as an environment variable.

### Go

Initialize your Go project, install dependencies, and create a `.env` file to store your connection string.

### Java

Create your Java project, install dependencies, and set your environment variable.

### Node.js

Initialize your Node.js project, install dependencies, and create a `.env` file to store your connection string.

### Python

Create a directory for your project, create an interactive Python notebook, install dependencies, and define your Atlas connection string.

## Generate Embeddings with a Local Model

### C#

Download the local embedding model, generate embeddings, and update documents with the new embeddings.

### Go

Download the local embedding model, generate embeddings, and update documents with the new embeddings.

### Java

Download the local embedding model, generate embeddings, and update documents with the new embeddings.

### Node.js

Download the local embedding model, generate embeddings, and update documents with the new embeddings.

### Python

Download the local embedding model, generate embeddings, and update documents with the new embeddings.

## Create the Atlas Vector Search Index

Create an Atlas Vector Search index programmatically with a supported MongoDB Driver or using the Atlas CLI.

### Supported Driver

#### C#

Define the Atlas Vector Search index and create it using the MongoDB C# driver.

#### Go

Define the Atlas Vector Search index and create it using the MongoDB Go driver.

#### Java

Define the Atlas Vector Search index and create it using the MongoDB Java driver.

#### Node.js

Define the Atlas Vector Search index and create it using the MongoDB Node driver.

#### Python

Define the Atlas Vector Search index and create it using the PyMongo driver.

### Atlas CLI

Define the Atlas Vector Search index and create it using the Atlas CLI.

## Answer Questions with the Local LLM

### C#

Query the database for relevant documents, download the local LLM model, and answer questions on your data.

### Go

Query the database for relevant documents, download the local LLM model, and answer questions on your data.

### Java

Query the database for relevant documents, download the local LLM model, and answer questions on your data.

### Node.js

Query the database for relevant documents, download the local LLM model, and answer questions on your data.

### Python

Query the database for relevant documents, download the local LLM model, and answer questions on your data.

Page Url: https://mongodb.com/docs/atlas/atlas-vector-search/ai-integrations/
# Integrate Vector Search with AI Technologies

Use Atlas Vector Search with AI providers and LLMs through their APIs. MongoDB and partners offer integrations for RAG and AI-powered applications. For a full list, see Explore MongoDB Partner Ecosystem.

## Frameworks

Integrate Atlas Vector Search with these frameworks for RAG:

### LangChain

LangChain simplifies LLM applications using "chains." Resources:
- Integrate Atlas Vector Search with LangChain.
- LangChain JS/TS Integration.

### LlamaIndex

LlamaIndex connects custom data sources to LLMs, aiding in vector embeddings for RAG. Resource:
- LlamaIndex Integration.

### Semantic Kernel

Microsoft Semantic Kernel combines AI services with applications for RAG. Tutorials:
- Semantic Kernel C# Integration.
- Semantic Kernel Python Integration.

### Haystack

Haystack builds custom LLM applications for question-answering and RAG. Resource:
- Haystack Integration.

### Spring AI

Spring AI applies Spring design principles to AI applications for semantic search and RAG. Resource:
- Spring AI Integration.

## Services

Integrate Atlas Vector Search with:

### Amazon Bedrock Knowledge Base

Amazon Bedrock builds generative AI applications, using Atlas Vector Search for RAG. Resource:
- Amazon Bedrock Knowledge Base Integration.

## API Resources

Refer to these API resources for AI integrations with Atlas Vector Search:
- LangChain Python API Reference
- LangChain JS/TS API Reference
- LlamaIndex API Reference
- Semantic Kernel Python API Reference
- Semantic Kernel C# API Reference
- Haystack API Reference
- Spring AI API Reference

Page Url: https://mongodb.com/docs/atlas/atlas-vector-search/evaluate-results/
# How to Measure the Accuracy of Your Query Results

Measure the accuracy of your Atlas Vector Search query by comparing ANN (Approximate Nearest Neighbor) search results with ENN (Exact Nearest Neighbor) search results.

## Use Cases

- Quantized vectors
- Large numbers of vectors
- Low dimensional vectors

## Prerequisites

- An Atlas cluster
- `mongosh`

## Procedures

1. Create an Atlas Vector Search index on the vector field.
2. Run the ENN query followed by the ANN query.
3. Compare the results.

### Create the Atlas Vector Search Index

1. Go to the Clusters page for your project.
2. Go to the Atlas Search page for your cluster.
3. Create an Atlas Vector Search index.
4. Enter the Index Name, Database, and Collection.
5. Specify an index definition:

```json
{
  "fields": [
    {
      "numDimensions": 1536,
      "path": "plot_embedding",
      "similarity": "euclidean",
      "type": "vector",
      "quantization": "binary"
    },
    {
      "path": "genres",
      "type": "filter"
    }
  ]
}
```

6. Click Create Search Index.

### Run the Queries

1. Connect to your Atlas cluster using `mongosh`.
2. Switch to your database:

```sh
use sample_mflix
```

3. Run your ENN query:

```shell
db.embedded_movies.aggregate([
  {
    "$vectorSearch": {
      "index": "vector_index",
      "path": "plot_embedding",
      "filter": {
        "$and": [
          { "genres": { "$eq": "Action" } },
          { "genres": { "$ne": "Western" } }
        ]
      },
      "queryVector": [...],
      "exact": true,
      "limit": 10
    }
  },
  {
    "$project": {
      "_id": 0,
      "plot": 1,
      "title": 1,
      "genres": 1,
      "score": { $meta: "vectorSearchScore" }
    }
  }
])
```

4. Run your ANN query:

```shell
db.embedded_movies.aggregate([
  {
    "$vectorSearch": {
      "index": "vector_index",
      "path": "plot_embedding",
      "filter": {
        "$and": [
          { "genres": { "$eq": "Action" } },
          { "genres": { "$ne": "Western" } }
        ]
      },
      "queryVector": [...],
      "numCandidates": 100,
      "limit": 10
    }
  },
  {
    "$project": {
      "_id": 0,
      "plot": 1,
      "title": 1,
      "genres": 1,
      "score": { $meta: "vectorSearchScore" }
    }
  }
])
```

### Compare the Results

Compare the top results of ENN and ANN queries. If discrepancies are large, tune the `numCandidates` value. Compute "jaccard similarity" for recall performance.

Page Url: https://mongodb.com/docs/atlas/atlas-vector-search/tune-vector-search/
# Improve Vector Search Performance

Atlas Vector Search enables ANN queries for similar results. To improve indexing speed and query performance, follow these best practices:

## Reduce Vector Dimensions

Atlas Vector Search supports up to `4096` vector dimensions. Reduce dimensions to improve performance, ensuring accuracy is maintained.

## Avoid Indexing Vectors When Running Queries

Avoid indexing during vector searches. Re-index new vectors into a new index if changing the embedding model.

## Pre-Filter Data

Use the `filter` option in the `$vectorSearch` pipeline to narrow the search scope and improve performance.

## Use Dedicated Search Nodes

Deploy the `mongot` process on dedicated Search Nodes to avoid resource contention and enable parallel segment search.

## Exclude Vector Fields From the Results

Use the `$project` stage to exclude vector fields from results to improve query performance.

## Ensure Enough Memory

Ensure data nodes have enough RAM for vector data and indexes. Deploy separate Search Nodes for efficient memory usage.

## Warm up the Filesystem Cache

Initial queries may have high latency due to random disk seeks. Cache warming improves subsequent query performance.

## Use `binData` Vectors

`binData` vectors provide storage savings and support alternative types, accelerating query latency.

## Quantize the Vector Embeddings

Scalar quantization reduces precision but retains information. Binary quantization is better for QAT embedding models.

Page Url: https://mongodb.com/docs/atlas/atlas-vector-search/troubleshooting/
# Troubleshooting

Advice for troubleshooting Atlas Vector Search. For direct assistance, start a discussion on the MongoDB Developer Community or contact support.

## Cannot use the `$vectorSearch` stage on Atlas cluster

To use `$vectorSearch`, your cluster must run MongoDB 6.0.11+ or 7.0.2+. If not, you might see:

```sh
OperationFailure: $vectorSearch is not allowed with the current
configuration. You may need to enable the corresponding feature
flag.
```

Check MongoDB version in Atlas Clusters page. If earlier than 6.0.11 or 7.0.2, upgrade the cluster.

## Slow queries

See Improve Vector Search Performance for recommendations.

## `$vectorSearch` returns no results

- Use the same embedding model for data and query.
- Ensure Atlas Vector Search index has finished building.

## `Error during document retrieval` with LangChain

Error:

```js
Error during the document retrieval or generation process:
MongoServerError: PlanExecutor error during aggregation :: caused
by :: Path 'field' needs to be indexed as token
```

Ensure `field` is indexed as an Atlas Vector Search index. See Answer Questions on Your Data for more.

## `Command not found` when creating Atlas Vector Search index

Occurs if:
- Cluster runs MongoDB earlier than 6.0.11 or 7.0.2. Upgrade required.
- Command run against `M0` Free Tier cluster. Use Atlas UI if compatible version.

## Unable to filter on a given field

Supports filtering on boolean, date, number, objectId, string, and UUID fields. See About the `filter` Type.

