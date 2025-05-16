<guide>
<guide_topic>Atlas Vector Search</guide_topic>
<section>
<title>Atlas Vector Search Overview</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/vector-search-overview/</url>
<description>Use MongoDB Atlas Vector Search to create vector indexes and perform vector search, including semantic search and hybrid search, on your vector embeddings.</description>

# Atlas Vector Search Cheat-Sheet

Atlas lets you store embeddings (dense float arrays ≤ 8192 dims) alongside documents and query them with the `$vectorSearch` agg stage.

Cluster requirements  
- ANN (HNSW): MongoDB 6.0.11 / 7.0.2+  
- ENN (exact): 6.0.16 / 7.0.10 / 7.3.2+

Use cases: semantic, hybrid (combine FTS & vector), generative/RAG (retrieve then feed to LLM).

Key terms  
- Embedding model ⇒ fixes vector length; create via any ML/LLM provider (OpenAI, AWS, Google, etc.).  
- Similarity = distance between vectors.  
- Dense vectors pack more semantics than sparse.

Indexing  
```jsonc
{
  "fields": {
    "embedding": { "type": "vector", "dims": 1536 },
    "category":   { "type": "string" }            // optional filter fields
  }
}
```

Queries (Node.js)  
```js
const query = {
  index: "vecIdx",
  path: "embedding",
  queryVector: qVec,      // Float64Array or number[]
  k: 10,
  numCandidates: 100,     // HNSW only
  filter: { category: "fruit" }, // MQL pre-filter
  similarity: "cosine"    // or "dotProduct","euclidean"
};

const docs = await db.collection("items").aggregate([
  { $vectorSearch: query },
  { $project: { score: { $meta: "vectorSearchScore" }, name: 1 } }
]).toArray();
```

Process: choose ANN or ENN, optional filter fields are evaluated first, engine returns k nearest vectors, you can pipe further agg stages.

Tips  
- Hybrid search: prepend `$vectorSearch`, append `$search` (FTS) then merge scores.  
- Deploy dedicated Search Nodes for low-latency concurrent queries.
</section>
<section>
<title>Atlas Vector Search Quick Start</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/tutorials/vector-search-quick-start/</url>
<description>Learn how to create and manage an Atlas Vector Search index for vector embeddings and perform vector search on the indexed field.</description>

# Atlas Vector Search Quick Start (Node.js)

Install
```bash
npm i mongodb
```

## 1. Create Vector Index  
Indexes `sample_mflix.embedded_movies.plot_embedding` (OpenAI ada-002, 1536 dims).

```js
// vector-index.js
const {MongoClient} = require("mongodb");
const uri = "<connectionString>";
const client = new MongoClient(uri);

(async () => {
  try {
    const coll = client.db("sample_mflix").collection("embedded_movies");
    const index = {
      name: "vector_index",
      type: "vectorSearch",
      definition: {
        fields: [{
          type: "vector",
          path: "plot_embedding",
          numDimensions: 1536,
          similarity: "dotProduct",
          quantization: "scalar"
        }]
      }
    };
    const idxName = await coll.createSearchIndex(index);
    console.log(`Building ${idxName}…`);
    while (true) {
      const cur = coll.listSearchIndexes();
      for await (const i of cur)
        if (i.name === idxName && i.queryable) return console.log("Index ready");
      await new Promise(r => setTimeout(r, 5e3));
    }
  } finally { await client.close(); }
})();
```

## 2. Run Vector Search
Embeddings below represent “time travel” with ada-002 (truncate for brevity).

```js
// vector-query.js
const {MongoClient} = require("mongodb");
const client = new MongoClient("<connectionString>");
(async () => {
  await client.connect();
  const coll = client.db("sample_mflix").collection("embedded_movies");
  const pipeline = [
    {
      $vectorSearch: {
        index: "vector_index",
        path: "plot_embedding",
        queryVector: [-0.0016261312, -0.028070757, /* ... 1534 more */],
        numCandidates: 150,
        limit: 10,
        quantization: "scalar"
      }
    },
    {
      $project: {
        _id: 0, title: 1, plot: 1,
        score: {$meta: "vectorSearchScore"}
      }
    }
  ];
  for await (const doc of coll.aggregate(pipeline)) console.log(doc);
  await client.close();
})();
```

Output shows top-10 semantically similar movie plots with `score`.

## Key Facts
* Field type `vector`, `numDimensions` must match embedding model.
* Similarity options: `dotProduct`, `cosine`, `euclidean`.
* `quantization:"scalar"` reduces index size & speeds search.
* `$vectorSearch` supports ANN (`numCandidates`) and optional `filter`.

Use the same pattern for any collection containing embeddings (text, images, etc.).
</section>
<section>
<title>How to Create Vector Embeddings</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/create-embeddings/</url>
<description>Learn how to create vector embeddings for Atlas Vector Search, choose an embedding model, and ensure that your embeddings are correct and optimal.</description>

# Atlas Vector Search – Embeddings (Node.js)

## 1 Prereqs
- Atlas cluster ≥6.0.11, IP allow-list.
- Node.js & npm.
- `OPENAI_API_KEY` if using OpenAI.
- `ATLAS_CONNECTION_STRING="mongodb+srv://<user>:<pwd>@<cluster>.mongodb.net"`  
  `.env` recommended (Node ≥20: `--env-file=.env`).

```bash
npm i mongodb @xenova/transformers openai
```

## 2 Generate Embeddings

### 2.1 Open-source (Hugging Face)

```js
// get-embeddings.js
import { pipeline } from '@xenova/transformers';
export async function getEmbedding(text){
  const embed=await pipeline('feature-extraction',
    'Xenova/nomic-embed-text-v1');
  return Array.from((await embed(text,{pooling:'mean',normalize:true})).data);
}
```

### 2.2 OpenAI

```js
// get-embeddings.js
import OpenAI from 'openai';
const openai=new OpenAI({apiKey:process.env.OPENAI_API_KEY});
export async function getEmbedding(text){
  return (
    await openai.embeddings.create({
      model:'text-embedding-3-small',
      input:text,
      encoding_format:'float'
    })
  ).data[0].embedding;
}
```

### (Optional) Compress to `binData`

```js
// convert-embeddings.js
import { Binary } from 'mongodb';
export const toBson = emb =>
  Binary.fromFloat32Array(new Float32Array(emb));
```

## 3 Insert Data + Embeddings

