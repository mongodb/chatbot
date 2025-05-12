<guide>
<guide_topic>Atlas Search</guide_topic>

<section>
<title>Atlas Search Overview</title>
<url>https://mongodb.com/docs/atlas/atlas-search/</url>
<description>Learn about MongoDB Atlas Search.</description>


# Atlas Search Overview

Embedded full-text search in Atlas using aggregation stages.

- `$search`, `$searchMeta`: add query/collector ops inside normal pipelines.  
- Pagination: include `searchSequenceToken`; pass to `searchAfter` / `searchBefore`.  
- Use cases: autocomplete (`autocomplete` op), facets (`facet` collector).

Index  
- Map terms→docs; single, compound, or dynamic mappings.  
- Works on embedded/polymorphic docs; create specialized indexes for autocomplete/facets.

Analyzers  
- Tokenize, normalize, stem.  
- Built-in, custom, or multi-analyzer per field.

Scoring  
- Default TF/IDF-like score; boost/decay/customize per query.

Node.js example
```js
const res = await db.collection('col').aggregate([
  {$search:{
    index:'myIdx',
    autocomplete:{query:'har', path:'title'}
  }},
  {$limit:10}
]);
```

</section>
<section>
<title>Atlas Search Quick Start</title>
<url>https://mongodb.com/docs/atlas/atlas-search/tutorial/</url>
<description>Learn how to get started with Atlas Search by creating a search index, querying your collection, and processing your search results.</description>


# Atlas Search Quick Start

## 1. Create “default” Index  
JSON definition (dynamic mapping):

```json
{ "mappings": { "dynamic": true } }
```

### Mongo Shell
```shell
use sample_mflix
db.movies.createSearchIndex("default",{mappings:{dynamic:true}})
```

### Node.js
```javascript
const { MongoClient } = require("mongodb");
const uri = "<connection-string>";
(async () => {
  const client = new MongoClient(uri);
  await client.connect();
  const coll = client.db("sample_mflix").collection("movies");
  const res = await coll.createSearchIndex({
    name: "default",
    definition: { mappings: { dynamic: true } }
  });
  console.log(res); // default
  await client.close();
})();
```

## 2. Query Basics  
`$search` (or `$searchMeta`) MUST be first aggregation stage. If `index` omitted, Atlas uses the collection’s “default” index.

### 2.1 Simple Text Query  
Return 3 docs where `plot` contains “baseball”.

```javascript
const pipeline = [
  { $search: { text: { query: "baseball", path: "plot" } } },
  { $limit: 3 },
  { $project: { _id: 0, title: 1, plot: 1 } }
];
await coll.aggregate(pipeline).forEach(console.log);
```

### 2.2 Refined Query (compound)  
Add a negative filter on `genres`.

```javascript
const pipeline = [
  { $search: {
      compound: {
        must:    [{ text: { query: "baseball", path: "plot" } }],
        mustNot: [{ text: { query: ["Comedy","Romance"], path: "genres" } }]
      }
    }},
  { $limit: 3 },
  { $project: { _id: 0, title: 1, plot: 1, genres: 1 } }
];
```

### 2.3 Sorted Results  
Sort by `released` descending.

```javascript
const pipeline = [
  { $search: {
      compound: {
        must:    [{ text: { query: "baseball", path: "plot" } }],
        mustNot: [{ text: { query: ["Comedy","Romance"], path: "genres" } }]
      },
      sort: { released: -1 }
    }},
  { $limit: 3 },
  { $project: { _id: 0, title: 1, plot: 1, genres: 1, released: 1 } }
];
```

## 3. Extras (overview only)
- Autocomplete / partial matches: map field as `autocomplete`, use `autocomplete` operator.  
- Facets: define `facet` metadata in index, use `facet` collector.  
- Sorting allowed on indexed `boolean`, `date`, `number`, `objectId`, `string` fields.

</section>
<section>
<title>How to Run Autocomplete and Partial Match Atlas Search Queries</title>
<url>https://mongodb.com/docs/atlas/atlas-search/tutorial/partial-match/</url>
<description>In this tutorial, learn how to run a case-sensitive partial match query using the autocomplete, phrase, regex, or wildcard operator.</description>


# Atlas Search Partial Match (Node.js)

## Index Definitions (`sample_mflix.movies` → `plot`)

```jsonc
// AUTOCOMPLETE (edgeGram)
{
  "mappings":{ "dynamic":false,
    "fields":{ "plot":[{
      "type":"autocomplete","tokenization":"edgeGram",
      "minGrams":2,"maxGrams":15,"foldDiacritics":true
    }]}
  }
}

// PHRASE (standard analyzer)
{
  "mappings":{ "fields":{ "plot":{
    "type":"string","analyzer":"lucene.standard"
  }}}
}

// REGEX (case-sensitive)
{
  "mappings":{ "fields":{ "plot":{
    "type":"string","analyzer":"lucene.keyword"
  }}}
}

// WILDCARD (case-sensitive)
{
  "mappings":{ "fields":{ "plot":{
    "type":"string","analyzer":"lucene.keyword"
  }}}
}
```

## Node.js Aggregation Pipelines

Install: `npm i mongodb`

```js
const { MongoClient } = require("mongodb");
const uri = "<connection-string>";
const client = new MongoClient(uri);
(async () => {
  await client.connect();
  const coll = client.db("sample_mflix").collection("movies");

  // choose ONE of the agg arrays below, then:
  const cursor = coll.aggregate(agg); await cursor.forEach(console.log);
  await client.close();
})();
```

### Autocomplete

```js
const agg = [
  { $search: {
      index: "partial-match-tutorial",
      autocomplete: {
        path: "plot", query: "new purchase", tokenOrder: "any",
        fuzzy:{ maxEdits:2, prefixLength:1, maxExpansions:256 }
      },
      highlight:{ path:"plot" }
  }},
  { $limit: 5 },
  { $project:{ _id:0, title:1, plot:1, highlights:{ $meta:"searchHighlights" }}}
];
```

### Phrase

```js
const agg = [
  { $search: {
      index:"partial-match-tutorial",
      phrase:{ path:"plot", query:"new purpose", slop:5 },
      highlight:{ path:"plot" }
  }},
  { $limit:5 },
  { $project:{ _id:0, title:1, plot:1, highlights:{ $meta:"searchHighlights" }}}
];
```

### Regex

```js
const agg = [
  { $search: {
      index:"partial-match-tutorial",
      regex:{ path:"plot", query:"(.*)new(.*) pur(.*)" }
  }},
  { $limit:5 },
  { $project:{ _id:0, title:1, plot:1 }}
];
```

### Wildcard

```js
const agg = [
  { $search: {
      index:"partial-match-tutorial",
      wildcard:{ path:"plot", query:"*new* pur*" }
  }},
  { $limit:5 },
  { $project:{ _id:0, title:1, plot:1 }}
];
```

Notes:
- Regex/Wildcard require `lucene.keyword` analyzer for exact-term matching.
- If only one Search index exists, you may omit the `index` option or keep the default name `default`.


</section>
<section>
<title>How to Use Facets with Atlas Search</title>
<url>https://mongodb.com/docs/atlas/atlas-search/tutorial/facet-tutorial/</url>
<description>Learn how to create an index with a facet, run an Atlas search query for fields with facets, and group results by string values or by date and numeric range values.</description>


# Facets with Atlas Search

## Index Definition (`sample_mflix.movies`)
```json
{
  "mappings": {
    "dynamic": true,
    "fields": {
      "genres": { "type": "stringFacet" }
    }
  }
}
```
Name: `facet-tutorial`

## Facet Query Patterns
### `$searchMeta` (only metadata)
```js
[
  {
    $searchMeta: {
      index: "facet-tutorial",
      facet: {
        operator: {
          near: {
            path: "released",
            origin: ISODate("1921-11-01T00:00:00Z"),
            pivot: 7776000000            // ≈3 months in ms
          }
        },
        facets: {
          genresFacet: { type: "string", path: "genres" },
          yearFacet: {
            type: "number",
            path: "year",
            boundaries: [1910, 1920, 1930, 1940]
          }
        }
      }
    }
  }
]
```

### `$search` + `$$SEARCH_META` (docs + facets)
```js
[
  { $search: { ...same facet block as above... } },
  { $facet: { meta: [
      { $replaceWith: "$$SEARCH_META" }, { $limit: 1 }
  ]}},
  { $set: { meta: { $arrayElemAt: ["$meta", 0] } } }
]
```

## Expected Facet Output (truncated)
```json
{
  "meta": {
    "count": { "lowerBound": 20878 },
    "facet": {
      "genresFacet": {
        "buckets": [
          { "_id": "Drama", "count": 12149 },
          { "_id": "Comedy", "count": 6436 },
          ...
        ]
      },
      "yearFacet": {
        "buckets": [
          { "_id": 1910, "count": 14 },
          { "_id": 1920, "count": 47 },
          { "_id": 1930, "count": 238 }
        ]
      }
    }
  }
}
```

## Node.js Example
```js
// facet-query.js
const { MongoClient } = require("mongodb");
const uri = "<connection-string>";
const client = new MongoClient(uri);

async function run() {
  await client.connect();
  const coll = client.db("sample_mflix").collection("movies");

  const pipeline = [{
    $searchMeta: {
      index: "facet-tutorial",
      facet: {
        operator: {
          near: {
            path: "released",
            origin: new Date("1921-11-01T00:00:00Z"),
            pivot: 7776000000
          }
        },
        facets: {
          genresFacet: { type: "string", path: "genres" },
          yearFacet: { type: "number", path: "year", boundaries: [1910,1920,1930,1940] }
        }
      }
    }
  }];

  const cursor = coll.aggregate(pipeline);
  await cursor.forEach(doc => console.log(JSON.stringify(doc, null, 2)));
  await client.close();
}
run().catch(console.error);
```

## Notes
- Use MongoDB 5.0.4+ on Atlas.
- `$searchMeta` returns only facet/count metadata; combine `$search` with `$$SEARCH_META` when you also need documents.
- `stringFacet` field must be indexed statically; numeric/date facets can be dynamic.

</section>
<section>
<title>Queries and Indexes</title>
<url>https://mongodb.com/docs/atlas/atlas-search/searching/</url>
<description>Create an Atlas Search query to perform a full text search on indexed fields using the Mongo Shell (mongosh), a driver, or the Atlas user interface.</description>


# Atlas Search: Queries & Indexes

## Design Checklist
- Identify: doc search (`$search`) vs. metadata (`$searchMeta`).
- Index only needed fields; use `dynamic:true` to index all.
- Match types → operators: exact (`equals|in|text`), similar (`near|phrase|range|moreLikeThis`), partial (`autocomplete|regex|wildcard`), combine with `compound`.
- Add analyzers, custom analyzers, synonyms for language/normalization.
- Result handling: `score`, `sort`, `searchBefore/After`, `facet`, paging.
- Perf: `concurrent`, `returnStoredSource` + `storedSource`, `numPartitions`.

---

## Index Syntax (JSON)
```json
{
  "mappings": {
    "dynamic": <bool>,
    "fields": {
      "<field>": { "type": "<type>", "analyzer":"<an>" }
    }
  },
  "analyzer": "<indexAnalyzer>",
  "searchAnalyzer": "<queryAnalyzer>",
  "analyzers": [ { "name":"<cust>", "tokenizer":{ "type":"<tok>" } } ],
  "synonyms": [ { "name":"<syn>", "source":{ "collection":"<coll>" }, "analyzer":"<an>" } ],
  "numPartitions": <int>,
  "storedSource": true | false | { "include" | "exclude": ["<field>", ...] }
}
```

---

## Query Pipeline Skeleton
```jsonc
[
  {
    $search: {               // or $searchMeta
      "<operator|collector>": { /* spec */ },
      // optional:
      "count": { "type":"total|lowerBound", "threshold":<n> },
      "facet": { "facets": { /* defs */ } },
      "highlight": { "path":"<field>" },
      "scoreDetail": true,
      "tracking": { "enabled": true },
      "explain": true,
      "score": { /* boost, constant, function */ },
      "sort": [ { "<field>":"asc|desc" }, "score" ],
      "searchBefore": <token>,
      "searchAfter":  <token>,
      "returnStoredSource": true,
      "concurrent": <int>
    }
  },
  /* other stages */
]
```

### Common Operators → `path` must reference indexed fields
- text, phrase, range, equals, in, regex, wildcard, near, autocomplete, moreLikeThis.
- Combine via `compound` (`must`, `should`, `filter`, `mustNot`).

---

## Node.js Example
```js
const results = await db.collection('coll').aggregate([
  {
    $search: {
      text: { query: "atlas", path: "title" },
      highlight: { path: "title" },
      score: { boost: { value: 5 } },
      sort: [{ score: "desc" }]
    }
  },
  { $limit: 10 }
]).toArray();
```

---

Key Performance Notes:
- Docs ≥16 MB not indexed; restructure large docs/updates.
- `numPartitions` spreads index across search nodes.
- `concurrent` >1 speeds complex queries on dedicated search nodes.

</section>
<section>
<title>Manage Atlas Search Indexes</title>
<url>https://mongodb.com/docs/atlas/atlas-search/manage-indexes/</url>
<description>Learn how to create an manage an Atlas Search Index using the Atlas User Interface, Atlas Search API, or the Atlas CLI.</description>


# Manage Atlas Search Indexes

Atlas Search indexes map terms ⇒ documents for fast `$search`, `$searchMeta`, `$vectorSearch`.

## Consistency & Rebuild
* Indexes are eventually consistent; `mongot` tails change streams.  
* Atlas auto-rebuilds when definition changes, Encryption-At-Rest toggles, topology changes, or feature upgrades.  
* Sharding: expect brief downtime or failure until sync finishes.  
* `$out` on an indexed coll requires dropping & re-creating the index (prefer `$merge`).  
* Dedicated Search Nodes: add/reshard/movePrimary ⇒ rebuild; must delete & recreate after reshard/movePrimary.

## Roles
Project:  
• `Data Access Read Only` – view.  
• `Data Access Admin`, `Search Index Editor` – create/update/delete.  
DB: `read` list, `readWrite` create/update/drop.

---

## APIs & CLIs (cloud)

| Action | HTTP | Atlas CLI |
|-------|------|-----------|
|Create | `POST /groups/{groupId}/clusters/{clusterName}/search/indexes` | `atlas clusters search indexes create` |
|List   | `GET  .../search/indexes[/{db}/{coll}]` | `atlas clusters search indexes list` |
|Get 1  | `GET  .../search/indexes/{id}` | `atlas clusters search indexes describe {id}` |
|Update | `PATCH .../search/indexes/{id}` | `atlas clusters search indexes update {id}` |
|Delete | `DELETE .../search/indexes/{id}` | `atlas clusters search indexes delete {id}` |

Body (create/update):
```json
{
  "collectionName":"<coll>",
  "database":"<db>",
  "name":"<idx>",
  "type":"search",
  "definition":{
    "analyzer":"<lucene.analyzer>",
    "searchAnalyzer":"<lucene.analyzer>",
    "mappings":{"dynamic":true,"fields":{/* static fields */}},
    "storedSource":true|{"include":["a"],"exclude":["b"]},
    "synonyms":[{/* mapping */}],
    "numPartitions":<int>,
    "analyzers":[{/* custom */}]
  }
}
```

---

## MongoDB Shell

```js
// create
db.coll.createSearchIndex("idx",{mappings:{dynamic:true}})
// list ("" for all)
db.coll.getSearchIndexes("idx")
// update
db.coll.updateSearchIndex("idx",{mappings:{dynamic:false,fields:{title:{type:"string"}}}})
// delete
db.coll.dropSearchIndex("idx")
```

---

## Node.js Driver (≥ v5.5)

```js
import {MongoClient} from "mongodb";
const client=new MongoClient("<URI>");
const coll=client.db("<db>").collection("<coll>");

// Create one
await coll.createSearchIndex({
  name:"idx",
  definition:{mappings:{dynamic:true}}
});

// Create many
await coll.createSearchIndexes([
  {name:"idx1",definition:{mappings:{dynamic:true}}},
  {name:"idx2",definition:{mappings:{dynamic:false,fields:{title:{type:"string"}}}}}
]);

// List (omit arg for all)
const idxs=await coll.listSearchIndexes("idx").toArray();

// Update
await coll.updateSearchIndex("idx",{
  mappings:{dynamic:false,fields:{title:{type:"string"}}}
});

// Drop
await coll.dropSearchIndex("idx");
```

---

## Atlas UI (minimal)
Clusters → Atlas Search → Create/Edit/Delete via Visual or JSON editor. Default index name `default`; dynamic mapping on. Saving static mappings allows Drafts. Status column shows build state.

---

## Index Status Values
Pending | Atlas queued build  
Building | Build/rebuild running (old index still used)  
Ready | Fully queryable  
Stale | Replication lag, oplog falloff, size >2.1 B docs, etc.—results may be outdated  
Failed | Build failed  
Deleting | Removal in progress  
Does Not Exist | Collection removed

---

## Estimate Index Size
Build index on sampled subset, then:  
`estimated = (sampleIndexSize / sampleDataSize) * totalDataSize`

---

## Key Definition Fields (JSON editor equivalents)
* `analyzer`, `searchAnalyzer`
* `mappings.dynamic` (true/false)  
* `mappings.fields` (static specs)  
* `storedSource` include/exclude  
* `synonyms`  
* `numPartitions`  
* `analyzers` (custom)

---

## Troubleshooting
* Stale/Failed: check Status Details → node messages, disk >90%, oplog lag, >2 B docs.  
* Allocate 125 % index disk for feature-required updates.

</section>
<section>
<title>Index Reference</title>
<url>https://mongodb.com/docs/atlas/atlas-search/index-definitions/</url>
<description>Learn the JSON syntax to include one or more analyzers, field mappings, or synonyms in your Atlas Search index.</description>


# Atlas Search Index

```json
{
  "analyzer": "<idxAnalyzer>",         // default: "standard"
  "searchAnalyzer": "<qryAnalyzer>",   // default: same as analyzer
  "mappings": {
    "dynamic": false,                  // true = auto-index all paths
    "fields": { <field-def> }          // required if dynamic:false
  },
  "numPartitions": 1,                  // 1|2|4, for >2B docs, needs search nodes
  "analyzers": [<custom-analyzer>],    // declare custom analyzers
  "storedSource": true | false | {     // default:false; store doc fields for $search
    "include": ["a","b"], "exclude": ["c"]
  },
  "synonyms": [ { <synonym-mapping> } ]// max 1 mapping per index
}
```

Fields cannot start with `$`.

Data-types auto-detected; nested docs follow parent `dynamic` unless overridden.

StoredSource requires cluster: MongoDB ≥5.0.6.

Troubleshoot: `$search` error `Error connecting to localhost:28000` ⇒ no `mongot`. Create first Search index to auto-install.

</section>
<section>
<title>Process Data with Analyzers</title>
<url>https://mongodb.com/docs/atlas/atlas-search/analyzers/</url>
<description>Learn about the different Atlas Search analyzers and how each one controls the way Atlas Search returns the contents of a string field.</description>


# Process Data with Analyzers

Use analyzers to convert `string` values into index terms.

## Index Options

```jsonc
{
  // Default analyzer for all mapped string fields
  "analyzer": "<indexAnalyzer>",          // omit => Standard

  // Analyzer for query text
  "searchAnalyzer": "<searchAnalyzer>",   // omit => analyzer | Standard

  "mappings": {
    "fields": {
      "<field>": {
        "type": "string",
        "analyzer": "<fieldAnalyzer>",    // overrides top-level

        // Alternate analyzers for the same field
        "multi": {
          "<name>": {                     // referenced in queries
            "type": "string",
            "analyzer": "<altAnalyzer>"
          }
        }
      }
    }
  },

  // Custom analyzers
  "analyzers": [
    {
      "name": "<customName>",
      "tokenizer": { "type": "<tokenizer>" },
      "filters": [ /* optional */ ]
    }
  ]
}
```

## Built-in Analyzers

• Standard (default)  
• Simple – splits on non-letters  
• Whitespace – splits on whitespace  
• Keyword – whole field as one term  
• Language – language-specific analyzers

## Normalizers (token type only)

`lowercase` – lowercase single token  
`none` – pass-through single token

</section>
<section>
<title>Standard Analyzer</title>
<url>https://mongodb.com/docs/atlas/atlas-search/analyzers/standard/</url>
<description>Use the Atlas Search standard analyzer to divide text into terms based on word boundaries, convert terms to lowercase, and remove punctuation.</description>


# Standard Analyzer

- Default for Atlas Search indexes/queries.  
- Tokenization: grammar-based word boundaries; detects email, CJK, acronyms, alphanumerics.  
- Post-processing: lowercase, strip punctuation.  
- Non-language-specific.  
- Field not indexed if any token > 32766 bytes (same for `keyword`).  

Index example (JSON editor):  
```json
{
  "mappings": {
    "fields": {
      "title": { "type": "string", "analyzer": "lucene.standard" }
    }
  }
}
```

Node.js search example:  
```js
const docs = await db.collection('movies').aggregate([
  { $search: { text: { query: 'action', path: 'title' } } },
  { $limit: 2 },
  { $project: { _id: 0, title: 1 } }
]).toArray();
```
Returns: `[ { title: 'Action Jackson' }, { title: 'Class Action' } ]`

Tokenization comparison:  

| Analyzer | "Action Jackson" tokens | "Class Action" tokens |
|----------|-------------------------|-----------------------|
| standard | action, jackson         | class, action         |
| keyword  | "Action Jackson"        | "Class Action"        |
| whitespace | Action, Jackson        | Class, Action         |

Effects:  
- `keyword` requires full-field exact match → query “action” fails.  
- `whitespace` is case-sensitive → query “action” fails due to “Action”.

</section>
<section>
<title>Simple Analyzer</title>
<url>https://mongodb.com/docs/atlas/atlas-search/analyzers/simple/</url>
<description>Use the Atlas Search simple analyzer to divide text by non-letter characters and convert terms to lowercase.</description>


# Simple Analyzer

- `lucene.simple`: lowercases text, splits on any non-letter char.  
- Fields producing tokens > 32 766 bytes are skipped (also applies to `keyword`).

## Index Definition (movies.title)

```json
{
  "mappings": {
    "fields": {
      "title": { "type": "string", "analyzer": "lucene.simple" }
    }
  }
}
```

Create via Atlas UI: disable Dynamic Mapping → add `title` (String) → Index & Search Analyzer = `lucene.simple` → save.

## Query (Node.js)

```js
const pipeline = [
  { $search: { text: { query: "lion", path: "title" } } },
  { $limit: 5 },
  { $project: { _id: 0, title: 1 } }
];
const docs = await db.collection("movies").aggregate(pipeline).toArray();
```

Expected titles: “White Lion”, “The Lion King”, “The Lion King 1 1/2”, “Lion's Den”, …

## Tokenization Example

| Title                 | Simple             | Standard                    | Whitespace           |
|-----------------------|--------------------|-----------------------------|----------------------|
| White Lion            | white, lion        | white, lion                 | White, Lion          |
| The Lion King         | the, lion, king    | the, lion, king             | The, Lion, King      |
| The Lion King 1 1/2   | the, lion, king    | the, lion, king, 1, 1, 2    | The, Lion, King, 1…  |
| Lion's Den            | lion, s, den       | lion's, den                 | Lion's, Den          |

`Lion's Den` matches because `simple` creates the token `lion`.

</section>
<section>
<title>Whitespace Analyzer</title>
<url>https://mongodb.com/docs/atlas/atlas-search/analyzers/whitespace/</url>
<description>Use the Atlas Search whitespace analyzer to divide text into searchable terms at each whitespace character.</description>


# Whitespace Analyzer

• Splits text on whitespace, keeps original case → case-sensitive tokens.  
• String not indexed if any token > 32766 bytes (same for `keyword`).  

Index definition:

```json
{
  "mappings": {
    "fields": {
      "title": {
        "type": "string",
        "analyzer": "lucene.whitespace",
        "searchAnalyzer": "lucene.whitespace"
      }
    }
  }
}
```

Node.js query:

```js
const res = await db.collection('movies').aggregate([
  { $search: { text: { query: "Lion's", path: "title" } } },
  { $project: { _id: 0, title: 1 } }
]).toArray();
// → [{title:"Lion's Den"},{title:"The Lion's Mouth Opens"}]
```

Tokenization:

```
Whitespace  Simple        Keyword
"Lion's Den" → Lion's Den | lion s den | "Lion's Den"
"The Lion's Mouth Opens" → The Lion's Mouth Opens | the lion s mouth opens | "The Lion's Mouth Opens"
```

Query tokens must match case (`Lion's`).

