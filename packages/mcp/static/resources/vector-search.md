<guide>
<guide_topic>Atlas Vector Search</guide_topic>

<section>
<title>Atlas Vector Search Overview</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/vector-search-overview/</url>
<description>Use MongoDB Atlas Vector Search to create vector indexes and perform vector search, including semantic search and hybrid search, on your vector embeddings.</description>


# Atlas Vector Search

Atlas lets you store embeddings and run vector search alongside standard data ops.

Supported cluster versions  
• ANN (HNSW): ≥ 6.0.11, 7.0.2  
• ENN (exact): ≥ 6.0.16, 7.0.10, 7.3.2  

Main use cases  
• Semantic search (ANN / ENN)  
• Hybrid search = `$vectorSearch` + full-text stages  
• Generative / RAG: ingest → retrieve with `$vectorSearch` → LLM answer

Integrations: OpenAI, AWS, Google, plus MongoDB partner libs.

Key terms  
• Vector = dense float array (≤ 8192 dims)  
• Embedding = vector from an embedding model; model defines dimension length.  
• Similarity = distance between vectors.

Indexing  
```jsonc
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "embedding": {
        "type": "vector",
        "dims": <int>,          // model dim
        "similarity": "euclidean"|"cosine"|"dotProduct"
      },
      "category": { "type": "string" },    // optional filter fields
      "createdAt": { "type": "date" }
    }
  }
}
```
• You may index bool, date, objectId, numeric, string, UUID (scalar/array) as filters.

Querying  
`$vectorSearch` must be first pipeline stage.

```jsonc
{
  $vectorSearch: {
    index: "vecIndex",
    path: "embedding",
    queryVector: [ <float>, … ],
    numCandidates: <int>,   // ANN only
    limit: <int>,           // required
    filter: { category: "fruit", rating: { $gte: 4 } },
    algorithm: "approx"|"exact"
  }
}
```
Pipeline stages after `$vectorSearch` can sort, project, etc.

Algorithm details  
• approx = ANN (fast, uses numCandidates)  
• exact = ENN (scans all embeddings, ignores numCandidates)

Performance: isolate workload with dedicated Search Nodes.

Further learning: Quick Start, Tutorials, University course.

</section>
<section>
<title>Atlas Vector Search Quick Start</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/tutorials/vector-search-quick-start/</url>
<description>Learn how to create and manage an Atlas Vector Search index for vector embeddings and perform vector search on the indexed field.</description>


# Atlas Vector Search Quick Start

## Sample Collection  
`sample_mflix.embedded_movies` contains movie docs with:  
- `plot` – text.  
- `plot_embedding` – 1536-dim float[] (OpenAI `text-embedding-ada-002`).  

## 1. Create Vector Search Index  

Definition (identical for Atlas UI “JSON Editor”, `mongosh`, drivers):

```json
{
  "name": "vector_index",
  "type": "vectorSearch",
  "fields": [{
    "type": "vector",
    "path": "plot_embedding",
    "numDimensions": 1536,
    "similarity": "dotProduct",
    "quantization": "scalar"
  }]
}
```

### Atlas UI  
Clusters → Atlas Search → Create Search Index → Atlas Vector Search → paste definition.  

### mongosh  

```js
use sample_mflix
db.embedded_movies.createSearchIndex(
  "vector_index",
  "vectorSearch",
  { fields: [{type:"vector",path:"plot_embedding",numDimensions:1536,
              similarity:"dotProduct",quantization:"scalar"}] }
)
```

### Python  

```python
from pymongo.mongo_client import MongoClient
from pymongo.operations import SearchIndexModel

client = MongoClient("<connectionString>")
coll   = client.sample_mflix.embedded_movies
model  = SearchIndexModel(
  name="vector_index", type="vectorSearch",
  definition={"fields":[{"type":"vector","path":"plot_embedding",
                         "numDimensions":1536,"similarity":"dotProduct",
                         "quantization":"scalar"}]})
print("Building:", coll.create_search_index(model=model))
```

### Node.js  

```js
const {MongoClient}=require("mongodb");
const client=new MongoClient("<connectionString>");
(async()=>{
  const coll=client.db("sample_mflix").collection("embedded_movies");
  const index={
    name:"vector_index",type:"vectorSearch",
    definition:{fields:[{type:"vector",path:"plot_embedding",
                         numDimensions:1536,similarity:"dotProduct",
                         quantization:"scalar"}]}
  };
  console.log("Building:", await coll.createSearchIndex(index));
})();
```

Polling `collection.listSearchIndexes()` until `queryable:true` is optional; index is usually ready in ≈1 min.

---

## 2. Run Vector Search Query  

Query embeddings for “time travel” (`1536` floats truncated here):

```js
const QUERY = [-0.0016261312, -0.028070757, /* … */];
```

Aggregation pipeline (same for UI, shell, drivers):

```json
[
  {
    "$vectorSearch": {
      "index": "vector_index",
      "path": "plot_embedding",
      "queryVector": QUERY,
      "numCandidates": 150,
      "limit": 10,
      "quantization": "scalar"
    }
  },
  {
    "$project": {
      "_id": 0,
      "plot": 1,
      "title": 1,
      "score": { "$meta": "vectorSearchScore" }
    }
  }
]
```

### Python  

```python
pipeline=[
 {"$vectorSearch":{"index":"vector_index","path":"plot_embedding",
   "queryVector":QUERY,"numCandidates":150,"limit":10,
   "quantization":"scalar"}},
 {"$project":{"_id":0,"plot":1,"title":1,
              "score":{"$meta":"vectorSearchScore"}}}
]
for doc in coll.aggregate(pipeline): print(doc)
```

### Node.js  

```js
const agg=[
 { $vectorSearch:{ index:"vector_index", path:"plot_embedding",
   queryVector:QUERY, numCandidates:150, limit:10 } },
 { $project:{ _id:0, plot:1, title:1,
   score:{ $meta:"vectorSearchScore" } } }
];
const cursor=coll.aggregate(agg);
for await (const doc of cursor) console.log(doc);
```

Results include top-10 `plot`/`title` with similarity `score`.

---

## Notes  
- Always match `numDimensions` & `similarity` to your embedding model.  
- Store embeddings and source data in same doc to enable hybrid search.

</section>
<section>
<title>How to Create Vector Embeddings</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/create-embeddings/</url>
<description>Learn how to create vector embeddings for Atlas Vector Search, choose an embedding model, and ensure that your embeddings are correct and optimal.</description>


# Atlas Vector Search – Embeddings Quick Reference

## 1 Prerequisites  
• MongoDB Atlas 6.0.11/7.0.2+ cluster, IP whitelisted  
• Drivers: PyMongo ≥4.10, Node.js ≥6.11  
• Env vars:  
```bash
ATLAS_CONNECTION_STRING="mongodb+srv://<user>:<pwd>@<cluster>.mongodb.net"
OPENAI_API_KEY="<key>"        # only if using OpenAI
```

---

## 2 Generate Embeddings

### Python  
```python
# open-source (nomic-embed-text-v1, 768 dims)
pip install -q sentence-transformers pymongo einops
from sentence_transformers import SentenceTransformer
model = SentenceTransformer("nomic-ai/nomic-embed-text-v1", trust_remote_code=True)
def get_embedding(text, prec="float32"):
    return model.encode(text, precision=prec).tolist()
```

```python
# OpenAI (text-embedding-3-small, 1536 dims)
pip install -q openai pymongo
import os, openai
openai.api_key = os.getenv("OPENAI_API_KEY")
def get_embedding(text):
    return openai.Embedding.create(input=[text],
                                   model="text-embedding-3-small"
                                  ).data[0].embedding
```

