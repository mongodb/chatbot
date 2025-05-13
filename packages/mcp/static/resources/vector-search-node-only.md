<guide>
<guide_topic>Atlas Vector Search</guide_topic>
<section>
<title>Troubleshooting</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/troubleshooting/</url>
<description>Learn how to address common issues with Atlas Vector Search queries and configuration</description>

# Troubleshooting

## `$vectorSearch` stage blocked
Requires MongoDB 6.0.11+ / 7.0.2+. Incompatible clusters return:  
```sh
OperationFailure: $vectorSearch is not allowed with the current configuration...
```
Check/upgrade cluster version in Atlas.

## Slow queries
See “Improve Vector Search Performance”.

## `$vectorSearch` returns empty
• Use identical embedding model for data & query.  
• Wait until Vector Search index finishes initial sync.

## LangChain pre-filtering error
```js
MongoServerError: PlanExecutor error during aggregation :: caused by :: Path 'field' needs to be indexed as token
```
Ensure `field` has an Atlas Vector Search index (not Atlas Search). Create one if absent.

## `Command not found` creating index
Occurs when:  
• Cluster <6.0.11/7.0.2 → upgrade.  
• Cluster is M0 Free Tier → use Atlas UI (programmatic creation unsupported).

## Filtering limits
Filters only accept boolean, date, number, objectId, string, UUID fields.
</section>
<section>
<title>Improve Vector Search Performance</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/tune-vector-search/</url>
<description>Learn how to improve vector search performance.</description>

# Improve Vector Search Performance

- Reduce vector dimensions; larger dims ↑ comparisons & latency.  
- Avoid index builds while querying; write new embeddings to a new index.  
- Use `filter` in `$vectorSearch` to pre-limit docs, esp. with many/high-dim vectors.  
- Deploy `mongot` on dedicated Search Nodes for no resource contention & auto parallel segment search.  
- `$project` only needed fields; exclude vector arrays to cut response size.  
- Ensure RAM fits vectors + index; separate Search Nodes aid memory efficiency.  
- Expect high latency until FS cache warms; redo after large writes or rebuilds.  
- Store embeddings as `BinData` (float/int8/int1) → ~3× smaller & faster, esp. `limit>20`.  
- Quantize: scalar (fp32→int8) keeps recall; binary boosts QAT-trained models.
</section>
<section>
<title>Atlas Vector Search Tutorials</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/tutorials/</url>
<description>Follow step-by-step Atlas Vector Search tutorials to configure a vector search index, perform semantic search against indexed data, and implement RAG locally.</description>

# Atlas Vector Search Tutorials

**Prereqs**: Atlas cluster v6.0.11 / 7.0.2+, “Project Data Access Admin” to create indexes, sample data, and `mongosh` or any driver (use `$vectorSearch` stage); local clusters via Atlas CLI also work.

**Tutorials**  
1. Semantic ANN search on `sample_mflix.embedded_movies` vectors.  
2. Hybrid search: combine semantic results with Atlas Search full-text using reciprocal rank fusion.  
3. Local RAG: create embeddings and Retrieval-Augmented Generation with local models, no API keys.
</section>
<section>
<title>Build a Multi-Tenant Architecture for Atlas Vector Search</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/multi-tenant-architecture/</url>
# Multi-Tenant Atlas Vector Search

• Use **one collection** (one DB/cluster) for all tenants, add `tenant_id` to every doc, pre-filter on it in Vector Search indexes/queries.  
• Don’t create a collection per tenant—hurts change-stream perf; no extra isolation.

Performance tuning  
1. Few huge tenants:  
   – One view + index per big tenant:  
   ```shell
   db.createView("bigA","coll",[{$match:{tenant_id:"A"}}])
   ```  
   – One view + index (with tenant_id pre-filter) covering all other tenants.  
2. Many huge tenants: shard collection on `tenant_id` (ranged sharding).

Migration script (collections → single collection):

```javascript
import { MongoClient } from 'mongodb';
const client = new MongoClient('<URI>');

async function migrate() {
  await client.connect();
  const src = client.db('<src>');
  const dst = client.db('<dst>').collection('<target>');
  for (const {name} of await src.listCollections().toArray()) {
    const cursor = src.collection(name).find();
    let batch = [];
    for await (const doc of cursor) {
      batch.push({...doc, tenant_id: name});
      if (batch.length === 1e3) { await dst.insertMany(batch); batch=[]; }
    }
    if (batch.length) await dst.insertMany(batch);
  }
  await client.close();
}
migrate();
```

When indexing views, specify the view name, not the base collection.
</section>
<section>
<title>Atlas Vector Search Overview</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/vector-search-overview/</url>
<description>Use MongoDB Atlas Vector Search to create vector indexes and perform vector search, including semantic search and hybrid search, on your vector embeddings.</description>

# Atlas Vector Search

Atlas Vector Search lets you store embeddings with other Atlas data and query them by semantic similarity. Supports:  
• ANN (HNSW) on MongoDB 6.0.11 / 7.0.2+  
• ENN on 6.0.16 / 7.0.10 / 7.3.2+

Use cases  
• Semantic search (vector → k-nearest vectors)  
• Hybrid search (combine `$vectorSearch` & Atlas Search)  
• Generative/RAG: ingest → retrieve relevant docs → LLM generate answer  
Works with OpenAI, AWS, Google, LangChain, etc.

Key concepts  
• Vector = dense float array (≤ 8192 dims) representing text, image, audio…  
• Embedding model converts data → vectors; model defines dimension size.  
• Semantic similarity = distance between vectors.

Indexes  
Create dedicated Atlas Vector Search index:  
```jsonc
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "embedding": { "type": "vector", "dims": 1536 },
      "category":  { "type": "string" } // optional filter field
    }
  }
}
```  
Include non-vector filter fields (bool, date, objectId, number, string, UUID, arrays).

Queries  
Aggregation pipeline must start with `$vectorSearch`:  
```js
// Node.js driver
const pipeline = [
  {
    $vectorSearch: {
      index: "vIndex",
      path: "embedding",
      queryVector: myQueryVector,   // Float32Array | number[]
      numCandidates: 200,           // ANN only
      k: 10,                        // results to return
      filter: { category: "fruit" },// optional pre-filter
      searchType: "approximate"     // or "exact"
    }
  },
  { $project: { score: { $meta: "vectorSearchScore" }, title: 1 } }
];
const docs = await coll.aggregate(pipeline).toArray();
```  
ANN scans subset; ENN scans all indexed vectors. You can append further stages (sort, limit, facet, etc.).

Limits & tips  
• Dim ≤ 8192, store as array of float32.  
• Deploy dedicated Search Nodes for best latency.
</section>
<section>
<title>Run Vector Search Queries</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/vector-search-stage/</url>
<description>Explore how to perform vector search queries using Atlas Vector Search, supporting both Approximate and Exact Nearest Neighbor searches.</description>