```js
// create-embeddings.js
import { MongoClient } from 'mongodb';
import { getEmbedding } from './get-embeddings.js';           // pick impl
// import { toBson } from './convert-embeddings.js';

const texts=[
  'Titanic: …luxury liner…',
  'The Lion King: …identity',
  'Avatar: …moon Pandora…'
];

(async ()=>{
  const cli=new MongoClient(process.env.ATLAS_CONNECTION_STRING);
  await cli.connect();
  const col=cli.db('sample_db').collection('embeddings');

  const docs=await Promise.all(texts.map(async t=>{
    let emb=await getEmbedding(t);
    // emb=toBson(emb);              // if compressing
    return {text:t,embedding:emb};
  }));
  await col.insertMany(docs,{ordered:false});
  console.log('Inserted',docs.length);
  await cli.close();
})();
```

## 4 Create Vector Index

```js
// create-index.js
import { MongoClient } from 'mongodb';
const dims=768;                // HF:768 | OpenAI:1536
const idx={
  name:'vector_index',
  type:'vectorSearch',
  definition:{fields:[{
    type:'vector',path:'embedding',similarity:'dotProduct',
    numDimensions:dims
  }]}
};
(async ()=>{
  const col=new MongoClient(process.env.ATLAS_CONNECTION_STRING)
           .db('sample_db').collection('embeddings');
  console.log(await col.createSearchIndex(idx));
})();
```

## 5 Query

```js
// vector-query.js
import { MongoClient } from 'mongodb';
import { getEmbedding } from './get-embeddings.js';

(async ()=>{
  const cli=new MongoClient(process.env.ATLAS_CONNECTION_STRING);
  await cli.connect();
  const col=cli.db('sample_db').collection('embeddings');

  const queryEmb=await getEmbedding('ocean tragedy');
  const pipe=[
    {$vectorSearch:{
      index:'vector_index',path:'embedding',queryVector:queryEmb,
      exact:true,limit:5}},
    {$project:{_id:0,text:1,score:{$meta:'vectorSearchScore'}}}
  ];
  for await (const doc of col.aggregate(pipe)) console.log(doc);
  await cli.close();
})();
```

## 6 Best Practices & Notes
- Batched generation prevents OOM; test on small samples first.
- Ensure index `numDimensions` matches model output.
- `binData` compression cuts storage ×3 and speeds queries (driver ≥ Node 6.11).
- Monitor RAM/CPU; upgrade if vector workload grows.
- Evaluate results (precision/recall) and tune similarity, index, model choice.

## 7 Model Selection Hints
- Dimensions: fewer→cheaper; more→richer semantics.
- Max tokens: input size per embedding.
- Retrieval score (e.g., MTEB) indicates RAG quality.
- Open-source: free/local (nomic-embed-text-v1, 768 dims).  
  Proprietary: OpenAI `text-embedding-3-small`, 1536 dims.

## 8 Next Steps
- Implement RAG pipelines with Atlas Vector Search.
- Explore vector quantization for further storage/query gains.
</section>
<section>
<title>How to Index Fields for Vector Search</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/vector-search-type/</url>
<description>Use the Atlas Vector Search type to index vector embeddings for vector search using the vectorSearch type.</description>

# Atlas Vector Search – Indexing Guide

## Overview
* Index type: `vectorSearch`; queried with `$vectorSearch`.
* Each index’s `fields` array contains **≥1 `vector` field** and optional `filter` fields.
* Max vector length: **8192 dims**.
* Supported scalar types: `double`, `binData(float32|int8|int1)`.
* Recommended: store vectors as BSON BinData `float32/int8/int1` for space.
* Arrays: only single-element arrays allowed; no indexing inside arrays of documents/objects.
* Similarity: `euclidean`, `cosine`, `dotProduct` (unit-length required for dot product).
* Quantization (for float vectors):  
  `none` (default) | `scalar` (1-byte ints) | `binary` (bit; dims %8 == 0).
* Resource tip: idle cluster CPU rises due to mongot; size nodes accordingly.

## Index JSON
```jsonc
{
  "fields": [
    {                 // VECTOR FIELD
      "type": "vector",
      "path": "<field>",
      "numDimensions": <1-8192>,
      "similarity": "euclidean|cosine|dotProduct",
      "quantization": "none|scalar|binary" // optional
    },
    {                 // FILTER FIELD (optional, repeatable)
      "type": "filter",
      "path": "<field>"
    }
  ]
}
```

## Create Limits & Roles
Cluster MongoDB ≥ 6.0.11 / 7.0.2; role `Project Data Access Admin+`.  
Index count caps: M0 3 | M2 5 | M5/Flex 10 | M10+ ≈2500 recommended.  
Node.js driver ≥ 6.6.0.

## Node.js Recipes

### Create Index
```js
// npm i mongodb@^6.6
const { MongoClient } = require("mongodb");
const uri = "<ATLAS_URI>";
const client = new MongoClient(uri);

async function createIndex() {
  const coll = client.db("sample_mflix").collection("embedded_movies");
  const idx = {
    name: "vector_index",
    type: "vectorSearch",
    definition: {
      fields: [
        { type: "vector", path: "plot_embedding", numDimensions: 1536,
          similarity: "dotProduct", quantization: "scalar" },
        { type: "filter", path: "genres" },   // optional pre-filters
        { type: "filter", path: "year" }
      ]
    }
  };
  const name = await coll.createSearchIndex(idx);
  console.log(`Building ${name}…`);
  // wait until queryable
  for (;;) {
    const [info] = await coll.listSearchIndexes(name).toArray();
    if (info?.queryable) break;
    await new Promise(r => setTimeout(r, 5000));
  }
  console.log("Index ready");
}
createIndex().finally(()=>client.close());
```

### View Index(es)
```js
const list = await coll.listSearchIndexes(/* optional name */).toArray();
console.log(list);
```

### Edit Index
```js
await coll.updateSearchIndex("vector_index", {
  name:"vector_index", type:"vectorSearch",
  definition:{ fields:[ /* new definition */ ] }
});
```

### Delete Index
```js
await coll.dropSearchIndex("vector_index");
```

## Index Status Values
* **Not Started** – build hasn’t begun  
* **Initial Sync** – building/rebuilding; new queries blocked (new index) or use old version (edit).  
* **Active** – ready.  
* **Recovering** – oplog gap; index usable but stale.  
* **Failed** – build error.  
* **Delete in Progress** – being removed.

### Document Counter
`Documents` column shows `<indexed>/<total>` and % while building.

---
</section>
<section>
<title>Run Vector Search Queries</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/vector-search-stage/</url>
<description>Explore how to perform vector search queries using Atlas Vector Search, supporting both Approximate and Exact Nearest Neighbor searches.</description>

# Run Vector Search Queries

Atlas `$vectorSearch` aggregation stage performs Approximate (`exact:false|omit`) or Exact (`exact:true`) nearest-neighbor search on vector fields indexed with an Atlas **vectorSearch** index.

## Cluster Support
* ANN (v6.0.11, 7.0.2+), ENN (v6.0.16, 7.0.10, 7.3.2+).