</section>
<section>
<title>Keyword Analyzer</title>
<url>https://mongodb.com/docs/atlas/atlas-search/analyzers/keyword/</url>
<description>Use the Atlas Search keyword analyzer to index multiple terms in a string field as a single searchable term.</description>


# Keyword Analyzer

- Indexes entire string/array as **one case-sensitive token**; returns results only on **exact match**.  
- Use Atlas Search `equals` operator + token type as an alternative for exact matching.  
- Skips strings whose single token > 32766 bytes.  

## Mapping (JSON)
```json
{
  "mappings": {
    "fields": {
      "title": { "type": "string", "analyzer": "lucene.keyword" }
    }
  }
}
```

## Exact-match search (Node.js)
```js
db.collection('movies').aggregate([
  { $search: { text: { query: "Class Action", path: "title" } } },
  { $project: { _id: 0, title: 1 } }
])
// → { title: "Class Action" }
```

Query `"action"` returns no docs because token is `Class Action`.  
Standard/Simple analyzers would tokenize to `["class","action"]`, matching both `"action"` and `"Class Action"`.

</section>
<section>
<title>Language Analyzers</title>
<url>https://mongodb.com/docs/atlas/atlas-search/analyzers/language/</url>
<description>Use a language analyzer to create search keywords in your Atlas Search index that are optimized for a particular natural language.</description>


# Language Analyzers

Supported analyzers (Lucene): arabic, armenian, basque, bengali, brazilian, bulgarian, catalan, chinese, cjk¹, czech, danish, dutch, english, finnish, french, galician, german, greek, hindi, hungarian, indonesian, irish, italian, japanese, korean, kuromoji², latvian, lithuanian, morfologik³, nori⁴, norwegian, persian, polish, portuguese, romanian, russian, smartcn⁵, sorani, spanish, swedish, thai, turkish, ukrainian.  
¹generic C-J-K ²Japanese ³Polish ⁴Korean ⁵Chinese.

## Built-in Analyzer (French)

Index:
```json
{ "mappings":{ "fields":{ "subject.fr":{ "type":"string","analyzer":"lucene.french" }}}}
```

Query (`pour` is a stop word ⇒ 0 hits):
```javascript
await db.collection('cars').aggregate([
  { $search:{ text:{ query:"pour", path:"subject.fr" } } },
  { $project:{ _id:0,"subject.fr":1 } }
]);
```

Query (`carburant` ⇒ 1 hit):
```javascript
await db.collection('cars').aggregate([
  { $search:{ text:{ query:"carburant", path:"subject.fr" } } },
  { $project:{ _id:0,"subject.fr":1 } }
]);
```

## Custom Analyzer (Hebrew)

Index:
```json
{
  "analyzer":"lucene.standard",
  "mappings":{"fields":{"subject.he":{"type":"string","analyzer":"myHebrew"}}},
  "analyzers":[{
    "name":"myHebrew",
    "tokenizer":{"type":"standard"},
    "tokenFilters":[{"type":"icuFolding"},{"type":"stopword","tokens":["אן","שלנו","זה","אל"]}]
  }]
}
```

Search:
```javascript
await db.collection('cars').aggregate([
  { $search:{ text:{ query:"המכוניות", path:"subject.he" } } },
  { $project:{ _id:0,"subject.he":1 } }
]);
```

## Multilingual Index (Italian + English fallback)

Index:
```json
{
  "mappings":{
    "dynamic":true,
    "fields":{
      "fullplot":{
        "type":"string","analyzer":"lucene.italian",
        "multi":{"fullplot_english":{"type":"string","analyzer":"lucene.english"}}
      }
    }
  }
}
```

Compound query:
```javascript
await db.collection('movies').aggregate([{
  $search:{
    index:"multilingual-tutorial",
    compound:{
      must:[{ text:{ query:"Bella", path:{ value:"fullplot", multi:"fullplot_english" } } }],
      mustNot:[{ range:{ path:"released", gt:new Date("1984-01-01"), lt:new Date("2016-01-01") } }],
      should:[{ text:{ query:"Comedy", path:"genres" } }]
    }
  }
}]);
```

</section>
<section>
<title>Multi Analyzer</title>
<url>https://mongodb.com/docs/atlas/atlas-search/analyzers/multi/</url>
<description>Use the ``multi`` object to specify alternate analyzers to also index the field with. Then you can search with the default or the alternate analyzer.</description>


# Multi Analyzer

Use `multi` in the index mapping of a **string** field to add alternate analyzers.  
Limits: `multi` only on strings, no nested `multi`.

## Index Definition

```json
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "title": {
        "type": "string",
        "analyzer": "lucene.standard",
        "multi": {
          "frenchAnalyzer": { "type": "string", "analyzer": "lucene.french" }
        }
      },
      "plot": {
        "type": "string",
        "analyzer": "lucene.standard",
        "multi": {
          "frenchAnalyzer": { "type": "string", "analyzer": "lucene.french" }
        }
      }
    }
  }
}
```

## Querying with an Alternate Analyzer (Node.js)

```js
// Single field
await db.collection('movies').aggregate([
  {
    $search: {
      text: {
        query: "liberte",
        path: { value: "title", multi: "frenchAnalyzer" }
      }
    }
  },
  { $project: { _id: 0, title: 1, year: 1 } }
]).toArray();

// Multiple fields
await db.collection('movies').aggregate([
  {
    $search: {
      text: {
        query: "revolution",
        path: [
          "title", "plot",
          { value: "title", multi: "frenchAnalyzer" },
          { value: "plot",  multi: "frenchAnalyzer" }
        ]
      }
    }
  },
  { $limit: 5 },
  { $project: { _id: 0, title: 1, plot: 1, year: 1 } }
]).toArray();
```

Tokenization difference example (`è Nous la Libertè` vs `liberte`):

- standard ⇒ `è`, `nous`, `la`, `libertè`
- lucene.french ⇒ `è`, `libert`

French analyzer strips diacritics, enabling the match.

</section>
<section>
<title>Custom Analyzers</title>
<url>https://mongodb.com/docs/atlas/atlas-search/analyzers/custom/</url>
<description>Define a custom analyzer to transform and filter characters before indexing for search.</description>


# Custom Analyzers

```json
"analyzers":[
  { "name":"<unique>",               // !^lucene\.|builtin\.|mongodb\.
    "charFilters":[ {...} ],          // 0+; optional
    "tokenizer":{ "type":"<tokenizer-type>" },  // required
    "tokenFilters":[ {...} ]          // 0+; optional
  }
]
```
Processing order: charFilters → tokenizer → tokenFilters.

Built-in templates  
• Email Parser – `uaxUrlEmail` tokenizer (≤200 chars)  
• Phone Numbers – `regexCaptureGroup` tokenizer (US format)  
• Dash-Separated IDs – `regexSplit` tokenizer (hyphen-delimited)

Atlas UI lists per analyzer: Name, Used In (fields), Character Filters, Tokenizer, Token Filters, Actions (edit/delete).

</section>
<section>
<title>Character Filters</title>
<url>https://mongodb.com/docs/atlas/atlas-search/analyzers/character-filters/</url>
<description>Use the character filters in an Atlas Search custom analyzer to examine text one character at a time and perform filtering operations.</description>


# Character Filters

Atlas Search `charFilters` run before tokenization.

```json
"charFilters": [{ "type": "<htmlStrip|icuNormalize|mapping|persian>", ... }]
```

## htmlStrip  
Removes HTML; keep tags in `ignoredTags`.

```json
{
  "name": "htmlStrippingAnalyzer",
  "charFilters":[{"type":"htmlStrip","ignoredTags":["a"]}],
  "tokenizer":{"type":"standard"}
}
```
Node.js search:
```js
await db.collection('minutes').aggregate([
  { $search: { text:{ query:"head", path:"text.en_US" } } },
  { $project:{ text:1 } }
]).toArray();
```
`<head>` tag is discarded; tokens: This,page,deals,...

## icuNormalize  
ICU Unicode normalization.

```json
{
  "name":"normalizingAnalyzer",
  "charFilters":[{"type":"icuNormalize"}],
  "tokenizer":{"type":"whitespace"}
}
```
```js
await db.collection('minutes').aggregate([
  { $search:{ text:{ query:"no", path:"message" } } },
  { $project:{ message:1 } }
]);
```
Normalizes `№` → `no`.

## mapping  
User-defined replacements via `mappings` object (`"<orig>": "<repl>"`).

```json
{
  "name":"mappingAnalyzer",
  "charFilters":[{
    "type":"mapping",
    "mappings":{"-":"","(":"" ,")":""," ":"",".":""}
  }],
  "tokenizer":{"type":"keyword"}
}
```
```js
await db.collection('minutes').aggregate([
  { $search:{ text:{ query:"1234567890", path:"page_updated_by.phone" } } },
  { $project:{ "page_updated_by.phone":1 } }
]);
```
All punctuation stripped ⇒ phone variants collapse to single token `1234567890`.

## persian  
Replaces zero-width non-joiner with space.

```json
{
  "name":"persianCharacterIndex",
  "charFilters":[{ "type":"persian" }],
  "tokenizer":{"type":"whitespace"}
}
```
```js
await db.collection('minutes').aggregate([
  { $search:{ text:{ query:"صحبت", path:"text.fa_IR" } } },
  { $project:{ "text.fa_IR":1 } }
]);
```
Normalizes text, producing tokens: ابتدا,رئیس,بخش,فروش,صحبت,کرد.

## Summary
htmlStrip(`ignoredTags`), icuNormalize(), mapping(`mappings`), persian(); include in `analyzers[].charFilters`; queries unaffected by HTML, Unicode variants, punctuation, or Persian ZWNJ.

</section>
<section>
<title>Tokenizers</title>
<url>https://mongodb.com/docs/atlas/atlas-search/analyzers/tokenizers/</url>
<description>Use a tokenizer in an Atlas Search custom analyzer to split chunks of text into groups, or tokens, for indexing purposes.</description>


# Tokenizers

Tokenizer config:  
```json
"tokenizer": { "type": "<type>", ...opts }
```

Supported `type`: edgeGram | keyword | nGram | regexCaptureGroup | regexSplit | standard | uaxUrlEmail | whitespace

---

## edgeGram
Tokenizes from start of token into n-grams. Produces graphs ⇒ **not valid** for synonym or autocomplete analyzers.  
Required opts:
```json
{ "type":"edgeGram", "minGram":<int>, "maxGram":<int> }
```

---

## keyword
Entire field is one token. Input > 32766 chars not indexed.  
```json
{ "type":"keyword" }
```

---

## nGram
Sliding-window n-grams; incompatible with synonym/autocomplete analyzers.  
```json
{ "type":"nGram", "minGram":<int>, "maxGram":<int> }
```

---

## regexCaptureGroup
Extracts matching groups from Java-regex.  
```json
{ "type":"regexCaptureGroup", "pattern":"<regex>", "group":<int|0=all> }
```

---

## regexSplit
Splits text at Java-regex delimiters.  
```json
{ "type":"regexSplit", "pattern":"<delimiter-regex>" }
```

---

## standard
Unicode word breaks. Optional length split.  
```json
{ "type":"standard", "maxTokenLength":<int,default 255> }
```

---

## uaxUrlEmail
Like `standard` but keeps URLs/emails intact; use only when such data exists.  
```json
{ "type":"uaxUrlEmail", "maxTokenLength":<int,default 255> }
```

---

## whitespace
Splits on whitespace only.  
```json
{ "type":"whitespace", "maxTokenLength":<int,default 255> }
```

---

### Minimal Node.js aggregation example
```js
await db.collection('minutes').aggregate([
  { $search: { text: { query: "tr", path: "message" } } },
  { $project: { _id:1, message:1 } }
]).toArray();
```

Replace `text`/query/path per tokenizer & index settings.

</section>
<section>
<title>Token Filters</title>
<url>https://mongodb.com/docs/atlas/atlas-search/analyzers/token-filters/</url>
<description>Use token filters in an Atlas Search custom analyzer to modify tokens, such as by stemming, lowercasing, or redacting sensitive information.</description>


# Token Filters

General structure  
```json
"tokenFilters":[{ "type":"<filter>", /* attrs */ }]
```

Supported `type` values  
asciiFolding · daitchMokotoffSoundex · edgeGram · englishPossessive · flattenGraph · icuFolding · icuNormalizer · kStemming · length · lowercase · nGram · porterStemming · regex · reverse · shingle · snowballStemming · spanishPluralStemming · stempel · stopword · trim · wordDelimiterGraph

---

### asciiFolding  
Converts non-ASCII chars.  
`originalTokens` include|omit (def omit)

### daitchMokotoffSoundex  
6-digit phonetic codes. Forbidden in synonym/autocomplete or with `fuzzy`.  
`originalTokens` include|omit (def include)

### edgeGram  
Left-edge n-grams. Graph-producing ⇒ no synonym/autocomplete.  
`minGram` int ≤ `maxGram` · `maxGram` int ≥ `minGram` · `termNotInBounds` include|omit (def omit)

### englishPossessive  
Strips trailing `'s`.

### flattenGraph  
Flattens graphs (use after wordDelimiterGraph).

### icuFolding  
Unicode folding (accents, case, etc.).

### icuNormalizer  
Unicode normalization.  
`normalizationForm` nfd|nfc|nfkd|nfkc (def nfc)

### kStemming  
English stemmer; ignores uppercase.

### length  
Filters by length.  
`min` (def 0) · `max` (def 255)

### lowercase  
Lowercases tokens.

### nGram  
Generic n-gram; no synonym/autocomplete.  
`minGram`, `maxGram`, `termNotInBounds` (def omit)

### porterStemming  
Porter English stemmer; expects lowercase.

### regex  
Java regex replace.  
`pattern` str · `replacement` str · `matches` all|first  
Empty replacement yields empty token ⇒ delete via `stopword`.

### reverse  
Reverses tokens; aids leading-wildcard queries.

### shingle  
Token shingles; no synonym/autocomplete.  
`minShingleSize` ≥2 ≤`maxShingleSize` · `maxShingleSize`

### snowballStemming  
`stemmerName` one of: arabic, armenian, basque, catalan, danish, dutch, english, estonian, finnish, french, german, german2, hungarian, irish, italian, lithuanian, norwegian, porter, portuguese, romanian, russian, spanish, swedish, turkish.

### spanishPluralStemming  
Stems Spanish plurals; expects lowercase.

### stempel  
Polish stemmer; expects lowercase.

### stopword  
Removes listed tokens.  
`tokens` [str,…] · `ignoreCase` bool (def true)

### trim  
Trims leading/trailing whitespace.

### wordDelimiterGraph  
Splits/concats sub-words & numbers; graph-producing.  
`delimiterOptions` (all bool, def in parentheses):  
• generateWordParts (true) • generateNumberParts (true) • concatenateWords (false) • concatenateNumbers (false) • concatenateAll (false) • preserveOriginal (true) • splitOnCaseChange (true) • splitOnNumerics (true) • stemEnglishPossessive (true) • ignoreKeywords (false)  
`protectedWords`:{ words:[…], ignoreCase (true) }  
Apply `flattenGraph` afterwards; avoid with standard tokenizer.

---

## Minimal Node.js Aggregate Example
```javascript
const pipeline=[
 { $search:{ index:"default",
   text:{ query:"Sian", path:"page_updated_by.first_name" } } },
 { $project:{ _id:1, "page_updated_by.first_name":1 } }
];
await db.collection('minutes').aggregate(pipeline).toArray();
```

</section>
<section>
<title>Define Field Mappings</title>
<url>https://mongodb.com/docs/atlas/atlas-search/define-field-mappings/</url>
<description>Learn how to include specific fields in your search index or how to configure Atlas Search to automatically include all supported field types.</description>


# Define Field Mappings

## Limits & Rules
- Max 2.1 B index objects per replica-set/shard; above this use `numPartitions` or sharding.  
- Field names may not start with `$`.  

## Mapping Modes
```jsonc
// Dynamic: auto-index all supported fields
{
  "mappings": {
    "dynamic": true,               // default false
    "fields": {                    // optional overrides
      "name": { "type": "string" }
    }
  }
}

// Static: only index listed fields
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "name": { "type": "string" }
    }
  }
}

// Polymorphic field
{
  "mappings": {
    "fields": {
      "price": [
        { "type": "number" },
        { "type": "string" }
      ]
    }
  }
}
```
Notes  
• For nested static fields, define every parent level (no dot-notation).  
• `dynamic` can be set at any sub-document to override inheritance.  

## Supported BSON → Atlas Types (✓ = auto-indexed when `dynamic:true`)
- Array → element type (boolean, date, number, objectId, string, token) ✓  
- Boolean → boolean ✓  
- Date → date ✓, dateFacet  
- Double/Int32/Int64 → number ✓, numberFacet, knnVector  
- GeoJSON → geo  
- Object → document ✓, embeddedDocument (arrays)  
- ObjectId → objectId ✓  
- String → string ✓, stringFacet, autocomplete, token  
- UUID / BinData subtype 4 → uuid ✓  
nulls auto-indexed; unsupported: Decimal128, RegExp, JS-with-Scope, MinKey, MaxKey, Timestamp.

Query operator availability matches field type (e.g., `equals`, `range`, `near`, `facet`, `autocomplete`, `knnBeta`, etc.).

## Index Examples
```jsonc
// Pure Static
{
  "analyzer": "lucene.standard",
  "searchAnalyzer": "lucene.standard",
  "mappings": {
    "dynamic": false,
    "fields": {
      "address": {
        "type": "document",
        "fields": {
          "city":   { "type": "string", "analyzer": "lucene.simple",   "ignoreAbove": 255 },
          "state":  { "type": "string", "analyzer": "lucene.english" }
        }
      },
      "company": {
        "type": "string",
        "analyzer": "lucene.whitespace",
        "multi": { "mySecondaryAnalyzer": { "type": "string", "analyzer": "lucene.french" } }
      },
      "employees": { "type": "string", "analyzer": "lucene.standard" }
    }
  }
}

// Mixed Static + Dynamic
{
  "analyzer": "lucene.standard",
  "mappings": {
    "dynamic": false,
    "fields": {
      "company":   { "type": "string", "analyzer": "lucene.whitespace",
                     "multi": { "mySecondaryAnalyzer": { "type": "string", "analyzer": "lucene.french" } } },
      "employees": { "type": "string" },
      "address":   { "type": "document", "dynamic": true }   // auto-index all sub-fields
    }
  }
}
```

</section>
<section>
<title>How to Index the Elements of an Array</title>
<url>https://mongodb.com/docs/atlas/atlas-search/field-types/array-type/</url>
<description>Use the data type of the elements in an array to include elements inside the array in the search index.</description>


# Index Array Elements

Atlas Search flattens arrays at index time; you only declare the element type, not `[]`.

• Arrays of scalars  
```json
{
  "mappings": {
    "fields": {
      "<arrayField>": { "type": "<elementType>" }
    }
  }
}
```

• Arrays of objects → index parent field with `embeddedDocuments`.

Dynamic mapping indexes any supported element types automatically.

Example (`genres` is `[string]`):
```json
{
  "mappings": {
    "fields": {
      "genres": { "type": "string" }
    }
  }
}
```

UI steps: Refine Index → Add Field Mapping → pick array field → set element data type → Add.

</section>
<section>
<title>How to Index Fields for Autocompletion</title>
<url>https://mongodb.com/docs/atlas/atlas-search/field-types/autocomplete-type/</url>
<description>Use the Atlas Search autocomplete field type to index text values in string fields for autocompletion and search-as-you-type applications.</description>


# Atlas Search ‑ Autocomplete Field Indexing

Use static mappings with the `autocomplete` type to enable search-as-you-type on string values (scalar, array, or in embedded docs). Consider a dedicated index for large data sets. Fields starting with `$` are not supported.

```json
{
  "mappings": {
    "dynamic": <bool>,
    "fields": {
      "<fieldName>": {
        "type": "autocomplete",
        "analyzer": "<lucene|custom>",         // default: lucene.standard
        "tokenization": "edgeGram|rightEdgeGram|nGram", // default: edgeGram
        "minGrams": <int>,                    // default: 2 (≥4 recommended)
        "maxGrams": <int>,                    // default: 15
        "foldDiacritics": <bool>              // default: true
      }
    }
  }
}
```

Parameter details  
• analyzer – Any Atlas Search analyzer except `lucene.kuromoji`; disallow tokenizers/filters: nGram, edgeGram, daitchMokotoffSoundex, shingle.  
• tokenization –  
  edgeGram: left-prefix grams | rightEdgeGram: right-suffix grams | nGram: sliding window (index size ↑).  
• foldDiacritics – true merges “café/cafe”; false preserves accents.  
• Tokens < minGrams kept; ≥minGrams concatenated up to maxGrams (“shingling”).  
Performance note: smaller minGrams and nGram increase index size/time.

## Sample Indexes

Basic (`title`, edgeGram 3–5 chars):

```json
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "title": {
        "type": "autocomplete",
        "analyzer": "lucene.standard",
        "tokenization": "edgeGram",
        "minGrams": 3,
        "maxGrams": 5,
        "foldDiacritics": false
      }
    }
  }
}
```

Multi-type (`title` as autocomplete + string):

```json
{
  "mappings": {
    "dynamic": <bool>,
    "fields": {
      "title": [
        {
          "type": "autocomplete",
          "analyzer": "lucene.standard",
          "tokenization": "edgeGram",
          "minGrams": 2,
          "maxGrams": 15,
          "foldDiacritics": false
        },
        { "type": "string" }
      ]
    }
  }
}
```

Email field (keyword analyzer, nGram 3–15):

```json
{
  "mappings": {
    "dynamic": true,
    "fields": {
      "email": {
        "type": "autocomplete",
        "analyzer": "lucene.keyword",
        "tokenization": "nGram",
        "minGrams": 3,
        "maxGrams": 15,
        "foldDiacritics": false
      }
    }
  }
}
```

Tip: For fields named `email`/`url`, prefer a custom analyzer using the `uaxUrlEmail` tokenizer.

Query indexed fields with the `autocomplete` operator.

</section>
<section>
<title>How to Index Boolean Values</title>
<url>https://mongodb.com/docs/atlas/atlas-search/field-types/boolean-type/</url>
<description>Use the Atlas Search boolean field type to include true and false values in your search index.</description>


# Boolean Field Index

- `type: "boolean"` indexes `true`/`false`, arrays of booleans, and boolean fields in embedded docs.  
- Queryable via equals, in; sortable.  
- Auto-indexed when `dynamic` mapping enabled; otherwise define manually.  
- Field names must not start with `$`.

## JSON Index

```json
{
  "mappings": {
    "dynamic": false,          // set true/omit for auto
    "fields": {
      "<field>" : { "type": "boolean" }
    }
  }
}
```

Required param: `"type": "boolean"`.

## Example (sample_guides.planets)

```json
{
  "mappings": {
    "fields": {
      "hasRings": { "type": "boolean" }
    }
  }
}
```

Operators: `equals`, `in`.

</section>
<section>
<title>How to Index Date Fields</title>
<url>https://mongodb.com/docs/atlas/atlas-search/field-types/date-type/</url>
<description>Use the Atlas Search date field type to include date values in the search index.</description>


# Index Date Fields

- Support ops: range, near, equals, in, facet (facet requires type `dateFacet`).  
- Arrays: only `range` works; `near` unsupported.  
- Sorting: auto‐indexed for indexes created ≥ Jul 2023; rebuild older indexes.  
- Dynamic mappings index `date` automatically.

## JSON Index Syntax
```json
{
  "mappings": {
    "dynamic": <bool>,
    "fields": {
      "<field>": { "type": "date" }            // or ["date", "dateFacet"]
    }
  }
}
```

## Field Property
type: string, required, value `"date"`.

## Example (sample_mflix.movies)
```json
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "released": { "type": "date" }
    }
  }
}
```
With facet:
```json
"released": [
  { "type": "date" },
  { "type": "dateFacet" }
]
```

## Query Operators Reference
equals | facet | in | near | range

</section>
<section>
<title>How to Index Fields in Objects and Documents</title>
<url>https://mongodb.com/docs/atlas/atlas-search/field-types/document-type/</url>
<description>Use the Atlas Search document field type to include fields in documents or objects in the search index.</description>


# Atlas Search `document` Type

Index any object sub-document (not elements of an array). For array elements use `embeddedDocuments`.

## JSON Mapping Skeleton
```json
{
  "mappings": {
    "dynamic": <bool>,           // collection level
    "fields": {
      "<fieldName>": {
        "type": "document",
        "dynamic": <bool>,       // doc-level; true = recurse auto-index
        "fields": {              // required if dynamic:false
          "<childField>": { <field-mapping> }
        }
      }
    }
  }
}
```