# Run Vector Search Queries

Atlas `$vectorSearch` (first stage only) performs ANN or ENN nearest-neighbor search on a **vector** field indexed by a `vectorSearch` index.

* MongoDB versions  
  * ANN ≥ 6.0.11 / 7.0.2  
  * ENN ≥ 6.0.16 / 7.0.10 / 7.3.2
* Unsupported inside `$lookup` sub-pipelines, `$facet`, or view definitions.

## Stage Syntax
```jsonc
{
  $vectorSearch: {
    path: "<vector-field>",          // required
    index: "<index-name>",           // required
    queryVector: [<floats|binData>], // length == index dimensions
    limit: <int>,                    // required
    numCandidates: <int>,            // ANN, ≤10000
    exact: true|false,               // ENN flag; req. if numCandidates omitted
    filter: { <MQL expr> }           // optional pre-filter
  }
}
```
Guidelines  
* numCandidates ≥ limit, ~20×limit for good ANN recall; tune for large/quantized data.  
* Use ENN for ≤10 k docs, heavy filters (<5 % data), or recall evaluation.

## Scoring (`0–1`)
```
cosine, dot = (1 + sim(v1,v2))/2
euclidean    = 1/(1+dist(v1,v2))
```
Expose with:
```js
{ $project: { score: { $meta: "vectorSearchScore" }, ... } }
```

## Pre-Filter
Filter fields must be indexed as `filter` type. Supported operators: `$eq/$ne`, `$gt/$gte/$lt/$lte`, `$in/$nin`, `$and/$or/$not/$nor`. Short `$eq` form allowed.

## Node.js Examples

### ANN – basic
```js
const agg = [
  { $vectorSearch: {
      index: "vector_index",
      path: "plot_embedding",
      queryVector: [/* ... */],
      numCandidates: 150,
      limit: 10
  }},
  { $project: { _id: 0, plot: 1, title: 1, score: { $meta:"vectorSearchScore"} } }
];
```

### ANN – with filter
```js
const agg = [
  { $vectorSearch: {
      index: "vector_index",
      path: "plot_embedding",
      filter: { $and:[ {year:{ $gt:1955}}, {year:{ $lt:1975}} ] },
      queryVector:[/* ... */],
      numCandidates:150,
      limit:10
  }},
  { $project:{ _id:0, title:1, plot:1, year:1,
               score:{ $meta:"vectorSearchScore"} } }
];
```

### ENN
```js
const agg = [
  { $vectorSearch: {
      index:"vector_index",
      path:"plot_embedding",
      queryVector:[/* ... */],
      exact:true,
      limit:10
  }},
  { $project:{ _id:0, plot:1, title:1, score:{ $meta:"vectorSearchScore"} } }
];
```

Connect and run:
```js
const {MongoClient}=require("mongodb");
const client=new MongoClient("<connection-string>");
await client.db("sample_mflix").collection("embedded_movies").aggregate(agg).toArray();
```
</section>
<section>
<title>How to Perform Semantic Search Against Data in Your Atlas Cluster</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/tutorials/vector-search-tutorial/</url>
<description>Learn how to search vector embeddings in your data on the Atlas cluster.</description>

# Atlas Vector Search Quickstart

## Index Definition

```json
{
  "name": "vector_index",
  "type": "vectorSearch",
  "definition": {
    "fields": [
      { "type":"vector", "path":"plot_embedding", "numDimensions":1536,
        "similarity":"dotProduct", "quantization":"scalar" },
      { "type":"filter", "path":"genres" },
      { "type":"filter", "path":"year" }
    ]
  }
}
```

### Node.js — create index

```js
const { MongoClient } = require("mongodb");
const uri = "<connectionString>";
const client = new MongoClient(uri);

(async () => {
  const coll = client.db("sample_mflix").collection("embedded_movies");
  const id = await coll.createSearchIndex({ /* index JSON above */ });
  console.log(`${id} building...`);
})();
```

---

## Query Pattern

`$vectorSearch` runs first, followed by `$project`.

Common options  
• index: "vector_index"  
• path: "plot_embedding"  
• queryVector: <1536-length array>  
• numCandidates: 200 • limit: 10

Returned score is available with `{ $meta:"vectorSearchScore" }`.

---

### Example 1 — AND pre-filter

```js
const filterAND = {
  $and: [
    { genres: { $nin:["Drama","Western","Crime"], $in:["Action","Adventure","Family"] }},
    { year: { $gte:1960, $lte:2000 }}
  ]
};

const pipeline = [
  { $vectorSearch: {
      index:"vector_index", path:"plot_embedding", filter:filterAND,
      queryVector:[-0.0201, -0.0249, /* … */], numCandidates:200, limit:10
  }},
  { $project:{ _id:0, title:1, genres:1, plot:1, year:1,
               score:{ $meta:"vectorSearchScore" }}}
];
```

### Example 2 — OR / AND pre-filter

```js
const filterOR = {
  $or: [
    { genres:{ $ne:"Crime" }},
    { $and:[ { year:{ $lte:2015 }}, { genres:{ $eq:"Action" }} ]}
  ]
};

const pipeline = [
  { $vectorSearch: {
      index:"vector_index", path:"plot_embedding", filter:filterOR,
      queryVector:[-0.0164, -0.0036, /* … */], numCandidates:200, limit:10
  }},
  { $project:{ _id:0, title:1, genres:1, plot:1, year:1,
               score:{ $meta:"vectorSearchScore" }}}
];
```

Execute with:

```js
const cursor = coll.aggregate(pipeline);
for await (const doc of cursor) console.log(doc);
```

---

## Requirements

• Atlas cluster with Vector Search enabled  
• `mongodb` Node.js driver ≥ 6.2  
• User role ≥ Project Data Access Admin for index creation
</section>
<section>
<title>Perform Hybrid Search with Atlas Vector Search and Atlas Search</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/tutorials/reciprocal-rank-fusion/</url>
<description>Learn how to search vector embeddings in your data on the Atlas cluster.</description>

# Hybrid Search with Atlas Vector & Full-Text Search

Combine `$vectorSearch` (semantic) and `$search` (full-text) results with Reciprocal Rank Fusion (RRF).

Reciprocal rank (rr) of doc at rank r:  
`rr = 1 / (r + 60)` (60 smooths scores)  
Weighted score: `w * rr` (set per query).  
Final score = Σ weighted scores across methods, then sort.

---

## Indexes (sample_mflix.embedded_movies)

