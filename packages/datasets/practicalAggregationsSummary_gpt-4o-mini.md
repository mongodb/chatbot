You are an expert on MongoDB Aggregations. Base your answers on the following content:

Page Url: https://www.practical-mongodb-aggregations.com/advert
# ADVERT: Book Version To Purchase

The official MongoDB Inc. series, _MongoDB Press_, offers paper and downloadable versions published by Packt, featuring extra information and two additional example chapters. 

You can purchase the book from Packt, Amazon, and other retailers using the 20% discount code on the MongoDB Press page.

Page Url: https://www.practical-mongodb-aggregations.com/back-cover


Page Url: https://www.practical-mongodb-aggregations.com/appendices/appendices
# Appendices

This section contains reference material for your MongoDB Aggregations journey.

Page Url: https://www.practical-mongodb-aggregations.com/appendices/book-history
# Book Version History

Summary of significant additions in each major version.

__Version 7.0 (July 2023)__
* Array Fields Joining example chapter
* Role Programmatic Restricted View example chapter

__Version 5.0 (November 2022)__
* State Change Boundaries example chapter
* Array Element Grouping example chapter
* Comparison Of Two Arrays example chapter

__Version 4.0 (June 2022)__
* Compound Text Search Criteria example chapter
* Facets And Counts Text Search example chapter
* Create Atlas Search Index appendix

__Version 3.0 (October 2021)__
* Advanced Use Of Expressions For Array Processing guide chapter
* Summarising Arrays For First, Last, Min, Max & Average example chapter
* Pivot Array Items By A Key example chapter
* Array Sorting & Percentiles example chapter

__Version 2.0 (July 2021)__
* Sharding Considerations guide chapter
* Distinct List Of Values example chapter
* IoT Power Consumption example chapter
* Stages Cheatsheet appendix
* Book Version History appendix

__Version 1.0 (May 2021)__
* Introducing MongoDB Aggregations chapter
* History Of MongoDB Aggregations chapter
* Getting Started chapter
* Getting Help chapter
* Embrace Composability For Increased Productivity guide chapter
* Better Alternatives To A Project Stage guide chapter
* Using Explain Plans guide chapter
* Pipeline Performance Considerations guide chapter
* Expressions Explained guide chapter
* Filtered Top Subset example chapter
* Group & Total example chapter
* Unpack Arrays & Group Differently example chapter
* One-to-One Join example chapter
* Multi-Field Join & One-to-Many example chapter
* Strongly-Typed Conversion example chapter
* Convert Incomplete Date Strings example chapter
* Faceted Classification example chapter
* Largest Graph Network example chapter
* Incremental Analytics example chapter
* Redacted View example chapter
* Mask Sensitive Fields example chapter

Page Url: https://www.practical-mongodb-aggregations.com/examples/foundational/foundational
# Foundational Examples

This section offers examples of common data manipulation patterns in aggregation pipelines that are easy to understand and adapt.

Page Url: https://www.practical-mongodb-aggregations.com/credits
# Practical MongoDB Aggregations

Author: Paul Done (@TheDonester)

Version: 7.00

Last updated: July 2023

MongoDB versions supported: 4.2 → 7.0

Published at: www.practical-mongodb-aggregations.com

Content created at: github.com/pkdone/practical-mongodb-aggregations-book

---

Acknowledgements to: Jake McInteer, John Page, Asya Kamsky, Mat Keep, Brian Leonard, Marcus Eagan, Elle Shwer, Ethan Steininger, Andrew Morgan

---

Front cover image by Henry & Co. from Pexels under the Pexels License

---