### Node.js (ESM)  
```bash
npm i mongodb               # +@xenova/transformers  OR  +openai
```
```js
// open-source (nomic-embed-text-v1, 768 dims)
import { pipeline } from '@xenova/transformers';
export async function getEmbedding(text){
  const emb = await pipeline('feature-extraction','Xenova/nomic-embed-text-v1');
  return Array.from((await emb(text,{pooling:'mean',normalize:true})).data);
}
```
```js
// OpenAI (text-embedding-3-small, 1536 dims)
import OpenAI from 'openai';
const openai = new OpenAI({apiKey:process.env.OPENAI_API_KEY});
export async function getEmbedding(text){
  return (await openai.embeddings.create({
           model:"text-embedding-3-small",input:text,encoding_format:"float"}))
           .data[0].embedding;
}
```

---

## 3 (Opt) Compress to BSON binData  
Python ≥4.10 / Node ≥6.11 drivers accept   `Binary.from_vector(vector, BinaryVectorDtype.FLOAT32)` (PyMongo) or `Binary.fromFloat32Array(new Float32Array(v))` (Node) to shrink size ≈3×.

---

## 4 Store Documents

### Python  
```python
docs=[{"text":t,"embedding":get_embedding(t)} for t in texts]
mongo_client=pymongo.MongoClient(os.getenv("ATLAS_CONNECTION_STRING"))
mongo_client.sample_db.embeddings.insert_many(docs)
```

### Node.js  
```js
const client=new MongoClient(process.env.ATLAS_CONNECTION_STRING);
await client.db("sample_db").collection("embeddings")
           .insertMany(texts.map(t=>({text:t,embedding:await getEmbedding(t)})),
                       {ordered:false});
```

---

## 5 Create Vector Index

`numDimensions` = 768 (nomic) or 1536 (OpenAI). Similarity typically `dotProduct`.

### Python  
```python
from pymongo.operations import SearchIndexModel
idx=SearchIndexModel(name="vector_index",type="vectorSearch",
    definition={"fields":[{"type":"vector","path":"embedding",
                           "numDimensions":<dims>,"similarity":"dotProduct"}]})
collection.create_search_index(idx)
```

### Node.js  
```js
await collection.createSearchIndex({
  name:"vector_index",type:"vectorSearch",
  definition:{fields:[{type:"vector",path:"embedding",
                       numDimensions:<dims>,similarity:"dotProduct"}]}
});
```

Atlas builds index (~1 min). Poll `listSearchIndexes` if needed.

---

## 6 Query

### Pipeline (same in all drivers)
```json
[
 {"$vectorSearch":{
     "index":"vector_index",
     "path":"embedding",
     "queryVector": <array>,   // from getEmbedding(searchText)
     "exact": true,
     "limit": 5
 }},
 {"$project":{
     "_id":0,
     "text":1,                 // or summary, etc.
     "score": {"$meta":"vectorSearchScore"}
 }}
]
```

### Python  
```python
qvec=get_embedding("ocean tragedy")
for doc in collection.aggregate(pipeline):
    print(doc)
```

### Node.js  
```js
const qvec=await getEmbedding("ocean tragedy");
for await (const d of collection.aggregate(pipeline)) console.log(d);
```

---

## 7 Best Practices  
• Batch embedding generation; test on small subsets first.  
• Ensure index `numDimensions` equals embedding length.  
• Convert to `binData` to cut storage & speed reads.  
• Monitor RAM/CPU for large operations.

---

</section>
<section>
<title>How to Index Fields for Vector Search</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/vector-search-type/</url>
<description>Use the Atlas Vector Search type to index vector embeddings for vector search using the vectorSearch type.</description>


# Atlas Vector Search Indexing Guide

## Considerations
* Index type: `vectorSearch`; ineligible with deprecated `knnBeta`.
* Index vectors ≤8192 dims; store as BinData `float32|int1|int8` or double array.
* Only one‐element arrays allowed; no arrays-of-docs paths.
* Idle node CPU ↑ due to `mongot`.
* Index count limits: M0=3, M2=5, M5/Flex=10; M10+ ≤2500 recommended.

## Index JSON
```json
{
  "fields":[
    { "type":"vector", "path":"<field>", "numDimensions":<1-8192>, 
      "similarity":"euclidean|cosine|dotProduct",
      "quantization":"none|scalar|binary" },   //quantization optional
    { "type":"filter", "path":"<field>" }
  ]
}
```

### Field Options
| Path | Req | Values |
|------|-----|--------|
|`type`|Y|`vector` (embedding) or `filter` (prefilter boolean,date,oid,num,string,uuid,arrays)|
|`numDimensions`|Y for vector|≤8192; binary quantization dims multiple of 8 |
|`similarity`|Y for vector|euclidean, cosine, dotProduct (normalize for dotProduct)|
|`quantization`|Opt|`none`(default), `scalar`, `binary` (dims %8=0)|

### Similarity Support Matrix
`int1`: euclidean; `int8`, `float32`, `array(float32)`: all 3.

## Create Index

### Atlas Admin API
```bash
curl -u "{PUB}:{PRIV}" --digest -H "Content-Type: application/json" \
  -X POST "https://cloud.mongodb.com/api/atlas/v2/groups/{groupId}/clusters/{cluster}/search/indexes" \
  --data '{
    "database":"<db>", "collectionName":"<coll>",
    "type":"vectorSearch", "name":"<indexName>",
    "definition":{...JSON above...}
}'
```

### mongosh ≥2.1.2
```js
use <db>
db.<coll>.createSearchIndex(
  "<indexName>", "vectorSearch",
  {fields:[{type:"vector",path:"plot_embedding",numDimensions:1536,similarity:"dotProduct"},
           {type:"filter",path:"genres"}]})
```

### Node.js ≥6.6.0
```javascript
const {MongoClient}=require("mongodb");
const cli=new MongoClient("<conn>");
async function main(){
 const c=cli.db("sample_mflix").collection("embedded_movies");
 const idx={
   name:"vector_index", type:"vectorSearch",
   definition:{fields:[{type:"vector",path:"plot_embedding",
                        numDimensions:1536,similarity:"dotProduct",quantization:"scalar"},
                       {type:"filter",path:"genres"}]}};
 const res=await c.createSearchIndex(idx);
 console.log("building",res);
 //poll readiness
 while(!(await c.listSearchIndexes().toArray())
        .find(i=>i.name===res && i.queryable)) await new Promise(r=>setTimeout(r,5000));
}
main();
```

### Python (PyMongo ≥4.7)
```python
from pymongo import MongoClient
from pymongo.operations import SearchIndexModel
cli=MongoClient("<conn>")
col=cli.sample_mflix.embedded_movies
model=SearchIndexModel(
  definition={"fields":[{"type":"vector","path":"plot_embedding",
                         "numDimensions":1536,"similarity":"dotProduct",
                         "quantization":"scalar"},
                        {"type":"filter","path":"genres"}]},
  name="vector_index", type="vectorSearch")
idx=col.create_search_index(model=model)
print("building",idx)
while not next(col.list_search_indexes(idx))["queryable"]:
    time.sleep(5)
```

## View Indexes

* API: `GET /search/indexes/{db}/{coll}` or `/.../{indexName|id}`
* mongosh: `db.<coll>.getSearchIndexes("<name>")`
* Node: `collection.listSearchIndexes("<name>").toArray()`
* PyMongo: `collection.list_search_indexes("<name>")`

## Update Index

* API `PATCH /search/indexes/{...}`
* mongosh `db.<coll>.updateSearchIndex("<name>",{fields:[...]})`
* Node `collection.updateSearchIndex("<name>", updatedIdxDef)`
* PyMongo `collection.update_search_index("<name>", updatedDef)`

(Atlas rebuilds; old index usable until new Active.)

## Delete Index

* API `DELETE /search/indexes/{...}`
* mongosh `db.<coll>.dropSearchIndex("<name>")`
* Node `collection.dropSearchIndex("<name>")`
* PyMongo `collection.drop_search_index("<name>")`