```js
// avs-index.js
import { MongoClient } from 'mongodb';
const client = new MongoClient(process.env.ATLAS_CONNECTION_STRING);
await client.db('sample_mflix').collection('embedded_movies')
  .createSearchIndex({
    name: 'rrf-vector-search',
    type: 'vectorSearch',
    definition: { fields:[{
        type: 'vector', path:'plot_embedding',
        numDimensions:1536, similarity:'dotProduct'
    }]}
});
client.close();
```

```js
// fts-index.js
await client.db('sample_mflix').collection('embedded_movies')
  .createSearchIndex({
    name: 'rrf-full-text-search',
    type: 'search',
    definition:{ mappings:{ dynamic:false, fields:{ title:[{type:'string'}] } } }
});
```

---

## Hybrid Query (Node.js)

```js
// combined-query.js
import { MongoClient } from 'mongodb';
const c = new MongoClient(process.env.ATLAS_CONNECTION_STRING);
const coll = c.db('sample_mflix').collection('embedded_movies');

const vw = 0.1, fw = 0.9;               // weights
const qv = [-0.00309, -0.01897, ... ];  // star-wars embedding

const pipeline = [
  { $vectorSearch:{ index:'rrf-vector-search', path:'plot_embedding',
                    queryVector:qv, numCandidates:100, limit:20 } },
  { $group:{ _id:null, docs:{ $push:'$$ROOT' } } },
  { $unwind:{ path:'$docs', includeArrayIndex:'rank' } },
  { $addFields:{ vs_score:{ $multiply:[ vw,
        { $divide:[1,{ $add:['$rank',60] }] } ] } } },
  { $project:{ _id:'$docs._id', title:'$docs.title', vs_score:1 } },
  { $unionWith:{
      coll:'embedded_movies',
      pipeline:[
        { $search:{ index:'rrf-full-text-search',
                    phrase:{ query:'star wars', path:'title' } } },
        { $limit:20 },
        { $group:{ _id:null, docs:{ $push:'$$ROOT' } } },
        { $unwind:{ path:'$docs', includeArrayIndex:'rank' } },
        { $addFields:{ fts_score:{ $multiply:[ fw,
              { $divide:[1,{ $add:['$rank',60] }] } ] } } },
        { $project:{ _id:'$docs._id', title:'$docs.title', fts_score:1 } }
      ]}},
  { $group:{ _id:'$_id',
             title:{ $first:'$title' },
             vs_score:{ $max:'$vs_score' },
             fts_score:{ $max:'$fts_score' } } },
  { $project:{ title:1,
               vs_score:{ $ifNull:['$vs_score',0] },
               fts_score:{ $ifNull:['$fts_score',0] },
               score:{ $add:['$vs_score','$fts_score'] } } },
  { $sort:{ score:-1 } },
  { $limit:10 }
];

for await (const doc of coll.aggregate(pipeline)) console.log(doc);
await c.close();
```

---

## Key Points

• Hybrid search covers exact keyword (full-text) & semantic similarity (vector).  
• Tune `vw` & `fw` per query to emphasize one modality.  
• RRF ensures docs matched by both methods rank highest without needing raw similarity scores.
</section>
<section>
<title>Use MongoDB Views to Transform Documents and Filter Collections for Atlas Vector Search</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/transform-documents-collections/</url>
<description>Use Atlas Vector Search to transform documents and collections.</description>

# Atlas Vector Search on MongoDB Views (Preview)

### Key Points  
- MongoDB 8.0+. Create/manage Views with `mongosh`/Compass; build Vector Search indexes on Views with Atlas UI or Admin API (driver support GA).  
- Edit View: User Admin + `collMod`.  
- Aggregation stages allowed inside Views: `$addFields`, `$set`, `$match` (with `$expr`).  
- Index names unique across a collection + its Views.  
- Unsupported in View pipeline: dynamic operators (`$rand`, `$$USER_ROLES`, …).  
- Queries return original source-collection docs.  
- During Preview, run `$vectorSearch` against the **source collection**, not the View.

---

## Example – Partial Index on Docs With Embeddings  

1. Create View `moviesWithEmbeddings` on `sample_mflix.embedded_movies`:

```js
await db.command({
  create: "moviesWithEmbeddings",
  viewOn: "embedded_movies",
  pipeline: [{
    $match: { $expr: { $ne: [ { $type: "$plot_embedding" }, "missing" ] } }
  }]
});
```

2. In Atlas UI → Atlas Search → Create Vector Search Index  
   - Name: `embeddingsIndex`  
   - DB/Coll: `sample_mflix.moviesWithEmbeddings`  
   - Definition:  
   ```json
   {
     "fields": [
       { "type": "vector", "path": "plot_embedding",
         "numDimensions": 1536, "similarity": "cosine" }
     ]
   }
   ```

3. Query (run on **embedded_movies**):

```js
const results = await db.collection("embedded_movies").aggregate([
  {
    $vectorSearch: {
      index: "embeddingsIndex",
      path: "plot_embedding",
      queryVector: [-0.0016261312, -0.028070757, /* … */],
      numCandidates: 100,
      limit: 10
    }
  },
  { $project: { _id: 0, title: 1, plot: 1 } }
]).toArray();
```

---

## Index Status  

FAILED – View incompatible, edited to incompatible, or source collection changed/removed (applies to descendant Views).  
STALE / BUILDING-stuck – View pipeline errors for some docs; fix data or pipeline → status returns to READY (queryable until oplog cleanup).

---

## Indexing Workflow  

`mongot` (1) indexes transformed docs from View, (2) watches change streams (View applied) and (3) serves queries, returning doc IDs to `mongod` for lookup.

---

Learn more: MongoDB Views, Atlas Vector Search docs.
</section>
<section>
<title>Review Deployment Options</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/deployment-options/</url>
<description>Explore deployment options for Atlas Vector Search, including cluster types, cloud providers, and node architecture for testing and production environments.</description>

# Review Deployment Options

## Quick Matrix

| Env | Deployment | Cluster Tier | Region | Node Arch |
| --- | ---------- | ------------ | ------ | ---------- |
| Test queries | Flex/shared/local | M0+ | Any | `mongod`+`mongot` same node |
| Prototype | Dedicated | Flex, M10–M20+ | Any | Same node |
| Production | Dedicated + Search Nodes | M10+ & S30+ | GCP (all) / AWS & Azure (limited) | Separate nodes |

## Resource Sizing

### RAM for Indexes  
`mongot` keeps full index in RAM. Reserve node RAM ≥ index size + JVM.

Vector size ≈ (dim × datatype)  
Examples (per vector, inc. metadata):

| Model | Dim | RAM |
| ----- | --- | --- |
| OpenAI ada-002 | 1536 | 6 KB |
| Google gecko | 768 | 3 KB |
| Cohere v3 | 1024 | 1.07 KB (`int8`), 0.167 KB (`int1`) |

