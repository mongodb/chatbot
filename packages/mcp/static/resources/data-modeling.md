<guide>
<guide_topic>Data Modeling</guide_topic>

<section>
<title>Data Modeling</title>
<url>https://mongodb.com/docs/manual/data-modeling/</url>

# Data Modeling

MongoDB uses a flexible schema: documents in one collection can vary in fields and types. Add schema validation for consistency.

## Design Workflow
1. Identify workload (query/read/write patterns).  
2. Map relationships between entities.  
3. Choose patterns (embed, reference, duplicate, bucket, etc.).

## Linking Data
### Embed (denormalized)
- Place related arrays/sub-docs inside parent doc.  
- Fetch all info with one query; single-document writes are atomic.  
- Drawbacks: larger docs, duplicated data.

### Reference (normalized)
- Store foreign key (`_id`) to another collection.  
- Resolve via application code or `$lookup`.  
- Prefer when related set is large, frequently updated, or shared.

## Duplication
- Acceptable if duplicates change rarely; speeds reads.  
- Evaluate update cost vs performance gain.

## Index & Hardware
- Index fields in frequent queries; monitor usage.  
- Large docs increase RAM/disk I/O; project only needed fields.

## Atomicity
All writes inside one document (including embedded structures) succeed or roll back together.

</section>
<section>
<title>Designing Your Schema</title>
<url>https://mongodb.com/docs/manual/data-modeling/schema-design-process/</url>

# Schema Design

Design early to avoid performance issues; iterate as needs change (MongoDB supports live changes, but large prod edits are costly).

Steps:
1. Identify workload (frequent operations).  
2. Map relationships: embed vs. reference.  
3. Apply design patterns for read/write optimization.  
4. Index for common query patterns.

</section>
<section>
<title>Identify Application Workload</title>
<url>https://mongodb.com/docs/manual/data-modeling/schema-design-process/identify-workload/</url>

# Identify Application Workload

Purpose: catalog high-frequency/critical queries before schema/index design.

## Steps
1. Determine required data  
   • User/business needs  
   • Logs & `Database Profiler` output (frequent ops).

2. Build workload table:

| Column | Description |
| --- | --- |
| Action | User behavior triggering query |
| Type | read / write |
| Fields | Data read or written |
| Frequency | Execution rate; drives indexing |
| Priority | Business criticality |

Optimize queries with high Frequency or Priority.

## Example (blog)

| Action | Type | Fields | Freq | Prio |
| --- | --- | --- | --- | --- |
| Submit article | W | author, text | 10 /day | High |
| Submit comment | W | user, text | 1 k/day | Med |
| View article | R | id, text, comments | 1 M/day | High |
| View analytics | R | id, comments, clicks | 10 /h | Low |

Next: Map schema relationships.

</section>
<section>
<title>Map Schema Relationships</title>
<url>https://mongodb.com/docs/manual/data-modeling/schema-design-process/map-relationships/</url>

# Map Schema Relationships

Embed related data when reads dominate; reference when updates or isolated reads dominate.

Decision matrix  
• Frequent joint queries → embed.  
• Frequent independent updates/reads of a sub-entity → reference.  

Prereq: list workload ops → note shared/related fields → classify relation (1-1, 1-N, N-N).

Implementation  
1. Draw schema map (ER style).  
2. For each relation choose:  
   – Embed: single-doc reads, no $lookup.  
   – Reference: separate collection, store FK, perform manual lookup or `$lookup`.

### Example 1: Read-heavy article view (embed)

```javascript
db.articles.insertOne({
  title:"My Favorite Vacation",
  date:ISODate("2023-06-02"),
  text:"We spent seven days in Italy...",
  tags:[{name:"travel",url:"/tags/travel"},
        {name:"adventure",url:"/tags/adventure"}],
  comments:[{name:"pedro123",text:"Great article!"}],
  author:{name:"alice123",email:"alice@mycompany.com",avatar:"photo1.jpg"}
})
```

### Example 2: Separate article/author queries (reference)

```javascript
// articles
db.articles.insertOne({
  title:"My Favorite Vacation",
  date:ISODate("2023-06-02"),
  text:"We spent seven days in Italy...",
  authorId:987,
  tags:[{name:"travel",url:"/tags/travel"},
        {name:"adventure",url:"/tags/adventure"}],
  comments:[{name:"pedro345",text:"Great article!"}]
})

// authors
db.authors.insertOne({
  _id:987,
  name:"alice123",
  email:"alice@mycompany.com",
  avatar:"photo1.jpg"
})
```

Next: apply pattern optimizations.

</section>
<section>
<title>Apply Design Patterns</title>
<url>https://mongodb.com/docs/manual/data-modeling/schema-design-process/apply-patterns/</url>