## Field Options
- type (string, required) – must be `"document"`.
- dynamic (bool, default false) – if true, Atlas Search indexes all sub-fields & nested documents (except unsupported types). Override per sub-field by adding explicit mapping.
- fields (document, optional) – explicit child mappings; required when dynamic omitted/false.

## Constraints
- Cannot index a field whose name starts with `$`.
- `document` cannot target objects inside arrays.

## Minimal Example (`sample_mflix.movies`)
Indexes `awards` object and auto-indexes all its dynamic sub-fields.
```json
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "awards": { "type": "document", "dynamic": true }
    }
  }
}
```

For UI, choose field, set Data Type = Document, toggle Dynamic Mapping as needed.

</section>
<section>
<title>How to Index Fields in Arrays of Objects and Documents</title>
<url>https://mongodb.com/docs/atlas/atlas-search/field-types/embedded-documents-type/</url>
<description>Use the Atlas Search embeddedDocument field type to index fields in documents or objects that are in an array.</description>


# Indexing Arrays of Embedded Documents (`embeddedDocuments`)

`embeddedDocuments` maps each array element or nested object as an independent doc.  
• Query ONLY with `embeddedDocument` operator.  
• Must use static mappings (UI Visual/JSON editors).  
• Faceting on date/num/string inside arrays returns counts per **root** doc.  

## Key Limits
- Max 5 nesting levels (≤4 `embeddedDocuments` ancestors).  
- Child fields cannot be deprecated `knnVector`.  
- Highlight/facet/sort need parent indexed as `document`.  
  • Facet only on string children; index as `stringFacet`.  
  • No faceting on numeric/date children.  
- >2.1 B Lucene docs per replica-set/shard ⇒ index becomes `stale`.  
  Each embedded doc counts as 1 object.

### Estimate Index Objects
```
objects_per_doc = 1 + #nested_embedded_docs
total_objects   = objects_per_doc * collection_docs   # lower bound
```

## Mapping Syntax
```json
{
  "mappings": {
    "dynamic": true|false,
    "fields": {
      "<field>": {
        "type": "embeddedDocuments",
        "dynamic": true|false,
        "fields": {        // omitted if dynamic:true
          "<subfield>": { <mapping> }
        }
      }
    }
  }
}
```

### Field Properties
| name     | type    | req | default | notes                               |
|----------|---------|-----|---------|-------------------------------------|
| type     | string  | ✓   | —       | must be `embeddedDocuments`         |
| dynamic  | bool    | —   | false   | index all dynamic fields if true    |
| fields   | object  | —   | `{}`    | explicit child mappings; facets not supported |

## Example Mappings (Node.js driver uses same JSON)

Index entire `items` array, auto-map children:
```json
{
  "mappings": { "fields": {
    "items": { "type": "embeddedDocuments", "dynamic": true }
  }}
}
```

Index all children, plus facet on `purchaseMethod`:
```json
{
  "mappings": {
    "dynamic": true,
    "fields": {
      "items": { "type": "embeddedDocuments", "dynamic": true },
      "purchaseMethod": { "type": "stringFacet" }
    }
  }
}
```

Index only specified children:
```json
{
  "mappings": { "fields": {
    "items": {
      "type": "embeddedDocuments",
      "dynamic": false,
      "fields": {
        "name": { "type": "string" },
        "tags": { "type": "string" }
}}}}
}
```

## Sharding Recommendation
If projected objects ≥2.1 B, shard the cluster. Monitor metric: **Search Max Number of Lucene Docs**.

## Related
• Query operator: `embeddedDocument`  
• Tutorial: Atlas Search Queries Against Fields in Embedded Documents

</section>
<section>
<title>How to Index GeoJSON Objects</title>
<url>https://mongodb.com/docs/atlas/atlas-search/field-types/geo-type/</url>
<description>Use the Atlas Search geo field type to include GeoJSON polygon, MultiPolygon, LineString shape or point values in the search index.</description>


# Index GeoJSON (`geo`) in Atlas Search

- Only statically mapped; define via Atlas UI Visual or JSON editor.  
- Supports GeoJSON points & shapes, queried with `geoShape`, `geoWithin`.

## JSON Mapping Template
```json
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "<field>": {
        "type": "geo",          // required
        "indexShapes": false    // optional; true = index shapes & points
      }
    }
  }
}
```

## Visual Editor Path
Refine Your Index → Add Field Mapping → Customized Configuration → select field → Data Type: Geo → set Index Shapes → Add.

## Example (`address.location`)
```json
{
  "mappings": {
    "fields": {
      "address": {
        "type": "document",
        "fields": {
          "location": { "type": "geo", "indexShapes": true }
        }
      }
    }
  }
}
```

Use with `geoShape` & `geoWithin` queries.

</section>
<section>
<title>How to Index Vector Embeddings for Vector Search</title>
<url>https://mongodb.com/docs/atlas/atlas-search/field-types/knn-vector/</url>
<description>Use the Atlas Search knnVector field type to index vector embeddings for vector search using the knnBeta operator.</description>


# knnVector Field (Deprecated – use `vectorSearch` index & `$vectorSearch` stage)

- `knnVector` + `knnBeta` kept for legacy; new work should use `vectorSearch` + `$vectorSearch`.
- Field value: array of numbers  
  • `int32`/`int64`/`double` for `knnBeta`  
  • `double` for `$vectorSearch`.
- Configure via Atlas Search JSON Editor (not Visual Editor). Supported in local Atlas deployments.

Limitations: cannot index fields inside arrays of documents/objects (`embeddedDocuments`).

Index mapping:

```json
{
  "mappings": {
    "dynamic": <bool>,
    "fields": {
      "<field>": {
        "type": "knnVector",
        "dimensions": <1-8192>,
        "similarity": "euclidean" | "cosine" | "dotProduct"
      }
    }
  }
}
```

Options  
type: "knnVector" (req)  
dimensions: int ≤8192 (req)  
similarity (req):  
  • euclidean – L2 distance  
  • cosine – angle only; avoid zero-magnitude; normalize vectors  
  • dotProduct – angle + magnitude; ~cosine if normalized

Example (sample_mflix.embedded_movies):

```json
{
  "mappings": {
    "dynamic": true,
    "fields": {
      "plot_embedding": {
        "type": "knnVector",
        "dimensions": 1536,
        "similarity": "euclidean"
      }
    }
  }
}
```

Query with `$vectorSearch`.

</section>
<section>
<title>How to Index Numeric Values</title>
<url>https://mongodb.com/docs/atlas/atlas-search/field-types/number-type/</url>
<description>Use the Atlas Search number field type to include numeric values of int32, int64, and double data types in the search index.</description>


# Atlas Search `number` Type  

• Index `int32`, `int64`, `double`.  
• Query ops: `equals`, `range`, `near`; `range` only for arrays; supports facets & sort (auto-enabled for indexes created ≥ Jul 2023; rebuild older).  
• Dynamic mappings index `number` by default.  

## Index Syntax (JSON Editor)
```json
{
  "mappings": {
    "dynamic": true|false,
    "fields": {
      "<field>": {
        "type": "number",                 // required
        "representation": "int64|double", // default "double"
        "indexIntegers": true|false,      // default true
        "indexDoubles":  true|false       // default true
      }
    }
  }
}
```
At least one of `indexIntegers` or `indexDoubles` must be `true`.  

### representation  
• `int64` – precise large ints; rounds doubles; can’t index very large doubles.  
• `double` – precise large doubles.  

## Minimal Examples
Index both ints & doubles (default):
```json
"account_id": { "type": "number", "representation": "int64" }
```
Index only ints:
```json
"account_id": {
  "type": "number",
  "representation": "int64",
  "indexDoubles": false
}
```
Index only doubles:
```json
"bathrooms": {
  "type": "number",
  "indexIntegers": false
}
```

</section>
<section>
<title>How to Index ObjectId Values in Fields</title>
<url>https://mongodb.com/docs/atlas/atlas-search/field-types/object-id-type/</url>
<description>Use the Atlas Search objectId field type to include objectId values in the search index.</description>


# Indexing `objectId` Fields

Supports equals, in operators. Works on single values, arrays, and `embeddedDocuments` arrays. Dynamic mappings auto-index `objectId`.

```json
# Minimal index definition
{
  "mappings": {
    "dynamic": true|false,
    "fields": {
      "<field>": { "type": "objectId" }
    }
  }
}
```

Field property  
• `type` (string, required): `"objectId"`

Example (`sample_mflix.comments`, index `movie_id`):

```json
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "movie_id": { "type": "objectId" }
    }
  }
}
```

</section>
<section>
<title>How to Index String Fields</title>
<url>https://mongodb.com/docs/atlas/atlas-search/field-types/string-type/</url>
<description>Use the string field type to index string values in fields.</description>


# Atlas Search – `string` Field

• Indexed by default when `dynamic:true`. Supports operators: phrase, queryString, span, text, wildcard, regex, moreLikeThis.  
• NOT for facet, autocomplete, sort, equality/in/range. For these use: `stringFacet`, `autocomplete`, `token`.  
• Tokens > 32766 bytes (e.g. long `keyword` analyzer values) are skipped.

## JSON Mapping Skeleton
```json
{
  "mappings": {
    "dynamic": true|false,
    "fields": {
      "<field>": {
        "type": "string",
        "analyzer": "<analyzer>",          // optional
        "searchAnalyzer": "<analyzer>",    // optional
        "indexOptions": "docs|freqs|positions|offsets",
        "store": true|false,
        "ignoreAbove": <int>,
        "norms": "include|omit",
        "multi": {                         // optional multi-analyzers
          "<name>": { "type":"string","analyzer":"<analyzer>" }
        }
      }
    }
  }
}
```

Defaults:  
• analyzer / searchAnalyzer inherit index→`lucene.standard`  
• indexOptions: `offsets` (required for highlight)  
• store: `true` (set `false` to shrink index)  
• norms: `include`

## Minimal Examples
Basic title index:
```json
{
  "mappings": {
    "dynamic": false,
    "fields": { "title": { "type": "string" } }
  }
}
```

Multi-analyzer fullplot (standard + english + french):
```json
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "fullplot": {
        "type": "string",
        "multi": {
          "english": { "type":"string", "analyzer":"lucene.english" },
          "french":  { "type":"string", "analyzer":"lucene.french"  }
        }
      }
    }
  }
}
```

</section>
<section>
<title>How to Index String Fields For Faceted Search</title>
<url>https://mongodb.com/docs/atlas/atlas-search/field-types/string-facet-type/</url>
<description>Use the stringFacet field type to index string values in fields for facet search.</description>


# Index String Fields for Faceted Search

• Facet queries work only on fields mapped as `"type":"stringFacet"`; analyzer is skipped.  
• To keep text-search, map same field again as `"type":"string"`.  
• Embedded docs: map parent as `"type":"document"`; facet counts return per parent doc.  
• `stringFacet` needs static mappings (`"dynamic":false`); not auto-created.  
• Field names starting with `$` unsupported in UI.  
• BSON strings truncated to ≈8000 UTF-16 code units.

JSON template
```json
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "<field>": { "type": "stringFacet" }
    }
  }
}
```

Multiple types
```json
"fields": {
  "genres": [
    { "type": "stringFacet" },
    { "type": "string" }
  ]
}
```

Example (sample_mflix.movies)
```json
{
  "mappings": {
    "dynamic": false,
    "fields": { "genres": { "type": "stringFacet" } }
  }
}
```

Query with the `facet` collector to retrieve facet counts.

</section>
<section>
<title>How to Index String Fields for Efficient Filtering and Sorting</title>
<url>https://mongodb.com/docs/atlas/atlas-search/field-types/token-type/</url>
<description>Use the token field type to index string values in fields for sorting and querying using equals, in, and range operators.</description>


# Atlas Search `token` Type

*Purpose*  
– Enable fast `$search.sort` and pre-filtering for `$vectorSearch`.  
– Required for `equals`, `in`, `range` operators.

*Limitations*  
– To use text/phrase/etc. on same field, also index it as `string`.  
– Strings >8181 chars are truncated.  
– Field name cannot start with `$`.

*Behavior*  
– Whole field indexed as one token, stored columnar.  
– Optional `normalizer`:  
  • `lowercase` → case-insensitive sort/filter  
  • `none` (default)

## JSON Index Syntax
```json
{
  "mappings": {
    "dynamic": <bool>,
    "fields": {
      "<fieldName>": {
        "type": "token",
        "normalizer": "lowercase" | "none"
      }
    }
  }
}
```

## Examples

### 1. Case-insensitive sort & exact match on `title`
```json
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "title": { "type": "token", "normalizer": "lowercase" }
    }
  }
}
```

### 2. Full-text + sort/exact match on `genres`
```json
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "genres": [
        { "type": "string" },
        { "type": "token" }
      ]
    }
  }
}
```

</section>
<section>
<title>How to Index UUID Fields for Efficient Filtering and Sorting</title>
<url>https://mongodb.com/docs/atlas/atlas-search/field-types/uuid-type/</url>
<description>Use the uuid field type to index UUID values in fields for sorting and filtering.</description>


# Index UUID Fields (Atlas Search)

*Purpose*: Index BSON Binary Subtype 4 UUIDs for filter/sort.

## Create Index

**UI (Visual Editor)**  
Refine Your Index → Field Mappings → Add Field → Customized Configuration → pick `<field-name>` → Data Type = Uuid → Add.

**JSON**
```json
{
  "mappings": {
    "dynamic": true,
    "fields": {
      "<field-name>": { "type": "uuid" }
    }
  }
}
```

## Field Options

| Option | Value | Req. | Notes |
|--------|-------|------|-------|
| type   | uuid  | yes  | must be literal "uuid" |

No other parameters.

</section>
<section>
<title>Define Stored Source Fields in Your Atlas Search Index</title>
<url>https://mongodb.com/docs/atlas/atlas-search/stored-source-definition/</url>
<description>Learn how to store certain fields in Atlas Search to improve query performance and avoid full document lookup.</description>


# Atlas Search `storedSource`

Stores original doc fields for faster queries (not indexed). Requires Atlas cluster MongoDB 5.0.6+ / 6.0+ / 7.0+.

```json
"storedSource": true | false | { "include": ["<field>",…] } | { "exclude": ["<field>",…] }
```

Booleans  
- `true` – store all fields (⬆ index size/latency).  
- `false` (default) – store none.

Objects (mutually exclusive keys)  
- `include`: array of field paths to store; `_id` always stored.  
- `exclude`: array of paths to omit; all other fields stored.

Query retrieval: use `returnStoredSource` (see docs).

Example index snippets:

Store only title & award wins
```json
{
  "mappings": {...},
  "storedSource": { "include": ["title","awards.wins"] }
}
```

Store all except directors & imdb.rating
```json
{
  "mappings": {...},
  "storedSource": { "exclude": ["directors","imdb.rating"] }
}
```

Store entire document
```json
{
  "mappings": {...},
  "storedSource": true
}
```

UI steps: Index → Refine Your Index → Stored Source Fields: choose Specified / All Except Specified / All, add paths, Save.

</section>
<section>
<title>Define Synonym Mappings in Your Atlas Search Index</title>
<url>https://mongodb.com/docs/atlas/atlas-search/synonyms/</url>
<description>Learn how to index and search your collection for words that have the same or nearly the same meaning.</description>


# Atlas Search Synonym Mappings

## Index Definition

```json
{
  "synonyms": [{
    "name": "<mappingName>",          // unique, non-empty
    "source": { "collection": "<col>" }, // same DB as indexed data
    "analyzer": "<atlasAnalyzer>"     // see restrictions
  }],
  "mappings": { ... }                // 1 synonym mapping per index
}
```

Constraints  
• Queries must use the `text` operator and target fields analyzed with the **same analyzer**.  
• Stop words: either index with `lucene.standard` or omit the stop word from `synonyms`.  
• Unsupported analyzers/tokenizers/filters: `lucene.kuromoji`, `lucene.cjk`, nGram/edgeGram tokenizers & filters, `daitchMokotoffSoundex`, `shingle`, `wordDelimiterGraph`.

## Synonym Source Collection

Each document describes one mapping. Free/shared clusters: ≤10 000 docs.

```jsonc
{
  "mappingType": "equivalent" | "explicit", // required
  "input": ["<t1>", ...],   // required for explicit
  "synonyms": ["<s1>", ...] // ≥1 value
}
```

mappingType  
• `equivalent`: every token in `synonyms` matches every other.  
• `explicit`: tokens in `input` expand to all `synonyms`; reverse not implied.

Other fields are ignored. Invalid docs block index creation. Atlas Search auto-detects collection changes; update latency grows with collection size.

## Example Source Docs

```json
{ "mappingType": "equivalent", "synonyms": ["car","vehicle","automobile"] }
{ "mappingType": "explicit",   "input": ["beer"], "synonyms": ["beer","brew","pint"] }
```

## Example Indexes (`sample_mflix.movies`)

Static mapping with English analyzer:

```json
{
  "mappings": {
    "dynamic": false,
    "fields": { "plot": { "type": "string", "analyzer": "lucene.english" } }
  },
  "synonyms": [{
    "name": "my_synonyms",
    "analyzer": "lucene.english",
    "source": { "collection": "synonymous_terms" }
  }]
}
```

Dynamic mapping (all fields, Standard analyzer):

```json
{
  "mappings": { "dynamic": true },
  "synonyms": [{
    "name": "my_synonyms",
    "analyzer": "lucene.standard",
    "source": { "collection": "synonymous_terms" }
  }]
}
```

## Operational Notes

• Source collection must be in same DB.  
• Add/modify synonym docs → no reindex needed.  
• Storage counts toward cluster quota; larger sets increase compute usage.

</section>
<section>
<title>Configure Index Partition</title>
<url>https://mongodb.com/docs/atlas/atlas-search/index-partition/</url>
<description>Partition the Atlas Search index to support more index objects.</description>


# Configure Index Partition

• Counting: 1 top-level document = 1 index object. Each embedded level adds objects. Replication halts and index becomes `STALE` if total objects ≥ 2,100,000,000.

• Partitioning (dedicated search nodes only) splits an index into sub-indexes (`numPartitions` per shard).  
  – Default 1 partition (≈2 B objects).  
  – Allowed values: 1, 2, 4, 8, 16, 32, 64 (max ≈64 × 2 B objects/shard).  
  – Atlas auto-distributes data; queries scatter to all partitions and merge results.  
  – Modifying `numPartitions` forces full rebuild.  
  – Clusters with >1 partition cannot revert to co-located `mongod` + `mongot`.

Recommended to partition when:  
  – Index objects ≥ 50 % of 2.1 B limit.  
  – Collection ≥ 2 B docs.  
  – Index status is `STALE`.

## Definition Syntax
```json
{
  "mappings": { "dynamic": true },
  "numPartitions": <1|2|4|8|16|32|64>
}
```

## Node.js Example (4 partitions)
```javascript
import { MongoClient } from "mongodb";

const uri = "<connection-string>";
const client = new MongoClient(uri);

async function run() {
  const coll = client.db("sample_mflix").collection("movies");
  const index = {
    name: "partitioned_index",
    definition: {
      mappings: { dynamic: true },
      numPartitions: 4
    }
  };
  console.log(await coll.createSearchIndex(index));
  await client.close();
}
run().catch(console.dir);
```

</section>
<section>
<title>Query Reference</title>
<url>https://mongodb.com/docs/atlas/atlas-search/query-ref/</url>

# Atlas Search Query Reference

**Stages (must be pipeline 1):**  
- `$search` → result docs  
- `$searchMeta` → result metadata  

**Operators:** use inside stages; `compound` (must/should/mustNot/filter) preferred over post-`$match`.

**Routing:**  
1. Query → `mongod`/`mongos` (readPref).  
2. Replica: `mongod` → local `mongot`.  
3. Sharded: `mongos` → all shards (scatter-gather) unless zones restrict.  
4. `mongot` returns docIds/meta → `mongod` fetches docs.  
`concurrent` option enables intra-query parallelism.

**Scoring:** TF-IDF; results sorted by score; boost/decay supported.

**Clients:** Search Tester, `mongosh`, Compass, drivers.

**Troubleshooting**  
Empty result if:  
- Index absent (`default` assumed); set `index`.  
- `path` unindexed; enable dynamic mapping.  
- `text` on field not indexed as `string`.  

`PlanExecutor` error if field indexed with wrong type (e.g., facet). Re-index with correct type (`stringFacet`, `number`, `date`, …).

</section>
<section>
<title>Choose the Aggregation Pipeline Stage</title>
<url>https://mongodb.com/docs/atlas/atlas-search/query-syntax/</url>
<description>Learn how to use the $search aggregation pipeline stage to perform a full text search, and the $searchMeta aggregation pipeline stage to return metadata result documents.</description>


# Atlas Search Aggregation Stages

First stage (required):
- `$search` → documents + metadata (facets OK)
- `$searchMeta` → metadata only (counts, facets)

Typical follow-ups: `$limit`, `$skip`, `$project`, `$addFields`, `$facet`, `$match`, `$group`, `$lookup`.

Performance: apply `$limit`, paginate, page after a reference point.

</section>
<section>
<title>$search</title>
<url>https://mongodb.com/docs/atlas/atlas-search/aggregation-stages/search/</url>
<description>Learn about the Atlas Search $search stage syntax and options.</description>


# $search

```jsonc
{
  $search: {
    index: "default"|"<name>",          // optional
    <operator>|<collector>: { … },      // one required
    highlight: { … },
    concurrent: true|false,             // default false
    count: { … },
    searchAfter|searchBefore: "<base64>", // pagination, mutually exclusive
    scoreDetails: true|false,
    sort: { field: 1|-1, … },
    returnStoredSource: true|false,
    tracking: { … }
  }
}
```

Key fields  
- index: Atlas Search index.  
- <operator>: query operator; or use <collector>.  
- concurrent: segment-level parallelism on search nodes.  
- count: return total hits.  
- highlight: return term context.  
- returnStoredSource: skip DB lookup, return stored fields only.  
- searchAfter / searchBefore: Base64 token from `$meta:"searchSequenceToken"`.  
- scoreDetails: expose via `$project: {score: {$meta:"searchScoreDetails"}}`.  
- sort: by date/number/string.  
- tracking: analytics.

Behavior  
- Must be the pipeline’s first stage.  
- Disallowed in view definitions and inside `$facet`.  
- Metadata stored in `$$SEARCH_META`; usable after `$search` except after `$lookup`, `$unionWith`, or (MongoDB 6+) `$searchMeta`.

Node.js example
```js
await db.collection('movies').aggregate([
  {
    $search: {
      near: {
        path: "released",
        origin: new Date("2011-09-01"),
        pivot: 7776000000
      }
    }
  },
  {$project:{_id:0,title:1,released:1}},
  {$limit:5},
  {$facet:{
     docs: [],
     meta:[
       {$replaceWith:"$$SEARCH_META"},
       {$limit:1}
     ]
  }}
]).toArray();
```

Troubleshoot via Atlas docs.

</section>
<section>
<title>$searchMeta</title>
<url>https://mongodb.com/docs/atlas/atlas-search/aggregation-stages/searchMeta/</url>
<description>Learn about the Atlas Search $searchMeta stage syntax and options.</description>


# `$searchMeta`

### Syntax
```jsonc
{
  $searchMeta: {
    index: "<index-name>",        // optional, default "default"
    "<collector-name>|<operator>": { ... }, // one required
    count: { ... }                // optional
  }
}
```
• Collector: only `"facet"` supported.  
• Operator: any Atlas Search operator; `$searchMeta` then returns default `count` metadata.  

### Rules
• Must be the first pipeline stage.  
• Sharded clusters require MongoDB 6.0+.  

### Metadata Types
count  – total / lower-bound of matches.  
facet  – `{ <facetName>: [ { id, count } ] }`.  

### Node.js Example
```js
await db.collection('movies').aggregate([
  {
    $searchMeta: {
      range: { path: 'year', gte: 1998, lt: 1999 },
      count: { type: 'total' }
    }
  }
]).toArray();
// → [ { count: { total: Long("552") } } ]
```

### Troubleshoot
For errors, see “Troubleshoot Queries”.

</section>
<section>
<title>Operators and Collectors</title>
<url>https://mongodb.com/docs/atlas/atlas-search/operators-and-collectors/</url>
<description>Learn how to perform specific types of searches on your collection and how to group your query results with the $search and $searchMeta aggregation pipeline stages.</description>


# Operators and Collectors

