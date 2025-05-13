<guide>
<guide_topic>Kotlin Coroutine Driver</guide_topic>

<section>
<title>MongoDB Kotlin Driver</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/</url>
<description>Explore the MongoDB Kotlin Driver for server-side applications using coroutines, including setup, usage examples, and troubleshooting.</description>


# MongoDB Kotlin Coroutine Driver

* Official non-blocking MongoDB driver for server-side Kotlin; uses `suspend` APIs. Use Sync Driver for blocking needs.  
* Install via Maven/Gradle; Quick Start connects to Atlas.  
* Docs: Quick Reference, Usage Examples, What's New, FAQ, Troubleshooting, Compatibility, KMongo Migration, Signature Validation, Issues & Help.  
* Fundamentals cover: connection, Stable API, authentication, codec/POJO mapping, CRUD, builders, data transforms, aggregation, indexes, collation, logging/monitoring, time-series, field-level encryption.  
* Libraries  
  * `kotlin-driver-coroutine` – coroutine API  
  * `bson` – core BSON classes  
  * `bson-record-codec` – Java record support  
  * `driver-extensions` – Kotlin data-class builders  
  * `core` – shared JVM internals  
* Developer Hub offers tutorials & community Q&A.

</section>
<section>
<title>Kotlin Driver Quick Start</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/quick-start/</url>
<description>Learn to connect a Kotlin application to a MongoDB Atlas cluster using the Kotlin driver, including setup, dependencies, and querying sample data.</description>


# Kotlin Coroutine Driver – Quick Start

## Setup
```gradle
// build.gradle.kts
plugins { kotlin("jvm") version "…"}
dependencies {
    // MongoDB BOM (locks versions)
    implementation(platform("org.mongodb:mongodb-driver-bom:5.5.0"))

    // Coroutine driver
    implementation("org.mongodb:mongodb-driver-kotlin-coroutine")

    // ONE serializer (choose)
    implementation("org.mongodb:bson-kotlinx")   // or bson-kotlin
}
```
```xml
<!-- pom.xml -->
<dependencyManagement>
  <dependency>
    <groupId>org.mongodb</groupId><artifactId>mongodb-driver-bom</artifactId>
    <version>5.5.0</version><type>pom</type><scope>import</scope>
  </dependency>
</dependencyManagement>
<dependencies>
  <dependency>
    <groupId>org.mongodb</groupId><artifactId>mongodb-driver-kotlin-coroutine</artifactId>
  </dependency>
  <!-- ONE of -->
  <dependency>
    <groupId>org.mongodb</groupId><artifactId>bson-kotlinx</artifactId><version>5.5.0</version>
  </dependency>
</dependencies>
```
Requires Kotlin/JVM 1.8+.  

## Connect & Query (data class)
```kotlin
import com.mongodb.kotlin.client.coroutine.MongoClient
import com.mongodb.client.model.Filters.eq
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.runBlocking

data class Movie(val title: String, val year: Int, val cast: List<String>)

fun main() {
    val uri = "<your connection string>"
    val client = MongoClient.create(uri)
    val movies = client.getDatabase("sample_mflix")
                      .getCollection<Movie>("movies")

    runBlocking {
        val doc = movies.find(eq("title", "Back to the Future")).firstOrNull()
        println(doc ?: "No match")
    }
    client.close()
}
```

## Connect & Query (Document)
```kotlin
import com.mongodb.kotlin.client.coroutine.MongoClient
import com.mongodb.client.model.Filters.eq
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.runBlocking
import org.bson.Document

fun main() {
    val uri = "<your connection string>"
    val coll = MongoClient.create(uri)
        .getDatabase("sample_mflix")
        .getCollection<Document>("movies")

    runBlocking {
        println(coll.find(eq("title", "Back to the Future"))
                    .firstOrNull()?.toJson() ?: "No match")
    }
}
```

## TLS Issue
SSLHandshakeException “extension (5)…” → update JDK ≥ 11.0.7 / 13.0.3 / 14.0.2.

## Docs
See driver “Fundamentals” for CRUD, aggregation, transactions, etc.

</section>
<section>
<title>Quick Reference</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/quick-reference/</url>
<description>Explore Kotlin Coroutine driver syntax for MongoDB commands, including find, insert, update, delete, and more, with examples and API documentation links.</description>


# Quick Reference

```kotlin
data class Movie(
    val title: String,
    val year: Int,
    val rated: String? = "Not Rated",
    val genres: List<String>? = listOf()
)
```

## CRUD & Query

```kotlin
// Find
collection.find(Filters.eq(Movie::title.name, "Shrek")).firstOrNull()
collection.find(Filters.eq(Movie::year.name, 2004))

// Insert
collection.insertOne(Movie("Shrek", 2001))
collection.insertMany(
    listOf(
        Movie("Shrek", 2001),
        Movie("Shrek 2", 2004),
        Movie("Shrek the Third", 2007),
        Movie("Shrek Forever After", 2010),
    )
)

// Update
collection.updateOne(
    Filters.eq(Movie::title.name, "Shrek"),
    Updates.set(Movie::rated.name, "PG")
)
collection.updateMany(
    Filters.regex(Movie::title.name, "Shrek"),
    Updates.set(Movie::rated.name, "PG")
)
collection.updateOne(
    Filters.eq(Movie::title.name, "Shrek"),
    Updates.addEachToSet(Movie::genres.name, listOf("Family", "Fantasy"))
)

// Replace
collection.replaceOne(
    Filters.eq(Movie::title.name, "Shrek"),
    Movie("Kersh", 1002, "GP")
)

// Delete
collection.deleteOne(Filters.eq(Movie::title.name, "Shrek"))
collection.deleteMany(Filters.regex(Movie::title.name, "Shrek"))
```

## Bulk, Streams, Helpers

```kotlin
collection.bulkWrite(
    listOf(
        InsertOneModel(Movie("Shrek", 2001)),
        DeleteManyModel(Filters.lt(Movie::year.name, 2004)),
    )
)

// Change stream
collection.watch().collect { println("Change to ${it.fullDocument?.title}") }

// Utility
collection.find().toList()
collection.countDocuments(Filters.eq("year", 2001))
collection.distinct<String>(Movie::rated.name)
collection.find().limit(2)
collection.find().skip(2)
collection.find().sort(Sorts.descending(Movie::year.name))

// Projection
data class Result(val title: String)
collection.find<Result>()
    .projection(Projections.include(Movie::title.name))

// Index & Text
collection.createIndex(Indexes.ascending(Movie::title.name))
collection.find(Filters.text("Forever"))

// Coroutine Flow
collection.find(Filters.eq(Movie::year.name, 2004))
    .collect { println(it) }
```

## Dependency

```xml
<!-- Maven -->
<dependency>
  <groupId>org.mongodb</groupId>
  <artifactId>mongodb-driver-kotlin-coroutine</artifactId>
</dependency>
```

```kotlin
// Gradle
implementation("org.mongodb:mongodb-driver-kotlin-coroutine")
```

</section>
<section>
<title>What's New</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/whats-new/</url>
<description>Discover the latest features, improvements, and fixes in recent Kotlin driver versions, including new classes, API changes, and enhanced support for various MongoDB functionalities.</description>


# What's New

## 5.5
- MongoDB 4.0 no longer supported.  
- `connectTimeoutMS` honored with default TLS.  
- driver-core rewrite → large BSON encode/decode & bulk insert speedups.

## 5.4
- `BsonConfiguration` can enable snake_case for `bson-kotlinx`.  
- Driver BOM introduced.  
- `$lookup` works with CSFLE/QE.  
- Cursor `close()` refreshes `timeoutMS`; `distinct()` supports `hint`.  
- `Client*Options` gain `sort`.  
- OIDC auth: Kubernetes support.  
- Atlas Search operators: `phrase`, `regex`, `queryString`, `equals`, `moreLikeThis`, `in`, `wildcard`.

## 5.3
- Next release drops MongoDB 4.0.  
- New BSON Binary subtype 9 API:

```kotlin
Int8BinaryVector(...), Float32BinaryVector(...), PackedBitBinaryVector(...)
```
- Connection pool fairness removed (↑ throughput).  
- `updateOne`/`replaceOne` & bulk models accept `sort`.  
- Builders work directly with Kotlin data-class props (extensions pkg).  
- Client-level bulk write supports multiple DB/collection ops.

## 5.2
- MongoDB 3.6 removed.  
- Client-Side Operation Timeout (CSOT) replaces various per-op timeouts.  
- `SearchIndexType` for Atlas Search/Vector indexes.  
- SCRAM auth delegated to JCA (FIPS).  
- `mongodb-crypt` now version-aligned; upgrade to 5.2.x (native crypto perf: install `libmongocrypt.so` on Linux).  
- Sharded retries pick different `mongos`.  
- GraalVM reachability metadata added.  
- `VectorSearchOptions` split into `ExactVectorSearchOptions` & `ApproximateVectorSearchOptions(numCandidates)`.  
- `kotlinx-datetime` and `JsonElement` serialization supported.

## 5.1.3
- Fix: possible `Cursor` assertion errors.

## 5.1.2
Nullable generics encoding:

```kotlin
@Serializable data class Box<T>(val boxed: T)
@Serializable data class Container(val box: Box<String?>)
```

## 5.1.1
- `MONGODB-OIDC` `authMechanismProperties` must not contain commas.

## 5.1
- MongoDB 3.6 deprecation.  
- GraalVM native-image tests; improved OIDC.  
- Fixes polymorphic codec issues; adds polymorphic serialization.  
- New URI option `serverMonitoringMode`.

## 5.0
Custom codec provider:

```kotlin
KotlinSerializerCodec.create(
    clazz = Foo::class,
    serializersModule = module,
    bsonConfiguration = conf
)
```
- Fixes reflection type erasure bug.

## 4.11
Deprecated for 5.0 removal:  
- `ServerAddress.getSocketAddress*`, `UnixServerAddress.getUnixSocketAddress()` → use `InetAddress` / `UnixSocketAddress`.  
- Entire `StreamFactory*` hierarchy; switch to:

```java
MongoClientSettings.builder()
    .transportSettings(TransportSettings.nettyBuilder().build())
```

New: SOCKS5 proxy, `$vectorSearch` stage, Atlas Search index helpers, `ChangeStreamDocument.getSplitEvent()`, virtual thread support.

## 4.10
- Explicit `bson-kotlinx` dependency required.  
- Kotlin coroutine & sync usage supported; codecs for data classes; `kotlinx.serialization` integration.

</section>
<section>
<title>Usage Examples</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/</url>
<description>Explore Kotlin usage examples for popular MongoDB operations, including setup instructions and sample code for easy integration.</description>


# Usage Examples

Usage snippets show common MongoDB operations with the Kotlin coroutine driver.

* Use Atlas sample datasets (load via Atlas or import locally).  
* Copy any example file, then set your connection string:

```kotlin
val uri = "<mongodb+srv://<user>:<password>@<cluster-url>/test>"
```

* For Atlas connection details, see the Atlas Connectivity Guide; for general setup, see the Kotlin driver quick start & Connection Guide.

Each snippet lists purpose, params, return types, and possible exceptions.

</section>
<section>
<title>Find Operations</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/find-operations/</url>



</section>
<section>
<title>Find a Document</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/findOne/</url>

# Find a Document

`collection.find(filter)` returns a `FindFlow` (extends `kotlinx.coroutines.flow.Flow`).  
Common ops:  

```kotlin
find(...).projection(fields).sort(order)
first()         // 1st doc or NoSuchElementException
firstOrNull()   // 1st doc or null
```

Example:

```kotlin
import com.mongodb.client.model.*
import com.mongodb.kotlin.client.coroutine.MongoClient
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.runBlocking

data class Movie(val title:String,val runtime:Int,val imdb:IMDB){ data class IMDB(val rating:Double) }
data class Result(val title:String,val imdb:Movie.IMDB)

fun main()=runBlocking {
    val client = MongoClient.create("<uri>")
    val coll = client.getDatabase("sample_mflix").getCollection<Movie>("movies")

    val proj = Projections.fields(
        Projections.include(Movie::title.name, Movie::imdb.name),
        Projections.excludeId()
    )

    val doc = coll.withDocumentClass<Result>()
        .find(Filters.eq(Movie::title.name,"The Room"))
        .projection(proj)
        .sort(Sorts.descending("${Movie::imdb.name}.${Movie.IMDB::rating.name}"))
        .firstOrNull()

    println(doc ?: "No results")
    client.close()
}
```

API: `MongoCollection.find`, `FindFlow`, `projection()`, `sort()`, `first()`, `firstOrNull()`.

</section>
<section>
<title>Find Multiple Documents</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/find/</url>

# Find Multiple Documents

`MongoCollection.find(filter?)` returns `FindFlow<T>` (a `kotlinx.coroutines.flow.Flow`).  
Key ops (all fluent, return `FindFlow`):

```kotlin
find(filter)            // omit to return all docs
sort(Bson)              // e.g. Sorts.descending("field")
projection(Bson)        // include/exclude fields
```

Flow terminals:

* `collect { }` – iterate async  
* `firstOrNull()` – first doc or null  
* `first()` – first doc or throw `NoSuchElementException`

Example:

```kotlin
val movies = db.getCollection<Movie>("movies")

movies.withDocumentClass<Results>()
    .find(lt("runtime", 15))                // runtime < 15
    .projection(fields(include("title","imdb"), excludeId()))
    .sort(Sorts.descending("title"))
    .collect { println(it) }
```

Classes: `FindFlow`, `Filters`, `Sorts`, `Projections`.

</section>
<section>
<title>Insert Operations</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/insert-operations/</url>



</section>
<section>
<title>Insert a Document</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/insertOne/</url>

# Insert a Document

`MongoCollection.insertOne(document)` adds one doc (collection auto-created). Returns `InsertOneResult`; get id via `insertedId`. Throws `MongoException`.

```kotlin
import com.mongodb.kotlin.client.coroutine.MongoClient
import kotlinx.coroutines.runBlocking
import org.bson.types.ObjectId
import org.bson.codecs.pojo.annotations.BsonId

data class Movie(@BsonId val id: ObjectId, val title: String, val genres: List<String>)

fun main() = runBlocking {
    val col = MongoClient.create("<uri>")
        .getDatabase("sample_mflix")
        .getCollection<Movie>("movies")

    val id = col.insertOne(
        Movie(ObjectId(), "Ski Bloopers", listOf("Documentary","Comedy"))
    ).insertedId
    println("Inserted id: $id")
}
```

API: insertOne(), Document, InsertOneResult

</section>
<section>
<title>Insert Multiple Documents</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/insertMany/</url>

# Insert Multiple Documents

`MongoCollection.insertMany(list)` is a suspending call that creates the collection if absent, returns `InsertManyResult` (`insertedIds`), and throws `MongoException` on failure.

```kotlin
import com.mongodb.kotlin.client.coroutine.*
import kotlinx.coroutines.runBlocking

data class Movie(val title:String)

fun main() = runBlocking {
    val coll = MongoClient.create("<uri>")
        .getDatabase("sample_mflix")
        .getCollection<Movie>("movies")

    try {
        val ids = coll.insertMany(
            listOf(Movie("Short Circuit 3"), Movie("The Lego Frozen Movie"))
        ).insertedIds
        println("inserted: $ids")
    } catch (e: MongoException) {
        println("insert error: $e")
    }
}
```

API: `insertMany`, `InsertManyResult`, `Document`.

</section>
<section>
<title>Update & Replace Operations</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/update-operations/</url>

# Update & Replace Operations
- Update one document  
- Update many documents  
- Replace a document

</section>
<section>
<title>Update a Document</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/updateOne/</url>

# Update a Document

`MongoCollection.updateOne(filter, update, options?)`  
• Updates first doc matching `filter`.  
• `UpdateOptions.upsert(true)` inserts a new doc if no match.  
• Returns `UpdateResult`: `modifiedCount`, `upsertedId`.  
• Throws `MongoWriteException` on immutable `_id` change or unique-index violation.

Example: set `runtime`, add `Sports` to `genres` if absent, and timestamp `lastUpdated`; upsert if no match.

```kotlin
import com.mongodb.client.model.*
import com.mongodb.kotlin.client.coroutine.MongoClient
import kotlinx.coroutines.runBlocking
import java.time.LocalDateTime

data class Movie(val title:String, val runtime:Int,
                 val genres:List<String>, val lastUpdated:LocalDateTime)

fun main() = runBlocking {
    val coll = MongoClient.create("<uri>")
        .getDatabase("sample_mflix")
        .getCollection<Movie>("movies")

    val query = Filters.eq(Movie::title.name, "Cool Runnings 2")
    val updates = Updates.combine(
        Updates.set(Movie::runtime.name, 99),
        Updates.addToSet(Movie::genres.name, "Sports"),
        Updates.currentDate(Movie::lastUpdated.name)
    )
    val res = coll.updateOne(query, updates, UpdateOptions().upsert(true))
    println("modified=${res.modifiedCount}, upsertId=${res.upsertedId}")
}
```

Possible output:  
`modified=1, upsertId=null` (match) or  
`modified=0, upsertId=BsonObjectId{...}` (upsert).

Key APIs: `UpdateOne`, `UpdateOptions`, `UpdateResult`, `Filters`, `Updates.combine|set|addToSet|currentDate`.

</section>
<section>
<title>Update Multiple Documents</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/updateMany/</url>

# Update Multiple Documents

`collection.updateMany(filter, update, options?)` modifies **all** docs matching `filter`.

Arguments  
- `filter`: query criteria (`Filters.*` or BSON)  
- `update`: update doc or `Updates.*` builder  
- `UpdateOptions` (opt): `upsert(true)` inserts a new doc if no matches

Return `UpdateResult`  
- `modifiedCount`  
- `upsertedId` when an upsert occurs

Errors  
- Changing immutable `_id`: `MongoWriteException: ... immutable field '_id'`  
- Unique‐index conflict: `E11000 duplicate key error`  
- On error no docs are changed.

Example (coroutines):

```kotlin
import com.mongodb.client.model.Filters.gt
import com.mongodb.client.model.Updates.*
import com.mongodb.kotlin.client.coroutine.MongoClient
import kotlinx.coroutines.runBlocking
import java.time.LocalDateTime

data class Movie(val num_mflix_comments: Int,
                 val genres: List<String>,
                 val lastUpdated: LocalDateTime)

fun main() = runBlocking {
    val coll = MongoClient.create("<uri>")
        .getDatabase("sample_mflix")
        .getCollection<Movie>("movies")

    val filter = gt(Movie::num_mflix_comments.name, 50)
    val update = combine(
        addToSet(Movie::genres.name, "Frequently Discussed"),
        currentDate(Movie::lastUpdated.name)
    )

    val res = coll.updateMany(filter, update)
    println("modified: ${res.modifiedCount}")
}
```

Typical output: `modified: 53`

Updated doc resembles:  
`Movie(... genres=[..., "Frequently Discussed"], lastUpdated=...)`

Key APIs: `updateMany`, `UpdateOptions`, `UpdateResult`, `Filters`, `Updates.combine|addToSet|currentDate`.

</section>
<section>
<title>Replace a Document</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/replaceOne/</url>

# Replace One Document