# Apply Design Patterns

Schema design patterns tailor data models to application access patterns; each pattern trades off read/write speed, consistency, and complexity. Analyze your workload before choosing.

Patterns in example  
• Subset: store part of `movie` data inside each `theater` doc → smaller read payloads.  
• Computed: maintain aggregate `total_views` in `movie` doc.

```javascript
// movie (computed pattern)
{ _id:1, title:"Titanic", total_views:3500, … }

// theater (subset pattern)
{
  name:"Downtown Cinemas",
  movies:[{ movie_id:1, title:"Titanic", runtime:194, views:1500 }]
}
```

</section>
<section>
<title>Create Indexes to Support Your Queries</title>
<url>https://mongodb.com/docs/manual/data-modeling/schema-design-process/create-indexes/</url>

# Create Indexes

Covered query = index holds every field used, so collection scan avoided.  
One collection ≤ 64 indexes; each extra index slows writes.

## Workflow
1. `$queryStats` → find frequent query shapes.  
2. `createIndex()` on those fields.  
3. Monitor with `$indexStats` or Atlas UI; drop unused indexes. Repeat.

## Patterns
### Single Key
```javascript
db.products.createIndex({category:1})
db.products.find({category:"electronics"})
```

### Compound & Prefixes
```javascript
db.products.createIndex({category:1,item:1,location:1})
// Supported
db.products.find({category:"electronics"})
db.products.find({category:"electronics",item:"television"})
```

### Text Search
Atlas: Atlas Search index.  
Self-managed: `text` index.

### Vector Search
See “Index Fields for Vector Search”.

## Collation Rules
• Query must specify same collation to use index on string fields.  
```javascript
db.myColl.createIndex({category:1},{collation:{locale:"fr"}})
db.myColl.find({category:"cafe"}).collation({locale:"fr"}) // uses index
db.myColl.find({category:"cafe"})                          // cannot
```  
• For compound `{score:1,price:1,category:1}` with `locale:"fr"`, queries using simple binary collation still use index for non-string prefix:
```javascript
db.myColl.find({score:5}).sort({price:1})
db.myColl.find({score:5,price:{$gt:10}}).sort({price:1})
db.myColl.find({score:5,category:"cafe"}) // only score field indexed
```

See also: ESR guideline, Collation docs, Query Optimization.

</section>
<section>
<title>Schema Design Patterns</title>
<url>https://mongodb.com/docs/manual/data-modeling/design-patterns/</url>

# Schema Design Patterns

Optimize schema for query patterns: precompute results, bucket data, store polymorphic docs in one collection, plan for schema evolution, archive cold data.

</section>
<section>
<title>Handle Computed Values</title>
<url>https://mongodb.com/docs/manual/data-modeling/design-patterns/handle-computed-values/</url>

# Computed & Approximation Patterns

Pre-compute and store derived values (insert-time or scheduled job) for faster reads.

Patterns  
• **Computed** – precise; refresh periodically while base data changes (e.g., “100 Best-Reviewed Gadgets”).  
• **Approximation** – coarse but statistically valid; update in fixed steps (e.g., city population ±100).

See: Store Computed Data, Use Approximation Pattern, Designing Your Schema, Schema Design Patterns.

</section>
<section>
<title>Store Computed Data</title>
<url>https://mongodb.com/docs/manual/data-modeling/design-patterns/computed-values/computed-schema-pattern/</url>

# Store Computed Data

Frequent reads + costly calculations ⇒ pre-compute & persist results.

Insert source data
```javascript
db.screenings.insertMany([
  {theater:"Alger Cinema",location:"Lakeview, OR",movie_title:"Lost in the Shadows",movie_id:1,num_viewers:344,revenue:3440},
  {theater:"City Cinema",location:"New York, NY",movie_title:"Lost in the Shadows",movie_id:1,num_viewers:1496,revenue:22440}
])
```

Initial aggregate → target collection
```javascript
db.movies.insertOne({_id:1,title:"Lost in the Shadows",total_viewers:1840,total_revenue:25880})
```

New write breaks totals
```javascript
db.screenings.insertOne({theater:"Overland Park Cinema",location:"Boise, ID",movie_title:"Lost in the Shadows",movie_id:1,num_viewers:760,revenue:7600})
```

Periodic or on-write recompute
```javascript
db.screenings.aggregate([
  {$group:{_id:"$movie_id",
           total_viewers:{$sum:"$num_viewers"},
           total_revenue:{$sum:"$revenue"}}},
  {$merge:{into:{db:"test",coll:"movies"},on:"_id",whenMatched:"merge"}}
])
```