## Operators (`$search`, `$searchMeta`)
- autocomplete – search-as-you-type; type: autocomplete  
- compound – boolean/score combiner; types = inner ops  
- embeddedDocument – query array-embedded docs; types = inner ops  
- equals – exact match incl. null; types: boolean | date | objectId | number | token | uuid  
- exists – field presence; any type  
- geoShape – shape intersection; type: geo  
- geoWithin – point-in-shape; type: geo  
- in – single/array membership; types: boolean | date | objectId | number | token | uuid  
- knnBeta (deprecated) – HNSW semantic; type: knnVector  
- moreLikeThis – similarity; type: string  
- near – proximity to number/date/geo point; types: number | date | geo point  
- phrase – ordered terms; type: string  
- queryString – Lucene syntax; type: string  
- range – numeric/date/string/objectId range; types: number | date | token | objectId  
- regex – regex match; type: string  
- span (deprecated) – positional constraints; type: string  
- text – analyzed text search; type: string  
- wildcard – ? * pattern; type: string  

## Collectors
- facet – group & count by value/range; types: date | number | stringFacet

</section>
<section>
<title>autocomplete</title>
<url>https://mongodb.com/docs/atlas/atlas-search/autocomplete/</url>
<description>Use the autocomplete operator to predict words as you type.</description>


# autocomplete

Performs prefix search on fields indexed as `type:"autocomplete"`. Inefficient for >3-word queries.

## Syntax
```javascript
{
  $search: {
    index:"<name>",          // default "default"
    autocomplete:{
      query:"<string|[strings]>", // required
      path:"<field>",            // single, autocomplete-indexed
      tokenOrder:"any"| "sequential", // default any
      fuzzy:{maxEdits:1|2, prefixLength:int, maxExpansions:int},
      score:{boost|constant|function}
    }
  }
}
```

## Key Rules
* `path` cannot be wildcard/multi/array.
* `tokenOrder`
  * any – order irrelevant (seq hits score higher).
  * sequential – tokens must appear adjacent/in order.
* Fuzzy defaults: `{maxEdits:2,prefixLength:0,maxExpansions:50}`.
* Scoring: exact matches can rank lower; boost by also indexing field as `string` and query via `compound`.

## Node.js Examples

### Basic
```javascript
const agg=[
  {$search:{autocomplete:{query:"off",path:"title"}}},
  {$limit:10},{$project:{_id:0,title:1}}
];
db.collection("movies").aggregate(agg);
```

### Fuzzy
```javascript
{$search:{autocomplete:{query:"pre",path:"title",
  fuzzy:{maxEdits:1,prefixLength:1,maxExpansions:256}}}}
```

### Token Order
Sequential prefix search:
```javascript
{$search:{autocomplete:{query:"Fast &",path:"title",tokenOrder:"sequential"}}}
```
Any-order:
```javascript
{$search:{autocomplete:{query:"men with",path:"title",tokenOrder:"any"}}}
```

### Highlight
```javascript
{$search:{autocomplete:{query:"ger",path:"title"},
          highlight:{path:"title"}}},
{$project:{_id:0,title:1,score:{$meta:"searchScore"},
           highlights:{$meta:"searchHighlights"}}}
```

### Multiple Fields (compound)
```javascript
{$search:{compound:{should:[
  {autocomplete:{query:"inter",path:"title"}},
  {autocomplete:{query:"inter",path:"plot"}}],
  minimumShouldMatch:1}}}
```

### Facet Buckets
```javascript
{$searchMeta:{facet:{
  operator:{autocomplete:{query:"Gravity",path:"title"}},
  facets:{titleFacet:{type:"string",path:"title"}}
}}}
```

## Indexing Tips
Example `edgeGram`:
```json
"title":[
  {"type":"stringFacet"},
  {"type":"string"},
  {"type":"autocomplete","tokenization":"edgeGram","minGrams":3,"maxGrams":7}
]
```
Other tokenizations: `rightEdgeGram`, `nGram`.

Set `foldDiacritics:true` for case/diacritic folding.

## Limitations
* No wildcard paths.
* Not designed for >3 terms.
* Highlight only works if path used solely by autocomplete in query.

</section>
<section>
<title>compound</title>
<url>https://mongodb.com/docs/atlas/atlas-search/compound/</url>
<description>Use the compound operator to combine multiple operators in a single query and get results with a match score.</description>


# compound

Combine multiple Atlas Search operators.

```javascript
{
  $search: {
    index: <index|optional>,
    compound: {
      must|mustNot|should|filter: [ {<sub-queries>} ],
      minimumShouldMatch: <int>, // ≤ #should, defaults 0
      score: { <boost|constant|function> } // optional
    }
  }
}
```

Clauses  
• must – all must match. Score = Σ subquery scores. (AND)  
• mustNot – none may match. No score. (AND NOT)  
• should – prefer to match. Score = Σ subquery scores. (OR).  
  • If query contains only should, ≥1 must match even if minimumShouldMatch=0.  
• filter – all must match; ignored in scoring.  

Scoring  
Only must/should contribute; score option can boost or replace total.

Performance  
Put non-scoring operators (equals, range, in) in filter; to OR filters, nest should inside filter.

## Node.js Examples

must + mustNot
```javascript
db.fruit.aggregate([
  {$search:{compound:{
    must:[{text:{query:"varieties",path:"description"}}],
    mustNot:[{text:{query:"apples",path:"description"}}]
}}}])
```

must + should (+constant score)
```javascript
db.fruit.aggregate([
  {$search:{compound:{
    must:[{text:{query:"varieties",path:"description"}}],
    should:[{text:{query:"Fuji",path:"description"}}],
    score:{constant:{value:3}} }}},
  {$project:{score:{$meta:"searchScore"}}}])
```

minimumShouldMatch
```javascript
db.fruit.aggregate([
 {$search:{compound:{
   must:[{text:{query:"varieties",path:"description"}}],
   should:[
     {text:{query:"Fuji",path:"description"}},
     {text:{query:"Golden Delicious",path:"description"}}
   ],
   minimumShouldMatch:1
}}}])
```

filter
```javascript
db.fruit.aggregate([
 {$search:{compound:{
   must:[{text:{query:"varieties",path:"description"}}],
   should:[{text:{query:"banana",path:"description"}}],
   filter:[{text:{query:"granny",path:"description"}}]
}}}])
```

$match replacement via filter
```javascript
db.fruit.aggregate([
 {$search:{compound:{
   filter:[{text:{query:["apples","bananas"],path:"description"}}],
   should:[{text:{query:"varieties",path:"description"}}]
}}},
 {$project:{description:1,score:{$meta:"searchScore"}}}])
```

Nested
```javascript
db.fruit.aggregate([
 {$search:{compound:{
   should:[
     {text:{query:"apple",path:"type"}},
     {compound:{must:[
       {text:{query:"organic",path:"category"}},
       {equals:{path:"in_stock",value:true}}
     ]}}
   ],
   minimumShouldMatch:1
}}}])
```

Metadata (`facet` with compound)

```javascript
db.fruit.aggregate([
 {$searchMeta:{facet:{
   operator:{compound:{
     must:[{text:{query:"varieties",path:"description"}}],
     should:[{text:{query:"Fuji",path:"description"}}]}},
   facets:{categoryFacet:{type:"string",path:"category"}}
}}}])
```

</section>
<section>
<title>embeddedDocument</title>
<url>https://mongodb.com/docs/atlas/atlas-search/embedded-document/</url>
<description>Use the embeddedDocuments operator to match a single element of an array of embedded documents with multiple query criteria.</description>


# embeddedDocument

Preview operator for arrays of `embeddedDocuments` (index limit 2.1 B objects → stale). No highlighting on predicates inside operator.

## Syntax
```js
{
  embeddedDocument: {
    path: <string>,          // parent embeddedDocuments field
    operator: <search-operator>, // any except moreLikeThis
    score: { embedded: { aggregate: "sum"|"mean"|"max"|"min" … } } // opt
  }
}
```

## Behavior
1. Score each embedded doc separately.  
2. Combine via `score.embedded.aggregate` (default sum).  
3. Merge with parent; string facets counted per embedded doc.

## Sorting
Sorts parent docs only. To sort by child field: parent indexed as `document`, child `token` (numeric/date via dynamic).

## Highlighting
Allowed on fields indexed under a `document` parent; not on predicates inside operator.

## Node.js Examples
### Basic query & avg score
```js
await db.collection('sales').aggregate([
  {
    $search: {
      embeddedDocument: {
        path: 'items',
        operator: {
          compound: {
            must:[{text:{path:'items.tags',query:'school'}}],
            should:[{text:{path:'items.name',query:'backpack'}}]
          }
        },
        score:{embedded:{aggregate:'mean'}}
      }
    }
  },
  {$limit:5},
  {$project:{_id:0,'items.name':1,'items.tags':1,score:{$meta:'searchScore'}}}
]);
```
### Facet
```js
await db.collection('sales').aggregate([
  {
    $searchMeta:{
      facet:{
        operator:{
          embeddedDocument:{
            path:'items',
            operator:{text:{path:'items.tags',query:'school'}}
          }
        },
        facets:{purchaseMethod:{type:'string',path:'purchaseMethod'}}
      }
    }
  }
]);
```
### Query + sort by child field
```js
await db.collection('sales').aggregate([
  {
    $search:{
      embeddedDocument:{path:'items',operator:{text:{path:'items.name',query:'laptop'}}},
      sort:{'items.tags':1}
    }
  }
]);
```
### Return only matching embedded docs (post-filter)
```js
await db.collection('sales').aggregate([
  {
    $search:{
      embeddedDocument:{
        path:'items',
        operator:{
          compound:{must:[
            {range:{path:'items.quantity',gt:2}},
            {exists:{path:'items.price'}},
            {text:{path:'items.tags',query:'school'}}
          ]}
        }
      }
    }
  },
  {$project:{
    _id:0,
    storeLocation:1,
    items:{
      $filter:{input:'$items',cond:{$and:[
        {$ifNull:['$$this.price',false]},
        {$gt:['$$this.quantity',2]},
        {$in:['school','$$this.tags']}
      ]}}
    }
  }}
]);
```

## Sample Index Mapping
```json
{
  "mappings":{
    "dynamic":true,
    "fields":{
      "items":[
        {"type":"embeddedDocuments","dynamic":true},
        {"type":"document","dynamic":true,"fields":{"tags":{"type":"token"}}}
      ],
      "purchaseMethod":{"type":"stringFacet"}
    }
  }
}
```

</section>
<section>
<title>equals</title>
<url>https://mongodb.com/docs/atlas/atlas-search/equals/</url>
<description>Learn how to find fields whose values match a specific value so that Atlas Search can add those documents to the result set.</description>


# equals

Exact‐value operator for Atlas Search.

Supported value types:  
• boolean • objectId • number (≤15 digits) • date • string (token) • uuid • null  
Arrays match if any element equals value. Precision loss for numbers >15 digits.

Default score = constant 1 (one per matching doc, even in arrays).

## Syntax
```js
{
  $search: {
    index: "<indexName>",   // optional, default "default"
    equals: {
      path: "<field>",      // required, indexed
      value: <supported>,   // required
      score: {              // optional
        boost:<num> | constant:<num> | function:<expr>
      }
    }
  }
}
```

## Quick Node.js Examples

```js
// verified_user === true
await db.collection('users').aggregate([
  { $search:{ equals:{ path:'verified_user', value:true }}},
  { $project:{ _id:0,name:1,score:{ $meta:'searchScore' }}}
]).toArray();

// teammates contains ObjectId
{ $search:{ equals:{ path:'teammates', value:new ObjectId('5a94...') }}}

// account_created equals date
{ $search:{ equals:{ path:'account_created', value:new Date('2022-05-04T05:01:08Z') }}}

// employee_number === 259
{ $search:{ equals:{ path:'employee_number', value:259 }}}

// name == "Jim Hall" (token index w/ lowercase normalizer)
{ $search:{ equals:{ path:'name', value:'jim hall' }}}

// uuid equals given value
{ $search:{ equals:{ path:'uuid', value:UUID('fac32260-b511-4c69-8485-a2be5b7dda9e') }}}

// job_title is null
{ $search:{ equals:{ path:'job_title', value:null }}}
```

## Compound Usage

```js
// region Southwest AND verified_user ≠ false
{
 $search:{
  compound:{
   must:{ text:{ path:'region', query:'Southwest'}},
   mustNot:{ equals:{ path:'verified_user', value:false}}
}}}

// verified_user true AND (teammates has ID OR region Northwest)
{
 $search:{
  compound:{
   must:{ equals:{ path:'verified_user', value:true}},
   should:[
     { equals:{ path:'teammates', value:new ObjectId('5ed6990a...')}},
     { text:{ path:'region', query:'Northwest'}}
   ],
   minimumShouldMatch:1
}}}
```

## Facet / Metadata

```js
// Count regions where verified_user is true
await db.collection('users').aggregate([
 { $searchMeta:{
     facet:{
       operator:{ equals:{ path:'verified_user', value:true }},
       facets:{ regionFacet:{ type:'string', path:'region' }}
}}]).toArray();
```

Returns: `{ count:{lowerBound:2}, facet:{ regionFacet:{ buckets:[{_id:'East',count:1}, …]}}}`

## Index Considerations
• Field in `path` must be indexed.  
• Strings require `type:"token"` (normalizer as needed).  
• Other scalar types auto‐indexed if `dynamic:true`.



</section>
<section>
<title>exists</title>
<url>https://mongodb.com/docs/atlas/atlas-search/exists/</url>
<description>Use the exists operator to test if a path to an indexed field name exists. If it exists but isn't indexed, the document isn't included in the results.</description>


# exists

Tests whether an indexed field path is present in a document. Docs lacking the field or where the field isn’t indexed are excluded. Returns constant score 1 unless overridden.

```javascript
{
  $search: {
    index: "<indexName>",            // optional, default "default"
    exists: {
      path: "<field>",               // required
      score: { <score-opts> }        // optional
    }
  }
}
```

Field options  
• `path` (string, req) – indexed field to test  
• `score` (object, opt) – customize scoring  

## Node.js Examples

Basic – docs with `type` field:
```js
await db.collection('fruit').aggregate([
  { $search: { exists: { path: 'type' } } }
]).toArray();
```

Embedded – docs with `quantities.lemons`:
```js
await db.collection('fruit').aggregate([
  { $search: { exists: { path: 'quantities.lemons' } } }
]).toArray();
```

Compound – `type` exists AND equals "apple"; boost if description has "fuji":
```js
await db.collection('fruit').aggregate([
  { $search: {
      compound: {
        must: [
          { exists: { path: 'type' } },
          { text: { query: 'apple', path: 'type' } }
        ],
        should: [
          { text: { query: 'fuji', path: 'description' } }
        ]
      }
    }}
]).toArray();
```

</section>
<section>
<title>facet</title>
<url>https://mongodb.com/docs/atlas/atlas-search/facet/</url>
<description>Use the facet collector to group results by values or ranges in the specified faceted fields and return the count for each of those groups.</description>


# facet

Definition: `$search` / `$searchMeta` collector that groups matches into buckets and returns counts. Not compatible with `explain`.

Syntax
```js
{
  "$search"|"$searchMeta": {
    index:"<name>",          // optional, default "default"
    facet:{
      operator:{<search-op>},// optional; facet over all docs if omitted
      facets:{
        "<facetName>":{
          type:"string"|"number"|"date",
          path:"<indexedField>",
          // string
          numBuckets:<int<=1000>,
          // number/date
          boundaries:[<asc values>], // ≥2, ≤1000
          default:"<bucketName>"
        }
      }
    }
  }
}
```

Facet result
```js
facet:{
  <facetName>:{
    buckets:[{_id:<bucketKey>,count:<int>}, ...]
  }
}
```
`count.lowerBound` gives total matches.

`$$SEARCH_META` (available only when using `$search`) exposes the above metadata to later pipeline stages.

Limitations
* Single‐field facets only.
* Works on sharded clusters ≥MongoDB 6.0.
* No `explain`.

Node.js Examples

1. String facet (top genres 2000-2015):
```js
const res = await db.collection('movies').aggregate([
  {
    $searchMeta:{
      facet:{
        operator:{range:{path:'year',gte:2000,lte:2015}},
        facets:{
          genresFacet:{type:'string',path:'genres',numBuckets:10}
        }
      }
    }
  }
]).toArray();
```

2. Numeric facet with default bucket (year ranges):
```js
await db.movies.aggregate([
  {$searchMeta:{
    facet:{
      operator:{range:{path:'year',gte:1980,lte:2000}},
      facets:{
        yearFacet:{
          type:'number',
          path:'year',
          boundaries:[1980,1990,2000],
          default:'other'
        }
      }
    }
  }}
]);
```

3. Using `$search` + `$$SEARCH_META` for docs & metadata:
```js
await db.movies.aggregate([
  { $search:{
      facet:{
        operator:{near:{path:'released',origin:new Date('1999-07-01'),pivot:90*24*60*60*1000}},
        facets:{ genresFacet:{type:'string',path:'genres'} }
      }
    }},
  {$limit:2},
  {$facet:{
      docs:[{$project:{title:1,released:1}}],
      meta:[{$replaceWith:'$$SEARCH_META'},{$limit:1}]
    }},
  {$set:{meta:{$arrayElemAt:['$meta',0]}}}
]);
```

Indexing requirements  
`path` fields must be indexed as:  
• string facets → `type:"stringFacet"`  
• numeric → `type:"number"`  
• date → `type:"date"`

Keep parent fields typed `document` when faceting inside nested objects.

</section>
<section>
<title>geoShape</title>
<url>https://mongodb.com/docs/atlas/atlas-search/geoShape/</url>
<description>Learn how to query values with a specified geometric shape.</description>


# geoShape

Query indexed `geo` fields against a GeoJSON shape when the field is mapped with `"indexShapes": true`.

Coordinates: `[lng,lat]`, lng `[-180,180]`, lat `[-90,90]`. Only default CRS (no planar XY, no `[12,34]` point notation).

Atlas Search edges are Cartesian; $geo* in MongoDB uses geodesic/flat → polygon queries may return different docs.

## Syntax
```json
{
  "$search": {
    "index": "<name>",           // optional, default "default"
    "geoShape": {
      "path": "<field|[fields]>", // required
      "relation": "contains|disjoint|intersects|within", // req.
      "geometry": { ... },        // GeoJSON Polygon|MultiPolygon|LineString|Point
      "score": { "boost|constant|function": <num|expr> } // opt.
    }
  }
}
```
`within` not allowed with `LineString` or `Point`.

## Sample mapping
```json
{
  "mappings": {
    "fields": {
      "address.location": { "type": "geo", "indexShapes": true },
      "property_type":    { "type": "stringFacet" }
    }
  }
}
```

## Node.js Examples

Search for docs **within** a polygon (NY area):
```js
const res = await db.collection('listingsAndReviews').aggregate([
  {
    $search: {
      geoShape: {
        path: "address.location",
        relation: "within",
        geometry: {
          type: "Polygon",
          coordinates: [[
            [-74.3994,40.5305],[-74.7729,40.9467],
            [-72.3559,40.7971],[-74.3994,40.5305]
          ]]
        }
      }
    }
  },
  {$project:{_id:0,name:1,address:1,score:{$meta:"searchScore"}}},
  {$limit:3}
]).toArray();
```

Get facet counts with `$searchMeta`:
```js
const meta = await db.collection('listingsAndReviews').aggregate([
  {
    $searchMeta: {
      facet: {
        operator: {
          geoShape: {
            path: "address.location",
            relation: "within",
            geometry: { type:"Polygon", coordinates:[/* same as above */] }
          }
        },
        facets: {
          propertyTypeFacet: { type:"string", path:"property_type" }
        }
      }
    }
  }
]).toArray();
```

Other relation variants—replace `"within"` with:

- `"disjoint"` to return docs with no overlap.
- `"intersects"` for any intersection.
- `"contains"` when indexed geometry fully contains the query shape.



</section>
<section>
<title>geoWithin</title>
<url>https://mongodb.com/docs/atlas/atlas-search/geoWithin/</url>
<description>Learn how to query points within a specified geometric shape.</description>


# geoWithin

Supports returning indexed `Point` docs inside a GeoJSON shape (`box`, `circle`, or `geometry`).  
Coords: `[lon, lat]`, lon −180‒180, lat −90‒90. No CRS change, 2D, or point-pair notation.

## Pipeline Syntax
```javascript
{
 $search: {
  index: <opt index>,
  geoWithin: {
   path: "<geo field | [fields]>",
   box|circle|geometry: <shape>,
   score: { boost|constant|function }
  }
 }
}
```

## Shape Objects
* box: `{ bottomLeft: {type:"Point",coordinates:[lon,lat]}, topRight:{...} }`
* circle: `{ center:{type:"Point",coordinates:[lon,lat]}, radius:<m≥0> }`
* geometry: GeoJSON `Polygon|MultiPolygon` (closed loop). Atlas uses Cartesian edges; 2dsphere results can differ.

`path` required; one of `box|circle|geometry` required.

## Minimal Index Example
```json
{
 "mappings":{
  "fields":{
   "address":{"type":"document","fields":{
     "location":{"type":"geo"}
   }},
   "property_type":{"type":"stringFacet"}
 }}
}
```

## Node.js Samples
### Box
```javascript
const agg=[
 { $search:{ geoWithin:{
   path:"address.location",
   box:{ bottomLeft:{type:"Point",coordinates:[112.467,-55.050]},
         topRight :{type:"Point",coordinates:[168.000,-9.133]} }}}},
 { $limit:3},{ $project:{_id:0,name:1,address:1}}];
```

### Circle (1 mi ≈ 1600 m)
```javascript
const agg=[
 { $search:{ geoWithin:{
   path:"address.location",
   circle:{ center:{type:"Point",coordinates:[-73.54,45.54]}, radius:1600 }}}},
 { $limit:3},{ $project:{_id:0,name:1,address:1}}];
```

### Polygon + Preference
```javascript
const poly=[[[-161.323242,22.512557],[-152.446289,22.065278],
             [-156.09375,17.811456],[-161.323242,22.512557]]];
const agg=[
 { $search:{ index:"<INDEX>",
   compound:{ must:[{ geoWithin:{ path:"address.location",
                                  geometry:{type:"Polygon",coordinates:[poly]}}}],
              should:[{ text:{path:"property_type",query:"Condominium"}}]}}},
 { $limit:10},
 { $project:{_id:0,name:1,address:1,property_type:1,
             score:{$meta:"searchScore"}}}];
```

### MultiPolygon
```javascript
const mp=[[[[-157.8412413882,21.2882235819],[-157.8607925468,21.2962046205],
            [-157.8646640634,21.3077019651],[-157.862776699,21.320776283],
            [-157.8341758705,21.3133826738],[-157.8349985678,21.3000822569],
            [-157.8412413882,21.2882235819]]],
          [[[-157.852898124,21.301208833],[-157.8580050499,21.3050871833],
            [-157.8587346108,21.3098050385],[-157.8508811028,21.3119240258],
            [-157.8454308541,21.30396767],[-157.852898124,21.301208833]]]];
const agg=[
 { $search:{ geoWithin:{ path:"address.location",
                         geometry:{type:"MultiPolygon",coordinates:mp}}}},
 { $limit:3},{ $project:{_id:0,name:1,address:1}}];
```

</section>
<section>
<title>in</title>
<url>https://mongodb.com/docs/atlas/atlas-search/in/</url>
<description>Perform a search for a single or array of numeric, date, boolean, objectID, or string values.</description>


# in

Matches docs where `path` equals any `value`; if field is array, match when any element equals any supplied value. Supported BSON: number, date, boolean, objectId, uuid, string.

```json
{
  $search: {
    index?: "<name>",            // default "default"
    in: {
      path: "<field|wildcard>",  // required, token-indexed for strings
      value: <scalar|[values]>,  // required, one BSON type only
      score?: {                  // optional
        boost: <num> | constant: <num> | function: <expr>
      }
    }
  }
}
```

## Node.js Examples

```js
// single-value field
await db.collection('customers').aggregate([
  {$search:{in:{path:'birthdate',value:[
    new Date('1977-03-02'),
    new Date('1977-03-01'),
    new Date('1977-05-06')
  ]}}},
  {$project:{_id:0,name:1,birthdate:1}}
]);

// array field
await db.collection('customers').aggregate([
  {$search:{in:{path:'accounts',value:[371138,371139,371140]}}},
  {$project:{_id:0,name:1,accounts:1}}
]);

// compound must/should
await db.collection('customers').aggregate([
  {$search:{compound:{
    must:[{in:{path:'name',value:['james sanchez','jennifer lawrence']}}],
    should:[{in:{path:'_id',value:[
      new ObjectId('5ca4bbcea2dd94ee58162a72'),
      new ObjectId('5ca4bbcea2dd94ee58162a91')
    ]}}]
  }}},
  {$limit:5},
  {$project:{_id:1,name:1,score:{$meta:'searchScore'}}}
]);

// facet counts
await db.collection('customers').aggregate([
  {$searchMeta:{facet:{
    operator:{in:{path:'active',value:null}},
    facets:{birthdateFacet:{
      type:'date',path:'birthdate',
      boundaries:[
        new Date('1970-01-01'),
        new Date('1980-01-01'),
        new Date('1990-01-01'),
        new Date('2000-01-01')
      ],
      default:'other'
    }}
  }}}
]);
```