### Quantization & BinData Benefits  
• Disk on `mongod`: –66%  
• `mongot` RAM: –3.75× (scalar) / –24× (binary)  

Quantized indexes also store full-precision on disk (for rescoring). Size guideline (binary):

```
index_disk ≈ raw_index * 25/24      # ~1.04×
```

Plan disk: free_space ≥ 1.25 × est.index.

Example index definition:

```json
{
  "fields": [{
    "type":"vector",
    "path":"my-embeddings",
    "numDimensions":1536,
    "similarity":"euclidean",
    "quantization":"binary"
  }]
}
```

### RAM on Shared Nodes  
(75% for index on ≤ M30; 50% on M40+)

| Tier | RAM | For Atlas VS |
| ---- | --- | ------------ |
| M10 | 2 GB | 1 GB |
| M20 | 4 GB | 2 GB |
| M30 | 8 GB | 4 GB |

## Testing & Prototyping

• Use shared/Flex (M0–M30) or local single-node.  
• `mongod` & `mongot` share node ⇒ possible contention; acceptable for dev only.  
• `$search` queries scatter-gather in sharded clusters; zone-aware if using zones.

## Production

### Separate Search Nodes  
• Enable workload isolation; scale search independently.  
• Atlas deploys 2+ `mongot`/shard; load-balanced from `mongod`.  
• Queries served from Search Nodes only after indexes built there.

### Sizing Search Nodes  
• Choose search tier (S20, S30, …).  
• RAM ≥ index size × 1.10.  
• Prefer high-CPU tiers for lower latency (e.g., S20 High-CPU for 1 M × 768 = 3 GB).

### Benefits  
– Isolate resources, auto parallelism, independent scaling, higher availability.

### Encryption  
Customer-managed keys (AWS KMS) supported for Search Nodes.

### Migration Steps  
1. Ensure cluster ≥ M10.  
2. Move to region with Search Nodes.  
3. Add Search Nodes and pick search tier.
</section>
<section>
<title>Explain Atlas Vector Search Results</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/explain/</url>
<description>Run your Atlas Vector Search query with the explain method to learn about your $vectorSearch query plan and its execution statistics.</description>

# Explain Atlas Vector Search Results

```js
// Node.js: get full plan & stats
const cursor = db.collection('movies').aggregate([
  { $vectorSearch: {
      index: 'vector_index',
      path: 'plot_embedding',
      queryVector,
      numCandidates: 150,        // omit for exact search
      exact: false,              // true = ENN
      limit: 10
} }]);
const explain = await cursor.explain('allPlansExecution'); // or 'executionStats', 'queryPlanner'
```

## Verbosity Modes  
1. `allPlansExecution` – planner + full runtime stats (incl. partial plan-selection).  
2. `executionStats`      – planner + runtime stats.  
3. `queryPlanner`        – planner only (default).

## Top-Level `explain` Fields
| key | purpose |
|-----|---------|
| `collectors`          | aggregated collector stats (`allCollectorStats`). |
| `metadata`            | version, host, `indexName`, cursor options, `totalLuceneDocs`. |
| `query`               | logical query tree, args, and per-node `stats`. |
| `resultMaterialization` | per-doc fetch info (absent in `queryPlanner`). |
| `resourceUsage`       | CPU/page-fault/batch metrics (absent in `queryPlanner`). |

### `collectors.allCollectorStats`
`millisElapsed`, `collect`, `competitiveIterator`, `setScorer`.

### `query`
```
{
  path: <embedding field>,      // optional
  type: <QueryType>,
  args: {...},                  // structure depends on type
  stats: {...}                  // only with runtime modes
}
```

Supported `type` / `args`:

| Type | Key args |
|------|----------|
| `WrappedKnnQuery`      | `query: [ <KnnFloatVectorQuery>, <DocAndScoreQuery> ]` |
| `KnnFloatVectorQuery`  | `field`, `k` |
| `DocAndScoreQuery`     | — (scoring stats only) |
| `ExactVectorSearchQuery` | `field`, `similarityFunction` (`dotProduct`,`cosine`,`euclidean`), optional `filter` |
| `BooleanQuery`         | appears when pre-filter is used |
| `DefaultQuery`         | fallback, `queryType` describes actual Lucene query |

### `stats` (runtime modes)
Each area contains:
```
{ millisElapsed: <double>,
  invocationCounts: { <task>: <long> }
}
```
Areas & tasks:
- `context` : `createWeight`, `createScorer`, `vectorExecution`
- `match`   : `nextDoc`/`advance`, `refineRoughMatch`
- `score`   : `score`, `setMinCompetitiveScore`

### `resourceUsage`
`majorFaults`, `minorFaults`, `userTimeMs`, `systemTimeMs`, `maxReportingThreads`, `numBatches`.

## Pipeline Syntax Reference
```js
$vectorSearch: {
  index:        '<name>',          // required
  path:         '<vectorField>',   // required
  queryVector:  [Number],          // required
  limit:        <int>,             // required
  exact:        true|false,        // default false (ANN)
  numCandidates:<int>,             // ANN only
  filter:       <matchExpr>        // optional BSON query
}
```

Use `db.collection.explain(verbosity).aggregate(pipeline)` in mongosh, or `cursor.explain(verbosity)` in Node.js.
</section>
<section>
<title>How to Index Fields for Vector Search</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/vector-search-type/</url>
<description>Use the Atlas Vector Search type to index vector embeddings for vector search using the vectorSearch type.</description>

# Atlas Vector Search – Indexing Guide (Condensed)

## Index Definition  
```json
{
  "fields": [
    {                // Mandatory vector field (≥1 per index)
      "type": "vector",
      "path": "<field>",
      "numDimensions": <1-8192>,        // Depends on model/output
      "similarity": "euclidean" | "cosine" | "dotProduct",
      "quantization": "none" | "scalar" | "binary"   // opt., float vectors only
    },
    { "type": "filter", "path": "<field>" }          // Optional, multi-value ok
  ]
}
```
Limits & Notes  
• One-level arrays only; no arrays of docs/objects  
• Vector BSON types: double[], BinData(float32|int8|int1)  
• `dotProduct` & `cosine` need unit-length vectors; `dotProduct` is fastest  
• `binary` quantization: `numDimensions` multiple of 8  
• Idle node CPU ↑ due to `mongot`  
• M0/M2/M5/Flex index caps: 3/5/10/10, M10+: ≤2 500 total search indexes  

## Roles / Versions  
Create/Edit/Delete: Project Search Index Editor (or higher).  
Supported drivers ≥ Node.js 6.6.0 (others available).  
MongoDB ≥ 6.0.11 / 7.0.2.