Verify
```javascript
db.movies.find()
// {_id:1,title:"Lost in the Shadows",total_viewers:2600,total_revenue:33480}
```

Use when read>write and exactness not always required.

</section>
<section>
<title>Use the Approximation Pattern</title>
<url>https://mongodb.com/docs/manual/data-modeling/design-patterns/computed-values/approximation-schema-pattern/</url>

# Approximation Pattern

Use when values change often but only trend accuracy is needed (e.g., city population, site visits). Store/update data only when change ≥ granularity N to cut writes and load.

```javascript
// initial record
db.population.insertOne({
  city: "New Perth",
  population: 40000,
  date: ISODate("2022-09-15")
})

// app-side approximation
let stored = 40000, N = 100

function maybeUpdate(newVal){
  if (Math.abs(stored - newVal) >= N){
    db.population.insertOne({
      city: "New Perth",
      population: newVal,
      date: new Date()
    })
    stored = newVal
  }
}
```

Example results:

```javascript
db.population.insertMany([
  {city:"New Perth", population:40100, date:ISODate("2024-09-20")},
  {city:"New Perth", population:40200, date:ISODate("2024-10-01")},
  {city:"New Perth", population:40300, date:ISODate("2024-10-09")}
])
```

Granularity 100 yields ~1 % of writes required for exact tracking while preserving trend visibility.

</section>
<section>
<title>Group Data</title>
<url>https://mongodb.com/docs/manual/data-modeling/design-patterns/group-data/</url>

# Group Data

Large arrays can hurt query speed; split them with:

- **Bucket pattern**: group fixed-size arrays (e.g., reviews paginated 10 per doc). Time-series collections auto-bucket.
- **Outlier pattern**: move unusually large sub-sets (e.g., reviews of one popular book) to separate docs so typical docs stay small.

See: “Group Data with the Bucket Pattern”, “Group Data with the Outlier Pattern”, “Time Series Collections”.

</section>
<section>
<title>Group Data with the Bucket Pattern</title>
<url>https://mongodb.com/docs/manual/data-modeling/design-patterns/group-data/bucket-pattern/</url>

# Bucket Pattern – Stock Trades Example

Stores N related items (page) per doc.

Initial per-trade doc ➜ bucketed per customer/page:

```json
{ _id:"123_1698349623", customerId:123, count:2, history:[
  {type:"buy", ticker:"MDB", qty:419, date:ISODate("2023-10-26T15:47:03.434Z")},
  {type:"sell",ticker:"MDB", qty:29,  date:ISODate("2023-10-30T09:32:57.765Z")}
]}
```
• `_id` = `${customerId}_${firstTradeEpochSec}`  
• `count` = history length, used for pagination (10/page).

## Query (1-based pages)

```javascript
// page 1
db.trades.find({_id:/^123_/}).sort({_id:1}).limit(1)

// page N
db.trades.find({_id:/^123_/}).sort({_id:1}).skip(N-1).limit(1)
```
Uses default `_id` index; no extra index needed.

## Insert Trade

```javascript
db.trades.updateOne(
  { _id:/^123_/, count:{ $lt:10 } },           // find non-full bucket
  { $push:{history:{type:"buy",ticker:"MSFT",qty:42,date:ISODate("2023-11-02T11:43:10")}},
    $inc:{count:1},
    $setOnInsert:{ _id:"123_1698939791", customerId:123 } },
  { upsert:true })
```
• Appends if bucket not full; else creates new bucket via upsert.  
• Guarantees bounded `history` arrays.

Time-series collections apply this pattern automatically.

</section>
<section>
<title>Group Data with the Outlier Pattern</title>
<url>https://mongodb.com/docs/manual/data-modeling/design-patterns/group-data/outlier-pattern/</url>

# Outlier Pattern

Isolate atypically large/irregular docs to protect query speed.

Pros: typical queries avoid bloated docs, stable UX.  
Cons: extra collections + update logic.

Example: `sales` docs with unbounded `customers_purchased` array.

Threshold (e.g. 50 items).  
If length > 50:

```javascript
// main collection
{
  _id:2, title:"The Wooden Amulet", year:2023, author:"Lesley Moreno",
  customers_purchased:[ "user00", … "user49" ],
  has_extras:true      // flag = outlier
}

// overflow collection
db.extra_sales.insertOne({
  book_id:2,
  customers_purchased_extra:[ "user50", … "user999" ]
})
```

Create index on `extra_sales.book_id`.

Queries:  
• Typical book → 1 read from `sales`.  
• Outlier book → read `sales`, then `extra_sales` by `book_id`.