`collection.replaceOne(filter, replacement, options?)`  
• Replaces the first doc matching `filter`; keeps original `_id`, drops other fields.  
• `ReplaceOptions.upsert(true)` inserts `replacement` when no match.  
• Returns `UpdateResult`  
  – `modifiedCount` (# replaced)  
  – `upsertedId` (non-null only on upsert).  
Errors: `MongoWriteException` if `_id` changes or unique index violated.

```kotlin
import com.mongodb.client.model.Filters.eq
import com.mongodb.client.model.ReplaceOptions
import com.mongodb.kotlin.client.coroutine.MongoClient
import kotlinx.coroutines.runBlocking

data class Movie(val title: String, val fullplot: String)

fun main() = runBlocking {
    val client = MongoClient.create("<connection string>")
    val col = client.getDatabase("sample_mflix")
                  .getCollection<Movie>("movies")

    val res = col.replaceOne(
        eq("title", "Music of the Heart"),
        Movie("50 Violins",
              "A dramatization of Roberta Guaspari..."),
        ReplaceOptions().upsert(true)
    )
    println("modified=${res.modifiedCount}, upsertId=${res.upsertedId}")
    client.close()
}
```

API: ReplaceOne, ReplaceOptions, UpdateResult, Filters.eq

</section>
<section>
<title>Delete Operations</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/delete-operations/</url>



</section>
<section>
<title>Delete a Document</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/deleteOne/</url>

# Delete a Document

`collection.deleteOne(filter)` removes the first doc matching `filter` (or the first doc in the collection if `filter` is omitted) and returns `DeleteResult.deletedCount`. Throws `MongoException` on error.

```kotlin
import com.mongodb.kotlin.client.coroutine.MongoClient
import com.mongodb.client.model.Filters.eq
import kotlinx.coroutines.runBlocking

data class Movie(val title: String)

runBlocking {
    val coll = MongoClient.create("<uri>")
        .getDatabase("sample_mflix")
        .getCollection<Movie>("movies")

    val deleted = coll.deleteOne(eq("title", "The Garbage Pail Kids Movie")).deletedCount
    println("Deleted: $deleted")  // 1 if found, otherwise 0
}
```

Key API: deleteOne(), DeleteResult, Filters.eq().

</section>
<section>
<title>Delete Multiple Documents</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/deleteMany/</url>

# Delete Multiple Documents

`MongoCollection.deleteMany(filter)` deletes every doc that matches `filter`; `{}` deletes all, but `drop()` is faster for full-collection removal. Returns `DeleteResult`; call `deletedCount`. Throws `MongoException` on failure.

```kotlin
import com.mongodb.kotlin.client.coroutine.*
import com.mongodb.client.model.Filters
import kotlinx.coroutines.runBlocking

data class Movie(val imdb: IMDB){ data class IMDB(val rating: Double) }

fun main() = runBlocking {
    val col = MongoClient.create("<uri>")
        .getDatabase("sample_mflix")
        .getCollection<Movie>("movies")

    val deleted = col.deleteMany(Filters.lt("imdb.rating", 2.9)).deletedCount
    println("Deleted: $deleted")
}
```

API: deleteMany(), DeleteResult, drop()

</section>
<section>
<title>Perform Bulk Operations</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/bulkWrite/</url>

# bulkWrite()

Performs multiple writes against **one collection** in a single round-trip.

Operations (wrap with `WriteModel`):
`insertOne`, `updateOne/Many`, `deleteOne/Many`, `replaceOne`

Signature  
```kotlin
suspend fun <T> MongoCollection<T>.bulkWrite(
    models: List<WriteModel<T>>,
    opts: BulkWriteOptions = BulkWriteOptions()      // ordered=true by default
): BulkWriteResult
```

• Ordered (`ordered=true`): stops on first error.  
• Unordered: continues; can run in parallel.  
• Retryable on server ≥3.6 except when list contains `UpdateManyModel` or `DeleteManyModel`.

`BulkWriteResult` exposes `insertedCount`, `modifiedCount`, `deletedCount`, etc.

Errors  
`MongoException` on duplicate keys, schema-validation failures, etc.

## Example
```kotlin
import com.mongodb.client.model.*
import com.mongodb.kotlin.client.coroutine.MongoClient
import kotlinx.coroutines.runBlocking

data class Movie(val title: String, val runtime: Int? = null)

fun main() = runBlocking {
    val col = MongoClient.create("<uri>")
        .getDatabase("sample_mflix")
        .getCollection<Movie>("movies")

    try {
        val res = col.bulkWrite(
            listOf(
                InsertOneModel(Movie("A Sample Movie")),
                InsertOneModel(Movie("Another Sample Movie")),
                InsertOneModel(Movie("Yet Another Sample Movie")),
                UpdateOneModel(
                    Filters.eq(Movie::title.name,"A Sample Movie"),
                    Updates.set(Movie::title.name, "An Old Sample Movie"),
                    UpdateOptions().upsert(true)
                ),
                DeleteOneModel(Filters.eq("title", "Another Sample Movie")),
                ReplaceOneModel(
                    Filters.eq(Movie::title.name, "Yet Another Sample Movie"),
                    Movie("The Other Sample Movie", 42)
                )
            )
        )
        println("inserted=${res.insertedCount}, updated=${res.modifiedCount}, deleted=${res.deletedCount}")
    } catch (e: MongoException) {
        println("bulkWrite failed: $e")
    }
}
```

</section>
<section>
<title>Watch for Changes</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/watch/</url>

# Watch for Changes

`watch()` on `MongoCollection`, `MongoDatabase`, or `MongoClient` opens a change stream and returns `ChangeStreamFlow`, a `kotlinx.coroutines.flow.Flow`:

```kotlin
val changeFlow = collection.watch()                 // all events
val pipeline = listOf(Aggregates.match(Filters.`in`("operationType", listOf("insert","update"))))
val filtered = collection.watch(pipeline)           // filtered events
```

`collect {}` consumes events asynchronously.  
Update events return only changed fields; add `.fullDocument(FullDocument.UPDATE_LOOKUP)` to fetch the full, post-update document.

```kotlin
runBlocking {
    val job = launch {
        collection.watch(pipeline)
            .fullDocument(FullDocument.UPDATE_LOOKUP)
            .collect { println("event: $it") }
    }

    collection.insertOne(Movie("Back to the Future", 1985))
    collection.updateOne(Filters.eq("title","Back to the Future"), Updates.set("year",1986))
    collection.deleteOne(Filters.eq("title","Back to the Future"))   // not captured
    delay(1000); job.cancel()
}
```

Key classes/APIs: `ChangeStreamFlow`, `FullDocument`, `MongoCollection.watch`, `Flow.collect`.

</section>
<section>
<title>Count Documents</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/count/</url>

# Count Documents

`MongoCollection` exposes  
• `countDocuments(filter:Bson?=null, opts:CountOptions?=null)` – accurate; supports filter; use `CountOptions().hintString("_id_")` with empty filter to avoid collection scan.  
• `estimatedDocumentCount(opts:EstimatedDocumentCountOptions?=null)` – fast estimate; no filter.

Both return `Long`.

CountOptions: `collation`, `comment`, `hint`, `hintString`, `limit`, `skip`.  
EstimatedDocumentCountOptions: `comment`.

Server bug: MongoDB 5.0.0–5.0.8 + Stable API v1 strict → `estimatedDocumentCount()` fails; upgrade ≥5.0.9 or set strict=false.

Example (coroutines):

```kotlin
import com.mongodb.client.model.Filters
import com.mongodb.kotlin.client.coroutine.MongoClient
import kotlinx.coroutines.runBlocking

data class Movie(val countries: List<String>)

fun main() = runBlocking {
    val collection = MongoClient.create("<uri>")
        .getDatabase("sample_mflix")
        .getCollection<Movie>("movies")

    val total   = collection.estimatedDocumentCount()
    val spanish = collection.countDocuments(
        Filters.eq(Movie::countries.name, "Spain")
    )
    println("Total: $total  Spain: $spanish")
}
```

Speed hint:

```kotlin
val n = collection.countDocuments(
    BsonDocument(),
    CountOptions().hintString("_id_")
)
```

</section>
<section>
<title>Retrieve Distinct Values of a Field</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/distinct/</url>

# Distinct Values

```kotlin
// basic
collection.distinct<String>(Movie::countries.name)

// embedded doc (dot notation)
collection.distinct<Int>("${Movie::awards.name}.${Movie.Awards::wins.name}")

// with query filter
collection.distinct<String>(
    Movie::type.name,
    Filters.eq(Movie::languages.name, "French")
)
```

• `MongoCollection.distinct<T>(field[, filter]) → DistinctFlow<T>`  
• `DistinctFlow` implements `kotlinx.coroutines.flow.Flow`; use `collect`, `first`, `firstOrNull`, etc.

Minimal example:

```kotlin
val results = collection.distinct<Int>(
    Movie::year.name,
    Filters.eq(Movie::directors.name, "Carl Franklin")
)
results.collect { println(it) }
```

Outputs each distinct `year` for movies directed by Carl Franklin.

</section>
<section>
<title>Run a Command</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/command/</url>

# Run Command

`MongoDatabase.runCommand(cmd: Bson, resultClass: Class<T> = Document::class.java): T` sends any server command (e.g., `dbStats`, repl-set ops) from a coroutine. Prefer mongosh for one-off admin tasks.

```kotlin
import com.mongodb.kotlin.client.coroutine.MongoClient
import kotlinx.coroutines.runBlocking
import org.bson.*

fun main() = runBlocking {
    val db = MongoClient.create("<uri>").getDatabase("sample_mflix")
    val stats: Document = db.runCommand(BsonDocument("dbStats", BsonInt64(1)))
    println(stats.toJson(JsonWriterSettings.builder().indent(true).build()))
}
```

Specify `resultClass` to decode into your own POJO/record. See MongoDB command manual & driver `runCommand` API for full list of commands and options.

</section>
<section>
<title>Fundamentals</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/</url>

# Fundamentals

Kotlin coroutine driver tasks: connect/authenticate/use Stable API; BSON⇄Kotlin mapping; coroutine CRUD; builders (filter, update, projection, etc.); aggregation pipelines/expressions; index creation; collation sorting; driver logging/event monitoring; time-series collections; client-side field encryption.

</section>
<section>
<title>Connection Guide</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/connection/</url>
<description>Explore how to set up and configure a connection to a MongoDB deployment using the Kotlin Coroutine driver, including options for network compression and TLS/SSL.</description>


# Connection Guide (Kotlin Coroutine Driver)

Key tasks:  
- Connect to MongoDB  
- Configure options (compression, TLS/SSL, SOCKS5, timeouts) via `MongoClient`  
- Limit server execution time  
- Use network compression  
- Use TLS/SSL  
- Route through SOCKS5 proxy  
- Manage connections in AWS Lambda  

See “Authentication Mechanisms” for auth details.

</section>
<section>
<title>Connect to MongoDB</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/connection/connect/</url>

# Connect to MongoDB (Kotlin Driver)

`MongoClient`  
Thread-safe pool; create once via  
```kotlin
val client = MongoClient.create("<uri>")
...                 // use
client.close()
```

## Connection URI

`mongodb://[user:pass@]host1[:port][,host2...]/?opt=value`  
 • `mongodb+srv://` = DNS seed style  
 • Options e.g. `maxPoolSize`, `w`, `replicaSet`, `directConnection`.  

## Atlas Sample (Stable API)

```kotlin
val uri = "<atlas-uri>"
val api  = ServerApi.builder().version(ServerApiVersion.V1).build()
val settings = MongoClientSettings.builder()
        .applyConnectionString(ConnectionString(uri))
        .serverApi(api)
        .build()
val client = MongoClient.create(settings)
client.getDatabase("admin")
      .runCommand(Document("ping", BsonInt64(1)))
```

## Local Stand-Alone

Run MongoDB locally, then:

```kotlin
val client = MongoClient.create("mongodb://localhost:27017")
```

## Replica Set

List hosts or enable discovery:

```kotlin
// URI style
val client = MongoClient.create(
    ConnectionString("mongodb://host1:27017,host2:27017,host3:27017/?replicaSet=rs")
)
// Programmatic
val seeds = listOf(
    ServerAddress("host1",27017),
    ServerAddress("host2",27017),
    ServerAddress("host3",27017)
)
val settings = MongoClientSettings.builder()
        .applyToClusterSettings { it.hosts(seeds) }
        .build()
val client = MongoClient.create(settings)
```

Docker-exposed single endpoint: set `directConnection=true` for dev; in prod expose all members.

</section>
<section>
<title>Connection Options</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/connection/connection-options/</url>

# Connection Options (URI `?opt=value`)

| Option | Default | Note |
| --- | --- | --- |
| minPoolSize | 0 | minimum pooled connections |
| maxPoolSize | 100 | maximum pooled connections |
| waitQueueTimeoutMS* | 120 000 | *deprecated: use client-level timeout* |
| serverSelectionTimeoutMS | 30 000 | fail after no server chosen |
| localThresholdMS | 15 | secondary latency window (ms) |
| heartbeatFrequencyMS | 10 000 | server monitor ping period |
| replicaSet | ‑ | set name to discover all members |
| ssl / tls | false | enable TLS (`tls` supersedes `ssl`) |
| tlsInsecure / tlsAllowInvalidHostnames | false | allow invalid host names |
| connectTimeoutMS | 10 000 | socket connect timeout (0 = none) |
| socketTimeoutMS* | 0 | *deprecated* |
| maxIdleTimeMS | 0 | close idle pooled conn after (ms) |
| maxLifeTimeMS | 0 | close pooled conn after (ms) |
| journal | false | wait for journal commit on writes |
| w | 1 | write concern (n / tag / “majority”) |
| wtimeoutMS* | 0 | *deprecated* |
| readPreference | primary | read preference mode |
| readPreferenceTags | ‑ | tag sets, comma-sep `k:v` |
| maxStalenessSeconds | -1 | secondary staleness cutoff |
| authMechanism | auto | e.g. SCRAM-SHA-256, GSSAPI |
| authSource | admin | db to auth against |
| authMechanismProperties | ‑ | `prop1:val1,prop2:val2` |
| appName | ‑ | sent in handshake |
| compressors | ‑ | `zlib,snappy,zstd` |
| zlibCompressionLevel | ‑ | -1…9 (speed vs size) |
| retryWrites | true | retry supported writes on network error |
| retryReads | true | retry supported reads on network error |
| serverMonitoringMode | auto | poll in FaaS, else stream |
| uuidRepresentation | unspecified | legacy/standard UUID encoding |
| directConnection | false | force single host connection |
| maxConnecting | 2 | concurrent connection creations |
| srvServiceName | mongodb | SRV record service name |

\* deprecated

For full set, see `com.mongodb.ConnectionString` API.

</section>
<section>
<title>Specify MongoClient Settings</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/connection/mongoclientsettings/</url>

# MongoClient Configuration (Kotlin Coroutine Driver)

```kotlin
val client = MongoClient.create(
    MongoClientSettings.builder()
        .applyConnectionString(ConnectionString("<uri>")) // default: localhost
        /* .applyToClusterSettings{...}
           .applyToSocketSettings{...}
           .applyToConnectionPoolSettings{...}
           .applyToServerSettings{...}
           .applyToSslSettings{...} */
        .build()
)
```

General rule: if the same option appears multiple times (URI vs builder blocks), the **last** one wins.

---

## MongoClientSettings builder()

Key setters (call directly on the builder):

* addCommandListener
* applicationName
* codecRegistry
* compressorList
* credential
* readConcern / readPreference / writeConcern
* retryReads / retryWrites
* serverApi
* uuidRepresentation
* streamFactoryFactory
* autoEncryptionSettings

---

## applyToClusterSettings { ClusterSettings.Builder }

Important methods:

* hosts, srvHost, srvMaxHosts
* mode(ClusterConnectionMode.SINGLE / MULTIPLE)
* requiredClusterType / requiredReplicaSetName
* serverSelectionTimeout
* localThreshold
* addClusterListener
* serverSelector

Example (force direct connection):
```kotlin
.applyToClusterSettings { it.mode(ClusterConnectionMode.SINGLE) }
```

---

## applyToSocketSettings { SocketSettings.Builder }

* connectTimeout
* readTimeout
* receiveBufferSize / sendBufferSize
* applyToProxySettings
* addSocketSettingsListener (via base interface)

Example:
```kotlin
.applyToSocketSettings {
    it.connectTimeout(10, SECONDS)
      .readTimeout(15, SECONDS)
}
```

---

## applyToConnectionPoolSettings { ConnectionPoolSettings.Builder }

* maxSize / minSize
* maxWaitTime
* maxConnectionIdleTime / maxConnectionLifeTime
* maintenanceFrequency / maintenanceInitialDelay
* addConnectionPoolListener

Example:
```kotlin
.applyToConnectionPoolSettings {
    it.maxWaitTime(10, SECONDS)
      .maxSize(200)
}
```

---

## applyToServerSettings { ServerSettings.Builder }

* heartbeatFrequency
* minHeartbeatFrequency
* serverMonitoringMode
* addServerListener
* addServerMonitorListener

Example:
```kotlin
.applyToServerSettings {
    it.minHeartbeatFrequency(700, MILLISECONDS)
      .heartbeatFrequency(15, SECONDS)
}
```

---

## applyToSslSettings { SslSettings.Builder }

* enabled(true)                 // required for Atlas
* context(SSLContext)
* invalidHostNameAllowed

Example:
```kotlin
.applyToSslSettings { it.enabled(true) }
```

---

Logging current settings:
```properties
org.mongodb.driver.client=INFO
```

Use this page as a quick reference; method names exactly match driver API.

</section>
<section>
<title>Limit Server Execution Time</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/connection/csot/</url>

# Client-Side Operation Timeout (CSOT)

Experimental Kotlin driver feature that caps total time (server selection → connection checkout → server op). On expiry, a timeout exception is thrown.

## Set Timeout

```kotlin
// MongoClientSettings
val client = MongoClient.create(
  MongoClientSettings.builder()
    .applyConnectionString(ConnectionString("<uri>"))
    .timeout(200, TimeUnit.MILLISECONDS)
    .build()
)

// Connection string
val client = MongoClient.create("<uri>/?timeoutMS=200")
```

### Values  
• `>0`: timeout in ms  
• `0`: never time out  
• `null`/unset: fall back to deprecated waitQueueTimeoutMS, socketTimeoutMS, wTimeoutMS, maxTimeMS, maxCommitTimeMS (ignored if timeoutMS present)

## Inheritance (highest → lowest)

Operation → Transaction → Session → Database → Collection → Client

Override with:  

```kotlin
val coll = db.getCollection<Document>("people")
             .withTimeout(300, TimeUnit.MILLISECONDS)
```

## Transactions

```kotlin
val session = client.startSession(
  ClientSessionOptions.builder()
    .defaultTimeout(200, TimeUnit.MILLISECONDS)
    .build()
)

val txnOpts = TransactionOptions.builder()
  .timeout(200, TimeUnit.MILLISECONDS)
  .build()
```

## Client-Side Encryption

`ClientEncryptionSettings.builder().timeout(...)` overrides client timeout; if absent, inherits from MongoClient.

## Cursors

Require a timeout set on client/db/collection.

```kotlin
val flow = collection.find(Filters.gte("age", 40))
                     .timeoutMode(TimeoutMode.CURSOR_LIFETIME)
```
`CURSOR_LIFETIME` caps init + all iterations; `killCursors` gets its own timeout on `close()`.

## Key APIs

MongoClientSettings.timeout(), MongoCollection.withTimeout(), ClientSessionOptions.defaultTimeout(), TransactionOptions.timeout(), ClientEncryptionSettings.timeout(), FindIterable.timeoutMode(), TimeoutMode

</section>
<section>
<title>Network Compression</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/connection/network-compression/</url>

# Network Compression

- Algorithms: snappy (MongoDB 3.4+), zlib (3.6+), zstd (4.2+).  
- Extra deps: `org.xerial.snappy:snappy-java:1.1.8.4`, `com.github.luben:zstd-jni:1.5.5-2` (zlib ships with JDK).  
- If several compressors listed, driver uses first one the server supports.

## ConnectionString
```kotlin
val cs = ConnectionString(
    "mongodb+srv://<user>:<pwd>@<cluster>/?compressors=snappy,zlib,zstd")
val client = MongoClient.create(cs)
```

## MongoClientSettings
```kotlin
val settings = MongoClientSettings.builder()
    .applyConnectionString(ConnectionString("<uri>"))
    .compressorList(
        listOf(
            MongoCompressor.createSnappyCompressor(),
            MongoCompressor.createZlibCompressor(),
            MongoCompressor.createZstdCompressor()))
    .build()
val client = MongoClient.create(settings)
```

</section>
<section>
<title>Enable TLS/SSL on a Connection</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/connection/tls/</url>

# TLS/SSL with Kotlin Coroutine Driver

## Enable / Disable TLS
```kotlin
// Connection string
MongoClient.create("mongodb+srv://u:p@cluster?tls=true")

// Builder
val settings = MongoClientSettings.builder()
    .applyConnectionString(ConnectionString("<string>"))
    .applyToSslSettings { it.enabled(true) }   // false to disable
    .build()
val client = MongoClient.create(settings)
```
`mongodb+srv` defaults to TLS.

## JVM Trust / Key Stores  
Use when server CA or client certs aren’t in default JRE store.

```
-Djavax.net.ssl.trustStore=<path>          -Djavax.net.ssl.trustStorePassword=<pwd>
-Djavax.net.ssl.keyStore=<path>            -Djavax.net.ssl.keyStorePassword=<pwd>
```
Create stores with `keytool -importcert ...`.

## Disable Hostname Verification (testing only)
```kotlin
.applyToSslSettings { b ->
    b.enabled(true)
    b.invalidHostNameAllowed(true)
}
```

## Force TLS 1.2  
`-Djdk.tls.client.protocols=TLSv1.2`

## Netty SSL
```kotlin
val sslCtx = SslContextBuilder.forClient()
    .sslProvider(SslProvider.OPENSSL)
    .build()

val settings = MongoClientSettings.builder()
    .applyToSslSettings { it.enabled(true) }
    .transportSettings(
        TransportSettings.nettyBuilder()
            .sslContext(sslCtx)
            .build()
    ).build()
val client = MongoClient.create(settings)
```

## Custom Java SE SSLContext
```kotlin
val ctx = SSLContext.getDefault()
val settings = MongoClientSettings.builder()
    .applyToSslSettings { it.enabled(true).context(ctx) }
    .build()
```

## OCSP

Client-driven:
```
-Dcom.sun.net.ssl.checkRevocation=true
-Docsp.enable=true
```

Stapling:
```
-Dcom.sun.net.ssl.checkRevocation=true
-Djdk.tls.client.enableStatusRequestExtension=true
```

## Debug TLS  
`-Djavax.net.debug=all`

</section>
<section>
<title>Connect to MongoDB by Using a SOCKS5 Proxy</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/connection/socks5/</url>

# SOCKS5 Proxy

Configure proxy via `MongoClientSettings.applyToSocketSettings` ➜ `proxySettings` **OR** via connection string params.

Proxy options:  
- `proxyHost` (String, required if using proxy)  
- `proxyPort` (Int, default 1080 when host set)  
- `proxyUsername` / `proxyPassword` (Strings, both present or both omitted)

```kotlin
// Settings builder
val client = MongoClient.create(
    MongoClientSettings.builder()
        .applyConnectionString(ConnectionString("<connectionString>"))
        .applyToSocketSettings { s ->
            s.applyToProxySettings {
                it.host("<proxyHost>")
                  .port(<proxyPort>)
                  .username("<proxyUsername>")
                  .password("<proxyPassword>")
            }
        }.build()
)

// Connection string
val client = MongoClient.create(ConnectionString(
    "mongodb+srv://<user>:<pwd>@<cluster>/" +
        "?proxyHost=<proxyHost>&proxyPort=<proxyPort>" +
        "&proxyUsername=<proxyUsername>&proxyPassword=<proxyPassword>"
))
```

API refs: `MongoClientSettings.Builder`, `SocketSettings.Builder`, `ProxySettings.Builder`, `MongoClient.create`.

</section>
<section>
<title>Authentication Mechanisms</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/auth/</url>
<description>Learn how to authenticate with MongoDB using various mechanisms like SCRAM-SHA-256, MONGODB-AWS, and X.509, and configure connections with Kotlin.</description>


# Authentication

Supported mechanisms: Default (prefers SCRAM-SHA-256 ➝ SCRAM-SHA-1 ➝ MONGODB-CR), SCRAM-SHA-256, SCRAM-SHA-1, MONGODB-AWS, X.509.  
Specify via connection string or `MongoCredential`.

---

## Placeholders
`<db_username>`, `<db_password>`, `<hostname>`, `<port>`, `<authenticationDb>`, `<atlasUri>`, `<awsKeyId>`, `<awsSecretKey>`, `<awsSessionToken>`

---

## Default (implicit)
```kotlin
// Conn-str
val c = MongoClient.create(
    "mongodb://<db_username>:<db_password>@<hostname>:<port>/?authSource=<authenticationDb>"
)

// MongoCredential
val cred = MongoCredential.createCredential(
    "<db_username>", "<authenticationDb>", "<db_password>".toCharArray()
)
val client = MongoClient.create(
    MongoClientSettings.builder()
        .applyToClusterSettings { it.hosts(listOf(ServerAddress("<hostname>", "<port>"))) }
        .credential(cred)
        .build()
)
```

---

## SCRAM-SHA-256
```kotlin
// Conn-str
val c = MongoClient.create(
    "mongodb://<db_username>:<db_password>@<hostname>:<port>/?authSource=<authenticationDb>&authMechanism=SCRAM-SHA-256"
)

// MongoCredential
val cred = MongoCredential.createScramSha256Credential(
    "<db_username>", "<authenticationDb>", "<db_password>".toCharArray()
)
```

---

## SCRAM-SHA-1
```kotlin
// Conn-str
val c = MongoClient.create(
    "mongodb://<db_username>:<db_password>@<hostname>:<port>/?authSource=<authenticationDb>&authMechanism=SCRAM-SHA-1"
)

// MongoCredential
val cred = MongoCredential.createScramSha1Credential(
    "<db_username>", "<authenticationDb>", "<db_password>".toCharArray()
)
```

---

## MONGODB-AWS
Uses AWS IAM creds; driver falls back to AWS SDK v2/ v1 default provider chain.

### Connection string
```kotlin
val c = MongoClient.create("mongodb://<atlasUri>?authMechanism=MONGODB-AWS")
```

### Credential object
```kotlin
// static keys
var cred = MongoCredential.createAwsCredential("<awsKeyId>", "<awsSecretKey>".toCharArray())
// optional session token
cred = cred.withMechanismProperty("AWS_SESSION_TOKEN", "<awsSessionToken>")
// dynamic refresh
cred = cred.withMechanismProperty(
    MongoCredential.AWS_CREDENTIAL_PROVIDER_KEY,
    Supplier { AwsCredential("<awsKeyId>", "<awsSecretKey>", "<awsSessionToken>") }
)
```

### Env or container credentials  
If `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`, or container metadata envs are set, use:
```kotlin
val cred = MongoCredential.createAwsCredential(null, null)
```

---

## X.509
```kotlin
// Conn-str (TLS required)
val c = MongoClient.create(
    "mongodb://<db_username>@<hostname>:<port>/?authSource=$external&authMechanism=MONGODB-X509&tls=true"
)

// MongoCredential + TLS
val client = MongoClient.create(
    MongoClientSettings.builder()
        .applyToClusterSettings { it.hosts(listOf(ServerAddress("<hostname>", "<port>"))) }
        .applyToSslSettings { it.enabled(true) }
        .credential(MongoCredential.createMongoX509Credential())
        .build()
)
```

Mechanisms `MONGODB-CR` deprecated ≥4.0 (use Default fallback).

</section>
<section>
<title>Enterprise Authentication Mechanisms</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/enterprise-auth/</url>

# Enterprise Authentication (Kotlin Coroutine Driver)

Use `MongoClient.create(ConnectionString(...))` or `MongoClientSettings.builder().credential(...)` with `MongoCredential` factory methods.

---

## GSSAPI (Kerberos)

Connection string  
```kotlin
val cs = ConnectionString(
  "mongodb://<principal>@<host>:<port>/?authMechanism=GSSAPI&authSource=$external" +
  "&authMechanismProperties=SERVICE_NAME:myService")      // optional props
val client = MongoClient.create(cs)
```

`MongoCredential`  
```kotlin
val cred = MongoCredential.createGSSAPICredential("<principal>")
    .withMechanismProperty(MongoCredential.SERVICE_NAME_KEY, "myService")
    // .withMechanismProperty(MongoCredential.JAVA_SUBJECT_PROVIDER_KEY,
    //     KerberosSubjectProvider("myLoginContext"))      // cache tickets per-process
val client = MongoClient.create(
    MongoClientSettings.builder()
        .applyToClusterSettings { it.hosts(listOf(ServerAddress("<host>", <port>))) }
        .credential(cred).build())
```

JVM system props often required:  
```
java.security.krb5.realm=REALM
java.security.krb5.kdc=kdc.host
```

Mechanism property keys: `SERVICE_NAME_KEY`, `CANONICALIZE_HOST_NAME_KEY`, `JAVA_SUBJECT_KEY`, `JAVA_SASL_CLIENT_PROPERTIES_KEY`, `JAVA_SUBJECT_PROVIDER_KEY`.

---

## LDAP (PLAIN)

Connection string  
```kotlin
val cs = ConnectionString(
  "mongodb://<ldapUser>:<pwd>@<host>:<port>/?authMechanism=PLAIN&authSource=$external")
val client = MongoClient.create(cs)
```

`MongoCredential`  
```kotlin
val cred = MongoCredential.createPlainCredential(
    "<ldapUser>", "$external", "<pwd>".toCharArray())
val client = MongoClient.create(
    MongoClientSettings.builder()
        .applyToClusterSettings { it.hosts(listOf(ServerAddress("<host>", <port>))) }
        .credential(cred).build())
```

---

## MONGODB-OIDC  (server ≥7.0, Linux)

Common props:  
`ENVIRONMENT`: `azure | gcp | k8s`  
`TOKEN_RESOURCE`: audience (URI-encoded in URI)  

### Azure / GCP / K8s (URI form)
```kotlin
val cs = ConnectionString(
  "mongodb://<oidcPrincipal>@<host>:<port>/?authMechanism=MONGODB-OIDC" +
  "&authMechanismProperties=ENVIRONMENT:azure,TOKEN_RESOURCE:<audienceEnc>")
val client = MongoClient.create(cs)
```

### Azure / GCP / K8s (`MongoCredential` form)
```kotlin
val cred = MongoCredential.createOidcCredential("<oidcPrincipal>")
    .withMechanismProperty("ENVIRONMENT", "azure")
    .withMechanismProperty("TOKEN_RESOURCE", "<audience>")
val client = MongoClient.create(
    MongoClientSettings.builder()
        .applyToClusterSettings { it.hosts(listOf(ServerAddress("<host>", <port>))) }
        .credential(cred).build())
```

### Custom platforms (callback)
```kotlin
val cred = MongoCredential.createOidcCredential(null)
    .withMechanismProperty("OIDC_CALLBACK") { ctx ->
        val token = Files.readString(Paths.get("access-token.dat"))
        OidcCallbackResult(token)
    }
```

---

</section>
<section>
<title>Stable API</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/stable-api/</url>
<description>Learn how to enable and configure the Stable API feature in MongoDB to ensure compatibility with specified API versions when connecting to a server.</description>


# Stable API (MongoDB ≥5.0)

Use only when every target server supports it. Assign an API version at `MongoClient` creation; each client instance uses one version.

```kotlin
val serverApi = ServerApi.builder()
    .version(ServerApiVersion.V1)
    .build()

val settings = MongoClientSettings.builder()
    .applyConnectionString(ConnectionString("<connection string>"))
    .serverApi(serverApi)
    .build()

val client = MongoClient.create(settings)
```

Mixing with pre-5.0 servers triggers  
`Unrecognized field 'apiVersion'`.

Options (default=false):  
• `strict` – error if command not in the declared version.  
• `deprecationErrors` – error if command is deprecated.

```kotlin
val serverApi = ServerApi.builder()
    .version(ServerApiVersion.V1)
    .strict(true)
    .deprecationErrors(true)
    .build()
```

Key APIs: `ServerApi`, `ServerApi.Builder`, `ServerApiVersion`, `MongoClientSettings`, `MongoClientSettings.Builder`, `MongoClient`.

</section>
<section>
<title>Databases and Collections</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/databases-collections/</url>
<description>Learn to use MongoDB databases and collections with the Kotlin driver, including accessing, creating, and managing collections and specifying read/write concerns.</description>


# Databases & Collections

Kotlin coroutine driver key ops.

## Access

```kotlin
val db = client.getDatabase("testDatabase")
val coll = db.getCollection<Example>("testCollection")
```

## Change Return Type

```kotlin
data class Fruit(@BsonId val id:Int,val name:String,val qty:Int,val seasons:List<String>)
data class NewFruit(@BsonId val id:Int,val name:String,val quantity:Int,val seasons:List<String>)

val res = db.getCollection<Fruit>("fruits")
           .withDocumentClass<NewFruit>()                // override return class
           .findOneAndUpdate(
               Filters.eq(Fruit::name.name,"strawberry"),
               Updates.combine(
                   Updates.rename(Fruit::qty.name,"quantity"),
                   Updates.push(Fruit::seasons.name,"fall")),
               FindOneAndUpdateOptions().returnDocument(ReturnDocument.AFTER))
```

## Create Collection

```kotlin
db.createCollection("exampleCollection")

val validator = ValidationOptions().validator(
        Filters.or(Filters.exists("title"),Filters.exists("name")))
db.createCollection("movies",
        CreateCollectionOptions().validationOptions(validator))
```

## List & Drop

```kotlin
val names = db.listCollectionNames().toList()
db.getCollection<Example>("movies").drop()
```

## Read/Write Settings (inherit but can override)

```kotlin
val customDb  = db.withReadPreference(ReadPreference.secondary())
val customCol = coll.withWriteConcern(WriteConcern.MAJORITY)
```

ReadPreference / ReadConcern apply to reads; WriteConcern to writes.

</section>
<section>
<title>Data Formats</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/data-formats/</url>
<description>Explore various data formats in Kotlin, including BSON, Extended JSON, and Kotlin Serialization, and learn about codecs and document data formats.</description>


# Data Formats
- Data Classes  
- BSON  
- Extended JSON  
- Documents  
- Kotlin Serialization  
- Codecs

</section>
<section>
<title>Document Data Format: Data Classes</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/data-formats/document-data-format-data-class/</url>

# Data Classes

### Native POJO Encoding  
The default codec registry automatically (de)serializes Kotlin `data class`es.

```kotlin
data class DataStorage(val productName: String, val capacity: Double)

val coll = db.getCollection<DataStorage>("data_storage")
coll.insertOne(DataStorage("tape", 5.0))

coll.find().collect { println(it) }        // DataStorage(productName=tape, capacity=5.0)
```

withDocumentClass lets reads return a different type:

```kotlin
data class NewDataStorage(val productName: String, val capacity: Double, val releaseDate: LocalDate)

val res = coll.withDocumentClass<NewDataStorage>()
    .findOneAndUpdate(
        Filters.eq(DataStorage::productName.name, "tape"),
        Updates.currentDate("releaseDate"),
        FindOneAndUpdateOptions().returnDocument(ReturnDocument.AFTER)
    )
println(res)    // NewDataStorage(...)
```

### Property Annotations

* `@BsonId` serialize property as `_id`.  
* `@BsonProperty("field")` custom BSON key.  
* `@BsonRepresentation(BsonType.X)` store value as different BSON type (throws if identical).

```kotlin
data class NetworkDevice(
    @BsonId @BsonRepresentation(BsonType.OBJECT_ID) val deviceId: String,
    val name: String,
    @BsonProperty("type") val deviceType: String
)

val nc = db.getCollection<NetworkDevice>("network_devices")
nc.insertOne(NetworkDevice(ObjectId().toHexString(), "Enterprise Wi-fi", "router"))
nc.find().collect { println(it) }
```

### Recursive Types

Cycles are handled without stack overflow.

```kotlin
data class DataClassTree(val content: String, val left: DataClassTree?, val right: DataClassTree?)

val treeColl = db.getCollection<DataClassTree>("myCollection")
treeColl.find(Filters.eq("left.left.right.content", "high german"))
        .collect { println(it) }
```

</section>
<section>
<title>Document Data Format: BSON</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/data-formats/document-data-format-bson/</url>

# BSON

Binary JSON format used by MongoDB; extends JSON with dates, 32/64-bit ints, ObjectId, binary, etc. Kotlin driver already includes it, but it can be added standalone.

Primary container classes (`org.bson`): `Document`, `BsonDocument`, `RawBsonDocument`, `JsonObject`.

Dependency:

Maven
```xml
<dependency>
  <groupId>org.mongodb</groupId>
  <artifactId>bson</artifactId>
  <version>5.5.0</version>
</dependency>
```

Gradle
```kotlin
implementation("org.mongodb:bson:5.5.0")
```

Or download the JAR from Sonatype.

</section>
<section>
<title>Document Data Format: Extended JSON</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/data-formats/document-data-format-extended-json/</url>

# Document Data Format: Extended JSON

## Formats

- Extended (canonical): lossless, every BSON type (`$oid`, `$numberLong`, …).  
- Relaxed: human-friendly, numeric/ISO dates; some type loss.  
- Shell: JS literals (ObjectId(), ISODate()).  
- Strict (deprecated).

`$uuid` → `BsonBinary` subtype 4.

Example:

```json
// Extended
{ "_id": { "$oid": "573a1391f29313caabcd9637"},
  "createdAt": { "$date": { "$numberLong": "1601499609"}},
  "numViews": { "$numberLong": "36520312"} }
```

Relaxed swaps ISO date & bare longs; Shell uses functions.

## Read JSON → Kotlin

```kotlin
val ejson = """{ "_id":{ "${"$"}oid":"507f...9011"},
                 "n":{ "${"$"}numberLong":"4794261"} }"""
val doc = Document.parse(ejson)     // any format
```

Low-level:

```kotlin
val r = JsonReader(ejson)
r.readStartDocument()
val id = r.readObjectId()
r.readName("n"); val n = r.readInt64()
r.close()
```

## Write Kotlin → JSON

```kotlin
val doc = Document("_id", ObjectId("507f...9012"))
             .append("n", 11223344)
val relaxed = JsonWriterSettings.builder()
               .outputMode(JsonMode.RELAXED).build()
doc.toJson(relaxed)   // {"_id":{"$oid":"..."},"n":11223344}
```

Without `Document`:

```kotlin
val s = JsonWriterSettings.builder()
          .outputMode(JsonMode.EXTENDED).build()
JsonWriter(BufferedWriter(OutputStreamWriter(System.out)), s).use {
    it.writeStartDocument()
    it.writeObjectId("_id", ObjectId("507f...9012"))
    it.writeInt64("n", 11223344)
    it.writeEndDocument()
}
```

## Custom Converters

```kotlin
val cfg = JsonWriterSettings.builder()
    .outputMode(JsonMode.RELAXED)
    .objectIdConverter { v, w -> w.writeString(v.toHexString()) }
    .timestampConverter { v, w ->
        val iso = Instant.ofEpochSecond(v.time.toLong())
            .atOffset(ZoneOffset.UTC)
            .format(DateTimeFormatter.ISO_DATE_TIME)
        w.writeString(iso)
    }.build()

val doc = Document("_id", ObjectId("507f...9012"))
            .append("createdAt", BsonTimestamp(1601516589,1))
println(doc.toJson(cfg))
// {"_id":"507f...9012","createdAt":"2020-10-01T01:43:09","myNumber":4794261}
```

Key APIs: `Document/BsonDocument.parse()`, `toJson()`, `JsonReader`, `JsonWriter`, `JsonWriterSettings.builder().outputMode(JsonMode)`, converter lambdas (`objectIdConverter`, `timestampConverter`, etc.).

</section>
<section>
<title>Documents</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/data-formats/documents/</url>

# MongoDB Kotlin Driver – Documents

### Core BSON container classes  
|Class|Pkg|Implements|When to use|
|---|---|---|---|
|`Document`|`org.bson`|`Map<String, Any>`|Concise, dynamic, Kotlin std-types|
|`BsonDocument`|`org.bson`|`Map<String, BsonValue>`|Type-safe, BSON primitives|
|`JsonObject`|`org.bson.json`|—|Pure JSON string workflow|

---

## `Document`
Kotlin std-lib types map automatically: `String`, `Int/Long`, `Double`, `Boolean`, `LocalDateTime`, `List`, `Document`, `Binary`, `ObjectId`, `null`.

```kotlin
val author = Document("_id", ObjectId())
    .append("name", "Gabriel García Márquez")
    .append("dateOfDeath", LocalDateTime.of(2014,4,17,4,0))
    .append("novels", listOf(
        Document("title","One Hundred Years of Solitude").append("yearPublished",1967),
        Document("title","Chronicle of a Death Foretold").append("yearPublished",1981),
        Document("title","Love in the Time of Cholera").append("yearPublished",1985)
    ))

val coll = mongo.getDatabase("fundamentals_data").getCollection<Document>("authors")
coll.insertOne(author)

coll.find(eq("name","Gabriel García Márquez")).firstOrNull()?.let {
    println(it.getString("name"))
    it.getList("novels",Document::class.java).forEach { n ->
        println("${n.getString("title")} -> ${n.getInteger("yearPublished")}")
    }
}
```

`getXxx()` helpers cast and throw if type mismatch; `get()` skips checking.

---

## `BsonDocument`
Type-safe access via `Bson*` primitives (e.g., `BsonString`, `BsonInt32`, …).

```kotlin
val author = BsonDocument()
    .append("_id", BsonObjectId())
    .append("name", BsonString("Gabriel García Márquez"))
    .append("dateOfDeath", BsonDateTime(
        LocalDateTime.of(2014,4,17,0,0)
            .atZone(ZoneId.of("America/New_York")).toInstant().toEpochMilli()
    ))
    .append("novels", BsonArray(listOf(
        BsonDocument().append("title",BsonString("One Hundred Years of Solitude"))
                      .append("yearPublished",BsonInt32(1967)),
        BsonDocument().append("title",BsonString("Chronicle of a Death Foretold"))
                      .append("yearPublished",BsonInt32(1981)),
        BsonDocument().append("title",BsonString("Love in the Time of Cholera"))
                      .append("yearPublished",BsonInt32(1985))
    )))

val coll = mongo.getDatabase("fundamentals_data").getCollection<BsonDocument>("authors")
coll.insertOne(author)

coll.find(eq("name", "Gabriel García Márquez")).firstOrNull()?.let {
    println(it.getString("name").value)
    it.getArray("novels").forEach { n ->
        val doc = n.asDocument()
        println("${doc.getString("title").value} -> ${doc.getInt32("yearPublished").value}")
    }
}
```

Helpers throw `BsonInvalidOperationException` on wrong type; `get()` returns raw `BsonValue`.

---

## `JsonObject`
Wrapper around Extended JSON; avoids Map conversion.

```kotlin
val json = """
{ "_id": {"$oid":"6035210f35bd203721c3eab8"},
  "name":"Gabriel García Márquez",
  "dateOfDeath":{"$date":"2014-04-17T04:00:00Z"},
  "novels":[
    {"title":"One Hundred Years of Solitude","yearPublished":1967},
    {"title":"Chronicle of a Death Foretold","yearPublished":1981},
    {"title":"Love in the Time of Cholera","yearPublished":1985}]}
""".trimIndent()

val coll = mongo.getDatabase("fundamentals_data").getCollection<JsonObject>("authors")
coll.insertOne(JsonObject(json))

val res = coll.find(JsonObject("""{"name":"Gabriel García Márquez"}""")).firstOrNull()
println(res?.json)   // Extended JSON string
```

`JsonObjectCodec` + `JsonWriterSettings` can change JSON format.

---

Focus classes: `Document`, `BsonDocument`, `JsonObject`; use `getCollection()`, `insertOne`, `find`, and helper getters.

</section>
<section>
<title>Kotlin Serialization</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/data-formats/serialization/</url>

# Kotlin Serialization (MongoDB Kotlin Driver)

Kotlin driver integrates `kotlinx.serialization` for BSON. Prefer `bson-kotlinx` (reflection-free, fast) over `bson-kotlin`.

## Dependencies
```kotlin
// Gradle
implementation("org.jetbrains.kotlinx:kotlinx-serialization-core:1.6.0")
implementation("org.mongodb:bson-kotlinx:5.5.0")
```
```xml
<!-- Maven -->
<dependency>…kotlinx-serialization-core…1.6.0</dependency>
<dependency>…bson-kotlinx…5.5.0</dependency>
```

## Serializable Classes
```kotlin
@Serializable
data class PaintOrder(
    @SerialName("_id") @Contextual val id: ObjectId?,
    val color: String,
    val qty: Int,
    @SerialName("brand") val manufacturer: String = "Acme"
)
```
• Use `@Serializable`, `@SerialName`, `@Contextual`.  
• POJO annotations (`@BsonId`, etc.) NOT allowed.

## Custom `KSerializer`
```kotlin
object InstantAsBsonDateTime : KSerializer<Instant> {
    override val descriptor = PrimitiveSerialDescriptor("InstantBson", PrimitiveKind.LONG)
    override fun serialize(enc: Encoder, v: Instant) =
        (enc as? BsonEncoder)?.encodeBsonValue(BsonDateTime(v.toEpochMilliseconds()))
            ?: error("Unsupported")
    override fun deserialize(dec: Decoder) = Instant.fromEpochMilliseconds(
        (dec as? BsonDecoder)?.decodeBsonValue()?.asDateTime()?.value ?: error("Unsupported"))
}

@Serializable
data class TimedOrder(
    val color: String,
    @Serializable(with = InstantAsBsonDateTime::class) val orderDate: Instant
)
```

## Custom Codec via `KotlinSerializerCodec`
```kotlin
import org.bson.codecs.kotlinx.*

val codec = KotlinSerializerCodec.create<PaintOrder>(
    bsonConfiguration = BsonConfiguration(encodeDefaults = false)
)
val registry = CodecRegistries.fromRegistries(
    CodecRegistries.fromCodecs(codec), collection.codecRegistry)
```

### Snake-case field names
```kotlin
val snakeCodec = KotlinSerializerCodec.create<PaintOrder>(
    bsonConfiguration = BsonConfiguration(bsonNamingStrategy = BsonNamingStrategy.SNAKE_CASE))
```

## Polymorphic Serialization
```kotlin
@Serializable sealed interface Person { val name: String }

@Serializable data class Student(@Contextual @SerialName("_id") val id: ObjectId,
                                 override val name: String, val grade: Int): Person
@Serializable data class Teacher(@Contextual @SerialName("_id") val id: ObjectId,
                                 override val name: String, val department: String): Person

val col = db.getCollection<Person>("school")
col.insertOne(Teacher(ObjectId(), "Vivian", "History"))
col.insertOne(Student(ObjectId(), "Kate", 10))

col.withDocumentClass<Person>().find().collect { println(it) }
```
Driver adds `_t` discriminator and auto-deserializes.

## Dates & Times (`kotlinx-datetime`)
Add dependency:
```kotlin
implementation("org.jetbrains.kotlinx:kotlinx-datetime:0.6.1")
```
```kotlin
@Serializable
data class Appointment(
    val name: String,
    @Contextual val date: LocalDate, // stored as BSON Date
    val time: LocalTime              // stored as String
)
val col = db.getCollection<Appointment>("appointments")
col.insertOne(Appointment("Daria", LocalDate(2024,10,15), LocalTime(11,30)))
```

Resulting BSON:
```json
{ "_id": "...", "name": "Daria", "date": { "$date": "2024-10-15T00:00:00Z" }, "time": "11:30" }
```

</section>
<section>
<title>Codecs</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/data-formats/codecs/</url>

# Codecs

Map Kotlin ↔︎ BSON via `org.bson.Codec<T>` and helpers.

## Codec

```kotlin
interface Codec<T> {
  fun encode(w: BsonWriter, value: T, ctx: EncoderContext)
  fun decode(r: BsonReader, ctx: DecoderContext): T
  fun getEncoderClass(): Class<T>
}
```

Example enum ↔︎ `Boolean`:

```kotlin
enum class PowerStatus { ON, OFF }

class PowerStatusCodec : Codec<PowerStatus> {
  override fun encode(w: BsonWriter, v: PowerStatus, c: EncoderContext) =
      w.writeBoolean(v == PowerStatus.ON)

  override fun decode(r: BsonReader, c: DecoderContext) =
      if (r.readBoolean()) PowerStatus.ON else PowerStatus.OFF

  override fun getEncoderClass() = PowerStatus::class.java
}
```

## CodecRegistry

Immutable map class → `Codec<T>`. Build:

```kotlin
val reg = CodecRegistries.fromCodecs(IntegerCodec(), PowerStatusCodec())
val powerCodec = reg.get(PowerStatus::class.java)   // Codec not found ⇒ CodecConfigurationException
```

Compose registries (earlier wins):

```kotlin
val custom = CodecRegistries.fromRegistries(
    CodecRegistries.fromCodecs(MyEnumCodec()),      // overrides enum codec
    MongoClientSettings.getDefaultCodecRegistry()
)
```

Factory methods: `fromCodecs`, `fromProviders`, `fromRegistries`.

## CodecProvider

Creates codecs on demand:

```kotlin
class MonolightCodecProvider : CodecProvider {
  override fun <T> get(clazz: Class<T>, r: CodecRegistry): Codec<T>? =
      if (clazz == Monolight::class.java) MonolightCodec(r) as Codec<T> else null
}
```

## BsonTypeClassMap

Mutable `Map<BsonType, Class<*>>` defaults driver’s BSON→Java types.

```kotlin
val map = BsonTypeClassMap(mapOf(BsonType.ARRAY to MutableSet::class.java))
```

## Custom Codec Example

Domain class:

```kotlin
data class Monolight(
    var powerStatus: PowerStatus = PowerStatus.OFF,
    var colorTemperature: Int? = null
)
```

Codec needing field codecs from registry:

```kotlin
class MonolightCodec(r: CodecRegistry) : Codec<Monolight> {
  private val power = r[PowerStatus::class.java]
  private val intC = IntegerCodec()

  override fun encode(w: BsonWriter, v: Monolight, c: EncoderContext) {
    w.writeStartDocument()
    w.writeName("powerStatus"); power.encode(w, v.powerStatus, c)
    w.writeName("colorTemperature"); intC.encode(w, v.colorTemperature, c)
    w.writeEndDocument()
  }

  override fun decode(r: BsonReader, c: DecoderContext): Monolight {
    val m = Monolight(); r.readStartDocument()
    while (r.readBsonType() != BsonType.END_OF_DOCUMENT) when (r.readName()) {
      "powerStatus" -> m.powerStatus = power.decode(r, c)
      "colorTemperature" -> m.colorTemperature = intC.decode(r, c)
      "_id" -> r.readObjectId()
    }
    r.readEndDocument(); return m
  }

  override fun getEncoderClass() = Monolight::class.java
}
```

Usage with coroutines:

```kotlin
fun main() = runBlocking {
  val client = MongoClient.create("<uri>")
  val reg = CodecRegistries.fromRegistries(
      CodecRegistries.fromCodecs(IntegerCodec(), PowerStatusCodec()),
      CodecRegistries.fromProviders(MonolightCodecProvider()),
      MongoClientSettings.getDefaultCodecRegistry()
  )
  val col = client.getDatabase("codecs_example_products")
      .getCollection<Monolight>("monolights")
      .withCodecRegistry(reg)

  col.insertOne(Monolight(PowerStatus.ON, 5200))
  println(col.find().toList())   // [Monolight [powerStatus=ON, colorTemperature=5200]]
}
```

</section>
<section>
<title>CRUD Operations</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/</url>
<description>Explore how to perform CRUD operations using Kotlin Coroutine with MongoDB, including creating, reading, updating, and deleting documents.</description>


# CRUD Operations

CRUD = Create, Read, Update, Delete  
• Read → fetch documents  
• Write → insert/modify/remove documents  
• Compound ops mix read + write

</section>
<section>
<title>Read Operations</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/read-operations/</url>

# Read Operations

Retrieve · Flow · Change Streams · Sort · Skip · Limit · Project · Geo · Text

</section>
<section>
<title>Retrieve Data</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/read-operations/retrieve/</url>

# Retrieve Data

Read APIs (coroutine driver) return `kotlinx.coroutines.flow.Flow<T>`.

```kotlin
val results: Flow<PaintOrder> = collection.find(filter)
results.collect { println(it) }
```

## Sample Model & Docs
```kotlin
data class PaintOrder(@BsonId val id: Int, val qty: Int, val color: String)
```
Example docs  
`{ _id:1, color:"purple", qty:10 }` etc.

## Find
```kotlin
val filter = Filters.and(Filters.gt("qty", 3), Filters.lt("qty", 9))
collection.find(filter).collect { println(it) }
// PaintOrder(id=2, qty=8, color=green)
// PaintOrder(id=3, qty=4, color=purple)
```

## Aggregate
```kotlin
data class AggRes(@BsonId val id: String, val qty: Int)

val pipeline = listOf(
    Aggregates.match(Filters.empty()),
    Aggregates.group("\$color", Accumulators.sum("qty", "\$qty")),
    Aggregates.sort(Sorts.descending("qty"))
)

collection.aggregate<AggRes>(pipeline).collect { println(it) }
// AggRes(id=green, qty=19)
// AggRes(id=purple, qty=14)
```

## Change Streams
`collection.watch<PaintOrder>()` returns `Flow<ChangeStreamDocument<PaintOrder>>`.

Key APIs: `MongoCollection.find()`, `MongoCollection.aggregate()`, `MongoCollection.watch()`.

</section>
<section>
<title>Access Data From a Flow</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/read-operations/flow/</url>

# Access Data From a Flow

`collection.find()` returns a `FindFlow<T>` (same APIs for `AggregateFlow`). Configure the flow, then call a **terminal method** which executes on the server (timeouts via cursor options).

```kotlin
val flow = collection.find()        // create FindFlow
```

Terminal ops:

```kotlin
// 1st doc
val first = flow.firstOrNull()       // null if none
val firstStrict = flow.first()       // throws NoSuchElementException

// count
val n = flow.count()

// materialize
val list: List<T> = flow.toList()    // use if small result set

// iterate
flow.collect { println(it) }         // closes flow on early exit

// explain
val plan = flow.explain(ExplainVerbosity.EXECUTION_STATS)
println(
    plan.getEmbedded(listOf("queryPlanner","winningPlan"), Document::class.java).toJson()
)
```

Explain verbosity:  
• QUERY_PLANNER (max detail)  
• EXECUTION_STATS (perf)  
• ALL_PLANS_EXECUTIONS (plan selection)

No other special APIs differ from the Java driver.

</section>
<section>
<title>Open Change Streams</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/read-operations/change-streams/</url>

# Change Streams (Kotlin Coroutine Driver)

### Open
```kotlin
// scope: collection, db, or deployment
val job = launch {
    collection.watch().collect { println(it) }
}
// ... do writes ...
job.cancel()
```
`MongoCollection.watch()` → collection events  
`MongoDatabase.watch()` → db events  
`MongoClient.watch()` → deployment events  

### Filter / Transform
```kotlin
val pipeline = listOf(
    Aggregates.match(Filters.`in`("operationType", listOf("insert","update")))
)
launch { collection.watch(pipeline).collect { println(it) } }
```

### Split >16 MB Events (MongoDB 7+)
```kotlin
val pipeline = listOf(
    BsonDocument("\$changeStreamSplitLargeEvent", BsonDocument())
)
launch { collection.watch(pipeline).collect { println(it) } }
```
• Only one `$changeStreamSplitLargeEvent`, and it must be last.

### Pre- & Post-Images (MongoDB 6+)
1. Enable on collection:
```kotlin
val opts = CreateCollectionOptions()
    .changeStreamPreAndPostImagesOptions(ChangeStreamPreAndPostImagesOptions(true))
database.createCollection("coll", opts)
```
2. Configure stream:

Pre-image
```kotlin
launch {
    collection.watch()
        .fullDocumentBeforeChange(FullDocumentBeforeChange.REQUIRED)
        .collect { println(it.fullDocumentBeforeChange) }
}
```

Post-image
```kotlin
launch {
    collection.watch()
        .fullDocument(FullDocument.UPDATE_LOOKUP)
        .collect { println(it.fullDocument) }
}
```

Options: see FullDocumentBeforeChange / FullDocument enums.

</section>
<section>
<title>Sort Results</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/read-operations/sort/</url>

# Sort Results

Use `sort()` on a `FindFlow` or `Aggregates.sort()` in pipelines, passing `Bson` built with `Sorts`.

```kotlin
data class Order(@BsonId val id: Int, val date: String, val orderTotal: Double, val description: String)
val ascFlow = collection.find().sort(Sorts.ascending(Order::orderTotal.name))
val pipeFlow = collection.aggregate(listOf(Aggregates.sort(Sorts.ascending(Order::orderTotal.name))))
```

## Direction

```kotlin
Sorts.ascending("<field>")     // smallest→largest  
Sorts.descending("<field>")    // largest→smallest
```

## Ties / Multiple Keys

MongoDB order is undefined on ties; add keys:

```kotlin
collection.find().sort(Sorts.ascending(Order::date.name, Order::orderTotal.name))
// or explicit list:
val criteria = Sorts.orderBy(
    Sorts.descending(Order::date.name),
    Sorts.ascending(Order::orderTotal.name)
)
collection.find().sort(criteria)
```

## Text Search Sorting

Requires text index.

```kotlin
data class OrderScore(@BsonId val id: Int, val description: String, val score: Double)

collection.createIndex(Indexes.text(Order::description.name))
val term = "vanilla"
val flow = collection.find<OrderScore>(Filters.text(term))
    .projection(Projections.metaTextScore(OrderScore::score.name)) // < MongoDB 4.4 only
    .sort(Sorts.orderBy(
        Sorts.metaTextScore(OrderScore::score.name), // field name ignored ≥4.4
        Sorts.descending("_id")
    ))
```

Outputs highest `$meta` text score first.

API refs: FindFlow, Aggregates, Sorts, Filters, Indexes, Projections.

</section>
<section>
<title>Skip Returned Results</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/read-operations/skip/</url>

# Skip Returned Results

Use `skip(n)` to omit the first `n` documents.

```kotlin
collection.find().skip(2)        // FindFlow
```

In aggregation pipelines:

```kotlin
val results = collection.aggregate(
    listOf(
        Aggregates.match(Filters.empty()),
        Aggregates.skip(2)
    )
)
```

Example (paint inventory):

```kotlin
data class PaintOrder(@BsonId val id: Int, val qty: Int, val color: String)

val topSellers = collection.find(Filters.empty())
    .sort(descending(PaintOrder::qty.name))
    .skip(5)                     // omit 5 largest qty values
topSellers.collect { println(it) }
```

Same via aggregation:

```kotlin
val flow = collection.aggregate(
    listOf(
        Aggregates.match(Filters.empty()),
        Aggregates.sort(descending(PaintOrder::qty.name)),
        Aggregates.skip(5)
    )
)
flow.collect { println(it) }
```

If `skip` ≥ matched document count, no documents are returned.

</section>
<section>
<title>Limit the Number of Returned Results</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/read-operations/limit/</url>

# Limit Returned Results

`limit(n)` on a `FindFlow` caps the documents emitted; `skip(m)` discards the first *m* matches **before** the limit is applied. `sort()` is always executed first, so its position in the call chain is irrelevant.

```kotlin
// Top 3 longest books
collection.find()
    .sort(descending("length"))
    .limit(3)
    .collect(::println)

// Same result:
collection.find().limit(3).sort(descending("length"))

// Page 2 (docs 4-6)
collection.find()
    .sort(descending("length"))
    .skip(3)        // offset
    .limit(3)       // page size
    .collect(::println)
```

For deterministic paging, sort by a unique field (e.g. `_id`, `serial_no`) or include it in a compound sort; non-unique sorts can return different docs across calls when combined with `skip()/limit()`.

</section>
<section>
<title>Specify Which Fields to Return</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/read-operations/project/</url>

# Specify Which Fields to Return

Projections let you limit fields returned by `find()`.

Behavior  
* `include(...)` implicitly excludes all other fields.  
* `exclude(...)` implicitly includes all other fields.  
* These modes are mutually exclusive **except** `_id`, which is always returned unless you add `excludeId()` (even if you use `include`).  

```kotlin
// Data classes
data class Fruit(@BsonId val id: Int, val name: String, val qty: Int, val rating: Int)
data class FruitName(val name: String)               // id optional
data class FruitRating(val name: String, val rating: Int)

// 1) Return only name (id kept)
collection.find<FruitName>()
    .projection(Projections.include(FruitName::name.name))
    .collect{ println(it) }           // FruitName(name=apples), …

// 2) Return only name (id removed)
collection.find<FruitName>()
    .projection(Projections.fields(
        Projections.include(FruitName::name.name),
        Projections.excludeId()
    ))
    .collect{ println(it) }           // FruitName(name=apples), …

// 3) Multiple fields
collection.find<FruitRating>()
    .projection(Projections.fields(
        Projections.include(FruitRating::name.name, FruitRating::rating.name),
        Projections.excludeId()
    ))
    .collect{ println(it) }           // FruitRating(name=apples, rating=3), …
```

Order of fields in the projection does not affect result ordering.

</section>
<section>
<title>Search Geospatially</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/read-operations/geo/</url>

# Geospatial Queries – Kotlin Coroutine Driver

Geo formats  
• GeoJSON (recommended):  
```json
{ "location": { "type":"Point", "coordinates":[lon, lat] } }
```  
Coordinates are `[longitude, latitude (, elevation)]`.

• Legacy pairs: `{ "location":[x, y] }` (Euclidean).

Indexes  
```kotlin
// GeoJSON
collection.createIndex(Indexes.geo2dsphere("location.geo"))
// Legacy
collection.createIndex(Indexes.geo2d("coordinates"))
```

Query operators → Filters helpers  
`$near`  → Filters.near()  
`$nearSphere` → Filters.nearSphere()  
`$geoWithin` → Filters.geoWithin()  
`$geoIntersects` (needs 2dsphere) → Filters.geoIntersects()

Shapes (com.mongodb.client.model.geojson.*): `Position`, `Point`, `LineString`, `Polygon`.

---

## Examples (sample_mflix.theaters)

Common imports  
```kotlin
import com.mongodb.client.model.geojson.*
import com.mongodb.client.model.Filters
import com.mongodb.client.model.Projections
```

Documents  
```kotlin
data class Theater(val theaterId:Int, val location:Location){
    data class Location(val address:Address, val geo:Point){
        data class Address(val street1:String, val city:String, val state:String, val zipcode:String)}
}
data class TheaterResults(val location:Location){ data class Location(val address:Address){data class Address(val city:String)} }
```

### Nearest theaters (5–10 km from Central Park)

```kotlin
val coll = client.getDatabase("sample_mflix")
                 .getCollection<TheaterResults>("theaters")

val centralPark = Point(Position(-73.9667, 40.78))

val query = Filters.near(
    "location.geo",        // indexed 2dsphere field
    centralPark,
    10_000.0,              // max distance
    5_000.0                // min distance
)

val projection = Projections.fields(
    Projections.include("location.address.city"),
    Projections.excludeId()
)

coll.find(query).projection(projection).collect { println(it) }
```

### Theaters within polygon (Long Island triangle)

```kotlin
val longIsland = Polygon(listOf(
    Position(-72.0, 40.0),
    Position(-74.0, 41.0),
    Position(-72.0, 39.0),
    Position(-72.0, 40.0)
))

val geoWithin = Filters.geoWithin("location.geo", longIsland)

coll.find<TheaterResults>(geoWithin)
    .projection(projection)
    .collect { println(it) }
```

Result flows emit matching `TheaterResults`.

</section>
<section>
<title>Search Text</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/read-operations/text/</url>

# Text Search (Kotlin Coroutine Driver)

```kotlin
data class Movies(@BsonId val id: Int, val title: String, val tags: List<String>)
val collection: CoroutineCollection<Movies>
```

Setup text index once:  
```kotlin
collection.createIndex(Indexes.text("title"))
```

Run search with coroutine `find()`; pass BSON from `Filters.text()`.

```kotlin
val filter = Filters.text("<query>", TextSearchOptions().caseSensitive(bool?))
collection.find(filter).collect { println(it) }
```

Query syntax (string given to `Filters.text()`):

Term(s) (OR): `"fast"`, `"fate 7"`  
Phrase: `"\"fate of the furious\""` (escaped quotes)  
Exclude: `"furious -fast"` (must also include at least one non-excluded term)

Examples:

```kotlin
// term
Filters.text("fast")

// multiple terms
Filters.text("fate 7")

// phrase
Filters.text("\"fate of the furious\"")

// exclusion
Filters.text("furious -fast")
```

`TextSearchOptions` common flag: `.caseSensitive(true)`.

Driver returns matching docs plus relevance score (sortable).

</section>
<section>
<title>Write Operations</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/write-operations/</url>

# Write Operations
- Insert  
- Delete  
- Modify  
- Update array elements  
- Upsert (insert + update)  
- Bulk

</section>
<section>
<title>Insert Operations</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/write-operations/insert/</url>

# Insert Operations

MongoDB requires every document to have a unique `_id`. Omit it to let the driver auto-generate an `ObjectId`; duplicates raise `WriteError`.

## insertOne()

`suspend fun <T> CoroutineCollection<T>.insertOne(doc: T): InsertOneResult`

Returns `InsertOneResult.insertedId`.

```kotlin
val paintOrder = PaintOrder(qty = 5, color = "red") // _id autogenerated
val id = collection.insertOne(paintOrder).insertedId?.asObjectId()?.value
println("Inserted id: $id")
```

## insertMany()

`suspend fun <T> CoroutineCollection<T>.insertMany(docs: Iterable<T>): InsertManyResult`

Inserts sequentially until a failure. Successful inserts before an error are acknowledged in the thrown `MongoBulkWriteException`.

```kotlin
val paintOrders = listOf(
    PaintOrder(qty = 5,  color = "red"),
    PaintOrder(qty = 10, color = "purple"),
    PaintOrder(qty = 3,  color = "yellow"), // suppose duplicate _id -> error
    PaintOrder(qty = 8,  color = "blue")
)

try {
    val res = collection.insertMany(paintOrders)
    println("Ids: ${res.insertedIds.values}")
} catch (e: MongoBulkWriteException) {
    val okIds = e.writeResult.inserts.map { it.id }
    println("Partial success, ids: $okIds")
}
```

On success returns `InsertManyResult.insertedIds`.

## Summary

• `insertOne()` – single doc.  
• `insertMany()` – multiple docs, stops at first error.  
Both return inserted `_id`s and auto-generate one if absent.

</section>
<section>
<title>Delete Documents</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/write-operations/delete/</url>

# Delete Documents

Suspend functions in the Kotlin coroutine driver:

| Method | Effect | Extra Options |
| ------- | ------ | ------------- |
| `deleteOne(filter, opts?)` | Removes first match | `DeleteOptions` (collation, hint) |
| `deleteMany(filter, opts?)` | Removes all matches | `DeleteOptions` |
| `findOneAndDelete(filter, opts?)` | Atomically removes first match and returns it | `FindOneAndDeleteOptions` (collation, hint, sort, projection) |

Tip: When deleting a single doc, filter by a unique key (e.g. `_id`).

```kotlin
data class PaintOrder(@BsonId val id: Int, val qty: Int, val color: String)
val collection = database.getCollection<PaintOrder>("paint_inventory")
```

Delete all out-of-stock colors:

```kotlin
collection.deleteMany(Filters.eq("qty", 0))
```

Delete yellow paint:

```kotlin
collection.deleteOne(Filters.eq("color", "yellow"))
```

Find, return, and delete purple paint:

```kotlin
val removed = collection.findOneAndDelete(Filters.eq("color", "purple"))
println("deleted: $removed")
```

If no match, methods delete nothing; `findOneAndDelete` returns `null`.

</section>
<section>
<title>Modify Documents</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/write-operations/modify/</url>

# Modify Documents

`MongoCollection<T>.updateOne()`, `updateMany()`, and `replaceOne()` work with Kotlin coroutines identically to the sync API but return `UpdateResult`/`DeleteResult` suspend results.

```kotlin
data class PaintOrder(@BsonId val id: Int, val color: String, val qty: Int)
```

## Update

```
collection.updateOne(query, update [, UpdateOptions()])
collection.updateMany(query, update [, UpdateOptions()])
```

Params  
• `query` – Filters.* builder (e.g., `Filters.eq(PaintOrder::color.name,"yellow")`)  
• `update` – Updates.* builder (e.g., `Updates.inc(PaintOrder::qty.name,1)`)  
• `UpdateOptions` (opt) – e.g., `.sort(Sorts.ascending(PaintOrder::color.name))`, `.upsert(true)`

### updateOne example

```kotlin
val res = collection.updateOne(
    Filters.eq(PaintOrder::color.name, "yellow"),
    Updates.inc(PaintOrder::qty.name, 1)
)
println("${res.matchedCount} matched, ${res.modifiedCount} modified")
```

### updateMany example

```kotlin
val res = collection.updateMany(
    Filters.empty(),
    Updates.inc(PaintOrder::qty.name, 20)
)
```

If no docs match, nothing changes unless `upsert=true`. Updates fail on unique-index violations.

## Replace

```
collection.replaceOne(query, replacement [, ReplaceOptions()])
```

Params  
• `query` – filter for doc to replace  
• `replacement` – full POJO/Document; keeps original `_id`  
• `ReplaceOptions` (opt) – `.sort()`, `.upsert(true)`

### replaceOne example

```kotlin
val res = collection.replaceOne(
    Filters.eq(PaintOrder::color.name, "pink"),
    PaintOrder(5, "orange", 25)
)
```

Same unique-index and match-first semantics as updates.

</section>
<section>
<title>Update Arrays in a Document</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/write-operations/embedded-arrays/</url>

# Update Arrays

```json
{ "_id": 1, "color": "green", "qty": [8, 12, 18] }
```

```kotlin
data class PaintOrder(@BsonId val id: Int, val qty: List<Int>, val color: String)
val opts = FindOneAndUpdateOptions().returnDocument(ReturnDocument.AFTER)
```

### Add Element (`$push`)
```kotlin
collection.findOneAndUpdate(
    Filters.eq("_id", 1),
    Updates.push(PaintOrder::qty.name, 17),
    opts
)   // PaintOrder(id=1, qty=[8,12,18,17], color=green)
```

### First Match (`$`)
```kotlin
collection.findOneAndUpdate(
    Filters.eq(PaintOrder::qty.name, 18),
    Updates.inc("${PaintOrder::qty.name}.$", -3),
    opts
)   // PaintOrder(id=1, qty=[8,12,15], color=green)
```

### All Elements (`$[]`)
```kotlin
collection.findOneAndUpdate(
    Filters.eq("_id", 1),
    Updates.mul("${PaintOrder::qty.name}.$[]", 2),
    opts
)   // PaintOrder(id=1, qty=[16,24,36], color=green)
```

### Filtered Elements (`$[id]`)
```kotlin
collection.findOneAndUpdate(
    Filters.eq("_id", 1),
    Updates.inc("${PaintOrder::qty.name}.$[smaller]", 5),
    opts.arrayFilters(listOf(Filters.lt("smaller", 15)))
)   // PaintOrder(id=1, qty=[13,17,18], color=green)
```

Positional operators:  
`$` = first matched element  
`$[]` = all elements  
`$[id]` + `arrayFilters` = elements that satisfy filter.

</section>
<section>
<title>Insert or Update in a Single Operation</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/write-operations/upsert/</url>

# Upsert (insert-or-update)

MongoDB updates matching docs or inserts a new one when `upsert=true`.

• updateOne / updateMany → pass `UpdateOptions().upsert(true)`  
• replaceOne           → pass `ReplaceOptions().upsert(true)`

```kotlin
data class PaintOrder(
    @BsonId val id: ObjectId = ObjectId(),
    val qty: Int,
    val color: String
)

val filter  = Filters.eq(PaintOrder::color.name, "orange")
val update  = Updates.inc(PaintOrder::qty.name, 10)
val result  = collection.updateOne(filter, update, UpdateOptions().upsert(true))
println(result) // matched=0, modified=0, upsertedId=...
```

Without the option:

```kotlin
collection.updateOne(filter, update) // matched=0, upsertedId=null
```

Key APIs: `UpdateOptions.upsert()`, `ReplaceOptions.upsert()`.

</section>
<section>
<title>Bulk Operations</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/write-operations/bulk/</url>

# Bulk Operations (Kotlin Coroutine Driver)

## Collection-level `bulkWrite`

```kotlin
suspend fun MongoCollection<T>.bulkWrite(
    requests: List<WriteModel<T>>,
    opts: BulkWriteOptions = BulkWriteOptions()       // ordered(true) default
): BulkWriteResult
```

WriteModel subtypes  
• InsertOneModel(doc)  
• ReplaceOneModel(filter, replacement, opts?)  
• UpdateOneModel(filter, update, opts?)  
• UpdateManyModel(filter, update, opts?)  
• DeleteOneModel(filter)  
• DeleteManyModel(filter)

Rules  
• Ordered (default): stop on first error.  
• Unordered: `BulkWriteOptions().ordered(false)` – driver may reorder, runs all ops, reports errors at end.  
• Unique‐index conflicts → MongoBulkWriteException.  
• No matches ⇒ no change.

Example (ordered):

```kotlin
val ops = listOf(
  InsertOneModel(Person(6,"Zaynab",37)),
  ReplaceOneModel(Filters.eq("_id",1), Person(1,"Sandy", location="MT")),
  UpdateOneModel<Person>(Filters.eq("_id",6),
                          Updates.set(Person::name.name,"Zaynab Hassan")),
  DeleteManyModel<Person>(Filters.gt(Person::age.name,50))
)
collection.bulkWrite(ops)      // suspending
```

Example (unordered):

```kotlin
collection.bulkWrite(ops, BulkWriteOptions().ordered(false))
```

## Client-level `MongoClient.bulkWrite` (server ≥8.0)

Single RPC can target many namespaces.

```kotlin
suspend fun MongoClient.bulkWrite(
    reqs: List<ClientNamespacedWriteModel<*>>,
    opts: ClientBulkWriteOptions = ClientBulkWriteOptions()   // ordered(true)
)
```

Factory methods (in ClientNamespacedWriteModel):  
`insertOne(ns, doc)` `updateOne(ns, filter, upd, opts?)`  
`updateMany(ns, filter, upd, opts?)` `replaceOne(ns, filter, replacement, opts?)`  
`deleteOne(ns, filter, opts?)` `deleteMany(ns, filter, opts?)`

`MongoNamespace("db","coll")` identifies targets.

Unordered:

```kotlin
val ns = MongoNamespace("sample_db","people")
val opts = ClientBulkWriteOptions.clientBulkWriteOptions().ordered(false)

val ops = listOf(
  insertOne(ns, Person(2,"A")),
  insertOne(ns, Person(2,"B")),   // dup key
  insertOne(ns, Person(4,"C"))
)
client.bulkWrite(ops, opts)       // dup error reported, others succeed
```

Errors → ClientBulkWriteException; inspect `.writeErrors()`.

## Data Classes Used in Examples

```kotlin
data class Person(@BsonId val id:Int,
                  val name:String,
                  val age:Int?=null,
                  val location:String?=null)

data class Object(@BsonId val id:Int,
                  val type:String,
                  val category:String?=null,
                  val manufacturer:String?=null)
```

## Cheat-Sheet

- Collection bulk: list<WriteModel>; ordered/unordered; per-type server calls.  
- Client bulk (8.0+): list<ClientNamespacedWriteModel>; cross-db; single server call.  
- All APIs are suspend functions in the coroutine driver.  
- Handle duplicate key & other write errors via *(Mongo|Client)BulkWriteException*.

</section>
<section>
<title>Specify a Query</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/query-document/</url>

# Specify a Query

Use `org.mongodb.kotlin.driver.coroutine.Filters` with `collection.find(filter)` (returns `Flow<T>`). Collect results with coroutines.

```kotlin
data class PaintOrder(
    @BsonId val id: Int,
    val qty: Int,
    val color: String,
    val vendor: List<String>,
    val rating: Int? = null
)
```

Comparison  
```kotlin
collection.find(Filters.gt("qty", 7)).collect(::println)
```

Logical  
```kotlin
collection.find(
    Filters.and(Filters.lte("qty", 5), Filters.ne("color", "pink"))
).collect(::println)
```

Array  
```kotlin
collection.find(Filters.size("vendor", 3)).collect(::println)
```

Element  
```kotlin
collection.find(Filters.exists("rating")).collect(::println)
```

Evaluation (regex)  
```kotlin
collection.find(Filters.regex("color", "k$")).collect(::println)
```

Key operators:  
• Comparison – gt, gte, lt, lte, eq, ne  
• Logical – and, or, nor, not  
• Array – size, all, elemMatch  
• Element – exists, type  
• Evaluation – regex, expr, text

</section>
<section>
<title>Compound Operations</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/compound-operations/</url>

# Compound Operations

Atomic single-document read+write helpers:  

* `findOneAndUpdate`  
* `findOneAndReplace`  
* `findOneAndDelete`  

(For multi-doc atomicity use transactions.)

Each method returns the matched document (default: BEFORE the write).  
Change with `FindOneAnd*Options.returnDocument(ReturnDocument.AFTER)`.

--------------------------------------------------------------------
## Sample Model
```kotlin
data class FoodOrder(@BsonId val id: Int, val food: String, val color: String)
val collection = db.getCollection<FoodOrder>("orders")
```
Data:
```json
{"_id":1,"food":"donut","color":"green"}
{"_id":2,"food":"pear","color":"yellow"}
```

--------------------------------------------------------------------
## Find-and-Update
```kotlin
val res = collection.findOneAndUpdate(
    Filters.eq("color", "green"),
    Updates.set("food", "pizza"),
    FindOneAndUpdateOptions()
        .upsert(true)           // insert if missing
        .maxTime(5, TimeUnit.SECONDS)
)
println(res)   // FoodOrder(id=1, food=donut, color=green) or null if upserted
```

--------------------------------------------------------------------
## Find-and-Replace
```kotlin
data class Music(@BsonId val id:Int, val music:String, val color:String)

val replaced = collection.withDocumentClass<Music>()
    .findOneAndReplace(
        Filters.eq("color","green"),
        Music(1,"classical","green"),
        FindOneAndReplaceOptions()
            .returnDocument(ReturnDocument.AFTER)
)
println(replaced) // Music(id=1, music=classical, color=green)
```

--------------------------------------------------------------------
## Find-and-Delete
```kotlin
val deleted = collection.findOneAndDelete(
    Filters.empty(),
    FindOneAndDeleteOptions().sort(Sorts.descending("_id"))
)
println(deleted) // FoodOrder(id=2, food=pear, color=yellow)
```

--------------------------------------------------------------------
## Race-Condition Example

Room doc:
```json
{"_id":1,"guest":null,"room":"Blue Room","reserved":false}
```
Model:
```kotlin
data class HotelRoom(@BsonId val id:Int, val guest:String?=null,
                     val room:String, val reserved:Boolean=false)
val hotelCollection = db.getCollection<HotelRoom>("rooms")
```

### Unsafe (non-atomic)
```kotlin
suspend fun bookRoomUnsafe(guest:String){
    val room = hotelCollection.find(Filters.eq("reserved",false)).firstOrNull()
        ?: return println("Sorry, booked, $guest")
    println("You got the ${room.room}, $guest")
    hotelCollection.updateOne(
        Filters.eq("_id",room.id),
        Updates.combine(Updates.set("reserved",true),Updates.set("guest",guest))
    )
}
```
Concurrent calls may both print success; last update wins.

### Safe (atomic)
```kotlin
suspend fun bookRoomSafe(guest:String){
    val room = hotelCollection.findOneAndUpdate(
        Filters.eq("reserved",false),
        Updates.combine(Updates.set("reserved",true),Updates.set("guest",guest))
    )
    if(room==null) println("Sorry, booked, $guest")
    else           println("You got the ${room.room}, $guest")
}
```
`findOneAndUpdate` locks the doc for the operation, preventing the race.

--------------------------------------------------------------------
Refs: `Filters`, `Updates`, `Sorts`, `FindOneAnd*Options`, `ReturnDocument`, `MongoExecutionTimeoutException`.

</section>
<section>
<title>Builders</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/builders/</url>
<description>Explore how to use Kotlin driver builder classes for efficient CRUD operations and aggregation, enhancing error detection and code completion in your IDE.</description>


# Builders

Kotlin driver builders (Filters, Projections, Aggregates, Indexes, Sorts, Updates) generate BSON via typed APIs, giving compile-time checking & IDE autocompletion absent from string docs/shell code.

Example—fetch emails of female users older than 29:

```kotlin
data class User(
    @BsonId val id: BsonObjectId = BsonObjectId(),
    val gender: String, val age: Int, val email: String
)
data class Result(val email: String)

val filter = and(eq(User::gender.name, "female"), gt(User::age.name, 29))
val projection = fields(excludeId(), include("email"))

collection.find<Result>(filter).projection(projection)
```

(Imports: `com.mongodb.client.model.Filters.*`, `Projections.*`)

Builders shift errors like typos in "$gt" from runtime to compile-time and surface discoverable APIs in IDEs.

Available:
• Aggregates (incl. `vectorSearch`)
• Filters
• Indexes
• Projections
• Sorts
• Updates

See “Use Builders with Data Classes” for property-safe usage.

</section>
<section>
<title>Aggregates Builders</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/builders/aggregates/</url>

# Aggregation Builders (Kotlin Driver)

```kotlin
import com.mongodb.client.model.*
```

Use `Aggregates.*` (plus `Filters`, `Projections`, `Sorts`, `Accumulators`, …) to build BSON stages and pass them to `collection.aggregate(listOf(...))`.

---

### Core Stages

| Stage | Builder | Minimal Example |
|-------|---------|-----------------|
| `$match` | `match()` | `match(Filters.eq("title", "The Shawshank Redemption"))` |
| `$project` | `project()` | `project(Projections.include("title","plot"))`<br/>Computed: `project(Projections.computed("rating","\$rated"))` |
| `$documents` | `documents()` | `documents(listOf(Document("title","Steel Magnolias")))` (call `database.aggregate()` instead of `collection.aggregate()`) |
| `$sample` | `sample()` | `sample(5)` |
| `$sort` | `sort()` | `sort(Sorts.orderBy(Sorts.descending("year"),Sorts.ascending("title")))` |
| `$skip` | `skip()` | `skip(5)` |
| `$limit` | `limit()` | `limit(4)` |

---

### Join

```kotlin
// simple left-outer
lookup("comments", "_id", "movie_id", "joined_comments")

// correlated / sub-pipeline
val vars = listOf(Variable("order_item","\$item"), Variable("order_qty","\$ordered"))
lookup(
    "warehouses",
    vars,
    listOf(
        match(Filters.expr(Document("\$and",listOf(
            Document("\$eq",listOf("$$order_item","\$stockItem")),
            Document("\$gte",listOf("\$inStock","$$order_qty"))
        )))),
        project(Projections.exclude("customerId","stockItem","_id"))
    ),
    "stockData")
```

---

### `$group` + Accumulators

```kotlin
group("\$customerId",
    Accumulators.sum("totalQty","\$ordered"),
    Accumulators.avg("avgQty","\$ordered"))
```

Pick-n accumulators (MongoDB ≥5.2):

```kotlin
group("\$year",
    minN ("lowest3",  "\$imdb.rating",3),
    maxN ("highest2", "\$imdb.rating",2),
    firstN("first2",  "\$title",2),
    lastN ("last3",   "\$title",3),
    top   ("topMovie", Sorts.descending("imdb.rating"), listOf("\$title","\$imdb.rating")),
    topN  ("longest3", Sorts.descending("runtime"), listOf("\$title","\$runtime"),3),
    bottom("shortest", Sorts.ascending ("runtime"),  listOf("\$title","\$runtime")),
    bottomN("lowest2", Sorts.ascending ("imdb.rating"), listOf("\$title","\$imdb.rating"),2)
)
```

---

### Array

```kotlin
unwind("\$genres", UnwindOptions().includeArrayIndex("pos").preserveNullAndEmptyArrays(true))
```

---

### Write-out

```kotlin
out("classic_movies")                  // must be last stage
merge("nineties_movies")               // or:
merge(MongoNamespace("aggregation","movie_ratings"),
      MergeOptions().uniqueIdentifier(listOf("year","title"))
                   .whenMatched(MergeOptions.WhenMatched.REPLACE)
                   .whenNotMatched(MergeOptions.WhenNotMatched.INSERT))
```

---

### Graph, Count, Replace, Add

```kotlin
graphLookup("contacts","\$friends","friends","name","network",
            GraphLookupOptions().maxDepth(2).depthField("degrees")
                                 .restrictSearchWithMatch(Filters.eq("hobbies","golf")))

sortByCount("\$genres")
replaceRoot("\$spanishTranslation")
addFields(Field("watched",false), Field("type","movie"))
count("total")
```

---

### Bucket Helpers

```kotlin
bucket("\$screenSize", listOf(0,24,32,50,70),
       BucketOptions().defaultBucket("monster")
                      .output(sum("count",1), push("sizes","\$screenSize")))

bucketAuto("\$price",5,
    BucketAutoOptions().granularity(BucketGranularity.POWERSOF2)
                       .output(sum("count",1), avg("avgPrice","\$price")))
```

---

### `$facet`

```kotlin
facet(
  Facet("Sizes", bucketAuto("\$screenSize",5,BucketAutoOptions().output(sum("count",1)))),
  Facet("TopMakers", sortByCount("\$manufacturer"), limit(5))
)
```

---

### Window Functions (MongoDB ≥5.0)

```kotlin
val pastMonth = Windows.timeRange(-1, MongoTimeUnit.MONTH, Windows.Bound.CURRENT)
setWindowFields("\$localityId",
    Sorts.ascending("measurementDateTime"),
    WindowOutputFields.sum("monthlyRainfall","\$rainfall",pastMonth),
    WindowOutputFields.avg("monthlyAvgTemp","\$temperature",pastMonth))
```

---

### `$densify` (≥5.1)

```kotlin
densify("ts",
    DensifyRange.partitionRangeWithStep(15,MongoTimeUnit.MINUTE),
    DensifyOptions.densifyOptions().partitionByFields("position.coordinates"))
```

---

### `$fill` (≥5.3)

```kotlin
fill(
  FillOptions.fillOptions().sortBy(Sorts.ascending("hour")),
  FillOutputField.value("temperature","23.6C"),
  FillOutputField.linear("air_pressure"))
```

---

### Atlas Search (Atlas only)

```kotlin
// simple text search
search(SearchOperator.text(SearchPath.fieldPath("title"),"Future"),
       SearchOptions.searchOptions().index("title"))

// compound example
val searchStage = search(
    SearchOperator.compound().filter(listOf(
        SearchOperator.`in`   (SearchPath.fieldPath("genres"),listOf("Comedy")),
        SearchOperator.phrase (SearchPath.fieldPath("fullplot"),"new york"),
        SearchOperator.numberRange(SearchPath.fieldPath("year")).gtLt(1950,2000),
        SearchOperator.wildcard(SearchPath.fieldPath("title"),"Love *")
    ))
)
val pipeline = listOf(searchStage, project(Projections.include("title","year","genres")))
collection.aggregate<Results>(pipeline)
```

`searchMeta()` returns only metadata, e.g.:

```kotlin
searchMeta(SearchOperator.near(1985,2,SearchPath.fieldPath("year")), SearchOptions.searchOptions().index("year"))
```

Supported operator builders: `autocomplete`, `compound`, `equals`, `exists`, `in`, `moreLikeThis`, `near`, `phrase`, `queryString`, `range` (`numberRange`,`dateRange`), `regex`, `text`, `wildcard`.

---

15%-size compressed guide retaining essential Kotlin coroutine-driver aggregation syntax.

</section>
<section>
<title>Atlas Vector Search</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/builders/vector-search/</url>

# Atlas Vector Search

Use `Aggregates.vectorSearch()` to create a `$vectorSearch` aggregation stage (semantic search) in the Kotlin coroutine driver. Requires an Atlas vector search index on your embedding field.

```kotlin
data class MovieAlt(
    val title: String, val year: Int,
    val plot: String, val plotEmbedding: List<Double>
)

val stage = Aggregates.vectorSearch(
    SearchPath.fieldPath(MovieAlt::plotEmbedding.name),          // field to search
    BinaryVector.floatVector(                                     // query vector
        floatArrayOf(0.0001f, 1.12345f, 2.23456f, 3.34567f, 4.45678f)
    ),
    "mflix_movies_embedding_index",                               // index name
    1L,                                                           // top-k
    exactVectorSearchOptions()
        .filter(Filters.gte(MovieAlt::year.name, 2016))           // optional filter
)
```

Notes
- `BinaryVector` (float/byte) is more storage-efficient than `List<Double>`.
- Build index & store embeddings before querying.

Key APIs: `Aggregates.vectorSearch`, `FieldSearchPath`, `VectorSearchOptions`, `BinaryVector`.

</section>
<section>
<title>Filters Builders</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/builders/filters/</url>

# Filter Builders (Kotlin Coroutine Driver)

```kotlin
import com.mongodb.client.model.Filters.*   // static import
```

Use `Filters.*` to create BSON query predicates for:
* `find()`, `deleteOne/Many()`, `updateOne/Many()`
* `$match` pipeline stages.

Example model:

```kotlin
data class PaintOrder(
    @BsonId val id: Int,
    val qty: Int,
    val color: String,
    val vendors: List<String> = mutableListOf()
)
val results = collection.find(/* any filter */)        // returns Flow<PaintOrder>
```

---

## Comparison

`eq`, `gt`, `gte`, `lt`, `lte`, `ne`, `in`, `nin`, `empty`.

```kotlin
collection.find(eq(PaintOrder::qty.name, 5))
```

---

## Logical

`and`, `or`, `not`, `nor`.

```kotlin
collection.find(or(gt("qty", 8), eq("color", "pink")))
```

---

## Arrays

`all`, `elemMatch`, `size`.

```kotlin
collection.find(all("vendors", listOf("A","D")))
```

---

## Elements

`exists`, `type`.

```kotlin
collection.find(and(exists("qty"), nin("qty", 5, 8)))
```

---

## Evaluation

`mod`, `regex`, `text`, `where`.

```kotlin
collection.find(regex("color", "^p"))
```

---

## Bitwise

`bitsAllSet`, `bitsAllClear`, `bitsAnySet`, `bitsAnyClear`.

```kotlin
collection.find(bitsAllSet("decimalValue", 34L))   // 0010_0010
```

---

## Geospatial

`geoWithin`, `geoWithinBox`, `geoWithinPolygon`, `geoWithinCenter`,
`geoWithinCenterSphere`, `geoIntersects`, `near`, `nearSphere`.

```kotlin
val poly = Polygon(listOf(Position(0.0,0.0), Position(4.0,0.0),
                          Position(4.0,4.0), Position(0.0,4.0), Position(0.0,0.0)))
collection.find(geoWithin("coordinates", poly))
```

---

All `Filters.*` functions return a `Bson` that can be combined, nested, or passed wherever a query filter is accepted.

</section>
<section>
<title>Indexes Builders</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/builders/indexes/</url>

# Indexes Builders

Import all helpers  

```kotlin
import com.mongodb.client.model.Indexes.*
```

Call `collection.createIndex(<Bson>)`.

* Ascending:  
  ```kotlin
  ascending("name")             // -> name_1
  ```
* Descending:  
  ```kotlin
  descending("capacity")        // -> capacity_-1
  ```
* Compound:  
  ```kotlin
  compoundIndex(
      descending("capacity","year"),
      ascending("name")
  )                              // -> capacity_-1_year_-1_name_1
  ```
* Text:  
  ```kotlin
  text("theaters")              // -> theaters_text
  ```
* Hashed:  
  ```kotlin
  hashed("capacity")            // -> capacity_hashed
  ```
* 2dsphere:  
  ```kotlin
  geo2dsphere("location")       // -> location_2dsphere
  ```

</section>
<section>
<title>Projections Builders</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/builders/projections/</url>

# Projection Builders (Kotlin Coroutine Driver)

MongoDB field-projection rules  
• `_id` always returned unless `excludeId()` used  
• `include()` ⇒ other fields (except `_id`) excluded  
• `exclude()` removes only listed fields  

Import helpers  
```kotlin
import com.mongodb.client.model.Projections.*
```

Minimal sample model used below:  
```kotlin
data class YearlyTemperature(
    @BsonId val id: ObjectId,
    val year: Int,
    val type: String,
    val temperatures: List<MonthlyTemperature>
) {
    data class MonthlyTemperature(val month: String, val avg: Double)
}
val coll = database.getCollection<YearlyTemperature>("projection_builders")
```

## API Cheatsheet

| Builder            | Purpose / Sample |
|--------------------|------------------|
| `include(vararg fields)` | keep fields (plus `_id`)<br>`coll.find<Results>().projection(include("year"))` |
| `exclude(vararg fields)` | drop fields<br>`projection(exclude("temperatures"))` |
| `excludeId()`         | drop `_id` |
| `fields(vararg proj)` | combine builders<br>`fields(include("year"), excludeId())` |
| `elemMatch(arrayField, filter)` | after-query array match (returns 1st match)<br>`elemMatch("temperatures", gt("avg",10.1))` |
| `elemMatch(arrayField)` | positional proj when same array is in query filter |
| `slice(arrayField, limit)` | first `limit` elements |
| `slice(arrayField, skip, limit)` | skip / limit |
| `metaTextScore(alias)` | project text score |

## Concise Examples

### Include  
```kotlin
data class R(@BsonId val id:ObjectId, val year:Int)
coll.find<R>()
    .projection(include(YearlyTemperature::year.name))
    .collect { println(it) }   // id + year
```

### Exclude  
```kotlin
data class R(@BsonId val id:ObjectId, val year:Int, val type:String)
coll.find<R>()
    .projection(exclude("temperatures"))
```

### Combine / exclude `_id`  
```kotlin
data class R(val year:Int,val type:String)
coll.find<R>()
    .projection(fields(include("year","type"), excludeId()))
```

### elemMatch (filter inside projection)  
```kotlin
data class R(val year:Int, val temperatures:List<YearlyTemperature.MonthlyTemperature>?)
coll.find<R>()
    .projection(fields(
        include("year"),
        elemMatch("temperatures", gt("avg",10.1))
    ))
```

### elemMatch positional (query includes array condition)  
```kotlin
val q = gt("temperatures.avg",10.1)
coll.find<R>(q)
    .projection(fields(include("year"), elemMatch("temperatures")))
```

### slice  
```kotlin
// first 6 months
coll.find<YearlyTemperature>()
    .projection(fields(slice("temperatures",6), excludeId()))
// months 7-12
coll.find<YearlyTemperature>()
    .projection(fields(slice("temperatures",6,6), excludeId()))
```

### metaTextScore  
```kotlin
data class R(val year:Int,val score:Double)
coll.find<R>(Filters.text("even number"))
    .projection(fields(include("year"), metaTextScore("score")))
```

Notes  
• Builders work with Kotlin property references (`MyClass::field.name`).  
• All examples use coroutine `Flow` API (`collect { ... }`).

</section>
<section>
<title>Sorts Builders</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/builders/sort/</url>

# Sorts Builders

`org.mongodb.kotlin.coroutine.Sorts` ⇒ factory of `Bson` sort specs usable with  
`FindFlow.sort(bson)` or `Aggregates.sort(bson)`.

Main methods  
```kotlin
ascending(vararg field: String)      // A→Z, 0→9, oldest→newest
descending(vararg field: String)     // Z→A, 9→0, newest→oldest
orderBy(vararg sort: Bson)           // priority list, later ties break earlier ties
metaTextScore(field: String)         // score of text search results
```

Data class reference (requires extensions to use `::prop.name`):

```kotlin
data class Order(@BsonId val id: Int, val date: String, val orderTotal: Double)
val col: CoroutineCollection<Order>
```

Examples

Ascending:

```kotlin
col.find()
   .sort(Sorts.ascending(Order::orderTotal.name))
   .collect { println(it) }
```

Descending:

```kotlin
col.find()
   .sort(Sorts.descending(Order::orderTotal.name))
   .collect { println(it) }
```

Composite:

```kotlin
val spec = Sorts.orderBy(
    Sorts.descending(Order::date.name),
    Sorts.ascending(Order::orderTotal.name))
col.find().sort(spec).collect { println(it) }
```

Text score:

```kotlin
col.find(Filters.text("cake"))
   .projection(Projections.metaTextScore("score"))
   .sort(Sorts.metaTextScore("score"))
   .collect { println(it) }
```

All methods return immutable `Bson`.

</section>
<section>
<title>Updates Builders</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/builders/updates/</url>

# Update Builders (Kotlin Coroutine Driver)

```kotlin
// Optional static import
import com.mongodb.client.model.Updates.*

// Data model used in samples
data class PaintOrder(
    @BsonId val id: Int,
    val color: String,
    val qty: Int?,
    val vendor: List<Vendor>?,
    val lastModified: LocalDateTime?
)
data class Vendor(val name: String)
```

Core idea: build `Bson` update specs with `Updates.*` functions and pass to  
`collection.updateOne`, `updateMany`, `bulkWrite`, etc.  
Use data‐class property names (`PaintOrder::qty.name`) with Kotlin driver extensions.

---

## Field Operators

| Operator | Purpose | Sample |
|----------|---------|--------|
| set      | assign  | `set(PaintOrder::qty.name, 11)` |
| unset    | remove field | `unset(PaintOrder::qty.name)` |
| setOnInsert | assign on upsert | `setOnInsert(PaintOrder::color.name,"pink")` |
| inc      | += n | `inc(PaintOrder::qty.name,3)` |
| mul      | *= n | `mul(PaintOrder::qty.name,2)` |
| rename   | change key | `rename(PaintOrder::qty.name,"quantity")` |
| min/max  | clamp | `min(PaintOrder::qty.name,2)` / `max(...,8)` |
| currentDate | now as BSON date | `currentDate(PaintOrder::lastModified.name)` |
| currentTimestamp | now as BSON ts | `currentTimestamp(PaintOrder::lastModified.name)` |
| bitwiseOr/And/Xor | bit ops | `bitwiseOr(PaintOrder::qty.name,10)` |

---

## Array Operators

| Operator | Purpose | Sample |
|----------|---------|--------|
| addToSet | append if absent | `addToSet(PaintOrder::vendor.name, Vendor("C"))` |
| popFirst / popLast | remove first / last | `popFirst(PaintOrder::vendor.name)` |
| pullAll  | remove all listed | `pullAll(PaintOrder::vendor.name, listOf(Vendor("A"),Vendor("M")))` |
| pull     | remove matches  | `pull(PaintOrder::vendor.name, Vendor("D"))` |
| push     | append value | `push(PaintOrder::vendor.name, Vendor("Q"))` |

---

## Combine Operators

Chain multiple specs with `combine()`:

```kotlin
val filter = Filters.eq("_id", 1)
val update = combine(
    set(PaintOrder::color.name, "purple"),
    inc(PaintOrder::qty.name, 6),
    push(PaintOrder::vendor.name, Vendor("R"))
)
collection.updateOne(filter, update)
```

---

</section>
<section>
<title>Use Builders with Data Classes</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/builders/builders-data-classes/</url>

# Builders with Kotlin Data Classes

Add extensions  
```kotlin
// Gradle / Maven
implementation("org.mongodb:mongodb-driver-kotlin-extensions:5.5.0")
```
`import com.mongodb.kotlin.client.model.*`

---

## Sample Model
```kotlin
data class Student(
    val name: String,
    val teachers: List<String>,
    val gradeAverage: Double
)
```

---

## Filters
```kotlin
val s = Student("Sandra Nook", listOf("Alvarez","Gruber"), 85.7)

Student::name.eq(s.name)              // same as eq(Student::name, s.name)
Student::name eq s.name               // infix
Student::teachers.all(s.teachers)
Student::teachers all s.teachers
```

## Indexes
```kotlin
val asc  = Indexes.ascending(Student::name)
val desc = Indexes.descending(Student::teachers)
collection.createIndex(asc)
collection.createIndex(desc)
```

## Projections
```kotlin
val proj = fields(include(Student::name, Student::gradeAverage), excludeId())
collection.find().projection(proj)
```

## Sorts
```kotlin
val sort = orderBy(
    Sorts.descending(Student::gradeAverage),
    Sorts.ascending(Student::name)
)
collection.find().sort(sort)
```

## Updates
```kotlin
val filter = Student::gradeAverage gte 85.0
val update = combine(
    addToSet(Student::teachers, "Soto"),
    Student::gradeAverage.max(90.0)
)
collection.updateMany(filter, update)
```

## Aggregation
```kotlin
data class Summary(val average: Double)

val pipeline = listOf(
    sort(Sorts.descending(Student::gradeAverage)),
    limit(3),
    group(null, avg(Summary::average, "$${Student::gradeAverage.name}"))
)

val result = collection.aggregate<Summary>(pipeline)
```

</section>
<section>
<title>Aggregation</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/aggregation/</url>
<description>Learn to use aggregation operations in the MongoDB Kotlin driver to process data and return computed results using the aggregation pipeline.</description>


# Aggregation

MongoDB’s aggregation pipeline = ordered stages transforming documents.  
Compared with `find`, aggregation can also rename, calculate, group, summarize.  
Limits: 16 MB doc, 100 MB per stage (disk use optional, except `$graphLookup`).

```kotlin
data class Restaurant(
    val name: String,
    val contact: Contact,
    val stars: Int,
    val categories: List<String>
) {
    data class Contact(val phone: String, val email: String, val location: List<Double>)
}
```

## Basic usage

```kotlin
data class Results(@BsonId val id: Int, val count: Int)

val flow = collection.aggregate<Results>(
    listOf(
        Aggregates.match(Filters.eq(Restaurant::categories.name, "Bakery")),
        Aggregates.group(
            "\$${Restaurant::stars.name}",        // group key = stars
            Accumulators.sum("count", 1)          // count per group
        )
    )
)
flow.collect { println(it) }   // Results(id=4, count=2) ...
```

## Explain plans

`AggregateFlow.explain(verbosity)` returns execution stats.

Verbosity enum:  
• QUERY_PLANNER – detailed plan diagnostics  
• EXECUTION_STATS – performance check  
• ALL_PLANS_EXECUTIONS – compare candidate plans

```kotlin
val plan = collection.aggregate<Results>(
        listOf(
            Aggregates.match(Filters.eq(Restaurant::categories.name, "bakery")),
            Aggregates.group("\$${Restaurant::stars.name}", Accumulators.sum("count", 1))
        )
    ).explain(ExplainVerbosity.EXECUTION_STATS)

println(plan.toJson(JsonWriterSettings.builder().indent(true).build()))
```

## Expressions

Driver has builders for accumulator expressions; other expressions supplied as `Document`.

```kotlin
Document("\$arrayElemAt", listOf("\$categories", 0))
// same as
Document.parse("{ \$arrayElemAt: ['\$categories', 0] }")
```

### `$project` example with computed field

```kotlin
data class FirstCat(val name: String, val firstCategory: String)

val flow = collection.aggregate<FirstCat>(
    listOf(
        Aggregates.project(
            Projections.fields(
                Projections.excludeId(),
                Projections.include("name"),
                Projections.computed(
                    "firstCategory",
                    Document("\$arrayElemAt", listOf("\$categories", 0))
                )
            )
        )
    )
)
flow.collect { println(it) }   // FirstCat(name=..., firstCategory=...)
```

## API links (Kotlin coroutine driver)

MongoCollection.aggregate • Aggregates.match/group • Accumulators • Projections • AggregateFlow.explain • ExplainVerbosity

</section>
<section>
<title>Aggregation Expression Operations</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/aggregation-expression-operations/</url>
<description>Learn to use the MongoDB Kotlin Driver for constructing aggregation expressions with typesafe Java methods, enhancing readability and functionality.</description>


# Aggregation Expression Operations

## Quick Start
```kotlin
import com.mongodb.client.model.*
import com.mongodb.client.model.mql.MqlValues.*

// reference doc & value
current().getString("name")
of(1.0)
```
Chain methods to build type-safe pipeline expressions:
```kotlin
current().getArray("visitDates").size().gt(of(0))
  .and(current().getString("state").eq(of("New Mexico")))
```
Embed the resulting `TExpression` in stages:
```kotlin
match(expr(<expr>)); project(fields(computed("f", <expr>))); group(<expr>)
```

## Constructors
* current()/currentAsMap()
* of(<primitive|MqlDocument>)
* ofArray()/ofBooleanArray()/…  
* ofEntry(), ofMap(), ofNull()

## Operation Catalog  
(→ MongoDB operator)

### Arithmetic (`MqlInteger|MqlNumber`)
abs→$abs, add→$add, divide→$divide, multiply→$multiply, round→$round, subtract→$subtract

```kotlin
val month = current().getDate("date").month(of("UTC"))
val precip = current().getInteger("precipitation")
listOf(Aggregates.group(month, Accumulators.avg("avgPrecipMM", precip.multiply(25.4))))
```

### Arrays (`MqlArray`)
all→$allElementsTrue, any→$anyElementTrue, concat/concatArrays→$concatArrays, contains→$in,  
distinct/union/unionArrays→$setUnion, elementAt→$arrayElemAt, filter→$filter, first/last→$first/$last,  
joinStrings→$concat, map→$map, max/maxN/min/minN→$max/$maxN/$min/$minN, size→$size, slice→$slice, sum→$sum

```kotlin
val showtimes = current().getArray<MqlDocument>("showtimes")
listOf(
  project(fields(computed("availableShowtimes", showtimes.filter { s ->
    val seats = s.getArray<MqlInteger>("seats"); val seatsTotal = seats.sum { it }
    s.getInteger("ticketsBought").lt(seatsTotal)
  })))
)
```

### Booleans (`MqlBoolean`)
and→$and, not→$not, or→$or
```kotlin
val t = current().getInteger("temperature")
project(fields(computed("extremeTemp", t.lt(10).or(t.gt(95)))))
```

### Comparison (any `MqlValue`)
eq→$eq, gt/gte→$gt/$gte, lt/lte→$lt/$lte, ne→$ne, max/min→$max/$min

```kotlin
match(expr(current().getString("location").eq("California")))
```

### Conditionals
cond→$cond, switchOn / switch{Type}On→$switch
```kotlin
val m = current().getField("member")
project(fields(computed("membershipLevel",
  m.switchOn{ it.isString{ s->s}.isBoolean{b->b.cond("Gold","Guest")}
                 .isArray{a->a.last()}.defaults{ "Guest" } })))
```

### Convenience
pass{Type}To() – pipe value into custom Kotlin functions (no server op)

### Conversions
asDocument, asMap (client-side wrappers); asString(date)→$dateToString; asString(value)→$toString;  
millisecondsAsDate→$toDate; parseDate→$dateFromString; parseInteger→$toInt

```kotlin
addFields(Field("reunionYear", current().getString("graduationYear").parseInteger().add(5)))
```

### Dates (`MqlDate`)
dayOfMonth/Week/Year, hour, millisecond, minute, month, second, week, year → $dayOfMonth … $year

```kotlin
match(expr(current().getString("deliveryDate")
  .parseDate().dayOfWeek(of("America/New_York")).eq(2)))
```

### Documents (`MqlDocument`)
get{Type}() → $getField, hasField (client), merge→$mergeObjects, setField→$setField, unsetField→$unsetField
```kotlin
val addr = current().getDocument("mailing.address")
match(expr(addr.getString("state").eq("WA")))
```

### Maps (`MqlMap` / `MqlEntry`)
entries→$objectToArray, get/has/set/merge/… (client helpers)
```kotlin
val warehouses = current().getMap<MqlNumber>("warehouses")
project(fields(computed("totalInventory", warehouses.entries().sum { it.getValue() })))
```

### Strings (`MqlString`)
append→$concat, length/lengthBytes→$strLenCP/$strLenBytes, substr/substrBytes→$substrCP/$substrBytes,  
toLower→$toLower, toUpper→$toUpper
```kotlin
val ln = current().getString("lastName"); val id = current().getString("employeeID")
project(fields(computed("username", ln.append(id).toLower())))
```

### Type Checks (`MqlValue`)
isArrayOr, isBooleanOr, isDateOr, isDocumentOr, isIntegerOr, isMapOr, isNumberOr, isStringOr  
(Returns value if type matches, else provided default.)
```kotlin
project(fields(computed("numericalRating", current().getField("rating").isNumberOr(1))))
```

_Unsupported server operators require manual BSON `Document` construction._

</section>
<section>
<title>Indexes</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/indexes/</url>
<description>Learn to create and manage indexes using the MongoDB Kotlin Driver to optimize query performance and support various query types.</description>


# Indexes

Efficient queries require indexes. Use the coroutine Kotlin driver’s `createIndex`, `dropIndex`, etc. to manage them.

```kotlin
val r = collection.createIndex(Indexes.ascending("field"))
```

---

## Core API

```kotlin
createIndex(keys[, opts])
dropIndex(keysOrName)
dropIndexes()               // all
listIndexes()               // Flow<BsonDocument>
```

`Indexes` helpers: `ascending`, `descending`, `compoundIndex`, `geo2dsphere`, `text`, etc.  
`IndexOptions` for `unique`, TTL, etc.

---

## Single / Compound

```kotlin
movies.createIndex(Indexes.ascending(Movie::title.name))             // title_1
movies.createIndex(Indexes.ascending(Movie::type.name,
                                     Movie::rated.name))             // type_1_rated_1
```

Query is covered when filter, projection, and sort use only indexed fields.

---

## Multikey (arrays)

```kotlin
movies.createIndex(Indexes.ascending("rated","genres","title"))
```

---

## Text

One text index per collection.

```kotlin
movies.createIndex(Indexes.text("plot"))                             // plot_text
movies.createIndex(
    Indexes.compoundIndex(Indexes.text("title"), Indexes.text("genres"))
)
val res = movies.find<Res>(Filters.text("Batman"))
```

---

## Geospatial 2dsphere

```kotlin
theaters.createIndex(Indexes.geo2dsphere("location.geo"))
val near = Filters.near("location.geo", Point(Position(-73.98,40.76)), 1000.0, 0.0)
theaters.find(near)
```

---

## Unique

```kotlin
theaters.createIndex(
    Indexes.descending("theaterId"),
    IndexOptions().unique(true)
)
```

Duplicate inserts raise `DuplicateKeyException`.

---

## Clustered

Create at collection creation:

```kotlin
val clustered = ClusteredIndexOptions(Document("_id",1), true)
db.createCollection("vendors", CreateCollectionOptions().clusteredIndexOptions(clustered))
```

---

## Atlas Search / Vector Search

Collection methods (all suspend):

```kotlin
createSearchIndex(name, definition)                  // Search only
createSearchIndexes(list<SearchIndexModel>)          // Search or Vector
listSearchIndexes(): Flow<Document>
updateSearchIndex(name, definition)
dropSearchIndex(name)
```

Example:

```kotlin
val searchIdx = Document("mappings", Document("dynamic", true))
movies.createSearchIndex("myIndex", searchIdx)

val vsModel = SearchIndexModel(
    "vsIdx",
    Document("fields", listOf(
        Document("type","vector")
            .append("path","embeddings")
            .append("numDimensions",1536)
            .append("similarity","dotProduct")
    )),
    SearchIndexType.vectorSearch()
)
movies.createSearchIndexes(listOf(vsModel))
```

---

## Drop indexes

```kotlin
movies.dropIndex(Indexes.ascending("title")) // by spec
movies.dropIndex("title_text")               // by name
movies.dropIndexes()                         // all
```

</section>
<section>
<title>Transactions</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/transactions/</url>

# Transactions

Kotlin driver uses MongoDB multi-operation ACID transactions via `ClientSession`.

• Create session:  
```kotlin
val session = client.startSession()   // MUST use same MongoClient
```

• Session ops:  
```kotlin
session.startTransaction()                 // or startTransaction(opts)
session.commitTransaction()
session.abortTransaction()
```
(`startTransaction` fails if one already active; `commit/abort` fail when no active txn.)

• Execution-time limits configurable via standard server-side options.

Example transfer:
```kotlin
data class Account(val accountId: String, val amount: Int)

val session = client.startSession()
try {
    session.startTransaction()
    val savings = db.getCollection<Account>("savings_accounts")
    val checking = db.getCollection<Account>("checking_accounts")

    savings.findOneAndUpdate(session, eq("accountId", "9876"), inc("amount", -100))
    checking.findOneAndUpdate(session, eq("accountId", "9876"), inc("amount", 100))

    session.commitTransaction()
    println("Transaction committed.")
} catch (e: Exception) {
    session.abortTransaction()
    println("Transaction aborted: ${e.message}")
}
```

Notes  
• No parallel operations in one transaction.  
• Server ≥8.0 + bulk writes ⇒ modify multiple namespaces inside one txn.

API refs: `ClientSession`, `startTransaction`, `commitTransaction`, `abortTransaction`.

</section>
<section>
<title>Collations</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/collations/</url>
<description>Learn how to use collations in MongoDB to order query results by string values, including specifying collations for collections, indexes, and operations.</description>


# Collations

MongoDB’s default binary collation orders strings by ASCII. Locale collations (e.g., `de@collation=phonebook`) change compare/sort rules. Collations can be set on a collection, index, or per-operation.

```json
{ "_id":1, "firstName":"Klara" }
{ "_id":2, "firstName":"Gunter" }
{ "_id":3, "firstName":"Günter"}
{ "_id":4, "firstName":"Jürgen"}
{ "_id":5, "firstName":"Hannah"}
```

```kotlin
data class FirstName(@BsonId val id:Int, val firstName:String, val verified:Boolean=false)
```

## Specify

Locale string: `"<locale>@collation=<variant>"`, e.g. `"de@collation=phonebook"`. Omit variant if unused.  

Non-supported index types: `text`, `2d`, `geoHaystack`.

## Collection Default

```kotlin
database.createCollection(
    "names",
    CreateCollectionOptions().collation(Collation.builder().locale("en_US").build())
)
```

## Index Collation

```kotlin
val idxOpts = IndexOptions()
    .collation(Collation.builder().locale("en_US").build())

collection.createIndex(
    Indexes.ascending(FirstName::firstName.name), idxOpts
)
```

Query using that index:

```kotlin
collection.find()
    .collation(Collation.builder().locale("en_US").build())
    .sort(Sorts.ascending(FirstName::firstName.name))
```

## Per-Operation Override

```kotlin
collection.find()
    .collation(Collation.builder().locale("is").build())      // not indexed
    .sort(Sorts.ascending(FirstName::firstName.name))
```

## Collation Options (Collation.Builder)

`locale` (req) | `strength` | `caseLevel` | `caseFirst` | `alternate` |  
`maxVariable` | `numericOrdering` | `normalization` | `backwards`

```kotlin
Collation.builder()
    .locale("en_US")
    .caseLevel(true)
    .collationAlternate(CollationAlternate.SHIFTED)
    .collationCaseFirst(CollationCaseFirst.UPPER)
    .collationMaxVariable(CollationMaxVariable.SPACE)
    .collationStrength(CollationStrength.SECONDARY)
    .numericOrdering(true)
    .normalization(false)
    .build()
```

## Examples

### find + sort

German phone-book ordering (umlauts before base letter):

```kotlin
val results = collection.find()
    .collation(Collation.builder().locale("de@collation=phonebook").build())
    .sort(Sorts.ascending(FirstName::firstName.name))

results.collect { println(it) }
```

Output:

```
FirstName(id=3, firstName=Günter, verified=false)
FirstName(id=2, firstName=Gunter, verified=false)
FirstName(id=5, firstName=Hannah, verified=false)
FirstName(id=4, firstName=Jürgen, verified=false)
FirstName(id=1, firstName=Klara, verified=false)
```

### findOneAndUpdate

```kotlin
val updated = collection.findOneAndUpdate(
    Filters.lt(FirstName::firstName.name, "Gunter"),
    Updates.set("verified", true),
    FindOneAndUpdateOptions()
        .collation(Collation.builder().locale("de@collation=phonebook").build())
        .sort(Sorts.ascending(FirstName::firstName.name))
        .returnDocument(ReturnDocument.AFTER)
)
println(updated)   // FirstName(id=3, firstName=Günter, verified=true)
```

### findOneAndDelete with Numeric Ordering

```kotlin
data class CollationExample(@BsonId val id:Int, val a:String)

val deleted = collection.findOneAndDelete(
    Filters.gt(CollationExample::a.name, "100"),
    FindOneAndDeleteOptions()
        .collation(Collation.builder().locale("en").numericOrdering(true).build())
        .sort(Sorts.ascending(CollationExample::a.name))
)
println(deleted)   // CollationExample(id=3, a=179 bananas)
```

### Aggregation

```kotlin
data class Result(@BsonId val id:String, val nameCount:Int)

val pipeline = listOf(
    Aggregates.group("\$${FirstName::firstName.name}", Accumulators.sum("nameCount", 1)),
    Aggregates.sort(Sorts.ascending("_id"))
)

collection.aggregate<Result>(pipeline)
    .collation(
        Collation.builder()
            .locale("de")
            .collationStrength(CollationStrength.PRIMARY) // ignore accents
            .build()
    )
    .collect { println(it) }
```

Result:

```
Result(id=Gunter, nameCount=2)
Result(id=Hannah, nameCount=1)
Result(id=Jürgen, nameCount=1)
Result(id=Klara, nameCount=1)
```

</section>
<section>
<title>Logging</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/logging/</url>
<description>Learn how to set up and configure logging in the MongoDB Kotlin driver using SLF4J, including setting log levels and logger names.</description>


# Logging

MongoDB Kotlin driver logs via SLF4J.  
If `slf4j-api` is missing, driver logs once with `java.util.logging` then disables logging.

## Enable Logging

Add **one** binding that transitively pulls `slf4j-api` + framework.

### Logback

```kotlin
// build.gradle.kts
dependencies { implementation("ch.qos.logback:logback-classic:1.2.11") }
```

### Log4j2

```kotlin
dependencies { implementation("org.apache.logging.log4j:log4j-slf4j-impl:2.17.1") }
```

## Basic Use

```kotlin
val mongoClient = MongoClient.create("<connection string>")
mongoClient.getDatabase("db").getCollection<Document>("col").find().firstOrNull()
```

Default log levels  
• Logback: DEBUG  
• Log4j2: ERROR

## Configure Log Level

### Logback (`logback.xml`)

```xml
<configuration>
  <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
    <encoder><pattern>%-4relative [%thread] %-5level %logger - %msg%n</pattern></encoder>
  </appender>
  <root level="INFO"><appender-ref ref="CONSOLE"/></root>
</configuration>
```

### Log4j2 (`log4j2.xml`)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Configuration>
  <Appenders>
    <Console name="Console"><PatternLayout pattern="%d{HH:mm:ss} [%t] %-5level %logger - %msg%n"/></Console>
  </Appenders>
  <Loggers>
    <Root level="INFO"><AppenderRef ref="Console"/></Root>
  </Loggers>
</Configuration>
```

## Driver Logger Names

```
org.mongodb.driver.authenticator
org.mongodb.driver.client
org.mongodb.driver.cluster
org.mongodb.driver.connection
org.mongodb.driver.connection.tls
org.mongodb.driver.operation
org.mongodb.driver.protocol
org.mongodb.driver.uri
org.mongodb.driver.management
```

## Example: Only Connection Logs

### Logback

```xml
<configuration>
  <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender"/>
  <logger name="org.mongodb.driver.connection" level="INFO"/>
  <root level="OFF"><appender-ref ref="CONSOLE"/></root>
</configuration>
```

### Log4j2

```xml
<Configuration>
  <Appenders><Console name="Console"/></Appenders>
  <Loggers>
    <Logger name="org.mongodb.driver.connection" level="INFO"/>
    <Root level="OFF"><AppenderRef ref="Console"/></Root>
  </Loggers>
</Configuration>
```

Use logger hierarchy as usual:

```kotlin
val parent = LoggerFactory.getLogger("parent")
val child  = LoggerFactory.getLogger("parent.child")
```

</section>
<section>
<title>Monitoring</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/monitoring/</url>
<description>Learn how to set up and configure monitoring in the MongoDB Kotlin driver to track resource usage and performance.</description>


# Monitoring (Kotlin Driver)

```kotlin
// Common imports
import com.mongodb.kotlin.client.*   // pseudo
import com.mongodb.event.*           // listeners
```

## Registering Listeners

Add listeners through `MongoClientSettings` then build `MongoClient`.

```kotlin
val settings = MongoClientSettings.builder()
    .applyConnectionString(URI)
    .addCommandListener(cmdListener)                // Command
    .applyToClusterSettings { it.addClusterListener(sdam) }          // SDAM
    .applyToConnectionPoolSettings { it.addConnectionPoolListener(cp) } // Pool
    .build()
val client = MongoClient.create(settings)
```

---

## Command Events

Implement `CommandListener`.

```kotlin
class CommandCounter : CommandListener {
    private val map = mutableMapOf<String, Int>()
    @Synchronized
    override fun commandSucceeded(e: CommandSucceededEvent) {
        map[e.commandName] = (map[e.commandName] ?: 0) + 1
        println(map)
    }
    override fun commandFailed(e: CommandFailedEvent) =
        println("Failed ${e.commandName} id=${e.requestId}")
}
```

Driver omits internal commands (`hello`, monitoring, etc.) and redacts sensitive ones.

---

## SDAM (Server Discovery & Monitoring)

Nine events in 3 interfaces:

* `ClusterListener` – topology
* `ServerListener` – server state
* `ServerMonitorListener` – heartbeats

Example:

```kotlin
class IsWritable : ClusterListener {
    private var writable = false
    @Synchronized
    override fun clusterDescriptionChanged(e: ClusterDescriptionChangedEvent) {
        val now = e.newDescription.hasWritableServer()
        if (now != writable) {
            writable = now
            println(if (writable) "Able to write to cluster" else "Unable to write")
        }
    }
}
```

---

## Connection Pool Events

Implement `ConnectionPoolListener`.

```kotlin
class ConnectionPoolLibrarian : ConnectionPoolListener {
    override fun connectionCheckedOut(e: ConnectionCheckedOutEvent) =
        println("Connection ${e.connectionId.localValue} checked out")
    override fun connectionCheckOutFailed(e: ConnectionCheckOutFailedEvent) =
        println("Checkout failed")
}
```

---

## JMX Connection-Pool Monitoring

Enable via `JMXConnectionPoolListener()`.

```kotlin
val settings = MongoClientSettings.builder()
    .applyConnectionString(URI)
    .applyToConnectionPoolSettings { it.addConnectionPoolListener(JMXConnectionPoolListener()) }
    .build()
val client = MongoClient.create(settings)
println("Open JConsole -> MBeans -> org.mongodb.driver")
Thread.sleep(Long.MAX_VALUE)
```

Each pool exposes an MXBean named `org.mongodb.driver:type=ConnectionPool,clusterId=...,host=...,port=...` with attrs: `minSize,maxSize,size,checkedOutCount`.

---

## Distributed Tracing

Use a `CommandListener` to create/finish spans. In Spring Cloud apps, include Spring Cloud Sleuth (Zipkin). Otherwise, replicate `TraceMongoCommandListener` logic.

---

API refs: `MongoClient`, `MongoClientSettings`, `CommandListener`, `ClusterListener`, `ServerListener`, `ServerMonitorListener`, `ConnectionPoolListener`, `JMXConnectionPoolListener`, event classes.

</section>
<section>
<title>Time Series Collections</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/time-series/</url>
<description>Learn how to create and query time series collections using the MongoDB Kotlin driver, including setting up collection options and using window functions for data aggregation.</description>


# Time Series Collections

Time series data = measurement + metadata + timestamp  
(Ex: revenue by company, infections by location)

## Create

```kotlin
val db = client.getDatabase("fall_weather")
val opts = CreateCollectionOptions()
    .timeSeriesOptions(TimeSeriesOptions("temperature"))
db.createCollection("september2021", opts)
```

Verify:

```kotlin
val spec = db.listCollections()
    .toList()
    .first { it["name"] == "september2021" }
println(spec.toJson(JsonWriterSettings.builder().indent(true).build()))
```

Result type: `"timeseries"`.

(MongoDB ≥5.0 required.)

## Query

Read/aggregate like normal collections; MongoDB 5.0 adds window functions for time-series pipelines (see Aggregates guide).

</section>
<section>
<title>In-Use Encryption</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/encrypt-fields/</url>

# In-Use Encryption (Kotlin Coroutine Driver)

- Requires `mongodb-crypt` v5.5.0.

```xml
<!-- Maven -->
<dependency>
  <groupId>org.mongodb</groupId>
  <artifactId>mongodb-crypt</artifactId>
  <version>5.5.0</version>
</dependency>
```

```groovy
// Gradle
implementation("org.mongodb:mongodb-crypt:5.5.0")
```

Encrypt/decrypt selected fields client-side, keeping ciphertext in MongoDB; only apps with the keys see plaintext.

Use cases: PII, credit cards, health, financial data.

Encryption modes  
• Queryable Encryption (QE) – GA in Server 7.0 (6.0 preview incompatible); unique ciphertext, supports equality search on all encrypted fields.  
• Client-side Field Level Encryption (CSFLE) – since 4.2; deterministic (queryable, same ciphertext → frequency-analysis risk) or random (non-queryable) algorithms. QE fixes algorithm choice but keeps queryability for every field.

</section>
<section>
<title>API Documentation</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/api-documentation/</url>
<description>Explore the API documentation for Kotlin, including BSON serialization, driver extensions, core functionality, and coroutine and sync drivers.</description>


# API Docs

- Coroutine Driver: coroutine-based API.  
- BSON kotlinx.serialization: encode/decode Kotlin data classes ↔ BSON.  
- Extensions: builder helpers for data classes.  
- Core: essential driver functions.

</section>
<section>
<title>FAQ</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/faq/</url>
<description>Find answers to common questions about the Kotlin driver, including connection issues, differences from KMongo, and connection pooling.</description>


# FAQ

### Connection Issues  
See Connection Troubleshooting Guide.

### Kotlin Driver vs KMongo  
• Official driver (wraps Java driver), co-authored with KMongo creator; KMongo now deprecated.  
• Both: sync & coroutine APIs, Kotlin data classes, kotlinx-serialization, CRUD/Aggregation.  
• Official driver omits reactor, rxjava2, Jackson, GSON, and shell commands.  
See “Migrate from KMongo”.

### Connection Pooling  
Per‐`MongoClient` per‐server pool.  
Defaults:  
```text
maxPoolSize=100      // max in-use + idle per server
maxConnecting=2      // max concurrent creations
minPoolSize=0        // pre-opened sockets
maxIdleTimeMS=0      // no idle limit
waitQueueTimeoutMS=120_000 // thread wait before error
```
Extra 2 monitor sockets per server.  
Replica set example: only primary used ⇒ ≤106 conns; use all nodes ⇒ ≤306.  
If pool full, threads wait until a connection is freed or built (<maxConnecting).  
Create one `MongoClient` per process and reuse:

```kotlin
val client = MongoClient("<connection string>")
```

On `client.close()`, idle sockets drop immediately; in-use sockets close on return.

</section>
<section>
<title>Connection Troubleshooting</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/connection-troubleshooting/</url>
<description>Troubleshoot connection issues with the MongoDB Kotlin Driver by checking connection strings, configuring firewalls, and verifying authentication settings.</description>


# Connection Troubleshooting

### Connection Failure  
Error: `couldn't connect to server <host>:<port>`  
• Verify URI host/port (default 27017).  
• Ensure firewall opens that port.

### AuthenticationFailed (18)  
• URI must include correct `user:pass@`, percent-encode `: / ? # [ ] @`.  
• List every replica-set host, comma-separated.  
• User must exist in auth DB (`admin` by default); override with `authSource`:

```kotlin
MongoClient.create(
  "mongodb://user:pass@host:27017/?authSource=users")
```

### MongoSocketWriteException: Exception sending message  
• Same checks as above.  
• Connection pool may be full (`maxPoolSize`, default 100); if wait > `maxIdleTimeMS`, error is thrown.

### Timeouts  
Errors like:  
`Timed out after … ReadPreferenceServerSelector` or `No server chosen …`  
Fixes:  
• Increase `maxConnectionTimeoutMS` (default 10000 ms, 0 = infinite).  
• Tune `maxConnectionLifeTime` / `maxConnectionIdleTime`.  
• Lower simultaneous connections or raise `maxPoolSize`.

### TLS/SSL Debugging  
Add JVM flag `-Djavax.net.debug=all` for verbose handshake logs.

</section>
<section>
<title>Issues & Help</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/issues-and-help/</url>
<description>Find support for the Kotlin driver through the MongoDB Community Forums, report issues via Jira, or contribute improvements with pull requests.</description>


# Issues & Help

• Ask usage questions in MongoDB Community Forums.  
• Report driver bugs/feature requests:  
  – MongoDB Feedback Engine → Drivers.  
  – Jira project `JAVA` (public). Sign up → Create ticket with details.  
• Security issues: follow "Create a Vulnerability Report".

## Contributing

1. Fork/clone repo  
```bash
git clone https://github.com/mongodb/mongo-java-driver.git
cd mongo-java-driver
git checkout -b myNewFeature
```
2. Add docs & tests.  
3. Ensure build passes:  
```bash
./gradlew check
```

</section>
<section>
<title>Compatibility</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/compatibility/</url>
<description>Check the recommended versions of the MongoDB Kotlin Driver for compatibility with specific MongoDB and Kotlin versions.</description>


# Compatibility

Legend: ✓ full support, ⊛ works, lacks newest features, ✗ unsupported.

MongoDB → Kotlin Driver  
• v5.5  ✓ 8.0–4.2  
• v5.2-5.4 ✓ 8.0–4.0  
• v4.10-5.1 ⊛ 8.0 | ✓ 7.0–3.6  

Language: Driver 4.10-5.5 ✓ with Kotlin 1.8.

MongoDB guarantees driver compatibility for 3 years past each server version’s EOL.

</section>
<section>
<title>Migrate from KMongo</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/migrate-kmongo/</url>
<description>Learn how to migrate your application from KMongo to the official MongoDB Kotlin driver.</description>


# Migrate from KMongo

## 1. Drivers

| Feature | Kotlin Driver (official) | KMongo (deprecated) |
|---------|-------------------------|---------------------|
| Basis   | Native Kotlin layer on top of Java driver | Thin Kotlin wrapper around Java driver |
| Async   | Coroutines only (`com.mongodb.kotlin.client.coroutine`) | Coroutines, Reactive-Streams, Reactor, RxJava2 |
| Sync    | `com.mongodb.kotlin.client` | Core lib `org.litote.kmongo:kmongo` |
| Status  | Maintained by MongoDB | Deprecated (Jul 2023) |

## 2. Connect

```kotlin
// Kotlin Driver
import com.mongodb.kotlin.client.coroutine.MongoClient
val client = MongoClient.create(CONN_STR)
val collection = client.getDatabase("test").getCollection<Jedi>("jedi")
```

```kotlin
// KMongo (coroutines)
val client = KMongo.createClient().coroutine
val collection = client.getDatabase("test").getCollection<Jedi>() // name inferred
```

## 3. CRUD & Aggregation

```kotlin
// Kotlin Driver CRUD
collection.insertOne(Jedi("Luke", 19))
val luke  = collection.find(eq(Jedi::name.name, "Luke")).first()
val young = collection.find(lt(Jedi::age.name, 30)).toList()
collection.updateOne(eq(Jedi::name.name,"Luke"), set(Jedi::age.name,20))
collection.deleteOne(eq(Jedi::name.name,"Luke"))

// Kotlin Driver aggregation
collection.aggregate<Results>(
    listOf(
        match(ne(Jedi::name.name,"Luke")),
        group("\$${Jedi::name.name}", avg("avgAge","\$${Jedi::age.name}"))
    )
).collect{ println(it) }
```

KMongo syntax is analogous; infix builders shown below.

## 4. Builders & Infix Extensions

Add dependency `org.mongodb:mongodb-driver-kotlin-extensions`.

```kotlin
import com.mongodb.kotlin.client.model.Filters.eq
// Infix, data-class property based
val luke  = collection.find(Jedi::name eq "Luke").first()
val young = collection.find(Jedi::age lt 30).toList()
collection.updateOne(Jedi::name eq "Luke", Jedi::age.name set 20)
collection.deleteOne(Jedi::name eq "Luke")
```

Provides same infix DSL that KMongo offers.

## 5. Query Construction

```kotlin
// Builders
val filter = and(eq("gender","female"), gt("age",29))
val proj   = fields(excludeId(), include("email"))
collection.find<Results>(filter).projection(proj)

// Raw JSON
val query = JsonObject("""{"name":"Gabriel Garc\u00eda M\u00e1rquez"}""")
collection.find(query).firstOrNull()
```

KMongo offers identical DSL plus raw shell strings.

## 6. Data Models

```kotlin
data class Movie(val title:String,val year:Int,val rating:Float)
val dc = db.getCollection<Movie>("movies").findOneOrNull()
val title = dc?.title

// Or use Document
val doc = db.getCollection<Document>("movies").findOneOrNull()
val title2 = doc?.getString("title")
```

## 7. Serialization

Kotlin Driver:

```kotlin
@Serializable
data class LightSaber(
    @SerialName("_id") @Contextual val id:ObjectId?,
    val color:String, val qty:Int,
    @SerialName("brand") val manufacturer:String="Acme"
)
```

Supports automatic codecs + `kotlinx.serialization`. `Document.toJson()` outputs JSON/EJSON.

KMongo: default Jackson, POJO codec or `kotlinx.serialization`.

## 8. Sync vs Async Usage

```kotlin
// Sync
import com.mongodb.kotlin.client.MongoClient
val col = MongoClient.create(URI).getDatabase("test").getCollection<Jedi>("jedi")
col.insertOne(Jedi("Luke",19))

// Coroutines
import com.mongodb.kotlin.client.coroutine.MongoClient
runBlocking {
    val col = MongoClient.create(URI).getDatabase("test").getCollection<Jedi>("jedi")
    col.insertOne(Jedi("Luke",19))
}
```

In KMongo you choose additional libs per async style; otherwise code is similar.

## 9. Migration Tips

1. Replace KMongo imports with `com.mongodb.kotlin.*`.
2. If you rely on infix DSL, add `mongodb-driver-kotlin-extensions`.
3. Connection string, database, collection acquisition change only in naming inference (explicit name required).
4. KMongo-specific helpers (`setValue`, shell-string queries) map to Builders or JSON objects in Kotlin driver.
5. For non-coroutine reactive styles (Reactor, RxJava, etc.) use Java driver instead; Kotlin driver exposes only sync/coroutines.

```gradle
implementation("org.mongodb:mongodb-driver-kotlin-coroutine:<ver>")
implementation("org.mongodb:mongodb-driver-kotlin-extensions:<ver>") // optional DSL
```

</section>
<section>
<title>Validate Driver Artifact Signatures</title>
<url>https://mongodb.com/docs/drivers/kotlin/coroutine/current/validate-signatures/</url>

# Validate Driver Artifact Signatures

Use GPG to confirm Maven artifacts.

## Steps
1. Install GPG (`brew install gnupg` or GUI GPG Suite).  
2. Import MongoDB JVM Drivers signing key (see release notes).  
3. Download artifact & `.asc`:
```sh
curl -LO https://repo.maven.apache.org/maven2/org/mongodb/mongodb-driver-core/5.1.0/mongodb-driver-core-5.1.0.jar
curl -LO https://repo.maven.apache.org/maven2/org/mongodb/mongodb-driver-core/5.1.0/mongodb-driver-core-5.1.0.jar.asc
```
4. Verify:
```sh
gpg --verify mongodb-driver-core-5.1.0.jar.asc mongodb-driver-core-5.1.0.jar
```
Successful output contains `Good signature from "MongoDB Java Driver Release Signing Key"`.

</section>
</guide>