## Node.js Quick Recipes  

### Connection Helper  
```js
const { MongoClient } = require("mongodb");
const client = new MongoClient("<connectionString>");
```

### Create Index  
Basic (vector only)  
```js
await client.connect();
const coll = client.db("sample_mflix").collection("embedded_movies");
await coll.createSearchIndex({
  name: "vector_index",            // default if omitted
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
});
```

Filter example  
```js
await coll.createSearchIndex({
  name: "vector_index",
  type: "vectorSearch",
  definition: { fields: [
    { type: "vector", path: "plot_embedding", numDimensions: 1536, similarity: "dotProduct" },
    { type: "filter", path: "genres" },
    { type: "filter", path: "year"   }
  ]}
});
```
Index build status polling:  
```js
let ready=false;
while(!ready){
  for await (const ix of coll.listSearchIndexes())
    if(ix.name==="vector_index" && ix.queryable) ready=true;
  if(!ready) await new Promise(r=>setTimeout(r,5000));
}
```

### View Index(es)  
```js
const all = await coll.listSearchIndexes().toArray();          // all
const one = await coll.listSearchIndexes("vector_index").toArray();
```

### Update Index (rebuilds in background)  
```js
await coll.updateSearchIndex("vector_index", {
  name: "vector_index",
  type: "vectorSearch",
  definition: { fields: [
    { type:"vector", path:"plot_embedding", numDimensions:1536,
      similarity:"dotProduct", quantization:"binary" }   // changed
  ]}
});
```

### Delete Index  
```js
await coll.dropSearchIndex("vector_index");
```

## Index Status Values  
Not Started → Initial Sync → Active → Recovering/Failed/Delete in Progress.  
Queries use previous version until new build becomes Active.

## Cluster-Tier Index Limits  
M0 3 | M2 5 | M5/Flex 10 | M10+ ≤2 500 (recommendation).

## Best-Practice Summary  
1. Store embeddings as BinData(float32/int8/int1) when possible.  
2. Choose similarity aligned with embedding training; default to `dotProduct`.  
3. Use filter fields to shrink candidate set and boost performance.  
4. Normalize vectors for `dotProduct`/`cosine`.  
5. Monitor CPU/memory; see “Memory Requirements for Indexing Vectors”.
</section>
<section>
<title>How to Measure the Accuracy of Your Query Results</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/evaluate-results/</url>
# Measure Atlas Vector Search Accuracy

Compare Approximate Nearest Neighbor (ANN) results with Exact Nearest Neighbor (ENN) to estimate recall. Useful when vectors are quantized, numerous, or low-dimensional.

## Workflow
1. **Index**  
   Create a Vector Search index on the embedding field plus any filter fields. Enable quantization for speed/size.

   ```json
   {
     "fields":[
       {"path":"plot_embedding","type":"vector","numDimensions":1536,"similarity":"euclidean","quantization":"binary"},
       {"path":"genres","type":"filter"}
     ]
   }
   ```

2. **Queries (Node.js)**  
   ```js
   const pipelineBase = [
     {
       $vectorSearch:{
         index:'vector_index',
         path:'plot_embedding',
         filter:{
           $and:[
             {genres:{$eq:'Action'}},
             {genres:{$ne:'Western'}}
           ]
         },
         queryVector,            // 1536-dim array
         limit:10
       }
     },
     {$project:{_id:0,title:1,genres:1,score:{$meta:'vectorSearchScore'}}}
   ];

   // ENN – ground truth
   await movies.aggregate([{...pipelineBase[0], exact:true}, pipelineBase[1]]).toArray();

   // ANN – faster
   await movies.aggregate([{...pipelineBase[0], numCandidates:100}, pipelineBase[1]]).toArray();
   ```
   • ENN scans all documents; ANN samples `numCandidates` then ranks.  
   • Higher `numCandidates` ⇒ closer to ENN but slower.

3. **Evaluate**  
   Compute Jaccard similarity between the two 10-doc result sets across ~100 queries to estimate ANN recall. Tune `numCandidates` until recall vs latency meets requirements.

Large ENN/ANN divergence → raise `numCandidates` or reconsider quantization settings.
</section>
<section>
<title>Build a Local RAG Implementation with Atlas Vector Search</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/tutorials/local-rag/</url>
<description>How to implement retrieval-augmented generation (RAG) for Atlas Vector Search using local embedding models and chat models.</description>

# Local RAG with Atlas Vector Search (Node.js)

## Prereqs  
• Atlas CLI ≥1.14.3 & MongoDB DB Tools  
• git-lfs, Hugging Face read token  
• Node ≥18, npm  
• `.env` with  
```bash
ATLAS_CONNECTION_STRING="<mongodb://localhost:<port>/?directConnection=true>" # or SRV
```

## 1  Deploy Atlas with sample data  
Local:  
```bash
atlas deployments setup          # follow prompts
curl -O https://atlas-education.s3.amazonaws.com/sampledata.archive
mongorestore --archive=sampledata.archive --port <port>
```
Cloud: create cluster & “Load Sample Data”.

## 2  Project setup  
```bash
mkdir local-rag && cd local-rag
npm init -y
npm i mongodb @xenova/transformers gpt4all dotenv
```

## 3  Download local models  
```bash
# Embedding
git clone https://<HF_USER>:<HF_TOKEN>@huggingface.co/mixedbread-ai/mxbai-embed-large-v1
# Generative
wget https://gpt4all.io/models/gguf/mistral-7b-openorca.gguf2.Q4_0.gguf -P .
curl -L https://gpt4all.io/models/models3.json -o models3.json
```

## 4  Generate embeddings  

`get-embeddings.js`
```js
import { env, pipeline } from '@xenova/transformers';
env.localModelPath = '/abs/path/to/mixedbread-ai/';  // parent dir
env.allowRemoteModels = false;

export async function embed(text){
  const emb = await (await pipeline('feature-extraction','mxbai-embed-large-v1'))
                (text,{pooling:'mean',normalize:true});
  return Array.from(emb.data);
}
```

`generate-embeddings.js`
```js
import { MongoClient } from 'mongodb';
import { embed } from './get-embeddings.js';
import 'dotenv/config';

const cli = new MongoClient(process.env.ATLAS_CONNECTION_STRING);
await cli.connect();
const col = cli.db('sample_airbnb').collection('listingsAndReviews');

const cur = col.find({
  summary:{ $exists:true, $ne:"" },
  embeddings:{ $exists:false }
}).limit(50);

for await (const d of cur){
  await col.updateOne({_id:d._id},
    {$set:{embeddings:await embed(d.summary)}});
}
await cli.close();
```

## 5  Create Vector Search index  