This work is licensed under a [Creative Commons Attribution-NonCommercial-ShareAlike 3.0 License](https://creativecommons.org/licenses/by-nc-sa/3.0/)

Copyright &copy; 2021-2023 Paul Done

Page Url: https://www.practical-mongodb-aggregations.com/examples/array-manipulations/array-manipulations
# Array Manipulation Examples

This section provides examples for processing array fields in documents without needing to _unwind_ and _re-group_ arrays. Ensure you read the Advanced Use Of Expressions For Array Processing chapter before this section.

Page Url: https://www.practical-mongodb-aggregations.com/appendices/create-search-index
# Create Atlas Search Index

For Full-Text Search Examples, use an Atlas Cluster, preferably a Free Tier Cluster. Follow these steps to create a search index when prompted:

1. In the Atlas console, click the **Search tab** and then **Create Search Index**.
2. Select **JSON Editor** and click **Next**.
3. Keep **Index Name** as "default", select the **database** and **collection**, paste your JSON index definition, and click **Next**.
4. On the review screen, click **Create Search Index**.

It may take a few minutes to generate the index.

> _You can automate index creation using the Atlas Admin API (MongoDB 4.2+) or the **createSearchIndexes command** (MongoDB 7.0+)._

Page Url: https://www.practical-mongodb-aggregations.com/examples/joining/joining
# Joining Data Examples

This section shows examples of joining a source collection in an aggregation pipeline with another collection using various methods.

Page Url: https://www.practical-mongodb-aggregations.com/intro/introduction
# Introduction

This section explains MongoDB Aggregations, their philosophy, use cases, and the framework's history.

Page Url: https://www.practical-mongodb-aggregations.com/examples/examples
# Aggregations By Example

This section offers examples for common data manipulation challenges, organized by processing requirements. To maximize understanding, try executing each example as you read (refer to Getting Started for execution advice).

Page Url: https://www.practical-mongodb-aggregations.com/who-this-is-for
# Who This Book Is For

This book is for developers, architects, data analysts, data engineers, and data scientists familiar with MongoDB and the Aggregation Framework. If you lack this knowledge, refer to:

* The MongoDB Manual, especially the Aggregation section
* MongoDB University free online courses, particularly the Aggregation introduction course
* _MongoDB: The Definitive Guide_ by Bradshaw, Brazil & Chodorow, focusing on section 7

This book is not for complete novices or a comprehensive programming guide. It aims to:

1. Provide opinionated, digestible principles for effective use of the Aggregation Framework
2. Offer examples for building aggregation pipelines to address data manipulation and analysis challenges

Page Url: https://www.practical-mongodb-aggregations.com/examples/full-text-search/full-text-search
# Full-Text Search Examples

This section provides examples for building an aggregation pipeline for full-text search on document fields in a collection using Atlas Search, which requires an Atlas Cluster.

Atlas Search simplifies adding fast, relevance-based full-text search to applications by deploying an Apache Lucene index alongside your database, managing data and schema synchronization. It offers fuzzy matching, auto-complete, fast facets, highlighting, relevance scoring, geospatial queries, and synonyms, supporting multiple language analyzers. Searches are invoked via standard MongoDB drivers and Aggregations API, avoiding a 3rd party Lucene API.

With Atlas's integration of database, search engine, and synchronization into a unified managed service, you can quickly build search features. Use Atlas Search over MongoDB's `$text` and `$regex` operators when using Atlas.

Page Url: https://www.practical-mongodb-aggregations.com/intro/introducing-aggregations
# Introducing MongoDB Aggregations

## What Is MongoDB’s Aggregation Framework?

MongoDB’s Aggregation Framework allows users to execute analytics or data processing workloads via an aggregation language. It consists of:

1. The Aggregations API in the MongoDB Driver for defining a pipeline and sending it to the database.
2. The Aggregation Runtime in the database that processes the pipeline against stored data.

The driver supports both MongoDB Query Language (MQL) and the Aggregation Framework, with the Aggregation Runtime optimizing query execution.

## What Is MongoDB's Aggregation Language?

MongoDB's aggregation pipeline language is both powerful and complex. It is Turing complete and designed for mass data manipulation, but it can be challenging for beginners due to its steep learning curve. Once mastered, it simplifies complex data manipulations into clear steps.

The pipeline consists of ordered stages where the output of one stage is the input for the next, emphasizing "the what" over "the how." This functional programming approach allows the database engine to optimize execution, such as reordering stages or parallel processing.

Aggregation pipelines are constructed using a JSON-based syntax, but when using programming language drivers, they are specified as arrays of objects, enhancing security and composability.

## What's In A Name?

Terms like Aggregation, Aggregations, Aggregation Framework, and Aggregation Pipeline are interchangeable. This flexibility reflects the capability's engineering origins rather than marketing.

## What Do People Use The Aggregation Framework For?

The Aggregation Framework is used for various tasks, including:

- Real-time analytics
- Report generation
- Real-time dashboards
- Server-side data joining
- Data science and wrangling
- Mass data analysis
- Complex real-time queries
- Data copying and transformation
- Relationship navigation
- Data masking
- ELT workloads
- Data quality reporting
- Materialized view updates
- Full-text search
- SQL/ODBC/JDBC data representation
- Machine learning support
- _...and more_

Page Url: https://www.practical-mongodb-aggregations.com/intro/getting-started
# Getting Started

To develop aggregation pipelines and try examples in this book, you need:

1. A __MongoDB database__, __version 4.2 or greater__, accessible from your workstation.
2. A __MongoDB client tool__ on your workstation to submit aggregation requests and view results.

Each example aggregation pipeline specifies the minimum MongoDB version required. Some pipelines use features from versions after 4.2.

## Database

You can connect to a single server, replica set, or sharded cluster, either locally or remotely. You need the MongoDB URL and credentials for read/write access.

For free database options:

1. Provision a Free Tier MongoDB Cluster in MongoDB Atlas (copy the URL from the Atlas Console).
2. Install and run a MongoDB single server locally.

Note: Full-Text Search Examples require Atlas for deployment.

## Client Tool

Options for client tools include:

1. __*Modern* Shell__: Install MongoDB Shell: `mongosh`.
2. __*Legacy* Shell__: Install Mongo Shell: `mongo`.
3. __VS Code__: Use MongoDB for VS Code with Playgrounds.
4. __Compass__: Use MongoDB Compass GUI.
5. __Studio 3T__: Use Studio 3T GUI.

Examples are formatted for easy copying into MongoDB Shell (`mongosh` or `mongo`). The _modern_ Shell is easier for viewing results.

### MongoDB Shell With Atlas Database

To connect to an Atlas Free Tier MongoDB Cluster:

```bash
mongosh "mongodb+srv://mycluster.a123b.mongodb.net/test" --username myuser
```

Ensure:
1. Your IP is in the Atlas Access List.
2. A database user with read/write rights is created.
3. Replace the URL and username with your cluster's details.

### MongoDB Shell With Local Database

To connect to a local MongoDB server:

```bash
mongosh "mongodb://localhost:27017"
```

### MongoDB For VS Code

Use the MongoDB _playground_ tool in VS Code to prototype queries and aggregation pipelines, executing them against a MongoDB database.

### MongoDB Compass GUI

MongoDB Compass includes an _Aggregation Pipeline Builder_ for prototyping and debugging aggregation pipelines.

### Studio 3T GUI

Studio 3T features an _Aggregation Editor_ for prototyping and debugging aggregation pipelines.

Page Url: https://www.practical-mongodb-aggregations.com/examples/full-text-search/compound-text-search
# Compound Text Search Criteria

__Minimum MongoDB Version:__ 4.2

## Scenario

You want to search an e-commerce collection for specific movie DVDs with a _post-apocalyptic_ theme related to a _nuclear_ disaster where some people _survive_, excluding _zombies_.

> _Use an Atlas Cluster, preferably a Free Tier._

## Sample Data Population

Drop any existing database and populate a new _products_ collection with _DVD_ and _Book_ records:

```javascript
db = db.getSiblingDB("book-compound-text-search");
db.products.remove({});
db.products.insertMany([
  {"name": "The Road", "category": "DVD", "description": "In a dangerous post-apocalyptic world, a dying father protects his surviving son as they try to reach the coast"},
  {"name": "The Day Of The Triffids", "category": "BOOK", "description": "Post-apocalyptic disaster where most people are blinded by a meteor shower and then die at the hands of a new type of plant"},
  {"name": "The Day the Earth Caught Fire", "category": "DVD", "description": "A series of nuclear explosions cause fires and earthquakes to ravage cities, with some of those that survive trying to rescue the post-apocalyptic world"},
  {"name": "28 Days Later", "category": "DVD", "description": "A caged chimp infected with a virus is freed from a lab, and the infection spreads to people who become zombie-like with just a few surviving in a post-apocalyptic country"},
  {"name": "Don't Look Up", "category": "DVD", "description": "Pre-apocalyptic situation where some astronomers warn humankind of an approaching comet that will destroy planet Earth"},
  {"name": "Thirteen Days", "category": "DVD", "description": "Based on the true story of the Cuban nuclear missile threat, crisis is averted at the last minute and the world survives"},
]); 
```

Define a **Search Index** for the collection **book-compound-text-search.products**:

```javascript
{
  "searchAnalyzer": "lucene.english",
  "mappings": {
    "dynamic": true
  }
}
```

## Aggregation Pipeline

Define the aggregation pipeline:

```javascript
var pipeline = 
  {"$search": {
    "index": "default",    
    "compound": {
      "must": [{"text": {"path": "description", "query": "apocalyptic"}}],
      "should": [{"text": {"path": "description", "query": "nuclear survives"}}],
      "mustNot": [{"text": {"path": "description", "query": "zombie"}}],
      "filter": [{"text": {"path": "category", "query": "DVD"}}],
    }
  }},
  {"$set": {
    "score": {"$meta": "searchScore"},
    "_id": "$$REMOVE",
  }},
];
```

## Execution

Execute the aggregation and view its explain plan:

```javascript
db.products.aggregate(pipeline);
db.products.explain("executionStats").aggregate(pipeline);
```

## Expected Results

Three documents should be returned:

```javascript
[
  {name: 'The Day the Earth Caught Fire', category: 'DVD', description: 'A series of nuclear explosions cause fires and earthquakes to ravage cities, with some of those that survive trying to rescue the post-apocalyptic world', score: 0.8468831181526184},
  {name: 'The Road', category: 'DVD', description: 'In a dangerous post-apocalyptic world, a dying father protects his surviving son as they try to reach the coast', score: 0.3709350824356079},
  {name: "Don't Look Up", category: 'DVD', description: 'Pre-apocalyptic situation where some astronomers warn humankind of an approaching comet that will destroy planet Earth', score: 0.09836573898792267}
]
```

## Observations

* __Search Stage.__ The [`$search` stage] is only available in Atlas-based MongoDB and must be the first stage of an aggregation pipeline, executing a text search against a _Lucene_ index. The pipeline uses a `$compound` operator for multiple text-search operators.

* __Results & Relevancy Explanation.__ The pipeline excludes four documents, sorting the remaining three by relevancy based on matching terms in the `description` field.

* __English Language Analyzer.__ The _lucene.english_ analyzer is used to match variations of English words.

* __Meta Operator.__ The `$meta` operator provides metadata about the text search results, allowing access to the relevancy score for sorting.

Page Url: https://www.practical-mongodb-aggregations.com/examples/joining/one-to-one-join
# One-to-One Join

__Minimum MongoDB Version:__ 4.4 _(due to `$first` operator)_

## Scenario

To generate a report listing shop purchases for 2020 with product names and categories, join the _orders_ collection with the _products_ collection using the product's id.

## Sample Data Population

Drop any existing database and populate new `products` and `orders` collections:

&nbsp;__-Part 1-__

```javascript
db = db.getSiblingDB("book-one-to-one-join");
db.dropDatabase();
db.products.createIndex({"id": 1});
db.products.insertMany([
  {"id": "a1b2c3d4", "name": "Asus Laptop", "category": "ELECTRONICS"},
  {"id": "z9y8x7w6", "name": "The Day Of The Triffids", "category": "BOOKS"},
  {"id": "ff11gg22hh33", "name": "Morphy Richardds Food Mixer", "category": "KITCHENWARE"},
  {"id": "pqr678st", "name": "Karcher Hose Set", "category": "GARDEN"},
]); 
```

&nbsp;__-Part 2-__

```javascript
db.orders.createIndex({"orderdate": -1});
db.orders.insertMany([
  {"customer_id": "elise_smith@myemail.com", "orderdate": ISODate("2020-05-30T08:35:52Z"), "product_id": "a1b2c3d4", "value": NumberDecimal("431.43")},
  {"customer_id": "tj@wheresmyemail.com", "orderdate": ISODate("2019-05-28T19:13:32Z"), "product_id": "z9y8x7w6", "value": NumberDecimal("5.01")},
  {"customer_id": "oranieri@warmmail.com", "orderdate": ISODate("2020-01-01T08:25:37Z"), "product_id": "ff11gg22hh33", "value": NumberDecimal("63.13")},
  {"customer_id": "jjones@tepidmail.com", "orderdate": ISODate("2020-12-26T08:55:46Z"), "product_id": "a1b2c3d4", "value": NumberDecimal("429.65")},
]);
```

## Aggregation Pipeline

Define the aggregation pipeline:

```javascript
var pipeline = [
  {"$match": {"orderdate": {"$gte": ISODate("2020-01-01T00:00:00Z"), "$lt": ISODate("2021-01-01T00:00:00Z")}}},
  {"$lookup": {"from": "products", "localField": "product_id", "foreignField": "id", "as": "product_mapping"}},
  {"$set": {"product_mapping": {"$first": "$product_mapping"}}},
  {"$set": {"product_name": "$product_mapping.name", "product_category": "$product_mapping.category"}},
  {"$unset": ["_id", "product_id", "product_mapping"]},
];
```

## Execution

Execute the aggregation and view its explain plan:

```javascript
db.orders.aggregate(pipeline);
db.orders.explain("executionStats").aggregate(pipeline);
```

## Expected Results

Three documents should be returned, with `product_id` replaced by `product_name` and `product_category`:

```javascript
[
  {customer_id: 'elise_smith@myemail.com', orderdate: ISODate('2020-05-30T08:35:52.000Z'), value: NumberDecimal('431.43'), product_name: 'Asus Laptop', product_category: 'ELECTRONICS'},
  {customer_id: 'oranieri@warmmail.com', orderdate: ISODate('2020-01-01T08:25:37.000Z'), value: NumberDecimal('63.13'), product_name: 'Morphy Richardds Food Mixer', product_category: 'KITCHENWARE'},
  {customer_id: 'jjones@tepidmail.com', orderdate: ISODate('2020-12-26T08:55:46.000Z'), value: NumberDecimal('429.65'), product_name: 'Asus Laptop', product_category: 'ELECTRONICS'}
]
```

## Observations

* __Single Field Match.__ The pipeline uses a `$lookup` join on a single field. For multi-field joins, see the Multi-Field Join & One-to-Many example.
* __First Element Assumption.__ The join is 1:1, so the pipeline extracts the first array element using `$first`. For 1:many joins, see the Multi-Field Join & One-to-Many example.
* __First Element for Earlier MongoDB Versions.__ Replace `$first` with `$arrayElemAt` for versions before 4.4:

```javascript
"product_mapping": {"$arrayElemAt": ["$product_mapping", 0]},
```

Page Url: https://www.practical-mongodb-aggregations.com/intro/history
# History Of MongoDB Aggregations

## The Emergence Of Aggregations

MongoDB version 1.0 was released in February 2009, with users and MongoDB Inc. exploring use cases. By December 2009, a Map-Reduce API was introduced to generate materialized views for real-time applications. Map-Reduce involves two phases: "map" scans and transforms data, while "reduce" condenses it into summaries. However, it has drawbacks:

1. Slow JavaScript engine execution.
2. Requires two JavaScript functions (map and reduce).
3. Limited optimization opportunities due to lack of intent association.
4. Response payloads must be under 16MB.

As user needs evolved, MongoDB engineers sought a better solution, leading to the Aggregation Framework in August 2012 (version 2.2). This framework allows developers to define data manipulation steps with clear intent, enabling optimizations and eliminating the need for a JavaScript engine. The Aggregation Framework quickly became the preferred tool for processing large data volumes.

MongoDB still supports Map-Reduce, but it is rarely used. In MongoDB 4.4, the Map-Reduce backend was re-implemented to run within the aggregation runtime, introducing new stages and operators like `$function` and `$accumulator`. However, Map-Reduce still relies on JavaScript and does not match the performance or composability of native aggregations. Version 5.0 deprecated Map-Reduce, with potential removal in future versions.

## Key Releases & Capabilities 

Significant Aggregation Framework capabilities added in major releases:

* __MongoDB 2.2 (August 2012)__: Initial Release
* __MongoDB 2.4 (March 2013)__: Efficiency improvements, concat operator
* __MongoDB 2.6 (April 2014)__: Unlimited result sets, explain plans, spill to disk, output to new collection, redact stage
* __MongoDB 3.0 (March 2015)__: Date-to-string operators
* __MongoDB 3.2 (December 2015)__: Sharded cluster optimizations, lookup (join) & sample stages, new arithmetic & array operators
* __MongoDB 3.4 (November 2016)__: Graph-lookup, bucketing & facets stages, new array & string operators 
* __MongoDB 3.6 (November 2017)__: Array to/from object operators, extensive date to/from string operators, REMOVE variable
* __MongoDB 4.0 (July 2018)__: Number to/from string operators, string trimming operators
* __MongoDB 4.2 (August 2019)__: Merge stage for records, set & unset stages, trigonometry operators, regex operators, Atlas Search integration
* __MongoDB 4.4 (July 2020)__: Union stage, custom JavaScript operator expressions, first & last array element operators, string replacement operators, random number operator
* __MongoDB 5.0 (July 2021)__: SetWindowFields stage, time-series/window operators, date manipulation operators
* __MongoDB 6.0 (July 2022)__: Support for lookup & graph-lookup stages with sharded collections, new densify, documents & fill stages, new array sorting & linearFill operators, new operators for ordered arrays or grouped documents
* __MongoDB 7.0 (August 2023)__: User roles system variable for pipelines, new median and percentile operators

Page Url: https://www.practical-mongodb-aggregations.com/examples/array-manipulations/comparison-of-two-arrays
# Comparison Of Two Arrays

__Minimum MongoDB Version:__ 4.4 _(due to use of `$first` array operator)_

## Scenario

As an IT administrator, you need to report configuration changes of virtual machines over two days, based on a database collection.

## Sample Data Population

Drop any old database version and populate the deployments collection:

```javascript
db = db.getSiblingDB("book-comparison-of-two-arrays");
db.dropDatabase();

db.deployments.insertMany([
  {
    "name": "ProdServer",
    "beforeTimestamp": ISODate("2022-01-01T00:00:00Z"),
    "afterTimestamp": ISODate("2022-01-02T00:00:00Z"),
    "beforeConfig": {"vcpus": 8, "ram": 128, "storage": 512, "state": "running"},
    "afterConfig": {"vcpus": 16, "ram": 256, "storage": 512, "state": "running"},
  },
  {
    "name": "QAServer",
    "beforeTimestamp": ISODate("2022-01-01T00:00:00Z"),
    "afterTimestamp": ISODate("2022-01-02T00:00:00Z"),
    "beforeConfig": {"vcpus": 4, "ram": 64, "storage": 512, "state": "paused"},
    "afterConfig": {"vcpus": 4, "ram": 64, "storage": 256, "state": "running", "extraParams": "disableTLS;disableCerts;"}
  },
  {
    "name": "LoadTestServer",
    "beforeTimestamp": ISODate("2022-01-01T00:00:00Z"),
    "beforeConfig": {"vcpus": 8, "ram": 128, "storage": 256, "state": "running"},
  },
  {
    "name": "IntegrationServer",
    "beforeTimestamp": ISODate("2022-01-01T00:00:00Z"),
    "afterTimestamp": ISODate("2022-01-02T00:00:00Z"),
    "beforeConfig": {"vcpus": 4, "ram": 32, "storage": 64, "state": "running"},
    "afterConfig": {"vcpus": 4, "ram": 32, "storage": 64, "state": "running"},
  },
  {
    "name": "DevServer",
    "afterTimestamp": ISODate("2022-01-02T00:00:00Z"),
    "afterConfig": {"vcpus": 2, "ram": 16, "storage": 64, "state": "running"},
  },
]);
```

## Aggregation Pipeline

Define functions to get unique keys from two arrays and to get a field value known at runtime:

```javascript
function getArrayOfTwoSubdocsKeysNoDups(firstArrayRef, secondArrayRef) {
  return {
    "$setUnion": {
      "$concatArrays": [
        {"$map": {"input": {"$objectToArray": firstArrayRef}, "in": "$$this.k"}},
        {"$map": {"input": {"$objectToArray": secondArrayRef}, "in": "$$this.k"}},
      ]
    }
  };
}

function getDynamicField(obj, fieldname) {
  return {
    "$first": [
      {"$map": {
        "input": {
          "$filter": {
            "input": {"$objectToArray": obj},
            "as": "currObj",
            "cond": {"$eq": ["$$currObj.k", fieldname]},
            "limit": 1
          }
        },
        "in": "$$this.v"
      }},
    ]
  };
}
```

Define the aggregation pipeline:

```javascript
var pipeline = [
  {"$set": {
    "differences": {
      "$reduce": {
        "input": getArrayOfTwoSubdocsKeysNoDups("$beforeConfig", "$afterConfig"),
        "initialValue": [],
        "in": {
          "$concatArrays": [
            "$$value",
            {"$cond": {
              "if": {
                "$ne": [
                  getDynamicField("$beforeConfig", "$$this"),
                  getDynamicField("$afterConfig", "$$this"),
                ]
              },
              "then": [{
                "field": "$$this",
                "change": {
                  "$concat": [
                    {"$ifNull": [{"$toString": getDynamicField("$beforeConfig", "$$this")}, "<not-set>"]},
                    " --> ",
                    {"$ifNull": [{"$toString": getDynamicField("$afterConfig", "$$this")}, "<not-set>"]},
                  ]
                },
              }],
              "else": [],
            }}
          ]
        }
      }
    },
  }},
  {"$set": {
    "status": {
      "$switch": {
        "branches": [
          {"case": {"$and": [{"$in": [{"$type": "$differences"}, ["missing", "null"]]}, {"$in": [{"$type": "$beforeConfig"}, ["missing", "null"]]}]}, "then": "ADDED"},
          {"case": {"$and": [{"$in": [{"$type": "$differences"}, ["missing", "null"]]}, {"$in": [{"$type": "$afterConfig"}, ["missing", "null"]]}]}, "then": "REMOVED"},
          {"case": {"$lte": [{"$size": "$differences"}, 0]}, "then": "UNCHANGED"},
          {"case": {"$gt": [{"$size": "$differences"}, 0]}, "then": "MODIFIED"},
        ],
        "default": "UNKNOWN",
      }
    },
    "differences": {
      "$cond": [
        {"$or": [{"$in": [{"$type": "$differences"}, ["missing", "null"]]}, {"$lte": [{"$size": "$differences"}, 0]}]},
        "$$REMOVE",
        "$differences"
      ]
    },
  }},
  {"$unset": ["_id", "beforeTimestamp", "afterTimestamp", "beforeConfig", "afterConfig"]},
];
```

## Execution

Execute the aggregation and view its explain plan:

```javascript
db.deployments.aggregate(pipeline);
db.deployments.explain("executionStats").aggregate(pipeline);
```

## Expected Results

Five documents should indicate whether deployments were added, removed, modified, or unchanged, with changes shown if modified:

```javascript
[
  {
    "name": "ProdServer",
    "status": "MODIFIED",
    "differences": [
      {"field": "vcpus", "change": "8 --> 16"},
      {"field": "ram", "change": "128 --> 256"}
    ]
  },
  {
    "name": "QAServer",
    "status": "MODIFIED",
    "differences": [
      {"field": "storage", "change": "512 --> 256"},
      {"field": "state", "change": "paused --> running"},
      {"field": "extraParams", "change": "<not-set> --> disableTLS;disableCerts;"}
    ]
  },
  {
    "name": "LoadTestServer",
    "status": "REMOVED"
  },
  {
    "name": "IntegrationServer",
    "status": "UNCHANGED"
  },
  {
    "name": "DevServer",
    "status": "ADDED"
  }
]
```

## Observations

* __Reusable Macro Functions.__ The aggregation uses macro functions for boilerplate code, reusable in other solutions.

* __Sub-Document Comparison.__ The pipeline compares topmost fields of two sub-documents with primitive values. It finds all field names in either sub-document and compares their values.

* __Potential Need For Earlier Stages.__ In real-world models, configuration snapshots may correspond to different records. In such cases, include `$sort` and `$group` stages to capture `beforeConfig` and `afterConfig` fields. The rest of the pipeline remains unchanged.

Page Url: https://www.practical-mongodb-aggregations.com/examples/time-series/time-series
# Time-Series Examples

This section shows how to aggregate time-series data, often used in financial datasets and IoT.

Page Url: https://www.practical-mongodb-aggregations.com/examples/array-manipulations/array-high-low-avg
# Summarising Arrays For First, Last, Minimum, Maximum & Average Values

__Minimum MongoDB Version:__ 4.4 _(due to `$first` and `$last` operators)_

## Scenario

Generate daily summaries for foreign currency "pairs" (e.g., "Euro-to-USDollar") from an array of hourly rates, outputting open (first), close (last), low (minimum), high (maximum), and average exchange rates.

## Sample Data Population

Drop any old database and populate the new _currency-pair daily_ collection:

```javascript
db = db.getSiblingDB("book-array-high-low-avg");
db.dropDatabase();

db.currency_pair_values.insertMany([
  {
    "currencyPair": "USD/GBP",
    "day": ISODate("2021-07-05T00:00:00.000Z"),
    "hour_values": [
      NumberDecimal("0.71903411"), NumberDecimal("0.72741832"), NumberDecimal("0.71997271"),
      NumberDecimal("0.73837282"), NumberDecimal("0.75262621"), NumberDecimal("0.74739202"),
      NumberDecimal("0.72972612"), NumberDecimal("0.73837292"), NumberDecimal("0.72393721"),
      NumberDecimal("0.72746837"), NumberDecimal("0.73787372"), NumberDecimal("0.73746483"),
      NumberDecimal("0.73373632"), NumberDecimal("0.75737372"), NumberDecimal("0.76783263"),
      NumberDecimal("0.75632828"), NumberDecimal("0.75362823"), NumberDecimal("0.74682282"),
      NumberDecimal("0.74628263"), NumberDecimal("0.74726262"), NumberDecimal("0.75376722"),
      NumberDecimal("0.75799222"), NumberDecimal("0.75545352"), NumberDecimal("0.74998835"),
    ],
  },
  {
    "currencyPair": "EUR/GBP",
    "day": ISODate("2021-07-05T00:00:00.000Z"),
    "hour_values": [
      NumberDecimal("0.86739394"), NumberDecimal("0.86763782"), NumberDecimal("0.87362937"),
      NumberDecimal("0.87373652"), NumberDecimal("0.88002736"), NumberDecimal("0.87866372"),
      NumberDecimal("0.87862628"), NumberDecimal("0.87374621"), NumberDecimal("0.87182626"),
      NumberDecimal("0.86892723"), NumberDecimal("0.86373732"), NumberDecimal("0.86017236"),
      NumberDecimal("0.85873636"), NumberDecimal("0.85762283"), NumberDecimal("0.85362373"),
      NumberDecimal("0.85306218"), NumberDecimal("0.85346632"), NumberDecimal("0.84647462"),
      NumberDecimal("0.84694720"), NumberDecimal("0.84723232"), NumberDecimal("0.85002222"),
      NumberDecimal("0.85468322"), NumberDecimal("0.85675656"), NumberDecimal("0.84811122"),
    ],
  },
]);
```

## Aggregation Pipeline

Define a pipeline for aggregation:

```javascript
var pipeline = [
  {"$set": {
    "summary.open": {"$first": "$hour_values"},
    "summary.low": {"$min": "$hour_values"},
    "summary.high": {"$max": "$hour_values"},
    "summary.close": {"$last": "$hour_values"},
    "summary.average": {"$avg": "$hour_values"},
  }},
  {"$unset": ["_id", "hour_values"]},
];
```

## Execution

Execute the aggregation and view its explain plan:

```javascript
db.currency_pair_values.aggregate(pipeline);
db.currency_pair_values.explain("executionStats").aggregate(pipeline);
```

## Expected Results

Two documents should return daily summaries for each currency pair:

```javascript
[
  {
    currencyPair: 'USD/GBP',
    day: ISODate("2021-07-05T00:00:00.000Z"),
    summary: {
      open: NumberDecimal("0.71903411"),
      low: NumberDecimal("0.71903411"),
      high: NumberDecimal("0.76783263"),
      close: NumberDecimal("0.74998835"),
      average: NumberDecimal("0.74275533")
    }
  },
  {
    currencyPair: 'EUR/GBP',
    day: ISODate("2021-07-05T00:00:00.000Z"),
    summary: {
      open: NumberDecimal("0.86739394"),
      low: NumberDecimal("0.84647462"),
      high: NumberDecimal("0.88002736"),
      close: NumberDecimal("0.84811122"),
      average: NumberDecimal("0.86186929875")
    }
  }
]
```

## Observations

* __`$first` & `$last` Alternatives.__ For MongoDB versions before 4.4, replace `$first` and `$last` with `$arrayElemAt`:

```javascript
"summary.open": {"$arrayElemAt": ["$hour_values", 0]},
"summary.close": {"$arrayElemAt": ["$hour_values", -1]},
```

Page Url: https://www.practical-mongodb-aggregations.com/examples/joining/multi-one-to-many
# Multi-Field Join & One-to-Many

__Minimum MongoDB Version:__ 4.2

## Scenario

To generate a report listing all orders for each product in 2020, join the _products_ collection with the _orders_ collection using two fields: `product_name` and `product_variation`.

## Sample Data Population

Drop any existing database and populate new `products` and `orders` collections:

&nbsp;__-Part 1-__

```javascript
db = db.getSiblingDB("book-multi-one-to-many");
db.dropDatabase();

db.products.insertMany([
  {"name": "Asus Laptop", "variation": "Ultra HD", "category": "ELECTRONICS", "description": "Great for watching movies"},
  {"name": "Asus Laptop", "variation": "Normal Display", "category": "ELECTRONICS", "description": "Good value laptop for students"},
  {"name": "The Day Of The Triffids", "variation": "1st Edition", "category": "BOOKS", "description": "Classic post-apocalyptic novel"},
  {"name": "The Day Of The Triffids", "variation": "2nd Edition", "category": "BOOKS", "description": "Classic post-apocalyptic novel"},
  {"name": "Morphy Richards Food Mixer", "variation": "Deluxe", "category": "KITCHENWARE", "description": "Luxury mixer turning good cakes into great"},
  {"name": "Karcher Hose Set", "variation": "Full Monty", "category": "GARDEN", "description": "Hose + nozzles + winder for tidy storage"},
]); 
```

&nbsp;__-Part 2-__

```javascript
db.orders.createIndex({"product_name": 1, "product_variation": 1});

db.orders.insertMany([
  {"customer_id": "elise_smith@myemail.com", "orderdate": ISODate("2020-05-30T08:35:52Z"), "product_name": "Asus Laptop", "product_variation": "Normal Display", "value": NumberDecimal("431.43")},
  {"customer_id": "tj@wheresmyemail.com", "orderdate": ISODate("2019-05-28T19:13:32Z"), "product_name": "The Day Of The Triffids", "product_variation": "2nd Edition", "value": NumberDecimal("5.01")},
  {"customer_id": "oranieri@warmmail.com", "orderdate": ISODate("2020-01-01T08:25:37Z"), "product_name": "Morphy Richards Food Mixer", "product_variation": "Deluxe", "value": NumberDecimal("63.13")},
  {"customer_id": "jjones@tepidmail.com", "orderdate": ISODate("2020-12-26T08:55:46Z"), "product_name": "Asus Laptop", "product_variation": "Normal Display", "value": NumberDecimal("429.65")},
]);
```

## Aggregation Pipeline

Define the aggregation pipeline:

```javascript
var pipeline = [
  {"$lookup": {
    "from": "orders",
    "let": {"prdname": "$name", "prdvartn": "$variation"},
    "pipeline": [
      {"$match": {"$expr": {"$and": [{"$eq": ["$product_name", "$$prdname"]}, {"$eq": ["$product_variation", "$$prdvartn"]}]} }}},
      {"$match": {"orderdate": {"$gte": ISODate("2020-01-01T00:00:00Z"), "$lt": ISODate("2021-01-01T00:00:00Z")}}},
      {"$unset": ["_id", "product_name", "product_variation"]},
    ],
    as: "orders",
  }},
  {"$match": {"orders": {"$ne": []}}},
  {"$unset": ["_id"]}, 
];
```

## Execution

Execute the aggregation and view its explain plan:

```javascript
db.products.aggregate(pipeline);
```

```javascript
db.products.explain("executionStats").aggregate(pipeline);
```

## Expected Results

Two documents should be returned, representing products with orders in 2020:

```javascript
[
  {
    name: 'Asus Laptop',
    variation: 'Normal Display',
    category: 'ELECTRONICS',
    description: 'Good value laptop for students',
    orders: [
      {"customer_id": 'elise_smith@myemail.com', "orderdate": ISODate('2020-05-30T08:35:52.000Z'), "value": NumberDecimal('431.43')},
      {"customer_id": 'jjones@tepidmail.com', "orderdate": ISODate('2020-12-26T08:55:46.000Z'), "value": NumberDecimal('429.65')}
    ]
  },
  {
    name: 'Morphy Richards Food Mixer',
    variation: 'Deluxe',
    category: 'KITCHENWARE',
    description: 'Luxury mixer turning good cakes into great',
    orders: [
      {"customer_id": 'oranieri@warmmail.com', "orderdate": ISODate('2020-01-01T08:25:37.000Z'), "value": NumberDecimal('63.13')}
    ]
  }
]
```

## Observations

* __Multiple Join Fields.__ Use a `let` parameter for multiple fields in joins, binding them into variables for the embedded pipeline in `$lookup`. The `$expr` operator allows for index usage.
* __Reducing Array Content.__ The embedded pipeline in `$lookup` can filter unwanted fields. For complex filtering, refer to the _Pipeline Performance Considerations_ chapter.

Page Url: https://www.practical-mongodb-aggregations.com/examples/full-text-search/facets-and-counts-text-search
# Facets And Counts Text Search

__Minimum MongoDB Version:__ 4.4 _(due to the `facet` option in the `$searchMeta` stage)_

## Scenario

You analyze customer telephone enquiries at a bank's call centre, focusing on calls mentioning _fraud_ to understand when these occur for staffing purposes.

> _Use an Atlas Cluster, preferably a Free Tier, for this example._

## Sample Data Population

Drop any existing database and populate a new _enquiries_ collection:

```javascript
db = db.getSiblingDB("book-facets-text-search");
db.enquiries.remove({});
db.enquiries.insertMany([
  {"acountId": "9913183", "datetime": ISODate("2022-01-30T08:35:52Z"), "summary": "Balance enquiry only"},
  {"acountId": "9913183", "datetime": ISODate("2022-01-30T09:32:07Z"), "summary": "Reported suspected fraud"},
  {"acountId": "6830859", "datetime": ISODate("2022-01-30T10:25:37Z"), "summary": "Transaction could be fraud"},
  {"acountId": "9899216", "datetime": ISODate("2022-01-30T11:13:32Z"), "summary": "Struggling financially"},
  {"acountId": "1766583", "datetime": ISODate("2022-01-30T10:56:53Z"), "summary": "Fraud reported"},
  {"acountId": "9310399", "datetime": ISODate("2022-01-30T14:04:48Z"), "summary": "Fraud call check"},
  {"acountId": "4542001", "datetime": ISODate("2022-01-30T16:55:46Z"), "summary": "Loan enquiry"},
  {"acountId": "7387756", "datetime": ISODate("2022-01-30T17:49:32Z"), "summary": "Frozen account due to fraud"},
  {"acountId": "3987992", "datetime": ISODate("2022-01-30T22:49:44Z"), "summary": "Claiming fraud"},
  {"acountId": "7362872", "datetime": ISODate("2022-01-31T07:07:14Z"), "summary": "Worst case of fraud"},
]);
```

Define a **Search Index** for the **book-facets-text-search.enquiries** collection:

```javascript
{
  "analyzer": "lucene.english",
  "searchAnalyzer": "lucene.english",
  "mappings": {
    "dynamic": true,
    "fields": {
      "datetime": {"type": "date"},
      {"type": "dateFacet"}
    }
  }
}
```

## Aggregation Pipeline

Define the aggregation pipeline:

```javascript
var pipeline = [
  {"$searchMeta": {
    "index": "default",    
    "facet": {
      "operator": {
        "compound": {
          "must": [{"text": {"path": "summary", "query": "fraud"}}],
          "filter": [{"range": {"path": "datetime", "gte": ISODate("2022-01-30"), "lt": ISODate("2022-01-31")}}],
        },
      },
      "facets": {        
        "fraudEnquiryPeriods": {
          "type": "date",
          "path": "datetime",
          "boundaries": [
            ISODate("2022-01-30T00:00:00.000Z"),
            ISODate("2022-01-30T06:00:00.000Z"),
            ISODate("2022-01-30T12:00:00.000Z"),
            ISODate("2022-01-30T18:00:00.000Z"),
            ISODate("2022-01-31T00:00:00.000Z"),
          ],
        }            
      }        
    }           
  }},
];
```

## Execution

Execute the aggregation:

```javascript
db.enquiries.aggregate(pipeline);
```

## Expected Results

The results should show 6 documents matched for _fraud_ on 30-Jan-2022, distributed across four 6-hour periods:

```javascript
[
  {
    count: { lowerBound: Long("6") },
    facet: {
      fraudEnquiryPeriods: {
        buckets: [
          {_id: ISODate("2022-01-30T00:00:00.000Z"), count: Long("0")},
          {_id: ISODate("2022-01-30T06:00:00.000Z"), count: Long("3")},
          {_id: ISODate("2022-01-30T12:00:00.000Z"), count: Long("2")},
          {_id: ISODate("2022-01-30T18:00:00.000Z"), count: Long("1")}
        ]
      }
    }
  }
]
```

## Observations

* __Search Metadata Stage.__ The `$searchMeta` stage is exclusive to Atlas-based MongoDB and must be the first stage in a pipeline, returning metadata about the text search, such as match count.

* __Date Range Filter.__ The pipeline uses a `$text` operator for _fraud_ and a `$range` operator for filtering records by date.

* __Facet Boundaries.__ The pipeline groups results by defined 6-hour periods, allowing multiple facets.

* __Faster Facet Counts.__ A faceted index optimizes count computations, reducing latency for faceted searches.

* __Combining A Search Operation With Metadata.__ Use `$search` instead of `$searchMeta` to obtain both search results and metadata in one aggregation. For example:

```javascript
{"$set": {"mymetadata": "$$SEARCH_META"}}
```

Page Url: https://www.practical-mongodb-aggregations.com/foreword
# Foreword

__By Asya Kamsky__ (@asya999)

Since the early 1990s, I have worked with databases, initially focusing on SQL until introduced to "No SQL" databases like MongoDB. After trying MongoDB for a side project, I joined the company in 2012. At that time, the query language lacked easy data aggregation options, favoring fast point queries. However, the need for complex queries emerged, leading to the development of "The Aggregation Framework" or "The Aggregation Pipeline." This feature quickly became my favorite due to its flexibility and debugging ease.

Over the past nine years, we've expanded from seven stages and three dozen expressions to over thirty stages and more than one hundred fifty expressions, enhancing data processing capabilities. The ability to construct complex queries is essential, as we cannot predict all future data questions. Analyzing data in place offers significant advantages over exporting it for analytics.

I've often discussed the Aggregation Pipeline's power and received requests for a comprehensive "Aggregation Cookbook." While creating a repository of "recipes" for common data tasks is challenging, I was excited to see my colleague, Paul Done, write this book, laying the groundwork for that cookbook.

I hope you find these suggestions, principles, and pipeline examples useful in your application development, and I look forward to its growth as a resource for maximizing data potential.

Page Url: https://www.practical-mongodb-aggregations.com/intro/getting-help
# Getting Help

Remembering all aggregation stages and operators is challenging. Fortunately, MongoDB's online documentation offers excellent references:

* MongoDB Aggregation Pipeline Stages reference
* MongoDB Aggregation Pipeline Operators reference

For a quick overview, check the "cheatsheets" in the appendix:

* MongoDB Aggregation Stages Cheatsheet
* MongoDB Aggregation Stages Cheatsheet Source Code

If you need help with an aggregation pipeline, consult the active online community:

* The MongoDB Community Forums
* Stack Overflow - MongoDB Questions

For specific assistance, provide a sample input document, your current pipeline code in JSON format, and the desired output example. This will increase your chances of a timely and effective response.

Page Url: https://www.practical-mongodb-aggregations.com/guides/guides
# Guiding Tips & Principles

This set of chapters offers concise principles and approaches to enhance effectiveness, productivity, and performance in developing aggregation pipelines.

Page Url: https://www.practical-mongodb-aggregations.com/examples/type-convert/convert-incomplete-dates
# Convert Incomplete Date Strings

__Minimum MongoDB Version:__ 4.2

## Scenario

An application ingests _payment_ documents into a MongoDB collection where the _payment date_ field contains strings like `"01-JAN-20 01.01.01.123000000"`. You need to convert these to valid BSON date types for aggregation, but the strings lack specific __century__, __time-zone__, and __language__ information. All records are for the __21st century__, in __UTC__, and in __English__. You build an aggregation pipeline to transform these text fields into date fields.

## Sample Data Population

Drop any old database version and populate a new _payments_ collection with 12 sample documents for 2020.

```javascript
db = db.getSiblingDB("book-convert-incomplete-dates");
db.dropDatabase();

db.payments.insertMany([
  {"account": "010101", "paymentDate": "01-JAN-20 01.01.01.123000000", "amount": 1.01},
  {"account": "020202", "paymentDate": "02-FEB-20 02.02.02.456000000", "amount": 2.02},
  {"account": "030303", "paymentDate": "03-MAR-20 03.03.03.789000000", "amount": 3.03},
  {"account": "040404", "paymentDate": "04-APR-20 04.04.04.012000000", "amount": 4.04},
  {"account": "050505", "paymentDate": "05-MAY-20 05.05.05.345000000", "amount": 5.05},
  {"account": "060606", "paymentDate": "06-JUN-20 06.06.06.678000000", "amount": 6.06},
  {"account": "070707", "paymentDate": "07-JUL-20 07.07.07.901000000", "amount": 7.07},
  {"account": "080808", "paymentDate": "08-AUG-20 08.08.08.234000000", "amount": 8.08},
  {"account": "090909", "paymentDate": "09-SEP-20 09.09.09.567000000", "amount": 9.09},
  {"account": "101010", "paymentDate": "10-OCT-20 10.10.10.890000000", "amount": 10.10},
  {"account": "111111", "paymentDate": "11-NOV-20 11.11.11.111000000", "amount": 11.11},
  {"account": "121212", "paymentDate": "12-DEC-20 12.12.12.999000000", "amount": 12.12}
]);
```

## Aggregation Pipeline

Define a pipeline to perform the aggregation:

```javascript
var pipeline = [
  {"$set": {
    "paymentDate": {    
      "$let": {
        "vars": {
          "txt": "$paymentDate",
          "month": {"$substrCP": ["$paymentDate", 3, 3]},
        },
        "in": { 
          "$dateFromString": {"format": "%d-%m-%Y %H.%M.%S.%L", "dateString":
            {"$concat": [
              {"$substrCP": ["$$txt", 0, 3]},
              {"$switch": {"branches": [
                {"case": {"$eq": ["$$month", "JAN"]}, "then": "01"},
                {"case": {"$eq": ["$$month", "FEB"]}, "then": "02"},
                {"case": {"$eq": ["$$month", "MAR"]}, "then": "03"},
                {"case": {"$eq": ["$$month", "APR"]}, "then": "04"},
                {"case": {"$eq": ["$$month", "MAY"]}, "then": "05"},
                {"case": {"$eq": ["$$month", "JUN"]}, "then": "06"},
                {"case": {"$eq": ["$$month", "JUL"]}, "then": "07"},
                {"case": {"$eq": ["$$month", "AUG"]}, "then": "08"},
                {"case": {"$eq": ["$$month", "SEP"]}, "then": "09"},
                {"case": {"$eq": ["$$month", "OCT"]}, "then": "10"},
                {"case": {"$eq": ["$$month", "NOV"]}, "then": "11"},
                {"case": {"$eq": ["$$month", "DEC"]}, "then": "12"},
               ], "default": "ERROR"}},
              "-20",
              {"$substrCP": ["$$txt", 7, 15]}
            ]
          }}                  
        }
      }        
    },             
  }},
  {"$unset": ["_id"]},         
];
```

## Execution

Execute the aggregation and view its explain plan:

```javascript
db.payments.aggregate(pipeline);
```

```javascript
db.payments.explain("executionStats").aggregate(pipeline);
```

## Expected Results

Twelve documents should be returned with the `paymentDate` field converted to proper date values:

```javascript
[
  { account: '010101', paymentDate: ISODate('2020-01-01T01:01:01.123Z'), amount: 1.01 },
  { account: '020202', paymentDate: ISODate('2020-02-02T02:02:02.456Z'), amount: 2.02 },
  { account: '030303', paymentDate: ISODate('2020-03-03T03:03:03.789Z'), amount: 3.03 },
  { account: '040404', paymentDate: ISODate('2020-04-04T04:04:04.012Z'), amount: 4.04 },
  { account: '050505', paymentDate: ISODate('2020-05-05T05:05:05.345Z'), amount: 5.05 },
  { account: '060606', paymentDate: ISODate('2020-06-06T06:06:06.678Z'), amount: 6.06 },
  { account: '070707', paymentDate: ISODate('2020-07-07T07:07:07.901Z'), amount: 7.07 },
  { account: '080808', paymentDate: ISODate('2020-08-08T08:08:08.234Z'), amount: 8.08 },
  { account: '090909', paymentDate: ISODate('2020-09-09T09:09:09.567Z'), amount: 9.09 },
  { account: '101010', paymentDate: ISODate('2020-10-10T10:10:10.890Z'), amount: 10.1 },
  { account: '111111', paymentDate: ISODate('2020-11-11T11:11:11.111Z'), amount: 11.11 },
  { account: '121212', paymentDate: ISODate('2020-12-12T12:12:12.999Z'), amount: 12.12 }
]
```

## Observations

* __Concatenation Explanation.__ The pipeline converts text fields (e.g. `'12-DEC-20 12.12.12.999000000'`) to date fields (e.g. `2020-12-12T12:12:12.999Z`) by concatenating:
  - `'12-'` _(day + hyphen)_
  - `'12'` _(month number)_
  - `'-20'` _(hard-coded century)_
  - `'20 12.12.12.999'` _(remaining time string)_

* __Temporary Reusable Variables.__ The pipeline uses a `$let` operator to define `txt` and `month` variables for reuse in the `$dateFromString` operator, ensuring flexibility if field names change.

Page Url: https://www.practical-mongodb-aggregations.com/examples/foundational/distinct-values
# Distinct List Of Values

__Minimum MongoDB Version:__ 4.2

## Scenario

Query a collection of persons to get an alphabetically sorted list of unique languages for a user interface's "drop-down" widget, similar to a _SELECT DISTINCT_ statement in SQL.

## Sample Data Population

Drop any existing database and populate a new `persons` collection with 9 documents:

```javascript
db = db.getSiblingDB("book-distinct-values");
db.dropDatabase();

db.persons.insertMany([
  {"firstname": "Elise", "lastname": "Smith", "vocation": "ENGINEER", "language": "English"},
  {"firstname": "Olive", "lastname": "Ranieri", "vocation": "ENGINEER", "language": ["Italian", "English"]},
  {"firstname": "Toni", "lastname": "Jones", "vocation": "POLITICIAN", "language": ["English", "Welsh"]},
  {"firstname": "Bert", "lastname": "Gooding", "vocation": "FLORIST", "language": "English"},
  {"firstname": "Sophie", "lastname": "Celements", "vocation": "ENGINEER", "language": ["Gaelic", "English"]},
  {"firstname": "Carl", "lastname": "Simmons", "vocation": "ENGINEER", "language": "English"},
  {"firstname": "Diego", "lastname": "Lopez", "vocation": "CHEF", "language": "Spanish"},
  {"firstname": "Helmut", "lastname": "Schneider", "vocation": "NURSE", "language": "German"},
  {"firstname": "Valerie", "lastname": "Dubois", "vocation": "SCIENTIST", "language": "French"},
]);  
```

## Aggregation Pipeline

Define the aggregation pipeline:

```javascript
var pipeline = [
  {"$unwind": {"path": "$language"}},
  {"$group": {"_id": "$language"}},
  {"$sort": {"_id": 1}},
  {"$set": {"language": "$_id", "_id": "$$REMOVE"}},
];
```

## Execution

Execute the aggregation and view its explain plan:

```javascript
db.persons.aggregate(pipeline);
db.persons.explain("executionStats").aggregate(pipeline);
```

## Expected Results

Seven unique languages should be returned sorted alphabetically:

```javascript
[
  {language: 'English'},
  {language: 'French'},
  {language: 'Gaelic'},
  {language: 'German'},
  {language: 'Italian'},
  {language: 'Spanish'},
  {language: 'Welsh'}
]
```

## Observations

* __Unwinding Non-Arrays.__ The `$unwind` stage handles both arrays and single values without error. If the field is always a simple value, the `$unwind` stage can be omitted.

* __Group ID Provides Unique Values.__ Grouping by a single field outputs unique group IDs, representing unique languages.

* __Unset Alternative.__ The pipeline could use an additional `$unset` stage, but here the `_id` field is excluded in the `$set` stage using `$$REMOVE`.

Page Url: https://www.practical-mongodb-aggregations.com/appendices/cheatsheet-source
# Stages Cheatsheet Source

To test aggregation stage examples, run the following JavaScript in the MongoDB Shell.

## Collections Configuration & Data Population

```javascript
// DB configuration
use cheatsheet;
db.dropDatabase();
db.places.createIndex({"loc": "2dsphere"});

// 'shapes' collection
db.shapes.insertMany([
  {"_id": "◐", "x": "■", "y": "▲", "val": 10, "ord": 0},
  {"_id": "◑", "x": "■", "y": "■", "val": 60},
  {"_id": "◒", "x": "●", "y": "■", "val": 80},
  {"_id": "◓", "x": "▲", "y": "▲", "val": 85},
  {"_id": "◔", "x": "■", "y": "▲", "val": 90},
  {"_id": "◕", "x": "●", "y": "■", "val": 95, "ord": 100},
]);

// 'lists' collection
db.lists.insertMany([
  {"_id": "▤", "a": "●", "b": ["◰", "◱"]},
  {"_id": "▥", "a": "▲", "b": ["◲"]},
  {"_id": "▦", "a": "▲", "b": ["◰", "◳", "◱"]},
  {"_id": "▧", "a": "●", "b": ["◰"]},
  {"_id": "▨", "a": "■", "b": ["◳", "◱"]},
]);

// 'places' collection
db.places.insertMany([
  {"_id": "Bigtown", "loc": {"type": "Point", "coordinates": [1,1]}},
  {"_id": "Smalltown", "loc": {"type": "Point", "coordinates": [3,3]}},
  {"_id": "Happytown", "loc": {"type": "Point", "coordinates": [5,5]}},
  {"_id": "Sadtown", "loc": {"type": "LineString", "coordinates": [[7,7],[8,8]]}},
]);
```

## Aggregation Stage Examples Execution

> _For MongoDB versions < 6.0, unsupported stages may show errors. Each stage is marked with the minimum version required._

```javascript
// $addFields  (v3.4)
db.shapes.aggregate([{"$addFields": {"z": "●"}}]);

// $bucket  (v3.4)
db.shapes.aggregate([{"$bucket": {"groupBy": "$val", "boundaries": [0, 25, 50, 75, 100], "default": "Other"}}]);

// $bucketAuto  (v3.4)
db.shapes.aggregate([{"$bucketAuto": {"groupBy": "$val", "buckets": 3}}]);

// $count  (v3.4)
db.shapes.aggregate([{"$count": "amount"}]);

// $densify  (v5.1)
db.shapes.aggregate([{"$densify": {"field": "val", "partitionByFields": ["x"], "range": {"bounds": "full", "step": 25}}}]);

// $documents  (v5.1)
db.aggregate([{"$documents": [{"p": "▭", "q": "▯"},{"p": "▯", "q": "▭"}]}]);

// $facet  (v3.4)
db.shapes.aggregate([{"$facet": {"X_CIRCLE_FACET": [{"$match": {"x": "●"}}], "FIRST_TWO_FACET": [{"$limit": 2}]} }]);

// $fill  (v5.3)
db.shapes.aggregate([{"$fill": {"sortBy": {"val": 1}, "output": {"ord": {"method": "linear"}}}}]);

// $geoNear  (v2.2)
db.places.aggregate([{"$geoNear": {"near": {"type": "Point", "coordinates": [9,9]}, "distanceField": "distance"}}]);

// $graphLookup  (v3.4)
db.shapes.aggregate([{"$graphLookup": {"from": "shapes", "startWith": "$x", "connectFromField": "x", "connectToField": "y", "depthField": "depth", "as": "connections"}},{"$project": {"connections_count": {"$size": "$connections"}}}]);

// $group  (v2.2)
db.shapes.aggregate([{"$group": {"_id": "$x", "ylist": {"$push": "$y"}}}]);

// $limit  (v2.2)
db.shapes.aggregate([{"$limit": 2}]);

// $lookup  (v3.2)
db.shapes.aggregate([{"$lookup": {"from": "lists", "localField": "y", "foreignField": "a", "as": "refs"}}]);

// $match  (v2.2)
db.shapes.aggregate([{"$match": {"y": "▲"}}]);

// $merge  (v4.2)
db.results.drop();
db.shapes.aggregate([{"$merge": {"into": "results"}}]);
db.results.find();

// $out  (v2.6)
db.results.drop();
db.shapes.aggregate([{"$out": "results"}]);
db.results.find();

// $project  (v2.2)
db.shapes.aggregate([{"$project": {"x": 1}}]);

// $redact  (v2.6)
db.places.aggregate([{"$redact": {"$cond": {"if": {"$eq": ["$type", "LineString"]}, "then": "$$PRUNE", "else": "$$DESCEND"}}}}]);

// $replaceRoot  (v3.4)
db.lists.aggregate([{"$replaceRoot": {"newRoot": {"first": {"$first": "$b"}, "last": {"$last": "$b"}}}}]);

// $replaceWith  (v4.2)
db.lists.aggregate([{"$replaceWith": {"first": {"$first": "$b"}, "last": {"$last": "$b"}}}]);

// $sample  (v3.2)
db.shapes.aggregate([{"$sample": {"size": 3}}]);

// $search  (v4.2 - requires Atlas Search index)
db.places.aggregate([{"$search": {"text": {"path": "_id", "query": "Bigtown Happytown"}}}]);

// $searchMeta  (v4.2 - requires Atlas Search index)
db.places.aggregate([{"$searchMeta": {"facet": {"operator": {"exists": {"path": "_id"}}, "facets": {"geotypes": {"type": "string", "path": "loc.type", "numBuckets": 2}}}}}]);

// $set  (v4.2)
db.shapes.aggregate([{"$set": {"y": "▲"}}]);

// $setWindowFields  (v5.0)
db.shapes.aggregate([{"$setWindowFields": {"partitionBy": "$x", "sortBy": {"_id": 1}, "output": {"cumulativeValShapeX": {"$sum": "$val", "window": {"documents": ["unbounded", "current"]}}}}}]);

// $skip  (v2.2)
db.shapes.aggregate([{"$skip": 5}]);

// $sort  (v2.2)
db.shapes.aggregate([{"$sort": {"x": 1, "y": 1}}]);

// $sortByCount  (v3.4)
db.shapes.aggregate([{"$sortByCount": "$x"}]);

// $unionWith  (v4.4)
db.shapes.aggregate([{"$unionWith": {"coll": "lists"}}]);

// $unset  (v4.2)
db.shapes.aggregate([{"$unset": ["x"]}]);

// $unwind  (v2.2)
db.lists.aggregate([{"$unwind": {"path": "$b"}}]);
```

## Configuring The Required Atlas Search Index

The `$search` and `$searchMeta` stages require an [Atlas Search index. Use the following JSON configuration for **cheatsheet.places**:

```javascript
{
  "mappings": {
    "dynamic": true,
    "fields": {
      "loc": {
        "fields": {
          "type": {
            "type": "stringFacet"
          }
        },
        "type": "document"
      }
    }
  }
}
```

Page Url: https://www.practical-mongodb-aggregations.com/examples/trend-analysis/trend-analysis
# Trend Analysis Examples

This section provides examples for analyzing data sets to identify trends, categorizations, and relationships.

Page Url: https://www.practical-mongodb-aggregations.com/examples/type-convert/type-convert
# Data Types Conversion Examples

This section shows how to convert weakly typed fields (strings) in documents to strongly typed fields for easier querying and usage.

Page Url: https://www.practical-mongodb-aggregations.com/examples/foundational/unpack-array-group-differently
# Unpack Arrays & Group Differently

__Minimum MongoDB Version:__ 4.2

## Scenario

Generate a retail report listing total value and quantity of products sold over 15 dollars from shop orders.

## Sample Data Population

Drop any existing database and populate a new `orders` collection:

```javascript
db = db.getSiblingDB("book-unpack-array-group-differently");
db.dropDatabase();

db.orders.insertMany([
  {
    "order_id": 6363763262239,
    "products": [
      {"prod_id": "abc12345", "name": "Asus Laptop", "price": NumberDecimal("431.43")},
      {"prod_id": "def45678", "name": "Karcher Hose Set", "price": NumberDecimal("22.13")}
    ]
  },
  {
    "order_id": 1197372932325,
    "products": [
      {"prod_id": "abc12345", "name": "Asus Laptop", "price": NumberDecimal("429.99")}
    ]
  },
  {
    "order_id": 9812343774839,
    "products": [
      {"prod_id": "pqr88223", "name": "Morphy Richardds Food Mixer", "price": NumberDecimal("431.43")},
      {"prod_id": "def45678", "name": "Karcher Hose Set", "price": NumberDecimal("21.78")}
    ]
  },
  {
    "order_id": 4433997244387,
    "products": [
      {"prod_id": "def45678", "name": "Karcher Hose Set", "price": NumberDecimal("23.43")},
      {"prod_id": "jkl77336", "name": "Picky Pencil Sharpener", "price": NumberDecimal("0.67")},
      {"prod_id": "xyz11228", "name": "Russell Hobbs Chrome Kettle", "price": NumberDecimal("15.76")}
    ]
  }
]);
```

## Aggregation Pipeline

Define the aggregation pipeline:

```javascript
var pipeline = [
  {"$unwind": {"path": "$products"}},
  {"$match": {"products.price": {"$gt": NumberDecimal("15.00")}}},
  {"$group": {
    "_id": "$products.prod_id",
    "product": {"$first": "$products.name"},
    "total_value": {"$sum": "$products.price"},
    "quantity": {"$sum": 1}
  }},
  {"$set": {"product_id": "$_id"}},
  {"$unset": ["_id"]}
];
```

## Execution

Run the aggregation and view its explain plan:

```javascript
db.orders.aggregate(pipeline);
db.orders.explain("executionStats").aggregate(pipeline);
```

## Expected Results

Four documents should be returned, showing total order value and quantity for expensive products:

```javascript
[
  {
    product_id: 'pqr88223',
    product: 'Morphy Richardds Food Mixer',
    total_value: NumberDecimal('431.43'),
    quantity: 1
  },
  {
    product_id: 'abc12345',
    product: 'Asus Laptop',
    total_value: NumberDecimal('861.42'),
    quantity: 2
  },
  {
    product_id: 'def45678',
    product: 'Karcher Hose Set',
    total_value: NumberDecimal('67.34'),
    quantity: 3
  },
  {
    product_id: 'xyz11228',
    product: 'Russell Hobbs Chrome Kettle',
    total_value: NumberDecimal('15.76'),
    quantity: 1
  }
]
```

## Observations

* __Unwinding Arrays.__ The `$unwind` stage generates a new record for each element in an array field, producing multiple records from a single document.

* __Introducing A Partial Match__. The pipeline filters products priced over 15.00 after unwinding. A partial match filter at the start could improve performance by leveraging an index on `products.price`, reducing full collection scans.

Page Url: https://www.practical-mongodb-aggregations.com/examples/securing-data/securing-data
# Securing Data Examples

This section shows how aggregation pipelines enhance secure data access and distribution.

Page Url: https://www.practical-mongodb-aggregations.com/examples/foundational/filtered-top-subset
# Filtered Top Subset

__Minimum MongoDB Version:__ 4.2

## Scenario

Query a collection of people to find the three youngest engineers, sorted by age.

## Sample Data Population

Drop any existing database and populate a new `persons` collection with 6 documents:

```javascript
db = db.getSiblingDB("book-filtered-top-subset");
db.dropDatabase();
db.persons.createIndex({"vocation": 1, "dateofbirth": 1});
db.persons.insertMany([
  {
    "person_id": "6392529400",
    "firstname": "Elise",
    "lastname": "Smith",
    "dateofbirth": ISODate("1972-01-13T09:32:07Z"),
    "vocation": "ENGINEER",
    "address": { "number": 5625, "street": "Tipa Circle", "city": "Wojzinmoj" },
  },
  {
    "person_id": "1723338115",
    "firstname": "Olive",
    "lastname": "Ranieri",
    "dateofbirth": ISODate("1985-05-12T23:14:30Z"),
    "gender": "FEMALE",
    "vocation": "ENGINEER",
    "address": { "number": 9303, "street": "Mele Circle", "city": "Tobihbo" },
  },
  {
    "person_id": "8732762874",
    "firstname": "Toni",
    "lastname": "Jones",
    "dateofbirth": ISODate("1991-11-23T16:53:56Z"),
    "vocation": "POLITICIAN",
    "address": { "number": 1, "street": "High Street", "city": "Upper Abbeywoodington" },
  },
  {
    "person_id": "7363629563",
    "firstname": "Bert",
    "lastname": "Gooding",
    "dateofbirth": ISODate("1941-04-07T22:11:52Z"),
    "vocation": "FLORIST",
    "address": { "number": 13, "street": "Upper Bold Road", "city": "Redringtonville" },
  },
  {
    "person_id": "1029648329",
    "firstname": "Sophie",
    "lastname": "Celements",
    "dateofbirth": ISODate("1959-07-06T17:35:45Z"),
    "vocation": "ENGINEER",
    "address": { "number": 5, "street": "Innings Close", "city": "Basilbridge" },
  },
  {
    "person_id": "7363626383",
    "firstname": "Carl",
    "lastname": "Simmons",
    "dateofbirth": ISODate("1998-12-26T13:13:55Z"),
    "vocation": "ENGINEER",
    "address": { "number": 187, "street": "Hillside Road", "city": "Kenningford" },
  },
]);
```

## Aggregation Pipeline

Define the aggregation pipeline:

```javascript
var pipeline = [
  {"$match": {"vocation": "ENGINEER"}},
  {"$sort": {"dateofbirth": -1}},
  {"$limit": 3},
  {"$unset": ["_id", "vocation", "address"]},
];
```

## Execution

Execute the aggregation and view its explain plan:

```javascript
db.persons.aggregate(pipeline);
db.persons.explain("executionStats").aggregate(pipeline);
```

## Expected Results

Three documents should be returned, representing the youngest engineers, omitting `_id` and `address`:

```javascript
[
  {
    person_id: '7363626383',
    firstname: 'Carl',
    lastname: 'Simmons',
    dateofbirth: ISODate('1998-12-26T13:13:55.000Z')
  },
  {
    person_id: '1723338115',
    firstname: 'Olive',
    lastname: 'Ranieri',
    dateofbirth: ISODate('1985-05-12T23:14:30.000Z'),
    gender: 'FEMALE'
  },
  {
    person_id: '6392529400',
    firstname: 'Elise',
    lastname: 'Smith',
    dateofbirth: ISODate('1972-01-13T09:32:07.000Z')
  }
]
```

## Observations

* __Index Use.__ A compound index on `vocation + dateofbirth` optimizes the pipeline.
* __Unset Use.__ `$unset` avoids verbosity and future modifications if new fields are added.
* __MQL Similarity.__ The MQL equivalent is:

```javascript
db.persons.find(
    {"vocation": "ENGINEER"},
    {"_id": 0, "vocation": 0, "address": 0},
  ).sort({"dateofbirth": -1}).limit(3);
```

Page Url: https://www.practical-mongodb-aggregations.com/appendices/cheatsheet
# Stages Cheatsheet

Examples for each stage in the MongoDB Aggregation Framework.

#### Stages:

| Query                              | Mutate                                       | Summarise/Itemise                    | Join                                 | Input/Output                     |
| :----------------------------------| :--------------------------------------------| :------------------------------------| :------------------------------------| :--------------------------------|
| `$geoNear`       | `$addFields`             | `$bucket`           | `$graphLookup` | `$documents` |
| `$limit`           | `$densify`                 | `$bucketAuto`   | `$lookup`           | `$merge`         |
| `$match`           | `$fill`                       | `$count`             | `$unionWith`     | `$out`             |
| `$sample`         | `$project`                 | `$facet`             |                                      |                                  |
| `$search`         | `$redact`                   | `$group`             |                                      |                                  |
| `$searchMeta` | `$replaceRoot`         | `$sortByCount` |                                      |                                  |
| `$skip`             | `$replaceWith`         | `$unwind`           |                                      |                                  |
| `$sort`             | `$set`                         |                                      |                                      |                                  |
|                                    | `$setWindowFields` |                                      |                                      |                                  |
|                                    | `$unset`                     |                                      |                                      |                                  |

> _Stages not included: &nbsp;`$changeStream`, `$collStats`, `$currentOp`, `$indexStats`, `$listLocalSessions`, `$listSearchIndexes`, `$listSessions`, `$planCacheStats`_

#### Input Collections:

```javascript
// shapes
{_id: "◐", x: "■", y: "▲", val: 10, ord: 0}
{_id: "◑", x: "■", y: "■", val: 60}
{_id: "◒", x: "●", y: "■", val: 80}
{_id: "◓", x: "▲", y: "▲", val: 85}
{_id: "◔", x: "■", y: "▲", val: 90}
{_id: "◕", x: "●", y: "■", val: 95, ord: 100}

// lists
{_id: "▤", a: "●", b: ["◰", "◱"]}
{_id: "▥", a: "▲", b: ["◲"]}
{_id: "▦", a: "▲", b: ["◰", "◳", "◱"]}
{_id: "▧", a: "●", b: ["◰"]}
{_id: "▨", a: "■", b: ["◳", "◱"]}

// places
{_id: "Bigtown", loc: {type: "Point", coordinates: [1,1]}}
{_id: "Smalltown", loc: {type: "Point", coordinates: [3,3]}}
{_id: "Happytown", loc: {type: "Point", coordinates: [5,5]}}
{_id: "Sadtown", loc: {type: "LineString", coordinates: [[7,7],[8,8]]}}
```

---

## [`$addFields`

```javascript
$addFields: {z: "●"}      
```

---

## `$bucket`

```javascript
$bucket: {
  groupBy: "$val",
  boundaries: [0, 25, 50, 75, 100],
  default: "Other"
}
```

---

## [`$bucketAuto`

```javascript
$bucketAuto: {groupBy: "$val", buckets: 3}
```

---

## `$count`

```javascript
$count: "amount"
```

---

## `$densify`

```javascript
$densify: {
  field: "val",
  partitionByFields: ["x"],
  range: {bounds: "full", step: 25}
}
```

---

## [`$documents`

```javascript
$documents: {
  {p: "▭", q: "▯"},
  {p: "▯", q: "▭"}
}
```

---

## [`$facet`

```javascript
$facet: {
  X_CIRCLE_FACET: {$match: {x: "●"}},
  FIRST_TWO_FACET: [{$limit: 2}]
}
```

---

## [`$fill`
           
```javascript
$fill: {
  sortBy: {val: 1},        
  output: {
    ord: {method: "linear"}
  }
}
```

---

## `$geoNear`

```javascript
$geoNear: {
  near: {type: "Point", coordinates: [9,9]}, 
  distanceField: "distance"
}
```

---

## [`$graphLookup`

```javascript
$graphLookup: {
  from: "shapes",
  startWith: "$x",
  connectFromField: "x",
  connectToField: "y",
  depthField: "depth",
  as: "connections"
}
$project: {connections_count: {$size: "$connections"}}
```

---

## `$group`

```javascript
$group: {_id: "$x", ylist: {$push: "$y"}}
```

---

## [`$limit`

```javascript
$limit: 2
```

---

## `$lookup`

```javascript
$lookup: {
  from: "lists",
  localField: "y",
  foreignField: "a",
  as: "refs"
}
```

---

## [`$match`

```javascript
$match: {y: "▲"}  
```

---

## `$merge`

```javascript
$merge: {into: "results"}
```

---

## `$out`

```javascript
$out: "results"
```

---

## `$project`

```javascript
$project: {x: 1}
```

---

## `$redact`

```javascript
$redact: {$cond: {
  if  : {$eq: ["$type", "LineString"]},
  then: "$$PRUNE",
  else: "$$DESCEND"
}}
```

---

## [`$replaceRoot`

```javascript
$replaceRoot: {
  newRoot: {first: {$first: "$b"}, last: {$last: "$b"}}
}
```

---

## [`$replaceWith`

```javascript
$replaceWith: {
  first: {$first: "$b"}, last: {$last: "$b"}
}
```

---

## [`$sample`

```javascript
$sample: {size: 3}
```

---

## `$search`

```javascript
$search: {
  text: {
    path: "_id",
    query: "Bigtown Happytown"
  }
}
```

---

## [`$searchMeta`

```javascript
$searchMeta: {
  facet: {
    operator: {
      exists: {
        path: "_id"
      }      
    },   
    facets: {        
      geotypes: {
        type: "string",
        path: "loc.type",
        numBuckets : 2
      }            
    }        
  }             
}
```

---

## [`$set`

```javascript
$set: {y: "▲"}
```

---

## `$setWindowFields`

```javascript
$setWindowFields: {
  partitionBy: "$x",
  sortBy: {"_id": 1},    
  output: {
    cumulativeValShapeX: {
      $sum: "$val",
      window: {
        documents: "unbounded", "current"]
      }
    }
 }
}
```

---

## [`$skip`

```javascript
$skip: 5
```

---

## `$sort`

```javascript
$sort: {x: 1, y: 1}
```

---

## `$sortByCount`

```javascript
$sortByCount: "$x"
```

---

## `$unionWith`

```javascript
$unionWith: {coll: "lists"} 
```

---

## [`$unset`

```javascript
$unset: "x" 
```

---

## [`$unwind`

```javascript
$unwind: {path: "$b"}
```

Page Url: https://www.practical-mongodb-aggregations.com/front-cover


Page Url: https://www.practical-mongodb-aggregations.com/guides/explain
# Using Explain Plans

When developing queries with MongoDB Query Language (MQL), viewing the explain plan is crucial to assess index usage and optimize queries or data models. This is even more critical for aggregation pipelines due to their complexity and potential performance bottlenecks.

MongoDB applies aggregation pipeline optimizations at runtime, but some optimizations require manual intervention. The explain plan helps you understand the database engine's optimizations and identify further improvements.

## Viewing An Explain Plan

To view an explain plan for an aggregation pipeline, use:

```javascript
db.coll.explain().aggregate({"$match": {"name": "Jo"}});
```

You can define a pipeline variable for easier command interchangeability:

```javascript
db.coll.aggregate(pipeline);
```

Switching to generate an explain plan is straightforward:

```javascript
db.coll.explain().aggregate(pipeline);
```

There are three verbosity modes for explain plans:

```javascript
db.coll.explain("queryPlanner").aggregate(pipeline);
db.coll.explain("executionStats").aggregate(pipeline);
db.coll.explain("allPlansExecution").aggregate(pipeline);
```

The `executionStats` mode is often the most informative, providing statistics on the execution plan but may take longer for large datasets.

Note: The `aggregate()` function has a limited `explain` option, which is cumbersome and should be avoided.

## Understanding The Explain Plan

Assuming a shop's dataset includes customer orders, with an index on `customer_id`, you can create a pipeline to show the three most expensive orders for a specific customer:

```javascript
var pipeline = [
  {"$unwind": {"path": "$orders"}},
  {"$match": {"customer_id": "tonijones@myemail.com"}},
  {"$sort": {"orders.value": -1}},
  {"$limit": 3},
  {"$set": {"order_value": "$orders.value"}},
  {"$unset": ["_id", "orders"]},
];
```

Executing this aggregation yields:

```javascript
[
  { customer_id: 'tonijones@myemail.com', order_value: NumberDecimal("1024.89") },
  { customer_id: 'tonijones@myemail.com', order_value: NumberDecimal("187.99") },
  { customer_id: 'tonijones@myemail.com', order_value: NumberDecimal("4.59") }
]
```

Request the query planner part of the explain plan:

```javascript
db.customer_orders.explain("queryPlanner").aggregate(pipeline);
```

The output shows:

```javascript
stages: [
  { '$cursor': { queryPlanner: { parsedQuery: { customer_id: { '$eq': 'tonijones@myemail.com' } }, winningPlan: { stage: 'FETCH', inputStage: { stage: 'IXSCAN', keyPattern: { customer_id: 1 }, indexName: 'customer_id_1', direction: 'forward', indexBounds: { customer_id: ['["tonijones@myemail.com", "tonijones@myemail.com"]'] } } } } } },
  { '$unwind': { path: '$orders' } },
  { '$sort': { sortKey: { 'orders.value': -1 }, limit: 3 } },
  { '$set': { order_value: '$orders.value' } },
  { '$project': { _id: false, orders: false } }
]
```

Insights from the query plan include:

- The database engine reordered the pipeline, moving `$match` to the top without altering functionality.
- The first stage is an internal `$cursor`, which uses the MQL query engine to filter based on `$match`.
- The `$sort` and `$limit` stages are collapsed into a single internal sort stage, optimizing memory usage.

To view execution stats:

```javascript
db.customer_orders.explain("executionStats").aggregate(pipeline);
```

The output highlights relevant metadata:

```javascript
executionStats: {
  nReturned: 1,
  totalKeysExamined: 1,
  totalDocsExamined: 1,
  executionStages: {
    stage: 'FETCH',
    nReturned: 1,
    works: 2,
    advanced: 1,
    docsExamined: 1,
    inputStage: {
      stage: 'IXSCAN',
      nReturned: 1,
      works: 2,
      advanced: 1,
      keyPattern: { customer_id: 1 },
      indexName: 'customer_id_1',
      direction: 'forward',
      indexBounds: { customer_id: '["tonijones@myemail.com", "tonijones@myemail.com"]' },
      keysExamined: 1,
    }
  }
}
```

This indicates the aggregation uses the index effectively. If `totalDocsExamined` is 0, the index fully covers the query, indicating further optimization.

Page Url: https://www.practical-mongodb-aggregations.com/guides/composibility
# Embrace Composability For Increased Productivity

An aggregation pipeline is an ordered series of stages, where the output of one stage is the input of the next, promoting high composability. This allows developers to break complex problems into manageable stages, facilitating iterative prototyping and testing.

For example, running two pipelines sequentially yields the same result as a single pipeline with both stages. This approach reduces cognitive load by decomposing challenges into smaller tasks.

## Specific Tips To Promote Composability

Developers often skip using temporary datasets but can still benefit from commenting out stages in MongoDB's Shell or using GUI tools. Key principles for composability include:

* Easy disabling of stage subsets for prototyping/debugging
* Simple addition of fields or stages without cryptic errors
* Clear understanding of each stage's purpose

Guidelines for crafting pipelines in JavaScript:

1. Don’t start/end a stage on the same line as another stage.
2. Include trailing commas for every field and stage.
3. Add an empty newline between stages.
4. Use `//` comments for complex stages.
5. Use `/*` and `*/` to disable stages.

Example of a poor pipeline layout:

```javascript
// BAD

var pipeline = 
  {"$unset": [
    "_id",
    "address"
  ]}, {"$match": {
    "dateofbirth": {"$gte": ISODate("1970-01-01T00:00:00Z")}
  }}//, {"$sort": {
  //  "dateofbirth": -1,
  //}}, {"$limit": 2}
];
```

A better layout:

```javascript
// GOOD

var pipeline = [
  {"$unset": [
    "_id",
    "address",
  ]},    
    
  // Only match people born on or after 1st January 1970
  {"$match": {
    "dateofbirth": {"$gte": ISODate("1970-01-01T00:00:00Z")},
  }},
  
  /*
  {"$sort": {
    "dateofbirth": -1,
  }},      
    
  {"$limit": 2},  
  */
];
```

Notice the use of trailing commas.

Another valid approach is to define each stage in separate variables:

```javascript
// GOOD

var unsetStage = {
  "$unset": [
    "_id",
    "address",
  ]};    

var matchStage = {
  "$match": {
    "dateofbirth": {"$gte": ISODate("1970-01-01T00:00:00Z")},
  }};

var sortStage = {
   "$sort": {
    "dateofbirth": -1,
  }}; 

var limitStage = {"$limit": 2};
    
var pipeline = [
  unsetStage,
  matchStage,
  sortStage,
  limitStage,
];
```

Some developers may also decompose elements within stages into variables to avoid typos or factor out boilerplate code into functions for reuse. This book presents both single-variable and multi-variable approaches as personal choices for comfort and productivity.

Page Url: https://www.practical-mongodb-aggregations.com/guides/expressions
# Expressions Explained

## Summarising Aggregation Expressions

Aggregation expressions empower aggregation pipelines. Developers often use them by copying examples without fully understanding their function. Proficiency requires deeper knowledge of expressions, which fall into three categories:

* **Operators:** Accessed with a `$` prefix. Examples: `{$arrayElemAt: ...}`, `{$cond: ...}`, `{$dateToString: ...}`.
* **Field Paths:** Accessed as strings with a `$` prefix. Examples: `"$account.sortcode"`, `"$addresses.address.city"`.
* **Variables:** Accessed with a `$$` prefix, divided into:
  - **Context System Variables:** Values from the system. Examples: `"$$NOW"`, `"$$CLUSTER_TIME"`.
  - **Marker Flag System Variables:** Indicate behavior. Examples: `"$$ROOT"`, `"$$REMOVE"`, `"$$PRUNE"`.
  - **Bind User Variables:** Values declared with `$let` or similar. Examples: `"$$product_name_var"`, `"$$orderIdVal"`.

These expressions can be combined for complex data manipulation. For example:

```javascript
"customer_info": {"$cond": {
                    "if":   {"$eq": "$customer_info.category", "SENSITIVE"}, 
                    "then": "$$REMOVE", 
                    "else": "$customer_info",
                 }}
```

## What Do Expressions Produce?

Expressions can be Operators (e.g. `{$concat: ...}`), Variables (e.g. `"$$ROOT"`), or Field Paths (e.g. `"$address"`), returning a new JSON/BSON data type element, which can be:
* Number (integer, long, float, double, decimal128)
* String (UTF-8)
* Boolean
* DateTime (UTC)
* Array
* Object

Some expressions restrict return types. For instance, `{$concat: ...}` produces only a _String_, while `"$$ROOT"` returns an _Object_. Field Paths can return any type based on the input document's context.

## Can All Stages Use Expressions?

Not all pipeline stages support expressions. Stages like `$match`, `$limit`, `$skip`, `$sort`, `$count`, `$lookup`, and `$out` do not allow embedded expressions. `$match` uses MQL syntax for query conditions, leveraging the query engine's optimizations.

## What Is Using `$expr` Inside `$match` All About?

MongoDB 3.6 introduced `$expr`, allowing aggregation expressions in `$match` stages. This enables comparisons and calculations based on multiple fields. For example, to return rectangles with an area greater than `12`:

```javascript
var pipeline = [
  {"$match": {
    "$expr": {"$gt": [{"$multiply": ["$width", "$height"]}, 12]},
  }},
];
```

The result excludes rectangles with an area of `12` or less.

### Restrictions When Using Expressions with `$match`

Using `$expr` may limit index benefits, especially in versions before 5.0. Range comparisons (`$gt`, `$gte`, `$lt`, `$lte`) may not utilize indexes. Different ordering rules apply when filtering values of different types, leading to potential discrepancies between `$expr` and MQL results. Use `$expr` only when necessary.

Page Url: https://www.practical-mongodb-aggregations.com/guides/performance
# Pipeline Performance Considerations

Premature optimization of an aggregation pipeline can lead to complexity without addressing performance issues. Use the _explain plan_ tool during the final stages of development to identify optimization opportunities.

This chapter outlines three crucial tips for creating and tuning aggregation pipelines, which can significantly impact execution time for large data sets.

## 1. Be Cognizant Of Streaming Vs Blocking Stages Ordering

The database engine streams batches through aggregation stages. _Streaming stages_ process batches immediately, while _blocking stages_ (e.g., `$sort`, `$group`) wait for all batches to arrive. 

### `$sort` Memory Consumption And Mitigation

A `$sort` stage requires all input records, leading to high memory consumption. MongoDB limits blocking stages to 100 MB of RAM. Use `allowDiskUse:true` to handle large data sets, but this increases latency. 

To mitigate memory issues:
1. **Use Index Sort**: Place `$sort` early to leverage an index.
2. **Use Limit With Sort**: Add `$limit` after `$sort` to reduce memory usage.
3. **Reduce Records To Sort**: Move `$sort` later in the pipeline to minimize input records.

### `$group` Memory Consumption And Mitigation

The `$group` stage also consumes significant memory. Use `allowDiskUse:true` to avoid the 100 MB limit. To reduce memory consumption:
1. **Avoid Unnecessary Grouping**.
2. **Group Summary Data Only**: Focus on totals and counts rather than raw data.

## 2. Avoid Unwinding & Regrouping Documents Just To Process Array Elements

To filter array fields efficiently, avoid using `$unwind` followed by `$match` and `$group`. Instead, use Array Operators like `$filter` to achieve the same result without introducing blocking stages.

**Suboptimal Example**:
```javascript
var pipeline = [
  {"$unwind": "$products"},
  {"$match": {"products.price": {"$gt": NumberDecimal("15.00")}}},
  {"$group": {"_id": "$_id", "products": {"$push": "$products"}}},
];
```

**Optimal Example**:
```javascript
var pipeline = [
  {"$set": {
    "products": {
      "$filter": {
        "input": "$products",
        "as": "product",
        "cond": {"$gt": ["$$product.price", NumberDecimal("15.00")]}
      }
    }
  }},
];
```

## 3. Encourage Match Filters To Appear Early In The Pipeline

The database engine optimizes pipelines by moving `$match` stages to the top. If a `$match` depends on a computed field, consider refactoring to allow it to leverage an index.

**Suboptimal Example**:
```javascript
var pipeline = [
  {"$set": {"value_dollars": {"$multiply": [0.01, "$value"]}}},
  {"$unset": ["_id", "value"]},
  {"$match": {"value_dollars": {"$gte": 100}}},
];
```

**Optimal Example**:
```javascript
var pipeline = [
  {"$set": {"value_dollars": {"$multiply": [0.01, "$value"]}}},
  {"$match": {"value": {"$gte": 10000}}},
  {"$unset": ["_id", "value"]},
];
```

### Pipeline Match Summary

If a `$match` stage is not at the start, explore refactoring to optimize the pipeline. Consider adding an additional `$match` stage to leverage indexes when possible.

Page Url: https://www.practical-mongodb-aggregations.com/examples/securing-data/mask-sensitive-fields
# Mask Sensitive Fields

__Minimum MongoDB Version:__ 4.4 _(due to `$rand` operator)_

## Scenario

You need to mask sensitive fields in a collection of _credit card payments_ for 3rd party analysis. Changes include:
 * Partially obfuscate card holder's name
 * Obfuscate first 12 digits of card number, retaining last 4
 * Adjust expiry date by ±30 days
 * Replace security code with random 3 digits
 * Adjust transaction amount by ±10%
 * Invert `reported` field for ~20% of records
 * Exclude `customer_info` if `category` is _RESTRICTED_

## Sample Data Population

Drop any existing database and populate a new `payments` collection:

```javascript
db = db.getSiblingDB("book-mask-sensitive-fields");
db.dropDatabase();

db.payments.insertMany([
  {
    "card_name": "Mrs. Jane A. Doe",
    "card_num": "1234567890123456",
    "card_expiry": ISODate("2023-08-31T23:59:59Z"),
    "card_sec_code": "123",
    "card_type": "CREDIT",        
    "transaction_id": "eb1bd77836e8713656d9bf2debba8900",
    "transaction_date": ISODate("2021-01-13T09:32:07Z"),
    "transaction_amount": NumberDecimal("501.98"),
    "reported": false,
    "customer_info": {
      "category": "RESTRICTED",
      "rating": 89,
      "risk": 3,
    },
  },
  {
    "card_name": "Jim Smith",
    "card_num": "9876543210987654",
    "card_expiry": ISODate("2022-12-31T23:59:59Z"),
    "card_sec_code": "987",
    "card_type": "DEBIT",        
    "transaction_id": "634c416a6fbcf060bb0ba90c4ad94f60",
    "transaction_date": ISODate("2020-11-24T19:25:57Z"),
    "transaction_amount": NumberDecimal("64.01"),
    "reported": true,
    "customer_info": {
      "category": "NORMAL",
      "rating": 78,
      "risk": 55,
    },
  },
]);
```

## Aggregation Pipeline

Define the aggregation pipeline:

```javascript
var pipeline = [
  {"$set": {
    "card_name": {"$regexFind": {"input": "$card_name", "regex": /(\S+)$/}},
    "card_num": {"$concat": ["XXXXXXXXXXXX", {"$substrCP": ["$card_num", 12, 4]}]},
    "card_expiry": {"$add": ["$card_expiry", {"$floor": {"$multiply": [{"$subtract": [{"$rand": {}}, 0.5]}, 2*30*24*60*60*1000]}}]}},
    "card_sec_code": {"$concat": [
      {"$toString": {"$floor": {"$multiply": [{"$rand": {}}, 10]}}},
      {"$toString": {"$floor": {"$multiply": [{"$rand": {}}, 10]}}},
      {"$toString": {"$floor": {"$multiply": [{"$rand": {}}, 10]}}}
    ]},
    "transaction_amount": {"$add": ["$transaction_amount", {"$multiply": [{"$subtract": [{"$rand": {}}, 0.5]}, 0.2, "$transaction_amount"]}]},
    "reported": {"$cond": {
      "if": {"$lte": [{"$rand": {}}, 0.8]},
      "then": "$reported",
      "else": {"$not": ["$reported"]},
    }},
    "customer_info": {"$cond": {
      "if": {"$eq": ["$customer_info.category", "RESTRICTED"]}, 
      "then": "$$REMOVE",     
      "else": "$customer_info",
    }},
    "_id": "$$REMOVE",
  }},
  {"$set": {
    "card_name": {"$concat": ["Mx. Xxx ", {"$ifNull": ["$card_name.match", "Anonymous"]}]},
  }},
];
```

## Execution

Execute the aggregation and view its explain plan:

```javascript
db.payments.aggregate(pipeline);
db.payments.explain("executionStats").aggregate(pipeline);
```

## Expected Results

Two documents should be returned with redacted fields, and one `customer_info` omitted due to _RESTRICTED_:

```javascript
[
  {
    card_name: 'Mx. Xxx Doe',
    card_num: 'XXXXXXXXXXXX3456',
    card_expiry: ISODate('2023-08-31T23:29:46.460Z'),
    card_sec_code: '295',
    card_type: 'CREDIT',
    transaction_id: 'eb1bd77836e8713656d9bf2debba8900',
    transaction_date: ISODate('2021-01-13T09:32:07.000Z'),
    transaction_amount: NumberDecimal('492.4016988351474881660000000000000'),
    reported: false
  },
  {
    card_name: 'Mx. Xxx Smith',
    card_num: 'XXXXXXXXXXXX7654',
    card_expiry: ISODate('2023-01-01T00:34:49.330Z'),
    card_sec_code: '437',
    card_type: 'DEBIT',
    transaction_id: '634c416a6fbcf060bb0ba90c4ad94f60',
    transaction_date: ISODate('2020-11-24T19:25:57.000Z'),
    transaction_amount: NumberDecimal('58.36081337486762223600000000000000'),
    reported: false,
    customer_info: { category: 'NORMAL', rating: 78, risk: 55 }
  }
]
```

## Observations

 * __Targeted Redaction.__ The pipeline uses `$cond` to exclude `customer_info` if `category` is _RESTRICTED_. This is more efficient than `$redact`.
 
 * __Regular Expression.__ `$regexFind` extracts the last word from `card_name`. MongoDB 5.0 allows using `$getField` to simplify this process.

 * __Meaningful Insight.__ The pipeline masks fields with slight random variations, allowing for analytics while preserving trends.

Page Url: https://www.practical-mongodb-aggregations.com/examples/trend-analysis/largest-graph-network
# Largest Graph Network

__Minimum MongoDB Version:__ 4.2

## Scenario

Your organization wants to identify targets for a marketing campaign using a social network database similar to _Twitter_. You will execute an aggregation pipeline to analyze each user's `followed_by` array to find the user with the largest _network reach_.

> _This example uses a simple data model. For optimal use of `$graphLookup` at scale, see the reference application: Socialite._

## Sample Data Population

Drop any existing database and populate a new `users` collection with 10 user documents and an index for _graph traversal_:

```javascript
db = db.getSiblingDB("book-largest-graph-network");
db.dropDatabase();
db.users.createIndex({"name": 1});
db.users.insertMany([
  {"name": "Paul", "followed_by": []},
  {"name": "Toni", "followed_by": ["Paul"]},
  {"name": "Janet", "followed_by": ["Paul", "Toni"]},
  {"name": "David", "followed_by": ["Janet", "Paul", "Toni"]},
  {"name": "Fiona", "followed_by": ["David", "Paul"]},
  {"name": "Bob", "followed_by": ["Janet"]},
  {"name": "Carl", "followed_by": ["Fiona"]},
  {"name": "Sarah", "followed_by": ["Carl", "Paul"]},
  {"name": "Carol", "followed_by": ["Helen", "Sarah"]},
  {"name": "Helen", "followed_by": ["Paul"]}
]);
```

## Aggregation Pipeline

Define the aggregation pipeline:

```javascript
var pipeline = [
  {"$graphLookup": {
    "from": "users",
    "startWith": "$followed_by",
    "connectFromField": "followed_by",
    "connectToField": "name",
    "depthField": "depth",
    "as": "extended_network",
  }},
  {"$set": {
    "network_reach": {"$size": "$extended_network"},
    "extended_connections": {
      "$map": {
        "input": "$extended_network",
        "as": "connection",
        "in": "$$connection.name"
      }
    }
  }},
  {"$unset": ["_id", "followed_by", "extended_network"]},
  {"$sort": {"network_reach": -1}},
];
```

## Execution

Execute the aggregation and view its explain plan:

```javascript
db.users.aggregate(pipeline);
db.users.explain("executionStats").aggregate(pipeline);
```

## Expected Results

Ten documents should be returned, each including a count of the user's _network reach_ and the names of their _extended connections_, sorted by network reach:

```javascript
[
  { name: 'Carol', network_reach: 8, extended_connections: [ 'David', 'Toni', 'Fiona', 'Sarah', 'Helen', 'Carl', 'Paul',  'Janet' ] },
  { name: 'Sarah', network_reach: 6, extended_connections: [ 'David', 'Toni', 'Fiona', 'Carl', 'Paul', 'Janet' ] },
  { name: 'Carl', network_reach: 5, extended_connections: [ 'David', 'Toni', 'Fiona', 'Paul', 'Janet' ] },
  { name: 'Fiona', network_reach: 4, extended_connections: [ 'David', 'Toni', 'Paul', 'Janet' ] },
  { name: 'David', network_reach: 3, extended_connections: [ 'Toni', 'Paul', 'Janet' ] },
  { name: 'Bob', network_reach: 3, extended_connections: [ 'Toni', 'Paul', 'Janet' ] },
  { name: 'Janet', network_reach: 2, extended_connections: [ 'Toni', 'Paul' ] },
  { name: 'Toni', network_reach: 1, extended_connections: [ 'Paul'] },
  { name: 'Helen', network_reach: 1, extended_connections: [ 'Paul' ] },
  { name: 'Paul', network_reach: 0, extended_connections: [] }
]
```

## Observations

* __Following Graphs.__ The `$graphLookup` stage traverses relationships, revealing patterns not evident in isolation. For example, _Paul_ has no friends, but _Carol_ has the greatest network reach despite having only two direct followers.
* __Index Use.__ The `$graphLookup` stage utilizes the index on `name` for `connectToField` hops.
* __Extracting One Field.__ The pipeline uses `$map` to extract only the `name` field from each matched user, ignoring other fields. For more on `$map`, see the [Advanced Use Of Expressions For Array Processing chapter].

Page Url: https://www.practical-mongodb-aggregations.com/examples/type-convert/convert-to-strongly-typed
# Strongly-Typed Conversion

__Minimum MongoDB Version:__ 4.2

## Scenario

A 3rd party imported _retail orders_ into a MongoDB collection with all data as strings. You need to re-establish correct typing and copy them to a new "cleaned" collection using an aggregation pipeline.

## Sample Data Population

Drop any existing database and populate a new `orders` collection with three documents:

```javascript
db = db.getSiblingDB("book-convert-to-strongly-typed");
db.dropDatabase();

db.orders.insertMany([
  {
    "customer_id": "elise_smith@myemail.com",
    "order_date": "2020-05-30T08:35:52",
    "value": "231.43",
    "further_info": {
      "item_qty": "3",
      "reported": "false",
    },
  },
  {
    "customer_id": "oranieri@warmmail.com",
    "order_date": "2020-01-01T08:25:37",
    "value": "63.13",
    "further_info": {
      "item_qty": "2",
    },
  },
  {
    "customer_id": "tj@wheresmyemail.com",
    "order_date": "2019-05-28T19:13:32",
    "value": "2.01",
    "further_info": {
      "item_qty": "1",
      "reported": "true",
    },
  },  
]);
```

## Aggregation Pipeline

Define a pipeline for the aggregation:

```javascript
var pipeline = [
  {"$set": {
    "order_date": {"$toDate": "$order_date"},    
    "value": {"$toDecimal": "$value"},
    "further_info.item_qty": {"$toInt": "$further_info.item_qty"},
    "further_info.reported": {"$switch": {
      "branches": [
        {"case": {"$eq": [{"$toLower": "$further_info.reported"}, "true"]}, "then": true},
        {"case": {"$eq": [{"$toLower": "$further_info.reported"}, "false"]}, "then": false},
      ],
      "default": {"$ifNull": ["$further_info.reported", "$$REMOVE"]},
    }},     
  }},     
  {"$merge": {
    "into": "orders_typed",
  }},    
];
```

## Execution

Execute the aggregation to create `orders_typed`:

```javascript
db.orders.aggregate(pipeline);
```

Check the new collection:

```javascript
db.orders_typed.find();
```

View the explain plan:

```javascript
db.orders.explain("executionStats").aggregate(pipeline);
```

## Expected Results

The `orders_typed` collection should have the same number of documents with correctly typed fields:

```javascript
[
  {
    _id: ObjectId('6064381b7aa89666258201fd'),
    customer_id: 'elise_smith@myemail.com',
    further_info: { 
      item_qty: 3, 
      reported: false 
    },
    order_date: ISODate('2020-05-30T08:35:52.000Z'),
    value: NumberDecimal('231.43')
  },
  {
    _id: ObjectId('6064381b7aa89666258201fe'),
    customer_id: 'oranieri@warmmail.com',
    further_info: {
      item_qty: 2 
    },
    order_date: ISODate('2020-01-01T08:25:37.000Z'),
    value: NumberDecimal('63.13')
  },
  {
    _id: ObjectId('6064381b7aa89666258201ff'),
    customer_id: 'tj@wheresmyemail.com',
    further_info: {
      item_qty: 1,
      reported: true
    },
    order_date: ISODate('2019-05-28T19:13:32.000Z'),
    value: NumberDecimal('2.01')
  }
]
```

## Observations

* __Boolean Conversion.__ Use `$switch` for boolean conversion instead of `$toBool` to avoid incorrect conversions.
* __Preserving Non-Existence.__ Use `$ifNull` to omit missing fields like `further_info.reported`.
* __Output To A Collection.__ Use `$merge` to write output to a collection; it supports both unsharded and sharded collections.
* __Trickier Date Conversions.__ Ensure date strings contain all necessary parts for `$toDate` to work correctly.

Page Url: https://www.practical-mongodb-aggregations.com/examples/trend-analysis/incremental-analytics
# Incremental Analytics

__Minimum MongoDB Version:__ 4.2

## Scenario

You have a set of _shop orders_ in the _orders_ collection, with new records added daily. To generate summary reports efficiently, you will create daily summaries at the end of each day and store them in a separate collection.

> _This approach is known as **On-Demand Materialized Views**._

## Sample Data Population

Drop any existing database and add 9 documents to the `orders` collection for 01-Feb-2021 and 02-Feb-2021:

```javascript
db = db.getSiblingDB("book-incremental-analytics");
db.dropDatabase();
db.daily_orders_summary.createIndex({"day": 1}, {"unique": true});
db.orders.createIndex({"orderdate": 1});
db.orders.insertMany([
  {"orderdate": ISODate("2021-02-01T08:35:52Z"), "value": NumberDecimal("231.43")},
  {"orderdate": ISODate("2021-02-01T09:32:07Z"), "value": NumberDecimal("99.99")},
  {"orderdate": ISODate("2021-02-01T08:25:37Z"), "value": NumberDecimal("63.13")},
  {"orderdate": ISODate("2021-02-01T19:13:32Z"), "value": NumberDecimal("2.01")},
  {"orderdate": ISODate("2021-02-01T22:56:53Z"), "value": NumberDecimal("187.99")},
  {"orderdate": ISODate("2021-02-02T23:04:48Z"), "value": NumberDecimal("4.59")},
  {"orderdate": ISODate("2021-02-02T08:55:46Z"), "value": NumberDecimal("48.50")},
  {"orderdate": ISODate("2021-02-02T07:49:32Z"), "value": NumberDecimal("1024.89")},
  {"orderdate": ISODate("2021-02-02T13:49:44Z"), "value": NumberDecimal("102.24")},
]);
```

## Aggregation Pipeline

Define a function to create a pipeline for daily aggregation:

```javascript
function getDayAggPipeline(startDay, endDay) {
  return [
    {"$match": {"orderdate": {"$gte": ISODate(startDay), "$lt": ISODate(endDay)}}},
    {"$group": {
      "_id": null,
      "date_parts": {"$first": {"$dateToParts": {"date": "$orderdate"}}},
      "total_value": {"$sum": "$value"},
      "total_orders": {"$sum": 1},
    }},
    {"$set": {
      "day": {"$dateFromParts": {"year": "$date_parts.year", "month": "$date_parts.month", "day": "$date_parts.day"}},
    }},
    {"$unset": ["_id", "date_parts"]},
    {"$merge": {
      "into": "daily_orders_summary",
      "on": "day",
      "whenMatched": "replace",
      "whenNotMatched": "insert"
    }},
  ];
}
```

## Execution

For 01-Feb-2021, execute the aggregation:

```javascript
var pipeline = getDayAggPipeline("2021-02-01T00:00:00Z", "2021-02-02T00:00:00Z");
db.orders.aggregate(pipeline);
db.daily_orders_summary.find();
```

For 02-Feb-2021, execute similarly:

```javascript
var pipeline = getDayAggPipeline("2021-02-02T00:00:00Z", "2021-02-03T00:00:00Z");
db.orders.aggregate(pipeline);
db.daily_orders_summary.find();
```

To correct an old order, add a new order for 01-Feb-2021 and re-run the aggregation:

```javascript
db.orders.insertOne({"orderdate": ISODate("2021-02-01T09:32:07Z"), "value": NumberDecimal("11111.11")});
var pipeline = getDayAggPipeline("2021-02-01T00:00:00Z", "2021-02-02T00:00:00Z");
db.orders.aggregate(pipeline);
db.daily_orders_summary.find();
```

View the explain plan:

```javascript
db.products.explain("executionStats").aggregate(pipeline);
```

## Expected Results

After aggregating for 01-Feb-2021:

```javascript
[
  {
    _id: ObjectId('6062102e7eeb772e6ca96bc7'),
    total_value: NumberDecimal('584.55'),
    total_orders: 5,
    day: ISODate('2021-02-01T00:00:00.000Z')
  }
]
```

After aggregating for 02-Feb-2021:

```javascript
[
  {
    _id: ObjectId('6062102e7eeb772e6ca96bc7'),
    total_value: NumberDecimal('584.55'),
    total_orders: 5,
    day: ISODate('2021-02-01T00:00:00.000Z')
  },
  {
    _id: ObjectId('606210377eeb772e6ca96bcc'),
    total_value: NumberDecimal('1180.22'),
    total_orders: 4,
    day: ISODate('2021-02-02T00:00:00.000Z')
  }
]
```

After re-running for 01-Feb-2021:

```javascript
[
  {
    _id: ObjectId('6062102e7eeb772e6ca96bc7'),
    total_value: NumberDecimal('11695.66'),
    total_orders: 6,
    day: ISODate('2021-02-01T00:00:00.000Z')
  },
  {
    _id: ObjectId('606210377eeb772e6ca96bcc'),
    total_value: NumberDecimal('1180.22'),
    total_orders: 4,
    day: ISODate('2021-02-02T00:00:00.000Z')
  }
]
```

## Observations

* __Merging Results.__ The pipeline uses `$merge` to write output to a collection, replacing existing records if matched.
* __Incremental Updates.__ Run the pipeline daily to keep the summary collection updated without reprocessing all data.
* __Idempotency.__ The aggregation can be re-run without damaging the summary collection, ensuring completeness.
* __Retrospective Changes.__ Easily re-execute the pipeline for past dates to update summaries with new data.

Page Url: https://www.practical-mongodb-aggregations.com/examples/trend-analysis/faceted-classifications
# Faceted Classification

__Minimum MongoDB Version:__ 4.2

## Scenario

Implement faceted search on a retail website to allow customers to refine product searches by characteristics like _product rating_ and _product price_. Each facet corresponds to a field in a product record, with sub-ranges (e.g., _4 - 5 stars_) for selection. The aggregation pipeline analyzes the _products_ collection by each facet's field.

## Sample Data Population

Drop any existing database and populate a new `products` collection with 16 documents (commands split for clipboard convenience):

&nbsp;__-Part 1-__

```javascript
db = db.getSiblingDB("book-faceted-classfctn");
db.dropDatabase();
db.products.insertMany([
  {"name": "Asus Laptop", "category": "ELECTRONICS", "description": "Good value laptop for students", "price": NumberDecimal("431.43"), "rating": NumberDecimal("4.2")},
  {"name": "The Day Of The Triffids", "category": "BOOKS", "description": "Classic post-apocalyptic novel", "price": NumberDecimal("5.01"), "rating": NumberDecimal("4.8")},
  {"name": "Morphy Richardds Food Mixer", "category": "KITCHENWARE", "description": "Luxury mixer turning good cakes into great", "price": NumberDecimal("63.13"), "rating": NumberDecimal("3.8")},
  {"name": "Karcher Hose Set", "category": "GARDEN", "description": "Hose + nosels + winder for tidy storage", "price": NumberDecimal("22.13"), "rating": NumberDecimal("4.3")},
  {"name": "Oak Coffee Table", "category": "HOME", "description": "size is 2m x 0.5m x 0.4m", "price": NumberDecimal("22.13"), "rating": NumberDecimal("3.8")},
  {"name": "Lenovo Laptop", "category": "ELECTRONICS", "description": "High spec good for gaming", "price": NumberDecimal("1299.99"), "rating": NumberDecimal("4.1")},
  {"name": "One Day in the Life of Ivan Denisovich", "category": "BOOKS", "description": "Brutal life in a labour camp", "price": NumberDecimal("4.29"), "rating": NumberDecimal("4.9")},
  {"name": "Russell Hobbs Chrome Kettle", "category": "KITCHENWARE", "description": "Nice looking budget kettle", "price": NumberDecimal("15.76"), "rating": NumberDecimal("3.9")},
]);   
```

&nbsp;__-Part 2-__

```javascript
db.products.insertMany([  
  {"name": "Tiffany Gold Chain", "category": "JEWELERY", "description": "Looks great for any age and gender", "price": NumberDecimal("582.22"), "rating": NumberDecimal("4.0")},
  {"name": "Raleigh Racer 21st Century Classic", "category": "BICYCLES", "description": "Modern update to a classic 70s bike design", "price": NumberDecimal("523.00"), "rating": NumberDecimal("4.5")},
  {"name": "Diesel Flare Jeans", "category": "CLOTHES", "description": "Top end casual look", "price": NumberDecimal("129.89"), "rating": NumberDecimal("4.3")},
  {"name": "Jazz Silk Scarf", "category": "CLOTHES", "description": "Style for the winder months", "price": NumberDecimal("28.39"), "rating": NumberDecimal("3.7")},
  {"name": "Dell XPS 13 Laptop", "category": "ELECTRONICS", "description": "Developer edition", "price": NumberDecimal("1399.89"), "rating": NumberDecimal("4.4")},
  {"name": "NY Baseball Cap", "category": "CLOTHES", "description": "Blue & white", "price": NumberDecimal("18.99"), "rating": NumberDecimal("4.0")},
  {"name": "Tots Flower Pots", "category": "GARDEN", "description": "Set of three", "price": NumberDecimal("9.78"), "rating": NumberDecimal("4.1")},
  {"name": "Picky Pencil Sharpener", "category": "Stationery", "description": "Ultra budget", "price": NumberDecimal("0.67"), "rating": NumberDecimal("1.2")},
]); 
```

## Aggregation Pipeline

Define a pipeline for aggregation:

```javascript
var pipeline = [
  {"$facet": {
    "by_price": [
      {"$bucketAuto": {
        "groupBy": "$price",
        "buckets": 3,
        "granularity": "1-2-5",
        "output": {
          "count": {"$sum": 1},
          "products": {"$push": "$name"},
        },
      }},
      {"$set": {"price_range": "$_id"}},
      {"$unset": ["_id"]},
    ],
    "by_rating": [
      {"$bucketAuto": {
        "groupBy": "$rating",
        "buckets": 5,
        "output": {
          "count": {"$sum": 1},
          "products": {"$push": "$name"},
        },
      }},
      {"$set": {"rating_range": "$_id"}},
      {"$unset": ["_id"]},
    ],
  }},
];
```

## Execution

Execute the aggregation and view its explain plan:

```javascript
db.products.aggregate(pipeline);
db.products.explain("executionStats").aggregate(pipeline);
```

## Expected Results

A single document should return with 2 facets (`by_price` and `by_rating`), showing sub-ranges and products:

```javascript
[
  {
    by_price: [
      {count: 6, products: [...], price_range: {min: NumberDecimal('0.5'), max: NumberDecimal('20.0')}},
      {count: 5, products: [...], price_range: {min: NumberDecimal('20.0'), max: NumberDecimal('200.0')}},
      {count: 5, products: [...], price_range: {min: NumberDecimal('200.0'), max: NumberDecimal('2000.0')}}
    ],
    by_rating: [
      {count: 4, products: [...], rating_range: {min: NumberDecimal('1.2'), max: NumberDecimal('3.9')}},
      {count: 3, products: [...], rating_range: {min: NumberDecimal('3.9'), max: NumberDecimal('4.1')}},
      {count: 3, products: [...], rating_range: {min: NumberDecimal('4.1'), max: NumberDecimal('4.3')}},
      {count: 3, products: [...], rating_range: {min: NumberDecimal('4.3'), max: NumberDecimal('4.5')}},
      {count: 3, products: [...], rating_range: {min: NumberDecimal('4.5'), max: NumberDecimal('4.9')}}
    ]
  }
]
```

## Observations

* __Multiple Pipelines.__ The `$facet` stage allows multiple `$bucketAuto` dimensions in one pipeline, avoiding multiple aggregation calls.
* __Single Document Result.__ `$facet` returns a single document with top-level fields for each facet, suitable for faceted search.
* __Spread Of Ranges.__ Different granularity schemes can be used for facets to ensure effective product distribution across sub-ranges.
* __Faster Facet Computation.__ For large collections, consider using Atlas Search for faster faceted results instead of MongoDB's general-purpose capability.

Page Url: https://www.practical-mongodb-aggregations.com/examples/array-manipulations/array-fields-joining
# Array Fields Joining

__Minimum MongoDB Version:__ 4.2

## Scenario

You are developing a dating website with user profiles that include hobbies and mood preferences. When displaying profiles, you want to describe how users conduct their hobbies based on their moods.

## Sample Data Population

Drop any existing database and populate a new user profiles collection:

```javascript
db = db.getSiblingDB("book-array-fields-joining");
db.dropDatabase();

db.users.insertMany([
  {
    "firstName": "Alice",
    "lastName": "Jones",
    "dateOfBirth": ISODate("1985-07-21T00:00:00Z"),
    "hobbies": {
      "music": "Playing the guitar",
      "reading": "Science Fiction books",
      "gaming": "Video games, especially RPGs",
      "sports": "Long-distance running",
      "traveling": "Visiting exotic places",
      "cooking": "Trying out new recipes",
    },      
    "moodFavourites": {
      "sad": ["music"],
      "happy": ["sports"],
      "chilling": ["music", "cooking"],
    },
  },
  {
    "firstName": "Sam",
    "lastName": "Brown",
    "dateOfBirth": ISODate("1993-12-01T00:00:00Z"),
    "hobbies": {
      "cycling": "Mountain biking",
      "writing": "Poetry and short stories",
      "knitting": "Knitting scarves and hats",
      "hiking": "Hiking in the mountains",
      "volunteering": "Helping at the local animal shelter",
      "music": "Listening to Jazz",
      "photography": "Nature photography",
      "gardening": "Growing herbs and vegetables",
      "yoga": "Practicing Hatha Yoga",
      "cinema": "Watching classic movies",
    },
    "moodFavourites": {
      "happy": ["gardening", "cycling"],
      "sad": ["knitting"],
    },
  },
]);
```

## Aggregation Pipeline

Define a function to get array values of named fields in a sub-document:

```javascript
function getValuesOfNamedFieldsAsArray(obj, fieldnames) {
  return {
    "$map": { 
      "input": {
        "$filter": { 
          "input": {"$objectToArray": obj}, 
          "as": "currElem",
          "cond": {"$in": ["$$currElem.k", fieldnames]},
        }
      }, 
      "in": "$$this.v" 
    }, 
  };
}
```

Define the aggregation pipeline:

```javascript
var pipeline = [
  {"$set": {
    "moodActivities": {      
      "$arrayToObject": {
        "$map": { 
          "input": {"$objectToArray": "$moodFavourites"},
          "in": {              
            "k": "$$this.k",
            "v": getValuesOfNamedFieldsAsArray("$hobbies", "$$this.v"),
          }
        }, 
      }
    }
  }},
  {"$unset": ["_id", "hobbies", "moodFavourites"]},  
]
```

## Execution

Execute the aggregation and view its explain plan:

```javascript
db.users.aggregate(pipeline);
```

```javascript
db.users.explain("executionStats").aggregate(pipeline);
```

## Expected Results

Two documents should return, each with a `moodActivities` array field showing how users conduct their hobbies for each mood:

```javascript
[
  {
    firstName: 'Alice',
    lastName: 'Jones',
    dateOfBirth: ISODate("1985-07-21T00:00:00.000Z"),
    moodActivities: {
      sad: [ 'Playing the guitar' ],
      happy: [ 'Long-distance running' ],
      chilling: [ 'Playing the guitar', 'Trying out new recipes' ]
    }
  },
  {
    firstName: 'Sam',
    lastName: 'Brown',
    dateOfBirth: ISODate("1993-12-01T00:00:00.000Z"),
    moodActivities: {
      happy: [ 'Mountain biking', 'Growing herbs and vegetables' ],
      sad: [ 'Knitting scarves and hats' ]
    }
  }
]
```

## Observations

* __Joining Fields.__ Each user document contains `hobbies` and `moodFavourites`, creating a many-to-many relationship. The function allows looking up multiple hobbies for each mood.

* __Reusable Functions.__ The aggregation uses a macro function for boilerplate code, reusable in other solutions.

* __Grouping Without Unwinding.__ The aggregation avoids unwinding arrays to manipulate fields in isolation, preventing resource-limited grouping steps.

Page Url: https://www.practical-mongodb-aggregations.com/examples/securing-data/redacted-view
# Redacted View

__Minimum MongoDB Version:__ 4.2

## Scenario

You have a user management system and need to provide a read-only view (_adults_) to restrict access to sensitive data. The view will enforce two rules:

1. Show only people aged 18 and over (check `dateofbirth`).
2. Exclude `social_security_num`.

> Use MongoDB's Role-Based Access Control (RBAC) to limit access to the view.

## Sample Data Population

Drop any existing database, create an index, and populate the `persons` collection with 5 records:

```javascript
db = db.getSiblingDB("book-redacted-view");
db.dropDatabase();
db.persons.createIndex({"dateofbirth": -1});
db.persons.createIndex({"gender": 1});
db.persons.createIndex({"gender": 1, "dateofbirth": -1});

db.persons.insertMany([
  {
    "person_id": "6392529400",
    "firstname": "Elise",
    "lastname": "Smith",
    "dateofbirth": ISODate("1972-01-13T09:32:07Z"),
    "gender": "FEMALE",
    "email": "elise_smith@myemail.com",
    "social_security_num": "507-28-9805",
    "address": { "number": 5625, "street": "Tipa Circle", "city": "Wojzinmoj" }
  },
  {
    "person_id": "1723338115",
    "firstname": "Olive",
    "lastname": "Ranieri",
    "dateofbirth": ISODate("1985-05-12T23:14:30Z"),
    "gender": "FEMALE",
    "email": "oranieri@warmmail.com",
    "social_security_num": "618-71-2912",
    "address": { "number": 9303, "street": "Mele Circle", "city": "Tobihbo" }
  },
  {
    "person_id": "8732762874",
    "firstname": "Toni",
    "lastname": "Jones",
    "dateofbirth": ISODate("2014-11-23T16:53:56Z"),
    "gender": "FEMALE",
    "email": "tj@wheresmyemail.com",
    "social_security_num": "001-10-3488",
    "address": { "number": 1, "street": "High Street", "city": "Upper Abbeywoodington" }
  },
  {
    "person_id": "7363629563",
    "firstname": "Bert",
    "lastname": "Gooding",
    "dateofbirth": ISODate("1941-04-07T22:11:52Z"),
    "gender": "MALE",
    "email": "bgooding@tepidmail.com",
    "social_security_num": "230-43-7633",
    "address": { "number": 13, "street": "Upper Bold Road", "city": "Redringtonville" }
  },
  {
    "person_id": "1029648329",
    "firstname": "Sophie",
    "lastname": "Celements",
    "dateofbirth": ISODate("2013-07-06T17:35:45Z"),
    "gender": "FEMALE",
    "email": "sophe@celements.net",
    "social_security_num": "377-30-5364",
    "address": { "number": 5, "street": "Innings Close", "city": "Basilbridge" }
  }
]);
```

## Aggregation Pipeline

Define the aggregation pipeline:

```javascript
var pipeline = [
  {"$match": {"$expr": {"$lt": ["$dateofbirth", {"$subtract": ["$$NOW", 18*365.25*24*60*60*1000]}]}}},
  {"$unset": ["_id", "social_security_num"]}
];
```

## Execution

Test the aggregation pipeline:

```javascript
db.persons.aggregate(pipeline);
db.persons.explain("executionStats").aggregate(pipeline);
```

Create the _adults_ view:

```javascript
db.createView("adults", "persons", pipeline);
```

Query the view:

```javascript
db.adults.find();
db.adults.explain("executionStats").find();
db.adults.find({"gender": "FEMALE"});
db.adults.explain("executionStats").find({"gender": "FEMALE"});
```

## Expected Results

Both `aggregate()` and `find()` should return three documents without `social_security_num`:

```javascript
[
  {
    person_id: '6392529400',
    firstname: 'Elise',
    lastname: 'Smith',
    dateofbirth: ISODate('1972-01-13T09:32:07.000Z'),
    gender: 'FEMALE',
    email: 'elise_smith@myemail.com',
    address: { number: 5625, street: 'Tipa Circle', city: 'Wojzinmoj' }
  },
  {
    person_id: '1723338115',
    firstname: 'Olive',
    lastname: 'Ranieri',
    dateofbirth: ISODate('1985-05-12T23:14:30.000Z'),
    gender: 'FEMALE',
    email: 'oranieri@warmmail.com',
    address: { number: 9303, street: 'Mele Circle', city: 'Tobihbo' }
  },
  {
    person_id: '7363629563',
    firstname: 'Bert',
    lastname: 'Gooding',
    dateofbirth: ISODate('1941-04-07T22:11:52.000Z'),
    gender: 'MALE',
    email: 'bgooding@tepidmail.com',
    address: { number: 13, street: 'Upper Bold Road', city: 'Redringtonville' }
  }
]
```

The filtered query for females should return two records:

```javascript
[
  {
    person_id: '6392529400',
    firstname: 'Elise',
    lastname: 'Smith',
    dateofbirth: ISODate('1972-01-13T09:32:07.000Z'),
    gender: 'FEMALE',
    email: 'elise_smith@myemail.com',
    address: { number: 5625, street: 'Tipa Circle', city: 'Wojzinmoj' }
  },
  {
    person_id: '1723338115',
    firstname: 'Olive',
    lastname: 'Ranieri',
    dateofbirth: ISODate('1985-05-12T23:14:30.000Z'),
    gender: 'FEMALE',
    email: 'oranieri@warmmail.com',
    address: { number: 9303, street: 'Mele Circle', city: 'Tobihbo' }
  }
]
```

## Observations

* __`$expr` & Indexes.__ The `NOW` variable is accessible only via aggregation expressions. In MongoDB versions < 5.0, `$expr` queries cannot use indexes for range comparisons on `dateofbirth`. 

* __View Finds & Indexes.__ Even pre-5.0, the explain plan for the gender query shows an index used. The view acts as a predefined aggregation pipeline, optimizing queries by appending a new `$match` stage for gender. In 5.0+, the explain plan shows improved execution using a compound index on `gender` and `dateofbirth`. 

Note that optimizations may not apply to all pipelines, especially those with `$group` stages. See the [Aggregation Pipeline Optimization documentation](#) for more details.

Page Url: https://www.practical-mongodb-aggregations.com/examples/securing-data/role-programmatic-restricted-view
# Role Programmatic Restricted View

__Minimum MongoDB Version:__ 7.0 _(due to `USER_ROLES` system variable)_

## Scenario

In a medical establishment, patient data is accessed based on roles: Receptionist, Nurse, and Doctor. Each role has a read-only view that filters sensitive fields. For instance, the Receptionist cannot access a patient's weight and medication, while the Doctor can.

> This example demonstrates "record-level" and "field-level" access control in MongoDB using programmatic role-based access control rules. In practice, a declarative role would limit access to the view only.

## Sample Data Population

For a self-installed MongoDB, run the following commands to create roles and users:

```javascript
var dbName = "book-role-programmatic-restricted-view";
db = db.getSiblingDB(dbName);
db.dropDatabase();
db.dropAllRoles();
db.dropAllUsers();

db.createRole({"role": "Receptionist", "roles": [], "privileges": []});
db.createRole({"role": "Nurse", "roles": [], "privileges": []});
db.createRole({"role": "Doctor", "roles": [], "privileges": []});

db.createUser({"user": "front-desk", "pwd": "abc123", "roles": [{"role": "Receptionist", "db": dbName}]});
db.createUser({"user": "nurse-station", "pwd": "xyz789", "roles": [{"role": "Nurse", "db": dbName}]});
db.createUser({"user": "exam-room", "pwd": "mno456", "roles": [{"role": "Doctor", "db": dbName}]});
```

Populate the `patients` collection:

```javascript
db = db.getSiblingDB("book-role-programmatic-restricted-view");

db.patients.insertMany([
  {"id": "D40230", "first_name": "Chelsea", "last_Name": "Chow", "birth_date": ISODate("1984-11-07T10:12:00Z"), "weight": 145, "medication": ["Insulin", "Methotrexate"]},
  {"id": "R83165", "first_name": "Pharrell", "last_Name": "Phillips", "birth_date": ISODate("1993-05-30T19:44:00Z"), "weight": 137, "medication": ["Fluoxetine"]},
  {"id": "X24046", "first_name": "Billy", "last_Name": "Boaty", "birth_date": ISODate("1976-02-07T23:58:00Z"), "weight": 223, "medication": []},
  {"id": "P53212", "first_name": "Yazz", "last_Name": "Yodeler", "birth_date": ISODate("1999-12-25T12:51:00Z"), "weight": 156, "medication": ["Tylenol", "Naproxen"]}
]);
```

## Aggregation Pipeline

Define an aggregation pipeline for a new view:

```javascript
var pipeline = [
  {"$set": {
    "weight": {
      "$cond": {
        "if": {"$eq": [{"$setIntersection": ["$$USER_ROLES.role", ["Doctor", "Nurse"]]}, []]},
        "then": "$$REMOVE",
        "else": "$weight"
      }
    },
    "medication": {
      "$cond": {
        "if": {"$eq": [{"$setIntersection": ["$$USER_ROLES.role", ["Doctor"]]}, []]},
        "then": "$$REMOVE",
        "else": "$medication"
      }
    },
    "_id": "$$REMOVE"
  }},
]
```

Create the `patients_view`:

```javascript
db.createView("patients_view", "patients", pipeline);
```

## Execution

Authenticate and query the view for each role:

**Receptionist:**
```javascript
db.auth("front-desk", "abc123");
db.patients_view.find();
```

**Nurse:**
```javascript
db.auth("nurse-station", "xyz789");
db.patients_view.find();
```

**Doctor:**
```javascript
db.auth("exam-room", "mno456");
db.patients_view.find();
```

View the explain plan:

```javascript
db.patients_view.explain("executionStats").find();
```

## Expected Results

**Receptionist** sees:
```javascript
[
  {id: 'D40230', first_name: 'Chelsea', last_Name: 'Chow', birth_date: ISODate("1984-11-07T10:12:00.000Z")},
  {id: 'R83165', first_name: 'Pharrell', last_Name: 'Phillips', birth_date: ISODate("1993-05-30T19:44:00.000Z")},
  {id: 'X24046', first_name: 'Billy', last_Name: 'Boaty', birth_date: ISODate("1976-02-07T23:58:00.000Z")},
  {id: 'P53212', first_name: 'Yazz', last_Name: 'Yodeler', birth_date: ISODate("1999-12-25T12:51:00.000Z")}
]
```

**Nurse** sees:
```javascript
[
  {id: 'D40230', first_name: 'Chelsea', last_Name: 'Chow', birth_date: ISODate("1984-11-07T10:12:00.000Z"), weight: 145},
  {id: 'R83165', first_name: 'Pharrell', last_Name: 'Phillips', birth_date: ISODate("1993-05-30T19:44:00.000Z"), weight: 137},
  {id: 'X24046', first_name: 'Billy', last_Name: 'Boaty', birth_date: ISODate("1976-02-07T23:58:00.000Z"), weight: 223},
  {id: 'P53212', first_name: 'Yazz', last_Name: 'Yodeler', birth_date: ISODate("1999-12-25T12:51:00.000Z"), weight: 156}
]
```

**Doctor** sees:
```javascript
[
  {id: 'D40230', first_name: 'Chelsea', last_Name: 'Chow', birth_date: ISODate("1984-11-07T10:12:00.000Z"), weight: 145, medication: ['Insulin', 'Methotrexate']},
  {id: 'R83165', first_name: 'Pharrell', last_Name: 'Phillips', birth_date: ISODate("1993-05-30T19:44:00.000Z"), weight: 137, medication: ['Fluoxetine']},
  {id: 'X24046', first_name: 'Billy', last_Name: 'Boaty', birth_date: ISODate("1976-02-07T23:58:00.000Z"), weight: 223, medication: []},
  {id: 'P53212', first_name: 'Yazz', last_Name: 'Yodeler', birth_date: ISODate("1999-12-25T12:51:00.000Z"), weight: 156, medication: ['Tylenol', 'Naproxen']}
]
```

## Observations

* __Programmatic Vs Declarative RBAC.__ MongoDB's RBAC allows administrators to govern access via declarative roles. This example uses programmatic rules with aggregation expressions and `$$USER_ROLES` to enforce access control.

* __Avoid Proliferation Of Views.__ Instead of creating multiple views for each role, programmatic RBAC reduces maintenance by centralizing access control logic.

* __Filtering On A View With Index Pushdowns.__ The view's aggregation pipeline can leverage indexes and push down filters for efficiency.

* __Field-Level Vs Record-Level Access Control.__ The pipeline applies field-level access control, but can also enforce record-level access using a `$match` operator.

* __Potential To Factor Out Logic To Dynamic Metadata.__ Hard-coded logic can be replaced with dynamic metadata in a collection, allowing business administrators to modify access rules without code changes.

Page Url: https://www.practical-mongodb-aggregations.com/examples/time-series/state-change-boundaries
# State Change Boundaries

__Minimum MongoDB Version:__ 5.0 _(due to time series collections, `$setWindowFields`, & `$shift` operator)_

## Scenario

You monitor industrial devices (e.g., heaters, fans) to optimize energy costs and carbon footprint. The source database contains periodic readings indicating whether each device is on or off. You need a condensed view highlighting each device's timespan in a particular state.

## Sample Data Population

Drop any old database version and populate the device status collection:

```javascript
db = db.getSiblingDB("book-state-change-boundaries");
db.dropDatabase();

db.createCollection("device_status", {
  "timeseries": {
    "timeField": "timestamp",
    "metaField": "deviceID",
    "granularity": "minutes"
  }
});

db.device_status.createIndex({"deviceID": 1, "timestamp": 1});

db.device_status.insertMany([
  {"deviceID": "HEATER-111", "timestamp": ISODate("2021-07-03T11:09:00Z"), "state": "on"},
  {"deviceID": "FAN-999", "timestamp": ISODate("2021-07-03T11:09:00Z"), "state": "on"},
  {"deviceID": "HEATER-111", "timestamp": ISODate("2021-07-03T11:19:00Z"), "state": "on"},
  {"deviceID": "HEATER-111", "timestamp": ISODate("2021-07-03T11:29:00Z"), "state": "on"},
  {"deviceID": "FAN-999", "timestamp": ISODate("2021-07-03T11:39:00Z"), "state": "off"},
  {"deviceID": "HEATER-111", "timestamp": ISODate("2021-07-03T11:39:00Z"), "state": "off"},
  {"deviceID": "HEATER-111", "timestamp": ISODate("2021-07-03T11:49:00Z"), "state": "off"},
  {"deviceID": "HEATER-111", "timestamp": ISODate("2021-07-03T11:59:00Z"), "state": "on"},
  {"deviceID": "DEHUMIDIFIER-555", "timestamp": ISODate("2021-07-03T11:29:00Z"), "state": "on"}
]);
```

## Aggregation Pipeline

Define a pipeline for aggregation:

```javascript
var pipeline = [
  {"$setWindowFields": {
    "partitionBy": "$deviceID",
    "sortBy": {"timestamp": 1},
    "output": {
      "previousState": {"$shift": {"output": "$state", "by": -1}},
      "nextState": {"$shift": {"output": "$state", "by": 1}}
    }
  }},
  {"$set": {
    "startTimestamp": {"$cond": [{"$eq": ["$state", "$previousState"]}, "$$REMOVE", "$timestamp"]},
    "endMarkerDate": {"$cond": [{"$eq": ["$state", "$nextState"]}, "$$REMOVE", "$timestamp"]}
  }},
  {"$match": {
    "$expr": {
      "$or": [{"$ne": ["$state", "$previousState"]}, {"$ne": ["$state", "$nextState"]}]
    }
  }},
  {"$setWindowFields": {
    "partitionBy": "$deviceID",
    "sortBy": {"timestamp": 1},
    "output": {
      "nextMarkerDate": {"$shift": {"output": "$timestamp", "by": 1}}
    }
  }},
  {"$match": {
    "$expr": {"$ne": ["$state", "$previousState"]}
  }},
  {"$set": {
    "endTimestamp": {
      "$switch": {
        "branches": [
          {"case": {"$eq": [{"$type": "$nextMarkerDate"}, "null"]}, "then": null},
          {"case": {"$ne": [{"$type": "$endMarkerDate"}, "missing"]}, "then": "$endMarkerDate"}
        ],
        "default": "$nextMarkerDate"
      }
    }
  }},
  {"$unset": ["_id", "timestamp", "previousState", "nextState", "endMarkerDate", "nextMarkerDate"]}
];
```

## Execution

Execute the aggregation and view its explain plan:

```javascript
db.device_status.aggregate(pipeline);
db.device_status.explain("executionStats").aggregate(pipeline);
```

## Expected Results

Six documents should be returned, capturing the duration between state change boundaries:

```javascript
[
  {deviceID: 'DEHUMIDIFIER-555', state: 'on', startTimestamp: ISODate("2021-07-03T11:29:00.000Z"), endTimestamp: null},
  {deviceID: 'FAN-999', state: 'on', startTimestamp: ISODate("2021-07-03T11:09:00.000Z"), endTimestamp: ISODate("2021-07-03T11:09:00.000Z")},
  {deviceID: 'FAN-999', state: 'off', startTimestamp: ISODate("2021-07-03T11:39:00.000Z"), endTimestamp: null},
  {deviceID: 'HEATER-111', state: 'on', startTimestamp: ISODate("2021-07-03T11:09:00.000Z"), endTimestamp: ISODate("2021-07-03T11:29:00.000Z")},
  {deviceID: 'HEATER-111', state: 'off', startTimestamp: ISODate("2021-07-03T11:39:00.000Z"), endTimestamp: ISODate("2021-07-03T11:49:00.000Z")},
  {deviceID: 'HEATER-111', state: 'on', startTimestamp: ISODate("2021-07-03T11:59:00.000Z"), endTimestamp: null}
]
```

## Observations

* __Null End Timestamps.__ The last record for each device has `endTimestamp` set to `null`, indicating the final known state.

* __Peeking At One Document From Another.__ The `$setWindowFields` stage allows aggregation operations across documents, using `$shift` to access preceding or following document content.

* __Double Use Of A Windowing Stage.__ The pipeline captures documents where the device's state changes, often resulting in adjacent pairs. A second windowing stage condenses these pairs into single documents with both start and end timestamps.

* __Time Series Collection & Indexes.__ The aggregation can use a time series collection for efficient storage and querying, leveraging an index for `{deviceID: 1, timestamp: 1}` to avoid slow in-memory sorts.

Page Url: https://www.practical-mongodb-aggregations.com/examples/array-manipulations/pivot-array-items
# Pivot Array Items By A Key

__Minimum MongoDB Version:__ 4.2

## Scenario

You have weather station zones with multiple sensors collecting readings (temperature, humidity, pressure). These readings are transmitted hourly to a central database, requiring grouping by device for easier consumption by dashboards.

> _This example uses complex array operators like `$map`, `$mergeObjects`, and `$filter`. Review the Advanced Use Of Expressions For Array Processing chapter first. The pipeline also uses `$setUnion` for unique values._

## Sample Data Population

Drop any old database version and populate the new hourly weather station measurements collection:

```javascript
db = db.getSiblingDB("book-pivot-array-by-key");
db.dropDatabase();

db.weather_measurements.insertMany([
  {
    "weatherStationsZone": "FieldZone-ABCD",
    "dayHour": ISODate("2021-07-05T15:00:00.000Z"),
    "readings": [
      {"device": "ABCD-Device-123", "tempCelsius": 18},        
      {"device": "ABCD-Device-789", "pressureMBar": 1004},        
      {"device": "ABCD-Device-123", "humidityPercent": 31},        
      {"device": "ABCD-Device-123", "tempCelsius": 19},        
      {"device": "ABCD-Device-123", "pressureMBar": 1005},        
      {"device": "ABCD-Device-789", "humidityPercent": 31},        
      {"device": "ABCD-Device-123", "humidityPercent": 30},        
      {"device": "ABCD-Device-789", "tempCelsius": 20},        
      {"device": "ABCD-Device-789", "pressureMBar": 1003},        
    ],
  },
  {
    "weatherStationsZone": "FieldZone-ABCD",
    "dayHour": ISODate("2021-07-05T16:00:00.000Z"),
    "readings": [
      {"device": "ABCD-Device-789", "humidityPercent": 33},        
      {"device": "ABCD-Device-123", "humidityPercent": 32},        
      {"device": "ABCD-Device-123", "tempCelsius": 22},        
      {"device": "ABCD-Device-123", "pressureMBar": 1007},        
      {"device": "ABCD-Device-789", "pressureMBar": 1008},        
      {"device": "ABCD-Device-789", "tempCelsius": 22},        
      {"device": "ABCD-Device-789", "humidityPercent": 34},        
    ],
  },
]);
```

## Aggregation Pipeline

Define a pipeline to group weather readings by device:

```javascript
var pipeline = [
  {"$set": {
    "readings_device_summary": {
      "$map": {
        "input": {
          "$setUnion": "$readings.device"
        },
        "as": "device",
        "in": {
          "$mergeObjects": {
            "$filter": {
              "input": "$readings",
              "as": "reading",
              "cond": {
                "$eq": ["$$reading.device", "$$device"]
              }
            }
          }
        }
      }
    },
  }},
  {"$unset": ["_id", "readings"]},  
];
```

## Execution

Execute the aggregation and view its explain plan:

```javascript
db.weather_measurements.aggregate(pipeline);
```

```javascript
db.weather_measurements.explain("executionStats").aggregate(pipeline);
```

## Expected Results

Two documents should be returned, each containing a new array field summarizing device measurements:

```javascript
[
  {
    weatherStationsZone: 'FieldZone-ABCD',
    dayHour: ISODate("2021-07-05T15:00:00.000Z"),
    readings_device_summary: [
      {
        device: 'ABCD-Device-123',
        tempCelsius: 19,
        humidityPercent: 30,
        pressureMBar: 1005
      },
      {
        device: 'ABCD-Device-789',
        pressureMBar: 1003,
        humidityPercent: 31,
        tempCelsius: 20
      }
    ]
  },
  {
    weatherStationsZone: 'FieldZone-ABCD',
    dayHour: ISODate("2021-07-05T16:00:00.000Z"),
    readings_device_summary: [
      {
        device: 'ABCD-Device-123',
        humidityPercent: 32,
        tempCelsius: 22,
        pressureMBar: 1007
      },
      {
        device: 'ABCD-Device-789',
        humidityPercent: 34,
        pressureMBar: 1008,
        tempCelsius: 22
      }
    ]
  }
]
```

## Observations

* __Pivoting Items By A Key.__ The pipeline uses `$setUnion` to capture unique device names for grouping. This optimizes aggregation performance.

* __Merging Subset Of Array Elements.__ Each `$map` iteration uses `$filter` to collect readings for the unique device, and `$mergeObjects` combines them into an object. If multiple readings exist, the last value is retained.

* __Potentially Adopt A Better Data Model.__ The data structure can be optimized for consumption. For IoT use cases, consider the [Bucketing pattern] or MongoDB's time series collection feature in version 5.0 or greater for efficient storage and querying.

Page Url: https://www.practical-mongodb-aggregations.com/guides/sharding
# Sharding Considerations

MongoDB Sharding scales databases for more data and higher throughput, enhancing analytical workloads by enabling parallel execution of aggregations across multiple shards. The functional capabilities of aggregations in a sharded cluster are similar to those in a replica set, with some constraints outlined in the _Sharded Aggregation Constraints_ section. Optimizing aggregations typically requires minimal changes to pipeline structure. The aggregation runtime distributes pipeline parts to shards and coalesces results optimally.

## Brief Summary Of Sharded Clusters

Sharded clusters partition data across multiple shards, each on separate hosts, using a shard key to define data distribution into "chunks." Unsharded collections reside on a designated "primary shard." From MongoDB 8.0, unsharded collections can be moved to other shards.

Mongos processes act as reverse proxies, routing operations to appropriate shards. For writes, mongos routes to the specific shard; for reads, it targets shards based on the shard key or broadcasts if absent. The chapter details sharded aggregation routing and execution.

## Sharded Aggregation Constraints

Some stages partially support sharded aggregations based on MongoDB version. Affected stages include:

* __`$lookup`__ and __`$graphLookup`__: Must reference an unsharded collection in versions prior to 5.1.
* __`$out`__: Must output to an unsharded collection; use `$merge` for sharded collections.

## Where Does A Sharded Aggregation Run?

Sharded clusters can reduce aggregation response times. For example, an aggregation on an unsharded collection of billions of documents may take 60 seconds, but with four shards, it could complete in about 15 seconds. However, some pipelines may require significant data transfer, increasing response time.

### Pipeline Splitting At Runtime

Sharded clusters execute pipeline stages in parallel on shards, but blocking stages (sorting and grouping) require all data in one place. Upon encountering a blocking stage, the pipeline splits into "Shards Part" (running concurrently) and "Merger Part" (executing in one location). 

Examples of aggregation pipeline splitting include:

1. Sharded sort with shard key matching.
2. Sharded group with `allowDiskUse:true`.

The explain plans show parallel execution in the _shards part_ and optimizations applied during the split.

### Execution Of The Shards Part Of The Split Pipeline

Mongos targets the _shards part_ based on the `$match` stage. If it includes the shard key, it routes to relevant shards. An exact match allows execution on a single shard without splitting.

### Execution Of The Merger Part Of The Split Pipeline

The runtime decides where to execute the _merger part_ based on a decision tree:

1. __Primary-Shard Merge__: Executes on the primary shard if referencing an unsharded collection.
2. __Targeted-Shard Execution__: Executes on one matched shard without splitting.
3. __Any-Shard Merge__: Executes on a randomly chosen shard if `allowDiskUse:true` is set and certain conditions are met.
4. __Mongos Merge__: Default execution on the initiating mongos in other cases.

The mongos streams final results back to the client.

### Difference In Merging Behaviour For Grouping Vs Sorting

The final phase of a split `$sort` stage is non-blocking, allowing streaming merges, while `$group` requires waiting for all data, making it blocking. 

### Summarising Sharded Pipeline Execution Approaches

The runtime aims to execute on relevant shards. If splitting is necessary, it prefers merging on a mongos to reduce network hops and execution time.

## Performance Tips For Sharded Aggregations

Optimizations from the Pipeline Performance Considerations chapter apply to sharded clusters:

1. __Sorting - Use Index Sort__: Avoids expensive in-memory sorts.
2. __Sorting - Use Limit With Sort__: Reduces network data transfer.
3. __Sorting - Reduce Records To Sort__: Move `$sort` late in the pipeline.
4. __Grouping - Avoid Unnecessary Grouping__: Use array operators instead of `$unwind` and `$group`.
5. __Grouping - Group Summary Data Only__: Reduces network data transfer.
6. __Encourage Match Filters Early__: Filters large subsets early.

Additional optimizations for sharded clusters:

1. __Target Aggregations to One Shard__: Include a `$match` on shard key.
2. __Merge on a Mongos__: Avoid `allowDiskUse:true` to reduce network data transfer.

Page Url: https://www.practical-mongodb-aggregations.com/examples/time-series/iot-power-consumption
# IoT Power Consumption

__Minimum MongoDB Version:__ 5.0 _(due to time series collections, `$setWindowFields`, & `$integral` operator)_

## Scenario

Monitor air-conditioning units in two buildings, analyzing power consumption data sent every 30 minutes to calculate energy consumed in kilowatt-hours (kWh) over the last hour and total energy consumed by all units in each building.

## Sample Data Population

Drop any existing database and populate a new `device_readings` collection with readings spanning 3 hours.

```javascript
db = db.getSiblingDB("book-iot-power-consumption");
db.dropDatabase();

db.createCollection("device_readings", {
  "timeseries": {
    "timeField": "timestamp",
    "metaField": "deviceID",
    "granularity": "minutes"
  }
});

db.device_readings.createIndex({"deviceID": 1, "timestamp": 1});

db.device_readings.insertMany([
  // 11:29am readings
  {"buildingID": "Building-ABC", "deviceID": "UltraAirCon-111", "timestamp": ISODate("2021-07-03T11:29:59Z"), "powerKilowatts": 8},
  {"buildingID": "Building-ABC", "deviceID": "UltraAirCon-222", "timestamp": ISODate("2021-07-03T11:29:59Z"), "powerKilowatts": 7},
  {"buildingID": "Building-XYZ", "deviceID": "UltraAirCon-666", "timestamp": ISODate("2021-07-03T11:29:59Z"), "powerKilowatts": 10},
  // Additional readings omitted for brevity
]);
```

## Aggregation Pipeline

Pipeline to calculate energy consumed over the last hour for each reading:

```javascript
var pipelineRawReadings = [
  {"$setWindowFields": {
    "partitionBy": "$deviceID",
    "sortBy": {"timestamp": 1},
    "output": {
      "consumedKilowattHours": {
        "$integral": {
          "input": "$powerKilowatts",
          "unit": "hour"
        },
        "window": {
          "range": [-1, "current"],
          "unit": "hour"
        }
      }
    }
  }},
];
```

Pipeline to compute total energy consumed by all units in each building:

```javascript
var pipelineBuildingsSummary = [
  {"$setWindowFields": {
    "partitionBy": "$deviceID",
    "sortBy": {"timestamp": 1},
    "output": {
      "consumedKilowattHours": {
        "$integral": {
          "input": "$powerKilowatts",
          "unit": "hour"
        },
        "window": {
          "range": [-1, "current"],
          "unit": "hour"
        }
      }
    }
  }},
  {"$sort": {"deviceID": 1, "timestamp": 1}},
  {"$group": {
    "_id": {
      "deviceID": "$deviceID",
      "date": {"$dateTrunc": {"date": "$timestamp", "unit": "hour"}}
    },
    "buildingID": {"$last": "$buildingID"},
    "consumedKilowattHours": {"$last": "$consumedKilowattHours"}
  }},
  {"$group": {
    "_id": {
      "buildingID": "$buildingID",
      "dayHour": {"$dateToString": {"format": "%Y-%m-%d  %H", "date": "$_id.date"}}
    },
    "consumedKilowattHours": {"$sum": "$consumedKilowattHours"}
  }},
  {"$sort": {"_id.buildingID": 1, "_id.dayHour": 1}},
  {"$set": {
    "buildingID": "$_id.buildingID",
    "dayHour": "$_id.dayHour",
    "_id": "$$REMOVE"
  }},
];
```

## Execution

Execute aggregation for energy consumed over the last hour:

```javascript
db.device_readings.aggregate(pipelineRawReadings);
db.device_readings.explain("executionStats").aggregate(pipelineRawReadings);
```

Execute aggregation for total energy consumed by all units:

```javascript
db.device_readings.aggregate(pipelineBuildingsSummary);
db.device_readings.explain("executionStats").aggregate(pipelineBuildingsSummary);
```

## Expected Results

Results for energy consumed over the last hour:

```javascript
[
  {buildingID: 'Building-ABC', deviceID: 'UltraAirCon-111', timestamp: ISODate("2021-07-03T11:29:59.000Z"), powerKilowatts: 8, consumedKilowattHours: 0},
  // Additional records omitted for brevity
]
```

Results for total energy consumed by all units:

```javascript
[
  {buildingID: 'Building-ABC', dayHour: '2021-07-03  11', consumedKilowattHours: 8},
  // Additional records omitted for brevity
]
```

## Observations

* __Integral Trapezoidal Rule.__ The `$integral` operator approximates the integral using the trapezoidal rule, calculating the area under the graph of power readings over time.
* __Window Range Definition.__ The pipeline defines a 1-hour window for previous documents relative to the current document for the `$integral` operator.
* __One Hour Range Vs Hours Output.__ The `$setWindowFields` stage uses `unit: "hour"` for both window size and output units, affecting the output format.
* __Optional Time Series Collection.__ Using a time series collection is optional but improves performance for large datasets.
* __Index For Partition By & Sort By.__ The index `{deviceID: 1, timestamp: 1}` optimizes the `$setWindowFields` stage, avoiding slow in-memory sorts.

Page Url: https://www.practical-mongodb-aggregations.com/guides/project
# Better Alternatives To A Project Stage

In MongoDB's Aggregation Framework, the `$project` stage specifies fields to include or exclude. However, it has usability challenges:

1. **Confusing and Non-intuitive**: You can only include or exclude fields in a single stage, except for the `_id` field, which can be excluded while including others.

2. **Verbose and Inflexible**: To define or revise a field, all other fields must be named for inclusion. This is cumbersome with many fields, especially in evolving data models.

MongoDB 4.2 introduced `$set` and `$unset`, which are often preferable for field inclusion/exclusion, making code clearer and reducing the need for pipeline refactoring. Specific situations favor `$project`, detailed in the section _When To Use Project_.

> MongoDB 3.4 introduced `$addFields`, which behaves like `$set`. This guide prefers `$set` for consistency.

## When To Use `$set` & `$unset`

Use `$set` & `$unset` when retaining most fields and modifying a minority subset. For example, consider a credit card payment document:

```javascript
// INPUT
{
  _id: ObjectId("6044faa70b2c21f8705d8954"),
  card_name: "Mrs. Jane A. Doe",
  card_num: "1234567890123456",
  card_expiry: "2023-08-31T23:59:59.736Z",
  card_sec_code: "123",
  card_provider_name: "Credit MasterCard Gold",
  transaction_id: "eb1bd77836e8713656d9bf2debba8900",
  transaction_date: ISODate("2021-01-13T09:32:07.000Z"),
  transaction_curncy_code: "GBP",
  transaction_amount: NumberDecimal("501.98"),
  reported: true
}
```

To modify documents, a naive `$project` pipeline would look like this:

```javascript
// BAD
{"$project": {
  "card_expiry": {"$dateFromString": {"dateString": "$card_expiry"}},
  "card_type": "CREDIT",
  "card_name": 1,
  "card_num": 1,
  "card_sec_code": 1,
  "card_provider_name": 1,
  "transaction_id": 1,
  "transaction_date": 1,
  "transaction_curncy_code": 1,
  "transaction_amount": 1,
  "reported": 1,
  "_id": 0,
}},
```

This is lengthy and requires naming all fields. A better approach uses `$set` and `$unset`:

```javascript
// GOOD
[
  {"$set": {
    "card_expiry": {"$dateFromString": {"dateString": "$card_expiry"}},
    "card_type": "CREDIT",
  }},
  {"$unset": ["_id"]},
]
```

This allows new fields to appear automatically without modifying the pipeline.

## When To Use `$project`

Use `$project` when the output document structure differs significantly from the input. For example:

```javascript
// OUTPUT
{
  transaction_info: { 
    date: ISODate("2021-01-13T09:32:07.000Z"),
    amount: NumberDecimal("501.98")
  },
  status: "REPORTED"
}
```

Using `$set`/`$unset` would require naming all fields to exclude:

```javascript
// BAD
[
  {"$set": {
    "transaction_info.date": "$transaction_date",
    "transaction_info.amount": "$transaction_amount",
    "status": {"$cond": {"if": "$reported", "then": "REPORTED", "else": "UNREPORTED"}},
  }},
  {"$unset": [
    "_id",
    "card_name",
    "card_num",
    "card_expiry",
    "card_sec_code",
    "card_provider_name",
    "transaction_id",
    "transaction_date",
    "transaction_curncy_code",
    "transaction_amount",
    "reported",
  ]},
]
```

Using `$project` simplifies this:

```javascript
// GOOD
[
  {"$project": {
    "transaction_info.date": "$transaction_date",
    "transaction_info.amount": "$transaction_amount",
    "status": {"$cond": {"if": "$reported", "then": "REPORTED", "else": "UNREPORTED"}},
    "_id": 0,
  }},
]
```

> Using `$project` can lead to including unintended fields, which may affect performance. Use it late in the pipeline to clarify the final output.

## Main Takeaway

Prefer `$set` (or `$addFields`) and `$unset` for field inclusion/exclusion, except when a very different output structure is required with few original fields retained.

Page Url: https://www.practical-mongodb-aggregations.com/examples/array-manipulations/array-element-grouping
# Array Element Grouping

__Minimum MongoDB Version:__ 4.2

## Scenario

You need to report total "coin" rewards for each gaming user from a collection that captures each coin award in an array. The solution must handle unknown future coin types.

## Sample Data Population

Drop any existing database and populate the user rewards collection:

```javascript
db = db.getSiblingDB("book-array-element-grouping");
db.dropDatabase();

db.user_rewards.insertMany([
  {
    "userId": 123456789,
    "rewards": [
      {"coin": "gold", "amount": 25, "date": ISODate("2022-11-01T09:25:23Z")},
      {"coin": "bronze", "amount": 100, "date": ISODate("2022-11-02T11:32:56Z")},
      {"coin": "silver", "amount": 50, "date": ISODate("2022-11-09T12:11:58Z")},
      {"coin": "gold", "amount": 10, "date": ISODate("2022-11-15T12:46:40Z")},
      {"coin": "bronze", "amount": 75, "date": ISODate("2022-11-22T12:57:01Z")},
      {"coin": "gold", "amount": 50, "date": ISODate("2022-11-28T19:32:33Z")},
    ],
  },
  {
    "userId": 987654321,
    "rewards": [
      {"coin": "bronze", "amount": 200, "date": ISODate("2022-11-21T14:35:56Z")},
      {"coin": "silver", "amount": 50, "date": ISODate("2022-11-21T15:02:48Z")},
      {"coin": "silver", "amount": 50, "date": ISODate("2022-11-27T23:04:32Z")},
      {"coin": "silver", "amount": 50, "date": ISODate("2022-11-27T23:29:47Z")},
      {"coin": "bronze", "amount": 500, "date": ISODate("2022-11-27T23:56:14Z")},
    ],
  },
  {
    "userId": 888888888,
    "rewards": [
      {"coin": "gold", "amount": 500, "date": ISODate("2022-11-13T13:42:18Z")},
      {"coin": "platinum", "amount": 5, "date": ISODate("2022-11-19T15:02:53Z")},
    ],
  },
]);
```

## Aggregation Pipeline

Define two functions for grouping: one for counting and one for summing:

```javascript
function arrayGroupByCount(arraySubdocField, groupByKeyField) {
  return {
    "$map": {
      "input": {
        "$setUnion": {
          "$map": {
            "input": `$${arraySubdocField}`,
            "in": `$$this.${groupByKeyField}`
          }
        }
      },
      "as": "key",
      "in": {
        "id": "$$key",
        "count": {
          "$size": {
            "$filter": {
              "input": `$${arraySubdocField}`,
              "cond": {
                "$eq": [`$$this.${groupByKeyField}`, "$$key"]
              }
            }
          }
        }
      }
    }
  };
}

function arrayGroupBySum(arraySubdocField, groupByKeyField, groupByValueField) {
  return {
    "$map": {
      "input": {
        "$setUnion": {
          "$map": {
            "input": `$${arraySubdocField}`,
            "in": `$$this.${groupByKeyField}`
          }
        }
      },
      "as": "key",
      "in": {
        "id": "$$key",
        "total": {
          "$reduce": {
            "input": `$${arraySubdocField}`,
            "initialValue": 0,
            "in": {
              "$cond": { 
                "if": {"$eq": [`$$this.${groupByKeyField}`, "$$key"]},
                "then": {"$add": [`$$this.${groupByValueField}`, "$$value"]},  
                "else": "$$value"  
              }            
            }            
          }
        }
      }
    }
  };
}
```

Define the aggregation pipeline:

```javascript
var pipeline = [
  {"$set": {
    "coinTypeAwardedCounts": arrayGroupByCount("rewards", "coin"),
    "coinTypeTotals": arrayGroupBySum("rewards", "coin", "amount"),
    "_id": "$$REMOVE",
    "rewards": "$$REMOVE",
  }},
];
```

## Execution

Run the aggregation and view its explain plan:

```javascript
db.user_rewards.aggregate(pipeline);
db.user_rewards.explain("executionStats").aggregate(pipeline);
```

## Expected Results

Three documents should be returned, showing counts and totals for each user:

```javascript
[
  {
    userId: 123456789,
    coinTypeAwardedCounts: [ 
      { id: 'bronze', count: 2 },
      { id: 'silver', count: 1 },
      { id: 'gold', count: 3 }
    ],
    coinTypeTotals: [
      { id: 'bronze', total: 175 },
      { id: 'silver', total: 50 },
      { id: 'gold', total: 85 }
    ]
  },
  {
    userId: 987654321,
    coinTypeAwardedCounts: [
      { id: 'bronze', count: 2 },
      { id: 'silver', count: 3 }
    ],
    coinTypeTotals: [
      { id: 'bronze', total: 700 },
      { id: 'silver', total: 150 }
    ]
  },
  {
    userId: 888888888,
    coinTypeAwardedCounts: [
      { id: 'gold', count: 1 },
      { id: 'platinum', count: 1 }
    ],
    coinTypeTotals: [
      { id: 'gold', total: 500 },
      { id: 'platinum', total: 5 }
    ]
  }
]
```

## Observations

* __Reusable Macro Functions.__ The aggregation uses macro functions to generate boilerplate code, which can be reused for grouping and totaling array elements.

* __Grouping Without Unwinding.__ The `$group` stage is standard for grouping, but this example avoids inefficiency by manipulating each document's array in isolation.

* __Variable Reference Confusion.__ In aggregation expressions, field paths start with `$` and variables with `$$`. The syntax `` `$${arraySubdocField}` `` uses Template Literals, replacing `${arraySubdocField}` with the string value before execution.

Page Url: https://www.practical-mongodb-aggregations.com/guides/advanced-arrays
# Advanced Use Of Expressions For Array Processing

MongoDB's ability to embed arrays within documents allows for a more intuitive data representation, reducing cognitive load on developers. The Aggregation Framework offers a rich set of expressions for analyzing and manipulating arrays, optimizing performance by avoiding unwinding and regrouping documents.

When manipulating arrays, a single operator expression often suffices. However, complex tasks may require combining multiple expressions, necessitating a shift to a functional programming mindset. This chapter includes JavaScript code snippets for clarity.

## "If-Else" Conditional Comparison

Consider a retailer calculating total order cost with discounts for quantities over 5. In procedural JavaScript:

```javascript
let order = {"product": "WizzyWidget", "price": 25.99, "qty": 8};
if (order.qty > 5) {
  order.cost = order.price * order.qty * 0.9;
} else {
  order.cost = order.price * order.qty;
}
```

In an aggregation pipeline:

```javascript
db.customer_orders.insertOne(order);
var pipeline = {"$set": {"cost": {"$cond": {"if": {"$gte": ["$qty", 5]}, "then": {"$multiply": ["$price", "$qty", 0.9]}, "else": {"$multiply": ["$price", "$qty"]}}}}}};
db.customer_orders.aggregate(pipeline);
```

This produces:

```javascript
{product: 'WizzyWidget', price: 25.99, qty: 8, cost: 187.128}
```

In functional JavaScript:

```javascript
order.cost = (order.qty > 5) ? (order.price * order.qty * 0.9) : (order.price * order.qty);
```

The aggregation pipeline operates on all documents, unlike the procedural approach.

## The "Power" Array Operators

For transforming or extracting data from arrays, use `$map` and `$reduce`. These operators allow iteration through an array, applying logic to each element.

* `$map`: Applies logic to each element, returning an array.
* `$reduce`: Executes logic for each element, returning a single value.

## "For-Each" Looping To Transform An Array

To convert product names to uppercase:

Procedural JavaScript:

```javascript
let order = {"orderId": "AB12345", "products": ["Laptop", "Kettle", "Phone", "Microwave"]};
for (let pos in order.products) {
  order.products[pos] = order.products[pos].toUpperCase();
}
```

Aggregation pipeline:

```javascript
db.orders.insertOne(order);
var pipeline = [{"$set": {"products": {"$map": {"input": "$products", "as": "product", "in": {"$toUpper": "$$product"}}}}}];
db.orders.aggregate(pipeline);
```

Functional JavaScript:

```javascript
order.products = order.products.map(product => product.toUpperCase());
```

## "For-Each" Looping To Compute A Summary Value From An Array

To create a summary string of product names:

Procedural JavaScript:

```javascript
let order = {"orderId": "AB12345", "products": ["Laptop", "Kettle", "Phone", "Microwave"]};
order.productList = "";
for (const pos in order.products) {
  order.productList += order.products[pos] + "; ";
}
```

Aggregation pipeline:

```javascript
db.orders.insertOne(order);
var pipeline = [{"$set": {"productList": {"$reduce": {"input": "$products", "initialValue": "", "in": {"$concat": ["$$value", "$$this", "; "]}}}}}}];
db.orders.aggregate(pipeline);
```

Functional JavaScript:

```javascript
order.productList = order.products.reduce((previousValue, currentValue) => previousValue + currentValue + "; ", "");
```

## "For-Each" Looping To Locate An Array Element

To find the first room with sufficient space:

```javascript
db.buildings.insertOne({"building": "WestAnnex-1", "room_sizes": [{"width": 9, "length": 5}, {"width": 8, "length": 7}, {"width": 7, "length": 9}, {"width": 9, "length": 8}]});
```

Pipeline to find the index:

```javascript
var pipeline = [{"$set": {"firstLargeEnoughRoomArrayIndex": {"$reduce": {"input": {"$range": [0, {"$size": "$room_sizes"}]}, "initialValue": -1, "in": {"$cond": {"if": {"$and": [{"$lt": ["$$value", 0]}, {"$gt": [{"$multiply": [{"$getField": {"input": {"$arrayElemAt": ["$room_sizes", "$$this"]}, "field": "width"}},{"$getField": {"input": {"$arrayElemAt": ["$room_sizes", "$$this"]}, "field": "length"}}]}}, 60]}}, "then": "$$this", "else": "$$value"}}}}}];
db.buildings.aggregate(pipeline);
```

To return the first matching room:

```javascript
var pipeline = [{"$set": {"firstLargeEnoughRoom": {"$first": {"$filter": {"input": "$room_sizes", "as": "room", "cond": {"$gt": [{"$multiply": ["$$room.width", "$$room.length"]}, 60]}}}}}}}];
db.buildings.aggregate(pipeline);
```

## Reproducing _$map_ Behaviour Using _$reduce_

To transform an array using `$reduce`:

```javascript
db.deviceReadings.insertOne({"device": "A1", "readings": [27, 282, 38, -1, 187]});
var pipeline = [{"$set": {"deviceReadings": {"$reduce": {"input": "$readings", "initialValue": [], "in": {"$concatArrays": ["$$value", [{"$concat": ["$device", ":", {"$toString": "$$this"}]}]]}}}}}];
db.deviceReadings.aggregate(pipeline);
```

## Adding New Fields To Existing Objects In An Array

To calculate total cost for each order item:

```javascript
db.orders.insertOne({"custid": "jdoe@acme.com", "items": [{"product": "WizzyWidget", "unitPrice": 25.99, "qty": 8}, {"product": "HighEndGizmo", "unitPrice": 33.24, "qty": 3}]});
var pipeline = [{"$set": {"items": {"$map": {"input": "$items", "as": "item", "in": {"product": "$$item.product", "unitPrice": "$$item.unitPrice", "qty": "$$item.qty", "cost": {"$multiply": ["$$item.unitPrice", "$$item.qty"]}}}}}}}];
db.orders.aggregate(pipeline);
```

Using `$mergeObjects`:

```javascript
var pipeline = [{"$set": {"items": {"$map": {"input": "$items", "as": "item", "in": {"$mergeObjects": ["$$item", {"cost": {"$multiply": ["$$item.unitPrice", "$$item.qty"]}}]}}}}}}];
db.orders.aggregate(pipeline);
```

## Rudimentary Schema Reflection Using Arrays

To analyze document schema:

```javascript
db.customers.insertMany([{"_id": ObjectId('6064381b7aa89666258201fd'), "email": 'elsie_smith@myemail.com', "dateOfBirth": ISODate('1991-05-30T08:35:52.000Z'), "accNnumber": 123456, "balance": NumberDecimal("9.99"), "address": {"firstLine": "1 High Street", "city": "Newtown", "postcode": "NW1 1AB"}, "telNums": ["07664883721", "01027483028"], "optedOutOfMarketing": true},{"_id": ObjectId('734947394bb73732923293ed'), "email": 'jon.jones@coolemail.com', "dateOfBirth": ISODate('1993-07-11T22:01:47.000Z'), "accNnumber": 567890, "balance": NumberDecimal("299.22"), "telNums": "07836226281", "contactPrefernece": "email"}]);
var pipeline = [{"$project": {"_id": 0, "schema": {"$map": {"input": {"$objectToArray": "$$ROOT"}, "as": "field", "in": {"fieldname": "$$field.k", "type": {"$type": "$$field.v"}}}}}}}];
db.customers.aggregate(pipeline);
```

Improved pipeline with `$unwind` and `$group`:

```javascript
var pipeline = [{"$project": {"_id": 0, "schema": {"$map": {"input": {"$objectToArray": "$$ROOT"}, "as": "field", "in": {"fieldname": "$$field.k", "type": {"$type": "$$field.v"}}}}}}},{"$unwind": "$schema"},{"$group": {"_id": "$schema.fieldname", "types": {"$addToSet": "$schema.type"}}},{"$set": {"fieldname": "$_id", "_id": "$$REMOVE"}}];
db.customers.aggregate(pipeline);
```

This provides a summary of field names and types. Further examples of array manipulation are available in this book's Array Manipulation Examples section.

Page Url: https://www.practical-mongodb-aggregations.com/examples/foundational/group-and-total
# Group & Total

__Minimum MongoDB Version:__ 4.2

## Scenario

Generate a report showing each shop customer's purchases in 2020, grouped by customer, capturing their first purchase date, number of orders, total value, and a sorted list of order items.

## Sample Data Population

Drop any existing database and populate a new `orders` collection with 9 documents for 3 customers:

```javascript
db = db.getSiblingDB("book-group-and-total");
db.dropDatabase();
db.orders.createIndex({"orderdate": -1});
db.orders.insertMany([
  {"customer_id": "elise_smith@myemail.com", "orderdate": ISODate("2020-05-30T08:35:52Z"), "value": NumberDecimal("231.43")},
  {"customer_id": "elise_smith@myemail.com", "orderdate": ISODate("2020-01-13T09:32:07Z"), "value": NumberDecimal("99.99")},
  {"customer_id": "oranieri@warmmail.com", "orderdate": ISODate("2020-01-01T08:25:37Z"), "value": NumberDecimal("63.13")},
  {"customer_id": "tj@wheresmyemail.com", "orderdate": ISODate("2019-05-28T19:13:32Z"), "value": NumberDecimal("2.01")},
  {"customer_id": "tj@wheresmyemail.com", "orderdate": ISODate("2020-11-23T22:56:53Z"), "value": NumberDecimal("187.99")},
  {"customer_id": "tj@wheresmyemail.com", "orderdate": ISODate("2020-08-18T23:04:48Z"), "value": NumberDecimal("4.59")},
  {"customer_id": "elise_smith@myemail.com", "orderdate": ISODate("2020-12-26T08:55:46Z"), "value": NumberDecimal("48.50")},
  {"customer_id": "tj@wheresmyemail.com", "orderdate": ISODate("2021-02-29T07:49:32Z"), "value": NumberDecimal("1024.89")},
  {"customer_id": "elise_smith@myemail.com", "orderdate": ISODate("2020-10-03T13:49:44Z"), "value": NumberDecimal("102.24")}
]);
```

## Aggregation Pipeline

Define the aggregation pipeline:

```javascript
var pipeline = [
  {"$match": {"orderdate": {"$gte": ISODate("2020-01-01T00:00:00Z"), "$lt": ISODate("2021-01-01T00:00:00Z")}}},
  {"$sort": {"orderdate": 1}},
  {"$group": {
    "_id": "$customer_id",
    "first_purchase_date": {"$first": "$orderdate"},
    "total_value": {"$sum": "$value"},
    "total_orders": {"$sum": 1},
    "orders": {"$push": {"orderdate": "$orderdate", "value": "$value"}}
  }},
  {"$sort": {"first_purchase_date": 1}},
  {"$set": {"customer_id": "$_id"}},
  {"$unset": ["_id"]}
];
```

## Execution

Execute the aggregation and view its explain plan:

```javascript
db.orders.aggregate(pipeline);
db.orders.explain("executionStats").aggregate(pipeline);
```

## Expected Results

Three documents should be returned, each showing the customer's first purchase date, total value, number of orders, and order details for 2020:

```javascript
[
  {
    customer_id: 'oranieri@warmmail.com',
    first_purchase_date: ISODate('2020-01-01T08:25:37.000Z'),
    total_value: NumberDecimal('63.13'),
    total_orders: 1,
    orders: [{orderdate: ISODate('2020-01-01T08:25:37.000Z'), value: NumberDecimal('63.13')}]
  },
  {
    customer_id: 'elise_smith@myemail.com',
    first_purchase_date: ISODate('2020-01-13T09:32:07.000Z'),
    total_value: NumberDecimal('482.16'),
    total_orders: 4,
    orders: [
      {orderdate: ISODate('2020-01-13T09:32:07.000Z'), value: NumberDecimal('99.99')},
      {orderdate: ISODate('2020-05-30T08:35:52.000Z'), value: NumberDecimal('231.43')},
      {orderdate: ISODate('2020-10-03T13:49:44.000Z'), value: NumberDecimal('102.24')},
      {orderdate: ISODate('2020-12-26T08:55:46.000Z'), value: NumberDecimal('48.50')}
    ]
  },
  {
    customer_id: 'tj@wheresmyemail.com',
    first_purchase_date: ISODate('2020-08-18T23:04:48.000Z'),
    total_value: NumberDecimal('192.58'),
    total_orders: 2,
    orders: [
      {orderdate: ISODate('2020-08-18T23:04:48.000Z'), value: NumberDecimal('4.59')},
      {orderdate: ISODate('2020-11-23T22:56:53.000Z'), value: NumberDecimal('187.99')}
    ]
  }
]
```

## Observations

* __Double Sort Use.__ A `$sort` is needed before and after `$group` to capture the first order date and maintain order.
* __Renaming Group.__ Use `$set` and `$unset` to rename `_id` to `customer_id`.
* __High-Precision Decimals.__ Use `NumberDecimal()` for precision; using float/double may lead to loss of accuracy:

```javascript
// Desired result
total_value: NumberDecimal('482.16')

// Result with float/double
total_value: 482.15999999999997
```

Page Url: https://www.practical-mongodb-aggregations.com/examples/array-manipulations/array-sort-percentiles
# Array Sorting & Percentiles

__Minimum MongoDB Version:__ 4.2

## Scenario

You want to analyze performance test results stored in a database, calculating the median (50th percentile) and 90th percentile response times for each test run, keeping only those with a 90th percentile response time greater than 100 milliseconds.

> _For MongoDB version 5.1 and earlier, use a custom `sortArray()` function for inline sorting. For version 5.2+, use the `$sortArray` operator. Version 7.0 introduced `$percentile` and `$median` operators, simplifying the solution._

## Sample Data Population

Drop any existing database and populate the `performance_test_results` collection:

```javascript
db = db.getSiblingDB("book-array-sort-percentiles");
db.dropDatabase();

db.performance_test_results.insertMany([
  { "testRun": 1, "datetime": ISODate("2021-08-01T22:51:27.638Z"), "responseTimesMillis": [62, 97, 59, 104, 97, 71, 62, 115, 82, 87] },
  { "testRun": 2, "datetime": ISODate("2021-08-01T22:56:32.272Z"), "responseTimesMillis": [34, 63, 51, 104, 87, 63, 64, 86, 105, 51, 73, 78, 59, 108, 65, 58, 69, 106, 87, 93, 65] },
  { "testRun": 3, "datetime": ISODate("2021-08-01T23:01:08.908Z"), "responseTimesMillis": [56, 72, 83, 95, 107, 83, 85] },
  { "testRun": 4, "datetime": ISODate("2021-08-01T23:17:33.526Z"), "responseTimesMillis": [78, 67, 107, 110] },
  { "testRun": 5, "datetime": ISODate("2021-08-01T23:24:39.998Z"), "responseTimesMillis": [75, 91, 75, 87, 99, 88, 55, 72, 99, 102] },
  { "testRun": 6, "datetime": ISODate("2021-08-01T23:27:52.272Z"), "responseTimesMillis": [88, 89] },
  { "testRun": 7, "datetime": ISODate("2021-08-01T23:31:59.917Z"), "responseTimesMillis": [101] },
]);
```

## Aggregation Pipeline

For MongoDB version 5.1 or earlier, define the `sortArray()` function:

```javascript
function sortArray(sourceArrayField) {
  return {
    "$reduce": {
      "input": sourceArrayField, 
      "initialValue": [],
      "in": {
        "$let": {
          "vars": {
            "resultArray": "$$value",
            "currentSourceArrayElement": "$$this"
          },   
          "in": {
            "$let": {
              "vars": {
                "targetArrayPosition": {
                  "$reduce": { 
                    "input": {"$range": [0, {"$size": "$$resultArray"}]},
                    "initialValue": {"$size": "$$resultArray"},
                    "in": {
                      "$cond": [ 
                        {"$lt": ["$$currentSourceArrayElement", {"$arrayElemAt": ["$$resultArray", "$$this"]}]}, 
                        {"$min": ["$$value", "$$this"]}, 
                        "$$value"
                      ]
                    }
                  }
                }
              },
              "in": {
                "$concatArrays": [
                  {"$cond": [{"$eq": [0, "$$targetArrayPosition"]}, [], {"$slice": ["$$resultArray", 0, "$$targetArrayPosition"]}]},
                  ["$$currentSourceArrayElement"],
                  {"$cond": [{"$gt": [{"$size": "$$resultArray"}, 0]}, {"$slice": ["$$resultArray", "$$targetArrayPosition", {"$size": "$$resultArray"}]}, []]}
                ]
              } 
            }
          }
        }
      }
    }      
  };
}
```

Define `arrayElemAtPercentile()` for capturing the nth percentile element:

```javascript
function arrayElemAtPercentile(sourceArrayField, percentile) {
  return {    
    "$let": {
      "vars": {
        "sortedArray": sortArray(sourceArrayField),
      },
      "in": {         
        "$arrayElemAt": [
          "$$sortedArray",
          {"$subtract": [{"$ceil": {"$multiply": [{"$divide": [percentile, 100]}, {"$size": "$$sortedArray"}]}}, 1]}
        ]
      }
    }
  };
}
```

Define the aggregation pipeline:

```javascript
var pipeline = [
  {"$set": {
    "sortedResponseTimesMillis": sortArray("$responseTimesMillis"),
    "medianTimeMillis": arrayElemAtPercentile("$responseTimesMillis", 50),
    "ninetiethPercentileTimeMillis": arrayElemAtPercentile("$responseTimesMillis", 90),
  }},
  {"$match": {
    "ninetiethPercentileTimeMillis": {"$gt": 100},
  }},
  {"$unset": ["_id", "datetime", "responseTimesMillis"]},    
];
```

## Execution

Execute the aggregation:

```javascript
db.performance_test_results.aggregate(pipeline);
db.performance_test_results.explain("executionStats").aggregate(pipeline);
```

## Expected Results

Five documents should be returned with a 90th percentile response time greater than 100 milliseconds:

```javascript
[
  { testRun: 1, sortedResponseTimesMillis: [59, 62, 62, 71, 82, 87, 97, 97, 104, 115], medianTimeMillis: 82, ninetiethPercentileTimeMillis: 104 },
  { testRun: 2, sortedResponseTimesMillis: [34, 51, 51, 58, 59, 63, 63, 64, 65, 65, 69, 73, 78, 86, 87, 87, 93, 104, 105, 106, 108], medianTimeMillis: 69, ninetiethPercentileTimeMillis: 105 },
  { testRun: 3, sortedResponseTimesMillis: [56, 72, 83, 83, 85, 95, 107], medianTimeMillis: 83, ninetiethPercentileTimeMillis: 107 },
  { testRun: 4, sortedResponseTimesMillis: [67, 78, 107, 110], medianTimeMillis: 78, ninetiethPercentileTimeMillis: 110 },
  { testRun: 7, sortedResponseTimesMillis: [101], medianTimeMillis: 101, ninetiethPercentileTimeMillis: 101 }
]
```

## Observations

* __Macro Functions.__ Two functions, `sortArray()` and `arrayElemAtPercentile()`, generate aggregation boilerplate code. You can view the complete pipeline by typing `pipeline` in the Shell.

* __Sorting On Primitives Only.__ The `sortArray()` function sorts arrays of primitive values. For arrays of objects, enhancements are needed, which are not covered here. The `$sortArray` operator in version 5.2+ simplifies this.

* __Comparison With Classic Sorting Algorithms.__ The custom sorting code is slower than recognized sorting algorithms but is optimal for aggregation. For larger arrays, performance may degrade. The `$sortArray` operator in version 5.2+ uses optimized algorithms.

* __Simplified Pipeline In MongoDB 7.0.__ Using `$sortArray`, `$percentile`, and `$median`, you can create a simpler pipeline:

```javascript
var pipeline = [
  {"$set": {
    "sortedResponseTimesMillis": {"$sortArray": {"input": "$responseTimesMillis", "sortBy": 1}},
    "medianTimeMillis": {"$median": {"input": "$responseTimesMillis", "method": "approximate"}},
    "ninetiethPercentileTimeMillis": {"$first": {"$percentile": {"input": "$responseTimesMillis", "p": [0.90], "method": "approximate"}}}
  }},
  {"$match": {"ninetiethPercentileTimeMillis": {"$gt": 100}}},
];
```