## Stage Syntax
```jsonc
{
  $vectorSearch: {
    // One of: numCandidates | exact:true (if both omitted ⇒ exact:false)
    exact: false,                // Boolean, optional
    numCandidates: 100,          // 1-10000, ≥ limit
    filter: { /* MQL pre-filter */},
    index: "vector_index",       // Required
    limit: 10,                   // Required, int
    path: "vecField",            // Field with embeddings
    queryVector: [ ... ]         // float32 | BinData float32/int8/int1
  }
}
```
`limit` ≤ `numCandidates`.  For ANN, start with `numCandidates ≈ limit × 20`.  

## Filters
Vector search pre-filters accept only the following MQL operators on indexed **filter** fields (bool/date/oid/num/string/uuid + arrays):

`$eq $ne $gt $lt $gte $lte $in $nin $and $or $not $nor`  
(Short `$eq` form allowed.)

Example:
```json
"filter": { "$and":[ { "genres":"Action" },
                      { "year":{ "$in":[1999,2000,2001] }} ] }
```

## Behavior & Limits
* `$vectorSearch` **must be first** in a pipeline and cannot appear in view definitions, `$lookup` sub-pipelines, or `$facet` stage.
* Results include a 0-1 similarity score accessible with `{ "$meta":"vectorSearchScore" }`.
  ```
  score = (1+cosine|dot(v1,v2))/2
  score = 1/(1+euclidean(v1,v2))
  ```
* Parallelized across segments on dedicated Search Nodes; higher `numCandidates` mitigates variability.

## Tuning `numCandidates`
Higher values improve recall but raise latency. Increase for:
* large collections,
* small `limit`,
* quantized vectors (`int8`/`int1`) vs `float32`.

## Node.js Examples

### ANN – basic
```js
const { MongoClient } = require("mongodb");
const uri = "<connection-string>";
const client = new MongoClient(uri);

async function run() {
  await client.connect();
  const coll = client.db("sample_mflix").collection("embedded_movies");

  const pipeline = [
    {
      $vectorSearch: {
        index: "vector_index",
        path: "plot_embedding",
        queryVector: [ -0.0016261312, -0.028070757, /* … */ ],
        numCandidates: 150,
        limit: 10
      }
    },
    {
      $project: {
        _id: 0, title: 1, plot: 1,
        score: { $meta: "vectorSearchScore" }
      }
    }
  ];

  await coll.aggregate(pipeline).forEach(console.log);
  await client.close();
}
run();
```

### ANN with filter
```js
const query = [
  {
    $vectorSearch: {
      index: "vector_index",
      path: "plot_embedding",
      filter: { $and:[
        { year:{ $gt:1955 } },
        { year:{ $lt:1975 } }
      ]},
      queryVector: [0.02421053, -0.022372592, /* … */],
      numCandidates: 150,
      limit: 10
    }
  },
  {
    $project: { _id:0, title:1, plot:1, year:1,
                score:{ $meta:"vectorSearchScore" } }
  }
];
```

### ENN
```js
const enn = [
  {
    $vectorSearch: {
      index: "vector_index",
      path: "plot_embedding",
      queryVector: [ -0.006954097, -0.009932499, /* … */ ],
      exact: true,
      limit: 10
    }
  },
  { $project: { _id:0, title:1, plot:1,
                score:{ $meta:"vectorSearchScore" } } }
];
```
</section>
<section>
<title>Explain Atlas Vector Search Results</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/explain/</url>
<description>Run your Atlas Vector Search query with the explain method to learn about your $vectorSearch query plan and its execution statistics.</description>

# Explain Atlas Vector Search Results

## Syntax  
```js
// Node.js
await db.collection('myColl')
  .explain('executionStats')          // queryPlanner | executionStats | allPlansExecution
  .aggregate([
    {
      $vectorSearch: {
        index: 'idx',
        path: 'embedding',
        queryVector: [/* floats */],
        limit: 10,
        numCandidates: 150,  // ANN only
        exact: false,        // true ⇒ ENN
        filter: {/* optional */}
      }
    }
  ]);
```

## Verbosity  
- `allPlansExecution` – plan + exec stats + partial planning data  
- `executionStats`    – plan + exec stats  
- `queryPlanner` (default) – plan only  

## Top-Level `explain` Fields  
| key | purpose | notes |
|-----|---------|-------|
| `collectors`            | per-collector timing/counts | has `allCollectorStats` |
| `metadata`              | run context                | e.g. `mongotVersion`, `indexName` |
| `query`                 | logical plan & stats       | absent in `indexPartitionExplain` |
| `resultMaterialization` | post-query doc fetch       | not in `queryPlanner` |
| `resourceUsage`         | CPU/IO metrics             | not in `queryPlanner` |

### collectors → allCollectorStats  
`collect`, `competitiveIterator`, `setScorer` → each stores `{ millisElapsed, invocationCounts }`

### metadata fields  
`mongotVersion`, `mongotHostName`, `indexName`, `cursorOptions`, `totalLuceneDocs`

### query sub-doc  
```
{
  path: 'embedding',      // only if nested
  type: <QueryType>,      // see below
  args: <type-specific>,  // see below
  stats: {...}            // only if verbosity >= executionStats
}
```

#### Supported QueryType & args  
| Type | Required Args | Optional Args |
|------|---------------|---------------|
| `WrappedKnnQuery`     | `query` : [ sub-queries ] | |
| `KnnFloatVectorQuery` | `field`, `k` | |
| `DocAndScoreQuery`    | none (only stats) | |
| `ExactVectorSearchQuery` | `field`, `similarityFunction` (`dotProduct` \| `cosine` \| `euclidean`) | `filter` |
| `BooleanQuery`        | varies with pre-filter | |
| `DefaultQuery`        | `queryType`            | |

#### stats (per query / sub-query)  
Each area has:  
`millisElapsed` (double), `invocationCounts` (map task→Long).

Areas & tasks  
```
context: { createWeight, createScorer, vectorExecution }
match:   { nextDoc, refineRoughMatch }
score:   { score, setMinCompetitiveScore }
```

##### Example shape  
```json
"score": {
  "millisElapsed": 3.93,
  "invocationCounts": { "score": NumberLong(536), "setMinCompetitiveScore": NumberLong(0) }
}
```

### resourceUsage  
`majorFaults`, `minorFaults`, `userTimeMs`, `systemTimeMs`, `maxReportingThreads`, `numBatches`

## Minimal Examples

ANN (`executionStats`)  
```js
await db.collection('movies')
  .explain('executionStats')
  .aggregate([
    {
      $vectorSearch: {
        index: 'vector_idx',
        path: 'plot_embedding',
        queryVector: QUERY_EMBEDDING,
        numCandidates: 150,
        limit: 10
      }
    }
  ]);
```