`vector-index.js`
```js
import { MongoClient } from 'mongodb';
import 'dotenv/config';

const cli = new MongoClient(process.env.ATLAS_CONNECTION_STRING);
await cli.connect();
await cli.db('sample_airbnb').collection('listingsAndReviews')
  .createSearchIndex({
    name:'vector_index',
    type:'vectorSearch',
    definition:{
      fields:[{type:'vector',path:'embeddings',numDimensions:1024,similarity:'cosine'}]
    }
  });
await cli.close();
```

## 6  Retrieve documents  

`retrieve-documents.js`
```js
import { MongoClient } from 'mongodb';
import { embed } from './get-embeddings.js';
import 'dotenv/config';

export async function fetchDocs(query){
  const qv = await embed(query);
  const cli = new MongoClient(process.env.ATLAS_CONNECTION_STRING);
  await cli.connect();
  const res = await cli.db('sample_airbnb').collection('listingsAndReviews')
    .aggregate([
      {$vectorSearch:{index:'vector_index',path:'embeddings',
                      queryVector:qv,exact:true,limit:5}},
      {$project:{_id:0,summary:1,listing_url:1,
                 score:{$meta:'vectorSearchScore'}}}
    ]).toArray();
  await cli.close();
  return res;
}
```

## 7  Local LLM QA  

`local-llm.js`
```js
import { loadModel, createCompletionStream } from 'gpt4all';
import { fetchDocs } from './retrieve-documents.js';
import 'dotenv/config';

const question = 'Can you recommend a few AirBnBs that are beach houses? Include a link.';
const docs = await fetchDocs('beach house');

let context = '';
docs.forEach(d=>context += `Summary: ${d.summary}\nLink: ${d.listing_url}\n`);

const prompt = `Use the context to answer:\n${context}\nQuestion: ${question}`;
const model = await loadModel('mistral-7b-openorca.gguf2.Q4_0.gguf',
  {allowDownload:false,modelConfigFile:'./models3.json'});

process.stdout.write('Answer: ');
const stream = createCompletionStream(model,prompt);
stream.tokens.on('data',t=>process.stdout.write(t));
await stream.result;
model.dispose();
```

Run:  
```bash
node --env-file=.env generate-embeddings.js
node --env-file=.env vector-index.js       # once
node --env-file=.env local-llm.js
```

You now have a fully local Retrieval-Augmented-Generation workflow using Atlas Vector Search, on-prem embeddings, and an on-device LLM.
</section>
<section>
<title>Vector Quantization</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/vector-quantization/</url>
<description>Use the Atlas Vector Search to ingest quantized vectors or automatically quantize vectors.</description>

# Vector Quantization

Atlas Vector Search can  
1. **Auto-quantize** float embeddings at index build time (`quantization: "scalar"`→`int8`, `quantization: "binary"`→`int1`).  
2. **Ingest pre-quantized vectors** stored as BSON `binData` (`float32`,`int8`,`int1`).

Memory vs. float32 (graph bytes unchanged):  
• scalar (int8) 4× smaller ⇒ 3.75× less RAM  
• binary (int1) 32× smaller ⇒ 24× less RAM + rescoring with full floats

Recommended: binary+rescoring for ≥10 M vectors or QAT models, scalar for low-dim un-QAT.

## Requirements (single field vector)

| mode | storage type | dims | similarity | index opts |
|------|--------------|------|------------|------------|
| ingest int1 | binData(int1) | multiple of 8 | euclidean | none |
| ingest int8 | binData(int8) | 1-8192 | cosine | euclidean | dotProduct | none |
| auto scalar | float32/array(double) → int8 | 1-8192 | cosine | euclidean | dotProduct | `"quantization":"scalar"` |
| auto binary | float32/array(double) → int1 | multiple of 8 | cosine | euclidean | dotProduct | `"quantization":"binary"` |

ANN & ENN supported for all.

## Enable Automatic Quantization

```jsonc
{
  "name": "idx",
  "type": "vectorSearch",
  "definition": {
    "fields": [
      {
        "type": "vector",
        "path": "embedding",
        "numDimensions": 1024,
        "similarity": "dotProduct",
        "quantization": "binary" // or "scalar"
      }
    ]
  }
}
```
Updating `quantization` rebuilds the index; query vectors are auto-converted.

## Ingest Pre-Quantized Vectors (Node.js ≥6.11)

### 1 Generate embeddings

```js
import { CohereClient } from 'cohere-ai';
const cohere = new CohereClient({token: process.env.COHERE_API_KEY});
const { float,int8,ubinary } = (await cohere.v2.embed({
  model:'embed-english-v3.0',
  inputType:'search_document',
  texts:data,
  embeddingTypes:['float','int8','ubinary']
})).embeddings;
```

### 2 Convert to BSON

```js
import { Binary } from 'mongodb';
// helper
const toBson = (v,fn) => fn(new (fn===Binary.fromFloat32Array?Float32Array:Int8Array)(v));

const docs = data.map((text,i)=>({
  text,
  emb: {
    float32: toBson(float[i],Binary.fromFloat32Array),
    int8   : toBson(int8[i],  Binary.fromInt8Array),
    int1   : toBson(ubinary[i],Binary.fromPackedBits) // packed bits
  }
}));
```

### 3 Upload & index

```js
import { MongoClient } from 'mongodb';
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
await client.connect();
await client.db('db').collection('coll').insertMany(docs);

await client.db('db').collection('coll').createSearchIndex({
  name:'vec',
  type:'vectorSearch',
  definition:{fields:[
    {type:'vector',path:'emb.float32',numDimensions:1024,similarity:'dotProduct'},
    {type:'vector',path:'emb.int8',   numDimensions:1024,similarity:'dotProduct'},
    {type:'vector',path:'emb.int1',   numDimensions:1024,similarity:'euclidean'}
  ]}
});
```

### 4 Query

```js
// get query embedding & BSON convert as above -> queryBin
const pipeline = [{
  $vectorSearch:{
    index:'vec',
    path:'emb.int1',   // or .float32/.int8
    queryVector: queryBin,
    numCandidates:20,
    limit:5
  }
},{
  $project:{_id:0,text:1,score:{$meta:'vectorSearchScore'}}
}];
const res = await client.db('db').collection('coll').aggregate(pipeline).toArray();
```

## Evaluate Accuracy  
Compare ANN results (default) with ENN by adding `"exact": true` in `$vectorSearch` to compute recall of quantized index.

```js
// exact search
{ $vectorSearch:{ ..., exact:true } }
```
</section>
<section>
<title>How to Create Vector Embeddings</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/create-embeddings/</url>
<description>Learn how to create vector embeddings for Atlas Vector Search, choose an embedding model, and ensure that your embeddings are correct and optimal.</description>

# Atlas Vector Search – Embeddings Guide (Node.js only)