## Index Status Values
|Status|Meaning|
|------|-------|
|Not Started|build not begun|
|Initial Sync|building/rebuilding; new idx not queryable; old idx still works|
|Active|ready|
|Recovering|replication lag; queries ok but updating|
|Failed|build failed|
|Delete in Progress|dropping|

Documents column shows % indexed during build.

## Supported Client Versions (create/list/update/drop helper)
C 1.28+, C++ 3.11+, C# 3.1+, Go 1.16+, Java/Kotlin/Scala 5.2+, Node 6.6+, PHP 1.20+, Python 4.7+, Rust 3.1+.

</section>
<section>
<title>Run Vector Search Queries</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/vector-search-stage/</url>
<description>Explore how to perform vector search queries using Atlas Vector Search, supporting both Approximate and Exact Nearest Neighbor searches.</description>


# Run Vector Search Queries

```json
{
  "$vectorSearch": {
    "index": "<vector index>",          # required
    "path": "<vector field>",           # required
    "queryVector": [<float32|binData>], # required, dims == index.dimensions
    "limit": <int>,                     # required, ≤ numCandidates
    "exact": true|false,                # omit for ANN
    "numCandidates": <int>,             # req. for ANN, ≤10000, ≥20×limit
    "filter": { <MQL pre-filter> }      # optional
  }
}
```

ANN (default): HNSW, low latency, recall ~90–95 %. Tune `numCandidates`.  
ENN (`exact:true`): exhaustive; use for ≤10 k docs, selective filters, or recall validation.

Supported MongoDB versions  
ANN ≥ 6.0.11 / 7.0.2  ENN ≥ 6.0.16 / 7.0.10 / 7.3.2

$vectorSearch rules  
• First stage only; not allowed inside `$lookup/$facet` or views.  
• Indexed with vectorSearch index: `vector` and optional `filter` field types.  
• Score (0–1) returned via `$meta:"vectorSearchScore"`.  
  cosine: `(1+cos)/2`; dot: `(1+dot)/2`; euclidean: `1/(1+dist)`.

Pre-filter  
Filterable BSON scalar/array types. Supported MQL: `$eq|$ne`, `$gt|$gte|$lt|$lte`, `$in|$nin`, `$not|$nor|$and|$or`.  
Short-form `$eq` allowed. Combine filters with `$and`.

Performance tips  
`numCandidates` ≥20×`limit`; raise for large indexes, small limits, or quantized vectors (`int8|int1`).  
Dedicated Search Nodes improve latency; high concurrency may fall back to single thread—raise `numCandidates` for stability.

---

## Quick Examples

### Python – ANN basic
```python
pipeline=[
 {"$vectorSearch":{
   "index":"vector_index",
   "path":"plot_embedding",
   "queryVector":[...],
   "numCandidates":150,
   "limit":10}},
 {"$project":{
   "_id":0,"title":1,"plot":1,
   "score":{"$meta":"vectorSearchScore"}}}]
list(client.db.embedded_movies.aggregate(pipeline))
```

### Node.js – ANN with filter
```js
const agg=[
 { $vectorSearch:{
     index:"vector_index",
     path:"plot_embedding",
     filter:{ $and:[{year:{$gt:1955}}, {year:{$lt:1975}}] },
     queryVector:[...],
     numCandidates:150,
     limit:10 }},
 { $project:{ _id:0,title:1,plot:1,year:1,
              score:{ $meta:"vectorSearchScore" } }}];
await coll.aggregate(agg).forEach(console.log);
```

### Python – ENN
```python
pipeline=[
 {"$vectorSearch":{
   "index":"vector_index",
   "path":"plot_embedding",
   "queryVector":[...],
   "exact":True,
   "limit":10}},
 {"$project":{
   "_id":0,"title":1,"plot":1,
   "score":{"$meta":"vectorSearchScore"}}}]
```

Use same patterns in other drivers (`mongosh`, etc.).

</section>
<section>
<title>Explain Atlas Vector Search Results</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/explain/</url>
<description>Run your Atlas Vector Search query with the explain method to learn about your $vectorSearch query plan and its execution statistics.</description>


# Explain Atlas Vector Search Results

```javascript
// Shell / Driver Aggregate Syntax
db.<collection>.explain("<verbosity>").aggregate([
  {
    $vectorSearch: {
      index: "<index>",
      path: "<vectorField>",
      queryVector: [<floats>],
      limit: <N>,
      numCandidates: <K>,     // ANN only
      exact: true | false,    // default ANN; true = ENN
      filter: { ... }         // optional pre-filter
    }
  }
])
```

Verbosity (`queryPlanner` default → least detail):  
• `allPlansExecution` – plan + full exec stats, incl. partial during plan selection  
• `executionStats` – plan + exec stats  
• `queryPlanner` – plan only

## `explain` Result (top level)

| Field | Purpose | Returned when |
|-------|---------|---------------|
| `query` | Query tree + stats | always |
| `collectors` | Aggregated collector stats | execStats / allPlansExecution |
| `resultMaterialization` | Per-doc fetch stats | execStats / allPlansExecution |
| `resourceUsage` | CPU/memory/page-faults, batches, threads | execStats / allPlansExecution |
| `metadata` | Version, host, index, cursorOptions, totalLuceneDocs | always |

### `collectors.allCollectorStats`
Timing & counts across all Lucene collectors: `collect`, `competitiveIterator`, `setScorer`.

### `query` Object
| Key | Required | Description |
|-----|----------|-------------|
| `type` | ✓ | Query type (see below) |
| `args` | ✓ | Query-specific options |
| `path` | ✕ | Vector field if not root |
| `stats` | ✕ | Timing breakdown (execStats / allPlansExecution) |

Query types & main `args` keys:  
• `WrappedKnnQuery` → `query`[ `KnnFloatVectorQuery`, `DocAndScoreQuery` ]  
• `KnnFloatVectorQuery` → `field`, `k`  
• `ExactVectorSearchQuery` → `field`, `similarityFunction` (`dotProduct`/`cosine`/`euclidean`), optional `filter`  
• `DocAndScoreQuery`, `BooleanQuery`, `DefaultQuery` → driver-defined helpers.

`stats` timing areas (each with `millisElapsed`, `invocationCounts`):  
`context` (`createWeight`, `createScorer`, `vectorExecution`) • `match` (`nextDoc`, `refineRoughMatch`) • `score` (`score`, `setMinCompetitiveScore`)

### `resourceUsage`
`majorFaults`, `minorFaults`, `userTimeMs`, `systemTimeMs`, `maxReportingThreads`, `numBatches`.

## Minimal Driver Examples

```python
# Python (pymongo >=4.6)
pipeline = [{
  "$vectorSearch": {
    "index": "vector_index",
    "path": "plot_embedding",
    "queryVector": QUERY_EMBEDDING,
    "numCandidates": 150,
    "limit": 10
}}]

result = db.command("aggregate", "embedded_movies",
                    pipeline=pipeline,
                    explain="executionStats")   # or "queryPlanner", "allPlansExecution"
print(result)
```

```javascript
// Node.js (mongodb >=6)
const pipeline = [{
  $vectorSearch: {
    index: "vector_index",
    path: "plot_embedding",
    queryVector: QUERY_EMBEDDING,
    exact: true,          // ENN example
    limit: 10
  }
}];

const explain = await db.collection("embedded_movies")
  .explain("allPlansExecution")
  .aggregate(pipeline)
  .toArray();         // cursor exhausted to realize explain
console.log(explain);
```

</section>
<section>
<title>Use MongoDB Views to Transform Documents and Filter Collections for Atlas Vector Search</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/transform-documents-collections/</url>
<description>Use Atlas Vector Search to transform documents and collections.</description>


# Atlas Vector Search on Views (Preview)