Updates:  
```
if (!doc.has_extras) {
    push to sales.customers_purchased;
    if (arrayLen>50) set has_extras=true;
} else {
    push to extra_sales where book_id=doc._id;
}
```

Related patterns: Bucket, Avoid Unbounded Arrays, Embedded vs References, Store Computed Data.

</section>
<section>
<title>Group Data with the Attribute Pattern</title>
<url>https://mongodb.com/docs/manual/data-modeling/design-patterns/group-data/attribute-pattern/</url>
<description>Discover how the Attribute Pattern in MongoDB optimizes data modeling for flexible and scalable applications, enhancing your database design strategy.</description>


# Attribute Pattern

Consolidate many similar/optional fields into an array of key-value subdocs to cut index count and speed reads/writes.

Use when  
• Docs hold many fields with shared meaning (e.g., per-country release dates, size specs).  
• Only a subset of docs contains those fields.

```javascript
// BEFORE
{
  _id: 1, title: "Star Wars", runtime: 121, directors: ["George Lucas"],
  release_US: ISODate("1977-05-20"),
  release_France: ISODate("1977-10-19"),
  release_Italy: ISODate("1977-10-20"),
  release_UK: ISODate("1977-12-27")
}
// 4 separate indexes needed
db.movies.createIndex({release_US:1}) ...
```

```javascript
// AFTER
{
  _id: 1, title: "Star Wars", runtime: 121, directors: ["George Lucas"],
  releases: [
    {location:"USA",   date:ISODate("1977-05-20")},
    {location:"France",date:ISODate("1977-10-19")},
    {location:"Italy", date:ISODate("1977-10-20")},
    {location:"UK",    date:ISODate("1977-12-27")}
  ]
}
db.movies.createIndex({releases:1})   // single multikey index
```

Other example:

```javascript
// Bottle specs
{
  _id:1,
  specs:[
    {k:"volume", v:"500", u:"ml"},
    {k:"volume", v:"12",  u:"ounces"},
    {k:"height", v:"8",   u:"inches"}
  ]
}
db.bottles.createIndex({specs:1})
```

Key: `k`=attribute, `v`=value, `u`=unit. Add more spec types without schema changes or extra indexes.

</section>
<section>
<title>Polymorphic Data</title>
<url>https://mongodb.com/docs/manual/data-modeling/design-patterns/polymorphic-data/</url>

# Polymorphic Data

MongoDB lets documents in one collection vary.  
Patterns:

**Polymorphic** – one collection holds different shapes when queries span all types. Eg. athletes of varied sports with sport-specific fields.

**Inheritance** – parent entity supplies shared fields; child entities add extras. Eg. books (ebook/print/audio) all share `title`, `author`, `genre`.

Both optimize for query patterns over uniform shape.

See: Store Polymorphic Data, Use Inheritance Pattern, Schema Design Patterns.

</section>
<section>
<title>Store Polymorphic Data</title>
<url>https://mongodb.com/docs/manual/data-modeling/design-patterns/polymorphic-data/polymorphic-schema-pattern/</url>

# Store Polymorphic Data

MongoDB collections can hold documents with varied schemas to enable single-query access across types.

## Example

Insert multiple sports records with sport-specific fields:

```javascript
db.athletes.insertMany([
  {sport:"bowling", name:"Earl Anthony", career_earnings:1440000,
   perfect_games:25, pba_championships:43,
   events:[{name:"japan_pba",score:300,year:1972}]},
  {sport:"tennis", name:"Steffi Graf", career_earnings:21000000,
   grand_slam_wins:22, surfaces:["grass","clay","hard court"]},
  {sport:"cricket", name:"Sachin Tendulkar", career_earnings:8000000,
   runs:15921, centuries:51, teammates:["Arshad Ayub","Kapil Dev"]}
])
```

Query all:

```javascript
db.athletes.find()
```

Query a sport-specific attribute (grand slam wins):

```javascript
db.athletes.find({grand_slam_wins:{$gt:20}})
```

## Related Patterns

Inheritance Pattern, Schema Validation, Indexes

</section>
<section>
<title>Use the Inheritance Pattern</title>
<url>https://mongodb.com/docs/manual/data-modeling/design-patterns/polymorphic-data/inheritance-schema-pattern/</url>

# Inheritance Pattern (MongoDB)

Store polymorphic docs with shared fields in one collection. Add `product_type` to distinguish sub-types.