ENN (`allPlansExecution`)  
```js
await db.collection('movies')
  .explain('allPlansExecution')
  .aggregate([
    {
      $vectorSearch: {
        index: 'vector_idx',
        path: 'plot_embedding',
        queryVector: QUERY_EMBEDDING,
        exact: true,
        limit: 10
      }
    }
  ]);
```
</section>
<section>
<title>Use MongoDB Views to Transform Documents and Filter Collections for Atlas Vector Search</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/transform-documents-collections/</url>
<description>Use Atlas Vector Search to transform documents and collections.</description>

# Use MongoDB Views with Atlas Vector Search

Preview feature. Create vector indexes on Views to:
* index subsets of a collection,
* reshape docs,
* handle type/model mismatches.  
Result docs always come from the source collection.

## Requirements
* MongoDB 8.0+.  
* Preview:  
  * Create/modify Views via `mongosh`/Compass (`createView`, `collMod`).  
  * Create indexes on Views only via Atlas UI or Admin API.  
  * Query indexes on Views from the **source collection**, not the View.  
* Index names unique across a collection and all its Views.

## Supported / Unsupported
* `$expr` allowed only in `$addFields`, `$set`, `$match`.
* Disallowed in View pipeline: dynamic operators (`$rand`, `$$USER_ROLES`, etc.).

## Example – Partial Index by Filtering Docs

```javascript
// connect with mongosh
use sample_mflix

// view keeps only docs having plot_embedding
db.createView(
  "moviesWithEmbeddings",      // view name
  "embedded_movies",           // source
  [ { $match: { $expr: { $ne:[ { $type:"$plot_embedding" }, "missing" ] } } } ]
)
```

Create vector index `embeddingsIndex` on `sample_mflix.moviesWithEmbeddings`
(index builder UI / Admin API):

```json
{
  "fields":[
    { "type":"vector", "path":"plot_embedding",
      "numDimensions":1536, "similarity":"cosine" }
  ]
}
```

Query from the **source** collection:

```javascript
db.embedded_movies.aggregate([
  {
    $vectorSearch: {
      index: "embeddingsIndex",
      path: "plot_embedding",
      queryVector: [-0.0016261312, -0.028070757, /* ... */],
      numCandidates: 100,
      limit: 10
    }
  },
  { $project: { _id:0, title:1, plot:1 } }
])
```

## Index Lifecycle / Troubleshooting
Status changes to **FAILED** if:
* View incompatible with Vector Search.
* View edited to incompatible state.
* Source collection changed/removed.

Build stalls:
* Pipeline errors on any document → index **STALE** (if READY) or stuck (if BUILDING) until fixed.

Use Atlas UI “index status” to inspect.

## Internal Flow
`mongot`:
1. Applies View pipeline → writes transformed docs to vector index.
2. Watches source collection change stream (View logic applied).
3. Answers `$vectorSearch`, returns doc IDs + metadata; `mongod` fetches full docs.
</section>
<section>
<title>Vector Quantization</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/vector-quantization/</url>
<description>Use the Atlas Vector Search to ingest quantized vectors or automatically quantize vectors.</description>

# Vector Quantization

Atlas Vector Search can:

* Auto-quantize float32/64 vectors to  
  • `scalar` → `int8` (4× smaller)  
  • `binary` → `int1` with HNSW-rescoring (24× smaller incl. graph)
* Ingest pre-quantized BSON `BinData` vectors (`float32`, `int8`, `int1`).

Recommended for ≥10 M embeddings.

## Comparison

|                | Auto `binary` | Auto `scalar` | Ingest `int1` | Ingest `int8` |
|----------------|--------------|---------------|---------------|---------------|
|Index param     | `quantization:"binary"` | `quantization:"scalar"` | none | none |
|Vector BSON     | array(double)/binData(f32) | array(double)/binData(f32) | `binData(int1)` | `binData(int8)` |
|Dims            | multiple of 8 | 1-8192 | multiple of 8 | 1-8192 |
|Similarity      | cos/euc/dot  | cos/euc/dot  | euc           | cos/euc/dot |
|ANN & ENN       | yes          | yes          | yes           | yes          |

All float values stored as `double`.

## Create / Update Index (auto-quantize)

```js
// Node.js ≥ v6.11
const index = {
  name: 'vecIdx',
  type: 'vectorSearch',
  definition: {
    fields: [{
      type: 'vector',
      path: 'embedding',
      numDimensions: 1024,
      similarity: 'dotProduct',
      quantization: 'binary'   // or 'scalar'
    }]
  }
};
await collection.createSearchIndex(index);
```

Index rebuilds automatically; query vectors are quantized the same way.

## Minimal Flow to Ingest Pre-Quantized Vectors (Node.js)

```js
import {Binary, BSON, MongoClient} from 'mongodb';
import {CohereClient} from 'cohere-ai';

const cohere = new CohereClient({token: process.env.COHERE_API_KEY});

// 1. Get quantized embeddings from model (Cohere returns float/int8/int1)
const {float,int8,ubinary} = (await cohere.v2.embed({
  model:'embed-english-v3.0',
  inputType:'search_document',
  texts:['text A','text B'],
  embeddingTypes:['float','int8','ubinary']
})).embeddings;

// 2. Convert to BSON BinData subtype 9 (vector)
const doc = i => ({
  text: texts[i],
  vec_f32: Binary.fromFloat32Array(new Float32Array(float[i])),
  vec_i8:  Binary.fromInt8Array (new Int8Array(int8[i])),
  vec_i1:  Binary.fromPackedBits(new Uint8Array(ubinary[i]))
});

// 3. Insert & index
const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const coll = client.db('db').collection('coll');
await coll.insertMany(texts.map((_,i)=>doc(i)));

await coll.createSearchIndex({
  name:'vecIdx',
  type:'vectorSearch',
  definition:{fields:[
    {type:'vector',path:'vec_f32',numDimensions:1024,similarity:'dotProduct'},
    {type:'vector',path:'vec_i8', numDimensions:1024,similarity:'dotProduct'},
    {type:'vector',path:'vec_i1', numDimensions:1024,similarity:'euclidean'}
  ]}
});
```

## Run Query

```js
const queryEmb = (await cohere.v2.embed({
  model:'embed-english-v3.0', inputType:'search_query',
  texts:['science fact'], embeddingTypes:['float','int8','ubinary']
})).embeddings;

const q = Binary.fromInt8Array(new Int8Array(queryEmb.int8[0]));

const pipeline = [{
  $vectorSearch:{
    index:'vecIdx',
    path:'vec_i8',
    queryVector:q,
    numCandidates:10,
    limit:3
  }
},{
  $project:{_id:0,text:1,score:{$meta:'vectorSearchScore'}}
}];
console.log(await coll.aggregate(pipeline).toArray());
```