Requirements  
- MongoDB 8.0+.  
- Create/modify View: `mongosh` or Compass.  
- Create Vector index: Atlas UI or Administration API (driver support at GA).  
- Query **source collection**, not the View.  
- Privileges: `createCollection` to create View; User Admin + `collMod` to edit.

Supported in View definition  
`$expr` allowed only in `$addFields`, `$set`, `$match`.  
Unsupported: dynamic operators (`$$USER_ROLES`, `$rand`).  
Index name must be unique across source collection & its Views.  
Query returns original source documents.

## Example

Create View (filter docs having `plot_embedding`):

```javascript
use sample_mflix
db.createView(
  "moviesWithEmbeddings",
  "embedded_movies",
  [{
    $match: { $expr: { $ne: [ { $type: "$plot_embedding" }, "missing" ] } }
  }]
)
```

Create Vector index (`embeddingsIndex`) on `sample_mflix.moviesWithEmbeddings`:

```json
{
  "fields": [{
    "type": "vector",
    "path": "plot_embedding",
    "numDimensions": 1536,
    "similarity": "cosine"
  }]
}
```

Query from `embedded_movies`:

```python
# Python
pipeline = [
  {"$vectorSearch": {
    "index": "embeddingsIndex",
    "path": "plot_embedding",
    "queryVector": [-0.0016261312, -0.028070757, ...],
    "numCandidates": 100,
    "limit": 10}},
  {"$project": {"_id": 0, "title": 1, "plot": 1}}
]
docs = list(client.sample_mflix.embedded_movies.aggregate(pipeline))
```

```javascript
// Node.js
const pipeline = [
  {$vectorSearch: {
    index: 'embeddingsIndex',
    path: 'plot_embedding',
    queryVector: [-0.0016261312, -0.028070757, ...],
    numCandidates: 100,
    limit: 10}},
  {$project: {_id: 0, title: 1, plot: 1}}
];
const docs = await client.db('sample_mflix')
  .collection('embedded_movies')
  .aggregate(pipeline).toArray();
```

## Troubleshoot Index Status

FAILED  
- View incompatible with Vector Search.  
- View edited to incompatible version.  
- Source collection changed/removed (incl. ancestor of descendant Views).

STALE / build stuck  
- View pipeline errors on any doc.  
  • If index READY → becomes STALE, resumes after fix.  
  • If BUILDING → build paused until fix.

## Index Lifecycle on Views

1. `mongot` applies View definition, then builds Vector index on transformed docs.  
2. Change streams replicated with same transformation.  
3. Queries return matching IDs → `mongod` fetches full source docs.

</section>
<section>
<title>Vector Quantization</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/vector-quantization/</url>
<description>Use the Atlas Vector Search to ingest quantized vectors or automatically quantize vectors.</description>


# Vector Quantization

Atlas Vector Search can:

* Automatically quantize float (32/64-bit) vectors to  
  • `scalar` → `int8` (4× RAM ↓)  
  • `binary` → `int1` (24× RAM ↓; graph structure uncompressed)  
* Index pre-quantized BSON `binData` vectors (`float32`, `int8`, `int1`).

Binary quantization assumes dimension midpoint 0, compares bit vectors, then rescoring uses stored float vectors. Scalar maps per-dimension min-max to 256 bins.

## Compatibility Matrix (abbr.)

| Mode | Data type in doc | dims | similarity |
|------|-----------------|------|------------|
| ingest `int1` | `binData(int1)` | mult of 8 | euclidean |
| ingest `int8` | `binData(int8)` | 1-8192 | cosine | euclidean | dotProduct |
| auto scalar | float array / `binData(float32)` | 1-8192 | same as `int8` |
| auto binary | float array / `binData(float32)` | mult of 8 | same as `int8` |
All modes support ANN & ENN search.

## Enable Automatic Quantization

```jsonc
{
  "name": "vec_idx",
  "type": "vectorSearch",
  "definition": {
    "fields": [
      { "type": "vector",
        "path": "embedding",
        "numDimensions": 1024,
        "similarity": "dotProduct",
        "quantization": "binary"   // or "scalar"
      }
    ]
  }
}
```
Updating `quantization` triggers full index rebuild. Non-float arrays are ignored during indexing.

## Ingest Pre-Quantized BSON Vectors

1. Convert model output to BSON:  
   • Python  
   ```python
   from bson.binary import Binary, BinaryVectorDtype as D

   vec_f32 = Binary.from_vector(f32, D.FLOAT32)
   vec_i8  = Binary.from_vector(i8,  D.INT8)
   vec_i1  = Binary.from_vector(i1,  D.PACKED_BIT)
   doc = {"embedding_f32": vec_f32,
          "embedding_int8": vec_i8,
          "embedding_int1": vec_i1}
   coll.insert_one(doc)
   ```
   • Node.js  
   ```js
   const { Binary } = require('mongodb').BSON;
   const f32 = Binary.fromFloat32Array(new Float32Array(arrF32));
   const i8  = Binary.fromInt8Array (new Int8Array(arrI8));
   const i1  = Binary.fromPackedBits(new Uint8Array(bits));
   ```

2. Create index (example mixes types):
   ```jsonc
   {
     "name":"vec_idx",
     "type":"vectorSearch",
     "definition":{
       "fields":[
         {"type":"vector","path":"embedding_int8","numDimensions":1024,"similarity":"dotProduct"},
         {"type":"vector","path":"embedding_int1","numDimensions":1024,"similarity":"euclidean"}
       ]
     }
   }
   ```

3. Query (Python):
   ```python
   qvec = Binary.from_vector(q_i8, D.INT8)
   pipeline = [
     {"$vectorSearch":{
        "index":"vec_idx",
        "path":"embedding_int8",
        "queryVector":qvec,
        "numCandidates":200,
        "limit":10}},
     {"$project":{"_id":0,"score":{"$meta":"vectorSearchScore"}}}]
   list(coll.aggregate(pipeline))
   ```

## Best Practices

* Prefer `binary` + rescoring for high-dim (>384) QAT models; use `scalar` for low-dim non-QAT models.
* Quantization is most beneficial when storing > ~10 M vectors.
* For `int1` or auto-binary, dimensions must be multiple of 8.

## Accuracy Evaluation

Compare ANN results with `$vectorSearch` `{exact: true}` or rescoring step versus binary/scalar index to measure recall.

</section>
<section>
<title>Retrieval-Augmented Generation (RAG) with Atlas Vector Search</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/rag/</url>
<description>Use MongoDB Atlas Vector Search to implement retrieval-augmented-generation (RAG) in your generative AI applications.</description>


# RAG with Atlas Vector Search – Quick Guide

## Workflow
1 Ingest → 2 Retrieve → 3 Generate.

### 1 Ingest  
Common steps  
• Load data (PDF, HTML, etc.)  
• Chunk (e.g., 400 chars, 20 overlap)  
• Embed text → float[] (same dimension used later)  
• Insert `{text, embedding}` into `rag_db.test`.

### 2 Retrieve  
• Create vector index on `embedding`.  
```jsonc
// one-time
{
  name: "vector_index",
  type: "vectorSearch",
  definition: {fields:[{type:"vector",path:"embedding",numDimensions:768,similarity:"cosine"}]}
}
```  
• Query  
```javascript
[
  {$vectorSearch:{
      index:"vector_index",
      path:"embedding",
      queryVector:<vector>,
      exact:true,
      limit:5
  }},
  {$project:{_id:0,text:1,score:{$meta:"vectorSearchScore"}}}
]
```

### 3 Generate  
• Prompt LLM with user question + retrieved docs.  
Example template:  
```
Answer based on context.  
Context: {{docs}}  
Question: {{q}}
```

--------------------------------------------------------------------
## Python (>=3.10)

### Env
```bash
pip install pymongo sentence_transformers langchain langchain_community huggingface_hub pypdf
export ATLAS_CONNECTION_STRING="mongodb+srv://<user>:<pwd>@<cluster>.mongodb.net"
export HF_TOKEN="<huggingface token>"
```