</section>
<section>
<title>knnBeta</title>
<url>https://mongodb.com/docs/atlas/atlas-search/knn-beta/</url>
<description>Explore the deprecated `knnBeta` operator for semantic search using the Hierarchical Navigable Small Worlds algorithm in Atlas Search.</description>


# knnBeta (Deprecated)

Use vectorSearch index + $vectorSearch stage instead.  
knnBeta runs HNSW k-NN on fields indexed as `knnVector`.

```jsonc
{
  $search: {
    index: "default",          // opt.
    knnBeta: {
      vector: [/* dbl|int */], // req. size == field dimensions
      path: "field",           // req. knnVector field
      k:  N,                   // req. neighbors to compute
      filter: {...},           // opt. any $search filter
      score: {...}             // opt. score opts
    }
  }
}
```

Options (req = required)  
• vector (req) – numeric array  
• path (req) – indexed knnVector field  
• k (req) – neighbors to consider; set > $limit for better recall  
• filter (opt) – any Atlas Search filter operator  
• score (opt) – scoring config

Behavior / Limits  
• Works only on knnVector fields; must be top-level operator (cannot nest in compound, embeddedDocument, facet).  
• Not usable with vectorSearch indexes, `$search` sort, or cursor pagination (`$skip`+`$limit`).  
• Score ∈ [0,1]; cosine & dotProduct normalized: `(1 + sim(v1,v2)) / 2`.  
• For speed, `$project` needed; exclude vector field.

Example (Node.js driver)

```js
const pipeline = [
  {
    $search: {
      knnBeta: {
        vector: queryVector,
        path: "plot_embedding",
        k: 150
      }
    }
  },
  { $limit: 50 },
  {
    $project: {
      _id: 0,
      title: 1,
      plot: 1,
      score: { $meta: "searchScore" }
    }
  }
];

const docs = await db.collection("embedded_movies").aggregate(pipeline).toArray();
```

With filter:

```js
const pipeline = [
  {
    $search: {
      knnBeta: {
        vector: queryVector,
        path: "plot_embedding",
        k: 5,
        filter: {
          range: { path: "released", lte: new Date("1971-06-30") }
        }
      }
    }
  },
  {
    $project: {
      _id: 0,
      title: 1,
      released: 1,
      score: { $meta: "searchScore" }
    }
  }
];

const docs = await db.collection("embedded_movies").aggregate(pipeline).toArray();
```

Tuning: k ≈ (5–10) × limit for recall-latency trade-off.

</section>
<section>
<title>moreLikeThis</title>
<url>https://mongodb.com/docs/atlas/atlas-search/morelikethis/</url>
<description>Learn how to search for similar or alternative results based on one or more documents.</description>


# moreLikeThis

## Limits
- Strings only; combine with other operators for non-strings.  
- Not allowed inside `embeddedDocument`.

## Behavior
- Extracts top terms from `like` docs → OR query.  
- Honors index analyzers; all analyzers unioned if multi.  
- `explain` reveals generated disjunction.

## Syntax
```javascript
{
  $search: {
    index: "default",          // optional
    moreLikeThis: {
      like: [ <BSON doc>, ... ], // ≥1
      score: { boost|constant|function }
    }
  }
}
```

Option | Type | Req | Notes
---|---|---|---
like | doc \| [doc] | ✔ | Source docs
score | obj |  | boost, constant, or function

## Pattern
1. Fetch doc(s).  
2. Pass to `moreLikeThis.like`.  
3. To hide originals: `compound.must` = `moreLikeThis`; `compound.mustNot` = `equals` on `_id`.

## Node.js Examples
### Similar by title & genre
```javascript
await movies.aggregate([
  { $search: { moreLikeThis: { like:{ title:"The Godfather", genres:"action" } } } },
  { $limit:5 },
  { $project:{ _id:0, title:1, released:1, genres:1 } }
]).toArray();
```

### Exclude seed doc
```javascript
const seed = await movies.find({ title:"The Godfather" })
                         .project({ title:1, genres:1 }).toArray();

await movies.aggregate([
  { $search:{
      compound:{
        must:[{ moreLikeThis:{ like:seed } }],
        mustNot:[{ equals:{ path:"_id",
                            value:new ObjectId("573a1396f29313caabce4a9a") } }]
      } } },
  { $limit:5 },
  { $project:{ title:1, genres:1 } }
]).toArray();
```

### Multiple analyzers
Index excerpt:
```json
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "title": {
        "type":"string","analyzer":"lucene.standard",
        "multi":{"keywordAnalyzer":{"type":"string","analyzer":"lucene.keyword"}}
      },
      "genres":{ "type":"string" },
      "_id":{ "type":"objectId" }
    }
  },
  "analyzer":"lucene.english"
}
```

Query:
```javascript
const seed = await movies.find({ title:"Alice in Wonderland" })
                         .project({ title:1, genres:1 }).toArray();

await movies.aggregate([
  { $search:{
      compound:{
        should:[{ moreLikeThis:{ like:seed } }],
        mustNot:[{ equals:{ path:"_id",
                            value:new ObjectId("573a1394f29313caabcde9ef") } }]
      } } },
  { $limit:10 },
  { $project:{ title:1, genres:1 } }
]).toArray();
```
Use `explain("queryPlanner")` on the pipeline to inspect generated OR terms.

</section>
<section>
<title>near</title>
<url>https://mongodb.com/docs/atlas/atlas-search/near/</url>
<description>Learn how to search near a numeric, date, or GeoJSON point value.</description>


# near

Cannot query numeric/date **arrays**; use `range`.

Operator finds numbers (int32/64/double), ISODate, or GeoJSON Point closest to `origin`, scoring by  
score = pivot / (pivot + distance) ∈ [0,1].

```js
{
  $search:{
    index:"<name>",   // default "default"
    near:{ path, origin, pivot, score }
  }
}
```

Field summary  
- path: string | [string] (req)  
- origin: number | Date | {type:"Point",coordinates:[lng,lat]} (req)  
- pivot: >0 number; units ‑ number, ms, meters (req)  
- score: {boost|constant|function} (opt)  

## Number

```js
await db.collection("movies").aggregate([
  {$search:{index:"runtimes",near:{path:"year",origin:2000,pivot:2}}},
  {$limit:7},
  {$project:{_id:0,title:1,runtime:1,score:{$meta:"searchScore"}}}
])
```

Facet meta:

```js
await movies.aggregate([
 {$searchMeta:{facet:{
   operator:{near:{path:"runtime",origin:279,pivot:2}},
   facets:{yearFacet:{type:"number",path:"year",boundaries:[2000,2005,2010,2015]}}
 }}}
])
```

## Date

Index:

```json
{"mappings":{"dynamic":false,"fields":{"released":{"type":"date"}}}}
```

Query:

```js
await movies.aggregate([
 {$search:{index:"releaseddate",
   near:{path:"released",origin:new Date("1915-09-13"),pivot:7776000000}}},
 {$limit:3},
 {$project:{_id:0,title:1,released:1,score:{$meta:"searchScore"}}}
])
```

## Geo

Index:

```json
{"mappings":{"fields":{"address":{"type":"document","fields":{"location":{"type":"geo"}}},"property_type":{"type":"string"}}}}
```

Basic:

```js
await listings.aggregate([
 {$search:{near:{path:"address.location",
   origin:{type:"Point",coordinates:[-8.61308,41.1413]},pivot:1000}}},
 {$limit:3},
 {$project:{_id:0,name:1,address:1,score:{$meta:"searchScore"}}}
])
```

Compound:

```js
await listings.aggregate([
 {$search:{compound:{
   must:{text:{query:"Apartment",path:"property_type"}},
   should:{near:{path:"address.location",
     origin:{type:"Point",coordinates:[114.15027,22.28158]},pivot:1000}}
 }}},
 {$limit:3},
 {$project:{_id:0,property_type:1,address:1,score:{$meta:"searchScore"}}}
])
```

</section>
<section>
<title>phrase</title>
<url>https://mongodb.com/docs/atlas/atlas-search/phrase/</url>
<description>Learn how search documents for terms in the exact or a similar order to your query.</description>


# phrase

Performs ordered-term search using the field’s analyzer (default: standard).

```jsonc
{
  $search: {
    index: "<name|default>",
    phrase: {
      query: "<string|[strings]>",      // required
      path: "<field|[fields]>",         // required
      slop: <int>,                      // default 0
      score: { boost|constant|function },
      synonyms: "<mapping-name>"
    }
  }
}
```

Key rules  
• path must be indexed as string with `indexOptions: positions|offsets`.  
• score modifies the Lucene score; arrays return one score regardless of matches.  
• synonyms value must match a synonym mapping in the index.

## Node.js usage

Single phrase
```js
await db.collection('movies').aggregate([
  { $search: { phrase: { path: 'title', query: 'new york' } } },
  { $limit: 10 },
  { $project: { _id: 0, title: 1, score: { $meta: 'searchScore' } } }
]);
```

Multiple phrases
```js
await db.collection('movies').aggregate([
  { $search: { phrase: { path: 'title', query: ['the man', 'the moon'] } } }
]);
```

Slop
```js
await db.collection('movies').aggregate([
  { $search: { phrase: { path: 'title', query: 'men women', slop: 5 } } }
]);
```

Synonyms
```js
await db.collection('movies').aggregate([
  { $search: { phrase: { path: 'plot', query: 'automobile race', slop: 5, synonyms: 'my_synonyms' } } },
  { $limit: 5 },
  { $project: { _id: 0, plot: 1, title: 1, score: { $meta: 'searchScore' } } }
]);
```

Facet with $searchMeta (example)
```js
await db.collection('movies').aggregate([
  { $searchMeta: {
      facet: {
        operator: { phrase: { path: 'title', query: 'new york' } },
        facets: {
          yearFacet: { type: 'number', path: 'year', boundaries: [2000, 2005, 2010, 2015] }
        }
      }
    } }
]);
```

</section>
<section>
<title>queryString</title>
<url>https://mongodb.com/docs/atlas/atlas-search/queryString/</url>
<description>Learn how to query a combination of indexed fields and values.</description>


# queryString

```javascript
{
  $search: {
    index: <index>,          // default: "default"
    queryString: {
      defaultPath: "<field>", // required
      query: "<lucene style query>",
      score: {                // optional
        boost: <num>,
        constant: <num>,
        function: <expr>
      }
    }
  }
}
```

## Query Grammar
- Boolean: `AND`, `OR`, `NOT`
- Grouping: `()`
- Range: `field:[low TO high]`  
  `[]` inclusive, `{}` exclusive, `[}` or `{]` half-open
- Wildcards: `?` single char, `*` ≥0 chars (cannot begin term)
- Regex: `/pattern/`
- Fuzzy / Proximity: `term~n` (`n≤2`)  
  single term → `maxEdits`, multi-term → `slop`

## Field Options
| Field        | Type   | Req | Notes                                                                 |
|--------------|--------|-----|-----------------------------------------------------------------------|
| defaultPath  | string | ✔   | Field searched when a term lacks a field prefix                       |
| query        | string | ✔   | Lucene query string (supports above grammar)                          |
| score        | object |     | boost/constant/function; array matches scored once per doc            |

## Node.js Aggregation Examples

Boolean:
```javascript
db.movies.aggregate([
  {
    $search: {
      queryString: {
        defaultPath: "title",
        query: "Rocky AND (IV OR 4 OR Four)"
      }
    }
  },
  { $project: { _id: 0, title: 1 } }
])
```

Range + Boolean:
```javascript
db.movies.aggregate([
  {
    $search: {
      queryString: {
        defaultPath: "plot",
        query: "title:[man TO men] AND genres:Drama"
      }
    }
  },
  { $project: { _id: 0, title: 1, genres: 1 } }
])
```

Wildcard:
```javascript
db.movies.aggregate([
  {
    $search: {
      queryString: {
        defaultPath: "title",
        query: "cou*t?*"
      }
    }
  },
  { $project: { _id: 0, title: 1 } }
])
```

Fuzzy:
```javascript
db.movies.aggregate([
  {
    $search: {
      queryString: {
        defaultPath: "title",
        query: "catch~2"
      }
    }
  },
  { $project: { _id: 0, title: 1 } }
])
```

Regex:
```javascript
db.movies.aggregate([
  {
    $search: {
      queryString: {
        defaultPath: "title",
        query: "/.tal(y|ian)/"
      }
    }
  },
  { $project: { _id: 0, title: 1 } }
])
```

Faceted metadata:
```javascript
db.movies.aggregate([
  {
    $searchMeta: {
      facet: {
        operator: {
          queryString: {
            defaultPath: "title",
            query: "\"Marvel\" OR \"Avengers\" OR \"Iron Man\" OR \"Captain America\""
          }
        },
        facets: {
          yearFacet: {
            type: "number",
            path: "year",
            boundaries: [1990, 2000, 2005, 2010, 2015, 2020]
          }
        }
      }
    }
  }
])
```

Notes:
- Leading `*` wildcard not allowed.
- Fuzzy search limited to edit distance ≤2.
- When multiple array elements match, score is not cumulative.

</section>
<section>
<title>range</title>
<url>https://mongodb.com/docs/atlas/atlas-search/range/</url>
<description>Learn how to query values within a specific numeric, date, or string range.</description>


# range

Supports numeric (`int32|int64|double`), `date`, `string` (indexed as `token`), and `objectId` values.

```js
{
  $search: {
    index: <opt>,
    range: {
      path: "<field|[fields]>",
      gt|gte: <val>,      // optional
      lt|lte: <val>,      // optional
      score: {            // optional
        boost: <num> | constant: <num> | function: <expr>
      }
    }
  }
}
```

Type rules  
• `date`: ISODate.  
• `string`: field must be mapped as `token`.  
• `objectId`: field mapped as `objectId` or `dynamic:true`.

---

## Node.js examples

```js
// 1. Number: runtime ∈ [2,3]
await movies.aggregate([
  { $search: { range:{ path:"runtime", gte:2, lte:3 } } },
  { $project:{ _id:0,title:1,runtime:1 } }
]);

// 2. Date: released 2010-2015
await movies.aggregate([
  { $search: { range:{ path:"released",
                       gt:new Date("2010-01-01"),
                       lt:new Date("2015-01-01") } } },
  { $project:{ _id:0,title:1,released:1 } }
]);

// 3. ObjectId span
await movies.aggregate([
  { $search:{ range:{ path:"_id",
                      gte:new ObjectId("573a1396f29313caabce4a9a"),
                      lte:new ObjectId("573a1396f29313caabce4ae7") } } },
  { $project:{ _id:1,title:1 } }
]);

// 4. String token range: titles (city, country)
await movies.aggregate([
  { $search:{ range:{ path:"title", gt:"city", lt:"country" } } },
  { $project:{ _id:0,title:1 } }
]);

// 5. $searchMeta facet on runtime buckets
await movies.aggregate([
  { $searchMeta:{
      facet:{
        operator:{ range:{ path:"runtime", gte:2,lte:3 } },
        facets:{ yearFacet:{
          type:"number", path:"year",
          boundaries:[1990,2000,2010,2020] } }
}}]);
```

Index notes  
Dynamic mapping suffices for examples except the string case, which needs:

```json
{
  "mappings": {
    "dynamic": false,
    "fields": { "title": { "type": "token", "normalizer": "lowercase" } }
  }
}
```

Score for arrays: matching array elements share one score.

</section>
<section>
<title>regex</title>
<url>https://mongodb.com/docs/atlas/atlas-search/regex/</url>
<description>Learn how to use a regular expression in your Atlas Search query.</description>


# regex

## Syntax
```javascript
{
  $search: {
    index: "<name>",            // default "default"
    regex: {
      query: "<regex>",         // string | [string]
      path: "<field>",          // string | [string]
      allowAnalyzedField: bool, // default false
      score: { boost|constant|function }
    }
  }
}
```

## Options
| field | type | req | note |
|-------|------|-----|------|
| query | str\|[str] | ✓ | PCRE-subset, whole-term match |
| path  | str\|[str] | ✓ | supports wildcard |
| allowAnalyzedField | bool |  | set true to query analyzed field (may surprise) |
| score | obj |  | `boost`, `constant`, `function` |

## Behavior
• Term-level: query not analyzed.  
• Prefer `lucene.keyword`; lowercase analyzers break case-sensitive matches.  
• Uses Lucene regex engine (differs from PCRE).  
• Must match entire indexed term; `^`, `$` unsupported.

## Reserved chars
`. ? + * | { } [ ] ( ) < > " \ @ #` → escape with `\` (`\\` in JSON/mongosh).  
Literal `*`: `"*\\**"`; literal `\`: `"*\\\\*"`.

## Supported operators
`. ? + * | {n} () [] [^] [a-z] [0-9] <n-m> #` (empty lang). Anchors `^` `$` unsupported.

## Node.js example
```javascript
await db.collection('movies').aggregate([
  {
    $search: {
      regex: {
        path: 'title',
        query: '(.*) Seattle'
      }
    }
  },
  { $project: { _id: 0, title: 1 } }
]).toArray();
```

Faceted meta example:
```javascript
await db.collection('movies').aggregate([
  {
    $searchMeta: {
      facet: {
        operator: { regex: { path: 'title', query: '.*summer.*' } },
        facets: { genresFacet: { type: 'string', path: 'genres' } }
      }
    }
  }
]).toArray();
```

</section>
<section>
<title>span</title>
<url>https://mongodb.com/docs/atlas/atlas-search/span/</url>
<description>Learn how to find text search matches within regions of a text field.</description>


# span (deprecated; use `phrase`)

Term-level Atlas Search operator; keeps positions, no scores, excluded from `compound`.

```js
{
  $search:{
    index:"<name>",   // default "default"
    span:{ "term"|<positional>: { … } }
  }
}
```

`term` (required, innermost):

```json
{ "term": { "path":"<field>", "query":"<string>" } }
```

## Positional operators (nestable, each accepts optional `"score"`)

*contains*  
```json
{ "contains":{
    "spanToReturn":"inner"|"outer",
    "little":{<span|term>},
    "big":{<span|term>}
}}
```

*first*  
```json
{ "first":{
    "endPositionLte":<int,default 3>,
    "operator":{<span|term>}
}}
```

*near*  
```json
{ "near":{
    "clauses":[ {<span|term>}, … ],
    "slop":<int,default 0>,
    "inOrder":<bool,false>
}}
```

*or*  
```json
{ "or":{ "clauses":[ {<span|term>}, … ] } }
```

*subtract*  
```json
{ "subtract":{
    "include":{<span|term>},
    "exclude":{<span|term>}
}}
```

## Minimal Node.js example

```js
db.movies.aggregate([
  {
    $search:{
      span:{
        near:{
          clauses:[
            {term:{path:"title",query:"prince"}},
            {term:{path:"title",query:"pauper"}}
          ],
          slop:4
        }
      }
    }
  },
  {$project:{_id:0,title:1}}
])
```

</section>
<section>
<title>text</title>
<url>https://mongodb.com/docs/atlas/atlas-search/text/</url>
<description>Perform a full-text search on exact, similar, or synonymous terms.</description>


# text Operator

## Syntax
```js
{
  $search: {
    index: "<name|default>",
    text: {
      query: "<str|[str]>",        // required
      path: "<field|[field]>",     // required, supports wildcard
      fuzzy: {                     // mutually exclusive w/ synonyms
        maxEdits: 1|2,             // default 2
        prefixLength: <int>,       // default 0
        maxExpansions: <int>       // default 50
      },
      matchCriteria: "any"|"all",  // default all
      score: {                     // optional
        boost:<num>|constant:<num>|function:<expr>
      },
      synonyms: "<mappingName>"    // requires string field w/ positions/offsets
    }
  }
}
```

## Rules & Notes
- `query`, `path` required.
- `fuzzy` & `synonyms` cannot coexist.
- Always set `matchCriteria` when using `synonyms`; without it Atlas Search matches only exact term positions (may change).
- `synonyms` lookup speed depends on source size.
- Scoring arrays: one score per doc regardless of matched array elements.

## Quick Behavior Matrix
| Operator | default | matchCriteria:"any" | :"all" |
|----------|---------|---------------------|--------|
| text     | OR of terms | OR | AND |
| text+syn | exact phrase or synonym phrase | OR incl. synonyms | AND incl. synonyms |

## Minimal Node.js Examples
### Basic
```js
const pipeline = [
  { $search:{ text:{ path:"title", query:"surfer" } } },
  { $project:{ _id:0, title:1, score:{ $meta:"searchScore"} } }
];
await db.collection("movies").aggregate(pipeline).toArray();
```

### matchCriteria:"all"
```js
await db.collection("movies").aggregate([
  { $search:{ text:{ path:"plot", query:"automobile race", matchCriteria:"all" } } }
]).toArray();
```

### Fuzzy (defaults)
```js
await db.collection("movies").aggregate([
  { $search:{ text:{ path:"title", query:"naw yark", fuzzy:{} } } }
]).toArray();
```
Override:
```js
fuzzy:{ maxEdits:1, maxExpansions:100, prefixLength:2 }
```

### Synonyms
```js
await db.collection("movies").aggregate([
  { $search:{ text:{ path:"plot", query:"attire",
                     synonyms:"my_synonyms", matchCriteria:"any" } } }
]).toArray();
```

## Key Error Conditions
- Using both `fuzzy` and `synonyms`.
- Empty `synonyms` string.
- Field for `synonyms` not indexed as `string` with `positions/offsets`.

## Performance Tips
- Smaller synonym source collections execute faster.


</section>
<section>
<title>wildcard</title>
<url>https://mongodb.com/docs/atlas/atlas-search/wildcard/</url>
<description>Use a wildcard operator in an Atlas Search query to match any character.</description>


# wildcard

Term-level `$search` operator using Lucene wildcards.

Characters: `?`→1 char, `*`→0+ chars, `\`→escape (double in JSON).

```javascript
{
  $search: {
    index: <string>,        // optional
    wildcard: {
      query: <string|[string]>, // search term(s), not analyzed
      path:  <string|[string]|"**">,
      allowAnalyzedField: <bool>, // req’d true if path uses analyzer
      score: {                // optional
        boost:    <num>,
        constant: <num>,
        function: <expr>
      }
    }
  }
}
```

Defaults: index="default", allowAnalyzedField=false.

Behavior
• Query term is matched verbatim (with wildcards).  
• Works best on fields indexed with `lucene.keyword`.  
• If `allowAnalyzedField:true`, query still isn’t analyzed, so tokenization mismatches may yield zero hits (e.g., `"*Star Trek*"` on standard analyzer).  
• Escape JSON: `"*\\\\**"` (literal `*`), `"*\\\\\\*"` (literal `\`).  

## Node.js examples

Assume keyword index on `title` in `sample_mflix.movies`:

```javascript
const coll = client.db("sample_mflix").collection("movies");

// titles starting with "Green D"
await coll.aggregate([
  {$search:{wildcard:{path:"title",query:"Green D*"}}},
  {$project:{_id:0,title:1}}
]);

// titles "Wom?n ..."  ( '?'=any char, space then any suffix )
await coll.aggregate([
  {$search:{wildcard:{path:"title",query:"Wom?n *"}}},
  {$limit:5},
  {$project:{_id:0,title:1}}
]);

// titles ending with literal '?'
await coll.aggregate([
  {$search:{wildcard:{path:"title",query:"*\\\\?"}}},
  {$limit:5},
  {$project:{_id:0,title:1}}
]);