## Accuracy Evaluation

Run the same `$vectorSearch` twice:

1. `numCandidates=<K>` (ANN, default)  
2. `exact:true` (ENN)  

Compare recall: `|ANN∩ENN| / |ENN|`.
</section>
<section>
<title>Retrieval-Augmented Generation (RAG) with Atlas Vector Search</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/rag/</url>
<description>Use MongoDB Atlas Vector Search to implement retrieval-augmented-generation (RAG) in your generative AI applications.</description>

# Retrieval-Augmented Generation with Atlas Vector Search

RAG flow  
1. Ingest: chunk domain data, embed, store `{text, embedding}` in Atlas.  
2. Retrieve: turn user query into embedding, `$vectorSearch` top docs.  
3. Generate: send user question + docs to an LLM.

Environment  
```
ATLAS_CONNECTION_STRING=<mongodb+srv://...>
HUGGING_FACE_ACCESS_TOKEN=<token>
```

## Node.js Reference Implementation

### 1. Embedding Helper
```js
// get-embeddings.js
import { pipeline } from '@xenova/transformers';

export async function getEmbedding(text) {
  const embed = await pipeline('feature-extraction',
                               'Xenova/nomic-embed-text-v1');
  return Array.from((await embed(text, { pooling:'mean', normalize:true })).data);
}
```

### 2. Ingest Data
```js
// ingest-data.js
import { PDFLoader }                from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { MongoClient }              from 'mongodb';
import { getEmbedding }             from './get-embeddings.js';
import fs from 'fs';

const client = new MongoClient(process.env.ATLAS_CONNECTION_STRING);
const pdfUrl = 'https://investors.mongodb.com/node/12236/pdf';

async function ingest() {
  const buf = Buffer.from(await (await fetch(pdfUrl)).arrayBuffer());
  fs.writeFileSync('report.pdf', buf);

  const docs = await new RecursiveCharacterTextSplitter({chunkSize:400,chunkOverlap:20})
                .splitDocuments(await new PDFLoader('report.pdf').load());
  console.log(`Chunks: ${docs.length}`);

  await client.connect();
  const col = client.db('rag_db').collection('test');

  const bulk = docs.map(async d => ({
    document : d,
    embedding: await getEmbedding(d.pageContent)
  }));
  await col.insertMany(await Promise.all(bulk), { ordered:false });
  console.log('Ingested', docs.length);
  await client.close();
}
ingest();
```

### 3. Create Vector Index
```js
// rag-vector-index.js
import { MongoClient } from 'mongodb';
const client = new MongoClient(process.env.ATLAS_CONNECTION_STRING);

await client.connect();
await client.db('rag_db').collection('test').createSearchIndex({
  name:'vector_index',
  type:'vectorSearch',
  definition:{ fields:[{ type:'vector', path:'embedding', numDimensions:768, similarity:'cosine'}]}
});
console.log('Index build started'); await client.close();
```

### 4. Retrieve Top Docs
```js
// retrieve-documents.js
import { MongoClient } from 'mongodb';
import { getEmbedding } from './get-embeddings.js';

export async function getQueryResults(query, k=5) {
  const client = new MongoClient(process.env.ATLAS_CONNECTION_STRING);
  await client.connect();
  const col = client.db('rag_db').collection('test');
  const queryVector = await getEmbedding(query);
  const pipeline = [
    {$vectorSearch:{index:'vector_index',queryVector,path:'embedding',exact:true,limit:k}},
    {$project:{_id:0, text:'$document.pageContent', score:{ $meta:'vectorSearchScore' } }}
  ];
  const out = await col.aggregate(pipeline).toArray();
  await client.close();
  return out;
}
```

### 5. Generate Answer with LLM
```js
// generate-responses.js
import { getQueryResults } from './retrieve-documents.js';
import { HfInference }     from '@huggingface/inference';

(async () => {
  const question  = "What are MongoDB's latest AI announcements?";
  const context   = (await getQueryResults('AI Technology')).map(d => d.text).join(' ');
  const prompt = `Answer following based on context.\nContext: ${context}\nQ: ${question}`;

  const hf   = new HfInference(process.env.HUGGING_FACE_ACCESS_TOKEN);
  const resp = await hf.chatCompletion({
     model:"mistralai/Mistral-7B-Instruct-v0.3",
     messages:[{role:'user', content:prompt}],
     max_tokens:150
  });
  console.log(resp.choices[0].message.content);
})();
```

Run order  
```
node --env-file=.env ingest-data.js
node --env-file=.env rag-vector-index.js   # once
node --env-file=.env generate-responses.js # RAG
```

Next: adjust chunking, models, or add filters/hybrid search for better accuracy.
</section>
<section>
<title>Review Deployment Options</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/deployment-options/</url>
<description>Explore deployment options for Atlas Vector Search, including cluster types, cloud providers, and node architecture for testing and production environments.</description>

# Review Deployment Options

### Recommended configs

| Env | Deployment | Cluster Tier | Region | Node Arch |
|-----|------------|--------------|--------|-----------|
| Testing | Flex/shared/local | ≥ M0 | Any | `mongod`+`mongot` same node |
| Proto | Dedicated | Flex, M10-M20+ | Any | Same node |
| Prod | Dedicated + Search Nodes | M10+ & S30+ | GCP all, AWS/Azure some | Separate nodes |

---

## Resource Usage