### Ingest
```python
from sentence_transformers import SentenceTransformer
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from pymongo import MongoClient

embedder = SentenceTransformer("nomic-ai/nomic-embed-text-v1",trust_remote_code=True)
def embed(t:str): return embedder.encode(t).tolist()

docs = RecursiveCharacterTextSplitter(
          chunk_size=400,chunk_overlap=20
       ).split_documents(PyPDFLoader(url).load())
records=[{"text":d.page_content,"embedding":embed(d.page_content)} for d in docs]

MongoClient(ATLAS_CONNECTION_STRING)["rag_db"]["test"].insert_many(records)
```

### Create Index (once)
```python
from pymongo.operations import SearchIndexModel
coll = MongoClient(ATLAS_CONNECTION_STRING)["rag_db"]["test"]
coll.create_search_index(SearchIndexModel(
    name="vector_index",type="vectorSearch",
    definition={"fields":[{"type":"vector","path":"embedding","numDimensions":768,"similarity":"cosine"}]}))
```

### Retrieve
```python
def search(q):
    qv=embed(q)
    return list(coll.aggregate([
        {"$vectorSearch":{"index":"vector_index","path":"embedding","queryVector":qv,"exact":True,"limit":5}},
        {"$project":{"_id":0,"text":1}}
    ]))
```

### Generate
```python
from huggingface_hub import InferenceClient,login; login(token=HF_TOKEN)
llm=InferenceClient("mistralai/Mistral-7B-Instruct-v0.3",token=HF_TOKEN)

def answer(question):
    ctx=" ".join(d["text"] for d in search(question))
    prompt=f"Answer tersely.\nContext: {ctx}\nQuestion: {question}"
    return llm.chat_completion(messages=[{"role":"user","content":prompt}],max_tokens=150).choices[0].message.content
print(answer("What are MongoDB's latest AI announcements?"))
```

--------------------------------------------------------------------
## Node.js (>=20)

### Env & Deps
```bash
npm i mongodb langchain @langchain/community @xenova/transformers @huggingface/inference pdf-parse
export ATLAS_CONNECTION_STRING="mongodb+srv://<user>:<pwd>@<cluster>.mongodb.net"
export HUGGING_FACE_ACCESS_TOKEN="<token>"
```

### helpers/getEmbedding.js
```javascript
import { pipeline } from "@xenova/transformers";
export async function embed(t){
  const e=await pipeline("feature-extraction","Xenova/nomic-embed-text-v1");
  return Array.from((await e(t,{pooling:"mean",normalize:true})).data);
}
```

### Ingest
```javascript
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MongoClient } from "mongodb";
import { embed } from "./helpers/getEmbedding.js";

const loader=new PDFLoader("https://investors.mongodb.com/node/12236/pdf");
const docs=await new RecursiveCharacterTextSplitter({chunkSize:400,chunkOverlap:20})
                    .splitDocuments(await loader.load());

const client=new MongoClient(process.env.ATLAS_CONNECTION_STRING);
await client.connect();
const coll=client.db("rag_db").collection("test");
await coll.insertMany(await Promise.all(docs.map(async d=>({
    text:d.pageContent,
    embedding:await embed(d.pageContent)
}))));
```

### Create Index (once)
```javascript
await coll.createSearchIndex({
  name:"vector_index",type:"vectorSearch",
  definition:{fields:[{type:"vector",path:"embedding",numDimensions:768,similarity:"cosine"}]}
});
```

### Retrieve
```javascript
import { embed } from "./helpers/getEmbedding.js";
export async function fetchDocs(q){
  const vec=await embed(q);
  return coll.aggregate([
     {$vectorSearch:{index:"vector_index",path:"embedding",queryVector:vec,exact:true,limit:5}},
     {$project:{_id:0,text:1}}
  ]).toArray();
}
```

### Generate
```javascript
import { HfInference } from "@huggingface/inference";
const hf=new HfInference(process.env.HUGGING_FACE_ACCESS_TOKEN);

export async function answer(q){
  const ctx=(await fetchDocs(q)).map(d=>d.text).join(" ");
  const prompt=`Answer briefly.\nContext:${ctx}\nQuestion:${q}`;
  const out=await hf.chatCompletion({
     model:"mistralai/Mistral-7B-Instruct-v0.3",
     messages:[{role:"user",content:prompt}],max_tokens:150});
  console.log(out.choices[0].message.content);
}
answer("What are MongoDB's latest AI announcements?");
```

--------------------------------------------------------------------
### Key Requirements
• Cluster: MongoDB ≥ 6.0.11.  
• Env vars: `ATLAS_CONNECTION_STRING`, `HF_TOKEN`/`HUGGING_FACE_ACCESS_TOKEN`.  
• Embedding model dim must match `numDimensions` in index.  
• Use `exact:true` for deterministic KNN; omit for ANN.

</section>
<section>
<title>Review Deployment Options</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/deployment-options/</url>
<description>Explore deployment options for Atlas Vector Search, including cluster types, cloud providers, and node architecture for testing and production environments.</description>


# Atlas Vector Search – Deployment & Sizing Cheatsheet

## Deployment Matrix

| Use-case | Cluster | Search | Node Arch | Cloud/Region |
| -------- | ------- | ------ |-----------|--------------|
| Test queries | Flex/shared (`M0+`) or local | Built-in | `mongod`+`mongot` same node | Any |
| Prototype app | Dedicated (`M10/M20+`) | Built-in | Same node | Any |
| Production | Dedicated (`M10+`) + Search Nodes (`S30+`) | Separate | `mongod` ↔ `mongot` on separate nodes | GCP all regions, subset of AWS/Azure |

## Memory & Storage Rules