```javascript
// sample docs
db.books.insertMany([
  {product_type:"ebook", title:"Practical MongoDB Aggregations",
   author:"Paul Done", rating:4.8, genres:["programming"],
   pages:338, download_url:"<url>"},
  {product_type:"audiobook", title:"Practical MongoDB Aggregations",
   author:"Paul Done", rating:4.6, genres:["programming"],
   narrators:["Paul Done"],
   duration:{hours:21, minutes:8},
   time_by_chapter:[{chapter:1,start:"00:00:00",end:"01:00:00"},
                    {chapter:2,start:"01:00:00",end:"01:55:00"}]},
  {product_type:"physical_book", title:"Practical MongoDB Aggregations",
   author:"Paul Done", rating:4.9, genres:["programming"],
   pages:338, stock:12, delivery_time:2}
])
```

Query everything:

```javascript
db.books.find()            // returns all three shapes
```

Query subtype fields without extra logic:

```javascript
db.books.find({"duration.hours":{$gt:20}})
```

Returns only `audiobook` docs because others lack `duration`.

</section>
<section>
<title>Document and Schema Versioning</title>
<url>https://mongodb.com/docs/manual/data-modeling/design-patterns/data-versioning/</url>

# Document & Schema Versioning

Retain past docs/schemas to avoid downtime and costly migrations when updates are lengthy or optional.

Patterns  
• Document Versioning – write each change as a new document; move history to a separate collection (e.g., insurance policy revisions).  
• Schema Versioning – add `schemaVersion` so the app handles multiple structures (e.g., merge phones into a `contacts` doc).

Tasks: keep document history; maintain schema versions.

</section>
<section>
<title>Keep a History of Document Versions</title>
<url>https://mongodb.com/docs/manual/data-modeling/design-patterns/data-versioning/document-versioning/</url>

# Document Versioning Pattern

Store current docs and history in the same DB:

- `currentPolicies`: latest doc per `policyId`.
- `policyRevisions`: all past versions.

Use when:
- Updates are infrequent.
- Few docs need versions.
- Current vs. history queried separately.

## Sample Seed

```javascript
const doc = {
  policyId: 1,
  customerName: "Michelle",
  revision: 1,
  itemsInsured: ["golf clubs","car"],
  dateSet: new Date()
};
db.currentPolicies.insertOne(doc);
db.policyRevisions.insertOne(doc);
```

## Update Flow

1. Modify current doc.
2. Copy modified doc to revisions.

```javascript
// 1. update current version
db.currentPolicies.updateOne(
  { policyId: 1 },
  {
    $push: { itemsInsured: "watch" },   // change data
    $inc:  { revision: 1 },             // bump version #
    $currentDate: { dateSet: true }     // timestamp
  }
);

// 2. append to history collection
db.currentPolicies.aggregate([
  { $match: { policyId: 1 } },
  { $set: { _id: new ObjectId() } },    // new _id avoids clash
  { $merge: { into: "policyRevisions", on: "_id", whenNotMatched: "insert" } }
]);
```

Repeat step-set for every change (e.g., `$pull` to remove `golf clubs`).

## Retrieve History

```javascript
db.policyRevisions.find({ policyId: 1 }).sort({ revision: 1 });
```

Returns ordered versions (revision 1, 2, 3, …).

</section>
<section>
<title>Maintain Different Schema Versions</title>
<url>https://mongodb.com/docs/manual/data-modeling/design-patterns/data-versioning/schema-versioning/</url>

# Maintain Different Schema Versions

Schema Versioning lets one collection hold multiple document structures. Add a `schemaVersion` field, branch queries/updates, and index every path used (e.g., `work`, `contactInfo.work`).

```javascript
// Existing v1 doc
db.contacts.insertOne({_id:1,name:"Taylor",home:"209-555-7788",work:"503-555-0110"});
db.contacts.updateMany({},{$set:{schemaVersion:1}});

// New v2 schema
db.contacts.insertOne({
  _id:2,schemaVersion:2,name:"Cameron",
  contactInfo:{cell:"903-555-1122",work:"670-555-7878",instagram:"@camcam9090",linkedIn:"CameronSmith123"}
});
```

Query both schemas:

```javascript
db.contacts.find({$or:[{work:"503-555-0110"},{"contactInfo.work":"503-555-0110"}]});
```

Update based on `schemaVersion`:

```javascript
db.contacts.updateOne(
  {_id:2},
  [{$set:{
    work:{$cond:{if:{$eq:["$schemaVersion",1]},then:"999-999-9999",else:null}},
    "contactInfo.work":{$cond:{if:{$eq:["$schemaVersion",2]},then:"999-999-9999",else:null}}
}}]);
```

</section>
<section>
<title>Archive Pattern</title>
<url>https://mongodb.com/docs/manual/data-modeling/design-patterns/archive/</url>

# Archive Pattern

Store rarely-queried, aged docs outside the hot collection to reduce query cost/size.