## 1 Generate Embeddings

### 1.1 Project Setup
```bash
mkdir my-vector-app && cd $_
npm init -y
# ES modules
jq '. + {"type":"module"}' package.json > tmp && mv tmp package.json
npm i mongodb @xenova/transformers openai
# Node ≤19 ⇒ npm i dotenv
echo 'ATLAS_CONNECTION_STRING=<mongodb+srv://...>' > .env
echo 'OPENAI_API_KEY=<key>' >> .env
```

### 1.2 Open-Source Model (`get-embeddings.js`)
```js
import { pipeline } from '@xenova/transformers';
export async function getEmbedding(text){
  const embedder = await pipeline('feature-extraction',
                                   'Xenova/nomic-embed-text-v1');
  return Array.from((await embedder(text,{pooling:'mean',normalize:true})).data);
}
```

### 1.3 OpenAI Model (`get-embeddings.js`)
```js
import OpenAI from 'openai';
const openai = new OpenAI({apiKey:process.env.OPENAI_API_KEY});
export async function getEmbedding(text){
  return (await openai.embeddings.create({
            model:'text-embedding-3-small',
            input:text,encoding_format:'float'}))
            .data[0].embedding;
}
```

### 1.4 Optional Compression (`convert-embeddings.js`)
```js
import { Binary } from 'mongodb';
export function toBSON(vec){
  return Binary.fromFloat32Array(new Float32Array(vec));
}
```

---

## 2 Store Embeddings in Atlas

### 2.1 From New Data (`create-embeddings.js`)
```js
import { MongoClient } from 'mongodb';
import { getEmbedding } from './get-embeddings.js';          // choose impl
// import { toBSON } from './convert-embeddings.js';

const texts=[
 "Titanic: ... largest luxury liner ever built",
 "The Lion King: ... future king Simba searches for his identity",
 "Avatar: ... marine is dispatched to the moon Pandora on a unique mission"
];

const client=new MongoClient(process.env.ATLAS_CONNECTION_STRING);
await client.connect();
const col=client.db('sample_db').collection('embeddings');

const docs=await Promise.all(texts.map(async t=>{
  let emb=await getEmbedding(t);
  // emb=toBSON(emb);
  return {text:t,embedding:emb};
}));
await col.insertMany(docs,{ordered:false});
console.log('Inserted',docs.length);
await client.close();
```

### 2.2 Add Embeddings to Existing Docs
```js
import { MongoClient } from 'mongodb';
import { getEmbedding } from './get-embeddings.js';

const client=new MongoClient(process.env.ATLAS_CONNECTION_STRING);
await client.connect();
const col=client.db('sample_airbnb').collection('listingsAndReviews');

const docs=await col.find({summary:{$nin:[null,'']},embedding:{$exists:false}})
                    .limit(50).toArray();

const ops=await Promise.all(docs.map(async d=>{
  const emb=await getEmbedding(d.summary);
  return {updateOne:{filter:{_id:d._id},update:{$set:{embedding:emb}}}};
}));

await col.bulkWrite(ops,{ordered:false});
console.log('Updated',ops.length);
await client.close();
```

---

## 3 Create Vector Index

### `create-index.js`
```js
import { MongoClient } from 'mongodb';
const client=new MongoClient(process.env.ATLAS_CONNECTION_STRING);
await client.connect();
const col=client.db('sample_db').collection('embeddings');          // adjust ns
await col.createSearchIndex({
  name:'vector_index',
  type:'vectorSearch',
  definition:{
    fields:[{
      type:'vector',
      path:'embedding',
      similarity:'dotProduct',   // or 'euclidean','cosine'
      numDimensions:768          // 768 OSS, 1536 OpenAI, etc.
    }]
  }
});
console.log('Index build started');
await client.close();
```

---

## 4 Query with Vector Search

### `vector-query.js`
```js
import { MongoClient } from 'mongodb';
import { getEmbedding } from './get-embeddings.js';
const client=new MongoClient(process.env.ATLAS_CONNECTION_STRING);
await client.connect();
const col=client.db('sample_db').collection('embeddings');    // adjust ns

const qVec=await getEmbedding('ocean tragedy');

const pipeline=[
  {$vectorSearch:{
      index:'vector_index',
      queryVector:qVec,
      path:'embedding',
      exact:true,
      limit:5 }},
  {$project:{_id:0,text:1,score:{$meta:'vectorSearchScore'}}}
];

for await (const doc of col.aggregate(pipeline))
  console.log(doc);
await client.close();
```

---

## 5 Best Practices & Notes

* Pick model → sets `numDimensions`.  
  – nomic-embed-text-v1 = 768  – text-embedding-3-small = 1536

* Batch generation to avoid OOM; test on small subset first.

* Optionally store `binData` (`Binary.fromFloat32Array`) to cut vector storage by ~3× and speed large (>20 doc) queries. Requires Node driver ≥ 6.11 (or PyMongo 4.10, Java 5.3.1).

* Ensure index dimensions = stored/vector dimensions, else query errors.

* Monitor CPU/RAM when embedding large datasets; retry on 503 from HF hub.

---

## Next Steps
RAG patterns with Atlas Vector Search, vector quantization for further storage/latency gains.
</section>
<section>
<title>Retrieval-Augmented Generation (RAG) with Atlas Vector Search</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/rag/</url>
<description>Use MongoDB Atlas Vector Search to implement retrieval-augmented-generation (RAG) in your generative AI applications.</description>

# Retrieval-Augmented Generation (RAG) with Atlas Vector Search

RAG augments an LLM with fresh, private data in three steps:

1. Ingestion → load → chunk → embed → store vectors in Atlas.  
2. Retrieval → convert user prompt to a vector → `$vectorSearch` (or integration) to fetch k similar docs.  
3. Generation → send prompt + docs to an LLM (API, open-source, or hosted) to craft the answer.  

Atlas advantages: single store for JSON + vectors, fast indexing, hybrid search, filtering.

---

## Quick Start (Node.js)

### Prereqs  
- Cluster ≥ 6.0.11, IP allow-listed, `mongodb+srv://…` string  
- Hugging Face token, Node ≥ 20, npm  
- Optional: `--env-file .env` with  
  ```
  ATLAS_CONNECTION_STRING=<cluster-uri>
  HUGGING_FACE_ACCESS_TOKEN=<hf-token>
  ```  

### 1 Generate Embeddings
```js
// get-embeddings.js
import { pipeline } from '@xenova/transformers';
export async function embed(text) {
  const pipe = await pipeline('feature-extraction','Xenova/nomic-embed-text-v1');
  const v = await pipe(text,{ pooling:'mean', normalize:true });
  return Array.from(v.data);        // 768-dim cosine-normalized vector
}
```