### RAM for indexes  
Full index lives in RAM (+JVM). Size ≈ (#vectors × dim × bytes)+metadata.

Typical per-vector RAM:

| Model | Dim | RAM |
|-------|----:|----:|
| text-embedding-ada-002 | 1536 | 6 KB |
| text-embedding-gecko | 768 | 3 KB |
| embed-english-v3.0 | 1024 | 1.07 KB (int8) / 0.167 KB (int1) |

### Disk/RAM gains with BinData or quantization  
• Disk on `mongod`: −66%  
• RAM on `mongot`: −3.75 × (scalar) / −24 × (binary)  
Automatic quantization keeps full-precision vectors on disk; size ≈ RAM×4 (scalar) or ×24 (binary).

Binary quantization index example:

```json
{
  "fields":[{
    "type":"vector","path":"my-embeddings",
    "numDimensions":1536,"similarity":"euclidean",
    "quantization":"binary"
  }]
}
```

Binary index disk ≈ original_size × 25⁄24 (1 GB → 1.042 GB). Reserve 125 % disk.

---

## Testing & Prototyping

### Deploy  
• Shared/Flex (M0/M2/M5) or dedicated M10-M20 or local dev.  
• All regions/providers.

### Node arch (same node)  
`mongot` auto-enabled on each `mongod`.  
Replica set: query → local `mongot`.  
Sharded: `mongos` scatter-gathers; zones restrict shards.  
`mongot` returns IDs → `mongod` doc lookup.  
`$search` with `concurrent` enables intra-query parallelism.

### Cluster RAM share  
M10 2 GB (1 GB for index), M20 4 GB (2 GB), M30 8 GB (4 GB).  
M10-30: 25 % RAM for MongoDB, rest for search; M40+: 50 %.

### Limitations  
DB and search contend for CPU/RAM; use only for dev.

---

## Production

### Deploy  
Dedicated cluster + separate Search Nodes (workload isolation).

### Tiers & regions  
Clusters: M10+; Search tiers: S20/S30/… Choose regions with Search Nodes (all GCP, subset AWS/Azure).

### Node arch (separate nodes)  
Atlas creates N search nodes per shard. `mongod` routes through load balancer to `mongot`. Index build on Search Nodes before cut-over. Deleting Search Nodes interrupts search.

### Benefits  
• Isolate/scale search independently.  
• ~90 % RAM usable for index.  
• Parallel query execution.

### Sizing Search Nodes  
RAM ≥ index_size × 1.1. Ensure enough CPU; prefer High-CPU tiers for latency (e.g., 1 M × 768 dim ≈ 3 GB → S20 High-CPU over S30 Low-CPU).

### Encryption at Rest  
Customer-managed keys (AWS KMS) supported on Search Nodes.

### Migration steps  
1. Upgrade to ≥ M10.  
2. Move to region with Search Nodes if needed.  
3. Add Search Nodes.

---
</section>
<section>
<title>Atlas Vector Search Tutorials</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/tutorials/</url>
<description>Follow step-by-step Atlas Vector Search tutorials to configure a vector search index, perform semantic search against indexed data, and implement RAG locally.</description>

# Atlas Vector Search Tutorials

**Prerequisites**  
• Atlas cluster v6.0.11 or ≥ 7.0.2  
• “Project Data Access Admin” role  
• Sample data loaded  
• `mongosh` or any driver using `$vectorSearch` stage  
• Works with local Atlas CLI deployments  

**Tutorials**  
1. Semantic ANN search on `sample_mflix.embedded_movies`.  
2. Hybrid: combine semantic results with Atlas Search full-text via reciprocal rank fusion.  
3. Local RAG: create embeddings and Retrieval-Augmented Generation without external API keys.
</section>
<section>
<title>How to Perform Semantic Search Against Data in Your Atlas Cluster</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/tutorials/vector-search-tutorial/</url>
<description>Learn how to search vector embeddings in your data on the Atlas cluster.</description>

# Atlas Vector Search Quickstart (Node.js)

## 1. Create `vector_index`

Index namespace: `sample_mflix.embedded_movies`.

Index JSON:
```json
{
  "fields": [
    { "type": "vector", "path": "plot_embedding",
      "numDimensions": 1536, "similarity": "dotProduct",
      "quantization": "scalar"
    },
    { "type": "filter", "path": "genres" },
    { "type": "filter", "path": "year" }
  ]
}
```

Node.js helper:
```js
// npm i mongodb
const { MongoClient } = require("mongodb");
const uri = "<connectionString>";
const client = new MongoClient(uri);

(async () => {
  const coll = client.db("sample_mflix").collection("embedded_movies");
  const res = await coll.createSearchIndex({
    name: "vector_index",
    type: "vectorSearch",
    definition: { fields: [ /* JSON above */ ] }
  });
  console.log(`index ${res} building...`);
  // poll until queryable
})();
```

## 2. Query with `$vectorSearch`

Common pipeline suffix:
```js
{
  $project: {
    _id: 0, title: 1, genres: 1, plot: 1, year: 1,
    score: { $meta: "vectorSearchScore" }
  }
}
```

### 2.1 AND filter example  
Semantic search for *“historical heist”*; allow 200 candidates, return 10 docs; exclude Drama/Western/Crime, include Action/Adventure/Family, years 1960–2000:
```js
const queryVec = [ -0.020156775, -0.024996493, /* 1534 more */ ];
const pipeline = [
  {
    $vectorSearch: {
      index: "vector_index",
      path: "plot_embedding",
      queryVector: queryVec,
      numCandidates: 200,
      limit: 10,
      filter: {
        $and: [
          { genres: { $nin: ["Drama","Western","Crime"], $in: ["Action","Adventure","Family"] }},
          { year: { $gte: 1960, $lte: 2000 } }
        ]
      }
    }
  },
  projectStage
];
```

### 2.2 OR / AND combined filter example  
Semantic search for *“martial arts”*; exclude Crime OR (year ≤ 2015 AND genre Action):
```js
const queryVec = [ -0.016465975, -0.0036450154, /* ... */ ];
const pipeline = [
  {
    $vectorSearch: {
      index: "vector_index",
      path: "plot_embedding",
      queryVector: queryVec,
      numCandidates: 200,
      limit: 10,
      filter: {
        $or: [
          { genres: { $ne: "Crime" } },
          { $and: [ { year: { $lte: 2015 } }, { genres: { $eq: "Action" } } ] }
        ]
      }
    }
  },
  projectStage
];
```

Run:
```js
const cursor = coll.aggregate(pipeline);
for await (const doc of cursor) console.log(doc);
```
</section>
<section>
<title>Perform Hybrid Search with Atlas Vector Search and Atlas Search</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/tutorials/reciprocal-rank-fusion/</url>
<description>Learn how to search vector embeddings in your data on the Atlas cluster.</description>

# Hybrid Search with Atlas Vector Search & Atlas Search

Hybrid = `$vectorSearch` (semantic) + `$search` (full-text) results merged with Reciprocal Rank Fusion (RRF).

## RRF formula

```
reciprocal_rank = 1 / (rank + 60)   // 60 = smoothing constant
weighted_rank  = weight * reciprocal_rank
```

Final score = Σ weighted_rank across search types; higher weight ⇒ more influence.

## 1. Create Indexes (Node.js)

```javascript
import { MongoClient } from 'mongodb';
const client = new MongoClient(process.env.ATLAS_CONNECTION_STRING);
const db = client.db('sample_mflix');
const coll = db.collection('embedded_movies');

// Vector index
await coll.createSearchIndex({
  name: 'rrf-vector-search',
  type: 'vectorSearch',
  definition: {fields:[{type:'vector',path:'plot_embedding',numDimensions:1536,similarity:'dotProduct'}]}
});

// Full-text index
await coll.createSearchIndex({
  name: 'rrf-full-text-search',
  type: 'search',
  definition:{mappings:{dynamic:false,fields:{title:[{type:'string'}]}}}
});
```

## 2. Run Hybrid Query (Node.js)

```javascript
const vectorWeight = 0.1, textWeight = 0.9;
const queryVector = [...];              // embedding for "star wars"

const pipeline = [
  { $vectorSearch:{index:'rrf-vector-search',path:'plot_embedding',
                   queryVector, numCandidates:100, limit:20}},
  { $group:{_id:null,docs:{$push:'$$ROOT'}}},
  { $unwind:{path:'$docs',includeArrayIndex:'rank'}},
  { $addFields:{vs_score:{$multiply:[vectorWeight,
                      {$divide:[1,{$add:['$rank',60]}]}]}}},
  { $project:{_id:'$docs._id',title:'$docs.title',vs_score:1}},

  { $unionWith:{coll:'embedded_movies',pipeline:[
      { $search:{index:'rrf-full-text-search',
                 phrase:{query:'star wars',path:'title'}}},
      { $limit:20 },
      { $group:{_id:null,docs:{$push:'$$ROOT'}}},
      { $unwind:{path:'$docs',includeArrayIndex:'rank'}},
      { $addFields:{fts_score:{$multiply:[textWeight,
                          {$divide:[1,{$add:['$rank',60]}]}]}}},
      { $project:{_id:'$docs._id',title:'$docs.title',fts_score:1}}
  ]}},

  { $group:{_id:'$_id',title:{$first:'$title'},
            vs_score:{$max:'$vs_score'}, fts_score:{$max:'$fts_score'}}},
  { $project:{title:1,
              score:{$add:[{$ifNull:['$vs_score',0]},{$ifNull:['$fts_score',0]}]}}},
  { $sort:{score:-1}}, {$limit:10}
];

for await (const doc of coll.aggregate(pipeline)) console.log(doc);
```

Result: top documents containing “Star Wars” in title and/or semantically related plots are ranked by fused score.

## Notes

• Adjust `vectorWeight` & `textWeight` per query.  
• Replace `queryVector` with embedding matching your model.  
• Works on Atlas clusters ≥ v6.0.11 with both index types present.
</section>
<section>
<title>Build a Local RAG Implementation with Atlas Vector Search</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/tutorials/local-rag/</url>
<description>How to implement retrieval-augmented generation (RAG) for Atlas Vector Search using local embedding models and chat models.</description>

# Local RAG with Atlas Vector Search (Node.js)

## 1. Deployment & Data  
Create a local Atlas deployment or cloud cluster pre-loaded with `sample_airbnb.listingsAndReviews`.

```bash
# local deployment + data
atlas deployments setup           # follow prompts
curl https://atlas-education.s3.amazonaws.com/sampledata.archive -o sampledata.archive
mongorestore --archive=sampledata.archive --port <port>
```

## 2. Prereqs & Project  
* Atlas CLI ≥ 1.14.3, MongoDB CLI tools, Node.js + npm  
* Hugging Face token & `git-lfs`  
```bash
export ATLAS_CONNECTION_STRING="mongodb://localhost:<port>/?directConnection=true"
mkdir local-rag-mongodb && cd $_
npm init -y
npm i mongodb @xenova/transformers gpt4all
```

## 3. Generate Embeddings (mxbai-embed-large-v1)  
```bash
# download model (token or SSH)
git clone https://<user>:<token>@huggingface.co/mixedbread-ai/mxbai-embed-large-v1
```

`get-embeddings.js`
```javascript
import { env, pipeline } from '@xenova/transformers';
export async function getEmbedding(text){
  env.localModelPath='/path/to/local-rag-mongodb';      // parent dir of repo
  env.allowRemoteModels=false;
  const embedder=await pipeline('feature-extraction','mxbai-embed-large-v1');
  return Array.from((await embedder(text,{pooling:'mean',normalize:true})).data);
}
```

`generate-embeddings.js`
```javascript
import { MongoClient } from 'mongodb';
import { getEmbedding } from './get-embeddings.js';

const client=new MongoClient(process.env.ATLAS_CONNECTION_STRING);
await client.connect();
const coll=client.db("sample_airbnb").collection("listingsAndReviews");

const cursor=coll.find({
  summary:{ $exists:true, $nin:[null,""] },
  embeddings:{ $exists:false }
}).limit(50);                                // adjust/remove limit

const ops=[];
for await (const doc of cursor){
  const e=await getEmbedding(doc.summary);
  ops.push({updateOne:{filter:{_id:doc._id},update:{$set:{embeddings:e}}}});
}
await coll.bulkWrite(ops,{ordered:false});
await client.close();
```

## 4. Create Vector Index  
`vector-index.js`
```javascript
import { MongoClient } from 'mongodb';
const client=new MongoClient(process.env.ATLAS_CONNECTION_STRING);
await client.connect();
const idx={
  name:"vector_index",
  type:"vectorSearch",
  definition:{fields:[{type:"vector",path:"embeddings",numDimensions:1024,similarity:"cosine"}]}
};
console.log(await client.db("sample_airbnb").collection("listingsAndReviews").createSearchIndex(idx));
await client.close();
```

## 5. Retrieve Documents  
`retrieve-documents.js`
```javascript
import { MongoClient } from 'mongodb';
import { getEmbedding } from './get-embeddings.js';

export async function getQueryResults(query){
  const qVec=await getEmbedding(query);
  const client=new MongoClient(process.env.ATLAS_CONNECTION_STRING);
  await client.connect();
  const res=client.db("sample_airbnb").collection("listingsAndReviews")
    .aggregate([
      {$vectorSearch:{index:"vector_index",path:"embeddings",queryVector:qVec,exact:true,limit:5}},
      {$project:{_id:0,summary:1,listing_url:1,score:{$meta:"vectorSearchScore"}}}
    ]);
  const docs=[];
  for await(const d of res) docs.push(d);
  await client.close();
  return docs;
}
```

## 6. Local LLM (Mistral 7B via GPT4All)  
```bash
# download model + config
mv mistral-7b-openorca.gguf2.Q4_0.gguf local-rag-mongodb/
curl -L https://gpt4all.io/models/models3.json -o models3.json
```

`local-llm.js`
```javascript
import { loadModel, createCompletionStream } from "gpt4all";
import { getQueryResults } from './retrieve-documents.js';

const query="beach house", docs=await getQueryResults(query);
let context="";
docs.forEach(d=>context+=`Summary: ${d.summary} Link: ${d.listing_url}\n`);

const model=await loadModel("mistral-7b-openorca.gguf2.Q4_0.gguf",
    {allowDownload:false,modelConfigFile:"./models3.json"});

const prompt=`Use the following context to answer the question.
${context}
Question: Can you recommend a few AirBnBs that are beach houses? Include links.`;

process.stdout.write("Answer: ");
const stream=createCompletionStream(model,prompt);
stream.tokens.on("data",t=>process.stdout.write(t));
await stream.result;
model.dispose();
```

The pipeline:
1. generate embeddings for `summary` → store in `embeddings`
2. create `vector_index`
3. query via `getQueryResults`
4. build prompt with top docs → GPT4All (Mistral-7B) answers.
</section>
<section>
<title>How to Measure the Accuracy of Your Query Results</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/evaluate-results/</url>
# Measure Vector Search Accuracy (ANN vs ENN)

## Why  
Evaluate Approximate Nearest Neighbor (ANN) results against Exact Nearest Neighbor (ENN) to verify recall, especially with quantized, low-dim, or very large vector sets.

## Requirements  
• Atlas cluster (e.g., `sample_mflix.embedded_movies`)  
• `mongosh` or Node.js driver  
• Atlas Vector Search index on the vector field (+ optional filter fields)

## 1  Create Index (recommended: binary-quantized vectors)

```json
// db: sample_mflix  coll: embedded_movies  index: vector_index
{
  "fields": [
    { "path": "plot_embedding", "type": "vector",
      "numDimensions": 1536, "similarity": "euclidean",
      "quantization": "binary" },
    { "path": "genres", "type": "filter" }
  ]
}
```

## 2  Run Queries

Node.js (mongodb@5.x):

```js
import { MongoClient } from 'mongodb';
const cli = new MongoClient(uri);
await cli.connect();
const coll = cli.db('sample_mflix').collection('embedded_movies');
const vector = [/* 1536-float embedding for "thrilling heist with twists" */];

const filter = { $and:[ {genres:{ $eq:'Action'}}, {genres:{ $ne:'Western'}} ] };

// --- ENN (ground truth) ---
const enn = await coll.aggregate([
  { $vectorSearch: { index:'vector_index', path:'plot_embedding',
                     queryVector:vector, filter, exact:true, limit:10 } },
  { $project:{ _id:0, title:1, genres:1, plot:1,
               score:{ $meta:'vectorSearchScore'} } }
]).toArray();

// --- ANN (approximate) ---
const ann = await coll.aggregate([
  { $vectorSearch: { index:'vector_index', path:'plot_embedding',
                     queryVector:vector, filter,
                     numCandidates:100, limit:10 } },
  { $project:{ _id:0, title:1, genres:1, plot:1,
               score:{ $meta:'vectorSearchScore'} } }
]).toArray();
```

Sample output (both queries) – top 9 identical; 10th differs, illustrating recall vs speed.

## 3  Compare Recall  
• Compute Jaccard similarity between `enn` and `ann`:  
`|intersection| / |union|` (ideal = 1).  
• Test ≈100 queries to profile recall.  
• Raise `numCandidates` for higher recall; lower it for speed/resource savings.

## Summary  
1. Build quantized `vector` index (+ optional `filter` fields).  
2. Run ENN (`exact:true`) and ANN (`numCandidates`).  
3. Compare result sets; tune `numCandidates` for the accuracy/latency trade-off.
</section>
<section>
<title>Improve Vector Search Performance</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/tune-vector-search/</url>
<description>Learn how to improve vector search performance.</description>

# Improve Vector Search Performance

- Dimensions: ≤8192; use smallest viable size to cut comparisons and boost index/query speed.  
- Indexing: don’t (re)index during reads; if model changes, create a new index.  
- Pre-filter: add `filter` in `$vectorSearch` to shrink doc set, crucial for many/high-dim vectors.  
- Nodes: run `mongot` on dedicated Search Nodes to avoid `mongod` contention; parallel segment search enabled.  
- Projection: use `$project` to omit large vector fields from results.  
- Memory: keep vectors+index fully in RAM; separate Search Nodes aid isolation and efficiency.  
- Cache warm-up: first queries load vectors from disk; redo after heavy writes or rebuilds.  
- `binData` vectors: ~3× storage cut; supports float/int8/int1; markedly lowers latency (limit > 20).  
- Quantization:  
  • Scalar (32-bit→8-bit) keeps recall for most models.  
  • Binary (1/0) best for QAT-trained embeddings.
</section>
<section>
<title>Build a Multi-Tenant Architecture for Atlas Vector Search</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/multi-tenant-architecture/</url>
# Multi-Tenant Atlas Vector Search

**Core rule:** Store all tenants in one collection on one cluster. Differentiate with a `tenant_id` field and pre-filter on it in every index/query.

Benefits: simple scaling & ops, guaranteed tenant isolation per query, avoids change-stream overload.

## When Tenants Differ Greatly in Size

1. Mark top ~1 % “large” tenants.
2. Create one view+index per large tenant.
3. Create one view for all others; index includes `tenant_id`.

```shell
# large tenant view
db.createView('<largeView>', '<coll>', [{ $match:{ tenant_id:'<id>' }}])

# small tenants view
db.createView('<smallView>', '<coll>', [{ $match:{ tenant_id:{ $nin:['<id1>','<id2>'] }}}])
```

## Many Large Tenants

Shard by `tenant_id` (ranged sharding).

## Migration: collections → single collection

```javascript
import { MongoClient } from 'mongodb';
const client = new MongoClient('<connectionString>');
const src='<srcDB>', dst='<dstDB>', dstColl='<dstColl>', BATCH=1000;

await client.connect();
const sdb=client.db(src), dcol=client.db(dst).collection(dstColl);
for (const {name} of await sdb.listCollections().toArray()) {
  const cur=sdb.collection(name).find();
  let buf=[];
  for await (const doc of cur) {
    doc.tenant_id=name; buf.push(doc);
    if (buf.length>=BATCH){await dcol.insertMany(buf); buf=[];}
  }
  if (buf.length) await dcol.insertMany(buf);
}
await client.close();
```
</section>
<section>
<title>Troubleshooting</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/troubleshooting/</url>
<description>Learn how to address common issues with Atlas Vector Search queries and configuration</description>

# Troubleshooting

• `$vectorSearch` needs MongoDB 6.0.11+ or 7.0.2+. Older clusters throw:  
```sh
OperationFailure: $vectorSearch is not allowed with the current configuration…
```  
Check the cluster Version in Atlas → Clusters; upgrade if older.  
Free-tier M0: build indexes only via Atlas UI.

• Slow queries → see “Improve Vector Search Performance”.

• No results:  
  – Embed docs & queries with the same model.  
  – Wait until the Vector Search index finishes initial sync.

• LangChain filter RAG error:  
```js
MongoServerError: … Path 'field' needs to be indexed as token
```  
Create an Atlas **Vector Search** index on `field` (not Atlas Search). See “Answer Questions on Your Data”.

• `Command not found` when creating index: cluster version too old or using M0 (use UI if version OK).

• Filterable types: boolean, date, number, objectId, string, UUID only.
</section>
</guide>