Options  
• Cloud object storage (preferred; e.g., Atlas Online Archive)  
• Cheaper cluster  
• Separate collection  

Guidelines  
• Embed all related data; avoid cross-collection refs.  
• Keep a single “age”/timestamp field (`date`).  
• Flag non-archivable docs (`"keep forever"`).

## Example: move sales >5 yrs old to `archived_sales`

```javascript
// sample docs contain `date` field; some <5 yrs old

const fiveYearsAgo = new Date();
fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

// copy old docs -> archive collection
db.sales.aggregate([
  { $match: { date: { $lt: fiveYearsAgo } } },
  { $merge: { into: { db: "test", coll: "archived_sales" }, on: "_id" } }
]);

// remove them from active collection
db.sales.deleteMany({ date: { $lt: fiveYearsAgo } });
```

After execution  
• `sales` keeps recent docs.  
• `archived_sales` holds older, read-only data.

Resources: Atlas Online Archive, Schema Design docs.

</section>
<section>
<title>Schema Design Anti-Patterns</title>
<url>https://mongodb.com/docs/manual/data-modeling/design-antipatterns/</url>

# Schema Design Anti-Patterns

Atlas/Compass flag these issues (M10+). Fix to avoid large docs, slow writes/queries, and index/storage bloat.

| Anti-Pattern | Consequence |
| --- | --- |
| Unbounded Arrays | Risk >16 MB doc limit; index & query slowdowns. |
| Too Many Collections | Storage engine overhead. |
| Unnecessary Indexes | Extra disk; slower inserts/updates. |
| Bloated Documents | Common queries slow. |
| Excessive `$lookup` | Complex, slow queries. |

See “Schema Design Patterns” for correct approaches.

</section>
<section>
<title>Avoid Unbounded Arrays</title>
<url>https://mongodb.com/docs/manual/data-modeling/design-antipatterns/unbounded-arrays/</url>

# Avoid Unbounded Arrays

Growing arrays can breach the 16 MB BSON limit and slow queries/indexes. Limit size with:

## Subset Pattern
Keep only N most-needed elements in parent; store rest elsewhere.

```javascript
// books
{
 title:"Harry Potter",
 reviews:[{u:"Alice",r:"Great!",rat:5}, …] // ≤N
}

// reviews (overflow)
{u:"Jason",r:"Did not enjoy!",rat:1}
```
+ Single read for common data  
− Duplicate docs, expensive updates

## Reference Pattern
Parent holds IDs; data in separate collection.

```javascript
// books
{title:"Harry Potter",reviews:["r1","r2"]}

// reviews
{_id:"r1",u:"Jason",r:"Did not enjoy!",rat:1}
```

Join on demand:

```javascript
db.books.aggregate([
  {$lookup:{
    from:"reviews",
    localField:"reviews",
    foreignField:"_id",
    as:"reviewDetails"}}
])
```
+ No dupes, doc size controlled  
− Extra lookup latency

</section>
<section>
<title>Reduce the Number of Collections</title>
<url>https://mongodb.com/docs/manual/data-modeling/design-antipatterns/reduce-collections/</url>

# Reduce the Number of Collections

Each collection adds an `_id` index; large numbers waste disk/RAM and force `$lookup` for multi-day queries.

Fix: drop unused collections and merge data via embedding/denormalization.

Example: 1 document per day, not 1 collection.

```javascript
db.dailyTemperatures.insertOne({
  _id: ISODate("2024-05-10"),
  readings:[
    {ts:"2024-05-10T10:00:00Z",temp:60},
    {ts:"2024-05-10T11:00:00Z",temp:61}
  ]
});
```

Single `_id` index covers all days; no `$lookup` needed.

</section>
<section>
<title>Remove Unnecessary Indexes</title>
<url>https://mongodb.com/docs/manual/data-modeling/design-antipatterns/unnecessary-indexes/</url>

# Remove Unnecessary Indexes

Excess single-field indexes slow writes and bloat storage. Keep only frequently accessed or compound indexes that cover queries.

Evaluate usage  
```javascript
db.courses.aggregate([{ $indexStats: {} }])   // accesses.ops shows hit count
```
Drop candidates: ops==0 or fields already covered (e.g. `{day:1}` and `{time:1}` covered by `{day:1,time:1}`).

Optionally test by hiding  
```javascript
db.courses.hideIndex("days_1")
db.courses.hideIndex("time_1")
db.courses.hideIndex("building_1")
```

Remove confirmed unused indexes  
```javascript
db.courses.dropIndexes(["days_1","time_1","building_1"])
```

Resulting set  
```
_id_  course_name_1  professor_1  semester_1  day_1_time_1
```