### 2 Ingest Data
```js
// ingest-data.js
import { PDFLoader }        from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { MongoClient }      from 'mongodb';
import { embed }            from './get-embeddings.js';
import fs from 'fs';

const uri=process.env.ATLAS_CONNECTION_STRING; 
const client=new MongoClient(uri);
const pdfURL = 'https://investors.mongodb.com/node/12236/pdf';

(async ()=> {
  // download once
  const bytes = await (await fetch(pdfURL)).arrayBuffer();
  fs.writeFileSync('report.pdf', Buffer.from(bytes));

  // chunk
  const docs = await new RecursiveCharacterTextSplitter({
        chunkSize:400, chunkOverlap:20
      }).splitDocuments(await new PDFLoader('report.pdf').load());
  console.log(`Chunks: ${docs.length}`);

  // embed+insert
  await client.connect();
  const col = client.db('rag_db').collection('test');
  const toInsert = await Promise.all(docs.map(async d=>({
      text:d.pageContent,
      embedding: await embed(d.pageContent)
  })));
  console.log('Inserted:', (await col.insertMany(toInsert,{ordered:false})).insertedCount);
  await client.close();
})();
```

### 3 Create Vector Index
```js
// rag-vector-index.js
import { MongoClient } from 'mongodb';
const col=new MongoClient(process.env.ATLAS_CONNECTION_STRING)
           .db('rag_db').collection('test');

await col.createSearchIndex({
  name:'vector_index',
  type:'vectorSearch',
  definition:{ fields:[{ type:'vector', path:'embedding',
                         numDimensions:768, similarity:'cosine'}]}
});
console.log('Index building…');
```

### 4 Retrieve Docs
```js
// retrieve-documents.js
import { MongoClient } from 'mongodb';
import { embed }       from './get-embeddings.js';

export async function retrieve(query,k=5){
  const col=new MongoClient(process.env.ATLAS_CONNECTION_STRING)
             .db('rag_db').collection('test');
  const qVec = await embed(query);
  const cursor = col.aggregate([
    { $vectorSearch:{ index:'vector_index', path:'embedding',
                      queryVector:qVec, limit:k, exact:true }},
    { $project:{ _id:0, text:1 } }
  ]);
  return await cursor.toArray();
}
```

### 5 Generate Answer
```js
// generate-responses.js
import { retrieve }           from './retrieve-documents.js';
import { HfInference }        from '@huggingface/inference';

(async()=>{
  const question = "In a few sentences, what are MongoDB's latest AI announcements?";
  const docs     = await retrieve("AI Technology");
  const context  = docs.map(d=>d.text).join(' ');

  const prompt = `Answer based on the context.\nContext: ${context}\nQuestion: ${question}`;
  const hf = new HfInference(process.env.HUGGING_FACE_ACCESS_TOKEN);
  const res = await hf.chatCompletion({
     model: "mistralai/Mistral-7B-Instruct-v0.3",
     messages:[{ role:"user", content:prompt }],
     max_tokens:150, temperature:0.1
  });
  console.log(res.choices[0].message.content);
})();
```

Run in order:
```
node --env-file .env ingest-data.js
node --env-file .env rag-vector-index.js   # wait ~1 min
node --env-file .env generate-responses.js
```

---

## Tuning & Next Steps  
- Change embedding model, chunk sizes, or LLM.  
- Pre-filter or combine `$vectorSearch` with `$search` for hybrid ranking.  
- See “Integrate Vector Search with AI Technologies” and the MongoDB Chatbot Framework for full-stack patterns.
</section>
<section>
<title>Atlas Vector Search Quick Start</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/tutorials/vector-search-quick-start/</url>
<description>Learn how to create and manage an Atlas Vector Search index for vector embeddings and perform vector search on the indexed field.</description>

# Atlas Vector Search Quick Start

**Goal**  
1. Build Atlas Vector Search index `vector_index` on `sample_mflix.embedded_movies.plot_embedding`  
   • 1536-dim vectors from OpenAI `text-embedding-ada-002`  
   • `similarity:"dotProduct"` + optional `"quantization":"scalar"`  
2. Run a `$vectorSearch` query with the *time travel* embedding → return 10 nearest plots from ≤150 candidates.

Dataset: load Atlas sample `sample_mflix` (ensure `embedded_movies` exists).

---

## 1 – Create the Index (Node.js)

```javascript
// npm i mongodb
const { MongoClient } = require("mongodb");
const uri = "<connectionString>";          // Atlas or local
const client = new MongoClient(uri);

async function createIndex() {
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
        quantization: "scalar"          // optional, improves storage/speed
      }]
    }
  };
  const name = await coll.createSearchIndex(index);
  console.log(`Index ${name} building…`);
  // poll status
  while (true) {
    const idx = (await coll.listSearchIndexes().toArray())
      .find(i => i.name === name);
    if (idx?.queryable) break;
    await new Promise(r => setTimeout(r, 5000));
  }
  console.log(`${name} ready`);
}
createIndex().finally(()=>client.close());
```

---

## 2 – Query with Vector Search (Node.js)

```javascript
const { MongoClient } = require("mongodb");
const uri = "<connectionString>";
const client = new MongoClient(uri);

const timeTravelEmbedding = [-0.0016261312, -0.028070757, /* 1534 more */];

async function vectorQuery() {
  const coll = client.db("sample_mflix").collection("embedded_movies");
  const pipeline = [
    {
      $vectorSearch: {
        index: "vector_index",
        path: "plot_embedding",
        queryVector: timeTravelEmbedding,
        numCandidates: 150,
        limit: 10,
        quantization: "scalar"          // omit if index not quantized
      }
    },
    {
      $project: {
        _id: 0,
        title: 1,
        plot: 1,
        score: { $meta: "vectorSearchScore" }
      }
    }
  ];
  for await (const doc of coll.aggregate(pipeline)) console.log(doc);
}
vectorQuery().finally(()=>client.close());
```

Example top hit:  
`{ title:"Thrill Seekers", score:0.93, plot:"A reporter…time travelers…" }`

---

## Key Concepts

• **Embeddings**: Any model; dimensions & recommended similarity must match index. Quick-start uses 1536-d Ada-002 + dotProduct.  
• **Vector Index**: Declares `path`, `numDimensions`, `similarity`; optional `quantization` (scalar, bf16, int8).  
• **Query**: `$vectorSearch` supports Approximate (default) or Exact NN; options: `filter`, `numCandidates`, `limit`. Combine with other agg stages for hybrid search.  
• **Use-cases**: semantic text, image, audio, multimodal RAG, chatbots, etc.

Next: create your own embeddings, integrate with AI frameworks, or build RAG/chatbot solutions with Atlas Vector Search.
</section>
</guide>