1. Entire vector index must fit in Search-node RAM (≈90 % usable on dedicated nodes).  
2. Per-vector in-RAM size (incl. HNSW metadata):  
   • OpenAI ada-002 1536 dims → ~6 KB  
   • Google gecko 768 dims → ~3 KB  
   • Cohere v3 1024 dims → int8 ~1.07 KB, int1 ~0.167 KB  
   (size ∝ #vectors × dims).

### Quantization Savings

• Disk ↓66 % (`binData`)  
• RAM ↓3.75× (scalar) or 24× (binary).  
When `quantization: "binary"` is enabled, keep full-precision copy on disk for rescoring.

Disk estimate (binary, rescoring):

```
index_size_on_disk ≈ original_size * 25/24
```

Example index definition:

```json
{
  "fields": [{
    "type": "vector",
    "path": "my-embeddings",
    "numDimensions": 1536,
    "similarity": "euclidean",
    "quantization": "binary"
  }]
}
```

Allocate free disk ≥125 % of estimated index.

## Cluster RAM for Built-in Search (same node)

| Tier | Total RAM | RAM for Vector Index |
|------|-----------|----------------------|
| M10  | 2 GB | 1 GB |
| M20  | 4 GB | 2 GB |
| M30  | 8 GB | 4 GB |
M10–M30: 75 % of RAM usable; M40+ only 50 %. Expect contention between `mongod` and `mongot`.

## Dedicated Search Nodes (Workload Isolation)

• Pick search tier (Sxx) independent of cluster tier.  
• Ensure RAM ≥ index_size × 1.1.  
• More CPU ⇒ lower latency (e.g., prefer S20 High-CPU over S30 Low-CPU for equal RAM).  
• Atlas builds indexes on Search Nodes before routing queries there.

Benefits: isolate workloads, scale search independently, automatic intra-query parallelism.

## Migration Steps to Search Nodes

1. Upgrade cluster to ≥M10.  
2. Move to region supporting Search Nodes (all GCP, selected AWS/Azure).  
3. Enable & configure Search Nodes (`Add Search Nodes`). Deleting all Search Nodes interrupts search.

## Security

Customer-managed Encryption-at-Rest supported on Search Nodes (AWS KMS).

</section>
<section>
<title>Atlas Vector Search Tutorials</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/tutorials/</url>
<description>Follow step-by-step Atlas Vector Search tutorials to configure a vector search index, perform semantic search against indexed data, and implement RAG locally.</description>


# Atlas Vector Search Tutorials

Prerequisites  
- Atlas cluster MongoDB v6.0.11 or ≥ 7.0.2  
- Project role: Project Data Access Admin  
- Sample data loaded  
- `mongosh` or any driver using `$vectorSearch`  
- (Optional) local Atlas deployment via CLI  

Tutorials  
1. Semantic ANN search on `sample_mflix.embedded_movies`  
2. Hybrid semantic + full-text search (reciprocal rank fusion)  
3. Local RAG: create embeddings & retrieval-augmented generation without external APIs

</section>
<section>
<title>How to Perform Semantic Search Against Data in Your Atlas Cluster</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/tutorials/vector-search-tutorial/</url>
<description>Learn how to search vector embeddings in your data on the Atlas cluster.</description>


# Atlas Vector Search: Quick Guide

## Context
Collection: `sample_mflix.embedded_movies`  
Vector field: `plot_embedding` (1536-dim, `text-embedding-ada-002`)  
Filter fields: `genres` (string), `year` (int)  
Index name: `vector_index` (type: `vectorSearch`)  
Similarity: `dotProduct` & `scalar` quantization  
Privileges: Project **Data Access Admin**+

---

## 1 – Create the Vector Index

```jsonc
// index definition (shared by all clients)
{
  "fields": [
    { "type": "vector", "path": "plot_embedding",
      "numDimensions": 1536, "similarity": "dotProduct",
      "quantization": "scalar"
    },
    { "type": "filter", "path": "genres" },
    { "type": "filter", "path": "year"   }
  ]
}
```

### Node.js
```js
// npm i mongodb
const { MongoClient } = require('mongodb');
const client = new MongoClient('<connection>');
await client.connect();
const coll = client.db('sample_mflix').collection('embedded_movies');

await coll.createSearchIndex({
  name: 'vector_index',
  type: 'vectorSearch',
  definition: { fields: /* paste JSON above */ [] }
});
```

### Python
```python
# pip install pymongo
from pymongo.mongo_client import MongoClient
from pymongo.operations import SearchIndexModel
client = MongoClient("<connection>")
coll   = client.sample_mflix.embedded_movies

model = SearchIndexModel(
  name="vector_index", type="vectorSearch",
  definition={ "fields": [...] }        # paste JSON above
)
coll.create_search_index(model)
```

---

## 2 – Query with `$vectorSearch`

Common options  
`numCandidates`: 200 `limit`: 10 `index`: `"vector_index"`

### 2.1 AND filter
```js
// queryVector = embeddings('historical heist')
{
  $vectorSearch: {
    index: "vector_index",
    path: "plot_embedding",
    queryVector: [...],
    numCandidates: 200,
    limit: 10,
    filter: {
      $and: [
        { genres: { $nin: ["Drama","Western","Crime"],
                    $in : ["Action","Adventure","Family"] } },
        { year: { $gte: 1960, $lte: 2000 } }
      ]
    }
  }
},
{ $project: { _id:0, title:1, genres:1, plot:1, year:1,
              score:{ $meta:"vectorSearchScore" } } }
```

### 2.2 OR / AND combined filter
```js
// queryVector = embeddings('martial arts')
{
  $vectorSearch: {
    index: "vector_index",
    path: "plot_embedding",
    queryVector: [...],
    numCandidates: 200,
    limit: 10,
    filter: {
      $or: [
        { genres: { $ne: "Crime" } },
        { $and: [ { year: { $lte: 2015 } },
                  { genres: { $eq: "Action" } } ] }
      ]
    }
  }
},
{ $project: { _id:0, title:1, genres:1, plot:1, year:1,
              score:{ $meta:"vectorSearchScore" } } }
```

### Node.js execution
```js
const pipeline = [ /* one of the pipelines above */ ];
const cursor = coll.aggregate(pipeline);
for await (const doc of cursor) console.log(doc);
```

### Python execution
```python
pipeline = [ ... ]        # choose AND or OR example
for doc in coll.aggregate(pipeline):
    print(doc)
```

---

## Error Notes
• Missing/incorrect `numDimensions`, `similarity`, or `path` ⇒ index build fails.  
• Querying before `queryable:true` ⇒ empty results. Poll `listSearchIndexes` if needed.

</section>
<section>
<title>Perform Hybrid Search with Atlas Vector Search and Atlas Search</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/tutorials/reciprocal-rank-fusion/</url>
<description>Learn how to search vector embeddings in your data on the Atlas cluster.</description>


# Hybrid Search with Atlas Vector & Atlas Search

## Overview
Hybrid search = `$vectorSearch` (semantic) + `$search` (full-text) combined with Reciprocal Rank Fusion (RRF).

RRF per doc  
```
score = Σ(weight_i / (rank_i + 60))
```  
Lower `weight` ⇒ higher influence.

Requires Atlas cluster 6.0.11/7.0.2+, `Project Data Access Admin`.

---

## Index Definitions

```jsonc
// Vector index "rrf-vector-search"
{
  "name": "rrf-vector-search",
  "type": "vectorSearch",
  "definition": {
    "fields": [{
      "type": "vector",
      "path": "plot_embedding",
      "numDimensions": 1536,
      "similarity": "dotProduct"
    }]
  }
}

// Full-text index "rrf-full-text-search"
{
  "name": "rrf-full-text-search",
  "type": "search",
  "definition": {
    "mappings": {
      "dynamic": false,
      "fields": { "title": [{ "type": "string" }] }
    }
  }
}
```

### Node.js (index creation)
```js
import { MongoClient } from 'mongodb';
const uri = process.env.ATLAS_CONNECTION_STRING;
const client = new MongoClient(uri);

const create = async (idx) => {
  const col = client.db('sample_mflix').collection('embedded_movies');
  console.log(await col.createSearchIndex(idx));
};
await create(vectorIndex); await create(textIndex);
```

### Python (index creation)
```python
from pymongo import MongoClient
client = MongoClient(os.getenv("ATLAS_CONNECTION_STRING"))
col = client.sample_mflix.embedded_movies
col.create_search_index(vector_index)  # idem text_index
```

---

## Hybrid Query Pipeline (Star Wars example)

Variables  
```js
const vectorWeight = 0.1;   // higher impact
const textWeight   = 0.9;
const rankConst    = 60;
```

```javascript
[
 // 1. Semantic search
 { $vectorSearch: {
     index: "rrf-vector-search",
     path: "plot_embedding",
     queryVector: [...],        // star wars embedding
     numCandidates: 100, limit: 20
 }},
 { $group: { _id: null, docs: { $push: "$$ROOT" } }},
 { $unwind: { path: "$docs", includeArrayIndex: "rank" }},
 { $addFields: {
     vs_score: { $multiply: [
       vectorWeight,
       { $divide:[1, { $add:["$rank", rankConst] }] }
     ]}
 }},
 { $project: { _id:"$docs._id", title:"$docs.title", vs_score:1 }},

 // 2. Full-text search via $unionWith
 { $unionWith: {
   coll: "embedded_movies", pipeline: [
     { $search: {
         index: "rrf-full-text-search",
         phrase:{ query:"star wars", path:"title" } } },
     { $limit:20 },
     { $group:{ _id:null, docs:{ $push:"$$ROOT" }}},
     { $unwind:{ path:"$docs", includeArrayIndex:"rank" }},
     { $addFields:{ fts_score:{ $multiply:[
       textWeight,
       { $divide:[1,{ $add:["$rank", rankConst] }]}
     ]}}},
     { $project:{ _id:"$docs._id", title:"$docs.title", fts_score:1 }}
   ]}
 },

 // 3. Merge + rank
 { $group:{
     _id:"$_id",
     title:{ $first:"$title" },
     vs_score:{ $max:"$vs_score" },
     fts_score:{ $max:"$fts_score" }
 }},
 { $project:{
     title:1,
     score:{ $add:[
       { $ifNull:["$vs_score",0] },
       { $ifNull:["$fts_score",0] }
     ]}
 }},
 { $sort:{ score:-1 }}, { $limit:10 }
]
```

### Node.js run
```js
const res = col.aggregate(pipeline);
for await (const doc of res) console.log(doc);
```

### Python run
```python
for doc in col.aggregate(pipeline):
    print(doc)
```

---

## Key Points
• Build separate vector & text indexes.  
• Use `$vectorSearch` + `$search` in same pipeline via `$unionWith`.  
• Compute weighted reciprocal rank (`1/(rank+60)`).  
• Combine with `$group`, sum scores, `$sort`.  
• Adjust `vectorWeight` / `textWeight` per query to tune relevance.

</section>
<section>
<title>Build a Local RAG Implementation with Atlas Vector Search</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/tutorials/local-rag/</url>
<description>How to implement retrieval-augmented generation (RAG) for Atlas Vector Search using local embedding models and chat models.</description>


# Build a Local RAG Implementation with Atlas Vector Search

## Overview
1. Deploy MongoDB 6.0.11+ with `sample_airbnb.listingsAndReviews`.
2. Generate embeddings locally (`mxbai-embed-large-v1` or `nomic-embed-text`).
3. Store embeddings in `embeddings` field.
4. Create `vector_index` (type `vectorSearch`) on `embeddings`.
5. Run vector query, pass results to local LLM (`mistral-7b`) for answer.

---

## Prerequisites
Common  
• Atlas CLI ≥ 1.14.3  
• MongoDB Database Tools (`mongorestore`)  
• Local Ollama or GPT4All install  
• Sample data archive: `curl https://atlas-education.s3.amazonaws.com/sampledata.archive -o sampledata.archive`

Python specific  
• Python ≥ 3.10, `pip install pymongo sentence_transformers gpt4all`  

Node.js specific  
• Node ≥ 18, `npm i mongodb @xenova/transformers gpt4all`  
• Git-LFS, Hugging Face token (for `mxbai-embed-large-v1`)

---

## Create Deployment & Load Data
```bash
atlas deployments setup       # local
mongorestore --archive=sampledata.archive --port <port>
# or create cloud cluster and "Load Sample Data" from UI
```

---

## Environment Setup
Python  
```python
MONGODB_URI="mongodb://localhost:<port>/?directConnection=true"
from pymongo import MongoClient; client=MongoClient(MONGODB_URI)
collection=client["sample_airbnb"]["listingsAndReviews"]
```

Node.js (`.env`)  
```env
ATLAS_CONNECTION_STRING=mongodb://localhost:<port>/?directConnection=true
```

---

## Download Models
```bash
# embeddings
ollama pull nomic-embed-text                     # optional C use
git clone https://<user>:<token>@hf.co/mixedbread-ai/mxbai-embed-large-v1
# LLM
ollama pull mistral                              # Python, Node use GPT4All alt
```

---

## Generate Embeddings

### Python
```python
from sentence_transformers import SentenceTransformer
model = SentenceTransformer('mixedbread-ai/mxbai-embed-large-v1')
def embed(txt): return model.encode(txt).tolist()

flt={"$and":[{"summary":{"$exists":1,"$nin":[None,""]}},
             {"embeddings":{"$exists":0}}]}
for d in collection.find(flt).limit(50):
    collection.update_one({"_id":d["_id"]},
                          {"$set":{"embeddings":embed(d["summary"])}})
```

### Node.js
```js
// get-embeddings.js
import {env,pipeline} from '@xenova/transformers';
env.localModelPath='/path/to/mxbai-embed-large-v1'; env.allowRemoteModels=false;
export async function embed(t){
  const e=await pipeline('feature-extraction','mxbai-embed-large-v1');
  return Array.from((await e(t,{pooling:'mean',normalize:true})).data);
}
```
```js
// generate-embeddings.js
import {MongoClient} from 'mongodb'; import {embed} from './get-embeddings.js';
const cli=new MongoClient(process.env.ATLAS_CONNECTION_STRING);
const coll=cli.db('sample_airbnb').collection('listingsAndReviews');
const flt={$and:[{summary:{$exists:1,$nin:[null,""]}},{embeddings:{$exists:0}}]};
for await(const d of coll.find(flt).limit(50)){
  await coll.updateOne({_id:d._id},{$set:{embeddings:await embed(d.summary)}});
}
```

---

## Create Vector Index

### Python
```python
from pymongo.operations import SearchIndexModel
idx = SearchIndexModel(
  name="vector_index", type="vectorSearch",
  definition={"fields":[{"type":"vector","path":"embeddings",
                         "numDimensions":1024,"similarity":"cosine"}]})
collection.create_search_index(model=idx)
```

### Node.js
```js
import {MongoClient} from 'mongodb';
const coll=new MongoClient(process.env.ATLAS_CONNECTION_STRING)
          .db('sample_airbnb').collection('listingsAndReviews');
await coll.createSearchIndex({
  name:"vector_index",type:"vectorSearch",
  definition:{fields:[{type:"vector",path:"embeddings",
                       numDimensions:1024,similarity:"cosine"}]}
});
```

---

## Vector Query Helper
Python  
```python
def search(q):
  qv=embed(q)
  pipe=[{"$vectorSearch":{"index":"vector_index","path":"embeddings",
                          "queryVector":qv,"exact":True,"limit":5}},
        {"$project":{"_id":0,"summary":1,"listing_url":1,
                     "score":{"$meta":"vectorSearchScore"}}}]
  return list(collection.aggregate(pipe))
```

Node.js  
```js
export async function getDocs(q){
  const vec=await embed(q);
  const pipe=[{$vectorSearch:{index:"vector_index",path:"embeddings",
    queryVector:vec,exact:true,limit:5}},
    {$project:{_id:0,summary:1,listing_url:1,
               score:{$meta:"vectorSearchScore"}}}];
  return coll.aggregate(pipe).toArray();
}
```

---

## Local LLM Q&A

### Python (GPT4All)
```python
from gpt4all import GPT4All
llm=GPT4All('./mistral-7b-openorca.gguf2.Q4_0.gguf')
q="Can you recommend beach house AirBnBs? Include links."
ctx=search("beach house")
context="\n".join(f"Summary:{d['summary']} Link:{d['listing_url']}" for d in ctx)
prompt=f"Use context to answer.\nContext:\n{context}\nQuestion:{q}"
print(llm.generate(prompt))
```

### Node.js (GPT4All JS)
```js
import {loadModel,createCompletionStream} from 'gpt4all';
import {getDocs} from './retrieve-documents.js';
const docs=await getDocs("beach house");
const ctx=docs.map(d=>`Summary:${d.summary} Link:${d.listing_url}`).join('\n');
const model=await loadModel("mistral-7b-openorca.gguf2.Q4_0.gguf",
            {allowDownload:false,modelConfigFile:"./models3.json"});
const prompt=`Use context to answer.\nContext:\n${ctx}\nQuestion:
Can you recommend beach house AirBnBs? Include links.`;
for await(const t of createCompletionStream(model,prompt).tokens) process.stdout.write(t);
model.dispose();
```

---

## CLI Index Creation (optional)
```jsonc
// vector-index.json
{
 "database":"sample_airbnb","collectionName":"listingsAndReviews",
 "type":"vectorSearch","name":"vector_index",
 "fields":[{"type":"vector","path":"embeddings",
            "numDimensions":1024,"similarity":"cosine"}]
}
```
```bash
atlas deployments search indexes create --file vector-index.json
```

---

### Notes
• Limit docs when embedding to speed up testing (`.limit(50)`).  
• Adjust `numDimensions` to model size (`nomic-embed-text`→768, `mxbai`→1024).  
• Ensure `embeddings` exists before index build.

</section>
<section>
<title>How to Measure the Accuracy of Your Query Results</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/evaluate-results/</url>

# Measure Vector Search Accuracy

Evaluate ANN results vs. ENN ground-truth on the **same query**.

## When to Measure
- Quantized vectors  
- Large or low-dimensional datasets  

## Workflow
1. Create Vector Search index (enable `quantization` if desired).  
2. Run ENN query (`exact:true`).  
3. Run ANN query (`numCandidates` > `limit`).  
4. Compare result sets (e.g., Jaccard similarity). Tune `numCandidates` for accuracy/speed trade-off.

## Index Definition (`sample_mflix.embedded_movies`)
```json
{
  "fields": [
    { "path":"plot_embedding", "type":"vector",
      "numDimensions":1536, "similarity":"euclidean",
      "quantization":"binary" },
    { "path":"genres", "type":"filter" }
  ]
}
```

## Queries (aggregation)

### ENN
```js
db.embedded_movies.aggregate([
  { $vectorSearch: {
      index:"vector_index",
      path:"plot_embedding",
      filter:{ $and:[
        { genres:{ $eq:"Action" } },
        { genres:{ $ne:"Western" } }
      ]},
      queryVector:[/* 1536-D values */],
      exact:true,
      limit:10
  }},
  { $project:{ _id:0, title:1, genres:1, plot:1,
               score:{ $meta:"vectorSearchScore"} } }
])
```

### ANN
```js
db.embedded_movies.aggregate([
  { $vectorSearch: {
      index:"vector_index",
      path:"plot_embedding",
      filter:{ $and:[
        { genres:{ $eq:"Action" } },
        { genres:{ $ne:"Western" } }
      ]},
      queryVector:[/* 1536-D values */],
      numCandidates:100,
      limit:10
  }},
  { $project:{ _id:0, title:1, genres:1, plot:1,
               score:{ $meta:"vectorSearchScore"} } }
])
```

## Driver Examples

### Python
```python
from pymongo import MongoClient
pipeline=[{
  "$vectorSearch":{
    "index":"vector_index",
    "path":"plot_embedding",
    "filter":{"$and":[{"genres":{"$eq":"Action"}},
                      {"genres":{"$ne":"Western"}}]},
    "queryVector":vector,
    "exact":True,   # drop for ANN, add numCandidates
    "limit":10
  }},{
  "$project":{"_id":0,"title":1,"genres":1,
              "plot":1,"score":{"$meta":"vectorSearchScore"}}
}]
docs=list(client.sample_mflix.embedded_movies.aggregate(pipeline))
```

### Node.js
```js
const pipeline = [
  { $vectorSearch: {
      index: 'vector_index',
      path: 'plot_embedding',
      filter: { $and:[
        { genres: { $eq:'Action' } },
        { genres: { $ne:'Western' } }
      ]},
      queryVector: vector,
      exact: true,          // remove & add numCandidates for ANN
      limit: 10
  }},
  { $project: {
      _id:0, title:1, genres:1, plot:1,
      score:{ $meta:'vectorSearchScore' }
  }}
];
const docs = await db.collection('embedded_movies').aggregate(pipeline).toArray();
```

## Interpreting Results
- ENN checks all documents; ANN samples `numCandidates`.  
- Higher `numCandidates` → closer recall, lower latency savings.  
- Quantify similarity with Jaccard index over ≥100 queries.  
- Adjust `numCandidates` until recall meets application needs.

</section>
<section>
<title>Improve Vector Search Performance</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/tune-vector-search/</url>
<description>Learn how to improve vector search performance.</description>


# Vector Search Performance Best Practices

- Dimensionality: ≤ 8192 allowed; use smallest dimension that meets accuracy goals.  
- Indexing: Don’t (re)index while querying. Re-index new embeddings in a separate index.  
- Pre-filter: Use `filter` in `$vectorSearch` to limit docs before ANN; critical for large/high-dim vectors.  
- Deployment: Run `mongot` on dedicated Search Nodes to avoid CPU/RAM contention and enable parallel segment search.  
- Projection: In `$project`, exclude embedding field and other unneeded fields to cut response size/latency.  
- Memory: Ensure RAM can hold vectors + HNSW index; separate Search Nodes aid memory efficiency.  
- Cache warm-up: First queries are slow; performance rises after vectors are read into FS cache. Repeat after large writes or index rebuild.  
- BinData vectors: Use BinData subtypes; 3× storage savings, supports `float`, `int8`, `int1`; lowers latency, especially with `limit > 20`.  
- Quantization:  
  • Scalar (e.g., float32→int8) preserves recall for most models.  
  • Binary (int1) suits QAT models, yields best speed.

</section>
<section>
<title>Build a Multi-Tenant Architecture for Atlas Vector Search</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/multi-tenant-architecture/</url>

# Multi-Tenant Atlas Vector Search

Recommendations  
• 1 collection/database/cluster for all tenants. Add `tenant_id` and use it as pre-filter in Vector Search indexes/queries to isolate results.  
• Avoid 1-collection-per-tenant (change-stream overhead, no extra isolation).

Handling size skew  
1. Few very large tenants:  
```js
// large tenant view
db.createView("tenantA","main",[{$match:{tenant_id:"A"}}])
// small tenant view
db.createView("smallTenants","main",[{$match:{tenant_id:{$nin:["A","B"]}}}])
```  
Create a Vector Search index on each view; index for small tenants must include `tenant_id` pre-filter.

2. Many large tenants ➜ shard on `tenant_id` (ranged sharding).

Migration (collection-per-tenant → single collection)  
```javascript
import { MongoClient } from 'mongodb';
const uri="mongodb+srv://..."; const src="srcDB", dst="dstDB", dstColl="allTenants"; const BATCH=1000;

async function migrate(){
  const client=new MongoClient(uri); await client.connect();
  const sdb=client.db(src), dcoll=client.db(dst).collection(dstColl);
  for (const {name} of await sdb.listCollections().toArray()){
    const cursor=sdb.collection(name).find(); let buf=[];
    for await (const doc of cursor){
      doc.tenant_id=name; buf.push(doc);
      if(buf.length>=BATCH){ await dcoll.insertMany(buf); buf=[]; }
    }
    if(buf.length) await dcoll.insertMany(buf);
  }
  await client.close();
}
migrate().catch(console.error);
```

</section>
<section>
<title>Troubleshooting</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/troubleshooting/</url>
<description>Learn how to address common issues with Atlas Vector Search queries and configuration</description>


# Troubleshooting

## `$vectorSearch` Stage Unavailable
Requires MongoDB ≥ 6.0.11 or ≥ 7.0.2. On lower versions you’ll get:  
```sh
OperationFailure: $vectorSearch is not allowed with the current configuration. You may need to enable the corresponding feature flag.
```  
Check version in Atlas → Clusters. Upgrade if older.

## Slow Queries
See “Improve Vector Search Performance”.

## `$vectorSearch` Returns No Results
• Use identical embedding model for data & query.  
• Wait until Vector Search index finishes initial sync.

## LangChain Filtering Error
```js
MongoServerError: PlanExecutor error during aggregation :: caused by :: Path 'field' needs to be indexed as token
```  
Create the filter field as an Atlas **Vector Search** index (not Atlas Search). Create one if absent.

## `Command not found` Creating Index
Occurs when:  
1. Cluster < 6.0.11/7.0.2 → upgrade.  
2. Cluster is M0 → use Atlas UI (programmatic creation unsupported).

## Unsupported Filter Types
Filtering allowed only on boolean, date, number, objectId, string, UUID fields.

</section>
</guide>