Tools: Atlas Performance Advisor, Compass “Unused Indexes” view.

</section>
<section>
<title>Bloated Documents</title>
<url>https://mongodb.com/docs/manual/data-modeling/design-antipatterns/bloated-documents/</url>

# Avoid Bloated Documents

Large docs inflate the RAM working set; if it overflows, MongoDB reads from disk. Separate fields not queried together via references.

Example split of book data:

```javascript
// summary collection
db.mainBookInfo.insertOne({
  _id: 1234,
  title: "Tale of Two Cities",
  author: "Charles Dickens",
  genre: "Historical Fiction",
  cover_image: "<url>"
})

// detail collection
db.additionalBookDetails.insertOne({
  bookId: 1234,
  year: 1859,
  pages: 448,
  price: 15.99,
  description: "A historical novel set during the French Revolution."
})
```

Join when full details are needed:

```javascript
db.mainBookInfo.aggregate([
  {$lookup:{
      from: "additionalBookDetails",
      localField: "_id",
      foreignField: "bookId",
      as: "details"}},
  {$replaceRoot:{newRoot: {$mergeObjects:[{$arrayElemAt:["$details",0]},"$$ROOT"]}}},
  {$project:{details:0}}
])
```

Reference-based schema keeps documents small, reducing RAM and bandwidth.

</section>
<section>
<title>Reduce $lookup Operations</title>
<url>https://mongodb.com/docs/manual/data-modeling/design-antipatterns/reduce-lookup-operations/</url>

# Reduce `$lookup` Operations

`$lookup` joins collections but adds latency. If reads frequently require joined data, embed the needed fields (subset pattern) to query a single collection instead.

```javascript
//Before: join required
db.orders.aggregate([
  {$match:{_id:101}},
  {$lookup:{
      from:"products",
      localField:"product_ids",
      foreignField:"_id",
      as:"products"}}
])
```

```javascript
//After: subset embed
orders: {
  _id:101,
  customer_name:"John Doe",
  products:[
    {product_id:1,name:"Laptop",price:1000},
    {product_id:2,name:"Headphones",price:100}
  ],
  total:1100
}
```

Pros: 1 query, faster reads. Cons: duplicated data, 16 MB doc limit. For rarely accessed or large fields, keep full record in `products`.

</section>
<section>
<title>Data Modeling Concepts</title>
<url>https://mongodb.com/docs/manual/data-modeling/concepts/</url>

# Data Modeling Concepts

• Choose a strategy; understand its pros/cons.  
• Design for lifecycle management, indexing, sharding, document growth.  
• Reference Data Modeling intro + Example Patterns.

</section>
<section>
<title>Embedded Data Versus References</title>
<url>https://mongodb.com/docs/manual/data-modeling/concepts/embedding-vs-references/</url>

# Embedded Data vs. References

**Embedded docs** (denormalized, in same document)  
• Best for 1:1 or 1:N “contains” relations.  
• Pros: single-read/write, atomic updates, faster reads.  
• Query with dot notation (see “Query on Embedded/Nested Documents”, “Query an Array”).  
• Doc size ≤ 16 MiB; use GridFS for larger binaries.

**References** (normalized, separate collections)  
• Use when embedding causes excessive duplication, data changes often, many-to-many, large hierarchies, or child docs are frequently queried alone.  
• Query across collections via aggregation stages `$lookup` and `$graphLookup`.  

Choose model per access patterns, duplication tolerance, and document size.

</section>
<section>
<title>Handle Duplicate Data</title>
<url>https://mongodb.com/docs/manual/data-modeling/handle-duplicate-data/</url>

# Handle Duplicate Data

Duplicate fields across collections optimize read patterns by removing `$lookup` joins at the cost of extra storage and write-time sync logic.

Key considerations  
• Update frequency: frequent updates → heavier write workload.  
• Read performance: duplicating hot, small subsets often outweighs storage cost.

## E-Commerce Example

```javascript
use eCommerce

db.customers.insertOne({customerId:123,name:"Alexa Edwards",email:"a.edwards@randomEmail.com",phone:"202-555-0183"})

db.products.insertOne({productId:456,product:"sweater",price:30,size:"L",material:"silk",manufacturer:"Cool Clothes Co"})

db.orders.insertOne({
  orderId:789,customerId:123,totalPrice:45,date:ISODate("2023-05-22"),
  lineItems:[        // duplicated product subset
    {productId:456,product:"sweater",price:30,size:"L"},
    {productId:809,product:"t-shirt",price:10,size:"M"},
    {productId:910,product:"socks",price:5,size:"S"}
  ]
})
```
Duplicated `productId|product|price|size` lets the app fetch an order with one query.