// count movies per genre containing "summer"
await coll.aggregate([
  {$searchMeta:{
     facet:{
       operator:{wildcard:{path:"title",query:"*summer*"}},
       facets:{genresFacet:{type:"string",path:"genres"}}
     }
  }}
]);
```

</section>
<section>
<title>Construct a Query Path</title>
<url>https://mongodb.com/docs/atlas/atlas-search/path-construction/</url>
<description>Use the path parameter to specify which field or fields your Atlas Search operators should search.</description>


# Path Parameter (Atlas Search)

Allowed forms  
```js
"path": "field"                       // single  
"path": ["f1","f2"]                  // OR across fields  
"path": {value:"field",multi:"a"}    // choose analyzer  
"path": {wildcard:"pattern"}         // * matches any chars incl. dots  
"path": ["f1",{value:"f2",multi:"a"}, {wildcard:"n*"}]
```

Notes  
- multi only on string fields with `multi` analyzers defined in index.  
- wildcard object: must exclude value/multi, can’t use `**`.  
- wildcard accepted by `text | phrase | regex | wildcard` operators and for highlighting.

Index sample (multi analyzer)  
```jsonc
{
 "mappings":{ "dynamic":false,
  "fields":{
    "comments":{ "type":"string","analyzer":"lucene.standard",
      "multi":{ "mySecondaryAnalyzer":{"type":"string","analyzer":"lucene.whitespace"} }
    }
}}}
```

## Node.js Usage

Single field  
```js
db.cars.aggregate([{ $search:{ text:{ query:"Ford", path:"make" } } }])
```

Multiple fields  
```js
db.cars.aggregate([{ $search:{ text:{ query:"blue", path:["make","description"] } } }])
```

Alternate analyzer  
```js
db.cars.aggregate([{ $search:{ text:{
  query:"driver",
  path:{value:"description",multi:"simpleAnalyzer"}
}}}])
```

Compound scoring with default + multi analyzer  
```js
db.cars.aggregate([
 { $search:{ compound:{ should:[
   { text:{path:"description",query:"Three"} },
   { text:{query:"Three",path:{value:"description",multi:"simpleAnalyzer"},
           score:{boost:{value:2}} } }
 ]}}},
 { $project:{_id:0,type:1,score:{$meta:"searchScore"}}}
])
```

Wildcard all fields  
```js
db.cars.aggregate([{ $search:{ phrase:{ path:{wildcard:"*"}, query:"red" } } }])
```

Wildcard nested  
```js
db.cars.aggregate([{ $search:{ text:{ path:{wildcard:"warehouse.*"}, query:"red" } } }])
```

</section>
<section>
<title>Process Results with Search Options</title>
<url>https://mongodb.com/docs/atlas/atlas-search/search-options/</url>
<description>Choose options to refine your Atlas Search $search and $searchMeta query results.</description>


# Process Results

Options  
- **score** – view/boost ranking.  
- **sort** – order docs (date, alpha, etc.).  
- **highlight** – return matched snippets.  
- **count** – total hit count.  
- **searchSequenceToken** – cursor for pagination.  
- **tracking** – collect query stats.

```js
const res = await coll.aggregate([
  { $search: {
      index:"default",
      text:{ query:"term", path:"field" },
      score:{}, sort:{ published:-1 },
      highlight:{ path:"field" },
      count:{}, tracking:{}
  }}
]).toArray();
```

</section>
<section>
<title>Score the Documents in the Results</title>
<url>https://mongodb.com/docs/atlas/atlas-search/scoring/</url>
<description>Modify, normalize, or return a breakdown of the score assigned to a returned document with the boost, constant, embedded, or function options.</description>


# Atlas Search & Vector Score

Use `$project` + `$meta` to expose Lucene score metadata:

```javascript
// text score
db.col.aggregate([
  {$search:{text:{<operator>}}},
  {$project:{<field>:1,score:{$meta:"searchScore"}}}
]);

// text score details
db.col.aggregate([
  {$search:{text:{<operator>},scoreDetails:true}},
  {$project:{scoreDetails:{$meta:"searchScoreDetails"}}}
]);