## Product Reviews Subset Pattern

```javascript
use productsAndReviews

db.products.insertOne({
  productId:123,name:"laptop",price:200,
  recentReviews:[            // 5 most recent reviews
    {reviewId:456,author:"Pat Simon",stars:4,comment:"Great",date:ISODate("2023-06-29")},
    {reviewId:789,author:"Edie Short",stars:2,comment:"Not enough RAM",date:ISODate("2023-06-22")}
  ]
})

db.reviews.insertOne({       // canonical review store
  reviewId:456,productId:123,author:"Pat Simon",stars:4,comment:"Great",date:ISODate("2023-06-29")
})
```
Write flow for a new review:  
1. `insert` into `reviews`.  
2. `$pop` oldest + `$push` new review in `products.recentReviews`.

Low review update rate keeps sync cheap while single read returns product + latest reviews.

See “Data Consistency” for sync strategies.

</section>
<section>
<title>Data Consistency</title>
<url>https://mongodb.com/docs/manual/data-modeling/data-consistency/</url>

# Data Consistency

Choose a consistency strategy per workload:

| Method | Guarantee | Perf. | When to use |
|---|---|---|---|
| Transactions | Multi-collection atomic writes | High (read contention) | Data must never be stale; perf. hit acceptable |
| Embedded docs | Single-doc updates | Low–Med (doc size, indexes) | Always read/update related data together; avoids `$lookup` |
| Atlas Triggers | Async cross-collection sync | Low–Med, event delay | Can tolerate brief staleness after writes |

Factors:

* Data Staleness – weigh freshness vs. update cost.  
* Referential Integrity – app logic must delete/update all refs (e.g., `products` ↔ `warehouse`).

See also: “Enforce Data Consistency with Transactions” and “with Embedding”; Schema Validation; Atomic Modeling; Transaction production notes.

</section>
<section>
<title>Enforce Data Consistency with Transactions</title>
<url>https://mongodb.com/docs/manual/data-modeling/enforce-consistency/transactions/</url>

# Enforce Data Consistency with Transactions

Multi-collection transactions atomically update duplicated data.  
Requires replica set or sharded cluster (not standalone); open txns may slow reads.

## Sample Data
```javascript
db.products.insertMany([
 {sellerId:456,name:"sweater",price:30,rating:4.9},
 {sellerId:456,name:"t-shirt",price:10,rating:4.2},
 {sellerId:456,name:"vest",price:20,rating:4.7}
]);

db.sellers.insertOne({
 id:456,name:"Cool Clothes Co",
 location:{address:"21643 Andreane Shores",state:"Ohio",country:"United States"},
 phone:"567-555-0105",
 products:[
  {name:"sweater",price:30},
  {name:"t-shirt",price:10},
  {name:"vest",price:20}
 ]});
```

## Atomic Update
```javascript
// start session & tx
s=db.getMongo().startSession({readPreference:{mode:"primary"}});
p=s.getDatabase("test").products;
l=s.getDatabase("test").sellers;
s.startTransaction({readConcern:{level:"local"},writeConcern:{w:"majority"}});
try{
 p.updateOne({sellerId:456,name:"vest"},{$set:{price:25}});
 l.updateOne({},{$set:{"products.$[e].price":25}},
             {arrayFilters:[{"e.name":"vest"}]});
}catch(e){s.abortTransaction();throw e;}
s.commitTransaction();s.endSession();
```

## Verify
```javascript
db.products.find({sellerId:456,name:"vest"});    // price:25
db.sellers.find({id:456,"products.name":"vest"});// price:25
```

See Atlas Triggers or embedding for other consistency strategies.

</section>
<section>
<title>Enforce Data Consistency with Embedding</title>
<url>https://mongodb.com/docs/manual/data-modeling/enforce-consistency/embed-data/</url>

# Enforce Data Consistency with Embedding

Embed duplicated data into a parent document to keep a single, always-current value (best for 1-to-few, not complex many-to-many).

```javascript
// denormalized sellers doc
db.sellers.insertOne({
  _id: 456,
  name: "Cool Clothes Co",
  location:{address:"21643 Andreane Shores",state:"Ohio",country:"United States"},
  phone:"567-555-0105",
  products:[
    {id:111,name:"sweater",price:30,rating:4.9,color:"green"},
    {id:222,name:"t-shirt",price:10,rating:4.2,color:"blue"},
    {id:333,name:"vest",price:20,rating:4.7,color:"red"}
  ]
})
```

```javascript
// support frequent lookups (e.g., by color)
db.sellers.createIndex({"products.color":1})
```

Result: one query fetches seller and product data; no cross-collection sync needed.

</section>
</guide>