// vector score
db.col.aggregate([
  {$vectorSearch:{<query>}},
  {$project:{score:{$meta:"vectorSearchScore"}}}
]);
```

Notes  
• Results auto-sorted desc by score. Identical scores → nondeterministic; add `sort` on unique field.  
• On Search Nodes, `searchScore` may differ across hosts; avoid sorting/pagination by it.  
• Scoring factors: term position, frequency, operator/analyzer.  
• Options: modify score, return breakdown, normalize.  
• Array elements matching query share one score.  
• For pagination across nodes, follow `$search` with `$match` on `_id` to restrict host-local IDs.

</section>
<section>
<title>Modify the Score</title>
<url>https://mongodb.com/docs/atlas/atlas-search/score/modify-score/</url>
<description>Modify the score assigned to a returned document with the boost, constant, embedded, or function options.</description>


# Modify the Score

## boost
Multiplies base score.  
Syntax inside any operator:  
```jsonc
"score": { "boost": { "value": <num> | "path": "<numericField>", "undefined": <num> } }
```
Rules:  
- Required: `value` or `path` (mutually exclusive).  
- Optional with `path`: `undefined` (default `0`).  
- Cannot combine with `constant`.  
Equivalent to `function` → `multiply` with `path`.

### Node.js mini-example
```js
db.collection.aggregate([
  {$search: {
    compound: {
      should: [
        {text:{query:"Helsinki",path:"plot"}},
        {text:{query:"Helsinki",path:"title",
          score:{boost:{value:3}}}}
]}}])
```

## constant
Replaces score with fixed number.  
```jsonc
"score": { "constant": { "value": <num> } }
```
Cannot be used with `boost`.

## embedded  (preview, `embeddedDocument` only)
```jsonc
"score": { "embedded": {
  "aggregate": "sum"|"maximum"|"minimum"|"mean", // default sum
  "outerScore": <score-modifier>
}}
```
`aggregate` combines scores of matching embedded docs; `outerScore` runs after aggregation. For any `function` expression in `outerScore`, `path` fields must be within the `embeddedDocument` path.

## function
Generic mathematical modifier; result <0 is clipped to 0.  
Place inside `score`: `"score": { "function": { <expr> } }`  
Expressions (nestable):

• Arithmetic  
  - `add:[expr,…]`  
  - `multiply:[expr,…]`  

• Constant  
  - `constant:<num>` (negatives ok)

• Gaussian decay  
```jsonc
"gauss":{path:{value:"<field>",undefined:<num>},
         origin:<num>,scale:<num>,offset:<num>,decay:<0-1>}
```

• Path  
  - `"path":"<numericField>"` or  
  - `"path":{value:"<field>",undefined:<num>}`

• Score  
  - `"score":"relevance"`

• Unary  
  - `log:<expr>` (log10, undefined if ≤0)  
  - `log1p:<expr>` (log10(1+x))

### Minimal Node.js examples
Multiply imdb.rating with relevance:
```js
db.movies.aggregate([
 {$search:{text:{
   path:"title",query:"men",
   score:{function:{multiply:[
     {path:{value:"imdb.rating",undefined:2}},
     {score:"relevance"}]}}}}}])
```
Constant score 3:
```js
db.movies.aggregate([
 {$search:{text:{
   path:"title",query:"men",
   score:{function:{constant:3}}}}}])
```
Gaussian decay by rating:
```js
db.movies.aggregate([
 {$search:{text:{
   path:"title",query:"shop",
   score:{function:{gauss:{
     path:{value:"imdb.rating",undefined:4.6},
     origin:9.5,scale:5,offset:0,decay:0.5}}}}}])
```

</section>
<section>
<title>Return the Score Details</title>
<url>https://mongodb.com/docs/atlas/atlas-search/score/get-details/</url>
<description>Modify, normalize, or return a breakdown of the score assigned to a returned document with the boost, constant, embedded, or function options.</description>


# $search `scoreDetails`

## Syntax
```jsonc
[
  {
    $search: {
      <operator>: { … },
      scoreDetails: true // default false
    }
  },
  {
    $project: {
      score:        { $meta: 'searchScore' },
      scoreDetails: { $meta: 'searchScoreDetails' }
    }
  }
]
```

## `$search` Option  
`scoreDetails: true | false` – when `true`, makes `$meta:"searchScoreDetails"` available downstream.

## `$project` Meta Values  
`searchScoreDetails` – recursive object per doc:
```js
{
  value: <float>,          // total or partial score
  description: <string>,   // formula fragment
  details: [<scoreDetails>]// children
}
```

## Scoring Algorithms

### BM25  
Score = boost × idf × tf  
• idf = log(1 + (N − n + 0.5)/(n + 0.5))  
• tf  = freq / (freq + k1 × (1 − b + b × dl/avgdl))  
Factors:  
- boost – manual weight  
- freq  – term count in doc  
- idf   – inverse doc freq  
- tf    – term frequency adjustment  
- k1,b,dl,avgdl – internal BM25 params

### Distance Decay (`near`)  
Score = pivot / (pivot + |fieldValue − origin|)  
Factors: origin, fieldValue, pivot.

## Minimal Node.js Examples

Text operator:
```js
await db.collection('movies').aggregate([
  {
    $search: {
      text: { path: 'title', query: 'autumn' },
      scoreDetails: true
    }
  },
  { $limit: 3 },
  {
    $project: {
      _id: 0,
      title: 1,
      score:        { $meta: 'searchScore' },
      scoreDetails: { $meta: 'searchScoreDetails' }
    }
  }
]).toArray();
```

Near operator:
```js
await db.collection('movies').aggregate([
  {
    $search: {
      near: {
        path: 'released',
        origin: new Date('2010-01-01'),
        pivot: 7.776e9   // 90 days in ms
      },
      scoreDetails: true
    }
  },
  { $limit: 3 },
  {
    $project: {
      _id: 0, title: 1, released: 1,
      score:        { $meta: 'searchScore' },
      scoreDetails: { $meta: 'searchScoreDetails' }
    }
  }
]).toArray();
```

Function score (multiply):
```js
await db.collection('movies').aggregate([
  {
    $search: {
      text: {
        path: 'title',
        query: 'men',
        score: { function: { multiply: [
          { path: { value: 'imdb.rating', undefined: 2 } },
          { score: 'relevance' }
        ]}}
      },
      scoreDetails: true
    }
  },
  { $project: { _id:0, title:1, score:{ $meta:'searchScore' }, scoreDetails:{ $meta:'searchScoreDetails' } } }
]).toArray();
```

Constant score:
```js
…score:{ function:{ constant:3 } } …
```

Gaussian:
```js
…score:{ function:{ gauss:{ path:{value:'imdb.rating',undefined:4.6}, origin:9.5, scale:5, offset:0, decay:0.5 } } }…
```

Other unary/field/path/score functions use the same pattern; `scoreDetails` always exposes the internal formula tree described above.

</section>
<section>
<title>Sort Atlas Search Results</title>
<url>https://mongodb.com/docs/atlas/atlas-search/sort/</url>
<description>Sort you Atlas Search results by date, number, and string fields.</description>


# Atlas Search `sort`

Supported value types: `boolean`, `date`, `number` (int/float/double), `objectId`, `uuid`, `string` (must be indexed as `token`).  
Not supported: `embeddedDocument` fields.

Compatibility  
• Non-sharded clusters MongoDB 5.0+.  
• Sharded clusters 6.0 major+, 7.0 minor+.  
`sort` unsupported with deprecated `knnBeta`.

Indexing rules  
• For number/date/boolean/uuid/objectId: dynamic or static mapping.  
• For string: static mapping with `type: "token"`.  
• To sort on embedded-doc fields: parent mapped `document`, child mapped appropriately.

Syntax
```jsonc
{
  $search: {
    index: "default",           // optional
    <operator>: {...},          // text, range, etc.
    sort: {
      score: {$meta: "searchScore", order: 1|-1}, // optional
      "<field>": 1|-1 | {
        order: 1|-1,
        noData: "lowest"|"highest" // null/missing handling
      },
      ...
    }
  }
}
```

Order codes  
1 – ascending (missing < existing).  
-1 – descending.

noData behavior  
• default `lowest`.  
• `highest` moves null/missing to end (asc) or start (desc).

Score sorting  
• Provide `$meta: "searchScore"`; optional `order`.  
• Tie-break with additional, preferably unique field(s).

Array handling  
• Arrays are flattened.  
• Asc uses smallest element; desc uses largest.  
• Mixed-type arrays: compare by BSON type precedence; `noData: highest` elevates null/missing.

Null/missing  
Treated equivalently, ordering nondeterministic among themselves.

Performance  
Optimized with `$limit` after `$search`; full-collection sorts can be slow. Index is eventually consistent.

-------------------------------------------------------------------------------
## Node.js snippets

Assume `const coll = client.db("db").collection("col");`

Sort by date
```js
const pipeline = [
  {$search: {
     index:"default",
     compound:{
       filter:{wildcard:{query:"Summer*",path:"title"}},
       must:{near:{path:"released",origin:new Date("2014-04-18"),pivot:13149000000}}
     },
     sort:{released:-1}          // DESC
  }},
  {$limit:5},
  {$project:{_id:0,title:1,released:1,score:{$meta:"searchScore"}}}
];
await coll.aggregate(pipeline).toArray();
```

Sort by number
```js
const pipeline = [
  {$search:{
     index:"default",
     range:{path:"awards.wins",gte:10},
     sort:{"awards.wins":-1}
  }},
  {$limit:5},
  {$project:{_id:0,title:1,"awards.wins":1}}
];
```

Sort by string (ascending)
```js
[
 {$search:{
   index:"default",
   text:{path:"title",query:"country"},
   sort:{title:1}
 }},
 {$limit:5},
 {$project:{title:1,score:{$meta:"searchScore"},_id:0}}
]
```

Case-insensitive sort requires index mapping with default normalizer; to preserve case order use `normalizer:"none"` in mapping.

Sort by score ascending (lowest first)
```js
[
 {$search:{
   text:{path:"title",query:"story"},
   sort:{score:{$meta:"searchScore",order:1}}
 }},
 {$limit:5},
 {$project:{title:1,score:{$meta:"searchScore"},_id:0}}
]
```

Score + unique tie-break
```js
sort:{score:{$meta:"searchScore"},released:1}
```

Sort by UUID/ObjectId
```js
{$search:{text:{path:"b",query:"hello"},sort:{a:1}}}
```

Sort with null handling
```js
sort:{c:{order:1,noData:"highest"}}   // push null/missing to end when ASC
```

Boolean sort (true > false when DESC)
```js
sort:{"address.location.is_location_exact":-1}
```

Facet + sort example (abbreviated)
```js
{
 $search:{
   facet:{
     operator:{range:{path:"released",gt:new Date("2010-01-01"),lt:new Date("2015-01-01")}},
     facets:{...}
   },
   sort:{released:-1}
 }
}
```

-------------------------------------------------------------------------------
Key takeaways  
• Define all sortable fields in the index (`token` for strings).  
• Use simple value `1|-1` or document form to control `noData`.  
• Arrays & mixed types: understand representative element rule.  
• Always add `$limit` after `$search` for performance.

</section>
<section>
<title>Highlight Search Terms in Results</title>
<url>https://mongodb.com/docs/atlas/atlas-search/highlighting/</url>
<description>Use the highlight option to return search terms within their original context as fields in your query results.</description>


# Atlas Search `highlight`

Use `highlight` in any `$search` stage (except `embeddedDocument`) to add `$meta:"searchHighlights"` passages that show matched terms.

```js
// Node.js driver
const pipeline = [
  {
    $search: {
      index: "default",        // optional
      text: { path: "description", query: ["variety","bunch"] },
      highlight: {
        path: ["description"], // string | [strings] | {*} | multi-analyzer spec
        maxCharsToExamine: 5e5, // default
        maxNumPassages: 5       // default
      }
    }
  },
  { $project: { _id: 0, description: 1, highlights: { $meta: "searchHighlights" } } }
];
```

## highlight Object

| field | type | notes |
|-------|------|-------|
| path | string/array/\* | required; may use `{wildcard:"des*"}` |
| maxCharsToExamine | int | per-doc char limit (default 500 000) |
| maxNumPassages | int | passages per doc (default 5) |

Rules  
• Must be sibling of `$search` operators, not nested.  
• One `highlight` per `$search`.  
• For autocomplete, the highlighted path can only be used by that `autocomplete` operator.  

Prerequisite: the highlighted field is indexed as `string` with `indexOptions:"offsets"` (default).

## `$meta:"searchHighlights"` Structure

```jsonc
highlights: [
  {
    path: "description",
    texts: [
      { value: "prefix ", type: "text" },
      { value: "match",  type: "hit" },
      { value: " suffix", type: "text" }
    ],
    score: 1.23
  }
]
```

texts.type:  
• `hit` – term matched query  
• `text` – surrounding context  

## Pattern Variants (snippets)

Basic: see pipeline above.

Advanced limits:
```js
highlight:{path:"description",maxCharsToExamine:40,maxNumPassages:1}
```

Multi-field:
```js
highlight:{path:["description","summary"]}
```

Wildcard:
```js
text:{path:{wildcard:"des*"},query:"variety"},
highlight:{path:{wildcard:"des*"}}
```

Compound:
```js
$search:{
  compound:{should:[
    {text:{path:"category",query:"organic"}},
    {text:{path:"description",query:"variety"}}
  ]},
  highlight:{path:"description"}
}
```

Autocomplete (edgeGram):
```js
$search:{
  autocomplete:{path:"description",query:"var"},
  highlight:{path:"description"}
}
```

Limitations: cannot be used with `embeddedDocument` operator.

</section>
<section>
<title>Count Atlas Search Results</title>
<url>https://mongodb.com/docs/atlas/atlas-search/counting/</url>
<description>Learn how to find the size, and display the exact result set number or the lower bound number with a specified threshold of the results from your Atlas Search query.</description>


# Atlas Search `count`

Adds doc count metadata inside `$search` or `$searchMeta`.

```jsonc
{
  "$searchMeta"|"$search": {
    "index": "<name>",           // default: "default"
    "<operator>": { … },
    "count": {
      "type": "lowerBound"|"total", // default: lowerBound
      "threshold": <int>            // only for lowerBound, default 1000
    }
  }
}
```

Cluster note  
• Sharded clusters require MongoDB ≥6.0.  
• MongoDB 7.2.0 on Atlas may error in `$searchMeta` for `count`.  
• `count` is omitted in explain output.

Count result object  
• `lowerBound`: integer lower bound (always present for lowerBound).  
• `total`: exact integer (only for type `total`).

## $$SEARCH_META

When `count` is used in `$search`, metadata is stored in the `$$SEARCH_META` aggregation variable. Prefer:  
• `$search` → results only.  
• `$searchMeta` → metadata only.  
• `$search` + `$$SEARCH_META` → both.

## Node.js examples

### `$search` + metadata + limit
```js
await db.collection('movies').aggregate([
  {
    $search: {
      near: {
        path: 'released',
        origin: new Date('2011-09-01'),
        pivot: 7776000000
      },
      count: { type: 'total' }
    }
  },
  { $project: { title: 1, released: 1, meta: '$$SEARCH_META' } },
  { $limit: 2 }
]).toArray();
```

### Faceted search with exact count
```js
await db.collection('movies').aggregate([
  {
    $search: {
      facet: {
        operator: {
          near: {
            path: 'released',
            origin: new Date('2011-09-01'),
            pivot: 7776000000
          }
        },
        facets: { genresFacet: { type: 'string', path: 'genres' } }
      },
      count: { type: 'total' }
    }
  },
  { $limit: 2 },
  {
    $facet: {
      results: [{ $project: { title: 1, released: 1, genres: 1 } }],
      meta: [{ $replaceWith: '$$SEARCH_META' }, { $limit: 1 }]
    }
  }
]).toArray();
```

### `$searchMeta` lowerBound
```js
await db.collection('movies').aggregate([
  {
    $searchMeta: {
      range: { path: 'year', gte: 2010, lte: 2015 },
      count: { type: 'lowerBound' }     // threshold default 1000
    }
  }
]).toArray(); // { count: { lowerBound: Long("1001") } }
```

### `$searchMeta` total
```js
await db.collection('movies').aggregate([
  {
    $searchMeta: {
      range: { path: 'year', gte: 2010, lte: 2015 },
      count: { type: 'total' }
    }
  }
]).toArray(); // { count: { total: Long("5971") } }
```

</section>
<section>
<title>Paginate the Results</title>
<url>https://mongodb.com/docs/atlas/atlas-search/paginate-results/</url>
<description>Retrieve $search results before or after a given reference point.</description>


# Atlas Search – Result Pagination

### Core Flow
1. Build an Atlas Search index (MongoDB 6.0.13+/7.0.5+).
2. Run an initial `$search` sorted deterministically; in `$project` return  
   `"paginationToken": { "$meta": "searchSequenceToken" }`.
3. For later pages rerun the *identical* `$search`:
   • `"searchAfter": "<token>"` → next page  
   • `"searchBefore": "<token>"` → previous page (results arrive reversed; client must reverse).
4. Optional: combine `$skip` + `$limit` with `searchAfter/Befor­­e` to jump pages.

### Deterministic Sort Rules
• Always include a unique, immutable tie-breaker (e.g. `_id`).  
• Prefer non‐mutable fields; avoid `searchScore` when Search Nodes are enabled.

### Token Facts
• Base-64 string per doc; length ∝ sort fields.  
• Valid only for the *same* query semantics (operator, filter, sort, index).  
• Not a DB snapshot.

### Aggregation Templates
```jsonc
// Retrieve first page & tokens
[
 { $search: { index:"<idx>", <operator>:<spec>, sort:{ released:1, _id:1 } } },
 { $limit: 10 },
 { $project:{ _id:0, title:1, released:1,
              paginationToken:{ $meta:"searchSequenceToken" },
              score:{ $meta:"searchScore" } } }
]

// Next page
[
 { $search:{ index:"<idx>", <operator>:<spec>,
             searchAfter:"<token>", sort:{ released:1,_id:1 } } },
 { $limit:10 }, { $project:{ … } }
]

// Previous page (client must reverse())
[
 { $search:{ index:"<idx>",<operator>:<spec>,
             searchBefore:"<token>",sort:{ released:1,_id:1 } } },
 { $limit:10 }, { $project:{ … } }
]

// Jump forward N pages
[
 { $search:{ …, searchAfter:"<token>", sort:{ released:1,_id:1 } } },
 { $skip: N*pageSize }, { $limit: pageSize }, { $project:{ … } }
]
```

### Node.js Driver Examples
```js
// page 1
const page1 = await db.collection('movies').aggregate([
  { $search: { index:'pagination', text:{ path:'title', query:'summer' },
               sort:{ released:1, _id:1 } } },
  { $limit:10 },
  { $project:{ _id:0, title:1, released:1,
               paginationToken:{ $meta:'searchSequenceToken' } } }
]).toArray();
const nextTok = page1.at(-1).paginationToken;   // save for page 2

// page 2 (next)
const page2 = await db.collection('movies').aggregate([
  { $search:{ index:'pagination', text:{ path:'title', query:'summer' },
              searchAfter:nextTok, sort:{ released:1, _id:1 } } },
  { $limit:10 },
  { $project:{ _id:0, title:1, released:1,
               paginationToken:{ $meta:'searchSequenceToken' } } }
]).toArray();

// previous page (back to page 1)
const prevTok = page2[0].paginationToken;
const page1Again = (await db.collection('movies').aggregate([
  { $search:{ index:'pagination', text:{ path:'title', query:'summer' },
              searchBefore:prevTok, sort:{ released:1, _id:1 } } },
  { $limit:10 },
  { $project:{ _id:0, title:1, released:1,
               paginationToken:{ $meta:'searchSequenceToken' } } }
]).toArray()).reverse();
```

### Faceted Pagination
Index facet field as `"type":"stringFacet"`.  
```jsonc
// facet w/ tokens
[
 { $search:{
     index:"pagination",
     facet:{
       operator:{ text:{ path:"title", query:"summer" } },
       facets:{ genres:{ type:"string", path:"genres" } }
     }}},
 { $addFields:{ paginationToken:{ $meta:"searchSequenceToken" } } },
 { $limit:10 },
 { $facet:{
     docs:[{ $project:{ _id:0,title:1,genres:1,paginationToken:1 } }],
     meta:[{ $replaceWith:"$$SEARCH_META" },{ $limit:1 }] } },
 { $set:{ meta:{ $arrayElemAt:["$meta",0] } } }
]
```

### Summary of Options
| Option          | Purpose                          |
|-----------------|----------------------------------|
| `searchAfter`   | Docs **after** token (next page) |
| `searchBefore`  | Docs **before** token (prev page)|
| `searchSequenceToken` (meta) | Generates token per doc |
| `sort`          | Must be deterministic, include tie-breaker |
| `$skip` + `$limit` | Combine with `searchAfter/Before` to jump pages |

Follow these patterns to implement efficient, consistent paginated Atlas Search queries.

</section>
<section>
<title>Track Search Terms</title>
<url>https://mongodb.com/docs/atlas/atlas-search/tracking/</url>
<description>Learn how to use the tracking option to track search terms.</description>


# Track Search Terms

```jsonc
{
  $search: {
    index: "<index>",
    "<operator>": { … },
    tracking: { searchTerms: "<term>" } // 1 term/query
  }
}
```

Field | Type | Req
---|---|---
`searchTerms` | string | ✓

Behavior  
• Available only on M10+ clusters.  
• Per index/day Atlas stores:  
  – total query count  
  – queries returning 0 docs  
• Daily per-cluster cap on unique terms; once hit, new terms ignored, previously seen terms still counted.  
• Counters & cap reset 00:00 UTC.  
• `searchTerms` string is metadata only; does not influence results.

Analytics UI  
Query Analytics page shows per-day charts for “All Tracked $search Queries” & “Queries with no Results” over preset/custom ranges (today, 7/30/90 days).

Example (Node.js):

```js
await db.collection('movies').aggregate([
  {
    $search: {
      text: { query: 'summer', path: 'title' },
      tracking: { searchTerms: 'summer' }
    }
  },
  { $limit: 5 },
  { $project: { _id: 0, title: 1 } }
]).toArray();
```

</section>
<section>
<title>Define Performance Options</title>
<url>https://mongodb.com/docs/atlas/atlas-search/performance-options/</url>
<description>Choose options to refine your Atlas Search $search and $searchMeta query results.</description>


# $search Performance Options

• **concurrent** – parallelizes query across index segments to cut latency on large datasets.  
• **returnStoredSource** – returns source stored on `mongot`, skipping full document fetch.

</section>
<section>
<title>Parallelize Query Execution Across Segments</title>
<url>https://mongodb.com/docs/atlas/atlas-search/concurrent-query/</url>
<description>Learn how to execute each individual Atlas Search query using multiple threads.</description>


# Parallelize Query Execution Across Segments

`concurrent` (bool, default `false`) inside `$search`/`$searchMeta` requests multi-threaded segment execution.  
• `true`: attempt parallelism; `false`: single thread.  
• Only on dedicated Search Nodes.  
• Fallback to single-thread if node overloaded.  

```jsonc
{
  "$search": {
    "index": "default",
    "<operator>": { ... },
    "concurrent": true
  }
}
```

```js
// Node.js driver
await db.collection('movies').aggregate([
  {
    $search: {
      text: { path: 'title', query: 'new york' },
      concurrent: true
    }
  }
]).toArray();
```

</section>
<section>
<title>Return Stored Source Fields</title>
<url>https://mongodb.com/docs/atlas/atlas-search/return-stored-source/</url>
<description>If you enabled storedSource in your Atlas Search index definition for a collection, use the returnStoredSource boolean option in your Atlas Search queries to retrieve only stored fields.</description>


# Return Stored Source Fields

Atlas Search can store specified fields (`storedSource` in index). In queries add  
`returnStoredSource:true` inside `$search` to return only those fields and skip implicit full‐document lookup.

```js
{
  $search: {
    "<operator>": {...},
    returnStoredSource: true // default false
  }
}
```

Requirements  
• Cluster ≥5.0 (≥5.1 for `$lookup` on sharded).  
• Index must include `storedSource`; missing → error.  

Behavior when `returnStoredSource:true`  
• Docs lacking stored fields → `{}`.  
• Possible stale or duplicate data (replication lag, orphaned chunks).

Use when pipeline later sorts/filters most results; store only needed fields, defer full fetch with `$lookup`.

## Node.js Examples

### Sort then fetch full docs
```js
// index: mappings.title string; storedSource.include ["year","title"]
const pipeline = [
  {
    $search: {
      text: {query:"baseball", path:"title"},
      returnStoredSource:true
    }
  },
  {$sort:{year:1,title:1}},
  {$limit:10},
  {$lookup:{from:"movies",localField:"_id",foreignField:"_id",as:"doc"}}
];
db.collection('movies').aggregate(pipeline);
```

### Match then fetch full docs
```js
// index: mappings.title string; storedSource.include ["imdb.rating","imdb.votes"]
const pipeline = [
  {
    $search:{
      text:{query:"baseball",path:"title"},
      returnStoredSource:true
    }
  },
  {$match:{$or:[{"imdb.rating":{$gt:8.2}},{"imdb.votes":{$gte:4500}}]}},
  {$lookup:{from:"movies",localField:"_id",foreignField:"_id",as:"doc"}}
];
db.collection('movies').aggregate(pipeline);
```



</section>
<section>
<title>Use MongoDB Views to Transform Documents and Filter Collections for Atlas Search</title>
<url>https://mongodb.com/docs/atlas/atlas-search/transform-documents-collections/</url>
<description>Use Atlas Search to transform documents and collections.</description>


# Atlas Search on MongoDB Views

## Requirements
- MongoDB 8.0+.  
- Preview: create/modify Views with `mongosh`/Compass; create indexes via Atlas UI or Admin API only.  
- Edit View: `collMod` (User Admin).  

## Atlas Search + Views Limitations
- Only `$expr` inside `$addFields`/`$set`/`$match`.  
- Index names unique across source collection + all Views.  
- No dynamic operators (`$rand`, `$$USER_ROLES`, etc.).  
- Query **source collection**, not View, until GA.  
- Search results return original (un-transformed) docs.

---

## Example 1 – Partial index (movies released ≥ 2000)

```js
// create view
use sample_mflix
db.createView(
  "movies_ReleasedAfter2000",
  "movies",
  [{$match: {$expr: {$gt:["$released", ISODate("2000-01-01") ]}}}]
)
```

Create Atlas Search index  
Database: `sample_mflix` Collection: `movies_ReleasedAfter2000`  
Index name: `releasedAfter2000Index` (config method any).

Query from source collection:

```js
db.movies.aggregate([
  {$search: {
      index: "releasedAfter2000Index",
      text: {path: "title", query: "foo"},
      sort: {released: 1}
  }}
])
```

---

## Example 2 – Transform fields (add `totalPrice`)

```js
use sample_airbnb
db.createView(
  "listingsAndReviews_totalPrice",
  "listingsAndReviews",
  [{$addFields:{
      totalPrice: {$add:[
        {$ifNull:[{$toDouble:"$price"},0]},
        {$ifNull:[{$toDouble:"$cleaning_fee"},0]}
      ]}
  }}]
)
```

Create index  
DB: `sample_airbnb` Coll: `listingsAndReviews_totalPrice`  
Name: `totalPriceIndex`  
Definition:
```json
{
  "mappings": { "dynamic": true },
  "storedSource": { "include": ["totalPrice"] }
}
```

Query:

```js
db.listingsAndReviews.aggregate([
  {$search:{
      index:"totalPriceIndex",
      range:{path:"totalPrice", lte:300},
      returnStoredSource:true
  }}
])
```

---

## Modify a View

```js
db.runCommand({
  collMod: "movies_ReleasedAfter2000",
  viewOn: "movies",
  pipeline: [{$match: {$expr: {$lt:["$released", ISODate("2000-01-01")]}}}]
})
// Atlas reindexes automatically (no downtime)
```

Retrieve pipeline:  
```js
db.getCollectionInfos({name:"movies_ReleasedAfter2000"})[0].options.pipeline
```

---

## Index Status Troubleshooting
Status FAILED:
- View incompatible with Search.
- View edited to incompatible pipeline.
- Source collection removed/changed (incl. view-on-view chains).

Status STALE / build stuck:
- Pipeline error on some docs (e.g., `$toDouble` on array).  
  Fix docs or View; status returns to READY automatically.

---

## Index Lifecycle on Views
`mongot`:
1. Applies View pipeline while indexing initial snapshot & change stream.
2. Stores transformed docs on disk.
3. Executes queries, returns doc IDs; `mongod` fetches originals.

---

</section>
<section>
<title>Atlas Search Playground</title>
<url>https://mongodb.com/docs/atlas/atlas-search/playground/</url>
<description>Try Atlas Search features by configuring search indexes and running queries on your data without needing an Atlas account.</description>


# Atlas Search Playground

### Supported Pipeline Stages
`$search`, `$searchMeta`, `$project`, `$limit`, `$skip`, `$facet`

### System Notes
• Workload data is logged for monitoring/troubleshooting.  
• Performance ≠ production performance.

### Limitations
• No Vector Search.  
• Single-collection only (no `$lookup`, `$unionWith`).  
• Session is ephemeral; click **Share** to create 30-day snapshot URL (Code Sandbox only).  
• Data caps: ≤500 docs, ≤100 KB/file, ≤300 KB total (docs + index + synonyms + queries).  
• Not linked to your Atlas cluster. Recreate by exporting docs & pasting index JSON.

### Access
`https://search-playground.mongodb.com/`

### Tools
**Code Sandbox** – add data, define index JSON, run `$search/$searchMeta`, template starter, shareable snapshot.  
**Search Demo Builder** – GUI for field selection, autocomplete, filters/facets; auto-generates index & query JSON.

### Prebuilt Example Categories
• compound (must, mustNot, should, etc.)  
• exists (basic, embedded, compound)  
• highlight (basic, advanced, multi-field, wildcard, compound, autocomplete)

</section>
<section>
<title>Improve Accuracy</title>
<url>https://mongodb.com/docs/atlas/atlas-search/accuracy/</url>

# Improve Accuracy

## Methods
- Customize score: adjust boosts/`score` in `$search`.
- Hybrid search: combine `$search` (keyword) + `$vectorSearch` (semantic); merge scores.
- Synonyms: store mappings in a collection, reference in index, enable at query.
- Explain: `await coll.aggregate([...]).explain()` to inspect score & plan.

## Relevancy Checklist
1. Data  
   • Index only needed fields (typed).  
   • Normalize values (e.g., ISO-8601).  
   • Choose analyzers/tokenizers; handle stop-words, stemming, synonyms.  
   • Plan for dataset size/partitioning.

2. Index  
   • Set per-field or custom analyzers.  
   • Attach synonym mappings: `"synonyms": "synCollection"`.

3. Query  
   • Stage: `$search` or `$searchMeta`.  
   • Operator: `compound` (`must|should|mustNot`).  
   • Post steps: sort, score, group.

## Prerequisites
Atlas cluster ≥4.2, sample data, `Project Data Access Admin` role.  
Access via Search Tester, Compass, `mongosh`, or Node.js driver:

```js
await db.collection.aggregate([
  { $search: { text: { query: "coffee", path: "desc" } } }
]).toArray();
```

Local: `atlas deployments create local`.

</section>
<section>
<title>How to Customize the Score of the Documents in the Results</title>
<url>https://mongodb.com/docs/atlas/atlas-search/customize-score/</url>

# Atlas Search – Custom Scoring

## Score Modifiers
```js
// text / range / near operators accept `score`
score: {
  boost:    { value: <num> }           // multiply base score
  constant: { value: <num> }           // override score
  function: <expr>                     // arithmetic functions
  embedded: <expr>                     // embed sub-expr in compound
}
```
`function` expression primitives  
```js
score: {
  function: {
    add|subtract|multiply|divide|max|min: [ <expr>, … ],        // arithmetic
    gauss|exp|log|ln:   { path:{value:"field",undefined:<n>} }  // unary
    path:   { value:"field", undefined:<n> }                    // value of field
    score:  "relevance"                                         // raw score
  }
}
```

## Boost / Constant / Function (Node.js)
```js
const agg_constant = [
{$search:{
  index:"default",
  text:{query:"snow",path:"title",
        score:{constant:{value:5}}}}},
{$project:{_id:0,title:1,score:{$meta:"searchScore"}}}]
```
```js
const agg_boost = [
{$search:{
  compound:{
    must:[{range:{path:"year",gte:2013,lte:2015}}],
    should:[{text:{query:"snow",path:"title",
                   score:{boost:{value:2}}}}]}}},
{$project:{title:1,score:{$meta:"searchScore"}}}]
```
```js
const agg_function = [
{$search:{
  compound:{
    must:[{range:{path:"year",gte:2013,lte:2015}}],
    should:[{text:{query:"snow",path:"title",
      score:{function:{add:[
        {path:{value:"imdb.rating",undefined:2}},
        {score:"relevance"}]}}}}]}}},
{$project:{title:1,score:{$meta:"searchScore"}}}]
```

## Weighted Fields
```js
// prioritize genres>title>year
score:{boost:{value:<weight>}}
compound:{
  must:[
    {text:{path:"genres",query:"comedy",score:{boost:{value:9}}}},
    {text:{path:"title", query:"snow",  score:{boost:{value:5}}}}
  ],
  should:[{range:{path:"year",gte:2013,lte:2015,
                  score:{boost:{value:3}}}}]
}
```

## Bury Results (demote by 50%)
```js
const agg_buryGenre = [
{$search:{
  compound:{should:[
    {compound:{must:[{text:{query:"ghost",path:["plot","title"]}}],
               mustNot:[{text:{query:"Comedy",path:"genres"}}]}},
    {compound:{must:[{text:{query:"ghost",path:["plot","title"]}}],
               filter:[{text:{query:"Comedy",path:"genres"}}],
               score:{boost:{value:0.5}}}}
  ]}}},
{$project:{title:1,genres:1,score:{$meta:"searchScore"}}}]
```

Demote specific IDs:
```js
filterIDs=[ObjectId("id1"),ObjectId("id2")]
should:[{compound:{must:[{text:{query:"ghost",path:["plot","title"]}}],
                   mustNot:[{in:{value:filterIDs,path:"_id"}}]}},
        {compound:{must:[{text:{query:"ghost",path:["plot","title"]}}],
                   filter:[{in:{value:filterIDs,path:"_id"}}],
                   score:{boost:{value:0.5}}}}]
```

## Normalizing Score 0-1
```js
[
{$search:{text:{query:"Helsinki",path:"plot"}}},
{$addFields:{score:{$meta:"searchScore"}}},
{$setWindowFields:{output:{maxScore:{$max:"$score"}}}},
{$addFields:{normalizedScore:{$divide:["$score","$maxScore"]}}},
{$project:{title:1,score:1,maxScore:1,normalizedScore:1,_id:0}}
]
```

## Window Function Helpers
```
$meta:"searchScore"      // current doc score
$max:"$score"            // window max
$divide:[score,maxScore] // normalization
```

Use these patterns with any modifier/operator to tune ranking, demote categories, or post-process scores.

</section>
<section>
<title>How to Perform Hybrid Search</title>
<url>https://mongodb.com/docs/atlas/atlas-search/tutorial/hybrid-search/</url>
<description>Learn how to search vector embeddings in your data on the Atlas cluster.</description>


# Hybrid Search (Atlas Vector + Full-Text)

## Indexes (`sample_mflix.embedded_movies`)

```js
// Vector Search
{
  name: "rrf-vector-search",
  type: "vectorSearch",
  definition: {
    fields: [{
      type: "vector",
      path: "plot_embedding",
      numDimensions: 1536,
      similarity: "dotProduct"
    }]
  }
}

// Full-Text Search
{
  name: "rrf-full-text-search",
  type: "search",
  definition: {
    mappings: {
      dynamic: false,
      fields: { title: [{ type: "string" }] }
    }
  }
}
```

Create with `collection.createSearchIndex(<doc>)` from the Node.js driver (`mongodb`).

## Reciprocal Rank Fusion (RRF)

Score per doc per search-method  
`rr = 1 / (rank + 60)`  
`weighted_rr = weight * rr`  

Final score = Σ(weighted_rr from each method). Higher weight ⇒ lower numeric value.

## Node.js Pipeline

```js
import { MongoClient } from 'mongodb';
const client = new MongoClient(process.env.ATLAS_CONNECTION_STRING);

const vectorWeight = 0.1;   // higher priority ⇒ use smaller value
const textWeight   = 0.9;

const pipeline = [
  // ---------- semantic -----------
  { $vectorSearch: {
      index: "rrf-vector-search",
      path: "plot_embedding",
      queryVector: [/* star-wars embedding */],
      numCandidates: 100,
      limit: 20
  }},
  { $group: {_id:null, docs:{$push:"$$ROOT"}}},
  { $unwind:{path:"$docs", includeArrayIndex:"rank"}},
  { $addFields:{ vs_score: {
      $multiply:[ vectorWeight, { $divide:[1,{$add:["$rank",60]}] } ]
  }}},
  { $project:{ _id:"$docs._id", title:"$docs.title", vs_score:1 }},
  // ---------- full-text ----------
  { $unionWith:{
      coll: "embedded_movies",
      pipeline:[
        { $search:{
            index:"rrf-full-text-search",
            phrase:{ query:"star wars", path:"title" }
        }},
        { $limit:20 },
        { $group:{_id:null, docs:{$push:"$$ROOT"}}},
        { $unwind:{path:"$docs", includeArrayIndex:"rank"}},
        { $addFields:{ fts_score:{
            $multiply:[ textWeight, { $divide:[1,{$add:["$rank",60]}] } ]
        }}},
        { $project:{ _id:"$docs._id", title:"$docs.title", fts_score:1 }}
      ]
  }},
  // ---------- fusion -------------
  { $group:{
      _id:"$_id",
      title:{$first:"$title"},
      vs_score:{$max:"$vs_score"},
      fts_score:{$max:"$fts_score"}
  }},
  { $project:{
      title:1,
      score:{$add:[ {$ifNull:["$vs_score",0]}, {$ifNull:["$fts_score",0]} ]}
  }},
  { $sort:{ score:-1 }}, { $limit:10 }
];

(async () => {
  const col = client.db("sample_mflix").collection("embedded_movies");
  for await (const doc of col.aggregate(pipeline)) console.log(doc);
  await client.close();
})();
```

• Adjust `vectorWeight` / `textWeight` per query to bias results.  
• Change `score:-1` to `1` to sort ascending.

## Requirements

MongoDB 6.0.11 / 7.0.2+, Node.js driver, `createSearchIndex` privilege.

</section>
<section>
<title>How to Use Synonyms with Atlas Search</title>
<url>https://mongodb.com/docs/atlas/atlas-search/tutorial/synonyms-tutorial/</url>
<description>Learn how to load sample synonyms source collections to search your collection for words that have the same or nearly the same meaning.</description>


# Atlas Search Synonyms – Concise Guide

## 1  Create Synonym Source Collections

```js
// transportation
db.transport_synonyms.insertMany([
  { mappingType: "equivalent", synonyms: ["car", "vehicle", "automobile"] },
  { mappingType: "explicit",   input: ["boat"], synonyms: ["boat", "vessel", "sail"] }
])

// attire  (M10+ if using multiple mappings)
db.attire_synonyms.insertMany([
  { mappingType: "equivalent", synonyms: ["dress", "apparel", "attire"] },
  { mappingType: "explicit",   input: ["hat"],  synonyms: ["hat", "fedora", "headgear"] }
])
```
`equivalent` = all terms interchangeable.  
`explicit`   = `input` terms map *one-way* to `synonyms`.

## 2  Search Index Definitions (`sample_mflix.movies`)

### Single Mapping
```json
{
  "mappings": {
    "dynamic": false,
    "fields": { "title": { "type": "string", "analyzer": "lucene.english" } }
  },
  "synonyms": [{
    "name": "transportSynonyms",
    "analyzer": "lucene.english",
    "source": { "collection": "transport_synonyms" }
  }]
}
```

### Multiple Mappings (M10+)
```json
{
  "mappings": {
    "dynamic": false,
    "fields": { "title": { "type": "string", "analyzer": "lucene.english" } }
  },
  "synonyms": [
    { "name": "transportSynonyms", "analyzer": "lucene.english",
      "source": { "collection": "transport_synonyms" } },
    { "name": "attireSynonyms",    "analyzer": "lucene.english",
      "source": { "collection": "attire_synonyms" } }
  ]
}
```

## 3  Node.js Query Snippets

```js
const { MongoClient } = require('mongodb');
const uri = "<connection-string>";
const client = new MongoClient(uri);
(async () => {
  const coll = client.db("sample_mflix").collection("movies");
```

### 3.1  Equivalent Mapping Example  
Search `automobile` → matches *car* etc.

```js
await coll.aggregate([
  { $search: { index: "synonyms-tutorial",
               text: { path: "title", query: "automobile",
                       synonyms: "transportSynonyms" } } },
  { $limit: 10 },
  { $project: { _id: 0, title: 1, score: { $meta: "searchScore" } } }
]).toArray().then(console.log);
```

### 3.2  Explicit Mapping Example  
Search `boat` → matches *boat, vessel, sail*; searching *vessel* will **not** match *boat*.

```js
await coll.aggregate([
  { $search: { index: "synonyms-tutorial",
               text: { path: "title", query: "boat",
                       synonyms: "transportSynonyms" } } },
  { $limit: 10 },
  { $project: { _id: 0, title: 1, score: { $meta: "searchScore" } } }
]).toArray().then(console.log);
```

### 3.3  Compound Query with Multiple Mappings (M10+)

```js
await coll.aggregate([
  { $search: {
      index: "synonyms-tutorial",
      compound: {
        should: [
          { text: { path: "title", query: "automobile",
                    synonyms: "transportSynonyms" } },
          { text: { path: "title", query: "attire",
                    synonyms: "attireSynonyms" } }
        ]
      }
    }},
  { $limit: 10 },
  { $project: { _id: 0, title: 1, score: { $meta: "searchScore" } } }
]).toArray().then(console.log);
```

## 4  Key Points

* Synonyms only apply to `$search` `text` operator.
* Mapping name in index (`synonyms`) is used by queries’ `synonyms` option.
* `equivalent` = bidirectional, `explicit` = unidirectional.
* Multiple synonym mappings require M10+ clusters.
* All synonym collections must reside in the same database as the indexed collection.

</section>
<section>
<title>How to Retrieve Query Plan and Execution Statistics</title>
<url>https://mongodb.com/docs/atlas/atlas-search/explain/</url>
<description>Run your Atlas Search query with the explain method to learn about your $search query plan and its execution statistics.</description>


# Atlas Search `explain`

## Syntax
```js
db.<collection>.explain(<"queryPlanner"|"executionStats"|"allPlansExecution">)
  .aggregate([{$search:{<operator>:{...}}}])
```

Verbosity:  
allPlansExecution ⟹ plan + full stats; executionStats ⟹ plan + exec stats; queryPlanner (default) ⟹ plan only.

---

## Top-Level Explain Fields
| field | notes |
|-------|-------|
| collectors | overall, facet, sort stats |
| highlight | present if query used `highlight` |
| indexPartitionExplain[] | per-partition explain; contains nested collectors/query |
| metadata | mongotVersion, mongotHostName, indexName, cursorOptions, totalLuceneDocs |
| query | Lucene query tree & stats |
| resultMaterialization | millis & calls to retrieve BSON (not in `queryPlanner`) |
| resourceUsage | major/minorFaults, user/systemTimeMs, maxReportingThreads, numBatches (not in `queryPlanner`) |

---

### collectors
* allCollectorStats.{collect,competitiveIterator,setScorer}
* facet.{collectorStats,createCountsStats.generateFacetCounts,stringFacetFieldCardinalities.{queried,total}}
* sort.stats.comparator.{setBottom,compareBottom,compareTop,setHitsThresholdReached,competitiveIterator,setScorer},  
  sort.stats.prunedResultIterator.nextDoc,  
  fieldInfos.{<field>:[types]}

### highlight
resolvedHighlightPaths[], stats.{setupHighlight,executeHighlight}

---

### query document
Fields: path, type, analyzer, args, stats (only verbose modes).

#### `args` per Lucene type
| Lucene type | args |
|-------------|------|
| BooleanQuery | must, mustNot, should, filter, minimumShouldMatch |
| ConstantScoreQuery | query |
| FunctionScoreQuery | scoreFunction, query |
| MultiTermQueryConstantScoreWrapper | queries[] |
| PhraseQuery | path, query, slop |
| PointRangeQuery | path, representation?, gte?, lte? |
| TermQuery | path, value |
| DefaultQuery | queryType |
| LatLonPointDistanceQuery, LatLonShapeQuery, LongDistanceFeatureQuery | stats only |

#### stats areas
context{millisElapsed,createWeight,createScorer}  
match{millisElapsed,nextDoc,refineRoughMatch}  
score{millisElapsed,score,setMinCompetitiveScore}

---

### resultMaterialization.stats
retrieveAndSerialize.millisElapsed/invocationCounts

### resourceUsage
majorFaults, minorFaults, userTimeMs, systemTimeMs, maxReportingThreads, numBatches

### Additional metric
`mongotDocsRequested` returned when pipeline includes `$limit`.

---

## Node.js Usage

```js
// Full stats
await db.movies.explain("allPlansExecution").aggregate([
  {$search:{text:{path:"title",query:"yark",fuzzy:{maxEdits:1,maxExpansions:100}}}}
]);

// executionStats example
await db.movies.explain("executionStats").aggregate([
  {$search:{autocomplete:{path:"title",query:"pre",
    fuzzy:{maxEdits:1,prefixLength:1,maxExpansions:256}}}}
]);

// queryPlanner (default)
await db.movies.explain().aggregate([
  {$search:{text:{path:"title",query:"yark"}}}
]);
```

</section>
<section>
<title>Improve Atlas Search Performance</title>
<url>https://mongodb.com/docs/atlas/atlas-search/performance/</url>
<description>Learn how mongot operates, how to improve your index and query performance, and how to fix and monitor your Atlas Search issues.</description>


# Improve Atlas Search Performance

`mongot` runs beside `mongod`, hosting Search indexes. CPU/RAM/disk usage depends on index config & query complexity; Atlas alerts track these metrics.

See: • Index Performance • Query Performance

NVMe upgrade forces File-Copy initial sync; Search unavailable until both `mongod` & `mongot` complete.

</section>
<section>
<title>Atlas Search Index Performance</title>
<url>https://mongodb.com/docs/atlas/atlas-search/performance/index-performance/</url>
<description>Improve your Atlas Search index and cluster performance by following resource allocation and scaling recommendations.</description>


# Atlas Search Index Performance

## Limits & Sizing
- Max 2.1 B Lucene docs per partition; exceed by:  
  • set `"numPartitions": <n>` **or** shard cluster.  
  • Embedded docs: each nested doc counts as 1. Est. docs = (1 + nested_docs_per_root) × collection_docs.
- Disk bloat reducers: custom static mappings, `store:false`.
- Autocomplete: avoid `nGram`, keep `minGram/maxGram` tight (≤10 chars), optionally dual-index as `string` for exact-match boost.
- `multi` analyzer, faceting fields (`stringFacet`, `token`, `number`, `date`), dynamic mapping on large/long fields, multi-lingual indexes, and large synonym collections increase index & RAM usage.

## Memory (mongot)
- Shared node:  
  • M40+: mongod uses ≥50 % RAM for WT; M30- : 25 %.  
  • Remaining RAM shared with mongot → risk of OOM/page-faults (watch Search Page Faults, Disk IOPS, CPU, IOWait).  
- Dedicated Search Nodes recommended for prod; Atlas allocates JVM heap + OS; right-size to fit index.

## Index Build / Rebuild
- Builds are CPU/disk heavy; writes amplified per index.
- Automatic rebuild triggers: index-definition change, breaking Search version, corruption.
- No-downtime rebuild: keep old index live; require free disk ≈125 % old index size (not needed when Atlas provisions temp search nodes for certain upgrades).
- Insufficient disk → expand tier or storage.

## Consistency & Latency
- Atlas Search is eventually consistent; relies on change streams; replication lag & many indexes increase latency.

## Mapping Explosions
- Caused by dynamic/wildcard on arbitrary keys. Fix: static mapping or tuple schema (array of {key,value}) instead of large object with 1000+ keys.

## Stored Source Fields
- Use `store:true` only for fields needed by later stages to reduce data lookups; excess storing increases disk.

## Scaling & Upgrades
- Search upgrades cause brief query failures; add retry logic, set maintenance window.
- More CPU cores (higher tier) → faster initial sync & steady-state indexing.
- NVMe config changes trigger full Search initial sync; queries blocked until complete unless using dedicated Search Nodes.

## Initial Sync
Triggered by new/upsized nodes, new shards, or sharding an indexed collection:
1. mongod syncs.
2. mongot syncs (rebuilds indexes) — queries to new fields fail until `ACTIVE`.

Monitor status in Atlas UI: Index Status → `INITIAL SYNC` → `ACTIVE`.

</section>
<section>
<title>Atlas Search Query Performance</title>
<url>https://mongodb.com/docs/atlas/atlas-search/performance/query-performance/</url>
<description>Improve your query performance by understanding how query complexity, operators, and pipeline stages can affect cluster performance.</description>


# Atlas Search Query Performance

## Query Design
- Minimize nested `compound` clauses; remove redundancies before sending query.
- Regex & wildcard ops are expensive.
- Prefer facet collector (`$searchMeta` with `facet`) to avoid multiple queries.
- Large result sets slow scoring; use pagination.

## Prefer `$search`
Use `$search` unless you need:
- On-prem/local deployment  
- Write-concern-sensitive R/W patterns  
- Partial indexes  
Otherwise `$search` outperforms `$text`/`$regex`, adds language analyzers, fuzzy, autocomplete, synonyms, facet, highlight, BM25 scoring, single index for arrays, custom analyzers, partial & phrase match, geo (short distance).

## Aggregation Pipeline Rules
```javascript
[
  { $search: { ... , sort: {...}, count: {...}, facet: {...} } }, // filtering, sort, count here
  { $limit: 20 },             // place BEFORE $facet if external facet used
  { $facet: {                 // only if extra, otherwise use $searchMeta
      results: [],
      totalCount: "$$SEARCH_META"
  }}
]
```
Avoid after `$search`:
- `$match` (fold into `compound`; else use `storedSource` + `returnStoredSource`)
- `$group` (use `facet` inside `$searchMeta`)
- `$count` (use `count` in `$search`/`$searchMeta`)
- `$sort` (use `sort` op; for geo use `near`)
- Heavy `$skip`/`$limit`; prefer `searchAfter`/`searchBefore`, then minimal `skip`.

## Pagination Example
```javascript
[
  { $search: { ..., searchAfter: ["id_of_last_doc_pg2"] } },
  { $skip: docsOnPages3and4 },
  { $limit: page5Size }
]
```

## Monitoring
Use Atlas Metrics tab; `mongot` change streams add to query-targeting & getmore metrics. Scale cluster if CPU/mem near limits.



</section>
<section>
<title>Atlas Search Deployment Options</title>
<url>https://mongodb.com/docs/atlas/atlas-search/about/deployment-options/</url>
<description>Deploy mongod and mongot on the same node for testing and on separate search nodes for production.</description>


# Atlas Search Deployment

## Environment Matrix
- Testing (<2 M docs, <10 GB index, <10 k queries/7 d)  
  • Cluster: M0/Flex/M2/M5 (shared/localhost)  
  • MongoDB + Search (`mongod`+`mongot`) share node
- Prototyping  
  • Dedicated M10/M20+ (sharded or RS)  
  • Same-node architecture
- Production  
  • Dedicated cluster M10+ **plus** Search tier S10+  
  • MongoDB nodes separate from Search Nodes  
  • Providers: all GCP, subset AWS/Azure

## Same-Node Architecture (Test/Prototype)
Flow: client → mongod(/mongos) → local mongot → results → mongod → client.  
Sharded clusters: mongos broadcasts to all shards (or zone subset).  
Options:  
- `$search`, `$searchMeta`, `$vectorSearch`, concurrent:true (intra-query parallelism)  
- Stored source fields + `returnStoredSource` avoid full lookup.

Benefits: no extra cost; simple.  
Limits: resource contention; mongot lapses during scale, SSD replacement, version change, node add, reboot, restart, Lucene downgrade → search fails until mongot syncs/restarts.

## Dedicated Search Nodes (Production)
Deployment: ≥2 Search Nodes per cluster/shard; configurable 2-32 nodes, independent CPU/RAM/SSD tier.  
Query path: mongod → local proxy LB → any healthy mongot → IDs → mongod → full doc lookup → client.  
Index build: Atlas syncs indexes to Search Nodes, then deletes on DB nodes; queries cut over after success.

Scaling tips:  
- RAM ≥ working-set of index (preferably index ≤ RAM) to reduce paging faults.  
- Search Nodes require +20 % SSD overhead for Lucene ops.

Benefits: isolate workload, independent scaling, concurrent segment search, HA (min 2 nodes).

Costs: charged per Search Node hour (NVMe); cluster must be M10+.  
Security: optional customer-managed KMS (AWS) for Search Node disks.

## Provisioning Steps
Add new prod cluster:  
1. Create M10+ in region with node isolation.  
2. Enable & configure Search Nodes (count, tier).  

Migrate existing cluster:  
1. Upgrade Flex/shared → M10+.  
2. Move to region that supports Search Nodes if needed.  
3. Enable Search Nodes; Atlas builds indexes, migrates traffic.

## Troubleshooting
Error “Failed to Execute search Command” indicates mongot unavailable: occurs during cluster scale, failover, mongot upgrade when using same-node design. Dedicated Search Nodes use proxy routing to healthy nodes, preventing this error.



</section>
<section>
<title>Monitor Atlas Search</title>
<url>https://mongodb.com/docs/atlas/atlas-search/monitoring/</url>
<description>Learn how to monitor your Atlas Search alerts and metrics, and view analytics for your tagged query terms.</description>


# Monitor Atlas Search

Resource usage (CPU, memory, disk) varies with index config and query complexity. Atlas Search alerts track CPU & memory.  

Links:  
- Manage Atlas Search Alerts  
- Review Atlas Search Metrics  

Tag queries (Track Search Terms) to enable Query Analytics (View Query Analytics) in UI.

</section>
<section>
<title>View Query Analytics</title>
<url>https://mongodb.com/docs/atlas/atlas-search/view-query-analytics/</url>
<description>Learn how to view query analytics for your tracked search terms.</description>


# View Query Analytics

Preview; requires M10+ cluster, MongoDB ≥5.0. Not on free/shared tiers. Metrics shown only for `$search` stages that set `tracking`.

## Open in Atlas UI
1. Clusters → choose cluster  
   Alt paths: Data Explorer → Collection → Search Indexes; or Cluster Details → Atlas Search.
2. Atlas Search → select index → **Query Analytics**.  
   Analytics apply only to this index.

## Date Range
Today, last 7/30/90 days, or custom (UTC), daily granularity.

## Metrics

### All Tracked `$search` Queries
- **Approx # of Tracked `$search` Queries**  
- **Approx % of Top 10 Tracked Queries**  
- Line graph.

“Show Top Search Queries” table:  
`Search Term | Approx # | Approx % | View`.  
View opens term-detail page with:  
• Count, % and graph for range  
• Sample aggregation pipelines list  
• MongoDB API (mongosh) code, Export to Language (drivers)  
• “Open Aggregation Pipeline” link (prefills pipeline).

### Queries With No Results
Same UI; metrics only for tracked queries whose full pipeline returned 0 docs:  
- **Approx # of Search Queries With No Results**  
- **Approx % of Search Queries With No Results**  
- Graph + “Show Top No Results Queries” table (same columns & detail view as above).

## Data Accuracy
- Sampling; values are approximations.  
- Daily cap on unique tracked terms; excess terms ignored, altering counts, %s, and causing gaps.

</section>
<section>
<title>Design Search for Your Data Model</title>
<url>https://mongodb.com/docs/atlas/atlas-search/design-patterns/</url>
<description>Learn common design patterns for Atlas Search so you can effectively query across different data models.</description>


# Design Search for Your Data Model

**Prereqs**
- Atlas cluster ≥4.2 with sample data.
- Role: Project Data Access Admin.
- Tools: Search Tester, `mongosh`, Compass, or any driver (`$search` stage).

**Patterns**
- Non-string fields: convert to string in a materialized view; use `queryString`/`autocomplete`.
- Embedded documents: index array docs with `embeddedDocuments`; query nested fields at any depth.
- Multiple collections:
  - Join: `$lookup` + `$search`.
  - Merge results: `$unionWith`.
  - Consolidate: materialized view.

</section>
<section>
<title>How to Search Non-Alphabetical Data as Strings</title>
<url>https://mongodb.com/docs/atlas/atlas-search/tutorial/string-operators-tutorial/</url>
<description>In this tutorial, learn how to create a materialized view to query non-string fields with operators that only support strings.</description>


# Search Non-Alphabetical Data as Strings

## 1. Materialize Numeric/Date Fields as Strings
```js
// mongosh
db.listingsAndReviews.aggregate([
  {$project:{
    lastScrapedDate:{$dateToString:{format:"%Y-%m-%d",date:"$last_scraped"}},
    propertyName:"$name",
    propertyType:"$property_type",
    accommodatesNumber:{$toString:"$accommodates"},
    maximumNumberOfNights:{$toString:"$maximum_nights"}
  }},
  {$merge:{into:"airbnb_mat_view",whenMatched:"replace"}}
])
```

## 2. Atlas Search Index (`sample_airbnb.airbnb_mat_view`)
Dynamic (queryString):
```json
{"mappings":{"dynamic":true}}
```
Static (autocomplete):
```json
{
 "mappings":{"dynamic":false,"fields":{
   "accommodatesNumber":[{"type":"autocomplete","minGrams":1}],
   "lastScrapedDate":[{"type":"autocomplete"}],
   "maximumNumberOfNights":[{"type":"autocomplete","minGrams":1}]
 }}
}
```

## 3. Query Examples (Node.js driver)
Setup:
```js
const {MongoClient}=require("mongodb");
const uri="<connection-string>";
async function run(agg){
  const client=await MongoClient.connect(uri);
  await client.db("sample_airbnb").collection("airbnb_mat_view")
    .aggregate(agg).forEach(console.log);
  await client.close();
}
```

### 3.1 queryString (requires dynamic index)
AND:
```js
run([
 { $search:{index:"date-number-fields-tutorial",
   queryString:{defaultPath:"propertyType",
     query:"propertyType:(Apartment OR Condominium) AND accommodatesNumber:4 AND lastScrapedDate:2019"}}},
 { $limit:5 }, { $project:{_id:0}}
]);
```
OR:
```js
run([
 { $search:{index:"date-number-fields-tutorial",
   queryString:{defaultPath:"propertyType",
     query:"propertyType:House OR accommodatesNumber:2 OR lastScrapedDate:2019 OR maximumNumberOfNights:30"}}},
 { $limit:5 }, { $project:{_id:0}}
]);
```

### 3.2 autocomplete (requires static index)
Year & nights prefix:
```js
run([
 { $search:{index:"date-number-fields-tutorial",
   compound:{should:[
     {autocomplete:{path:"lastScrapedDate",query:"2"}},
     {autocomplete:{path:"maximumNumberOfNights",query:"1"}}
   ]}}},
 { $limit:5 }, { $project:{_id:0}}
]);
```
Nights & accommodates prefix:
```js
run([
 { $search:{index:"date-number-fields-tutorial",
   compound:{should:[
     {autocomplete:{path:"maximumNumberOfNights",query:"3"}},
     {autocomplete:{path:"accommodatesNumber",query:"2"}}
   ]}}},
 { $limit:5 }, { $project:{_id:0}}
]);
```

Notes:
• Use `$limit` then `$project` to format output.  
• Converted fields are strings—range/near queries not supported.  
• Replace `<connection-string>` with your Atlas URI.

</section>
<section>
<title>How to Run Atlas Search Queries Against Fields in Embedded Documents</title>
<url>https://mongodb.com/docs/atlas/atlas-search/tutorial/embedded-documents-tutorial/</url>
<description>In this tutorial, learn how to create an Atlas Search index for and run Atlas Search queries against fields in documents that are inside an array.</description>


# Atlas Search: Embedded Documents Quick Guide

Sample Data Paths  
- Array docs: `teachers`  
- Nested array docs: `teachers.classes`, `clubs.sports`

## Index (embedded-documents-tutorial)
```json
{
  "mappings":{ "dynamic":true, "fields":{
    "clubs":{"type":"document","dynamic":true,"fields":{
      "sports":{"type":"embeddedDocuments","dynamic":true}
    }},
    "teachers":[
      {"type":"embeddedDocuments","dynamic":true,"fields":{
        "classes":{"type":"embeddedDocuments","dynamic":true}
      }},
      {"type":"document","dynamic":true,"fields":{
        "classes":{"type":"document","dynamic":true,"fields":{
          "grade":{"type":"stringFacet"}
        }}
      }}
    ]
  }}
}
```

## Node.js Aggregations

### 1. Array of Documents (`teachers`)
```js
[
  {$search:{
    index:"embedded-documents-tutorial",
    embeddedDocument:{
      path:"teachers",
      operator:{compound:{
        must:[{text:{path:"teachers.first",query:"John"}}],
        should:[{text:{path:"teachers.last",query:"Smith"}}]
      }}
    },
    highlight:{path:"teachers.last"}
  }},
  {$project:{_id:1,teachers:1,
    score:{$meta:"searchScore"},
    highlights:{$meta:"searchHighlights"}}}
]
```

### 2. Array in Document (`clubs.sports`)
```js
[
  {$search:{
    index:"embedded-documents-tutorial",
    embeddedDocument:{
      path:"clubs.sports",
      operator:{queryString:{
        defaultPath:"clubs.sports.club_name",
        query:"dodgeball OR frisbee"}}
    }
  }},
  {$project:{_id:1,name:1,"clubs.sports":1,
    score:{$meta:"searchScore"}}}
]
```

### 3. Array in Array (`teachers.classes`)
```js
[
  {$search:{
    index:"embedded-documents-tutorial",
    embeddedDocument:{
      path:"teachers",
      operator:{compound:{
        must:[{embeddedDocument:{
          path:"teachers.classes",
          operator:{compound:{must:[
            {text:{path:"teachers.classes.grade",query:"12th"}},
            {text:{path:"teachers.classes.subject",query:"science"}}
          ]}}
        }}],
        should:[{text:{path:"teachers.last",query:"smith"}}]
      }}
    },
    highlight:{path:"teachers.classes.subject"}
  }},
  {$project:{_id:1,teachers:1,
    score:{$meta:"searchScore"},
    highlights:{$meta:"searchHighlights"}}}
]
```

## `$searchMeta` Facet Example
Count grades offered by “High” schools.
```js
[
  {$searchMeta:{
    index:"embedded-documents-tutorial",
    facet:{
      operator:{text:{path:"name",query:"High"}},
      facets:{
        gradeFacet:{type:"string",path:"teachers.classes.grade"}
      }
    }
  }}
]
```

Highlights available only via drivers/`mongosh`.

</section>
<section>
<title>How to Run Atlas Search Queries Across Multiple Collections</title>
<url>https://mongodb.com/docs/atlas/atlas-search/tutorial/cross-collection-tutorials/</url>
<description>MongoDB offers several tutorials on how to run Atlas Search queries across multiple collections.</description>


# Multi-Collection Atlas Search

## Methods
- `$lookup` + `$search`: join collections at query time (MongoDB ≥ 6.0).  
- `$unionWith` + `$search`: union search results from several collections (MongoDB ≥ 6.0; ensure data spans multiple shards).  
- Materialized view: `$merge` pipeline writes to a new collection that you index and query.

Default Search index:
```json
{ "mappings": { "dynamic": true } }
```
Override with `"index"` option in queries.

---

## `$lookup` + `$search` example (Node.js)

```javascript
// lookup-with-search-query.js
const { MongoClient } = require('mongodb');
const uri = '<connection-string>';

const pipeline = [
  { $lookup: {
      from: 'accounts',
      localField: 'accounts',
      foreignField: 'account_id',
      as: 'purchases',
      pipeline: [
        { $search: {
            index: 'lookup-with-search-tutorial',
            compound: {
              must: [{ queryString: {
                defaultPath: 'products',
                query: 'products:(CurrencyService AND InvestmentStock)'
              }}],
              should:[{ range:{ path:'limit', gte:5000, lte:10000 }}]
            } } },
        { $project:{ _id:0 } }
      ] } },
  { $limit: 5 },
  { $project:{ _id:0, address:0, birthdate:0, username:0, tier_and_details:0 } }
];

MongoClient.connect(uri)
  .then(c=>c.db('sample_analytics').collection('customers')
    .aggregate(pipeline).toArray()
    .then(console.log).finally(()=>c.close()));
```

---

## `$unionWith` + `$search` (Node.js)

### Basic
```javascript
const agg = [
  { $search:{ text:{ query:'Mobile', path:'name' } } },
  { $project:{ score:{ $meta:'searchScore' }, _id:0, number_of_employees:1, founded_year:1, name:1 } },
  { $set:{ source:'companies' } },
  { $limit:3 },
  { $unionWith:{
      coll:'inspections',
      pipeline:[
        { $search:{ text:{ query:'Mobile', path:'business_name' } } },
        { $set:{ source:'inspections' } },
        { $project:{ score:{ $meta:'searchScore' }, source:1, _id:0, business_name:1, address:1 } },
        { $limit:3 }, { $sort:{ score:-1 } }
  ]}}
];
```

### Faceted counts
```javascript
const aggFacet = [
  { $search:{ text:{ query:'mobile', path:'name', score:{ boost:{ value:1.6 }}}}},
  { $project:{ score:{ $meta:'searchScore'}, _id:0, number_of_employees:1, founded_year:1, name:1 }},
  { $addFields:{ source:'companies', source_count:'$$SEARCH_META.count.lowerBound' }},
  { $limit:3 },
  { $unionWith:{ coll:'inspections', pipeline:[
      { $search:{ text:{ query:'mobile', path:'business_name' } } },
      { $project:{ score:{ $meta:'searchScore'}, business_name:1, address:1, _id:0 }},
      { $limit:3 },
      { $set:{ source:'inspections', source_count:'$$SEARCH_META.count.lowerBound' }},
      { $sort:{ score:-1 }}
  ]}},
  { $facet:{
      allDocs:[],
      totalCount:[
        { $group:{ _id:'$source', firstCount:{ $first:'$source_count' }}},
        { $project:{ totalCount:{ $sum:'$firstCount' }}}
  ]}}
];
```

Execute with the Node.js driver as in the `$lookup` example.

---

## Materialized View (`sample_supplies`)

Pipeline (run on `sales` and `purchaseOrders`; scheduled or manual):
```javascript
[
  { $match:{ purchaseMethod:'Phone' } },
  { $unwind:'$items' },
  { $group:{
      _id:{ $dateToString:{ format:'%Y-%m', date:'$saleDate' }},
      sales_quantity:{ $sum:'$items.quantity' },
      sales_price:{ $sum:'$items.price' }
  }},
  { $set:{ sales_price:{ $toDouble:'$sales_price' } }},  // convert Decimal128
  { $merge:{ into:'monthlyPhoneTransactions', whenMatched:'replace' } }
]
```
Create dynamic Search index on `monthlyPhoneTransactions`.

Query (>=$10 000 months):
```javascript
db.monthlyPhoneTransactions.aggregate([
  { $search:{ index:'monthlySalesIndex',
              range:{ path:'sales_price', gt:10000 } } },
  { $count:'months_w_over_10000' }
]);
```

---

## Notes
- `$search` must be first stage inside any `$lookup/$unionWith` sub-pipeline.
- Performance: `$lookup` does per-document DB fetch; materialized views trade storage for speed.
- Sharded clusters (v7.0): `$unionWith`+`$search` needs data across multiple shards.

</section>
<section>
<title>Atlas Search Compatibility & Limitations</title>
<url>https://mongodb.com/docs/atlas/atlas-search/about/feature-compatibility/</url>
<description>Learn which MongoDB Atlas Search features are available on which MongoDB versions.</description>


# Atlas Search Compatibility & Limitations

## MongoDB Version Requirements
```
Feature                               Minimum MongoDB
Facets, Stored Source, Query Analytics, Sort        5.0 (Facets 5.0.4+, Source 5.0.6+)
Facets/Sort on Sharded Clusters, $lookup/$unionWith with $search,
Dedicated Search Nodes, Programmatic Index Mgmt, Atlas CLI local,  searchAfter/searchBefore*,  others  6.0+
*searchAfter/searchBefore: 6.0.13+, 7.0.5+, 8.0+
```
Time-series collections unsupported.

## M0/Flex/M2/M5 Cluster Caps
- Max indexes: M0 = 3, M2 = 5, M5/Flex = 10.
- Index JSON ≤ 3 KB; ≤ 1 synonym mapping; ≤ 300 fields.
- Synonyms collection ≤ 10 k docs.
- Lucene BooleanQuery clause limit = 1024.
- Query Analytics, Customer Key Mgmt encryption not supported.
- Upgrading tier rebuilds indexes (initial sync).

## Reference to Other Limits
See docs for Search Playground, Index, Multi-Analyzer, Data-Type, Field-Type, Operator, Option (`sort`, `concurrent`, `highlight`) limitations.

</section>
<section>
<title>FAQ: Atlas Search</title>
<url>https://mongodb.com/docs/atlas/atlas-search/faq/</url>
<description>Find answers to common questions about Atlas Search.</description>


# Atlas Search FAQ (compressed)

- Pricing: Enabling is free; higher resource use possible. Dedicated Search Nodes cost extra.
- Partial string match operators: `autocomplete`, `wildcard`, `regex`.
- Case-insensitive `wildcard`/`regex`: Use custom analyzer `{tokenizer:"keyword",filters:["lowercase"]}`.
- `storedSource` collation: Set collection default collation strength 1 or 2; don’t override in queries/indexes.
- Sharding: Each shard holds its own index data. Adding shards triggers initial sync & brief query downtime. `$search` is scatter-gather; cannot target shard key. Zones restrict to relevant shards only.
- Read preference: Primary by default; configure via standard readPref/tags.
- Duplicate index: Copy JSON via UI → create new index with JSON Editor.
- Memory: Only JVM heap (tokens) in RAM; index files on disk/page cache.
- Disappearing index: Wrong namespace, `$out` overwrite, or reshard removes index; recreate manually.
- Backup restore (`M10+`): Definitions restored; data re-synced by `mongot`, may delay.
- Encryption: Works with CSFLE clients on non-encrypted fields; cannot search encrypted data. Queryable Encryption unsupported.
- Unsupported collections: Time-series.
- Support access: Org-level toggle; 24-h grant possible.
- Multi-collection search: Use `$lookup` or `$unionWith`.

</section>
</guide>