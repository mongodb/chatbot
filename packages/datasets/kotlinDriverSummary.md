You are an expert on MongoDB Kotlin Driver. Base your answers on the following content:

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/
# MongoDB Kotlin Driver

## Introduction

The Kotlin Driver is the official MongoDB driver for server-side Kotlin applications using coroutines. Download via Maven or Gradle, or follow the Quick Start guide for a runnable project. For synchronous processing, use the Sync Driver.

## Quick Start

Establish a connection to MongoDB Atlas and work with data in the Quick Start section.

## Quick Reference

Refer to the Quick Reference section for driver syntax examples of common MongoDB commands.

## What's New

See the What's New section for new features and changes in each version.

## Usage Examples

Find runnable code snippets and explanations for common methods in the Usage Examples section.

## Fundamentals

In the Fundamentals section, learn to:

- Connect to MongoDB
- Use the Stable API
- Authenticate
- Convert between MongoDB Data Formats and Kotlin Objects
- Read/Write to MongoDB
- Simplify Code with Builders
- Transform Data
- Create Aggregation Expressions
- Create Indexes
- Sort Using Collations
- Log and Monitor Driver Events
- Use Time Series Collections
- Encrypt Document Fields

## API Documentation

The API documentation includes libraries organized by functionality. See the table for descriptions and links.

| Library                     | Description                     |
|-----------------------------|---------------------------------|
| BSON                        | Base BSON classes               |
| BSON Record Codec           | Classes supporting records       |
| Core                        | Shared core classes             |
| Kotlin Driver               | API                             |

## FAQ

Refer to the FAQ section for common questions about the MongoDB Kotlin Driver.

## Connection Troubleshooting

Find solutions for connection issues in the Connection Troubleshooting section.

## Issues & Help

Learn to report bugs, contribute, and find resources in the Issues & Help section.

## Compatibility

See the Compatibility section for charts showing recommended Kotlin Driver versions for each MongoDB Server version.

## Migrate from KMongo

Learn about migrating from the KMongo driver to the MongoDB Kotlin Driver in the Migrate from KMongo section.

## Validate Driver Artifact Signatures

Learn to validate signatures of Kotlin driver artifacts published on Maven in the Validate Driver Artifact Signatures section.

## Learn

Visit the Developer Hub for tutorials and social engagement. Check the Kotlin Tutorials and Articles page for the Getting Started tutorial. Engage with the MongoDB Developer Community for discussions.

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/quick-start/
# Kotlin Driver Quick Start

## Introduction

This guide shows how to create an application using the **Kotlin driver** to connect to a **MongoDB Atlas cluster**. The Kotlin driver allows communication with MongoDB clusters from Kotlin applications. MongoDB Atlas is a managed cloud database service. For more examples, refer to the Getting Started with the MongoDB Kotlin Driver tutorial.

## Set up Your Project

### Install Kotlin

Ensure Kotlin is installed and running on JDK 1.8 or later. Refer to the Kotlin documentation for setup.

### Create the Project

Add MongoDB Kotlin driver dependencies using Gradle or Maven. Use an IDE like IntelliJ IDEA or Eclipse for configuration.

For Gradle, add to `build.gradle.kts`:

```kotlin
dependencies {
    implementation("org.mongodb:mongodb-driver-kotlin-coroutine:5.3.0")
}
```

For Maven, add to `pom.xml`:

```xml
<dependencies>
    <dependency>
        <groupId>org.mongodb</groupId>
        <artifactId>mongodb-driver-kotlin-coroutine</artifactId>
        <version>5.3.0</version>
    </dependency>
</dependencies>
```

Refresh your project to ensure dependencies are available.

### Add Serialization Library Dependencies

Add one or both serialization packages for BSON conversion:

- `bson-kotlinx` *(Recommended)*
- `bson-kotlin`

For Gradle:

```kotlin
implementation("org.mongodb:bson-kotlinx:5.3.0")
// OR
implementation("org.mongodb:bson-kotlin:5.3.0")
```

For Maven:

```xml
<dependency>
    <groupId>org.mongodb</groupId>
    <artifactId>bson-kotlinx</artifactId>
    <version>5.3.0</version>
</dependency>
<!--OR-->
<dependency>
    <groupId>org.mongodb</groupId>
    <artifactId>bson-kotlin</artifactId>
    <version>5.3.0</version>
</dependency>
```

Refresh your project after adding dependencies.

## Create a MongoDB Cluster

Set up a MongoDB cluster by completing the Get Started with Atlas tutorial to create a free tier cluster and load sample datasets.

## Connect to your Cluster

Specify a *connection string* in your code to connect to your MongoDB cluster. Retrieve your connection string from your Atlas account under the Database page by clicking the Connect button.

### Query Your MongoDB Cluster from Your Application

Create `QuickStartDataClassExample.kt` and replace the `uri` variable with your connection string:

```kotlin
import com.mongodb.client.model.Filters.eq
import com.mongodb.kotlin.client.coroutine.MongoClient
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.runBlocking

data class Movie(val title: String, val year: Int, val cast: List<String>)

fun main() {
    val uri = CONNECTION_STRING_URI_PLACEHOLDER
    val mongoClient = MongoClient.create(uri)
    val database = mongoClient.getDatabase("sample_mflix")
    val collection = database.getCollection<Movie>("movies")

    runBlocking {
        val doc = collection.find(eq("title", "Back to the Future")).firstOrNull()
        println(doc ?: "No matching documents found.")
    }

    mongoClient.close()
}
```

Running this prints the movie details. Ensure the connection string is correct and the sample dataset is loaded.

If you encounter an SSLHandshakeException, update your JDK to one of the following versions:

- JDK 11.0.7
- JDK 13.0.3
- JDK 14.0.2

### Working with the Document Class (Alternative)

In `QuickStartDocumentExample.kt`, use the Document class:

```kotlin
import com.mongodb.client.model.Filters.eq
import com.mongodb.kotlin.client.coroutine.MongoClient
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.runBlocking
import org.bson.Document

fun main() {
    val uri = CONNECTION_STRING_URI_PLACEHOLDER
    val mongoClient = MongoClient.create(uri)
    val database = mongoClient.getDatabase("sample_mflix")
    val collection = database.getCollection<Document>("movies")

    runBlocking {
        val doc = collection.find(eq("title", "Back to the Future")).firstOrNull()
        println(doc?.toJson() ?: "No matching documents found.")
    }

    mongoClient.close()
}
```

## Next Steps

For more on the Kotlin driver, see the Fundamentals guides for detailed concepts and code examples.

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/quick-reference/
# Quick Reference

This page shows the driver syntax for MongoDB commands and links to related documentation.

The examples use the following data class:

```kotlin
data class Movie(
    val title: String,
    val year: Int,
    val rated: String? = "Not Rated",
    val genres: List<String>? = listOf()
)
```

| Command | Syntax |
|---------|--------|
| **Find a Document** | ```kotlin collection.find(Filters.eq(Movie::title.name, "Shrek")).firstOrNull() ``` |
| **Find Multiple Documents** | ```kotlin collection.find(Filters.eq(Movie::year.name, 2004)) ``` |
| **Insert a Document** | ```kotlin collection.insertOne(Movie("Shrek", 2001)) ``` |
| **Insert Multiple Documents** | ```kotlin collection.insertMany(listOf(Movie("Shrek", 2001), Movie("Shrek 2", 2004), Movie("Shrek the Third", 2007), Movie("Shrek Forever After", 2010))) ``` |
| **Update a Document** | ```kotlin collection.updateOne(Filters.eq(Movie::title.name, "Shrek"), Updates.set(Movie::rated.name, "PG")) ``` |
| **Update Multiple Documents** | ```kotlin collection.updateMany(Filters.regex(Movie::title.name, "Shrek"), Updates.set(Movie::rated.name, "PG")) ``` |
| **Update an Array in a Document** | ```kotlin collection.updateOne(Filters.eq(Movie::title.name, "Shrek"), Updates.addEachToSet(Movie::genres.name, listOf("Family", "Fantasy"))) ``` |
| **Replace a Document** | ```kotlin collection.replaceOne(Filters.eq(Movie::title.name, "Shrek"), Movie("Kersh", 1002, "GP")) ``` |
| **Delete a Document** | ```kotlin collection.deleteOne(Filters.eq(Movie::title.name, "Shrek")) ``` |
| **Delete Multiple Documents** | ```kotlin collection.deleteMany(Filters.regex(Movie::title.name, "Shrek")) ``` |
| **Bulk Write** | ```kotlin collection.bulkWrite(listOf(InsertOneModel(Movie("Shrek", 2001)), DeleteManyModel(Filters.lt(Movie::year.name, 2004)))) ``` |
| **Watch for Changes** | ```kotlin val changeStream = collection.watch() changeStream.collect { println("Change to ${it.fullDocument?.title}") } ``` |
| **Access Results from a Query as a List** | ```kotlin collection.find().toList() ``` |
| **Count Documents** | ```kotlin collection.countDocuments(Filters.eq("year", 2001)) ``` |
| **List Distinct Documents or Field Values** | ```kotlin collection.distinct<String>(Movie::rated.name) ``` |
| **Limit Retrieved Documents** | ```kotlin collection.find().limit(2) ``` |
| **Skip Retrieved Documents** | ```kotlin collection.find().skip(2) ``` |
| **Sort Retrieved Documents** | ```kotlin collection.find().sort(Sorts.descending(Movie::year.name)) ``` |
| **Project Document Fields** | ```kotlin data class Result(val title: String) collection.find<Result>().projection(Projections.include(Movie::title.name)) ``` |
| **Create an Index** | ```kotlin collection.createIndex(Indexes.ascending(Movie::title.name)) ``` |
| **Search Text** | ```kotlin collection.find(Filters.text("Forever")); ``` |
| **Install Driver Dependency with Maven** | ```xml <dependencies><dependency><groupId>org.mongodb</groupId><artifactId>mongodb-driver-kotlin-coroutine</artifactId><version>5.3.0</version></dependency></dependencies> ``` |
| **Install Driver Dependency with Gradle** | ```kotlin dependencies { implementation("org.mongodb:mongodb-driver-kotlin-coroutine:5.3.0") } ``` |
| **Access Data from a Flow Iteratively** | ```kotlin val flow = collection.find(Filters.eq(Movie::year.name, 2004)) flow.collect { println(it) } ``` |

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/whats-new/
# What's New

## Version 5.3

- Drops support for MongoDB Server 4.0, raising minimum to 4.2. See Release Notes for upgrade info.
- Adds `BinaryVector` class for BSON Binary Subtype 9, supporting:
  - `Int8BinaryVector`
  - `Float32BinaryVector`
  - `PackedBitBinaryVector` *(In beta)*
- Removes explicit fairness from connection pool, potentially improving throughput but may increase tail latency.
- Adds sort option to `updateOne()` and `replaceOne()`, applicable in `ReplaceOneModel` and `UpdateOneModel`.
- Supports builder class methods with data class properties via Kotlin driver Extensions.
- Implements client bulk write API for multiple databases/collections in one call.

## Version 5.2

- Removes support for MongoDB server 3.6. See Compatibility for details.
- Adds `SearchIndexType` for specifying index type in `SearchIndexModel`.
- Delegates `SCRAM-SHA-1` and `SCRAM-SHA-256` authentication to JCA provider for enhanced security.
- Aligns `mongodb-crypt` versioning with JVM drivers; upgrade to v5.2.0.
- Performance improvements via native cryptography; installation instructions vary by OS.
- Fixes incorrect IDs in `InsertOneResult.getInsertedId()` and `InsertManyResult.getInsertedIds()`.
- Avoids retrying on the same `mongos` server in sharded clusters.
- Adds reachability metadata for GraalVM Native Image.
- Enables exact vector search with `ExactVectorSearchOptions` and `ApproximateVectorSearchOptions`.
- Supports `kotlinx-datetime` serializers for Kotlin date/time types and `JsonElement` serialization.

## Version 5.1.3

- Fixes assertion errors with `Cursor` types.

## Version 5.1.2

- Supports encoding Kotlin data classes with nullable generic parameters.

## Version 5.1.1

- Comma characters are not allowed in `authMechanismProperties` for `MONGODB-OIDC`.

## Version 5.1

- Deprecates support for MongoDB server v3.6.
- Internal testing for GraalVM native image technology.
- Enhances `MONGODB-OIDC` authentication support.
- Fixes codec issues in polymorphic `MongoCollection`.

### New Features in 5.1

- Supports polymorphic serialization.
- Introduces `serverMonitoringMode` connection URI option.

## Version 5.0

- `KotlinSerializerCodecProvider` constructor accepts `serializersModule` and `bsonConfiguration`.

## Version 4.11

### Deprecations in 4.11

- Deprecates network address-related methods and StreamFactory interface methods.

### New Features in 4.11

- SOCKS5 proxy support.
- `getSplitEvent()` method for `ChangeStreamDocument`.
- Aggregation stage builder for `$vectorSearch`.
- Atlas Search index management helpers.
- Updated compression library dependencies.
- `getElapsedTime()` methods for connection pool events.
- Supports Java 21 virtual threads and structured concurrency.

## Version 4.10

- Requires `bson-kotlinx` library for `kotlinx-serialization`.
- Supports Kotlin server-side usage for coroutines and synchronous applications.
- Codec support for Kotlin data classes.

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/
# Usage Examples

## Overview

Usage examples offer starting points for MongoDB operations, including:

- Explanation of the operation's purpose and a sample use case.
- Details on usage, parameters, return values, and common exceptions.
- A complete Kotlin file for running the example.

## How to Use the Usage Examples

These examples utilize sample datasets from Atlas, which can be loaded into your database via the Get Started with Atlas Guide or imported into a local MongoDB instance.

After importing the dataset, copy a usage example into your development environment. Edit the connection URI to connect to your MongoDB instance:

```kotlin
// Replace with your MongoDB deployment's connection string.
val uri = "<connection string uri>"
```

Refer to the Atlas Connectivity Guide for connection instructions and to find your connection string. For SCRAM authentication, replace `<user>`, `<password>`, and `<cluster-url>` with your credentials.

For more connection details, see our Connection Guide.

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/find-operations/


Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/findOne/
# Find a Document

Retrieve a document in a collection by chaining `find()` and `first()` on a `MongoCollection`. Pass a query filter to `find()` to return matching documents; without a filter, all documents are returned.

Chain methods like `sort()` to order documents and `projection()` to configure returned fields.

`find()` returns a `FindFlow`, which provides methods to access and traverse results, including `first()` and `firstOrNull()`. `firstOrNull()` returns the first document or `null` if none match; `first()` throws `NoSuchElementException` if no documents match.

## Example

The snippet below finds a document from the `movies` collection using:

- A **query filter** with `eq` to match movies titled `"The Room"`.
- A **sort** to order by rating in descending order.
- A **projection** to include `title` and `imdb`, excluding `_id` with `excludeId()`.

Connect to MongoDB using a connection URI.

```kotlin
import com.mongodb.client.model.Filters.eq
import com.mongodb.client.model.Projections
import com.mongodb.client.model.Sorts
import com.mongodb.kotlin.client.coroutine.MongoClient
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.runBlocking
import usageExamples.find.Results

data class Movie(val title: String, val runtime: Int, val imdb: IMDB) {
    data class IMDB(val rating: Double)
}

data class Results(val title: String, val imdb: Movie.IMDB)

fun main() = runBlocking {
    val uri = "<connection string uri>"
    val mongoClient = MongoClient.create(uri)
    val database = mongoClient.getDatabase("sample_mflix")
    val collection = database.getCollection<Movie>("movies")

    val projectionFields = Projections.fields(
        Projections.include(Movie::title.name, Movie::imdb.name),
        Projections.excludeId()
    )
    val resultsFlow = collection.withDocumentClass<Results>()
        .find(eq(Movie::title.name, "The Room"))
        .projection(projectionFields)
        .sort(Sorts.descending("${Movie::imdb.name}.${Movie.IMDB::rating.name}"))
        .firstOrNull()

    if (resultsFlow == null) {
        println("No results found.")
    } else {
        println(resultsFlow)
    }

    mongoClient.close()
}
```

For more on the classes and methods, see the API Documentation for FindFlow and find().

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/find/
# Find Multiple Documents

Query multiple documents in a collection using the `find()` method on a `MongoCollection` object. Pass a query filter to return matching documents; omitting the filter returns all documents.

Chain methods like `sort()` to order results and `projection()` to configure included fields.

The `find()` method returns a `FindFlow`, which provides methods to access and traverse results. Use `collect()` to iterate through results, or terminal methods like `firstOrNull()` for the first document or `null`, and `first()` for the first document, throwing `NoSuchElementException` if no matches.

## Example

The snippet finds and prints documents matching a query on the `movies` collection:

- A **query filter** using `lt()` for movies with a runtime under 15 minutes.
- A **sort** in descending order by title.
- A **projection** including `title` and `imdb`, excluding `_id` with `excludeId()`.

Connect to MongoDB using a connection URI.

```kotlin
import com.mongodb.client.model.Filters.lt
import com.mongodb.client.model.Projections
import com.mongodb.client.model.Sorts
import com.mongodb.kotlin.client.coroutine.MongoClient
import kotlinx.coroutines.runBlocking

data class Movie(val title: String, val runtime: Int, val imdb: IMDB){
    data class IMDB(val rating: Double)
}

data class Results(val title: String)

fun main() = runBlocking {
    val uri = "<connection string uri>"
    val mongoClient = MongoClient.create(uri)
    val database = mongoClient.getDatabase("sample_mflix")
    val collection = database.getCollection<Movie>("movies")

    val projectionFields = Projections.fields(
        Projections.include(Movie::title.name, Movie::imdb.name),
        Projections.excludeId()
    )
    val resultsFlow = collection.withDocumentClass<Results>()
        .find(lt(Movie::runtime.name, 15))
        .projection(projectionFields)
        .sort(Sorts.descending(Movie::title.name))

    resultsFlow.collect { println(it) }

    mongoClient.close()
}
```

For more on the classes and methods, see the API Documentation: FindFlow, find().

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/insert-operations/


Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/insertOne/
# Insert a Document

Use the `insertOne()` method on a `MongoCollection` to insert a single document. Construct a `Document` with the desired fields and values. If the collection doesn't exist, it will be created automatically.

`insertOne()` returns an `InsertOneResult`, allowing you to retrieve the inserted document's `_id` via `getInsertedId()`. If the operation fails, an exception is raised. Refer to the API documentation for specific exceptions related to `insertOne()`.

## Example

The snippet below inserts a document into the `movies` collection. The output will show the inserted document's `ObjectId`.

This example connects to MongoDB using a connection URI. For connection details, see the connection guide.

```kotlin
import com.mongodb.MongoException
import com.mongodb.kotlin.client.coroutine.MongoClient
import kotlinx.coroutines.runBlocking
import org.bson.codecs.pojo.annotations.BsonId
import org.bson.types.ObjectId

data class Movie(@BsonId val id: ObjectId, val title: String, val genres: List<String>)

fun main() = runBlocking {
    val uri = "<connection string uri>"
    val mongoClient = MongoClient.create(uri)
    val database = mongoClient.getDatabase("sample_mflix")
    val collection = database.getCollection<Movie>("movies")

    try {
        val result = collection.insertOne(
            Movie(ObjectId(), "Ski Bloopers", listOf("Documentary", "Comedy"))
        )
        println("Success! Inserted document id: " + result.insertedId)
    } catch (e: MongoException) {
        System.err.println("Unable to insert due to an error: $e")
    }
    mongoClient.close()
}
```

```console
Success! Inserted document id: BsonObjectId{value=...}
```

For more on the classes and methods, see the API Documentation:

- insertOne()
- Document
- InsertOneResult

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/insertMany/
# Insert Multiple Documents

Use the `insertMany()` method on a `MongoCollection` to insert multiple documents in one operation. Pass a `List` of `Document` objects to `insertMany()`. If the collection doesn't exist, it will be created.

On success, `insertMany()` returns an `InsertManyResult`, allowing retrieval of inserted document `_id` fields via `getInsertedIds()`. If the operation fails, an exception is raised. Refer to the API documentation for specific exceptions related to `insertMany()`.

## Example

The following snippet inserts multiple documents into the `movies` collection:

```kotlin
import com.mongodb.MongoException
import com.mongodb.kotlin.client.coroutine.MongoClient
import kotlinx.coroutines.runBlocking

data class Movie(val title: String)

fun main() = runBlocking {
    val uri = "<connection string uri>"
    val mongoClient = MongoClient.create(uri)
    val database = mongoClient.getDatabase("sample_mflix")
    val collection = database.getCollection<Movie>("movies")

    val movieList = listOf(
        Movie("Short Circuit 3"),
        Movie("The Lego Frozen Movie")
    )

    try {
        val result = collection.insertMany(movieList)
        println("Success! Inserted document ids: " + result.insertedIds)
    } catch (e: MongoException) {
        System.err.println("Unable to insert due to an error: $e")
    }
    mongoClient.close()
}
```

```console
Success! Inserted document ids: {0=BsonObjectId{value=...}, 1=BsonObjectId{value=...}}
```

For more information, see the API Documentation for `insertMany()`, `Document`, and `InsertManyResult`.

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/update-operations/
# Update & Replace Operations

- **Update a Document**: Use `collection.updateOne(filter, update)` to modify a single document.

- **Update Multiple Documents**: Use `collection.updateMany(filter, update)` to modify multiple documents.

- **Replace a Document**: Use `collection.replaceOne(filter, replacement)` to replace a document entirely.

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/updateOne/
# Update a Document

Use the `updateOne()` method on a `MongoCollection` to update a single document. It requires a **filter** to match the document and an **update** statement for changes. Only the first matching document is updated.

Pass a query filter and an update document to `updateOne()`. Optionally, use `UpdateOptions` to modify behavior, such as setting `upsert` to `true` to insert a new document if no matches are found. The method returns an `UpdateResult`, allowing retrieval of modified document count via `getModifiedCount()` and the `_id` field via `getUpsertedId()` if `upsert(true)` is used.

If the update fails, a `MongoWriteException` is raised. For example, trying to modify the immutable `_id` field results in:

```none
Performing an update on the path '_id' would modify the immutable field '_id'
```

Violating unique index rules raises:

```none
E11000 duplicate key error collection: ...
```

Refer to the `updateOne()` API documentation for more exceptions.

## Example

This example queries for a movie titled "Cool Runnings 2" and updates the first match in the `movies` collection of the `sample_mflix` database:

1. Set `runtime` to `99`
2. Add `Sports` to `genres` if it doesn't exist
3. Set `lastUpdated` to the current time

Use the `Updates` builder for constructing the update document. 

```kotlin
import com.mongodb.MongoException
import com.mongodb.client.model.Filters
import com.mongodb.client.model.UpdateOptions
import com.mongodb.client.model.Updates
import com.mongodb.kotlin.client.coroutine.MongoClient
import kotlinx.coroutines.runBlocking
import java.time.LocalDateTime

data class Movie(
    val title: String,
    val runtime: Int,
    val genres: List<String>,
    val lastUpdated: LocalDateTime
)

fun main() = runBlocking {
    val uri = "<connection string uri>"
    val mongoClient = MongoClient.create(uri)
    val database = mongoClient.getDatabase("sample_mflix")
    val collection = database.getCollection<Movie>("movies")

    val query = Filters.eq(Movie::title.name, "Cool Runnings 2")
    val updates = Updates.combine(
        Updates.set(Movie::runtime.name, 99),
        Updates.addToSet(Movie::genres.name, "Sports"),
        Updates.currentDate(Movie::lastUpdated.name)
    )
    val options = UpdateOptions().upsert(true)
    try {
        val result = collection.updateOne(query, updates, options)
        println("Modified document count: " + result.modifiedCount)
        println("Upserted id: " + result.upsertedId)
    } catch (e: MongoException) {
        System.err.println("Unable to update due to an error: $e")
    }
    mongoClient.close()
}
```

Expected output:

```none
Modified document count: 1
Upserted id: null
```

Or for an upsert:

```none
Modified document count: 0
Upserted id: BsonObjectId{value=...}
```

The updated document should resemble:

```none
Movie(title=Cool Runnings 2, runtime=99, genres=[ ... Sports], lastUpdated= ... )
```

For more information, see the API Documentation for:

- UpdateOne
- UpdateOptions
- combine()
- set()
- addToSet()
- currentDate()
- UpdateResult

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/updateMany/
# Update Multiple Documents

Use the `updateMany()` method on a `MongoCollection` to update multiple documents. It requires a **filter** to match documents and an **update** statement for changes. The method updates all documents matching the filter.

Pass a query filter and an update document to `updateMany()`. Optionally, use `UpdateOptions` to modify behavior, such as setting `upsert` to `true` to insert a new document if no matches are found.

`updateMany()` returns an `UpdateResult`, allowing retrieval of the modified document count via `getModifiedCount()`. If `upsert(true)` is used and an insert occurs, get the new document's `_id` with `getUpsertedId()`.

If the update fails, an exception is raised, and no documents are updated. For instance, trying to modify the immutable `_id` field results in a `MongoWriteException`:

```none
Performing an update on the path '_id' would modify the immutable field '_id'
```

Violating unique index rules also raises a `MongoWriteException`:

```none
E11000 duplicate key error collection: ...
```

Refer to the API documentation for specific exceptions related to `updateMany()`.

## Example

This example filters for movies in the genre "Frequently Discussed" and updates matching documents in the `movies` collection of the `sample_mflix` database:

- Adds `Frequently Discussed` to `genres` if it doesn't exist.
- Sets `lastUpdated` to the current time.

Using the `Updates` builder simplifies syntax and provides type checking. 

Connect to MongoDB using a connection URI:

```kotlin
import com.mongodb.MongoException
import com.mongodb.client.model.Filters
import com.mongodb.client.model.Updates
import com.mongodb.kotlin.client.coroutine.MongoClient
import kotlinx.coroutines.runBlocking
import java.time.LocalDateTime

data class Movie(
    val num_mflix_comments: Int,
    val genres: List<String>,
    val lastUpdated: LocalDateTime
)

fun main() = runBlocking {
    val uri = "<connection string uri>"
    val mongoClient = MongoClient.create(uri)
    val database = mongoClient.getDatabase("sample_mflix")
    val collection = database.getCollection<Movie>("movies")

    val query = Filters.gt(Movie::num_mflix_comments.name, 50)
    val updates = Updates.combine(
        Updates.addToSet(Movie::genres.name, "Frequently Discussed"),
        Updates.currentDate(Movie::lastUpdated.name)
    )
    try {
        val result = collection.updateMany(query, updates)
        println("Modified document count: " + result.modifiedCount)
    } catch (e: MongoException) {
        System.err.println("Unable to update due to an error: $e")
    }
    mongoClient.close()
}
```

```console
Modified document count: 53
```

After running the example, the updated document(s) should resemble:

```none
Movie(num_mflix_comments=100, genres=[ ... Frequently Discussed], lastUpdated= ... )
```

For more information, see the API Documentation for:

- UpdateMany
- UpdateOptions
- combine()
- addToSet()
- currentDate()
- UpdateResult

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/replaceOne/
# Replace a Document

Use the `replaceOne()` method on a `MongoCollection` to replace a document, removing all fields except `_id`. It accepts a query filter to match the document and a replacement document.

Optionally, pass `ReplaceOptions` to specify behavior, such as setting `upsert` to `true` to insert a new document if no match is found. On success, `replaceOne()` returns an `UpdateResult`, allowing retrieval of modified document count via `getModifiedCount()` and `_id` via `getUpsertedId()` if upserted.

If the operation fails, exceptions are raised. For example, altering the immutable `_id` field results in a `MongoWriteException`:

```none
After applying the update, the (immutable) field '_id' was found to have been altered to _id: ObjectId('...')
```

Violating unique index rules also raises a `MongoWriteException`:

```none
E11000 duplicate key error collection: ...
```

Refer to the `replaceOne()` API documentation for more exceptions.

## Example

This example replaces the first match in the `movies` collection of the `sample_mflix` database. The original document's fields are replaced by the new document, retaining only `_id`.

The snippet uses:

- A **query filter** with `eq` to match movies titled `'Music of the Heart'`.
- A **replacement document** for the matched document.
- A **ReplaceOptions** object with `upsert` set to `true`.

Connect to MongoDB using a connection URI:

```kotlin
import com.mongodb.MongoException
import com.mongodb.client.model.Filters
import com.mongodb.client.model.ReplaceOptions
import com.mongodb.kotlin.client.coroutine.MongoClient
import kotlinx.coroutines.runBlocking

data class Movie(val title: String, val fullplot: String)

fun main() = runBlocking {
    val uri = "<connection string uri>"
    val mongoClient = MongoClient.create(uri)
    val database = mongoClient.getDatabase("sample_mflix")
    val collection = database.getCollection<Movie>("movies")

    try {
        val query = Filters.eq("title", "Music of the Heart")
        val replaceDocument = Movie("50 Violins", "A dramatization of the true story of Roberta Guaspari who co-founded the Opus 118 Harlem School of Music")
        val options = ReplaceOptions().upsert(true)
        val result = collection.replaceOne(query, replaceDocument, options)
        println("Modified document count: " + result.modifiedCount)
        println("Upserted id: " + result.upsertedId)
    } catch (e: MongoException) {
        System.err.println("Unable to replace due to an error: $e")
    }
    mongoClient.close()
}
```

Expected output:

```none
Modified document count: 1
Upserted id: null
```

Or for an upsert:

```none
Modified document count: 0
Upserted id: BsonObjectId{value=...}
```

The replaced document should look like:

```none
Movie(title=50 Violins, fullplot= A dramatization of the true story of Roberta Guaspari who co-founded the Opus 118 Harlem School of Music)
```

For more information, see the API Documentation for:

- ReplaceOne
- ReplaceOptions
- UpdateResult
- eq()

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/delete-operations/


Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/deleteMany/
# Delete Multiple Documents

Use the `deleteMany()` method on a `MongoCollection` to delete multiple documents. Pass a query filter to specify which documents to delete; an empty document deletes all. For better performance, use `drop()` instead of deleting all documents.

On success, `deleteMany()` returns a `DeleteResult`, which provides the number of deleted documents via `getDeletedCount()`. If the operation fails, an exception is raised. Refer to the API documentation for details on exceptions.

## Example

The snippet below deletes documents from the `movies` collection in the `sample_mflix` database, targeting movies with an `imdb.rating` less than `2.9`.

```kotlin
import com.mongodb.MongoException
import com.mongodb.client.model.Filters
import com.mongodb.kotlin.client.coroutine.MongoClient
import kotlinx.coroutines.runBlocking

data class Movie(val imdb: IMDB){
    data class IMDB(val rating: Double)
}

fun main() = runBlocking {
    val uri = "<connection string uri>"
    val mongoClient = MongoClient.create(uri)
    val database = mongoClient.getDatabase("sample_mflix")
    val collection = database.getCollection<Movie>("movies")

    val query = Filters.lt("${Movie::imdb.name}.${Movie.IMDB::rating.name}", 2.9)
    try {
        val result = collection.deleteMany(query)
        println("Deleted document count: " + result.deletedCount)
    } catch (e: MongoException) {
        System.err.println("Unable to delete due to an error: $e")
    }
    mongoClient.close()
}
```

```console
Deleted document count: 4
```

For more information, see the API Documentation for:

- deleteMany()
- DeleteResult
- drop()

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/deleteOne/
# Delete a Document

Use the `deleteOne()` method on a `MongoCollection` to delete a single document. It accepts a query filter; if none is specified, it matches the first document. The method returns a `DeleteResult` indicating how many documents were deleted. If the operation fails, an exception is raised.

## Example

The snippet below deletes a document from the `movies` collection in the `sample_mflix` database using the `eq()` filter for the title `'The Garbage Pail Kids Movie'`.

```kotlin
import com.mongodb.MongoException
import com.mongodb.client.model.Filters
import com.mongodb.kotlin.client.coroutine.MongoClient
import kotlinx.coroutines.runBlocking

data class Movie(val title: String)

fun main() = runBlocking {
    val uri = "<connection string uri>"
    val mongoClient = MongoClient.create(uri)
    val database = mongoClient.getDatabase("sample_mflix")
    val collection = database.getCollection<Movie>("movies")

    val query = Filters.eq(Movie::title.name, "The Garbage Pail Kids Movie")

    try {
        val result = collection.deleteOne(query)
        println("Deleted document count: " + result.deletedCount)
    } catch (e: MongoException) {
        System.err.println("Unable to delete due to an error: $e")
    }
    mongoClient.close()
}
```

Output when a document is deleted:

```none
Deleted document count: 1
```

Output when no document is matched:

```none
Deleted document count: 0
```

For more details, see the API Documentation for `deleteOne()`, `DeleteResult`, and `eq()`.

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/bulkWrite/
# Perform Bulk Operations

The `bulkWrite()` method executes batch write operations on a *single* collection, enhancing application performance by reducing network round trips. It returns success status only after all operations complete.

You can specify the following write operations in `bulkWrite()`:

- `insertOne`
- `updateOne`
- `updateMany`
- `deleteOne`
- `deleteMany`
- `replaceOne`

Parameters for `bulkWrite()` include:

- A `List` of `WriteModel` objects corresponding to the write operations (e.g., `InsertOneModel` for `insertOne`).
- `BulkWriteOptions`: *optional* settings for operation ordering.

Retryable writes are supported on MongoDB server versions 3.6+ unless `UpdateManyModel` or `DeleteManyModel` is included.

By default, operations are executed serially. If an error occurs during an ordered bulk write, remaining operations are not processed. Setting `ordered` to `false` allows MongoDB to continue processing despite errors, potentially improving speed for unordered operations.

The `bulkWrite()` method returns a `BulkWriteResult` object with details about the write results, including counts of inserted, modified, and deleted documents.

If an operation violates a unique index, an exception is raised:

```sh
The bulk write operation failed due to an error: Bulk write operation error on server <hostname>. Write errors: [BulkWriteError{index=0, code=11000, message='E11000 duplicate key error collection: ... }].
```

Exceptions may also occur if schema validation fails.

## Example

The following code performs an ordered bulk write on the `movies` collection in the `sample_mflix` database. It connects to MongoDB using a connection URI.

```kotlin
import com.mongodb.MongoException
import com.mongodb.client.model.*
import com.mongodb.kotlin.client.coroutine.MongoClient
import kotlinx.coroutines.runBlocking

data class Movie(val title: String, val runtime: Int? = null)

fun main() = runBlocking {
    val uri = "<connection string uri>"
    val mongoClient = MongoClient.create(uri)
    val collection = mongoClient.getDatabase("sample_mflix").getCollection<Movie>("movies")

    try {
        val result = collection.bulkWrite(
            listOf(
                InsertOneModel(Movie("A Sample Movie")),
                InsertOneModel(Movie("Another Sample Movie")),
                InsertOneModel(Movie("Yet Another Sample Movie")),
                UpdateOneModel(Filters.eq(Movie::title.name,"A Sample Movie"), Updates.set(Movie::title.name, "An Old Sample Movie"), UpdateOptions().upsert(true)),
                DeleteOneModel(Filters.eq("title", "Another Sample Movie")),
                ReplaceOneModel(Filters.eq(Movie::title.name, "Yet Another Sample Movie"), Movie("The Other Sample Movie", 42))
            )
        )
        println("Result statistics:\ninserted: ${result.insertedCount}\nupdated: ${result.modifiedCount}\ndeleted: ${result.deletedCount}")
    } catch (e: MongoException) {
        System.err.println("The bulk write operation failed due to an error: $e")
    }
    mongoClient.close()
}
```

```console
Result statistics:
inserted: 3
updated: 2
deleted: 1
```

For more information, see:

- Unique Index Server Manual Entry
- Schema Validation Server Manual Entry
- bulkWrite() API Documentation
- BulkWriteOptions API Documentation
- BulkWriteResult API Documentation
- InsertOneModel API Documentation
- UpdateOneModel API Documentation
- UpdateManyModel API Documentation
- DeleteOneModel API Documentation
- DeleteManyModel API Documentation
- ReplaceOneModel API Documentation

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/watch/
# Watch for Changes

Track changes in MongoDB using a **change stream** to react to data updates. Change streams return **change event** documents with updated data information.

Open a change stream with the `watch()` method on a `MongoCollection`, `MongoDatabase`, or `MongoClient`:

```kotlin
val changeStream = collection.watch()
```

The `watch()` method can take an **aggregation pipeline** to filter change events:

```kotlin
val pipeline = listOf(Aggregates.match(Filters.lt("fullDocument.runtime", 15)))
val changeStream = collection.watch(pipeline)
```

`watch()` returns a `ChangeStreamFlow`, which inherits methods from `Flow` in Kotlin Coroutines. Use `collect()` to handle events:

```kotlin
changeStream.collect {
    println("Change observed: $it")
}
```

By default, change streams return only modified fields. To get the full document, use `fullDocument()`:

```kotlin
val changeStream = collection.watch()
    .fullDocument(FullDocument.UPDATE_LOOKUP)
```

## Example

This example opens a change stream on the `movies` collection in the `sample_mflix` database, filtering for `insert` and `update` events. It uses `.collect()` to print filtered change events while running in a separate coroutine job.

```kotlin
import com.mongodb.client.model.Aggregates
import com.mongodb.client.model.Filters
import com.mongodb.client.model.Updates
import com.mongodb.client.model.changestream.FullDocument
import com.mongodb.kotlin.client.coroutine.MongoClient
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import java.lang.Thread.sleep

data class Movie(val title: String, val year: Int)

fun main() = runBlocking {
    val uri = "<connection string uri>"
    val mongoClient = MongoClient.create(uri)
    val database = mongoClient.getDatabase("sample_mflix")
    val collection = database.getCollection<Movie>("movies")

    val job = launch {
        val pipeline = listOf(Aggregates.match(Filters.`in`("operationType", mutableListOf("insert", "update"))))
        val changeStreamFlow = collection.watch(pipeline).fullDocument(FullDocument.DEFAULT)
        changeStreamFlow.collect { event ->
            println("Received a change to the collection: $event")
        }
    }

    collection.insertOne(Movie("Back to the Future", 1985))
    collection.insertOne(Movie("Freaky Friday", 2003))
    collection.updateOne(Filters.eq(Movie::title.name, "Back to the Future"), Updates.set(Movie::year.name, 1986))
    collection.deleteOne(Filters.eq(Movie::title.name, "Freaky Friday"))

    sleep(1000) // Allow time for processing

    job.cancel()
    mongoClient.close()
}
```

For more information, see the resources on Change Streams, Change Events, Aggregation Pipeline, and the `ChangeStreamFlow` API documentation.

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/count/
# Count Documents

In the `MongoCollection` class, use these methods to count documents:

- `countDocuments()`: Returns an **accurate** count matching a query. An empty query returns the total count.
- `estimatedDocumentCount()`: Returns an **estimation** based on metadata, without a query.

`estimatedDocumentCount()` is faster as it uses metadata. To improve performance with `countDocuments()` and an empty query, use a hint on the `_id` index:

```kotlin
val options = CountOptions().hintString("_id_")
val numDocuments = collection.countDocuments(BsonDocument(), options)
```

You can pass a **query filter** to `countDocuments()`, but not to `estimatedDocumentCount()`. If using Stable API `V1` with "strict" and MongoDB 5.0.0-5.0.8, `estimatedDocumentCount()` may error due to a bug. Upgrade to 5.0.9 or set "strict" to `false`.

Optional parameters for both methods:

| Method                     | Optional Parameter Class         | Description                                                  |
|----------------------------|----------------------------------|--------------------------------------------------------------|
| `countDocuments()`         | `CountOptions`                   | Use `limit()` for max documents or `maxTime()` for execution time. |
| `estimatedDocumentCount()`  | `EstimatedDocumentCountOptions`  | Use `maxTime()` for execution time.                          |

Both methods return a `Long` for the count.

## Example

This example estimates and counts documents in the `movies` collection of the `sample_mflix` database:

```kotlin
import com.mongodb.MongoException
import com.mongodb.client.model.Filters
import com.mongodb.kotlin.client.coroutine.MongoClient
import kotlinx.coroutines.runBlocking

data class Movie(val countries: List<String>)

fun main() = runBlocking {
    val uri = "<connection string uri>"
    val mongoClient = MongoClient.create(uri)
    val database = mongoClient.getDatabase("sample_mflix")
    val collection = database.getCollection<Movie>("movies")

    val query = Filters.eq(Movie::countries.name, "Spain")
    try {
        val estimatedCount = collection.estimatedDocumentCount()
        println("Estimated number of documents in the movies collection: $estimatedCount")
        val matchingCount = collection.countDocuments(query)
        println("Number of movies from Spain: $matchingCount")
    } catch (e: MongoException) {
        System.err.println("An error occurred: $e")
    }

    mongoClient.close()
}
```

```console
Estimated number of documents in the movies collection: 23541
Number of movies from Spain: 755
```

For more details, see the API Documentation for `countDocuments()`, `estimatedDocumentCount()`, `CountOptions`, and `EstimatedDocumentCountOptions`.

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/distinct/
# Retrieve Distinct Values of a Field

Use the `distinct()` method on a `MongoCollection` to get distinct values for a field. Pass the field name as the first parameter and the result type as the type parameter.

Example with the `movies` collection in `sample_mflix`:

```kotlin
data class Movie(
    val type: String,
    val languages: List<String>,
    val countries: List<String>,
    val awards: Awards) {
        data class Awards(val wins: Int)
    }
```

To get distinct `countries`:

```kotlin
collection.distinct<String>(Movie::countries.name)
```

For an embedded document's field, use dot notation:

```kotlin
collection.distinct<Int>("${Movie::awards.name}.${Movie.Awards::wins.name}")
```

Limit results with a query filter:

```kotlin
collection.distinct<String>(Movie::type.name, Filters.eq(Movie::languages.name, "French"))
```

The `distinct()` method returns a `DistinctFlow` object, which implements the `Flow` interface, allowing methods like `first()` and `firstOrNull()`.

## Example

Retrieve distinct `year` values from `movies` with a filter for "Carl Franklin" in `directors`:

```kotlin
import com.mongodb.MongoException
import com.mongodb.client.model.Filters
import com.mongodb.kotlin.client.coroutine.MongoClient
import kotlinx.coroutines.runBlocking

data class Movie(val year: Int, val directors: List<String>)

fun main() = runBlocking {
    val uri = "<connection string uri>"
    val mongoClient = MongoClient.create(uri)
    val database = mongoClient.getDatabase("sample_mflix")
    val collection = database.getCollection<Movie>("movies")

    try {
        val resultsFlow = collection.distinct<Int>(
            Movie::year.name, Filters.eq(Movie::directors.name, "Carl Franklin")
        )
        resultsFlow.collect { println(it) }
    } catch (e: MongoException) {
        System.err.println("An error occurred: $e")
    }

    mongoClient.close()
}
```

```console
1992
1995
1998
...
```

For more details, see:

- distinct() API Documentation
- distinctFlow API Documentation
- Dot Notation Server Manual Entry

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/usage-examples/command/
# Run a Command

Use `MongoDatabase.runCommand()` for raw database operations, which are commands executed directly on the MongoDB server CLI, like fetching server stats or initializing a replica set. Call `runCommand()` with a `Bson` command object on a `MongoDatabase` instance.

Prefer the MongoDB Shell for administrative tasks, as it's often quicker than using the Kotlin driver.

`runCommand()` accepts a `Bson` command and returns an `org.bson.Document` by default. You can specify a return type as an optional second parameter.

## Example

The following code sends the `dbStats` command to request statistics from a MongoDB database.

```kotlin
import com.mongodb.MongoException
import com.mongodb.kotlin.client.coroutine.MongoClient
import kotlinx.coroutines.runBlocking
import org.bson.BsonDocument
import org.bson.BsonInt64
import org.bson.json.JsonWriterSettings

fun main() = runBlocking {
    val uri = "<connection string uri>"
    val mongoClient = MongoClient.create(uri)
    val database = mongoClient.getDatabase("sample_mflix")
    try {
        val command = BsonDocument("dbStats", BsonInt64(1))
        val commandResult = database.runCommand(command)
        println(commandResult.toJson(JsonWriterSettings.builder().indent(true).build()))
    } catch (me: MongoException) {
        System.err.println("An error occurred: $me")
    }
    mongoClient.close()
}
```

```json
{
  "db": "sample_mflix",
  "collections": 5,
  "views": 0,
  "objects": 75595,
  "avgObjSize": 692.1003770090614,
  "dataSize": 52319328,
  "storageSize": 29831168,
  "numExtents": 0,
  "indexes": 9,
  "indexSize": 14430208,
  "fileSize": 0,
  "nsSizeMB": 0,
  "ok": 1
}
```

For more information, see:

- runCommand() API Documentation
- Database Commands Server Manual Entry
- dbStats Server Manual Entry

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/
# Fundamentals

Learn to perform these tasks with the Kotlin driver:

- Connect to MongoDB
- Use the Stable API
- Authenticate with MongoDB
- Convert between MongoDB Data Formats and Kotlin Objects
- Read from and Write to MongoDB
- Simplify Code with Builders
- Transform Data
- Create Aggregation Expressions
- Create Indexes for Faster Queries
- Sort with Collations
- Log Driver Events
- Monitor Driver Events
- Use a Time Series Collection
- Encrypt Document Fields

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/connection/
# Connection Guide

## Overview

Set up a connection to a MongoDB deployment using the driver:

- Connect to MongoDB
- View Connection Options
- Specify Connection Behavior with MongoClient
- Enable Network Compression
- Enable TLS/SSL
- Connect via SOCKS5 Proxy

For authentication details, see Authentication Mechanisms and Enterprise Authentication Mechanisms.

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/connection/connect/
# Connect to MongoDB

This guide explains how to connect to a MongoDB instance or replica set using the Kotlin driver.

## MongoClient

Use the `MongoClient` class to connect to MongoDB. Create a `MongoClient` with `MongoClient.create()`. Most applications need a single `MongoClient` instance, as it represents a thread-safe connection pool. Resource limits apply to individual instances. Always call `MongoClient.close()` when done.

## Connection URI

The **connection URI** instructs the driver on connecting to a MongoDB deployment. Use the Standard Connection String Format (`mongodb`) or DNS Seed List Connection Format (`mongodb+srv`). For Atlas, refer to the Atlas driver connection guide for your connection string.

The URI includes credentials (if needed), hostname/IP, port, and connection options. Example options: `maxPoolSize=20` and `w=majority`.

## Atlas Connection Example

To connect to Atlas, create a client using a `MongoClientSettings` object with your connection string. Use the builder method to specify options and call `build()`. Set the Stable API version to avoid breaking changes.

Example code:

```kotlin
val uri = "<connection string>"
val serverApi = ServerApi.builder()
    .version(ServerApiVersion.V1)
    .build()
val settings = MongoClientSettings.builder()
    .applyConnectionString(ConnectionString(uri))
    .serverApi(serverApi)
    .build()
val mongoClient = MongoClient.create(settings)
val database = mongoClient.getDatabase("admin")
try {
    val command = Document("ping", BsonInt64(1))
    val commandResult = database.runCommand(command)
    println("Pinged your deployment. You successfully connected to MongoDB!")
} catch (me: MongoException) {
    System.err.println(me)
}
```

## Other Ways to Connect to MongoDB

### Connect to a MongoDB Server on Your Local Machine

For local development, download and install MongoDB Server, then start it. Secure your server following the Security Checklist. Use the connection string `"mongodb://localhost:<port>"` for local connections.

### Connect to a Replica Set

To connect to a replica set, specify the hostnames/IPs and ports of the members. You can provide a subset of hosts and use the `replicaSet` parameter or set `directConnection` to `false`. Include all hosts for reliability.

Examples for specifying multiple hosts:

<Tabs>

<Tab name="ConnectionString">

```kotlin
val connectionString = ConnectionString("mongodb://host1:27017,host2:27017,host3:27017/")
val mongoClient = MongoClient.create(connectionString)
```

</Tab>

<Tab name="MongoClientSettings">

```kotlin
val seed1 = ServerAddress("host1", 27017)
val seed2 = ServerAddress("host2", 27017)
val seed3 = ServerAddress("host3", 27017)
val settings = MongoClientSettings.builder()
    .applyToClusterSettings { builder ->
        builder.hosts(listOf(seed1, seed2, seed3))
    }
    .build()
val mongoClient = MongoClient.create(settings)
```

</Tab>

</Tabs>

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/connection/connection-options/
# Connection Options

This section details MongoDB connection and authentication options supported by the driver, passed as parameters in the connection URI.

| Option Name                  | Type        | Description                                                                                                                                                     |
|------------------------------|-------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **minPoolSize**              | integer     | Minimum number of connections in a pool. **Default**: `0`                                                                                                   |
| **maxPoolSize**              | integer     | Maximum number of connections in a pool. **Default**: `100`                                                                                                |
| **waitQueueTimeoutMS**       | integer     | Max time (ms) a thread waits for a connection. **Default**: `120000`                                                                                       |
| **serverSelectionTimeoutMS**  | integer     | Max time (ms) to wait for server selection before an exception. **Default**: `30000`                                                                        |
| **localThresholdMS**         | integer     | Response time threshold for replica set communication. **Default**: `15`                                                                                   |
| **heartbeatFrequencyMS**     | integer     | Frequency (ms) to check server state. **Default**: `10000`                                                                                                 |
| **replicaSet**               | string      | Indicates multiple hosts in the connection string. **Default**: `null`                                                                                     |
| **ssl**                      | boolean     | Use TLS/SSL for communication. Superseded by **tls**. **Default**: `false`                                                                                 |
| **tls**                      | boolean     | Use TLS for communication. Supersedes **ssl**. **Default**: `false`                                                                                        |
| **tlsInsecure**              | boolean     | Allow invalid hostnames for TLS connections. **Default**: `false`                                                                                          |
| **tlsAllowInvalidHostnames**  | boolean     | Allow invalid hostnames in TLS certificates. **Default**: `false`                                                                                          |
| **connectTimeoutMS**         | integer     | Max time (ms) to wait for a connection to open. **Default**: `10000`                                                                                      |
| **socketTimeoutMS**          | integer     | Max time (ms) to wait for sending/receiving a request. **Default**: `0`                                                                                   |
| **maxIdleTimeMS**            | integer     | Max idle time (ms) for a pooled connection before closing. **Default**: `0`                                                                                 |
| **maxLifeTimeMS**            | integer     | Max time (ms) to use a pooled connection before closing. **Default**: `0`                                                                                  |
| **journal**                  | boolean     | Wait for the MongoDB instance to commit to the journal for all writes. **Default**: `false`                                                                  |
| **w**                        | string/int  | Specifies write concern. **Default**: `1`                                                                                                                  |
| **wtimeoutMS**               | integer     | Time limit (ms) for write concern. **Default**: `0`                                                                                                        |
| **readPreference**           | string      | Specifies read preference. **Default**: `primary`                                                                                                          |
| **readPreferenceTags**       | string      | Specifies read preference tags. **Default**: `null`                                                                                                        |
| **maxStalenessSeconds**      | integer     | Max staleness for secondaries in seconds. **Default**: `-1`                                                                                                 |
| **authMechanism**            | string      | Specifies authentication mechanism. **Default**: Most secure based on server version.                                                                        |
| **authSource**               | string      | Database for credential validation. **Default**: `admin`                                                                                                   |
| **authMechanismProperties**  | string      | Authentication properties for the mechanism. **Default**: `null`                                                                                           |
| **appName**                  | string      | Application name for MongoDB instances during handshake. **Default**: `null`                                                                                |
| **compressors**              | string      | Compression algorithms for requests. Possible values: `zlib`, `snappy`, `zstd`. **Default**: `null`                                                        |
| **zlibCompressionLevel**      | integer     | Compression level for Zlib (range: `-1` to `9`). **Default**: `null`                                                                                       |
| **retryWrites**              | boolean     | Retry supported write operations on network errors. **Default**: `true`                                                                                     |
| **retryReads**               | boolean     | Retry supported read operations on network errors. **Default**: `true`                                                                                      |
| **serverMonitoringMode**     | string      | Server monitoring protocol. **Default**: `auto`                                                                                                            |
| **uuidRepresentation**       | string      | UUID representation for operations. **Default**: `unspecified`                                                                                              |
| **directConnection**          | boolean     | Connect directly to the host. **Default**: `false`                                                                                                         |
| **maxConnecting**            | integer     | Max concurrent connections being established. **Default**: `2`                                                                                              |
| **srvServiceName**           | string      | Service name for SRV resource records. **Default**: `mongodb`                                                                                              |

For a complete list of options, see the ConnectionString API reference page.

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/connection/mongoclientsettings/
# Specify MongoClient Settings

## Overview

Learn about settings to control `MongoClient` behavior, including:

- MongoClient Settings
- Cluster Settings
- Socket Settings
- Connection Pool Settings
- Server Settings
- TLS/SSL Settings

## MongoClient Settings

Control `MongoClient` behavior by creating a `MongoClientSettings` object with `MongoClientSettings.builder()`. Chain methods and use `build()` to create the object.

### Methods

| Method | Description |
|--------|-------------|
| `addCommandListener()` | Adds a listener for command events. |
| `applicationName()` | Sets the application name. |
| `applyConnectionString()` | Applies settings from a `ConnectionString`. |
| `applyToClusterSettings()` | Sets cluster settings. |
| `applyToConnectionPoolSettings()` | Sets connection pool settings. |
| `applyToServerSettings()` | Sets server settings. |
| `applyToSocketSettings()` | Sets socket settings. |
| `applyToSslSettings()` | Sets TLS/SSL settings. |
| `autoEncryptionSettings()` | Sets auto-encryption settings. |
| `codecRegistry()` | Sets the codec registry. |
| `commandListenerList()` | Sets command listeners. |
| `compressorList()` | Sets message compressors. |
| `credential()` | Sets the credential. |
| `readConcern()` | Sets the read concern. |
| `readPreference()` | Sets the read preference. |
| `retryReads()` | Enables retrying reads on network errors. |
| `retryWrites()` | Enables retrying writes on network errors. |
| `serverApi()` | Sets the server API for commands. |
| `streamFactoryFactory()` | Sets the `StreamFactory` factory. |
| `uuidRepresentation()` | Sets UUID representation for BSON. |
| `writeConcern()` | Sets the write concern. |

### Example

Specify a `ConnectionString`:

```kotlin
val mongoClient = MongoClient.create(
    MongoClientSettings.builder()
        .applyConnectionString(ConnectionString("<your connection string>"))
        .build()
)
```

Settings can overlap with connection string options; the last setting read takes precedence.

### Example with Overlapping Settings

```kotlin
val mongoClient = MongoClient.create(
    MongoClientSettings.builder()
        .applyConnectionString(ConnectionString("mongodb+srv:/<db_username>:<db_password>@<hostname>:<port>?connectTimeoutMS(2000)"))
        .applyToSocketSettings{ builder ->
            builder.connectTimeout(5, TimeUnit.SECONDS)
        }
        .build()
)
```

Log `MongoClient` settings by setting `org.mongodb.driver.client` logger to `INFO`.

## Cluster Settings

Modify driver behavior with `applyToClusterSettings()`.

### Methods

| Method | Description |
|--------|-------------|
| `addClusterListener()` | Adds a listener for cluster events. |
| `applyConnectionString()` | Uses settings from a `ConnectionString`. |
| `applySettings()` | Uses settings from a `ClusterSettings` object. |
| `hosts()` | Sets Mongo server locations. |
| `localThreshold()` | Sets server round trip eligibility time. |
| `mode()` | Sets connection mode to MongoDB server. |
| `requiredClusterType()` | Sets required cluster type. |
| `requiredReplicaSetName()` | Sets required replica set name. |
| `serverSelectionTimeout()` | Sets max time to select a primary node. |
| `serverSelector()` | Adds a server selector. |
| `srvHost()` | Sets host for SRV DNS record lookup. |
| `srvMaxHosts()` | Sets max hosts for SRV connection protocol. |

### Example

Connect directly to a server:

```kotlin
val mongoClient = MongoClient.create(
    MongoClientSettings.builder()
        .applyToClusterSettings{ builder ->
            builder.mode(ClusterConnectionMode.SINGLE)
        }
        .build()
)
```

## Socket Settings

Modify driver behavior with `applyToSocketSettings()`.

### Methods

| Method | Description |
|--------|-------------|
| `applyConnectionString()` | Uses settings from a `ConnectionString`. |
| `applySettings()` | Uses settings from a `SocketSettings` object. |
| `applyToProxySettings()` | Sets proxy settings. |
| `connectTimeout()` | Sets max time to connect to a socket. |
| `readTimeout()` | Sets max time to read from a socket. |
| `receiveBufferSize()` | Sets socket buffer size for receiving. |
| `sendBufferSize()` | Sets socket buffer size for sending. |

### Example

Specify socket behavior:

```kotlin
val mongoClient = MongoClient.create(
    MongoClientSettings.builder()
        .applyConnectionString(ConnectionString("<your connection string>"))
        .applyToSocketSettings{ builder ->
            builder
                .connectTimeout(10, TimeUnit.SECONDS)
                .readTimeout(15, TimeUnit.SECONDS)
        }
        .build()
)
```

## Connection Pool Settings

Modify connection pool management with `applyToConnectionPoolSettings()`.

### Methods

| Method | Description |
|--------|-------------|
| `addConnectionPoolListener()` | Adds a listener for connection pool events. |
| `applyConnectionString()` | Uses settings from a `ConnectionString`. |
| `applySettings()` | Uses settings from a `ConnectionPoolSettings` object. |
| `maintenanceFrequency()` | Sets maintenance job frequency. |
| `maintenanceInitialDelay()` | Sets initial delay for maintenance job. |
| `maxConnectionIdleTime()` | Sets max idle time before closing connection. |
| `maxConnectionLifeTime()` | Sets max lifetime for pooled connection. |
| `maxWaitTime()` | Sets max wait time for available connection. |
| `maxSize()` | Sets max connections in pool. |
| `minSize()` | Sets min connections in pool. |

### Example

Specify connection pool behavior:

```kotlin
val mongoClient = MongoClient.create(
    MongoClientSettings.builder()
        .applyConnectionString(ConnectionString("<your connection string>"))
        .applyToConnectionPoolSettings{ builder ->
            builder
                .maxWaitTime(10, TimeUnit.SECONDS)
                .maxSize(200)
        }
        .build()
)
```

## Server Settings

Modify server monitoring behavior with `applyToServerSettings()`.

### Methods

| Method | Description |
|--------|-------------|
| `addServerListener()` | Adds a listener for server events. |
| `addServerMonitorListener()` | Adds a listener for server monitor events. |
| `applyConnectionString()` | Uses settings from a `ConnectionString`. |
| `applySettings()` | Uses settings from a `ServerSettings` object. |
| `heartbeatFrequency()` | Sets cluster monitor reach interval. |
| `minHeartbeatFrequency()` | Sets min interval for monitoring checks. |
| `serverMonitoringMode()` | Specifies server monitoring protocol. |

### Example

Specify server monitoring behavior:

```kotlin
val mongoClient = MongoClient.create(
    MongoClientSettings.builder()
        .applyConnectionString(ConnectionString("<your connection string>"))
        .applyToServerSettings{ builder ->
            builder
                .minHeartbeatFrequency(700, TimeUnit.MILLISECONDS)
                .heartbeatFrequency(15, TimeUnit.SECONDS)
        }
        .build()
)
```

## TLS/SSL Settings

Modify TLS/SSL behavior with `applyToSslSettings()`.

### Methods

| Method | Description |
|--------|-------------|
| `applyConnectionString()` | Uses settings from a `ConnectionString`. |
| `applySettings()` | Uses settings from a `SslSettings` object. |
| `context()` | Sets `SSLContext` for TLS/SSL. |
| `enabled()` | Enables TLS/SSL (required for Atlas). |
| `invalidHostNameAllowed()` | Allows hostname mismatch in TLS certificate. |

### Example

Enable TLS/SSL:

```kotlin
val mongoClient = MongoClient.create(
    MongoClientSettings.builder()
        .applyConnectionString(ConnectionString("<your connection string>"))
        .applyToSslSettings{ builder ->
            builder.enabled(true)
        }
        .build()
)
```

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/connection/network-compression/
# Network Compression

The MongoDB Kotlin Driver offers message compression to reduce data transfer between MongoDB and applications. Supported algorithms include:

1. Snappy (MongoDB 3.4+)
2. Zlib (MongoDB 3.6+)
3. Zstandard (MongoDB 4.2+)

Tested library versions:

- `org.xerial.snappy:snappy-java:1.1.8.4`
- `com.github.luben:zstd-jni:1.5.5-2`

If multiple algorithms are specified, the driver selects the first supported by the MongoDB instance. Explicit dependencies for Snappy or Zstandard are required.

## Specify Compression Algorithms

Enable compression by specifying algorithms in:

- The `compressors` parameter of your `ConnectionString`
- The `compressorList()` method in `MongoClientSettings`

<Tabs>

<Tab name="ConnectionString">

To enable compression in a ConnectionString, use the `compressors` parameter with values:

- `"snappy"`
- `"zlib"`
- `"zstd"`

Example:

```kotlin
val connectionString = ConnectionString("mongodb+srv://<user>:<password>@<cluster-url>/?compressors=snappy,zlib,zstd")
val mongoClient = MongoClient.create(connectionString)
```

</Tab>

<Tab name="MongoClientSettings">

To enable compression in MongoClientSettings, call `compressorList()` with `MongoCompressor` instances:

- `createSnappyCompressor()`
- `createZlibCompressor()`
- `createZstdCompressor()`

Example:

```kotlin
val uri = "<connection string>"
val settings = MongoClientSettings.builder()
    .applyConnectionString(ConnectionString(uri))
    .compressorList(
        listOf(
            MongoCompressor.createSnappyCompressor(),
            MongoCompressor.createZlibCompressor(),
            MongoCompressor.createZstdCompressor())
    )
    .build()
val mongoClient = MongoClient.create(settings)
```

</Tab>

</Tabs>

## Compression Algorithm Dependencies

Zlib is natively supported by the JDK; Snappy and Zstandard require open-source implementations (see snappy-java and zstd-java).

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/connection/tls/
# Enable TLS/SSL on a Connection

## Overview

Learn to connect to MongoDB with TLS/SSL using JDK support. Configure TLS/SSL in the ConnectionString or MongoClientSettings. Use `-Djavax.net.debug=all` for troubleshooting.

## Enable TLS/SSL

Enable TLS/SSL via the connection string or `MongoClientSettings.Builder`. For DNS seedlist (`mongodb+srv`), TLS/SSL is enabled by default. Disable it by setting `tls=false` in the connection string or `enabled=false` in `SslSettings.Builder`.

<Tabs>

<Tab name="ConnectionString">

Enable TLS/SSL in the ConnectionString:

```kotlin
val mongoClient = MongoClient.create("mongodb+srv://<user>:<password>@<cluster-url>?tls=true")
```

</Tab>

<Tab name="MongoClientSettings">

Configure TLS/SSL with `MongoClientSettings.Builder`:

```kotlin
val settings = MongoClientSettings.builder()
    .applyConnectionString(ConnectionString("<connection string>"))
    .applyToSslSettings { builder ->
        builder.enabled(true)
    }
    .build()
val mongoClient = MongoClient.create(settings)
```

</Tab>

</Tabs>

## Configure Certificates

Kotlin apps need access to cryptographic certificates for identity verification. Configure certificates using:

- JVM Trust Store and Key Store
- Client-Specific Trust Store and Key Store

### Configure the JVM Trust Store

The JRE includes public certificates from authorities like Let's Encrypt. If your MongoDB instance uses a non-default certificate, set:

- `javax.net.ssl.trustStore`: path to the trust store
- `javax.net.ssl.trustStorePassword`: password for the trust store

Create a trust store with:

```console
keytool -importcert -trustcacerts -file <path to certificate authority file>
         -keystore <path to trust store> -storepass <password>
```

### Configure the JVM Key Store

If your MongoDB instance validates client certificates, set:

- `javax.net.ssl.keyStore`: path to the key store
- `javax.net.ssl.keyStorePassword`: password for the key store

Create a key store with keytool or openssl.

### Configure a Client-Specific Trust Store and Key Store

Use the `init()` method of `SSLContext` for client-specific configurations.

## Disable Hostname Verification

To disable hostname verification, set `invalidHostNameAllowed=true` in `applyToSslSettings()`:

```kotlin
val settings = MongoClientSettings.builder()
    .applyConnectionString(ConnectionString("<connection string>"))
    .applyToSslSettings { builder ->
        builder.enabled(true)
        builder.invalidHostNameAllowed(true)
    }
    .build()
val mongoClient = MongoClient.create(settings)
```

## Restrict Connections to TLS 1.2 Only

Set `jdk.tls.client.protocols` to "TLSv1.2" to restrict to TLS 1.2.

## Customize TLS/SSL Configuration through SSLContext

Customize SSL settings by passing an SSLContext object:

```kotlin
val sslContext = SSLContext.getDefault()

val settings = MongoClientSettings.builder()
    .applyToSslSettings { builder ->
        builder.enabled(true)
        builder.context(sslContext)
    }
    .build()
val mongoClient = MongoClient.create(settings)
```

## Online Certificate Status Protocol (OCSP)

OCSP checks if X.509 certificates are revoked. The driver supports:

- **Client-Driven OCSP**
- **OCSP Stapling**

### Client-Driven OCSP

Enable with:

- `com.sun.net.ssl.checkRevocation=true`
- `ocsp.enable=true`

### OCSP Stapling

Enable with:

- `com.sun.net.ssl.checkRevocation=true`
- `jdk.tls.client.enableStatusRequestExtension=true`

For more on OCSP, refer to Oracle JDK 8 Documentation and IETF RFC 6960.

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/connection/socks5/
# Connect to MongoDB Using a SOCKS5 Proxy

## Overview

This guide explains how to connect to MongoDB using the **SOCKS5 proxy** with the MongoDB Kotlin Driver.

## SOCKS5 Proxy Settings

Proxy settings include the SOCKS5 proxy server address and authentication credentials, specified in `MongoClientSettings` or the connection string.

### SOCKS5 Client Options

| Name            | Accepted Values       | Description                                                                 |
|-----------------|-----------------------|-----------------------------------------------------------------------------|
| **proxyHost**   | String                | SOCKS5 proxy IPv4/IPv6 address or hostname. Required for connection.      |
| **proxyPort**   | Non-negative integer   | TCP port of the SOCKS5 proxy server. Defaults to `1080` if `proxyHost` is set. |
| **proxyUsername** | String              | Username for SOCKS5 proxy authentication. Both `proxyUsername` and `proxyPassword` must be provided or omitted together. |
| **proxyPassword** | String              | Password for SOCKS5 proxy authentication. Same requirement as `proxyUsername`. |

## Examples

### Specify Proxy Settings in MongoClientSettings

```kotlin
val uri = "<connection string>"

val mongoClient = MongoClient.create(
    MongoClientSettings.builder()
        .applyConnectionString(ConnectionString(uri))
        .applyToSocketSettings { builder ->
            builder.applyToProxySettings { proxyBuilder ->
                proxyBuilder
                    .host("<proxyHost>")
                    .port("<proxyPort>".toInt())
                    .username("<proxyUsername>")
                    .password("<proxyPassword>")
                    .build()
            }
        }
        .build()
)
```

### Specify Proxy Settings in the Connection String

```kotlin
val connectionString = ConnectionString(
    "mongodb+srv://<user>:<password>@<cluster-url>/?proxyHost=<proxyHost>&proxyPort=<proxyPort>&proxyUsername=<proxyUsername>&proxyPassword=<proxyPassword>"
)

val mongoClient = MongoClient.create(connectionString)
```

### API Documentation

For more details on the methods and types, refer to:

- MongoClientSettings.Builder
- SocketSettings.Builder
- MongoClient.create()
- ProxySettings.Builder

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/auth/
# Authentication Mechanisms

## Overview

This guide covers authentication with MongoDB using available mechanisms in the MongoDB Community Edition:

- Default
- SCRAM-SHA-256
- SCRAM-SHA-1
- MONGODB-CR
- MONGODB-AWS
- X.509

For `Kerberos` or `LDAP`, refer to the Enterprise Authentication Mechanisms guide. See the Connection Guide for connection details.

## Specify an Authentication Mechanism

Specify your authentication mechanism and credentials via:

- A connection string
- A `MongoCredential` factory method

A **connection string** (or **connection URI**) details how to connect and authenticate. Use it with `MongoClient.create()` to instantiate your `MongoClient`. 

Alternatively, use the `MongoCredential` class with `MongoClientSettings.Builder` to configure your connection settings. Refer to the API documentation for:

- MongoClient.create()
- MongoClient
- MongoClientSettings.Builder
- MongoCredential

## Mechanisms

### Default

The default mechanism uses one of the following based on server support:

1. `SCRAM-SHA-256`
2. `SCRAM-SHA-1`
3. `MONGODB-CR`

Server versions 3.6 and earlier use `MONGODB-CR`. 

To specify the default mechanism:

**Connection String:**
```kotlin
val mongoClient =
    MongoClient.create("mongodb://<db_username>:<db_password>@<hostname>:<port>/?authSource=<authenticationDb>")
```

**MongoCredential:**
```kotlin
val credential = MongoCredential.createCredential("<db_username>", "<authenticationDb>", "<db_password>".toCharArray())
val settings = MongoClientSettings.builder()
        .applyToClusterSettings { builder -> builder.hosts(listOf(ServerAddress("<hostname>", "<port>"))) }
        .credential(credential)
        .build()
val mongoClient = MongoClient.create(settings)
```

### `SCRAM-SHA-256`

`SCRAM-SHA-256` is the default method from MongoDB 4.0, using a salted challenge-response mechanism.

To specify `SCRAM-SHA-256`:

**Connection String:**
```kotlin
val mongoClient =
    MongoClient.create("mongodb://<db_username>:<db_password>@<hostname>:<port>/?authSource=<authenticationDb>&authMechanism=SCRAM-SHA-256")
```

**MongoCredential:**
```kotlin
val credential = MongoCredential.createScramSha256Credential("<db_username>", "<authenticationDb>", "<db_password>".toCharArray())
val settings = MongoClientSettings.builder()
        .applyToClusterSettings { builder -> builder.hosts(listOf(ServerAddress("<hostname>", "<port>"))) }
        .credential(credential)
        .build()
val mongoClient = MongoClient.create(settings)
```

### `SCRAM-SHA-1`

`SCRAM-SHA-1` is the default for MongoDB versions 3.0 to 3.6.

To specify `SCRAM-SHA-1`:

**Connection String:**
```kotlin
val mongoClient =
    MongoClient.create("mongodb://<db_username>:<db_password>@<hostname>:<port>/?authSource=<authenticationDb>&authMechanism=SCRAM-SHA-1")
```

**MongoCredential:**
```kotlin
val credential = MongoCredential.createScramSha1Credential("<db_username>", "<authenticationDb>", "<db_password>".toCharArray())
val settings = MongoClientSettings.builder()
        .applyToClusterSettings { builder -> builder.hosts(listOf(ServerAddress("<hostname>", "<port>"))) }
        .credential(credential)
        .build()
val mongoClient = MongoClient.create(settings)
```

### `MONGODB-CR`

`MONGODB-CR` is deprecated since MongoDB 3.6 and unsupported from 4.0. Use the default mechanism for fallback.

### `MONGODB-AWS`

`MONGODB-AWS` is for MongoDB Atlas, using AWS IAM credentials.

To specify `MONGODB-AWS`:

**Using AWS SDK:**
```kotlin
val credential = MongoCredential.createAwsCredential(null, null)
val settings = MongoClientSettings.builder()
    .applyToClusterSettings { builder -> builder.hosts(listOf(ServerAddress("<atlasUri>"))) }
    .credential(credential)
    .build()
val mongoClient = MongoClient.create(settings)
```

**Connection String:**
```kotlin
val mongoClient =
    MongoClient.create("mongodb://<atlasUri>?authMechanism=MONGODB-AWS")
```

### `X.509`

`X.509` uses TLS with X.509 certificates for authentication.

To specify `X.509`:

**Connection String:**
```kotlin
val mongoClient =
    MongoClient.create("mongodb://<db_username>:<db_password>@<hostname>:<port>/?authSource=<authenticationDb>&authMechanism=MONGODB-X509&tls=true")
```

**MongoCredential:**
```kotlin
val credential = MongoCredential.createMongoX509Credential()
val settings = MongoClientSettings.builder()
    .applyToClusterSettings { builder -> builder.hosts(listOf(ServerAddress("<hostname>", "<port>"))) }
    .applyToSslSettings { builder -> builder.enabled(true) }
    .credential(credential)
    .build()
val mongoClient = MongoClient.create(settings)
```

For more on certificates and TLS/SSL, see the TLS/SSL guide.

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/enterprise-auth/
# Enterprise Authentication Mechanisms

## Overview

This guide covers authentication with MongoDB using mechanisms available in MongoDB Enterprise Edition:

- Kerberos (GSSAPI)
- LDAP (PLAIN)
- MONGODB-OIDC

Refer to the Connection Guide for connection details.

## Specify an Authentication Mechanism

Specify your authentication mechanism and credentials via:

- A connection string
- A `MongoCredential` factory method

A **connection string** specifies how to connect and authenticate. Use it with `MongoClient.create()` to instantiate your `MongoClient`. The Connection String tab provides syntax for this.

Alternatively, use the `MongoCredential` class to specify authentication details. Use `MongoClientSettings.Builder` to configure connection settings. Refer to the API documentation for:

- MongoClient.create()
- MongoClient
- MongoClientSettings.Builder
- MongoCredential

## Mechanisms

### Kerberos (GSSAPI)

The GSSAPI mechanism allows user authentication to a Kerberos service using the principal name. Use the following placeholders:

- `Kerberos principal` - URL-encoded principal name, e.g., "username%40REALM.ME"
- `hostname` - MongoDB server address
- `port` - MongoDB server port

**Connection String:**

```kotlin
val connectionString = ConnectionString("<Kerberos principal>@<hostname>:<port>/?authSource=$external&authMechanism=GSSAPI")
val mongoClient = MongoClient.create(connectionString)
```

**MongoCredential:**

```kotlin
val credential = MongoCredential.createGSSAPICredential("<Kerberos principal>")
val settings = MongoClientSettings.builder()
        .applyToClusterSettings { builder -> builder.hosts(listOf(ServerAddress("<hostname>", <port>))) }
        .credential(credential)
        .build()
val mongoClient = MongoClient.create(settings)
```

Specify realm and KDC properties for Kerberos:

```none
java.security.krb5.realm=MYREALM.ME
java.security.krb5.kdc=mykdc.myrealm.me
```

Additional properties may include:

- `SERVICE_NAME`
- `CANONICALIZE_HOST_NAME`
- `JAVA_SUBJECT`
- `JAVA_SASL_CLIENT_PROPERTIES`
- `JAVA_SUBJECT_PROVIDER`

**GSSAPI Additional Properties:**

```kotlin
val connectionString = ConnectionString("<Kerberos principal>@<hostname>:<port>/?authSource=$external&authMechanism=GSSAPI&authMechanismProperties=SERVICE_NAME:myService")
val mongoClient = MongoClient.create(connectionString)
```

**MongoCredential with Additional Properties:**

```kotlin
val credential = MongoCredential.createGSSAPICredential("<Kerberos principal>")
    .withMechanismProperty(MongoCredential.SERVICE_NAME_KEY, "myService")
```

### LDAP (PLAIN)

*Available in MongoDB Enterprise Edition 3.4 and later.*

Authenticate to an LDAP server using your username and password. Set `authMechanism` to `PLAIN`.

**Connection String:**

```kotlin
val connectionString = ConnectionString("<LDAP username>:<password>@<hostname>:<port>/?authSource=$external&authMechanism=PLAIN")
val mongoClient = MongoClient.create(connectionString)
```

**MongoCredential:**

```kotlin
val credential = MongoCredential.createPlainCredential("<LDAP username>", "$external", "<password>".toCharArray())
val settings = MongoClientSettings.builder()
    .applyToClusterSettings { builder -> builder.hosts(listOf(ServerAddress("<hostname>", <port>))) }
    .credential(credential)
    .build()
val mongoClient = MongoClient.create(settings)
```

### MONGODB-OIDC

Requires MongoDB server v7.0 or later on Linux.

**Azure IMDS:**

**Connection String:**

```kotlin
val connectionString = ConnectionString("mongodb://<OIDC principal>@<hostname>:<port>/?authMechanism=MONGODB-OIDC&authMechanismProperties=ENVIRONMENT:azure,TOKEN_RESOURCE:<percent-encoded audience>")
val mongoClient = MongoClient.create(connectionString)
```

**MongoCredential:**

```kotlin
val credential = MongoCredential.createOidcCredential("<OIDC principal>")
    .withMechanismProperty("ENVIRONMENT", "azure")
    .withMechanismProperty("TOKEN_RESOURCE", "<audience>")
val mongoClient = MongoClient.create(MongoClientSettings.builder()
    .applyToClusterSettings { builder -> builder.hosts(listOf(ServerAddress("<hostname>", <port>))) }
    .credential(credential)
    .build())
```

**GCP IMDS:**

**Connection String:**

```kotlin
val connectionString = ConnectionString("mongodb://<OIDC principal>@<hostname>:<port>/?authMechanism=MONGODB-OIDC&authMechanismProperties=ENVIRONMENT:gcp,TOKEN_RESOURCE:<percent-encoded audience>")
val mongoClient = MongoClient.create(connectionString)
```

**MongoCredential:**

```kotlin
val credential = MongoCredential.createOidcCredential("<OIDC principal>")
    .withMechanismProperty("ENVIRONMENT", "gcp")
    .withMechanismProperty("TOKEN_RESOURCE", "<audience>")
val mongoClient = MongoClient.create(MongoClientSettings.builder()
    .applyToClusterSettings { builder -> builder.hosts(listOf(ServerAddress("<hostname>", <port>))) }
    .credential(credential)
    .build())
```

**Custom Callback:**

For platforms without built-in support, define a custom callback:

```kotlin
val credential = MongoCredential.createOidcCredential(null)
    .withMechanismProperty("OIDC_CALLBACK") { context: Context ->
        val accessToken = "..."
        OidcCallbackResult(accessToken)
    }
```

Example for retrieving an OIDC token from a file:

```kotlin
val credential = MongoCredential.createOidcCredential(null)
    .withMechanismProperty("OIDC_CALLBACK") { context: Context ->
        val accessToken = String(Files.readAllBytes(Paths.get("access-token.dat")))
        OidcCallbackResult(accessToken)
    }
val mongoClient = MongoClient.create(MongoClientSettings.builder()
    .applyToClusterSettings { builder -> builder.hosts(listOf(ServerAddress("<hostname>", <port>))) }
    .credential(credential)
    .build())
```

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/stable-api/
# Stable API

The Stable API feature requires MongoDB Server 5.0 or later. Use it only if all connected MongoDB servers support it.

## Overview

This guide explains how to specify the **Stable API** when connecting to a MongoDB instance or replica set. The Stable API forces the server to run operations compatible with the specified **API version**, which defines expected operation behavior and server response format. Changing the API version may lead to incompatibility in operations and responses. Using the Stable API with an official MongoDB driver allows updates without backward compatibility issues.

Refer to the MongoDB reference page on the Stable API for more details.

## Enable the Stable API on a MongoDB Client

To enable the Stable API, specify an API version in your MongoDB client settings. Instantiate a `MongoClient` with the specified API version to use that version for all commands. For multiple API versions, create separate clients. Disable the "strict" option for commands not covered by the Stable API.

Example of instantiating a `MongoClient` with a Stable API version:

```kotlin
val serverApi = ServerApi.builder()
    .version(ServerApiVersion.V1)
    .build()

val uri = "<connection string>"

val settings = MongoClientSettings.builder()
    .applyConnectionString(ConnectionString(uri))
    .serverApi(serverApi)
    .build()

val client = MongoClient.create(settings)
```

If you connect to a server that does not support the specified API version, an exception may occur:

```none
'Unrecognized field 'apiVersion' on server...
```

For more information, see the API Documentation for:

- ServerApi
- ServerApi.Builder
- ServerApiVersion
- ServerAddress
- MongoClientSettings
- MongoClientSettings.Builder
- MongoClient.create()
- MongoClient

## Stable API Options

You can enable or disable optional Stable API behaviors:

| Option Name        | Description                                                                 |
|--------------------|-----------------------------------------------------------------------------|
| Strict             | **Optional**. Raises an exception for commands not in the declared API version. Default: **false** |
| DeprecationErrors  | **Optional**. Raises an exception for deprecated commands in the declared API version. Default: **false** |

Example of setting options on a `ServerApi` instance:

```kotlin
val serverApi = ServerApi.builder()
    .version(ServerApiVersion.V1)
    .strict(true)
    .deprecationErrors(true)
    .build()
```

For more information, see the API Documentation for:

- strict()
- deprecationErrors()

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/databases-collections/
# Databases and Collections

## Overview

This guide covers using MongoDB databases and collections with the MongoDB Kotlin driver. MongoDB organizes data hierarchically:

1. **Databases**: Top-level data organization.
2. **Collections**: Contain **documents**.
3. **Documents**: Store data types like strings, numbers, and embedded documents.

You can model data using Kotlin data classes or the Document class. Refer to the Data Class Data Format and Document Data Format guides for more details.

## Access a Database

Use `getDatabase()` of a `MongoClient` to access a `MongoDatabase`. Example:

```kotlin
val database = client.getDatabase("testDatabase")
```

## Access a Collection

Use `getCollection()` of a `MongoDatabase` to access a `MongoCollection`. Example:

```kotlin
data class ExampleDataClass(
    @BsonId val id: ObjectId = ObjectId(),
    val exampleProperty: String,
)

val collection = database.getCollection<ExampleDataClass>("testCollection")
```

MongoDB creates the collection if it doesn't exist upon the first data insertion.

### Specify Return Type

Specify a return class using `MongoCollection.withDocumentClass()`. This is useful for collections with multiple data types or when using projections. Example:

```kotlin
data class Fruit(
    @BsonId val id: Int,
    val name: String,
    val qty: Int,
    val seasons: List<String>
)

val collection = database.getCollection<Fruit>("fruits")

data class NewFruit(
    @BsonId val id: Int,
    val name: String,
    val quantity: Int,
    val seasons: List<String>
)

val filter = Filters.eq(Fruit::name.name, "strawberry")
val update = Updates.combine(
    Updates.rename(Fruit::qty.name, "quantity"),
    Updates.push(Fruit::seasons.name, "fall"),
)
val options = FindOneAndUpdateOptions().returnDocument(ReturnDocument.AFTER)

val result = collection.withDocumentClass<NewFruit>().findOneAndUpdate(filter, update, options)
println(result)
```

```console
NewFruit(id=1, name=strawberry, quantity=205, seasons=[summer, fall])
```

## Create a Collection

Use `createCollection()` of a `MongoDatabase` to create a collection. Example:

```kotlin
database.createCollection("exampleCollection")
```

Specify options like maximum size and validation rules using `CreateCollectionOptions`. Example for document validation:

```kotlin
val collOptions: ValidationOptions = ValidationOptions().validator(
    Filters.or(
        Filters.exists("title"),
        Filters.exists("name")
    )
)
database.createCollection("movies", CreateCollectionOptions().validationOptions(collOptions))
```

## Get a List of Collections

Query for collections using `MongoDatabase.listCollectionNames()`:

```kotlin
val collectionList = database.listCollectionNames().toList()
println(collectionList)
```

```console
[movies, exampleCollection]
```

## Drop a Collection

Remove a collection using `MongoCollection.drop()`:

```kotlin
val collection = database.getCollection<ExampleDataClass>("movies")
collection.drop()
```

Dropping a collection deletes all documents and indexes within it.

## Specify Read Preferences, Read Concerns, and Write Concerns

**Read preferences**, **read concerns**, and **write concerns** control read operations and acknowledgment for writes in a MongoDB replica set. They inherit settings from the `MongoClient`. Use the following methods to create instances with different settings:

- `MongoDatabase.withReadConcern()`
- `MongoDatabase.withReadPreference()`
- `MongoDatabase.withWriteConcern()`
- `MongoCollection.withReadConcern()`
- `MongoCollection.withReadPreference()`
- `MongoCollection.withWriteConcern()`

These methods create new instances while retaining original settings. For more information, see the Server manual on Read Preference, Read Concern, and Write Concern.

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/data-formats/
# Data Formats

- **Document Data Format**: Data Classes
- **Document Data Format**: BSON
- **Document Data Format**: Extended JSON
- **Documents**
- **Kotlin Serialization**
- **Codecs**

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/data-formats/document-data-format-data-class/
# Document Data Format: Data Classes

## Overview

Learn to store and retrieve data in the MongoDB Kotlin Driver using **Kotlin data classes**.

## Serialize and Deserialize a Data Class

The driver supports encoding and decoding Kotlin data classes via the **default codec registry**, which defines how to handle Kotlin and Java types.

### Example Data Class

```kotlin
data class DataStorage(val productName: String, val capacity: Double)
```

### Insert a Data Class

Insert a `DataStorage` instance:

```kotlin
val collection = database.getCollection<DataStorage>("data_storage")
val record = DataStorage("tape", 5.0)
collection.insertOne(record)
```

### Retrieve a Data Class

Retrieve documents as `DataStorage` instances:

```kotlin
val collection = database.getCollection<DataStorage>("data_storage_devices")
val resultsFlow = collection.find()
resultsFlow.collect { println(it) }
```

```console
DataStorage(productName=tape, capacity=5.0)
```

You can use builder methods with data class properties by adding the Kotlin driver extensions dependency. 

You can specify a different class for returned documents. For example, update a `DataStorage` document and return it as `NewDataStorage`:

```kotlin
data class NewDataStorage(val productName: String, val capacity: Double, val releaseDate: LocalDate)

val filter = Filters.eq(DataStorage::productName.name, "tape")
val update = Updates.currentDate("releaseDate")
val options = FindOneAndUpdateOptions().returnDocument(ReturnDocument.AFTER)

val result = collection.withDocumentClass<NewDataStorage>().findOneAndUpdate(filter, update, options)
println("Updated document: $result")
```

```console
Updated document: NewDataStorage(productName=tape, capacity=5.0, releaseDate=2023-06-15)
```

## Specify Component Conversion Using Annotations

Use annotations to configure serialization behavior:

| Annotation Name | Description |
|------------------|-------------|
| `BsonId` | Marks a property as `_id`. |
| `BsonProperty` | Specifies a custom BSON field name. |
| `BsonRepresentation` | Specifies BSON type for storage. |

### Example Annotated Data Class

```kotlin
data class NetworkDevice(
    @BsonId
    @BsonRepresentation(BsonType.OBJECT_ID)
    val deviceId: String,
    val name: String,
    @BsonProperty("type")
    val deviceType: String
)
```

### Insert an Annotated Data Class

Insert a `NetworkDevice` instance:

```kotlin
val collection = database.getCollection<NetworkDevice>("network_devices")
val deviceId = ObjectId().toHexString()
val device = NetworkDevice(deviceId, "Enterprise Wi-fi", "router")
collection.insertOne(device)
```

### Retrieve an Annotated Data Class

Retrieve documents as `NetworkDevice` instances:

```kotlin
val collection = database.getCollection<NetworkDevice>("network_devices")
val resultsFlow = collection.find()
resultsFlow.collect { println(it) }
```

```console
NetworkDevice(deviceId=645cf..., name=Enterprise Wi-fi, deviceType=router)
```

## Operations with Recursive Types

The driver supports encoding and decoding of recursively defined data classes. Example:

```kotlin
data class DataClassTree(val content: String, val left: DataClassTree?, val right: DataClassTree?)
```

Perform read and write operations on recursive data classes:

```kotlin
val collection = database.getCollection<DataClassTree>("myCollection")
val filter = Filters.eq("left.left.right.content", "high german")
val resultsFlow = collection.find(filter)
resultsFlow.collect { println(it) }
```

```console
DataClassTree(content=indo-european, left=DataClassTree(content=germanic, left=DataClassTree(content=german, left=null, right=DataClassTree(content=high german, ...)), right=...)
```

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/data-formats/document-data-format-bson/
# Document Data Format: BSON

## Overview

Learn about BSON, its use in MongoDB, and how to install the BSON library independently of the MongoDB Kotlin driver.

## BSON Data Format

**BSON** (Binary JSON) is the format MongoDB uses for data storage, supporting all JSON types plus dates, various integers, ObjectIds, and binary data. For a complete list of types, see the BSON Types server manual.

BSON is binary and not human-readable, but the BSON library can convert it to JSON. More on JSON and BSON can be found in our related article.

## MongoDB and BSON

The MongoDB Kotlin driver uses the BSON library, allowing interaction with BSON data through object types implementing the BSON interface, including:

- Document
- BsonDocument
- RawBsonDocument
- JsonObject

Refer to our Documents guide for more on these types.

## Install the BSON Library

To add the BSON library as a dependency, if you have the MongoDB Kotlin driver, you can skip this step as it includes BSON. For driver installation, see our Quick Start guide.

Use Maven or Gradle for dependency management. Below are the dependency declarations:

<Tabs>

<Tab name="Maven">

```xml
<dependencies>
    <dependency>
        <groupId>org.mongodb</groupId>
        <artifactId>bson</artifactId>
        <version>5.3.0</version>
    </dependency>
</dependencies>
```

</Tab>

<Tab name="Gradle">

```kotlin
dependencies {
   implementation("org.mongodb:bson:5.3.0")
}
```

</Tab>

</Tabs>

If not using these tools, download the JAR file directly from the sonatype repository.

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/data-formats/document-data-format-extended-json/
# Document Data Format: Extended JSON

## Overview

This guide covers using the Extended JSON format in the MongoDB Kotlin driver, which represents BSON types with keys prefixed by "`$`". Topics include:

- Different MongoDB Extended JSON formats
- Using the BSON library for conversions
- Custom BSON type conversions

## Extended JSON Formats

MongoDB Extended JSON has various string formats for BSON data, each conforming to JSON RFC. The **extended** (canonical) format preserves all BSON type information, while **Relaxed mode** is more concise but loses some type details. 

| Name          | Description                                                                                     |
|---------------|-------------------------------------------------------------------------------------------------|
| **Extended**  | Preserves BSON type information, less human-readable.                                         |
| **Relaxed Mode** | More human-readable, loses some type information.                                           |
| **Shell**     | Matches MongoDB shell syntax, uses JavaScript functions for types.                            |
| **Strict**    | *Deprecated.* Legacy format fully conforms to JSON RFC.                                       |

The driver parses `$uuid` from a string to a `BsonBinary` object. For more details, refer to the Extended JSON specification.

### Extended JSON Examples

Examples of a document with ObjectId, date, and long number in each format:

**Extended:**
```json
{
  "_id": { "$oid": "573a1391f29313caabcd9637" },
  "createdAt": { "$date": { "$numberLong": "1601499609" }},
  "numViews": { "$numberLong": "36520312" }
}
```

**Relaxed Mode:**
```json
{
  "_id": { "$oid": "573a1391f29313caabcd9637" },
  "createdAt": { "$date": "2020-09-30T18:22:51.648Z" },
  "numViews": 36520312
}
```

**Shell:**
```json
{
  "_id:": ObjectId("573a1391f29313caabcd9637"),
  "createdAt": ISODate("2020-09-30T18:22:51.648Z"),
  "numViews": NumberLong("36520312")
}
```

**Strict:**
```json
{
  "_id:": { "$oid": "573a1391f29313caabcd9637" },
  "createdAt": { "$date": 1601499609 },
  "numViews": { "$numberLong": "36520312" }
}
```

## Read Extended JSON

### Using Document Classes

Use `parse()` from `Document` or `BsonDocument` to read Extended JSON into a Kotlin document object:

```kotlin
val ejsonStr = """
        { "_id": { "${"$"}oid": "507f1f77bcf86cd799439011"},
        "myNumber": {"${"$"}numberLong": "4794261" }}
    """.trimIndent()

val doc = Document.parse(ejsonStr)
println(doc)
```

### Using the BSON Library

Use `JsonReader` to read Extended JSON into Kotlin objects:

```kotlin
val ejsonStr = """
    { "_id": { "${"$"}oid": "507f1f77bcf86cd799439011"},
      "myNumber": {"${"$"}numberLong": "4794261" }}
    """.trimIndent()

val jsonReader = JsonReader(ejsonStr)
jsonReader.readStartDocument()
val id = jsonReader.readObjectId()
val myNumber = jsonReader.readInt64()
jsonReader.readEndDocument()
println(id.toString() + " is type: " + id.javaClass.name)
println(myNumber.toString() + " is type: " + myNumber.javaClass.name)
jsonReader.close()
```

## Write Extended JSON

### Using Document Classes

Write Extended JSON from `Document` or `BsonDocument` using `toJson()`:

```kotlin
val myDoc = Document().append("_id", ObjectId("507f1f77bcf86cd799439012"))
    .append("myNumber", 11223344)

val settings = JsonWriterSettings.builder().outputMode(JsonMode.RELAXED).build()
myDoc.toJson(settings)
```

### Using the BSON Library

Output Extended JSON from Kotlin objects using `JsonWriter`:

```kotlin
val settings = JsonWriterSettings.builder().outputMode(JsonMode.EXTENDED).build()

JsonWriter(BufferedWriter(OutputStreamWriter(System.out)), settings).use { jsonWriter ->
    jsonWriter.writeStartDocument()
    jsonWriter.writeObjectId("_id", ObjectId("507f1f77bcf86cd799439012"))
    jsonWriter.writeInt64("myNumber", 11223344)
    jsonWriter.writeEndDocument()
    jsonWriter.flush()
}
```

## Custom BSON Type Conversion

Customize output by adding converters to `JsonWriterSettings.Builder`:

```kotlin
val settings = JsonWriterSettings.builder()
    .outputMode(JsonMode.RELAXED)
    .objectIdConverter { value, writer -> writer.writeString(value.toHexString()) }
    .timestampConverter { value, writer ->
        val ldt = LocalDateTime.ofInstant(Instant.ofEpochSecond(value.time.toLong()), ZoneOffset.UTC)
        writer.writeString(ldt.format(DateTimeFormatter.ISO_DATE_TIME))
    }
    .build()

val doc = Document()
    .append("_id", ObjectId("507f1f77bcf86cd799439012"))
    .append("createdAt", BsonTimestamp(1601516589,1))
    .append("myNumber", 4794261)

println(doc.toJson(settings))
```

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/data-formats/documents/
# Documents

## Overview

This guide explains how to use **documents** in the MongoDB Kotlin driver. A MongoDB document is a BSON format data structure with key/value fields, used for storing data and issuing commands or queries.

The MongoDB Kotlin driver and BSON library include the following classes for BSON data manipulation:

| Name          | Package       | Implements Map                | Recommended Usage                     |
|---------------|---------------|-------------------------------|---------------------------------------|
| `Document`    | `org.bson`    | Yes, implements `Map<String, Object>` | Flexible and concise data representation. |
| `BsonDocument`| `org.bson`    | Yes, implements `Map<String, BsonValue>` | Type-safe API.                        |
| `JsonObject`  | `org.bson.json` | No                        | Work with JSON strings only.         |

We recommend using the `Document` class for its flexibility in representing complex documents.

## Document

The `Document` class allows access and manipulation of BSON fields using Kotlin types. Here’s a mapping of BSON to Kotlin types:

| BSON type | Kotlin type                     |
|-----------|---------------------------------|
| Array     | `kotlin.collections.List`       |
| Binary    | `org.bson.types.Binary`        |
| Boolean   | `kotlin.Boolean`                |
| Date      | `java.time.LocalDateTime`      |
| Document  | `org.bson.Document`            |
| Double    | `kotlin.Double`                |
| Int32     | `kotlin.Int`                   |
| Int64     | `kotlin.Long`                  |
| Null      | `null`                         |
| ObjectId  | `org.bson.types.ObjectId`      |
| String    | `kotlin.String`                |

Example of creating a `Document`:

```kotlin
val author = Document("_id", ObjectId())
    .append("name", "Gabriel García Márquez")
    .append("dateOfDeath", LocalDateTime.of(2014, 4, 17, 4, 0))
    .append("novels", listOf(
        Document("title", "One Hundred Years of Solitude").append("yearPublished", 1967),
        Document("title", "Chronicle of a Death Foretold").append("yearPublished", 1981),
        Document("title", "Love in the Time of Cholera").append("yearPublished", 1985)
    ))
```

To insert this document:

```kotlin
val database = mongoClient.getDatabase("fundamentals_data")
val collection = database.getCollection<Document>("authors")
val result = collection.insertOne(author)
```

To retrieve the document:

```kotlin
val doc = collection.find(Filters.eq("name", "Gabriel García Márquez")).firstOrNull()
doc?.let {
    println("_id: ${it.getObjectId("_id")}, name: ${it.getString("name")}, dateOfDeath: ${it.getDate("dateOfDeath")}")
    it.getList("novels", Document::class.java).forEach { novel ->
        println("title: ${novel.getString("title")}, yearPublished: ${novel.getInteger("yearPublished")}")
    }
}
```

## BsonDocument

The `BsonDocument` class provides a type-safe API for BSON documents. Here’s a mapping of BSON to BSON library types:

| BSON type | BSON library type               |
|-----------|---------------------------------|
| Array     | `org.bson.BsonArray`           |
| Binary    | `org.bson.BsonBinary`          |
| Boolean   | `org.bson.Boolean`              |
| Date      | `org.bson.BsonDateTime`        |
| Document  | `org.bson.BsonDocument`        |
| Double    | `org.bson.BsonDouble`          |
| Int32     | `org.bson.BsonInt32`           |
| Int64     | `org.bson.BsonInt64`           |
| Null      | `org.bson.BsonNull`            |
| ObjectId  | `org.bson.BsonObjectId`        |
| String    | `org.bson.BsonString`          |

Example of creating a `BsonDocument`:

```kotlin
val author = BsonDocument()
    .append("_id", BsonObjectId())
    .append("name", BsonString("Gabriel García Márquez"))
    .append("dateOfDeath", BsonDateTime(LocalDateTime.of(2014, 4, 17, 0, 0).atZone(ZoneId.of("America/New_York")).toInstant().toEpochMilli()))
    .append("novels", BsonArray(listOf(
        BsonDocument().append("title", BsonString("One Hundred Years of Solitude")).append("yearPublished", BsonInt32(1967)),
        BsonDocument().append("title", BsonString("Chronicle of a Death Foretold")).append("yearPublished", BsonInt32(1981)),
        BsonDocument().append("title", BsonString("Love in the Time of Cholera")).append("yearPublished", BsonInt32(1985))
    )))
```

To insert this document:

```kotlin
val collection = database.getCollection<BsonDocument>("authors")
val result: InsertOneResult = collection.insertOne(author)
```

To retrieve the document:

```kotlin
val doc = collection.find(Filters.eq("name", "Gabriel García Márquez")).firstOrNull()
doc?.let {
    println("_id: ${it.getObjectId("_id").value}, name: ${it.getString("name").value}, dateOfDeath: ${Instant.ofEpochMilli(it.getDateTime("dateOfDeath").value).atZone(ZoneId.of("America/New_York")).toLocalDateTime()}")
    it.getArray("novels").forEach { novel ->
        val novelDocument = novel.asDocument()
        println("title: ${novelDocument.getString("title").value}, yearPublished: ${novelDocument.getInt32("yearPublished").value}")
    }
}
```

## JsonObject

The `JsonObject` class wraps JSON strings, allowing you to work with JSON data without converting to a `Map`. It stores Extended JSON by default, customizable via `JsonObjectCodec` and `JsonWriterSettings`.

Example of creating a `JsonObject`:

```kotlin
val ejsonStr = """
    {"_id": {"${"$"}oid": "6035210f35bd203721c3eab8"},
    "name": "Gabriel García Márquez",
    "dateOfDeath": {"${"$"}date": "2014-04-17T04:00:00Z"},
    "novels": [
        {"title": "One Hundred Years of Solitude","yearPublished": 1967},
        {"title": "Chronicle of a Death Foretold","yearPublished": 1981},
        {"title": "Love in the Time of Cholera","yearPublished": 1985}]}
    """.trimIndent()

val author = JsonObject(ejsonStr)
```

To insert this document:

```kotlin
val collection = database.getCollection<JsonObject>("authors")
val result = collection.insertOne(author)
```

To retrieve the JSON data:

```kotlin
val query = JsonObject("{\"name\": \"Gabriel Garc\\u00eda M\\u00e1rquez\"}")
val jsonResult = collection.find(query).firstOrNull()
jsonResult?.let {
    println("query result in extended json format: " + jsonResult.json)
}
```

## Summary

This guide covered classes for working with BSON data, including usage examples for building documents, inserting them into collections, and retrieving/accessing typed fields.

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/data-formats/serialization/
# Kotlin Serialization

## Overview

The Kotlin driver supports `kotlinx.serialization` for serializing and deserializing Kotlin objects, providing an efficient `Bson` serializer for `@Serializable` classes. The `bson-kotlinx` library can be installed for custom codecs with configurations for defaults, nulls, and class discriminators. Use the `Codec` interface for custom encoding/decoding. Kotlin serialization is preferred if familiar with the framework, but the `Json` serializer requires a custom serializer for BSON types like `ObjectId`.

### Supported Types

The driver supports all Kotlin types from the Kotlin serialization library and all BSON types.

## Add Kotlin Serialization to Your Project

Add the following dependencies for Gradle:

```kotlin
implementation("org.jetbrains.kotlinx:kotlinx-serialization-core:1.6.0")
implementation("org.mongodb:bson-kotlinx:5.3.0")
```

For Maven:

```xml
<dependency>
    <groupId>org.jetbrains.kotlinx</groupId>
    <artifactId>kotlinx-serialization-core</artifactId>
    <version>1.6.0</version>
</dependency>
<dependency>
    <groupId>org.mongodb</groupId>
    <artifactId>bson-kotlinx</artifactId>
    <version>5.3.0</version>
</dependency>
```

## Annotate Data Classes

Mark Kotlin data classes as serializable with `@Serializable`. Use `@SerialName` for BSON property names and `@Contextual` for BSON types like `ObjectId`.

```kotlin
@Serializable
data class PaintOrder(
    @SerialName("_id") @Contextual val id: ObjectId?,
    val color: String,
    val qty: Int,
    @SerialName("brand") val manufacturer: String = "Acme"
)
```

Annotations from `org.bson.codecs.pojo.annotations` cannot be used on `@Serializable` classes.

### Custom Serializer Example

Create a custom serializer using the `KSerializer` interface. Specify it in the `@Serializable` annotation.

```kotlin
object InstantAsBsonDateTime : KSerializer<Instant> {
    override val descriptor: SerialDescriptor = PrimitiveSerialDescriptor("InstantAsBsonDateTime", PrimitiveKind.LONG)

    override fun serialize(encoder: Encoder, value: Instant) {
        if (encoder is BsonEncoder) encoder.encodeBsonValue(BsonDateTime(value.toEpochMilliseconds()))
        else throw SerializationException("Instant not supported by ${encoder::class}")
    }

    override fun deserialize(decoder: Decoder): Instant {
        if (decoder is BsonDecoder) return Instant.fromEpochMilliseconds(decoder.decodeBsonValue().asDateTime().value)
        else throw SerializationException("Instant not supported by ${decoder::class}")
    }
}

@Serializable
data class PaintOrder(
    val color: String,
    val qty: Int,
    @Serializable(with = InstantAsBsonDateTime::class) val orderDate: Instant,
)
```

## Customize the Serializer Configuration

Use `KotlinSerializerCodec` from `org.bson.codecs.kotlinx` to create a codec for `@Serializable` classes. Define configurations with `BsonConfiguration`.

Add the `bson-kotlinx` dependency:

```kotlin
implementation("org.mongodb:bson-kotlinx:5.3.0")
```

Example of creating a codec that does not encode defaults:

```kotlin
val myCustomCodec = KotlinSerializerCodec.create<PaintOrder>(
    bsonConfiguration = BsonConfiguration(encodeDefaults = false)
)

val registry = CodecRegistries.fromRegistries(
    CodecRegistries.fromCodecs(myCustomCodec), collection.codecRegistry
)
```

## Polymorphic Serialization

The driver supports polymorphic classes. Mark a sealed interface and its data classes with `@Serializable`. The driver adds a `_t` discriminator field when inserting instances.

### Polymorphic Data Classes Example

```kotlin
@Serializable
sealed interface Person {
    val name: String
}

@Serializable
data class Student(@Contextual @SerialName("_id") val id: ObjectId, override val name: String, val grade: Int) : Person

@Serializable
data class Teacher(@Contextual @SerialName("_id") val id: ObjectId, override val name: String, val department: String) : Person
```

Perform operations with polymorphic classes:

```kotlin
val collection = database.getCollection<Person>("school")
collection.insertOne(Teacher(ObjectId(), "Vivian Lee", "History"))
collection.insertOne(Student(ObjectId(), "Kate Parker", 10))
```

## Serialize Dates and Times

### kotlinx-datetime Library

Add the `kotlinx-datetime` dependency:

```kotlin
implementation("org.jetbrains.kotlinx:kotlinx-datetime:0.6.1")
```

### Example Data Class with Dates and Times

Implement serializers from `kotlinx-datetime`:

```kotlin
@Serializable
data class Appointment(val name: String, @Contextual val date: LocalDate, val time: LocalTime)
```

Insert an instance into the `appointments` collection:

```kotlin
val collection = database.getCollection<Appointment>("appointments")
collection.insertOne(Appointment("Daria Smith", LocalDate(2024, 10, 15), LocalTime(hour = 11, minute = 30)))
```

In MongoDB, `LocalDate` is stored as a BSON date, and `time` as a string.

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/data-formats/codecs/
# Codecs

## Overview

This guide covers **Codecs** for encoding and decoding Kotlin objects to BSON in the MongoDB Kotlin driver. The `Codec` abstraction maps Kotlin types to BSON types, allowing direct mapping of domain objects without intermediate objects.

Key sections include:

- Codec
- CodecRegistry
- CodecProvider
- Custom Codec Example

## Codec

The `Codec` interface defines methods for serializing and deserializing Kotlin objects to BSON. Implement the `encode()`, `decode()`, and `getEncoderClass()` methods.

### `encode()` Method Parameters:

- `writer`: An instance of `BsonWriter` for writing BSON documents.
- `value`: The data to encode, matching the implementation type.
- `encoderContext`: Metadata about the Kotlin object being encoded.

The `decode()` method returns a Kotlin object from BSON data, requiring:

- `bsonReader`: An instance of `BsonReader` for reading BSON documents.
- `decoderContext`: Metadata about the BSON data being decoded.

The `getEncoderClass()` method returns the Kotlin class instance.

### Custom Codec Example

```kotlin
enum class PowerStatus { ON, OFF }

class PowerStatusCodec : Codec<PowerStatus> {
    override fun encode(writer: BsonWriter, value: PowerStatus, encoderContext: EncoderContext) = writer.writeBoolean(value == PowerStatus.ON)
    override fun decode(reader: BsonReader, decoderContext: DecoderContext): PowerStatus = if (reader.readBoolean()) PowerStatus.ON else PowerStatus.OFF
    override fun getEncoderClass(): Class<PowerStatus> = PowerStatus::class.java
}
```

Add `PowerStatusCodec` to your `CodecRegistry`.

## CodecRegistry

A `CodecRegistry` is an immutable collection of `Codec` instances. Construct it using:

- `fromCodecs()`
- `fromProviders()`
- `fromRegistries()`

Example:

```kotlin
val codecRegistry = CodecRegistries.fromCodecs(IntegerCodec(), PowerStatusCodec())
```

Retrieve `Codec` instances:

```kotlin
val powerStatusCodec = codecRegistry.get(PowerStatus::class.java)
```

## CodecProvider

A `CodecProvider` creates `Codec` instances for a `CodecRegistry`. Ensure `Codec` objects for class fields are instantiated before the class `Codec`.

Example:

```kotlin
class MonolightCodec(registry: CodecRegistry) : Codec<Monolight> {
    private val powerStatusCodec: Codec<PowerStatus> = registry[PowerStatus::class.java]
    private val integerCodec: Codec<Int> = IntegerCodec()

    override fun encode(writer: BsonWriter, value: Monolight, encoderContext: EncoderContext) {
        writer.writeStartDocument()
        writer.writeName("powerStatus")
        powerStatusCodec.encode(writer, value.powerStatus, encoderContext)
        writer.writeName("colorTemperature")
        integerCodec.encode(writer, value.colorTemperature, encoderContext)
        writer.writeEndDocument()
    }

    override fun decode(reader: BsonReader, decoderContext: DecoderContext): Monolight { /*...*/ }
    override fun getEncoderClass(): Class<Monolight> = Monolight::class.java
}
```

### Default Codec Registry

The default codec registry specifies conversions for common Kotlin and MongoDB types. Override behavior by specifying registries in order of precedence.

Example:

```kotlin
val newRegistry = CodecRegistries.fromRegistries(CodecRegistries.fromCodecs(MyEnumCodec()), MongoClientSettings.getDefaultCodecRegistry())
```

## BsonTypeClassMap

`BsonTypeClassMap` maps BSON to Kotlin types. Modify mappings by passing a `Map`.

Example:

```kotlin
val bsonTypeClassMap = BsonTypeClassMap()
val clazz = bsonTypeClassMap[BsonType.ARRAY]
```

## Custom Codec Example

Implement `Codec` and `CodecProvider` for custom classes. Alternatively, use Kotlin serialization with `@Serializable` classes.

Example custom class:

```kotlin
data class Monolight(var powerStatus: PowerStatus = PowerStatus.OFF, var colorTemperature: Int? = null)
```

Implement `MonolightCodec`:

```kotlin
class MonolightCodec(registry: CodecRegistry) : Codec<Monolight> { /*...*/ }
```

Implement `MonolightCodecProvider`:

```kotlin
class MonolightCodecProvider : CodecProvider {
    override fun <T> get(clazz: Class<T>, registry: CodecRegistry): Codec<T>? = if (clazz == Monolight::class.java) MonolightCodec(registry) as Codec<T> else null
}
```

Example usage:

```kotlin
fun main() = runBlocking {
    val mongoClient = MongoClient.create("<connection string uri>")
    val codecRegistry = CodecRegistries.fromRegistries(CodecRegistries.fromCodecs(IntegerCodec(), PowerStatusCodec()), CodecRegistries.fromProviders(MonolightCodecProvider()), MongoClientSettings.getDefaultCodecRegistry())
    val collection = mongoClient.getDatabase("codecs_example_products").getCollection<Monolight>("monolights").withCodecRegistry(codecRegistry)

    val myMonolight = Monolight(PowerStatus.ON, 5200)
    collection.insertOne(myMonolight)
    val lights = collection.find().toList()
    println(lights)
}
```

For more information, see the API Documentation for `withCodecRegistry()`, `MongoClientSettings.getDefaultCodecRegistry()`, `Codec`, and `CodecProvider`.

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/
# CRUD Operations

CRUD (Create, Read, Update, Delete) operations allow interaction with MongoDB data.

- Read Operations return documents from the database.

- Write Operations insert, modify, or delete documents.

Some operations combine read and write aspects. Refer to our guide on compound operations for more details.

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/read-operations/
# Read Operations

- **Retrieve Data**: Use `collection.find()` to fetch documents.

- **Access Data From a Flow**: Use `collection.find().asFlow()` for reactive streams.

- **Open Change Streams**: Use `collection.watch()` to listen for changes.

- **Sort Results**: Use `collection.find().sort()` to order results.

- **Skip Returned Results**: Use `collection.find().skip(n)` to bypass documents.

- **Limit Returned Results**: Use `collection.find().limit(n)` to restrict results.

- **Specify Fields to Return**: Use `collection.find().projection()` to select fields.

- **Search Geospatially**: Use `$geoWithin` for geospatial queries.

- **Search Text**: Use `$text` for text search capabilities.

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/read-operations/retrieve/
# Retrieve Data

## Overview

This guide explains how to retrieve data from a MongoDB database using read operations, which include:

- Retrieving documents with a find operation
- Transforming documents with an aggregate operation
- Monitoring real-time changes with change streams

### Sample Data

Examples are based on a paint store's `paint_order` collection:

```json
{ "_id": 1, "color": "purple", "qty": 10 }
{ "_id": 2, "color": "green", "qty": 8 }
{ "_id": 3, "color": "purple", "qty": 4 }
{ "_id": 4, "color": "green", "qty": 11 }
```

Kotlin data class:

```kotlin
data class PaintOrder(
    @BsonId val id: Int,
    val qty: Int,
    val color: String
)
```

## Find Operation

Use the `find()` method on a `MongoCollection` to retrieve a subset of data. Specify the query filter to determine which documents to return.

### Example

To find orders with quantities greater than 3 and less than 9:

```kotlin
val filter = Filters.and(Filters.gt("qty", 3), Filters.lt("qty", 9))
val resultsFlow = collection.find(filter)

resultsFlow.collect { println(it) }
```

```console
PaintOrder(id=2, qty=8, color=green)
PaintOrder(id=3, qty=4, color=purple)
```

For more on filters, see the Filters Builders guide.

## Aggregate Operation

Use the `aggregate()` method on a `MongoCollection` to perform an aggregation pipeline, which processes data in stages.

### Example

To find the most purchased paint color:

```kotlin
data class AggregationResult(@BsonId val id: String, val qty: Int)

val filter = Filters.empty()
val pipeline = listOf(
    Aggregates.match(filter),
    Aggregates.group("\$color", Accumulators.sum("qty", "\$qty")),
    Aggregates.sort(Sorts.descending("qty"))
)
val resultsFlow = collection.aggregate<AggregationResult>(pipeline)

resultsFlow.collect { println(it) }
```

```console
PaintOrder(id=2, qty=8, color=green)
PaintOrder(id=3, qty=4, color=purple)
```

After running the aggregation, "green" is identified as the most purchased color.

For more on aggregation pipelines, see the MongoDB server manual. For method details, refer to:

- MongoCollection.find()
- MongoCollection.aggregate()

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/read-operations/flow/
# Access Data From a Flow

## Overview

This guide explains how to access data using a `Flow` with the MongoDB Kotlin driver. A `Flow` represents a stream of asynchronously computed values, used for database read operations. The `find()` method creates a `FindFlow` to browse documents based on search criteria.

## Terminal Methods

Terminal methods execute operations on the MongoDB server after configuring a `Flow` instance.

### Find the First Document

Use `firstOrNull()` to retrieve the first document or `null` if none exist:

```kotlin
val resultsFlow = collection.find()
val firstResultOrNull = resultsFlow.firstOrNull()
```

Use `first()` to retrieve the first document or throw `NoSuchElementException` if none exist:

```kotlin
try {
    val resultsFlow = collection.find()
    val firstResult = resultsFlow.first()
} catch (e: NoSuchElementException) {
    println("No results found")
}
```

### Count Number of Results

Use `count()` to get the number of results:

```kotlin
val resultsFlow = collection.find()
val count = resultsFlow.count()
```

### Convert Results to a List

Use `toList()` to store query results in a `List`:

```kotlin
val resultsFlow = collection.find()
val results = resultsFlow.toList()
```

### Iterate through Results

Use `collect()` to iterate through documents:

```kotlin
val resultsFlow = collection.find()
resultsFlow.collect { println(it) }
```

### Explain the Query

Use `explain()` to view execution plans and performance statistics. Specify verbosity levels for detail:

| Verbosity Level          | Use Case                                           |
|-------------------------|---------------------------------------------------|
| ALL_PLANS_EXECUTIONS    | Know which plan MongoDB will choose.              |
| EXECUTION_STATS         | Assess query performance.                          |
| QUERY_PLANNER           | Diagnose query issues.                            |

Example to print the JSON representation of the winning plan:

```kotlin
val explanation = collection.find().explain(ExplainVerbosity.EXECUTION_STATS)
val jsonSummary = explanation.getEmbedded(
    listOf("queryPlanner", "winningPlan"),
    Document::class.java
).toJson()
println(jsonSummary)
```

```json
{ "stage": "COLLSCAN", "direction": "forward" }
```

For more on the explain operation, see the Server Manual Entries: Explain Output, Query Plans. For methods and classes, refer to the API Documentation: collect(), explain(), ExplainVerbosity.

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/read-operations/change-streams/
# Open Change Streams

## Overview

This guide explains how to use a **change stream** to monitor real-time changes in your MongoDB database. Change streams allow applications to subscribe to data changes on a collection, database, or deployment, with options to filter and transform data. In MongoDB v6.0+, you can include document data before and after changes.

Learn to open and configure change streams in the following sections:

- Open a Change Stream
- Apply Aggregation Operators
- Split Large Change Stream Events
- Include Pre-images and Post-images

## Open a Change Stream

To open a change stream, call the `watch()` method on a `MongoCollection`, `MongoDatabase`, or `MongoClient`. Standalone deployments don't support change streams due to the need for a replica set oplog.

- `watch()` on `MongoCollection` monitors a collection.
- `watch()` on `MongoDatabase` monitors all collections.
- `watch()` on `MongoClient` monitors all changes in the deployment.

### Example

```kotlin
val job = launch {
    val changeStream = collection.watch()
    changeStream.collect {
        println("Received a change event: $it")
    }
}
job.cancel()
```

An insert operation might produce:

```
Received a change event: ChangeStreamDocument{
   operationType='insert',
   resumeToken={"_data": "825EC..."},
   namespace=myDb.myChangeStreamCollection,
   ...
}
```

For more on `watch()`, see:

- MongoCollection.watch()
- MongoDatabase.watch()
- MongoClient.watch()

## Apply Aggregation Operators

Pass an aggregation pipeline to `watch()` to filter change events.

### Example

```kotlin
val pipeline = listOf(
    Aggregates.match(Filters.`in`("operationType", listOf("insert", "update")))
)

val job = launch {
    val changeStream = collection.watch(pipeline)
    changeStream.collect {
        println("Received a change event: $it")
    }
}
job.cancel()
```

An update event might output:

```text
Received a change event: ChangeStreamDocument{
operationType=update,
resumeToken={...},
...
```

## Split Large Change Stream Events

In MongoDB v7.0+, use `$changeStreamSplitLargeEvent` to split events over 16 MB into smaller fragments. Each fragment includes a `splitEvent` object with `fragment` and `of` fields.

### Example

```kotlin
val pipeline = listOf(BsonDocument().append("\$changeStreamSplitLargeEvent", BsonDocument()))

val job = launch {
    val changeStream = collection.watch(pipeline)
    changeStream.collect {
        println("Received a change event: $it")
    }
}
```

Only one `$changeStreamSplitLargeEvent` stage is allowed, and it must be last.

## Include Pre-images and Post-images

Configure change events to include:

- **Pre-image**: Document version before the operation.
- **Post-image**: Document version after the operation.

To receive these, connect to MongoDB v6.0+ and enable them for the collection.

### Create a Collection with Pre-Image and Post-Images Enabled

```kotlin
val collectionOptions = CreateCollectionOptions()
collectionOptions.changeStreamPreAndPostImagesOptions(ChangeStreamPreAndPostImagesOptions(true))
database.createCollection("myChangeStreamCollection", collectionOptions)
```

Modify existing collections with the `collMod` command.

### Pre-image Configuration Example

```kotlin
val job = launch {
    val changeStream = collection.watch()
        .fullDocumentBeforeChange(FullDocumentBeforeChange.REQUIRED)
    changeStream.collect {
        println(it)
    }
}
job.cancel()
```

Example output for an update:

```text
Received a change event: ChangeStreamDocument{
   operationType=update,
   resumeToken={...},
   fullDocumentBeforeChange=Document{{_id=6388..., latestVersion=2.0.0, ...}},
   ...
}
```

### Post-image Configuration Example

```kotlin
val job = launch {
    val changeStream = collection.watch()
        .fullDocument(FullDocument.UPDATE_LOOKUP)
    changeStream.collect {
        println(it)
    }
}
job.cancel()
```

Example output for an update:

```text
Received a change event: ChangeStreamDocument{
   operationType=update,
   resumeToken={...},
   fullDocument=Document{{_id=6388..., city=Springfield, population=950, ...}},
   updatedFields={"population": 950}, ...
   ...
}
```

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/read-operations/sort/
# Sort Results

## Overview

This guide explains how to use **sort** operations with the MongoDB Kotlin driver to order results from read operations. Sort criteria define how data is ordered, such as:

- Smallest to largest number
- Earliest to latest time
- Alphabetical order

You will learn to:

- Perform ascending and descending sorts
- Combine sort criteria
- Sort by text score

Sample collection documents:

```json
{ "_id": 1, "date": "2022-01-03", "orderTotal": 17.86, "description": "1/2 lb cream cheese and 1 dozen bagels" },
{ "_id": 2, "date": "2022-01-11", "orderTotal": 83.87, "description": "two medium vanilla birthday cakes" },
{ "_id": 3, "date": "2022-01-11", "orderTotal": 19.49, "description": "1 dozen vanilla cupcakes" },
{ "_id": 4, "date": "2022-01-15", "orderTotal": 43.62, "description": "2 chicken lunches and a diet coke" },
{ "_id": 5, "date": "2022-01-23", "orderTotal": 60.31, "description": "one large vanilla and chocolate cake" },
{ "_id": 6, "date": "2022-01-23", "orderTotal": 10.99, "description": "1 bagel, 1 orange juice, 1 muffin" }
```

Kotlin data class:

```kotlin
data class Order(
    @BsonId val id: Int,
    val date: String,
    val orderTotal: Double,
    val description: String,
)
```

## Methods For Sorting

Sort results using the `sort()` method of a `FindFlow` instance or `Aggregates.sort()` in an aggregation pipeline. Both methods accept objects implementing the `Bson` interface.

Example using `sort()`:

```kotlin
val resultsFlow = collection.find().sort(Sorts.ascending(Order::orderTotal.name))
```

Example using `Aggregates.sort()`:

```kotlin
val resultsFlow = collection.aggregate(listOf(
    Aggregates.sort(Sorts.ascending(Order::orderTotal.name))
))
resultsFlow.collect { println(it) }
```

Sort criteria are specified using the `Sorts` builder class.

## Sorting Direction

Sort direction can be **ascending** or **descending**. Ascending sorts from smallest to largest; descending sorts from largest to smallest.

### Ascending

Specify an ascending sort with `Sorts.ascending()`:

```kotlin
collection.find().sort(Sorts.ascending("<field name>"))
```

Example:

```kotlin
val resultsFlow = collection.find()
    .sort(Sorts.ascending(Order::orderTotal.name))
resultsFlow.collect { println(it) }
```

### Descending

Specify a descending sort with `Sorts.descending()`:

```kotlin
val resultsFlow = collection.find()
    .sort(Sorts.descending(Order::orderTotal.name))
resultsFlow.collect { println(it) }
```

### Handling Ties

MongoDB does not guarantee sort order for ties. To ensure a specific order, specify additional fields:

```kotlin
collection.find().sort(Sorts.ascending(Order::date.name, Order::orderTotal.name))
```

### Combining Sort Criteria

Use `Sorts.orderBy()` to combine sort criteria:

```kotlin
val orderBySort = Sorts.orderBy(
    Sorts.descending(Order::date.name), Sorts.ascending(Order::orderTotal.name)
)
val results = collection.find().sort(orderBySort)
results.collect { println(it) }
```

## Text Search

Order results of a text search by text score using `Sorts.metaTextScore()`. A text index is required.

Example:

```kotlin
collection.createIndex(Indexes.text(Order::description.name))
val metaTextScoreSort = Sorts.orderBy(
    Sorts.metaTextScore(OrderScore::score.name),
    Sorts.descending("_id")
)
val metaTextScoreProj = Projections.metaTextScore(OrderScore::score.name)
val searchTerm = "vanilla"
val searchQuery = Filters.text(searchTerm)

val results = collection.find<OrderScore>(searchQuery)
    .projection(metaTextScoreProj)
    .sort(metaTextScoreSort)

results.collect { println(it) }
```

The structure of text search has changed in MongoDB 4.4 or later; projecting `Projections.metaTextScore()` is no longer necessary for sorting.

For more information, see the API Documentation for Filters, Indexes, Projections, and Sorts.

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/read-operations/skip/
# Skip Returned Results

## Overview

Learn to skip a specified number of results using the MongoDB Kotlin driver. Use the `skip()` method to omit documents from the beginning of a FindFlow or the `$skip` stage in an aggregation pipeline.

The `skip()` method takes an integer for the number of documents to skip. For example, to skip the first two documents:

```kotlin
collection.find().skip(2)
```

The `Aggregates.skip()` method in an aggregation pipeline also skips documents:

```kotlin
val filter = Filters.empty()
val results = collection.aggregate(listOf(
    Aggregates.match(filter),
    Aggregates.skip(2))
)
```

## Examples

Consider a paint store with eight colors tracked in the `paint_inventory` collection:

```json
{ "_id": 1, "color": "red", "qty": 5 }
{ "_id": 2, "color": "purple", "qty": 10 }
{ "_id": 3, "color": "blue", "qty": 9 }
{ "_id": 4, "color": "white", "qty": 6 }
{ "_id": 5, "color": "yellow", "qty": 11 }
{ "_id": 6, "color": "pink", "qty": 3 }
{ "_id": 7, "color": "green", "qty": 8 }
{ "_id": 8, "color": "orange", "qty": 7 }
```

Modeled with:

```kotlin
data class PaintOrder(
    @BsonId val id: Int,
    val qty: Int,
    val color: String
)
```

To find the three best-selling colors, query the `paint_inventory` collection, sort by `qty`, and skip the first five results.

### Using a FindIterable

```kotlin
val filter = Filters.empty()
val results = collection.find(filter)
    .sort(descending(PaintOrder::qty.name))
    .skip(5)
results.collect { println(it) }
```

```console
PaintOrder(id=4, qty=6, color=white)
PaintOrder(id=1, qty=5, color=red)
PaintOrder(id=6, qty=3, color=pink)
```

### Using Aggregation

```kotlin
val filter = Filters.empty()
val aggregate = listOf(
    Aggregates.match(filter),
    Aggregates.sort(descending(PaintOrder::qty.name)),
    Aggregates.skip(5)
)
val findFlow = collection.aggregate(aggregate)
findFlow.collect { println(it) }
```

```console
PaintOrder(id=4, qty=6, color=white)
PaintOrder(id=1, qty=5, color=red)
PaintOrder(id=6, qty=3, color=pink)
```

If `skip()` exceeds the number of matched documents, no results return. For example, skipping nine documents:

```kotlin
val filter = Filters.empty()
val emptyQuery = listOf(
    Aggregates.match(filter),
    Aggregates.sort(descending(PaintOrder::qty.name)),
    Aggregates.skip(9)
)
val findFlow = collection.aggregate(emptyQuery)
findFlow.collect { println(it) }
```

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/read-operations/limit/
# Limit the Number of Returned Results

## Overview

Learn to limit results from read operations with the MongoDB Kotlin driver using `limit()`, which caps the number of documents returned. If fewer documents exist than the limit, a smaller number is returned. When combined with `skip()`, the skip applies first, followed by the limit. For more on `skip()`, refer to the guide on Skipping Returned Documents.

### Sample Documents

Example documents:

```json
{ "_id": 1, "title": "The Brothers Karamazov", "author": "Dostoyevsky", "length": 824 }
{ "_id": 2, "title": "Les Misérables", "author": "Hugo", "length": 1462 }
{ "_id": 3, "title": "Atlas Shrugged", "author": "Rand", "length": 1088 }
{ "_id": 4, "title": "Infinite Jest", "author": "Wallace", "length": 1104 }
{ "_id": 5, "title": "Cryptonomicon", "author": "Stephenson", "length": 918 }
{ "_id": 6, "title": "A Dance with Dragons", "author": "Martin", "length": 1104 }
```

Kotlin data class:

```kotlin
data class Book(
    @BsonId val id: Int,
    val title: String,
    val author: String,
    val length: Int
)
```

## Specify a Limit

Query to return the top three longest books:

```kotlin
val results = collection.find()
    .sort(descending("length"))
    .limit(3)

results.collect { println(it) }
```

```console
  Book(id=2, title=Les Misérables, author=Hugo, length=1462)
  Book(id=6, title=A Dance with Dragons, author=Martin, length=1104)
  Book(id=4, title=Infinite Jest, author=Wallace, length=1104)
```

The order of `limit()` and `sort()` does not matter:

```kotlin
collection.find().sort(descending("length")).limit(3)
collection.find().limit(3).sort(descending("length"))
```

## Combining Skip and Limit

To get the next three longest books, use `skip()`:

```kotlin
val results = collection.find()
    .sort(descending("length"))
    .skip(3)
    .limit(3)

results.collect { println(it) }
```

```console
  Book(id=3, title=Atlas Shrugged, author=Rand, length=1088)
  Book(id=5, title=Cryptonomicon, author=Stephenson, length=918)
  Book(id=1, title=The Brothers Karamazov, author=Dostoyevsky, length=824)
```

Combine `skip()` and `limit()` for paging. Ensure stable sorts by using a unique key (e.g., `_id`). Sorting by non-unique fields may yield unpredictable results.

Example data:

```json
{ type: "computer", data: "1", serial_no: 235235 }
{ type: "computer", data: "2", serial_no: 235237 }
{ type: "computer", data: "3", serial_no: 235239 }
{ type: "computer", data: "4", serial_no: 235241 }
```

Sort by unique keys like `data` or `serial_no` for stability.

For more on the methods and classes, see the API Documentation:

- FindFlow.collect()
- MongoCollection.find()

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/read-operations/project/
# Specify Which Fields to Return

## Overview

Learn to control fields in documents returned from read operations with the MongoDB Kotlin driver. By default, queries return all fields, but you can use a **projection** to return only the necessary data.

A projection is a document that instructs MongoDB which fields to return. Use the Projections class to create a projection document.

## Behavior

Projections can:

- Explicitly include fields, implicitly excluding unspecified fields.
- Implicitly exclude fields, implicitly including unspecified fields.

These methods are mutually exclusive. The `_id` field is **not** subject to these rules; it must be explicitly excluded if not needed.

## Explanation

Consider this collection of fruit documents:

```json
{ "_id": 1, "name": "apples", "qty": 5, "rating": 3 },
{ "_id": 2, "name": "bananas", "qty": 7, "rating": 1 },
{ "_id": 3, "name": "oranges", "qty": 6, "rating": 2 },
{ "_id": 4, "name": "avocados", "qty": 3, "rating": 5 },
```

Modeled with the Kotlin data class:

```kotlin
data class Fruit(
    @BsonId val id: Int,
    val name: String,
    val qty: Int,
    val rating: Int
)
```

To return only the `name` field:

```kotlin
data class FruitName(
    @BsonId val id: Int? = null,
    val name: String
)

val filter = Filters.empty()
val projection = Projections.fields(
    Projections.include(FruitName::name.name)
)
val flowResults = collection.find<FruitName>(filter).projection(projection)

flowResults.collect { println(it) }
```

```console
FruitName(id=1, name=apples),
FruitName(id=2, name=bananas),
FruitName(id=3, name=oranges),
FruitName(id=4, name=avocados)
```

The projection includes the `name` field, implicitly excluding `qty` and `rating`. The `_id` field is included by default unless explicitly excluded.

To exclude the `_id` field:

```kotlin
val projection = Projections.fields(
    Projections.include(FruitName::name.name),
    Projections.excludeId()
)
val flowResults = collection.find<FruitName>(filter).projection(projection)

flowResults.collect { println(it) }
```

```console
FruitName(name=apples),
FruitName(name=bananas),
FruitName(name=oranges),
FruitName(name=avocados)
```

This projection includes `name` and excludes `_id`, also excluding `qty` and `rating`.

You can include multiple fields in your projection without affecting their return order. For example, to include `name` and `rating`:

```kotlin
data class FruitRating(
    val name: String,
    val rating: Int
)

val projection = Projections.fields(
    Projections.include(FruitRating::name.name, FruitRating::rating.name),
    Projections.excludeId()
)
val flowResults = collection.find<FruitRating>(filter).projection(projection)

flowResults.collect { println(it) }
```

```console
FruitRating(name=apples, rating=3),
FruitRating(name=bananas, rating=1),
FruitRating(name=oranges, rating=2),
FruitRating(name=avocados, rating=5)
```

For more projection examples, see the MongoDB Manual page on Project Fields to Return from Query.

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/read-operations/geo/
# Search Geospatially

## Overview

Learn to search **geospatial data** with the MongoDB Kotlin Driver and the supported formats.

Geospatial data represents geographical locations, such as:

- Movie theater locations
- Country borders
- Bicycle routes
- Dog exercise areas in NYC

## Coordinates on Earth

Use **GeoJSON** to store and query geospatial data in MongoDB. Example of MongoDB headquarters in GeoJSON:

```json
"MongoDB Headquarters" : {
   "type": "point",
   "coordinates": [-73.986805, 40.7620853]
}
```

### GeoJSON Positions

A position is an array of two or three numbers:

- Longitude (required)
- Latitude (required)
- Elevation (optional)

GeoJSON uses longitude first, which differs from some geographic conventions.

### GeoJSON Types

Common GeoJSON types include:

- `Point`: a single position.
- `LineString`: an array of two or more positions.
- `Polygon`: an array of positions where the first and last are the same.

### Index

To query GeoJSON data, add it to a `2dsphere` index:

```kotlin
collection.createIndex(Indexes.geo2dsphere("location.geo"))
```

## Coordinates on a 2D Plane

Store geospatial data using `x` and `y` coordinates (legacy coordinate pairs):

```json
"<field name>" : [ x, y ]
```

### Index

To query legacy coordinate pairs, add them to a `2d` index:

```kotlin
collection.createIndex(Indexes.geo2d("coordinates"))
```

## Geospatial Queries

Geospatial queries use a query operator and GeoJSON shapes.

### Query Operators

Use these operators:

- `$near`
- `$geoWithin`
- `$nearSphere`
- `$geoIntersects` (requires a 2dsphere index)

Specify them with `near()`, `geoWithin()`, `nearSphere()`, and `geoIntersects()` methods in the `Filters` builder.

### Query Parameters

Use `Position`, `Point`, `LineString`, and `Polygon` classes for shapes.

## Examples

Using the `theaters` collection in the `sample_mflix` database, with the following imports:

```kotlin
import com.mongodb.client.model.geojson.Point
import com.mongodb.client.model.geojson.Polygon
import com.mongodb.client.model.geojson.Position
import com.mongodb.client.model.Filters.near
import com.mongodb.client.model.Filters.geoWithin
import com.mongodb.client.model.Projections.fields
import com.mongodb.client.model.Projections.include
import com.mongodb.client.model.Projections.excludeId
```

Data modeled with:

```kotlin
data class Theater(
    val theaterId: Int,
    val location: Location
) {
    data class Location(
        val address: Address,
        val geo: Point
    ) {
        data class Address(
            val street1: String,
            val street2: String? = null,
            val city: String,
            val state: String,
            val zipcode: String
        )
    }
}
```

Results modeled with:

```kotlin
data class TheaterResults(
    val location: Location
) {
    data class Location(
        val address: Address
    ) {
        data class Address(
            val city: String
        )
    }
}
```

### Query by Proximity

Use `near()` to find documents from nearest to farthest:

```kotlin
val centralPark = Point(Position(-73.9667, 40.78))
val query = Filters.near(
    "${Theater::location.name}.${Theater.Location::geo.name}", centralPark, 10000.0, 5000.0
)
val projection = Projections.fields(
    Projections.include("${Theater::location.name}.${Theater.Location::address.name}.${Theater.Location.Address::city.name}"),
    Projections.excludeId()
)
val resultsFlow = collection.find(query).projection(projection)

resultsFlow.collect { println(it) }
```

### Query Within a Range

Use `geoWithin()` to search within a specified shape:

```kotlin
val longIslandTriangle = Polygon(
    listOf(
        Position(-72.0, 40.0),
        Position(-74.0, 41.0),
        Position(-72.0, 39.0),
        Position(-72.0, 40.0)
    )
)
val geoWithinComparison = Filters.geoWithin(
    "${Theater::location.name}.${Theater.Location::geo.name}", longIslandTriangle
)
val resultsFlow = collection.find<TheaterResults>(geoWithinComparison)
    .projection(projection)

resultsFlow.collect { println(it) }
```

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/read-operations/text/
# Search Text

## Overview

This guide explains how to run a **text search** in the MongoDB Kotlin driver to retrieve documents containing a **term** or **phrase** in a specified field.

### Sample Documents

Examples use the `fast_and_furious_movies` collection, which includes documents with a title and tags.

```json
{ "_id": 1, "title": "2 Fast 2 Furious ", "tags": ["undercover", "drug dealer"] }
{ "_id": 2, "title": "Fast 5", "tags": ["bank robbery", "full team"] }
{ "_id": 3, "title": "Furious 7", "tags": ["emotional"] }
{ "_id": 4, "title": "The Fate of the Furious", "tags": ["betrayal"] }
```

Kotlin data class:

```kotlin
data class Movies(
    @BsonId val id: Int,
    val title: String,
    val tags: List<String>
)
```

### Text Index

Create a **text index** on the `title` field before running a text search:

```kotlin
collection.createIndex(Indexes.text("title"))
```

## Text Search

Use `Filters.text()` to specify a text search. Pass the query filter to the `find()` method to execute the search.

### Specify Options

Include `TextSearchOptions` for options like case sensitivity:

```kotlin
val options: TextSearchOptions = TextSearchOptions().caseSensitive(true)
val filter = Filters.text("SomeText", options)
```

### Search Text by a Term

Pass a term to `Filters.text()` for a text search.

#### Example

Search for titles containing "fast":

```kotlin
val filter = Filters.text("fast")
val findFlow = collection.find(filter)
findFlow.collect { println(it) }
```

```console
Movies(id=1, title=2 Fast 2 Furious, tags=[undercover, drug dealer])
Movies(id=2, title=Fast 5, tags=[bank robbery, full team])
```

To match multiple terms, separate them with spaces:

```kotlin
val filter = Filters.text("fate 7")
val findFlow = collection.find(filter)
findFlow.collect { println(it) }
```

```console
Movies(id=3, title=Furious 7, tags=[emotional])
Movies(id=4, title=The Fate of the Furious, tags=[betrayal])
```

### Search Text by a Phrase

Use escaped quotes for phrases:

```kotlin
val filter = Filters.text("\"fate of the furious\"")
val findFlow = collection.find(filter)
findFlow.collect { println(it) }
```

```console
Movies(id=4, title=The Fate of the Furious, tags=[betrayal])
```

### Search Text with Terms Excluded

Prefix excluded terms with a minus sign:

```kotlin
val filter = Filters.text("furious -fast")
val findFlow = collection.find(filter)
findFlow.collect { println(it) }
```

```console
Movies(id=3, title=Furious 7, tags=[emotional])
Movies(id=4, title=The Fate of the Furious, tags=[betrayal])
```

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/write-operations/
# Write Operations

- **Insert Operations**: Use `collection.insertOne(document)` or `collection.insertMany(documents)` to add documents.

- **Delete Documents**: Use `collection.deleteOne(filter)` or `collection.deleteMany(filter)` to remove documents.

- **Modify Documents**: Use `collection.replaceOne(filter, replacement)` to replace a document.

- **Update Arrays in a Document**: Use `collection.updateOne(filter, Updates.push("arrayField", value))` to update array fields.

- **Insert or Update in a Single Operation**: Use `collection.updateOne(filter, Updates.set("field", value), UpdateOptions().upsert(true))` for upsert.

- **Bulk Operations**: Use `collection.bulkWrite(operations)` for multiple write operations in one call.

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/write-operations/insert/
# Insert Operations

## Overview

This guide covers how to insert documents using the MongoDB Kotlin driver. Insert operations are essential for adding user profiles and orders to MongoDB, using `insertOne()`, `insertMany()`, and `bulkWrite()` methods. This section focuses on `insertOne()` and `insertMany()`.

Example Kotlin data class for a paint store:

```kotlin
data class PaintOrder(
    @BsonId val id: ObjectId? = null,
    val qty: Int,
    val color: String
)
```

## A Note About `_id`

MongoDB requires each document to have a unique `_id` field. You can manage this field yourself or let the driver generate unique ObjectId values. It's recommended to let the driver handle `_id` generation to avoid `WriteError` from duplicate values.

## Insert a Single Document

Use `insertOne()` to insert a single document. It returns an `InsertOneResult` with the new document's `_id`.

### Example

```kotlin
val paintOrder = PaintOrder(ObjectId(), 5, "red")
val result = collection.insertOne(paintOrder)

val insertedId = result.insertedId?.asObjectId()?.value
println("Inserted a document with the following id: $insertedId")
```

```console
Inserted a document with the following id: 60930c39a982931c20ef6cd6
```

## Insert Multiple Documents

Use `insertMany()` to insert multiple documents. It processes documents in order until an exception occurs. For example:

```json
{ "color": "red", "qty": 5 }
{ "color": "purple", "qty": 10 }
{ "color": "yellow", "qty": 3 }
{ "color": "blue", "qty": 8 }
```

If an error occurs, previously inserted documents remain in the collection. Use a try-catch block to handle exceptions:

```kotlin
val result = collection.insertMany(paintOrders)
try {
    println("Inserted documents with the following ids: ${result.insertedIds}")
} catch(e: MongoBulkWriteException){
    val insertedIds = e.writeResult.inserts.map { it.id.asInt32().value }
    println("A MongoBulkWriteException occurred, but there are successfully processed documents with the following ids: $insertedIds")
    collection.find().collect { println(it) }
}
```

```console
A MongoBulkWriteException occurred, but there are successfully processed documents with the following ids: [60930c3aa982931c20ef6cd7, 644ad1378ea29443837a14e9, 60930c3aa982931c20ef6cd8]
```

### Example

```kotlin
val paintOrders = listOf(
    PaintOrder(ObjectId(), 5, "red"),
    PaintOrder(ObjectId(), 10, "purple")
)
val result = collection.insertMany(paintOrders)

println("Inserted documents with the following ids: ${result.insertedIds.toList()}")
```

```console
Inserted documents with the following ids: [60930c3aa982931c20ef6cd7, 60930c3aa982931c20ef6cd8]
```

## Summary

To perform insert operations, use:

- `insertOne()` for a single document.
- `insertMany()` for multiple documents.

Both methods generate an `_id` if omitted and return an instance representing the new document's `_id` on success.

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/write-operations/delete/
# Delete Documents

## Overview

Learn to remove documents with the MongoDB Kotlin driver using `deleteOne()`, `deleteMany()`, or `findOneAndDelete()` methods.

- `deleteOne()`: Deletes the first matching document.
- `deleteMany()`: Deletes all matching documents.
- `findOneAndDelete()`: Atomically finds and deletes the first match.

Use `DeleteOptions` for collation or index hints with `deleteOne()` and `deleteMany()`. Use `FindOneAndDeleteOptions` for collation, index hints, sort order, or projection with `findOneAndDelete()`.

Filter by a unique index, like `_id`, when deleting a single document.

### Sample Documents

Example documents in the `paint_inventory` collection:

```json
{ "_id": 1, "color": "red", "qty": 5 }
{ "_id": 2, "color": "purple", "qty": 8 }
{ "_id": 3, "color": "blue", "qty": 0 }
{ "_id": 4, "color": "white", "qty": 0 }
{ "_id": 5, "color": "yellow", "qty": 6 }
{ "_id": 6, "color": "pink", "qty": 0 }
{ "_id": 7, "color": "green", "qty": 0 }
{ "_id": 8, "color": "black", "qty": 8 }
```

Kotlin data class:

```kotlin
data class PaintOrder(
    @BsonId val id: Int,
    val qty: Int,
    val color: String
)
```

## Delete Many Documents

To remove out-of-stock colors, query `paint_inventory` where `qty` is `0` and use `deleteMany()`:

```kotlin
val filter = Filters.eq("qty", 0)
collection.deleteMany(filter)
```

Remaining documents:

```json
{ "_id": 1, "color": "red", "qty": 5 }
{ "_id": 2, "color": "purple", "qty": 8 }
{ "_id": 5, "color": "yellow", "qty": 6 }
{ "_id": 8, "color": "black", "qty": 8 }
```

## Delete a Document

To remove yellow paint, query `paint_inventory` where `color` is `"yellow"` and use `deleteOne()`:

```kotlin
val filter = Filters.eq("color", "yellow")
collection.deleteOne(filter)
```

Remaining documents:

```json
{ "_id": 1, "color": "red", "qty": 5 }
{ "_id": 2, "color": "purple", "qty": 8 }
{ "_id": 8, "color": "black", "qty": 8 }
```

## Find and Delete a Document

To raffle purple paint, query `paint_inventory` where `color` is `"purple"` and use `findOneAndDelete()`:

```kotlin
val filter = Filters.eq("color", "purple")
val result = collection.findOneAndDelete(filter)

println("The following was deleted: $result")
```

```console
The following was deleted: PaintOrder(id=2, qty=8, color=purple)
```

If no matches, no document is deleted, and the method returns `null`.

Remaining documents:

```json
{ "_id": 1, "color": "red", "qty": 5 }
{ "_id": 8, "color": "black", "qty": 8 }
```

For more information, see:

- deleteOne() API Documentation
- deleteMany() API Documentation
- findOneAndDelete() API Documentation
- DeleteOptions API Documentation
- FindOneAndDeleteOptions API Documentation
- db.collection.deleteOne() Server Manual Entry
- db.collection.deleteMany() Server Manual Entry
- db.collection.findOneAndDelete() Server Manual Entry

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/write-operations/modify/
# Modify Documents

## Overview

Learn to modify documents in a MongoDB collection using:

- Update
- Replace

Update operations change fields in one or more documents, while replace operations substitute a single document.

Example `paint_inventory` collection:

```json
{ "_id": 1, "color": "red", "qty": 5 }
{ "_id": 2, "color": "purple", "qty": 8 }
{ "_id": 3, "color": "yellow", "qty": 0 }
{ "_id": 4, "color": "green", "qty": 6 }
{ "_id": 5, "color": "pink", "qty": 0 }
```

Kotlin data class:

```kotlin
data class PaintOrder(
    @BsonId val id: Int,
    val color: String,
    val qty: Int
)
```

## Update

Update operations modify fields in documents matching a query filter. Use `updateOne()` for the first match and `updateMany()` for all matches:

```kotlin
collection.updateOne(<query>, <updateDocument>)
collection.updateMany(<query>, <updateDocument>)
```

### Update Operation Parameters

- `query`: filter criteria for matching documents
- `updateDocument`: fields and values to modify
- *(Optional)* `updateOptions`: customize update behavior

Create `updateDocument` using `Updates` builder:

```kotlin
val updateDocument = Updates.operator(<field>, <value>)
```

### Update One Example

To update yellow paint quantity after a return:

```kotlin
val filter = Filters.eq(PaintOrder::color.name, "yellow")
val update = Updates.inc(PaintOrder::qty.name, 1)
val result = collection.updateOne(filter, update)

println("Matched document count: $result.matchedCount")
println("Modified document count: $result.modifiedCount")
```

```console
  Matched document count: 1
  Modified document count: 1
```

For multiple matches, specify a sort in `UpdateOptions`:

```kotlin
val opts = UpdateOptions().sort(Sorts.ascending(PaintOrder::color.name))
```

### Update Many Example

To update inventory after a shipment of 20 cans each:

```kotlin
val filter = Filters.empty()
val update = Updates.inc(PaintOrder::qty.name, 20)
val result = collection.updateMany(filter, update)

println("Matched document count: $result.matchedCount")
println("Modified document count: $result.modifiedCount")
```

```console
  Matched document count: 5
  Modified document count: 5
```

Updated `paint_inventory`:

```json
 { "_id": 1, "color": "red", "qty": 25 }
 { "_id": 2, "color": "purple", "qty": 28 }
 { "_id": 3, "color": "yellow", "qty": 20 }
 { "_id": 4, "color": "green", "qty": 26 }
 { "_id": 5, "color": "pink", "qty": 20 }
```

If no documents match, `updateMany()` makes no changes. See Upsert guide for inserting new documents.

`updateOne()` and `updateMany()` cannot violate unique index constraints.

## Replace

A replace operation substitutes a document. The `replaceOne()` method replaces a matching document with a new one:

```kotlin
collection.replaceOne(<query>, <replacementDocument>)
```

### Replace Operation Parameters

- `query`: filter criteria for matching document
- `replacementDocument`: new `Document` fields and values
- *(Optional)* `replaceOptions`: customize replace behavior

### Replace One Example

To replace pink paint with orange:

```kotlin
val filter = Filters.eq(PaintOrder::color.name, "pink")
val update = PaintOrder(5, "orange", 25)
val result = collection.replaceOne(filter, update)

println("Matched document count: $result.matchedCount")
println("Modified document count: $result.modifiedCount")
```

```console
  Matched document count: 1
  Modified document count: 1
```

Updated document:

```json
 { "_id": 5, "color": "orange", "qty": 25 }
```

For multiple matches, specify a sort in `ReplaceOptions`:

```kotlin
val opts = ReplaceOptions().sort(Sorts.ascending(PaintOrder::color.name))
```

If no documents match, `replaceOne()` makes no changes. See Upsert guide for inserting new documents.

`replaceOne()` cannot violate unique index constraints.

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/write-operations/embedded-arrays/
# Update Arrays in a Document

## Overview

This guide explains how to update arrays in a document using the MongoDB Kotlin driver.

To update an array, you need to:

- Specify the update
- Specify the array elements for the update
- Perform the update operation

### Sample Document

Example document:

```json
{ "_id": 1, "color": "green", "qty": [8, 12, 18] }
```

Kotlin data class:

```kotlin
data class PaintOrder(
    @BsonId val id: Int,
    val qty: List<Int>,
    val color: String
)
```

Use `findOneAndUpdate()` from `MongoCollection` to update the document, with `FindOneAndUpdateOptions` to retrieve the document post-update.

## Specifying an Update

Use the `Updates` builder for update specifications. 

Example to append "17" to the `qty` array:

```kotlin
val filter = Filters.eq("_id", 1)
val update = Updates.push(PaintOrder::qty.name, 17)
val options = FindOneAndUpdateOptions().returnDocument(ReturnDocument.AFTER)
val result = collection.findOneAndUpdate(filter, update, options)

print(result)
```

```console
PaintOrder(id=1, qty=[8, 12, 18, 17], color=green)
```

## Specifying Array Elements

Use positional operators to specify which array elements to update.

### The First Matching Array Element

To update the first matching array element, use the positional `$` operator.

Example to decrement the first matching `qty` value by "3":

```kotlin
val filter = Filters.eq(PaintOrder::qty.name, 18)
val update = Updates.inc("${PaintOrder::qty.name}.$", -3)
val options = FindOneAndUpdateOptions().returnDocument(ReturnDocument.AFTER)
val result = collection.findOneAndUpdate(filter, update, options)

print(result)
```

```console
PaintOrder(id=1, qty=[8, 12, 15], color=green)
```

### Matching All Array Elements

To update all elements, use the all positional `$[]` operator.

Example to multiply `qty` elements by "2":

```kotlin
val filter = Filters.eq("_id", 1)
val update = Updates.mul("${PaintOrder::qty.name}.$[]", 2)
val options = FindOneAndUpdateOptions().returnDocument(ReturnDocument.AFTER)
val result = collection.findOneAndUpdate(filter, update, options)

println(result)
```

```console
PaintOrder(id=1, qty=[16, 24, 36], color=green)
```

### Matching Multiple Array Elements

To update elements matching a filter, use the filtered positional `$[<identifier>]` operator with an array filter.

Example to increment `qty` elements less than "15" by "5":

```kotlin
val filter = Filters.eq("_id", 1)
val smallerFilter = Filters.lt("smaller", 15)
val options = FindOneAndUpdateOptions()
    .returnDocument(ReturnDocument.AFTER)
    .arrayFilters(listOf(smallerFilter))
val update = Updates.inc("${PaintOrder::qty.name}.$[smaller]", 5)
val result = collection.findOneAndUpdate(filter, update, options)

println(result)
```

```console
PaintOrder(id=1, qty=[13, 17, 18], color=green)
```

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/write-operations/upsert/
# Insert or Update in a Single Operation

## Overview

Learn to perform an **upsert** with the MongoDB Kotlin driver. An `upsert` updates documents matching a query filter or inserts a document if no matches exist.

## Specify an Upsert

Use `UpdateOptions.upsert(true)` with `updateOne()` or `updateMany()`, and `ReplaceOptions.upsert(true)` with `replaceOne()`.

Example `paint_inventory` collection:

```json
{ "_id": { "$oid": "606b4cfbcd83be7518b958da" }, "color": "red", "qty": 5 }
{ "_id": { "$oid": "606b4cfbcd83be7518b958db" }, "color": "purple", "qty": 8 }
{ "_id": { "$oid": "606b4cfbcd83be7518b958dc" }, "color": "blue", "qty": 0 }
{ "_id": { "$oid": "606b4cfbcd83be7518b958dd" }, "color": "white", "qty": 0 }
{ "_id": { "$oid": "606b4cfbcd83be7518b958de" }, "color": "yellow", "qty": 6 }
{ "_id": { "$oid": "606b4cfbcd83be7518b958df" }, "color": "pink", "qty": 0 }
{ "_id": { "$oid": "606b4cfbcd83be7518b958e0" }, "color": "green", "qty": 0 }
{ "_id": { "$oid": "606b4cfbcd83be7518b958e1" }, "color": "black", "qty": 8 }
```

Kotlin data class:

```kotlin
data class PaintOrder(
    @BsonId val id: ObjectId = ObjectId(),
    val qty: Int,
    val color: String
)
```

To update inventory with ten cans of orange paint:

```kotlin
val filter = Filters.eq(PaintOrder::color.name, "orange")
val update = Updates.inc(PaintOrder::qty.name, 10)
val options = UpdateOptions().upsert(true)

val results = collection.updateOne(filter, update, options)

println(results)
```

Output:

```console
AcknowledgedUpdateResult{ matchedCount=0, modifiedCount=0, upsertedId=BsonObjectId{ value=606b4cfc1601f9443b5d6978 }}
```

This indicates zero matches, no modifications, and a new document with `_id` `606b4cfc1601f9443b5d6978` was upserted.

Updated `paint_inventory`:

```json
{ "_id": { "$oid": "606b4cfc1601f9443b5d6978" }, "color": "orange", "qty": 10 }
```

Without `UpdateOptions`, no change occurs:

```kotlin
val results = collection.updateOne(filter, update)

println(results)
```

Output:

```console
AcknowledgedUpdateResult{ matchedCount=0, modifiedCount=0, upsertedId=null }
```

For more details, see:

- UpdateOptions.upsert()
- ReplaceOptions.upsert()

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/write-operations/bulk/
# Bulk Operations

## Overview

This guide covers bulk operations in the Kotlin driver. For single operations, use methods like `insertOne()` and `replaceOne()`, which make one database call per operation. Bulk write operations reduce database calls and can be performed at two levels:

- **Collection**: Use `MongoCollection.bulkWrite()` for bulk operations on a single collection. Each write operation requires at least one database call.
- **Client**: For MongoDB server version 8.0 or later, use `MongoClient.bulkWrite()` for multiple collections and databases in one call.

## Collection Bulk Write

To perform a bulk write at the collection level, pass a `List` of `WriteModel` documents to `MongoCollection.bulkWrite()`. Each write operation type results in separate database calls.

Example documents in the `people` collection:

```json
{ "_id": 1, "name": "Karen Sandoval", "age": 31 }
{ "_id": 2, "name": "William Chin", "age": 54 }
{ "_id": 8, "name": "Shayla Ray", "age": 20 }
```

Kotlin data class:

```kotlin
data class Person(
    @BsonId val id: Int,
    val name: String,
    val age: Int? = null,
    val location: String? = null
)
```

### Insert Operation

Create an `InsertOneModel` for each document to insert. 

#### Example

```kotlin
val juneDoc = InsertOneModel(Person(3, "June Carrie", 17))
val kevinDoc = InsertOneModel(Person(4, "Kevin Moss", 22))
```

Inserting a document with an existing `_id` throws a `MongoBulkWriteException`.

```kotlin
try {
    val bulkOperations = listOf(
        InsertOneModel(Person(1, "James Smith", 13)),
        InsertOneModel(Person(3, "Colin Samuels"))
    )
    collection.bulkWrite(bulkOperations)
} catch (e: MongoBulkWriteException) {
    println("A MongoBulkWriteException occurred: " + e.message)
}
```

### Replace Operation

Create a `ReplaceOneModel` with a query filter and replacement document. 

#### Example

```kotlin
val filter = Filters.eq("_id", 1)
val insert = Person(1, "Celine Stork", location = "San Diego, CA")
val doc = ReplaceOneModel(filter, insert)
```

### Update Operation

Use `UpdateOneModel` or `UpdateManyModel` with a query filter and update document.

#### Example

```kotlin
val filter = Filters.eq("_id", 2)
val update = Updates.inc(Person::age.name, 1)
val doc = UpdateOneModel<Person>(filter, update)
```

### Delete Operation

Create a `DeleteOneModel` or `DeleteManyModel` with a query filter.

#### Example

```kotlin
val deleteId1 = DeleteOneModel<Person>(Filters.eq("_id", 1))
val deleteAgeLt30 = DeleteManyModel<Person>(Filters.lt(Person::age.name, 30))
```

### Order of Execution

The `bulkWrite()` method accepts `BulkWriteOptions` to specify ordered or unordered execution.

#### Ordered Execution

By default, operations execute in order until an error occurs.

```kotlin
val bulkOperations = listOf(
    InsertOneModel(Person(6, "Zaynab Omar", 37)),
    ReplaceOneModel(Filters.eq("_id", 1), Person(1, "Sandy Kane", location = "Helena, MT")),
    UpdateOneModel<Person>(Filters.eq("_id", 6), Updates.set(Person::name.name, "Zaynab Hassan")),
    DeleteManyModel<Person>(Filters.gt(Person::age.name, 50))
)

collection.bulkWrite(bulkOperations)
```

#### Unordered Execution

Pass `false` to `ordered()` for unordered execution.

```kotlin
val options = BulkWriteOptions().ordered(false)
collection.bulkWrite(bulkOperations, options)
```

## Client Bulk Write

For MongoDB server 8.0 or later, use `MongoClient.bulkWrite()` for multiple databases and collections. 

Example data classes:

```kotlin
data class Person(@BsonId val id: Int, val name: String)
data class Object(@BsonId val id: Int, val type: String)
```

### Insert Operation

Insert documents into different collections.

```kotlin
val docsToInsert = mutableListOf<ClientNamespacedWriteModel>()
docsToInsert.add(ClientNamespacedWriteModel.insertOne(MongoNamespace("sample_db", "people"), Person(2, "Julia Smith")))
docsToInsert.add(ClientNamespacedWriteModel.insertOne(MongoNamespace("sample_db", "objects"), Object(2, "washing machine")))
val clientBulkResult = client.bulkWrite(docsToInsert)
```

### Replace Operation

Replace existing documents in collections.

```kotlin
val docsReplacements = mutableListOf<ClientNamespacedWriteModel>()
docsReplacements.add(ClientNamespacedWriteModel.replaceOne(MongoNamespace("sample_db", "people"), Filters.eq(Person::id.name, 1), Person(1, "Frederic Hilbert")))
docsReplacements.add(ClientNamespacedWriteModel.replaceOne(MongoNamespace("sample_db", "objects"), Filters.eq(Object::id.name, 1), Object(1, "ironing board")))
val clientBulkResult = client.bulkWrite(docsReplacements)
```

### Bulk Write Options

Use `ClientBulkWriteOptions` to specify options for bulk operations.

#### Order of Execution

By default, operations execute in the specified order. Use `ordered(false)` for unordered execution.

```kotlin
val options = ClientBulkWriteOptions.clientBulkWriteOptions().ordered(false)
val bulkOperations = listOf(
    ClientNamespacedWriteModel.insertOne(namespace, Person(2, "Rudra Suraj")),
    ClientNamespacedWriteModel.insertOne(namespace, Person(2, "Wendy Zhang")), // Causes duplicate key error
    ClientNamespacedWriteModel.insertOne(namespace, Person(4, "Mario Bianchi"))
)
val result = client.bulkWrite(bulkOperations, options)
```

### Summary

- Use `MongoCollection.bulkWrite()` for bulk operations with `WriteModel` instances.
- Use `MongoClient.bulkWrite()` for operations across multiple databases and collections.
- Specify execution order with `BulkWriteOptions`.

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/query-document/
# Specify a Query

## Overview

This guide explains how to specify a query in the MongoDB Kotlin driver using **query filters** to narrow matched documents. Query filters use operators to determine which documents to include.

The following operators are covered:

- Comparison Operators
- Logical Operators
- Array Operators
- Element Operators
- Evaluation Operators

Example documents in the `paint_purchases` collection:

```json
{ "_id": 1, "color": "red", "qty": 9, "vendor": ["A", "E"] }
{ "_id": 2, "color": "purple", "qty": 8, "vendor": ["B", "D", "F"], "rating": 5 }
{ "_id": 3, "color": "blue", "qty": 5, "vendor": ["A", "E"] }
{ "_id": 4, "color": "white", "qty": 6, "vendor": ["D"], "rating": 9 }
{ "_id": 5, "color": "yellow", "qty": 4, "vendor": ["A", "B"] }
{ "_id": 6, "color": "pink", "qty": 3, "vendor": ["C"] }
{ "_id": 7, "color": "green", "qty": 8, "vendor": ["C", "E"], "rating": 7 }
{ "_id": 8, "color": "black", "qty": 7, "vendor": ["A", "C", "D"] }
```

Kotlin data class:

```kotlin
data class PaintOrder(
    @BsonId val id: Int,
    val qty: Int,
    val color: String,
    val vendor: List<String>,
    val rating: Int? = null
)
```

## Comparison Operators

Comparison operators query data based on value comparisons. Common operators include `gt()`, `lte()`, and `ne()`.

Example using `Filters.gt()` to find documents with `qty` greater than `7`:

```kotlin
val filter = Filters.gt("qty", 7)
val findFlow = collection.find(filter)
findFlow.collect { println(it) }
```

```console
PaintOrder(id=1, qty=9, color=red, vendor=[A, E], rating=null)
PaintOrder(id=2, qty=8, color=purple, vendor=[B, D, F], rating=5)
PaintOrder(id=7, qty=8, color=green, vendor=[C, E], rating=7)
```

## Logical Operators

Logical operators apply logic to field-level operators. Common ones are `and()` and `or()`.

Example using `Filters.and()` to match documents with `qty` ≤ `5` and `color` not `"pink"`:

```kotlin
val filter = Filters.and(Filters.lte("qty", 5), Filters.ne("color", "pink"))
val findFlow = collection.find(filter)
findFlow.collect { println(it) }
```

```console
PaintOrder(id=3, qty=5, color=blue, vendor=[A, E], rating=null)
PaintOrder(id=5, qty=4, color=yellow, vendor=[A, B], rating=null)
```

## Array Operators

Array operators query based on array field values or sizes.

Example using `Filters.size()` to match documents with `vendor` list size `3`:

```kotlin
val filter = Filters.size("vendor", 3)
val findFlow = collection.find(filter)
findFlow.collect { println(it) }
```

```console
PaintOrder(id=2, qty=8, color=purple, vendor=[B, D, F], rating=5)
PaintOrder(id=8, qty=7, color=black, vendor=[A, C, D], rating=null)
```

## Element Operators

Element operators query based on field presence or type.

Example using `Filters.exists()` to find documents with a `rating`:

```kotlin
val filter = Filters.exists("rating")
val findFlow = collection.find(filter)
findFlow.collect { println(it) }
```

```console
PaintOrder(id=2, qty=8, color=purple, vendor=[B, D, F], rating=5)
PaintOrder(id=4, qty=6, color=white, vendor=[D], rating=9)
PaintOrder(id=7, qty=8, color=green, vendor=[C, E], rating=7)
```

## Evaluation Operators

Evaluation operators query using higher-level logic, like regex.

Example using `Filters.regex()` to match documents with `color` ending in `"k"`:

```kotlin
val filter = Filters.regex("color", "k$")
val findFlow = collection.find(filter)
findFlow.collect { println(it) }
```

```console
PaintOrder(id=6, qty=3, color=pink, vendor=[C], rating=null)
PaintOrder(id=8, qty=7, color=black, vendor=[A, C, D], rating=null)
```

For more information, see the Server Manual Entries on Query Operators, Comparison Operators, Logical Operators, Array Operators, Element Operators, and Evaluation Operators.

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/crud/compound-operations/
# Compound Operations

## Overview

This guide covers **compound operations** with the MongoDB Kotlin driver, which consist of a read and write operation performed atomically, preventing **race conditions**.

Supported compound operations include:

- Find and update one document
- Find and replace one document
- Find and delete one document

For more complex atomic tasks, use **transactions**.

## How to Use Compound Operations

Examples use a collection with these documents:

```json
{"_id": 1, "food": "donut", "color": "green"}
{"_id": 2, "food": "pear", "color": "yellow"}
```

Modeled with:

```kotlin
data class FoodOrder(
    @BsonId val id: Int,
    val food: String,
    val color: String
)
```

Each compound operation returns the found document before the write operation by default. Use options to retrieve the document after the operation.

### Find and Update

Use `findOneAndUpdate()` to find and update one document.

#### Example

```kotlin
val filter = Filters.eq(FoodOrder::color.name, "green")
val update = Updates.set(FoodOrder::food.name, "pizza")
val options = FindOneAndUpdateOptions()
    .upsert(true)
    .maxTime(5, TimeUnit.SECONDS)
val result = collection.findOneAndUpdate(filter, update, options)

println(result)
```

```console
FoodOrder(id=1, food=donut, color=green)
```

### Find and Replace

Use `findOneAndReplace()` to find and replace one document.

#### Example

```kotlin
data class Music(
    @BsonId val id: Int,
    val music: String,
    val color: String
)

val filter = Filters.eq(FoodOrder::color.name, "green")
val replace = Music(1, "classical", "green")
val options = FindOneAndReplaceOptions()
    .returnDocument(ReturnDocument.AFTER)
val result = collection.withDocumentClass<Music>().findOneAndReplace(filter, replace, options)

println(result)
```

```console
Music(id=1, music=classical, color=green)
```

### Find and Delete

Use `findOneAndDelete()` to find and delete one document.

#### Example

```kotlin
val sort = Sorts.descending("_id")
val filter = Filters.empty()
val options = FindOneAndDeleteOptions().sort(sort)
val result = collection.findOneAndDelete(filter, options)

println(result)
```

```console
FoodOrder(id=2, food=pear, color=yellow)
```

## Avoiding a Race Condition

### Example With Race Condition

Using `bookARoomUnsafe` can lead to race conditions:

```kotlin
suspend fun bookARoomUnsafe(guestName: String) {
    val filter = Filters.eq("reserved", false)
    val myRoom = hotelCollection.find(filter).firstOrNull()
    if (myRoom == null) {
        println("Sorry, we are booked, $guestName")
        return
    }
    val update = Updates.combine(Updates.set("reserved", true), Updates.set("guest", guestName))
    hotelCollection.updateOne(Filters.eq("_id", myRoom.id), update)
}
```

### Example Without Race Condition

Use `bookARoomSafe` to avoid race conditions:

```kotlin
suspend fun bookARoomSafe(guestName: String) {
    val update = Updates.combine(
        Updates.set(HotelRoom::reserved.name, true),
        Updates.set(HotelRoom::guest.name, guestName)
    )
    val filter = Filters.eq("reserved", false)
    val myRoom = hotelCollection.findOneAndUpdate(filter, update)
    if (myRoom == null) {
        println("Sorry, we are booked, $guestName")
        return
    }
    println("You got the ${myRoom.room}, $guestName")
}
```

MongoDB places a write lock on the document during the compound operation.

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/builders/
# Builders

## Overview

This section covers the Kotlin driver's builder classes for simplifying CRUD operations and the Aggregation API, enabling efficient query and document construction.

## Why Use Builders?

Using builder classes allows:

- Early error detection by the Kotlin compiler.
- IDE support for discovery, debugging, and code completion.

Builders enable method-based operators, providing immediate error feedback and code completion, unlike string-based operators in the MongoDB shell or plain Kotlin.

## Example Scenario

To send a marketing email to users in the `users` collection with:

- `gender` as `"female"`
- `age` greater than `29`

Return only their email addresses. The `User` data class is:

```kotlin
data class User(
    @BsonId
    val id: BsonObjectId = BsonObjectId(),
    val gender: String,
    val age: Int,
    val email: String,
)
```

### Using the MongoDB Shell

MongoDB Shell command:

```js
collection.find({ "gender": "female", "age" : { "$gt": 29 }}, { "_id": 0, "email": 1 })
```

### Without Using Builders

Find operation without builders:

```kotlin
data class Results(val email: String)

val filter = Document().append("gender", "female").append("age", Document().append("\$gt", 29))
val projection = Document().append("_id", 0).append("email", 1)
val results = collection.find<Results>(filter).projection(projection)
```

Errors in the filter are only caught at runtime.

### Using Builders

Find operation using builders:

```kotlin
import com.mongodb.client.model.Filters
import com.mongodb.client.model.Projections
```

```kotlin
data class Results(val email: String)

val filter = Filters.and(Filters.eq(User::gender.name, "female"), Filters.gt(User::age.name, 29))
val projection = Projections.fields(Projections.excludeId(), Projections.include("email"))
val results = collection.find<Results>(filter).projection(projection)
```

## Available Builders

- **Aggregates**: Build aggregation pipelines.
- **Filters**: Create query filters.
- **Indexes**: Define index keys.
- **Projections**: Build projections.
- **Sorts**: Create sort criteria.
- **Updates**: Construct updates.

The "Use Builders with Data Classes" guide offers examples for type-safe applications and improved Kotlin interoperability.

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/builders/aggregates/
# Aggregates Builders

## Overview

This guide covers the Aggregates class, which provides static methods to build aggregation pipeline stages in the MongoDB Kotlin driver. For a detailed introduction to Aggregation, refer to our Aggregation guide.

Assume the following imports:

```kotlin
import com.mongodb.client.model.Aggregates
import com.mongodb.client.model.Filters
import com.mongodb.client.model.Projections
import com.mongodb.client.model.Sorts
import com.mongodb.client.model.Accumulators
```

Construct pipeline stages and specify them in your aggregation:

```kotlin
val matchStage = Aggregates.match(Filters.eq("someField", "someCriteria"))
val sortByCountStage = Aggregates.sortByCount("\$someField")
val results = collection.aggregate(listOf(matchStage, sortByCountStage)).toList()
```

The examples use the Atlas sample_mflix.movies dataset, modeled by the `Movie` data class:

```kotlin
data class Movie(
    val title: String,
    val year: Int,
    val genres: List<String>,
    val rated: String,
    val plot: String,
    val runtime: Int,
    val imdb: IMDB
) {
    data class IMDB(val rating: Double)
}
```

Use builder methods directly with data class properties by adding the Kotlin driver extensions dependency. See the Use Builders with Data Classes guide for more.

## Match

Create a $match stage to filter documents:

```kotlin
Aggregates.match(Filters.eq(Movie::title.name, "The Shawshank Redemption"))
```

## Project

Create a $project stage to specify document fields:

```kotlin
Aggregates.project(
    Projections.fields(
        Projections.include(Movie::title.name, Movie::plot.name),
        Projections.excludeId()
    )
)
```

### Projecting Computed Fields

Project computed fields:

```kotlin
Aggregates.project(
    Projections.fields(
        Projections.computed("rating", "\$${Movie::rated.name}"),
        Projections.excludeId()
    )
)
```

## Documents

Create a $documents stage to return literal documents:

```kotlin
Aggregates.documents(
    listOf(
        Document(Movie::title.name, "Steel Magnolias"),
        Document(Movie::title.name, "Back to the Future"),
        Document(Movie::title.name, "Jurassic Park")
    )
)
```

Call `aggregate()` on a database for input:

```kotlin
val docsStage = database.aggregate<Document>( // ... )
```

## Sample

Create a $sample stage to randomly select documents:

```kotlin
Aggregates.sample(5)
```

## Sort

Create a $sort stage:

```kotlin
Aggregates.sort(
    Sorts.orderBy(
        Sorts.descending(Movie::year.name),
        Sorts.ascending(Movie::title.name)
    )
)
```

## Skip

Create a $skip stage:

```kotlin
Aggregates.skip(5)
```

## Limit

Create a $limit stage:

```kotlin
Aggregates.limit(4)
```

## Lookup

Create a $lookup stage for joins:

```kotlin
Aggregates.lookup("comments", "_id", "movie_id", "joined_comments")
```

### Full Join and Uncorrelated Subqueries

Example with `orders` and `warehouses` collections:

```kotlin
val variables = listOf(
    Variable("order_item", "\$item"),
    Variable("order_qty", "\$ordered")
)
val pipeline = listOf(
    Aggregates.match(
        Filters.expr(
            Document("\$and", listOf(
                Document("\$eq", listOf("$\$order_item", "\$${Inventory::stockItem.name}")),
                Document("\$gte", listOf("\$${Inventory::inStock.name}", "$\$order_qty"))
            ))
        )
    ),
    Aggregates.project(
        Projections.fields(
            Projections.exclude(Order::customerId.name, Inventory::stockItem.name),
            Projections.excludeId()
        )
    )
)
val innerJoinLookup = Aggregates.lookup("warehouses", variables, pipeline, "stockData")
```

## Group

Create a $group stage:

```kotlin
Aggregates.group("\$${Order::customerId.name}",
    Accumulators.sum("totalQuantity", "\$${Order::ordered.name}"),
    Accumulators.avg("averageQuantity", "\$${Order::ordered.name}")
)
```

## Pick-N Accumulators

Use pick-n accumulators for top/bottom elements:

- minN()
- maxN()
- firstN()
- lastN()
- top()
- topN()
- bottom()
- bottomN()

### MinN

Return the lowest `n` values:

```kotlin
Aggregates.group(
    "\$${Movie::year.name}",
    Accumulators.minN("lowestThreeRatings", "\$${Movie::imdb.name}.${Movie.IMDB::rating.name}", 3)
)
```

### MaxN

Return the highest `n` values:

```kotlin
Aggregates.group(
    "\$${Movie::year.name}",
    Accumulators.maxN("highestTwoRatings", "\$${Movie::imdb.name}.${Movie.IMDB::rating.name}", 2)
)
```

### FirstN

Return the first `n` documents:

```kotlin
Aggregates.group(
    "\$${Movie::year.name}",
    Accumulators.firstN("firstTwoMovies", "\$${Movie::title.name}", 2)
)
```

### LastN

Return the last `n` documents:

```kotlin
Aggregates.group(
    "\$${Movie::year.name}",
    Accumulators.lastN("lastThreeMovies", "\$${Movie::title.name}", 3)
)
```

### Top

Return the top document:

```kotlin
Aggregates.group(
    "\$${Movie::year.name}",
    Accumulators.top("topRatedMovie", Sorts.descending("${Movie::imdb.name}.${Movie.IMDB::rating.name}"),
    listOf("\$${Movie::title.name}", "\$${Movie::imdb.name}.${Movie.IMDB::rating.name}"))
)
```

### TopN

Return the top `n` documents:

```kotlin
Aggregates.group(
    "\$${Movie::year.name}",
    Accumulators.topN("longestThreeMovies", Sorts.descending(Movie::runtime.name),
    listOf("\$${Movie::title.name}", "\$${Movie::runtime.name}"), 3)
)
```

### Bottom

Return the bottom document:

```kotlin
Aggregates.group(
    "\$${Movie::year.name}",
    Accumulators.bottom("shortestMovies", Sorts.descending(Movie::runtime.name),
    listOf("\$${Movie::title.name}", "\$${Movie::runtime.name}"))
)
```

### BottomN

Return the bottom `n` documents:

```kotlin
Aggregates.group(
    "\$${Movie::year.name}",
    Accumulators.bottomN("lowestRatedTwoMovies", Sorts.descending("${Movie::imdb.name}.${Movie.IMDB::rating.name}"),
    listOf("\$${Movie::title.name}", "\$${Movie::imdb.name}.${Movie.IMDB::rating.name}"))
)
```

## Unwind

Create an $unwind stage:

```kotlin
Aggregates.unwind("\$${"lowestRatedTwoMovies"}")
```

Preserve null/empty arrays:

```kotlin
Aggregates.unwind("\$${"lowestRatedTwoMovies"}", UnwindOptions().preserveNullAndEmptyArrays(true))
```

Include array index:

```kotlin
Aggregates.unwind("\$${"lowestRatedTwoMovies"}", UnwindOptions().includeArrayIndex("position"))
```

## Out

Create an $out stage:

```kotlin
Aggregates.out("classic_movies")
```

## Merge

Create a $merge stage:

```kotlin
Aggregates.merge("nineties_movies")
```

With non-default options:

```kotlin
Aggregates.merge(
    MongoNamespace("aggregation", "movie_ratings"),
    MergeOptions().uniqueIdentifier(listOf("year", "title"))
        .whenMatched(MergeOptions.WhenMatched.REPLACE)
        .whenNotMatched(MergeOptions.WhenNotMatched.INSERT)
)
```

## GraphLookup

Create a $graphLookup stage:

```kotlin
Aggregates.graphLookup(
    "contacts",
    "\$${Users::friends.name}", Users::friends.name, Users::name.name,
    "socialNetwork"
)
```

With options for depth:

```kotlin
Aggregates.graphLookup(
    "contacts",
    "\$${Users::friends.name}", Users::friends.name, Users::name.name,
    "socialNetwork",
    GraphLookupOptions().maxDepth(2).depthField("degrees")
)
```

With filter:

```kotlin
Aggregates.graphLookup(
    "contacts",
    "\$${Users::friends.name}", Users::friends.name, Users::name.name, "socialNetwork",
    GraphLookupOptions().maxDepth(1).restrictSearchWithMatch(
        Filters.eq(Users::hobbies.name, "golf")
    )
)
```

## SortByCount

Create a $sortByCount stage:

```kotlin
Aggregates.sortByCount("\$${Movie::genres.name}")
```

## ReplaceRoot

Create a $replaceRoot stage:

```kotlin
Aggregates.replaceRoot("\$${Book::spanishTranslation.name}")
```

## AddFields

Create an $addFields stage:

```kotlin
Aggregates.addFields(
    Field("watched", false),
    Field("type", "movie")
)
```

## Count

Create a $count stage:

```kotlin
Aggregates.count("total")
```

## Bucket

Create a $bucket stage:

```kotlin
Aggregates.bucket("\$${Screen::screenSize.name}", listOf(0, 24, 32, 50, 70, 1000))
```

With options:

```kotlin
Aggregates.bucket("\$${Screen::screenSize.name}", listOf(0, 24, 32, 50, 70),
    BucketOptions()
        .defaultBucket("monster")
        .output(
            Accumulators.sum("count", 1),
            Accumulators.push("matches", "\$${Screen::screenSize.name}")
        )
)
```

## BucketAuto

Create a $bucketAuto stage:

```kotlin
Aggregates.bucketAuto("\$${Screen::screenSize.name}", 5)
```

With options:

```kotlin
Aggregates.bucketAuto(
    "\$${Screen::price.name}", 5,
    BucketAutoOptions()
        .granularity(BucketGranularity.POWERSOF2)
        .output(Accumulators.sum("count", 1), Accumulators.avg("avgPrice", "\$${Screen::price.name}"))
)
```

## Facet

Create a $facet stage:

```kotlin
Aggregates.facet(
    Facet(
        "Screen Sizes",
        Aggregates.bucketAuto(
            "\$${Screen::screenSize.name}",
            5,
            BucketAutoOptions().output(Accumulators.sum("count", 1))
        )
    ),
    Facet(
        "Manufacturer",
        Aggregates.sortByCount("\$${Screen::manufacturer.name}"),
        Aggregates.limit(5)
    )
)
```

## SetWindowFields

Create a $setWindowFields stage:

```kotlin
val pastMonth = Windows.timeRange(-1, MongoTimeUnit.MONTH, Windows.Bound.CURRENT)

val resultsFlow = weatherCollection.aggregate<Document>(
    listOf(
       Aggregates.setWindowFields("\$${Weather::localityId.name}",
           Sorts.ascending(Weather::measurementDateTime.name),
           WindowOutputFields.sum("monthlyRainfall", "\$${Weather::rainfall.name}", pastMonth),
           WindowOutputFields.avg("monthlyAvgTemp", "\$${Weather::temperature.name}", pastMonth)
       )
    )
)
```

## Densify

Create a $densify stage:

```kotlin
Aggregates.densify(
    "ts",
    DensifyRange.partitionRangeWithStep(15, MongoTimeUnit.MINUTE),
    DensifyOptions.densifyOptions().partitionByFields("Position.coordinates")
)
```

## Fill

Create a $fill stage:

```kotlin
val resultsFlow = weatherCollection.aggregate<Weather>(
    listOf(
        Aggregates.fill(
            FillOptions.fillOptions().sortBy(Sorts.ascending(Weather::hour.name)),
            FillOutputField.value(Weather::temperature.name, "23.6C"),
            FillOutputField.linear(Weather::air_pressure.name)
        )
    )
)
```

## Atlas Full-Text Search

Create a $search stage:

```kotlin
Aggregates.search(
    SearchOperator.text(
        SearchPath.fieldPath(Movie::title.name), "Future"
    ),
    SearchOptions.searchOptions().index("title")
)
```

## Atlas Search Metadata

Create a $searchMeta stage:

```kotlin
Aggregates.searchMeta(
    SearchOperator.near(1985, 2, SearchPath.fieldPath(Movie::year.name)),
    SearchOptions.searchOptions().index("year")
)
```

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/builders/vector-search/
# Atlas Vector Search

## Overview

This guide explains how to use the Atlas Vector Search feature in the Kotlin driver. The `Aggregates` builders class includes the `vectorSearch()` method to create a $vectorSearch pipeline stage for **semantic search**, which finds information similar in meaning to your search term.

Refer to the MongoDB Atlas documentation for version support details.

## Perform a Vector Search

To use this feature, create a vector search index and index your vector embeddings. For instructions on creating a vector search index, see the Atlas Search and Vector Search Indexes section in the Indexes guide. For vector embeddings, refer to How to Index Vector Embeddings for Vector Search in the Atlas documentation.

After creating a vector search index, reference it in your pipeline stage.

### Vector Search Example

This example uses the following Kotlin data class:

```kotlin
data class MovieAlt(
    val title: String,
    val year: Int,
    val plot: String,
    val plotEmbedding: List<Double>
)
```

It demonstrates building an aggregation pipeline using `vectorSearch()` for an exact vector search:

- Searches `plotEmbedding` using vector embeddings of a string value
- Uses the `mflix_movies_embedding_index` vector search index
- Returns 1 document
- Filters for documents with `year` at least `2016`

```kotlin
Aggregates.vectorSearch(
    SearchPath.fieldPath(MovieAlt::plotEmbedding.name),
    BinaryVector.floatVector(floatArrayOf(0.0001f, 1.12345f, 2.23456f, 3.34567f, 4.45678f)),
    "mflix_movies_embedding_index",
    1.toLong(),
    exactVectorSearchOptions().filter(Filters.gte(MovieAlt::year.name, 2016))
)
```

The example creates a `BinaryVector` as the query vector, but a `List<Double>` can also be used. Using `BinaryVector` is recommended for storage efficiency.

Visit the Atlas documentation for more tutorials on using the Kotlin driver for Atlas Vector Searches.

## API Documentation

For more on the methods and types mentioned, see:

- Aggregates.vectorSearch()
- FieldSearchPath
- VectorSearchOptions
- BinaryVector

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/builders/filters/
# Filters Builders

## Overview

This guide explains how to use **builders** for **filters** in the MongoDB Kotlin driver. Builders help construct BSON objects. Filters limit query results based on conditions, useful for locating matching information in a collection.

Filters can be used in:

- `find()`
- Aggregation pipeline match stage
- `deleteOne()` or `deleteMany()`
- `updateOne()` or `updateMany()`

Examples of filters include:

- Items costing more than $0 but less than $25.
- Gluten-free foods under 500 calories.
- Reviews mentioning "spicy".

The `Filters` class provides static methods for MongoDB query operators, returning BSON instances for query filters. You can import all methods statically:

```kotlin
import com.mongodb.client.model.Filters.*
```

Most examples use the `paints` collection:

```json
{ "_id": 1, "color": "red", "qty": 5, "vendor": ["A"] }
{ "_id": 2, "color": "purple", "qty": 10, "vendor": ["C", "D"] }
{ "_id": 3, "color": "blue", "qty": 8, "vendor": ["B", "A"] }
{ "_id": 4, "color": "white", "qty": 6, "vendor": ["D"] }
{ "_id": 5, "color": "yellow", "qty": 11, "vendor": ["A", "B"] }
{ "_id": 6, "color": "pink", "qty": 5, "vendor": ["C"] }
{ "_id": 7, "color": "green", "qty": 8,"vendor": ["B", "C"] }
{ "_id": 8, "color": "orange", "qty": 7, "vendor": ["A", "D"] }
```

Documents are modeled by:

```kotlin
data class PaintOrder(
    @BsonId val id: Int,
    val qty: Int,
    val color: String,
    val vendors: List<String> = mutableListOf()
)
```

You can use builder methods directly with data class properties by adding the Kotlin driver extensions dependency.

## Comparison

Comparison filters compare document values to specified values. The `Filters` comparison methods include:

| Method | Matches |
|--------|---------|
| eq()   | values equal to a specified value. |
| gt()   | values greater than a specified value. |
| gte()  | values greater than or equal to a specified value. |
| lt()   | values less than a specified value. |
| lte()  | values less than or equal to a specified value. |
| ne()   | values not equal to a specified value. |
| in()   | any of the values specified in an array. |
| nin()  | none of the values specified in an array. |
| empty()| all documents. |

Example for matching `qty` equals "5":

```kotlin
val equalComparison = Filters.eq(PaintOrder::qty.name, 5)
val resultsFlow = collection.find(equalComparison)
resultsFlow.collect { println(it) }
```

Example for `qty` greater than or equal to "10":

```kotlin
val gteComparison = Filters.gte(PaintOrder::qty.name, 10)
val resultsFlow = collection.find(gteComparison)
resultsFlow.collect { println(it) }
```

Example for an empty predicate:

```kotlin
val emptyComparison = Filters.empty()
val resultsFlow = collection.find(emptyComparison)
resultsFlow.collect { println(it) }
```

## Logical

Logical operators perform operations based on specified conditions. The `Filters` logical methods include:

| Method | Matches |
|--------|---------|
| and()  | documents with all filter conditions. |
| or()   | documents with either filter condition. |
| not()  | documents that do not match the filter. |
| nor()  | documents that fail to match both filters. |

Example for `qty` greater than "8" or `color` equals "pink":

```kotlin
val orComparison = Filters.or(
    Filters.gt(PaintOrder::qty.name, 8),
    Filters.eq(PaintOrder::color.name, "pink")
)
val resultsFlow = collection.find(orComparison)
resultsFlow.collect { println(it) }
```

## Arrays

Array operators evaluate array fields. The `Filters` array methods include:

| Method     | Matches |
|------------|---------|
| all()      | documents if the array contains every specified element. |
| elemMatch()| documents if an element matches all specified conditions. |
| size()     | documents if the array has a specified number of elements. |

Example for matching `vendors` array containing "A" and "D":

```kotlin
val search = listOf("A", "D")
val allComparison = Filters.all(PaintOrder::vendors.name, search)
val resultsFlow = collection.find(allComparison)
resultsFlow.collect { println(it) }
```

## Elements

Elements operators evaluate field nature. The `Filters` elements methods include:

| Method  | Matches |
|---------|---------|
| exists()| documents that have the specified field. |
| type()  | documents if a field is of the specified type. |

Example for `qty` field existing and not equal to "5" or "8":

```kotlin
val existsComparison = Filters.and(Filters.exists(PaintOrder::qty.name), Filters.nin("qty", 5, 8))
val resultsFlow = collection.find(existsComparison)
resultsFlow.collect { println(it) }
```

## Evaluation

Evaluation operators assess field values. The `Filters` evaluation methods include:

| Method | Matches |
|--------|---------|
| mod()  | documents where a modulo operation on a field yields a specified result. |
| regex()| documents where values match a specified regex. |
| text() | documents containing a specified full-text search expression. |
| where()| documents containing a specified JavaScript expression. |

Example for `color` starting with "p":

```kotlin
val regexComparison = Filters.regex(PaintOrder::color.name, "^p")
val resultsFlow = collection.find(regexComparison)
resultsFlow.collect { println(it) }
```

## Bitwise

Bitwise operators evaluate binary values. The `Filters` bitwise methods include:

| Method          | Matches |
|-----------------|---------|
| bitsAllSet()    | documents where specified bits are set. |
| bitsAllClear()  | documents where specified bits are clear. |
| bitsAnySet()    | documents where at least one specified bit is set. |
| bitsAnyClear()  | documents where at least one specified bit is clear. |

Example for matching `decimalValue` with bits set at positions of bitmask "34":

```kotlin
data class BinaryNumber(
    @BsonId val id: Int,
    val decimalValue: Int,
    val binaryValue: String
)
val binaryCollection = database.getCollection<BinaryNumber>("binary_numbers")

val bitmask = 34.toLong() // 00100010 in binary
val bitsComparison = Filters.bitsAllSet(BinaryNumber::decimalValue.name, bitmask)
val resultsFlow = binaryCollection.find(bitsComparison)
resultsFlow.collect { println(it) }
```

## Geospatial

Geospatial operators evaluate coordinates relative to shapes. The `Filters` geospatial methods include:

| Method               | Matches |
|----------------------|---------|
| geoWithin()          | documents with GeoJSON geometry within a bounding geometry. |
| geoWithinBox()       | documents with coordinates within a specified box. |
| geoWithinPolygon()   | documents with coordinates within a specified polygon. |
| geoWithinCenter()    | documents with coordinates within a specified circle. |
| geoWithinCenterSphere()| geometries within a specified circle using spherical geometry. |
| geoIntersects()      | geometries intersecting with a GeoJSON geometry. |
| near()               | geospatial objects near a point. |
| nearSphere()         | geospatial objects near a point on a sphere. |

Example for matching documents with `coordinates` within a polygon:

```kotlin
data class Store(
    @BsonId val id: Int,
    val name: String,
    val coordinates: Point
)
val collection = database.getCollection<Store>("stores")

val square = Polygon(listOf(
    Position(0.0, 0.0, ...),
    Position(4.0, 0.0),
    Position(4.0, 4.0),
    Position(0.0, 4.0),
    Position(0.0, 0.0, ...)))
val geoWithinComparison = Filters.geoWithin(Store::coordinates.name, square)

val resultsFlow = collection.find(geoWithinComparison)
resultsFlow.collect { println(it) }
```

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/builders/indexes/
# Indexes Builders

## Overview

This guide explains how to specify **indexes** using builders in the MongoDB Kotlin Driver. The `Indexes` builder provides methods for creating:

- Ascending Indexes
- Descending Indexes
- Compound Indexes
- Text Indexes
- Hashed Indexes
- Geospatial Indexes

Indexes store a subset of a collection's data, ordered by field values. The `Indexes` class offers static factory methods for all index types, returning a BSON instance for `createIndex()`.

You can import all methods of the Indexes class:

```kotlin
import com.mongodb.client.model.Indexes.*
```

Using builder methods with data class properties requires the optional Kotlin driver extensions. See the Use Builders with Data Classes guide for examples.

## Ascending Indexes

An ascending index sorts query results from smallest to largest. Create it using the `ascending()` method, then call `createIndex()`:

```kotlin
val ascendingIndex = Indexes.ascending("name")
val indexName = collection.createIndex(ascendingIndex)
println(indexName)
```

```console
name_1
```

## Descending Indexes

A descending index sorts query results from largest to smallest. Create it using the `descending()` method, then call `createIndex()`:

```kotlin
val descendingIndex = Indexes.descending("capacity")
val indexName = collection.createIndex(descendingIndex)
println(indexName)
```

```console
capacity_-1
```

## Compound Indexes

To create a compound index, use the `compoundIndex()` method, then call `createIndex()`:

```kotlin
val compoundIndexExample = Indexes.compoundIndex(
    Indexes.descending("capacity", "year"),
    Indexes.ascending("name")
)
val indexName = collection.createIndex(compoundIndexExample)
println(indexName)
```

```console
capacity_-1_year_-1_name_1
```

## Text Indexes

A text index groups documents by text in the indexed field. Create it using the `text()` method, then call `createIndex()`:

```kotlin
val textIndex = Indexes.text("theaters")
val indexName = collection.createIndex(textIndex)
println(indexName)
```

```console
theaters_text
```

## Hashed Indexes

A hashed index groups documents by the hash value in the indexed field. Create it using the `hashed()` method, then call `createIndex()`:

```kotlin
val hashedIndex = Indexes.hashed("capacity")
val indexName = collection.createIndex(hashedIndex)
println(indexName)
```

```console
capacity_hashed
```

## Geospatial Indexes

A `2dsphere` index groups documents by coordinates in the indexed field. Create it using the `geo2dsphere()` method, then call `createIndex()`:

```kotlin
val geo2dsphereIndex = Indexes.geo2dsphere("location")
val indexName = collection.createIndex(geo2dsphereIndex)
println(indexName)
```

```console
location_2dsphere
```

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/builders/projections/
# Projections Builders

## Overview

This guide explains how to specify **projections** using builders in the MongoDB Kotlin driver. MongoDB supports **field projection**, allowing you to include or exclude fields in query results. Key rules include:

- The `_id` field is *always* included unless excluded.
- Including a field excludes all others **except** `_id`.
- Excluding a field removes only that field.

The `Projections` class provides static methods for MongoDB projection operators, returning BSON types for projection methods. You can import methods for brevity:

```kotlin
import com.mongodb.client.model.Projections.*
```

### Sample Documents and Examples

Examples use a sample collection `projection_builders`, with a `MongoCollection` instance referred to as `collection`. The collection contains documents representing monthly average temperatures for 2018 and 2019.

```json
{
  "year" : 2018,
  "type" : "even number but not a leap year",
  "temperatures" : [...]
},
{
  "year" : 2019,
  "type" : "odd number, can't be a leap year",
  "temperatures" : [...]
}
```

The data class for documents is:

```kotlin
data class YearlyTemperature(
    @BsonId val id: ObjectId,
    val year: Int,
    val type: String,
    val temperatures: List<MonthlyTemperature>
) {
    data class MonthlyTemperature(val month: String, val avg: Double)
}
```

You can use builder methods with data class properties by adding the Kotlin driver extensions dependency.

## Projection Operations

### Inclusion

Use `include()` to specify fields to include. Example including `year`:

```kotlin
data class Results(@BsonId val id: ObjectId, val year: Int)

val filter = Filters.empty()
val projection = Projections.include(YearlyTemperature::year.name)
val resultsFlow = collection.find<Results>(filter).projection(projection)
resultsFlow.collect { println(it) }
```

### Exclusion

Use `exclude()` to specify fields to exclude. Example excluding `temperatures`:

```kotlin
data class Results(@BsonId val id: ObjectId, val year: Int, val type: String)

val filter = Filters.empty()
val projection = Projections.exclude(YearlyTemperature::temperatures.name)
val resultsFlow = collection.find<Results>(filter).projection(projection)
resultsFlow.collect { println(it) }
```

### Combining Projections

Use `fields()` to combine projections. Example including `year` and `type`, excluding `_id`:

```kotlin
data class Results(val year: Int, val type: String)

val filter = Filters.empty()
val projection = Projections.fields(
    Projections.include(YearlyTemperature::year.name, YearlyTemperature::type.name),
    Projections.excludeId()
)
val resultsFlow = collection.find<Results>(filter).projection(projection)
resultsFlow.collect { println(it) }
```

### Exclusion of `_id`

Use `excludeId()` to exclude the `_id` field:

```kotlin
data class Results(val year: Int, val type: String, val temperatures: List<YearlyTemperature.MonthlyTemperature>)
val filter = Filters.empty()
val projection = Projections.excludeId()
val resultsFlow = collection.find<Results>(filter).projection(projection)
resultsFlow.collect { println(it) }
```

### Project an Array Element Match

Use `elemMatch(String, Bson)` to project the first matching array element. Example for `avg` > 10.1:

```kotlin
data class Results(val year: Int, val temperatures: List<YearlyTemperature.MonthlyTemperature>?)

val filter = Filters.empty()
val projection = Projections.fields(
    Projections.include(YearlyTemperature::year.name),
    Projections.elemMatch(YearlyTemperature::temperatures.name, Filters.gt(YearlyTemperature.MonthlyTemperature::avg.name, 10.1))
)
val resultsFlow = collection.find<Results>(filter).projection(projection)
resultsFlow.collect { println(it) }
```

### Project an Array Slice

Use `slice()` to project a portion of an array. Example for the first 6 elements:

```kotlin
data class Results(val temperatures: List<YearlyTemperature.MonthlyTemperature>)

val filter = Filters.empty()
val projection = Projections.fields(
    Projections.slice(YearlyTemperature::temperatures.name, 6),
    Projections.excludeId()
)
val resultsFlow = collection.find<Results>(filter).projection(projection)
resultsFlow.collect { println(it) }
```

### Project a Text Score

Use `metaTextScore()` to project the score of a text query. Example:

```kotlin
data class Results(val year: Int, val score: Double)

val filter = Filters.text("even number")
val projection = Projections.fields(
    Projections.include(YearlyTemperature::year.name),
    Projections.metaTextScore("score")
)
val resultsFlow = collection.find<Results>(filter).projection(projection)
resultsFlow.collect { println(it) }
```

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/builders/sort/
# Sorts Builders

## Overview

This guide explains how to specify **sort criteria** for queries using **builders** in the MongoDB Kotlin Driver. Sort criteria dictate how MongoDB sorts data, such as:

- Smallest to largest number
- Earliest to latest time
- Alphabetical order

Builders help construct BSON objects. For more details, refer to the builders guide. 

The examples use a sample collection with documents:

```json
{ "_id": 1, "date": "2022-01-03", "orderTotal": 17.86, "description": "1/2 lb cream cheese and 1 dozen bagels" },
{ "_id": 2, "date": "2022-01-11", "orderTotal": 83.87, "description": "two medium vanilla birthday cakes" },
{ "_id": 3, "date": "2022-01-11", "orderTotal": 19.49, "description": "1 dozen vanilla cupcakes" },
{ "_id": 4, "date": "2022-01-15", "orderTotal": 43.62, "description": "2 chicken lunches and a diet coke" },
{ "_id": 5, "date": "2022-01-23", "orderTotal": 60.31, "description": "one large vanilla and chocolate cake" },
{ "_id": 6, "date": "2022-01-23", "orderTotal": 10.99, "description": "1 bagel, 1 orange juice, 1 muffin" }
```

Modeled with the Kotlin data class:

```kotlin
data class Order(
    @BsonId val id: Int,
    val date: String,
    val orderTotal: Double,
    val description: String,
)
```

Use builder methods with data class properties by adding the Kotlin driver extensions dependency. See the Use Builders with Data Classes guide for examples.

## The Sorts Class

The `Sorts` class provides static factory methods for sort criteria operators, returning a `Bson` object for the `sort()` method of a `FindFlow` instance or `Aggregates.sort()`. For more on `Aggregates`, see the Aggregates builder guide.

Refer to the API Documentation for:

- Sorts
- BSON
- FindFlow
- Aggregates

## Ascending

To sort in ascending order, use `Sorts.ascending()` with the field name:

```kotlin
val resultsFlow = collection.find()
    .sort(Sorts.ascending(Order::orderTotal.name))

resultsFlow.collect { println(it) }
```

```console
Order(id=6, date=2022-01-23, orderTotal=10.99, description=1 bagel, 1 orange juice, 1 muffin)
Order(id=1, date=2022-01-03, orderTotal=17.86, description=1/2 lb cream cheese and 1 dozen bagels)
Order(id=3, date=2022-01-11, orderTotal=19.49, description=1 dozen vanilla cupcakes)
Order(id=4, date=2022-01-15, orderTotal=43.62, description=2 chicken lunches and a diet coke)
Order(id=5, date=2022-01-23, orderTotal=60.31, description=one large vanilla and chocolate cake)
Order(id=2, date=2022-01-11, orderTotal=83.87, description=two medium vanilla birthday cakes)
```

## Descending

For descending order, use `Sorts.descending()`:

```kotlin
val resultsFlow = collection.find()
    .sort(Sorts.descending(Order::orderTotal.name))

resultsFlow.collect { println(it) }
```

```console
Order(id=2, date=2022-01-11, orderTotal=83.87, description=two medium vanilla birthday cakes)
Order(id=5, date=2022-01-23, orderTotal=60.31, description=one large vanilla and chocolate cake)
Order(id=4, date=2022-01-15, orderTotal=43.62, description=2 chicken lunches and a diet coke)
Order(id=3, date=2022-01-11, orderTotal=19.49, description=1 dozen vanilla cupcakes)
Order(id=1, date=2022-01-03, orderTotal=17.86, description=1/2 lb cream cheese and 1 dozen bagels)
Order(id=6, date=2022-01-23, orderTotal=10.99, description=1 bagel, 1 orange juice, 1 muffin)
```

## Combining Sort Criteria

To combine sort criteria, use `Sorts.orderBy()`:

```kotlin
val orderBySort = Sorts.orderBy(
    Sorts.descending(Order::date.name), Sorts.ascending(Order::orderTotal.name)
)
val results = collection.find().sort(orderBySort)

results.collect { println(it) }
```

```console
Order(id=6, date=2022-01-23, orderTotal=10.99, description=1 bagel, 1 orange juice, 1 muffin)
Order(id=5, date=2022-01-23, orderTotal=60.31, description=one large vanilla and chocolate cake)
Order(id=4, date=2022-01-15, orderTotal=43.62, description=2 chicken lunches and a diet coke)
Order(id=3, date=2022-01-11, orderTotal=19.49, description=1 dozen vanilla cupcakes)
Order(id=2, date=2022-01-11, orderTotal=83.87, description=two medium vanilla birthday cakes)
Order(id=1, date=2022-01-03, orderTotal=17.86, description=1/2 lb cream cheese and 1 dozen bagels)
```

## Text Score

Sort text search results by their text score using `Sorts.metaTextScore()`. For detailed examples, see the text search section of the sorting guide. For more information, refer to the Sorts class API Documentation.

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/builders/updates/
# Updates Builders

## Overview

This guide explains how to specify **updates** using builders in the MongoDB Kotlin Driver. The `Updates` builder offers methods for:

- Field Updates
- Array Updates
- Combining Multiple Update Operators

Methods that expect updates include:

- `updateOne()`
- `updateMany()`
- `bulkWrite()`

The `Updates` class provides static factory methods for MongoDB update operators, returning BSON instances for update arguments. You can import methods for brevity:

```kotlin
import com.mongodb.client.model.Updates.*
```

Example document:

```json
{
   "_id": 1,
   "color": "red",
   "qty": 5,
   "vendor": [
      { "name": "A" },
      { "name": "D" },
      { "name": "M" }
   ],
   "lastModified": { "$date": "2000-01-01T07:00:00.000Z" }
}
```

Data class:

```kotlin
data class PaintOrder (
    @BsonId val id: Int,
    val color: String,
    val qty: Int?,
    val vendor: List<Vendor>?,
    val lastModified: LocalDateTime?
)

data class Vendor (
    val name: String,
)
```

Use builder methods directly with data class properties by adding the Kotlin driver extensions dependency.

## Field Updates

### Set

Use `set()` to assign a field's value. Example:

```kotlin
val filter = Filters.eq("_id", 1)
val update = Updates.set(PaintOrder::qty.name, 11)
collection.updateOne(filter, update)
```

Updated document:

```json
{
   "_id": 1,
   "color": "red",
   "qty": 11,
   "vendor": [
      { "name": "A" },
      { "name": "D" },
      { "name": "M" }
   ],
   "lastModified": { "$date": "2000-01-01T07:00:00.000Z" }
}
```

### Unset

Use `unset()` to delete a field's value. Example:

```kotlin
val filter = Filters.eq("_id", 1)
val update = Updates.unset(PaintOrder::qty.name)
collection.updateOne(filter, update)
```

Updated document:

```json
{
   "_id": 1,
   "color": "red",
   "vendor": [
      { "name": "A" },
      { "name": "D" },
      { "name": "M" }
   ],
   "lastModified": { "$date": "2000-01-01T07:00:00.000Z" }
}
```

### Set On Insert

Use `setOnInsert()` for field assignment on document insert. Example:

```kotlin
val filter = Filters.eq("_id", 1)
val update = Updates.setOnInsert(PaintOrder::color.name, "pink")
collection.updateOne(filter, update, UpdateOptions().upsert(true))
```

Updated document if inserted:

```json
{
   "_id": 1,
   "color": "pink"
}
```

### Increment

Use `inc()` to increment a numeric field. Example:

```kotlin
val filter = Filters.eq("_id", 1)
val update = Updates.inc(PaintOrder::qty.name, 3)
collection.updateOne(filter, update)
```

Updated document:

```json
{
   "_id": 1,
   "color": "red",
   "qty": 8,
   "vendor": [
      { "name": "A" },
      { "name": "D" },
      { "name": "M" }
   ],
   "lastModified": { "$date": "2000-01-01T07:00:00.000Z" }
}
```

### Multiply

Use `mul()` to multiply a numeric field. Example:

```kotlin
val filter = Filters.eq("_id", 1)
val update = Updates.mul(PaintOrder::qty.name, 2)
collection.updateOne(filter, update)
```

Updated document:

```json
{
   "_id": 1,
   "color": "red",
   "qty": 10,
   "vendor": [
      { "name": "A" },
      { "name": "D" },
      { "name": "M" }
   ],
   "lastModified": { "$date": "2000-01-01T07:00:00.000Z" }
}
```

### Rename

Use `rename()` to rename a field. Example:

```kotlin
val filter = Filters.eq("_id", 1)
val update = Updates.rename(PaintOrder::qty.name, "quantity")
collection.updateOne(filter, update)
```

Updated document:

```json
{
   "_id": 1,
   "color": "red",
   "vendor": [
      { "name": "A" },
      { "name": "D" },
      { "name": "M" }
   ],
   "lastModified": { "$date": "2000-01-01T07:00:00.000Z" },
   "quantity": 5
}
```

### Min

Use `min()` to set a field's value if the new value is less. Example:

```kotlin
val filter = Filters.eq("_id", 1)
val update = Updates.min(PaintOrder::qty.name, 2)
collection.updateOne(filter, update)
```

Updated document:

```json
{
   "_id": 1,
   "color": "red",
   "qty": 2,
   "vendor": [
      { "name": "A" },
      { "name": "D" },
      { "name": "M" }
   ],
   "lastModified": { "$date": "2000-01-01T07:00:00.000Z" }
}
```

### Max

Use `max()` to update a field with the larger value. Example:

```kotlin
val filter = Filters.eq("_id", 1)
val update = Updates.max(PaintOrder::qty.name, 8)
collection.updateOne(filter, update)
```

Updated document:

```json
{
   "_id": 1,
   "color": "red",
   "qty": 8,
   "vendor": [
      { "name": "A" },
      { "name": "D" },
      { "name": "M" }
   ],
   "lastModified": { "$date": "2000-01-01T07:00:00.000Z" }
}
```

### Current Date

Use `currentDate()` to set a field to the current date. Example:

```kotlin
val filter = Filters.eq("_id", 1)
val update = Updates.currentDate(PaintOrder::lastModified.name)
collection.updateOne(filter, update)
```

Updated document:

```json
{
   "_id": 1,
   "color": "red",
   "qty": 5,
   "vendor": [
      { "name": "A" },
      { "name": "D" },
      { "name": "M" }
   ],
   "$date": "2023-06-16T17:13:06.373Z"
}
```

### Current Timestamp

Use `currentTimestamp()` to set a field to the current timestamp. Example:

```kotlin
val collection = database.getCollection<Document>("paint_orders")
val filter = Filters.eq("_id", 1)
val update = Updates.currentTimestamp(PaintOrder::lastModified.name)
collection.updateOne(filter, update)
```

Updated document:

```json
{
   "_id": 1,
   "color": "red",
   "qty": 5,
   "vendor": [
      { "name": "A" },
      { "name": "D" },
      { "name": "M" }
   ],
   "$timestamp": { "t": 1686935654, "i": 3 }
}
```

### Bit

Use `bitwiseOr()`, `bitwiseAnd()`, and `bitwiseXor()` for bitwise updates. Example:

```kotlin
val filter = Filters.eq("_id", 1)
val update = Updates.bitwiseOr(PaintOrder::qty.name, 10)
collection.updateOne(filter, update)
```

Updated document:

```json
{
   "_id": 1,
   "color": "red",
   "qty": 15,
   "vendor": [
      { "name": "A" },
      { "name": "D" },
      { "name": "M" }
   ],
   "lastModified": { "$date": "2000-01-01T07:00:00.000Z" }
}
```

## Array Updates

### Add to Set

Use `addToSet()` to append a value if not present. Example:

```kotlin
val filter = Filters.eq("_id", 1)
val update = Updates.addToSet(PaintOrder::vendor.name, Vendor("C"))
collection.updateOne(filter, update)
```

Updated document:

```json
{
   "_id": 1,
   "color": "red",
   "qty": 5,
   "vendor": [
      { "name": "A" },
      { "name": "D" },
      { "name": "M" },
      { "name": "C" }
   ],
   "lastModified": { "$date": "2000-01-01T07:00:00.000Z" }
}
```

### Pop

Use `popFirst()` or `popLast()` to remove array elements. Example:

```kotlin
val filter = Filters.eq("_id", 1)
val update = Updates.popFirst(PaintOrder::vendor.name)
collection.updateOne(filter, update)
```

Updated document:

```json
{
   "_id": 1,
   "color": "red",
   "qty": 5,
   "vendor": [
      { "name": "D" },
      { "name": "M" }
   ],
   "lastModified": { "$date": "2000-01-01T07:00:00.000Z" }
}
```

### Pull All

Use `pullAll()` to remove specified values. Example:

```kotlin
val filter = Filters.eq("_id", 1)
val update = Updates.pullAll(PaintOrder::vendor.name, listOf(Vendor("A"), Vendor("M")))
collection.updateOne(filter, update)
```

Updated document:

```json
{
   "_id": 1,
   "color": "red",
   "qty": 5,
   "vendor": [
      { "name": "D" }
   ],
   "lastModified": { "$date": "2000-01-01T07:00:00.000Z" }
}
```

### Pull

Use `pull()` to remove specified values. Example:

```kotlin
val filter = Filters.eq("_id", 1)
val update = Updates.pull(PaintOrder::vendor.name, Vendor("D"))
collection.updateOne(filter, update)
```

Updated document:

```json
{
   "_id": 1,
   "color": "red",
   "qty": 5,
   "vendor": [
      { "name": "A" },
      { "name": "M" }
   ],
   "lastModified": { "$date": "2000-01-01T07:00:00.000Z" }
}
```

### Push

Use `push()` to append a value. Example:

```kotlin
val filter = Filters.eq("_id", 1)
val update = Updates.push(PaintOrder::vendor.name, Vendor("Q"))
collection.updateOne(filter, update)
```

Updated document:

```json
{
   "_id": 1,
   "color": "red",
   "qty": 5,
   "vendor": [
      { "name": "A" },
      { "name": "D" },
      { "name": "M" },
      { "name": "Q" }
   ],
   "lastModified": { "$date": "2000-01-01T07:00:00.000Z" }
}
```

## Combining Multiple Update Operators

Combine multiple updates in one operation. Example:

```kotlin
val filter = Filters.eq("_id", 1)
val update = Updates.combine(
    Updates.set(PaintOrder::color.name, "purple"),
    Updates.inc(PaintOrder::qty.name, 6),
    Updates.push(PaintOrder::vendor.name, Vendor("R"))
)
collection.updateOne(filter, update)
```

Updated document:

```json
{
   "_id": 1,
   "color": "purple",
   "qty": 11,
   "vendor": [
      { "name": "A" },
      { "name": "D" },
      { "name": "M" },
      { "name": "R" }
   ],
   "lastModified": { "$date": "2000-01-01T07:00:00.000Z" }
}
```

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/builders/builders-data-classes/
# Use Builders with Data Classes

## Overview

This guide explains using data class properties with builder classes in the Kotlin driver, enhancing type safety and Kotlin interoperability. The extensions library supports constructing queries, updates, and other statements using infix notation.

## Add Kotlin Extensions to Your Project

Add the `mongodb-driver-kotlin-extensions` dependency:

**Gradle:**
```kotlin
implementation("org.mongodb:mongodb-driver-kotlin-extensions:5.3.0")
```

**Maven:**
```xml
<dependency>
    <groupId>org.mongodb</groupId>
    <artifactId>mongodb-driver-kotlin-extensions</artifactId>
    <version>5.3.0</version>
</dependency>
```

Import classes from `com.mongodb.kotlin.client.model` to use extension methods alongside standard builder methods.

## Builders Examples

### Sample Data

Example data class for `students` collection:
```kotlin
data class Student(
    val name: String,
    val teachers: List<String>,
    val gradeAverage: Double
)
```

### Filters

Use `Filters` builders class for querying:
```kotlin
import com.mongodb.kotlin.client.model.Filters.eq
import com.mongodb.kotlin.client.model.Filters.all

val student = Student("Sandra Nook", listOf("Alvarez", "Gruber"), 85.7)

// Equality queries
Student::name.eq(student.name)
eq(Student::name, student.name)
Student::name eq student.name // Infix

// Array queries
all(Student::teachers, student.teachers)
Student::teachers.all(student.teachers)
Student::teachers all student.teachers // Infix
```

### Indexes

Create indexes using `Indexes` builders class:
```kotlin
import com.mongodb.kotlin.client.model.Indexes.ascending
import com.mongodb.kotlin.client.model.Indexes.descending

val ascendingIdx = Indexes.ascending(Student::name)
val descendingIdx = Indexes.descending(Student::teachers)

collection.createIndex(ascendingIdx)
collection.createIndex(descendingIdx)
```

### Projections

Create projections with `Projections` builders class:
```kotlin
import com.mongodb.kotlin.client.model.Projections.excludeId
import com.mongodb.kotlin.client.model.Projections.fields
import com.mongodb.kotlin.client.model.Projections.include

val combinedProj = fields(include(Student::name, Student::gradeAverage), excludeId())
collection.find().projection(combinedProj)
```

### Sorts

Sort using `Sorts` builders class:
```kotlin
import com.mongodb.client.model.Sorts.orderBy
import com.mongodb.kotlin.client.model.Sorts

val sort = orderBy(Sorts.descending(Student::gradeAverage), Sorts.ascending(Student::name))
collection.find().sort(sort)
```

### Updates

Perform updates with `Updates` builders class:
```kotlin
import com.mongodb.kotlin.client.model.Filters.gte
import com.mongodb.kotlin.client.model.Updates.addToSet
import com.mongodb.kotlin.client.model.Updates.combine
import com.mongodb.kotlin.client.model.Updates.max

val filter = Student::gradeAverage gte 85.0
val update = combine(addToSet(Student::teachers, "Soto"), Student::gradeAverage.max(90.0))
collection.updateMany(filter, update)
```

### Aggregates

Use `Aggregates` and `Accumulators` builders for aggregations:
```kotlin
import com.mongodb.client.model.Aggregates.group
import com.mongodb.client.model.Aggregates.limit
import com.mongodb.client.model.Aggregates.sort
import com.mongodb.kotlin.client.model.Accumulators.avg

data class Summary(val average: Double)

val pipeline = listOf(
    sort(Sorts.descending(Student::gradeAverage)),
    limit(3),
    group(null, avg(Summary::average, "\$${Student::gradeAverage.name}"))
)

val result = collection.aggregate<Summary>(pipeline)
```

## API Documentation

- Kotlin driver Extensions

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/aggregation/
# Aggregation

## Overview

This guide covers **aggregation operations** in the MongoDB Kotlin driver, which process data in collections and return computed results via a multi-staged pipeline.

Think of aggregation as an assembly line in a car factory, where **aggregation pipeline** is the line, **aggregation stages** are stations, and **operator expressions** are tools.

### Aggregation vs. Find Operations

With `find`, you can:

- select *what* documents and fields to return
- sort results

With `aggregation`, you can:

- perform all `find` operations
- rename fields
- calculate and summarize data
- group values

Limitations include:

- Returned documents must not exceed 16 MB.
- Pipeline stages have a default memory limit of 100 MB, which can be exceeded with `allowDiskUse`, except for the $graphLookup stage.

### Useful References

- Aggregation pipeline
- Aggregation stages
- Operator expressions
- Aggregation Builders

## Example Data

Example data in MongoDB:

```json
[
   {"name": "Sun Bakery Trattoria", "contact": {"phone": "386-555-0189", "email": "SunBakeryTrattoria@example.org", "location": [-74.0056649, 40.7452371]}, "stars": 4, "categories": ["Pizza", "Pasta", "Italian", "Coffee", "Sandwiches"]},
   ...
]
```

Data modeled by the `Restaurant` data class:

```kotlin
data class Restaurant(
    val name: String,
    val contact: Contact,
    val stars: Int,
    val categories: List<String>
) {
    data class Contact(
        val phone: String,
        val email: String,
        val location: List<Double>
    )
}
```

## Basic Aggregation

To aggregate, pass a list of stages to `MongoCollection.aggregate()`. Use the Aggregates helper class for building stages.

Example aggregation pipeline:

```kotlin
data class Results(@BsonId val id: Int, val count: Int)

val resultsFlow = collection.aggregate<Results>(
    listOf(
        Aggregates.match(Filters.eq(Restaurant::categories.name, "Bakery")),
        Aggregates.group("\$${Restaurant::stars.name}", Accumulators.sum("count", 1))
    )
)

resultsFlow.collect { println(it) }
```

Output:

```
Results(id=4, count=2)
Results(id=5, count=1)
```

## Explain Aggregation

Use the `explain()` method of `AggregateFlow` to view execution plans and performance statistics. Specify verbosity levels for detail:

- **ALL_PLANS_EXECUTIONS**: Which plan MongoDB will choose.
- **EXECUTION_STATS**: Query performance.
- **QUERY_PLANNER**: Diagnose query issues.

Example:

```kotlin
val explanation = collection.aggregate<Results>(
    listOf(
        Aggregates.match(Filters.eq(Restaurant::categories.name, "bakery")),
        Aggregates.group("\$${Restaurant::stars.name}", Accumulators.sum("count", 1))
    )
).explain(ExplainVerbosity.EXECUTION_STATS)

println(explanation.toJson(JsonWriterSettings.builder().indent(true).build()))
```

## Aggregation Expressions

The Kotlin driver provides builders for accumulator expressions for `$group`. Define other expressions in JSON format.

Example of `$arrayElemAt` expression:

```kotlin
Document("\$arrayElemAt", listOf("\$categories", 0))
```

Example using `$project` stage:

```kotlin
data class Results(val name: String, val firstCategory: String)

val resultsFlow = collection.aggregate<Results>(
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

resultsFlow.collect { println(it) }
```

Output:

```
Results(name=Sun Bakery Trattoria, firstCategory=Pizza)
...
```

For more information, see:

- Accumulators
- $group
- $project
- Projections

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/aggregation-expression-operations/
# Aggregation Expression Operations

## Overview

This guide explains how to use the MongoDB Kotlin Driver for constructing expressions in aggregation pipelines using typesafe Java methods. These methods allow chaining operations for more compact and readable code.

The operations utilize methods from the `com.mongodb.client.model.mql` package, providing an idiomatic way to use the Query API. For more on the Query API, refer to the Server manual documentation.

## How to Use Operations

Include the following imports:

```kotlin
import com.mongodb.client.model.Aggregates
import com.mongodb.client.model.Accumulators
import com.mongodb.client.model.Projections
import com.mongodb.client.model.Filters
import com.mongodb.client.model.mql.MqlValues
```

Use the `current()` method to reference the current document in the aggregation pipeline. Access field values with typed methods like `getString()` or `getDate()`. For example, to reference a string field `name`:

```kotlin
current().getString("name")
```

To specify a value, use the `of()` constructor:

```kotlin
of(1.0)
```

Chain methods to create operations. For example, to find patients in New Mexico who have visited the doctor’s office:

```kotlin
current()
    .getArray("visitDates")
    .size()
    .gt(of(0))
    .and(current()
        .getString("state")
        .eq(of("New Mexico")))
```

Some stages, like `group()`, accept operations directly, while others require methods like `computed()` or `expr()`. Include your expression in an aggregates builder method, such as:

- `match(expr(<expression>))`
- `project(fields(computed("<field name>", <expression>)))`
- `group(<expression>)`

Use `listOf()` to create a list of aggregation stages, passed to `aggregate()` of `MongoCollection`.

## Constructor Methods

Use these methods to define values for Kotlin aggregation expressions.

| Method | Description |
|--------|-------------|
| current() | References the current document. |
| currentAsMap() | References the current document as a map. |
| of() | Returns an `MqlValue` type for the provided primitive. |
| ofArray() | Returns an array of `MqlValue` types for the provided array. |
| ofEntry() | Returns an entry value. |
| ofMap() | Returns an empty map value. |
| ofNull() | Returns the null value in the Query API. |

Values provided to these methods are treated literally (e.g., `of("$x")` is the string `"$x"`).

## Operations

The following sections detail aggregation expression operations categorized by purpose.

### Arithmetic Operations

Perform arithmetic on `MqlInteger` or `MqlNumber` using:

| Method | Aggregation Pipeline Operator |
|--------|-------------------------------|
| abs() | $abs |
| add() | $add |
| divide() | $divide |
| multiply() | $multiply |
| round() | $round |
| subtract() | $subtract |

Example for calculating average precipitation:

```kotlin
val month = current().getDate("date").month(of("UTC"))
val precip = current().getInteger("precipitation")

listOf(
    Aggregates.group(
        month,
        Accumulators.avg("avgPrecipMM", precip.multiply(25.4))
))
```

### Array Operations

Perform array operations on `MqlArray`:

| Method | Aggregation Pipeline Operator |
|--------|-------------------------------|
| all() | $allElementsTrue |
| any() | $anyElementTrue |
| concat() | $concatArrays |
| contains() | $in |
| distinct() | $setUnion |
| filter() | $filter |
| first() | $first |
| last() | $last |
| map() | $map |
| sum() | $sum |

Example for filtering available showtimes:

```kotlin
val showtimes = current().getArray<MqlDocument>("showtimes")

listOf(
    Aggregates.project(
        Projections.fields(
            Projections.computed("availableShowtimes", showtimes
                .filter { showtime ->
                    val seats = showtime.getArray<MqlInteger>("seats")
                    val totalSeats = seats.sum { n -> n }
                    val ticketsBought = showtime.getInteger("ticketsBought")
                    ticketsBought.lt(totalSeats)
                })
)))

```

### Boolean Operations

Perform boolean operations on `MqlBoolean`:

| Method | Aggregation Pipeline Operator |
|--------|-------------------------------|
| and() | $and |
| not() | $not |
| or() | $or |

Example for classifying extreme temperatures:

```kotlin
val temperature = current().getInteger("temperature")

listOf(
    Aggregates.project(
        Projections.fields(
            Projections.computed("extremeTemp", temperature
                .lt(of(10))
                .or(temperature.gt(of(95))))
)))
```

### Comparison Operations

Perform comparison operations on `MqlValue`:

| Method | Aggregation Pipeline Operator |
|--------|-------------------------------|
| eq() | $eq |
| gt() | $gt |
| gte() | $gte |
| lt() | $lt |
| lte() | $lte |
| ne() | $ne |

Example for matching documents with location "California":

```kotlin
val location = current().getString("location")

listOf(
    Aggregates.match(
        Filters.expr(location.eq(of("California")))
))
```

### Conditional Operations

Perform conditional operations:

| Method | Aggregation Pipeline Operator |
|--------|-------------------------------|
| cond() | $cond |
| switchOn() | $switch |

Example for standardizing membership levels:

```kotlin
val member = current().getField("member")

listOf(
    Aggregates.project(
        Projections.fields(
            Projections.computed("membershipLevel",
                member.switchOn{field -> field
                    .isString{s-> s}
                    .isBoolean{b -> b.cond(of("Gold"), of("Guest"))}
                    .isArray { a -> a.last()}
                    .defaults{ d -> of("Guest")}})
)))
```

### Convenience Operations

Apply custom functions using:

| Method | Aggregation Pipeline Operator |
|--------|-------------------------------|
| passTo() | *No corresponding operator* |

Example for evaluating class performance:

```kotlin
val students = current().getArray<MqlDocument>("students")

listOf(
    Aggregates.project(
        Projections.fields(
            Projections.computed("evaluation", students
                .passArrayTo { s -> gradeAverage(s, "finalGrade") }
                .passNumberTo { grade -> evaluate(grade, of(70), of(85)) })
)))
```

### Conversion Operations

Perform conversion operations:

| Method | Aggregation Pipeline Operator |
|--------|-------------------------------|
| asString() for MqlDate | $dateToString |
| millisecondsAsDate() | $toDate |
| parseInteger() | $toInt |

Example for calculating reunion year:

```kotlin
val graduationYear = current().getString("graduationYear")

listOf(
    Aggregates.addFields(
        Field("reunionYear",
            graduationYear
                .parseInteger()
                .add(5))
))
```

### Date Operations

Perform date operations:

| Method | Aggregation Pipeline Operator |
|--------|-------------------------------|
| dayOfMonth() | $dayOfMonth |
| dayOfWeek() | $dayOfWeek |
| month() | $month |
| year() | $year |

Example for matching deliveries on Mondays:

```kotlin
val deliveryDate = current().getString("deliveryDate")

listOf(
    Aggregates.match(
        Filters.expr(deliveryDate
            .parseDate()
            .dayOfWeek(of("America/New_York"))
            .eq(of(2))
)))
```

### Document Operations

Perform document operations:

| Method | Aggregation Pipeline Operator |
|--------|-------------------------------|
| getArray() | $getField |
| merge() | $mergeObjects |
| setField() | $setField |

Example for finding customers in Washington state:

```kotlin
val address = current().getDocument("mailing.address")

listOf(
    Aggregates.match(
        Filters.expr(address
            .getString("state")
            .eq(of("WA"))
)))
```

### Map Operations

Perform map operations:

| Method | Aggregation Pipeline Operator |
|--------|-------------------------------|
| entries() | $objectToArray |

Example for calculating total inventory:

```kotlin
val warehouses = current().getMap<MqlNumber>("warehouses")

listOf(
    Aggregates.project(
        Projections.fields(
            Projections.computed("totalInventory", warehouses
                .entries()
                .sum { v -> v.getValue() })
)))
```

### String Operations

Perform string operations:

| Method | Aggregation Pipeline Operator |
|--------|-------------------------------|
| append() | $concat |
| length() | $strLenCP |

Example for generating usernames:

```kotlin
val lastName = current().getString("lastName")
val employeeID = current().getString("employeeID")

listOf(
    Aggregates.project(
        Projections.fields(
            Projections.computed("username", lastName
                .append(employeeID)
                .toLower())
)))
```

### Type-Checking Operations

Perform type-checking operations:

| Method | Aggregation Pipeline Operator |
|--------|-------------------------------|
| isNumberOr() | *No corresponding operator* |

Example for converting negative reviews:

```kotlin
val rating = current().getField("rating")

listOf(
    Aggregates.project(
        Projections.fields(
            Projections.computed("numericalRating", rating
                .isNumberOr(of(1)))
)))
```

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/indexes/
# Indexes

## Overview

This guide covers creating and managing **indexes** with the MongoDB Kotlin Driver. Indexes enhance query execution efficiency, preventing slow collection scans. Benefits include efficient sorting, geospatial queries, and unique constraints.

Update and delete operations utilize indexes, and certain aggregation stages improve performance with them.

### Query Coverage and Performance

Queries can include:

- Criteria for fields and values
- Execution options (e.g., read concern)
- Optional projection criteria
- Optional sort criteria

A **covered query** occurs when all specified fields are in the same index. Sort criteria must match or invert the index order.

Example index on `name` (A-Z) and `age` (9-0):

```none
name_1_age_-1
```

MongoDB uses this index for sorting in specified orders.

### Operational Considerations

Optimize index usage by:

- Building indexes on frequently queried fields.
- Monitoring index memory and disk usage.
- Avoiding infrequently used indexes.

MongoDB 4.2 introduced wildcard indexes for dynamic schemas, but they don't replace workload-based index planning.

## Index Types

MongoDB supports various index types. The Kotlin driver provides the Indexes class for index management. Examples use the createIndex() method with data classes for MongoDB:

```kotlin
data class Movie(
    val title: String,
    val year: Int,
    val cast: List<String>,
    val genres: List<String>,
    val type: String,
    val rated: String,
    val plot: String,
    val fullplot: String,
)

data class Theater(
    val theaterId: Int,
    val location: Location
) {
    data class Location(
        val address: Address,
        val geo: Point
    ) {
        data class Address(
            val street1: String,
            val city: String,
            val state: String,
            val zipcode: String
        )
    }
}
```

### Single Field and Compound Indexes

#### Single Field Indexes

Single field indexes improve query performance. The `_id_` index is automatically created. Example of creating an index on `title`:

```kotlin
val resultCreateIndex = moviesCollection.createIndex(Indexes.ascending(Movie::title.name))
println("Index created: $resultCreateIndex")
```

Example of a covered query:

```kotlin
val filter = Filters.eq(Movie::title.name, "The Dark Knight")
val sort = Sorts.ascending(Movie::title.name)
val projection = Projections.fields(
    Projections.include(Movie::title.name),
    Projections.excludeId()
)

val resultsFlow = moviesCollection.find<Results>(filter).sort(sort).projection(projection)
resultsFlow.collect { println(it) }
```

#### Compound Indexes

Compound indexes reference multiple fields. Example of creating a compound index on `type` and `rated`:

```kotlin
val resultCreateIndex = moviesCollection.createIndex(Indexes.ascending(Movie::type.name, Movie::rated.name))
println("Index created: $resultCreateIndex")
```

Covered query example:

```kotlin
val filter = Filters.and(
    Filters.eq(Movie::type.name, "movie"),
    Filters.eq(Movie::rated.name, "G")
)
val sort = Sorts.ascending(Movie::type.name, Movie::rated.name)
val projection = Projections.fields(
    Projections.include(Movie::type.name, Movie::rated.name),
    Projections.excludeId()
)
val resultsFlow = moviesCollection.find(filter).sort(sort).projection(projection)
resultsFlow.collect { println(it) }
```

### Multikey Indexes

**Multikey indexes** improve performance for array fields. Example of creating a compound multikey index:

```kotlin
val resultCreateIndex = moviesCollection.createIndex(Indexes.ascending(Movie::rated.name, Movie::genres.name, Movie::title.name))
println("Index created: $resultCreateIndex")
```

Covered query example:

```kotlin
val filter = Filters.and(
    Filters.eq(Movie::genres.name, "Animation"),
    Filters.eq(Movie::rated.name, "G")
)
val sort = Sorts.ascending(Movie::title.name)
val projection = Projections.fields(
    Projections.include(Movie::title.name, Movie::rated.name),
    Projections.excludeId()
)
val resultsFlow = moviesCollection.find(filter).sort(sort).projection(projection)
resultsFlow.collect { println(it) }
```

### Atlas Search and Vector Search Indexes

Manage Atlas Search and Vector Search indexes with the Kotlin driver. Methods include:

- `createSearchIndex()`
- `createSearchIndexes()`
- `listSearchIndexes()`
- `updateSearchIndex()`
- `dropSearchIndex()`

Example of creating an Atlas Search index:

```kotlin
val searchIdx = Document("mappings", Document("dynamic", true))
val resultCreateIndex = moviesCollection.createSearchIndex("myIndex", searchIdx)
```

Example of creating multiple indexes:

```kotlin
val searchIdxMdl = SearchIndexModel("searchIdx", Document("analyzer", "lucene.standard").append("mappings", Document("dynamic", true)), SearchIndexType.search())
val vectorSearchIdxMdl = SearchIndexModel("vsIdx", Document("fields", listOf(Document("type", "vector").append("path", "embeddings").append("numDimensions", 1536).append("similarity", "dotProduct"))), SearchIndexType.vectorSearch())
val resultCreateIndexes = moviesCollection.createSearchIndexes(listOf(searchIdxMdl, vectorSearchIdxMdl))
```

### Text Indexes

**Text indexes** support text search on string content. Example of creating a text index on `plot`:

```kotlin
try {
    val resultCreateIndex = moviesCollection.createIndex(Indexes.text(Movie::plot.name))
    println("Index created: $resultCreateIndex")
} catch (e: MongoCommandException) {
    if (e.errorCodeName == "IndexOptionsConflict") {
        println("existing text index with different options")
    }
}
```

Example of a covered query:

```kotlin
val filter = Filters.text("Batman")
val projection = Projections.fields(
    Projections.include(Movie::fullplot.name),
    Projections.excludeId()
)

val resultsFlow = moviesCollection.find<Results>(filter).projection(projection)
resultsFlow.collect { println(it) }
```

### Geospatial Indexes

MongoDB supports **2dsphere indexes** for geospatial data. Example of creating a `2dsphere` index:

```kotlin
val resultCreateIndex = theatersCollection.createIndex(Indexes.geo2dsphere("${Theater::location.name}.${Theater.Location::geo.name}"))
println("Index created: $resultCreateIndex")
```

Example of a geospatial query:

```kotlin
val refPoint = Point(Position(-73.98456, 40.7612))
val filter = Filters.near("${Theater::location.name}.${Theater.Location::geo.name}", refPoint, 1000.0, 0.0, ...)
val resultsFlow = theatersCollection.find(filter)
resultsFlow.collect { println(it) }
```

### Unique Indexes

Unique indexes prevent duplicate values. Example of creating a unique index on `theaterId`:

```kotlin
try {
    val indexOptions = IndexOptions().unique(true)
    val resultCreateIndex = theatersCollection.createIndex(Indexes.descending(Theater::theaterId.name), indexOptions)
    println("Index created: $resultCreateIndex")
} catch (e: DuplicateKeyException) {
    println("duplicate field values encountered: ${e.message}")
}
```

### Clustered Indexes

**Clustered indexes** store documents ordered by a key value. Example of creating a clustered index on `_id`:

```kotlin
val clusteredIndexOptions = ClusteredIndexOptions(Document("_id", 1), true)
val createCollectionOptions = CreateCollectionOptions().clusteredIndexOptions(clusteredIndexOptions)
database.createCollection("vendors", createCollectionOptions)
```

## Remove an Index

You can remove any unused index except the default unique index on `_id`. Methods include:

- Using an index specification document
- Using an indexed name field
- Using a wildcard character to remove all indexes

### Remove an Index Using an Index Specification Document

Example of removing an ascending index on `title`:

```kotlin
moviesCollection.dropIndex(Indexes.ascending(Movie::title.name))
```

### Remove an Index Using a Name Field

Example of removing an index by name:

```kotlin
moviesCollection.dropIndex("title_text")
```

### Remove an Index Using a Wildcard Character

Drop all indexes with:

```kotlin
moviesCollection.dropIndexes()
```

For prior versions, use:

```kotlin
moviesCollection.dropIndex("*")
```

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/transactions/
# Transactions

## Overview

This guide explains how to use the Kotlin driver for **transactions**, allowing a series of operations that only change data upon commitment. If an error occurs, the transaction is canceled, and changes are discarded.

Transactions run within logical **sessions**, grouping related operations for causal consistency or ACID transactions. MongoDB ensures data consistency even with unexpected errors.

Create a session from a `MongoClient` instance as a `ClientSession`. Reuse your client for multiple sessions instead of creating a new one each time. Use a `ClientSession` only with the `MongoClient` that created it.

## Methods

Create a `ClientSession` using `startSession()` on your `Client`. Modify session state with:

| Method                | Description                                                                                     |
|-----------------------|-------------------------------------------------------------------------------------------------|
| `startTransaction()`  | Starts a new transaction with default options. Use `startTransaction(transactionOptions)` for options. |
| `abortTransaction()`  | Ends the active transaction. Returns an error if no active transaction exists.                 |
| `commitTransaction()` | Commits the active transaction. Returns an error if no active transaction exists.              |

## Example

This example uses a Kotlin data class for documents:

```kotlin
data class Account(
    val accountId: String,
    val amount: Int
)
```

To create a session, start a transaction, and commit changes:

1. Create a session with `startSession()`.
2. Start a transaction with `startTransaction()`.
3. Update documents, then use `commitTransaction()` if successful, or `abortTransaction()` if any operation fails.

```kotlin
val session = client.startSession()

try {
    session.startTransaction()

    val savingsColl = database.getCollection<Account>("savings_accounts")
    val checkingColl = database.getCollection<Account>("checking_accounts")

    savingsColl.findOneAndUpdate(
        session,
        eq(Account::accountId.name, "9876"),
        inc(Account::amount.name, -100)
    )

    checkingColl.findOneAndUpdate(
        session,
        eq(Account::accountId.name, "9876"),
        inc(Account::amount.name, 100)
    )

    session.commitTransaction()
    println("Transaction committed.")
} catch (error: Exception) {
    println("An error occurred: ${error.message}")
    session.abortTransaction()
}
```

The Kotlin driver does not support parallel operations within a single transaction.

## Additional Information

For more concepts, see:

- Transactions
- Server Sessions
- Read Isolation, Consistency, and Recency

For ACID compliance, refer to the MongoDB article on ACID Properties.

### API Documentation

For more on types or methods, see:

- ClientSession
- startTransaction
- commitTransaction
- abortTransaction

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/collations/
# Collations

## Overview

This guide explains **collations** in MongoDB for ordering query or aggregation results by string values. A collation defines character ordering and matching rules for specific languages and locales.

### Sample Data for Examples

The examples use a MongoDB collection with these documents:

```json
{ "_id" : 1, "firstName" : "Klara" }
{ "_id" : 2, "firstName" : "Gunter" }
{ "_id" : 3, "firstName" : "Günter" }
{ "_id" : 4, "firstName" : "Jürgen" }
{ "_id" : 5, "firstName" : "Hannah" }
```

Represented by:

```kotlin
data class FirstName(
    @BsonId val id: Int,
    val firstName: String,
    val verified: Boolean = false
)
```

## Collations in MongoDB

MongoDB defaults to **binary collation**, using ASCII values for string comparison. For example, in Canadian French, the order differs:

Binary collation:

```none
cote
coté
côte
côté
```

Canadian French collation:

```none
cote
côte
coté
côté
```

## How to Specify Collations

Collations are supported on most CRUD operations. Specify the locale and optional variant as:

```none
"<locale code>@collation=<variant code>"
```

Example:

```none
"de@collation=phonebook"
```

### Collection

Set a default collation when creating a collection:

```kotlin
database.createCollection(
    "names",
    CreateCollectionOptions().collation(
        Collation.builder().locale("en_US").build()
    )
)
```

Check collation:

```kotlin
val collection = database.getCollection<FirstName>("names")
val indexInformation = collection.listIndexes().first()
println(indexInformation.toJson())
```

### Index

Specify a collation when creating an index:

```kotlin
val collection = database.getCollection<FirstName>("names")
val idxOptions = IndexOptions().collation(Collation.builder().locale("en_US").build())
collection.createIndex(Indexes.ascending(FirstName::firstName.name), idxOptions)
```

Check collation:

```kotlin
val indexInformation = collection.listIndexes().first()
println(indexInformation.toJson())
```

Example operation using the same collation:

```kotlin
val resultsFlow = collection.find()
    .collation(Collation.builder().locale("en_US").build())
    .sort(Sorts.ascending(FirstName::firstName.name));
```

### Operation

Override the default collation by passing a new collation:

```kotlin
val findFlow = collection.find()
    .collation(Collation.builder().locale("is").build())
    .sort(Sorts.ascending(FirstName::firstName.name))
```

### Index Types That Do Not Support Collations

The following index types support only binary comparison:

- text
- 2d
- geoHaystack

## Collation Options

Collation options refine ordering and matching behavior:

| Collation Option | Description |
|------------------|-------------|
| Locale           | **Required** ICU locale code. |
| Backwards        | Consider diacritics from the end first. |
| Case-sensitivity | Consider case as different values. |
| Alternate        | Consider spaces and punctuation. |
| Case First       | Consider uppercase or lowercase first. |
| Max Variable     | Ignore whitespace or punctuation. |
| Strength         | ICU level of comparison (default "tertiary"). |
| Normalization    | Perform unicode normalization. |
| Numeric Ordering  | Order numbers by value. |

Use `Collation.Builder` to specify options:

```kotlin
Collation.builder()
    .caseLevel(true)
    .collationAlternate(CollationAlternate.SHIFTED)
    .collationCaseFirst(CollationCaseFirst.UPPER)
    .collationMaxVariable(CollationMaxVariable.SPACE)
    .collationStrength(CollationStrength.SECONDARY)
    .locale("en_US")
    .normalization(false)
    .numericOrdering(true)
    .build()
```

## Collation Examples

### find() and sort() Example

Apply a collation when retrieving sorted results:

```kotlin
val resultsFlow = collection.find()
    .collation(Collation.builder().locale("de@collation=phonebook").build())
    .sort(Sorts.ascending(FirstName::firstName.name))

resultsFlow.collect { println(it) }
```

### findOneAndUpdate() Example

Specify a collation in an update operation:

```kotlin
val result = collection.findOneAndUpdate(
    Filters.lt(FirstName::firstName.name, "Gunter"),
    Updates.set("verified", true),
    FindOneAndUpdateOptions()
        .collation(Collation.builder().locale("de@collation=phonebook").build())
        .sort(Sorts.ascending(FirstName::firstName.name))
        .returnDocument(ReturnDocument.AFTER)
)
println(result)
```

### findOneAndDelete() Example

Specify numerical ordering in a delete operation:

```kotlin
val result = collection.findOneAndDelete(
    Filters.gt(CollationExample::a.name, "100"),
    FindOneAndDeleteOptions()
        .collation(Collation.builder().locale("en").numericOrdering(true).build())
        .sort(Sorts.ascending(CollationExample::a.name))
)
println(result)
```

### Aggregation Example

Specify a collation in an aggregation operation:

```kotlin
val groupStage = Aggregates.group(
    "\$${FirstName::firstName.name}",
    Accumulators.sum("nameCount", 1)
)
val sortStage = Aggregates.sort(Sorts.ascending("_id"))
val resultsFlow = collection.aggregate<Result>(listOf(groupStage, sortStage))
    .collation(
        Collation.builder().locale("de")
            .collationStrength(CollationStrength.PRIMARY)
            .build()
    )
resultsFlow.collect { println(it) }
```

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/logging/
# Logging

## Overview

This guide explains how to set up and configure a logger in the MongoDB Kotlin driver using SLF4J, including log level configuration.

## Set Up a Logger

The MongoDB Kotlin driver uses SLF4J, allowing you to specify your logging framework at deployment. If `slf4j-api` is not found, logging is disabled:

```none
WARNING: SLF4J not found on the classpath. Logging is disabled for the 'org.mongodb.driver' component
```

To set up a logger, include:

- `slf4j-api`
- A logging framework
- A **binding**

Bindings connect `slf4j-api` with logging frameworks. Below are examples for Logback and Log4j2.

### Example - Set Up

**Logback**

**Maven:**
```xml
<dependencies>
  <dependency>
    <groupId>ch.qos.logback</groupId>
    <artifactId>logback-classic</artifactId>
    <version>1.2.11</version>
  </dependency>
</dependencies>
```

**Gradle:**
```kotlin
dependencies {
   implementation("ch.qos.logback:logback-classic:1.2.11")
}
```

**Log4j2**

**Maven:**
```xml
<dependencies>
  <dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-slf4j-impl</artifactId>
    <version>2.17.1</version>
  </dependency>
</dependencies>
```

**Gradle:**
```groovy
dependencies {
  implementation("org.apache.logging.log4j:log4j-slf4j-impl:2.17.1")
}
```

After including the dependency, connect to MongoDB:

```kotlin
val mongoClient = MongoClient.create("<connection string>");
val database = mongoClient.getDatabase(DB_NAME_PLACEHOLDER);
val collection = database.getCollection<Document>(COLLECTION_NAME_PLACEHOLDER);
collection.find().firstOrNull()
```

**Logback Output:**
```console
12:14:55.853 [main] DEBUG org.mongodb.driver.connection - Opened connection ...
```

**Log4j2 Output:**
```console
12:35:00.438 [main] ERROR <my package path> - Logging an Error
```

## Configure Your Logger

Use the logging framework's configuration system to set the logger's **log level**.

### Example - Configure

**Logback Configuration (`logback.xml`):**
```xml
<configuration>
   <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
      <encoder>
         <pattern>%-4relative [%thread] %-5level %logger{30} - %msg%n</pattern>
      </encoder>
   </appender>
   <root level="INFO">
      <appender-ref ref="CONSOLE" />
   </root>
</configuration>
```

**Log4j2 Configuration (`log4j2.xml`):**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Configuration status="INFO">
   <Appenders>
      <Console name="Console" target="SYSTEM_OUT">
            <PatternLayout pattern="%d{HH:mm:ss.SSS} [%t] %-5level %logger{36} - %msg%n"/>
      </Console>
   </Appenders>
   <Loggers>
      <Root level="INFO">
            <AppenderRef ref="Console"/>
      </Root>
   </Loggers>
</Configuration>
```

## Logger Names

Logger names form a hierarchy, allowing organization of logging events. For example:

```kotlin
val loggerParent = LoggerFactory.getLogger("parent")
val loggerChild = LoggerFactory.getLogger("parent.child")
```

The MongoDB Kotlin driver defines logger names for various events:

- `org.mongodb.driver.authenticator`: authentication
- `org.mongodb.driver.client`: MongoClient events
- `org.mongodb.driver.cluster`: server monitoring
- `org.mongodb.driver.connection`: connections
- `org.mongodb.driver.operation`: operations
- `org.mongodb.driver.protocol`: commands
- `org.mongodb.driver.uri`: connection string parsing
- `org.mongodb.driver.management`: JMX

### Example - Names

To change the log level for a specific logger:

**Logback Configuration:**
```xml
<configuration>
   <logger name="org.mongodb.driver.connection" level="INFO" additivity="true"/>
   <root level="OFF">
      <appender-ref ref="CONSOLE" />
   </root>
</configuration>
```

**Log4j2 Configuration:**
```xml
<Configuration status="INFO">
   <Loggers>
      <Logger name="org.mongodb.driver.connection" level="INFO"/>
      <Root level="OFF">
            <AppenderRef ref="Console"/>
      </Root>
   </Loggers>
</Configuration>
```

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/monitoring/
# Monitoring

## Overview

This guide explains how to set up and configure **monitoring** in the MongoDB Kotlin driver, allowing you to understand resource usage and performance for application design and debugging.

You will learn to:

- Monitor various event types in the MongoDB Kotlin driver.
- Monitor connection pool events using JMX and JConsole.

## Monitor Events

To monitor an **event**, register a **listener** on your `MongoClient` instance. A listener responds to specific events, with each method handling a different event type.

The MongoDB Kotlin driver categorizes events into:

- Command Events
- Server Discovery and Monitoring Events
- Connection Pool Events

### Command Events

Command events relate to MongoDB database commands like `find`, `insert`, `delete`, and `count`. Implement the `CommandListener` interface to monitor these events.

#### Example

Create a `CommandCounter` class implementing `CommandListener`:

```kotlin
class CommandCounter : CommandListener {
    private val commands = mutableMapOf<String, Int>()

    @Synchronized
    override fun commandSucceeded(event: CommandSucceededEvent) {
        val commandName = event.commandName
        commands[commandName] = commands.getOrDefault(commandName, 0) + 1
        println(commands)
    }

    override fun commandFailed(event: CommandFailedEvent) {
        println("Failed execution of command '${event.commandName}' with id ${event.requestId}")
    }
}
```

Add `CommandCounter` to `MongoClientSettings`:

```kotlin
val commandCounter = CommandCounter()
val settings = MongoClientSettings.builder()
    .applyConnectionString(URI)
    .addCommandListener(commandCounter)
    .build()
val mongoClient = MongoClient.create(settings)
val collection = mongoClient.getDatabase(DATABASE).getCollection<Document>(COLLECTION)
collection.find().firstOrNull()
```

### Server Discovery and Monitoring Events

SDAM events indicate changes in the MongoDB instance or cluster state. The driver defines nine SDAM events across three listener interfaces:

- `ClusterListener`: topology events
- `ServerListener`: `mongod` or `mongos` events
- `ServerMonitorListener`: heartbeat events

#### Example

Create an `IsWritable` class implementing `ClusterListener`:

```kotlin
class IsWriteable : ClusterListener {
    private var isWritable = false

    @Synchronized
    override fun clusterDescriptionChanged(event: ClusterDescriptionChangedEvent) {
        if (event.newDescription.hasWritableServer() != isWritable) {
            isWritable = event.newDescription.hasWritableServer()
            println(if (isWritable) "Able to write to cluster" else "Unable to write to cluster")
        }
    }
}
```

Add `IsWritable` to `MongoClient`:

```kotlin
val clusterListener = IsWriteable()
val settings = MongoClientSettings.builder()
    .applyConnectionString(URI)
    .applyToClusterSettings { it.addClusterListener(clusterListener) }
    .build()
val mongoClient = MongoClient.create(settings)
val collection = mongoClient.getDatabase(DATABASE).getCollection<Document>(COLLECTION)
collection.find().firstOrNull()
```

### Connection Pool Events

Connection pool events relate to the connections maintained by the driver. Implement the `ConnectionPoolListener` interface to monitor these events.

#### Example

Create a `ConnectionPoolLibrarian` class:

```kotlin
class ConnectionPoolLibrarian : ConnectionPoolListener {
    override fun connectionCheckedOut(event: ConnectionCheckedOutEvent) {
        println("Let me get you the connection with id ${event.connectionId.localValue}...")
    }

    override fun connectionCheckOutFailed(event: ConnectionCheckOutFailedEvent) {
        println("Failed to checkout connection.")
    }
}
```

Add `ConnectionPoolLibrarian` to `MongoClient`:

```kotlin
val cpListener = ConnectionPoolLibrarian()
val settings = MongoClientSettings.builder()
    .applyConnectionString(URI)
    .applyToConnectionPoolSettings { it.addConnectionPoolListener(cpListener) }
    .build()
val mongoClient = MongoClient.create(settings)
val collection = mongoClient.getDatabase(DATABASE).getCollection<Document>(COLLECTION)
collection.find().firstOrNull()
```

## Monitor Connection Pool Events with JMX

Use **Java Management Extensions (JMX)** to monitor connection pool events. To enable JMX monitoring, add a `JMXConnectionPoolListener` to your `MongoClient`.

### JMX Support

The `JMXConnectionPoolListener` creates and registers MXBean instances for each `mongod` or `mongos` process, providing properties like `clusterId`, `host`, `port`, `minSize`, `maxSize`, `size`, and `checkedOutCount`.

### JMX and JConsole Example

Add a `JMXConnectionPoolListener` to a `MongoClient`:

```kotlin
val connectionPoolListener = JMXConnectionPoolListener()
val settings = MongoClientSettings.builder()
    .applyConnectionString(uri)
    .applyToConnectionPoolSettings { it.addConnectionPoolListener(connectionPoolListener) }
    .build()
val mongoClient: MongoClient = MongoClient.create(settings)

try {
    println("Navigate to JConsole to see your connection pools...")
    Thread.sleep(Long.MAX_VALUE)
} catch (e: Exception) {
    e.printStackTrace()
}
```

Open JConsole and inspect connection pools under the `"org.mongodb.driver"` domain.

## Include the Driver in Your Distributed Tracing System

To include event data from the driver in a **distributed tracing system**, use Spring Cloud Sleuth for Zipkin or write a command event listener for other systems. For more on Spring Cloud Sleuth, see its documentation.

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/time-series/
# Time Series Collections

## Overview

This guide covers **time series collections** in MongoDB and their interaction with the MongoDB Kotlin driver. Time series collections efficiently store sequences of measurements over time, including the measurement data, metadata, and timestamp.

| Example          | Measurement                     | Metadata  |
|------------------|---------------------------------|-----------|
| Sales Data       | Revenue                         | Company   |
| Infection Rates   | Amount of People Infected       | Location  |

## Create a Time Series Collection

To create a time series collection, use the createCollection() method with:

- Collection name
- TimeSeriesOptions in CreateCollectionOptions

```kotlin
val database = mongoClient.getDatabase("fall_weather")
val tsOptions = TimeSeriesOptions("temperature")
val collOptions = CreateCollectionOptions().timeSeriesOptions(tsOptions)

database.createCollection("september2021", collOptions)
```

MongoDB versions prior to 5.0 cannot create time series collections. To verify creation, use the `"listCollections"` command:

```kotlin
val commandResult = database.listCollections().toList()
    .find { it["name"] == "september2021" }

println(commandResult?.toJson(JsonWriterSettings.builder().indent(true).build()))
```

```json
{
  "name": "september2021",
  "type": "timeseries",
  "options": {
    "timeseries": {
      "timeField": "temperature",
      "granularity": "seconds",
      "bucketMaxSpanSeconds": 3600
    }
  },
  "info": {
    "readOnly": false
  }
}
```

## Query a Time Series Collection

Querying a time series collection follows the same conventions as data retrieval and aggregation. MongoDB 5.0 introduces window functions in the aggregation pipeline for operations on contiguous time series data. For more details, refer to the Aggregates Builders guide.

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/fundamentals/encrypt-fields/
The Kotlin driver uses the `mongodb-crypt` library for in-use encryption, compatible with `mongodb-crypt` v5.3.0.

### Dependency Setup

**Maven:**
```xml
<dependencies>
    <dependency>
        <groupId>org.mongodb</groupId>
        <artifactId>mongodb-crypt</artifactId>
        <version>5.3.0</version>
    </dependency>
</dependencies>
```

**Gradle:**
```groovy
dependencies {
   implementation("org.mongodb:mongodb-crypt:5.3.0")
}
```

### In-Use Encryption Overview

In-use encryption allows applications to encrypt data before sending it to MongoDB, protecting plaintext data from unauthorized access. To enable this, create encryption keys accessible only to your application. Only authorized applications can access decrypted data, while attackers can only see encrypted ciphertext.

Use in-use encryption for sensitive data like:
- Credit card numbers
- Addresses
- Health information
- Financial information
- Other PII

### Features

- **Queryable Encryption:** Introduced in MongoDB 6.0 (GA in 7.0), supports searching encrypted fields for equality with unique encryption for each value. The preview version in 6.0 is no longer supported.

- **Client-side Field Level Encryption (CSFLE):** Introduced in MongoDB 4.2, allows searching encrypted fields for equality. You can choose deterministic or random encryption. Only deterministic fields support equality queries. Randomly encrypted fields can be decrypted but not queried. Deterministic encryption can lead to vulnerabilities through frequency analysis.

For more details, see the Server manual on Queryable Encryption and CSFLE.

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/api-documentation/
# API Documentation

- **BSON kotlinx.serialization**: Classes for encoding/decoding Kotlin data classes to/from BSON using kotlinx.serialization.

- **Kotlin Driver Extensions**: Classes extending core builders to support data classes.

- **Driver Core**: Classes with essential driver functionality.

- **Kotlin Coroutine Driver**: Classes for the driver API using coroutines.

- **Kotlin Sync Driver**: Classes for the synchronous driver API.

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/faq/
# FAQ

## Why Am I Having Problems Connecting to a MongoDB Instance?
Refer to the Connection Troubleshooting Guide for solutions.

## How is the Kotlin Driver Different from KMongo?
The Kotlin driver is the official MongoDB driver for Kotlin, developed by MongoDB, wrapping the Java driver. KMongo, a community-developed library, is now deprecated as of July 2023. The official driver, created with KMongo's creator, Julien Buret, offers an officially-supported alternative.

Similarities:
- Synchronous and coroutine-based operations
- Data classes for MongoDB documents
- KotlinX serialization
- MongoDB CRUD and aggregation API

Differences:
- No built-in support for reactor, rxjava2, Jackson, or GSON
- No support for MongoDB shell commands

See Migrate from KMongo for details.

## How Does Connection Pooling Work in the Kotlin Driver?
Each `MongoClient` has a connection pool per server, with a default `maxPoolSize` of `100`. If this limit is reached, requests wait for an available connection. Each client opens two additional sockets for monitoring.

For example, a client on a 3-node replica set opens 6 monitoring sockets. If using a read preference for secondary nodes, total connections can reach `306`.

Connection pools are rate-limited, allowing a maximum of `maxConnecting` connections in parallel. Additional threads wait until connections are available or reused.

Set the minimum concurrent connections with `minPoolSize` (default `0`). If sockets drop below this, more are opened. The `maxIdleTimeMS` option (default `0`) sets the maximum idle time for connections.

Default client configuration:
```kotlin
val client = MongoClient("<connection string>")
```
Create one client per process and reuse it. Increase `maxPoolSize` for high concurrency. The application should manage thread limits to avoid excessive queuing during load spikes. Threads wait for `waitQueueTimeoutMS` (default `120000` ms) before raising a connection error.

Calling `MongoClient.close()` closes all idle sockets and those in use upon return to the pool.

For more on connecting to MongoDB, see the Connection Guide.

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/connection-troubleshooting/
# Connection Troubleshooting

This page provides solutions for connection issues with the MongoDB Kotlin Driver.

## Connection Error

A common error message indicating connection failure is:

```none
Error: couldn't connect to server 127.0.0.1:27017
```

### Check Connection String

Ensure the hostname and port in the connection string are correct. The default port is `27017`.

### Configure Firewall

Verify that port `27017` is open in your firewall, or the port configured for your MongoDB instance.

## Authentication Error

An authentication error may appear as:

```none
Command failed with error 18 (AuthenticationFailed): 'Authentication failed.' on server localhost:27017.
```

### Check Connection String

An invalid connection string often causes authentication issues. Ensure the username and password are correctly formatted and percent-encoded if they include special characters:

```none
: / ? # [ ] @
```

For MongoDB Atlas, use the Atlas Connection Example to verify your connection string.

When connecting to a replica set, include all hosts in the connection string, separated by commas.

### Verify User Is in Authentication Database

The username must be defined in the authentication database, typically `admin`. Specify a different database using `authSource` in the connection string:

```kotlin
val mongoClient =
MongoClient.create("mongodb://<db_username>:<db_password>@<hostname>:<port>/?authSource=users")
```

## Error Sending Message

A common error when sending requests is:

```none
com.mongodb.MongoSocketWriteException: Exception sending message
```

### Check Connection String

Ensure the connection string is accurate.

### Verify User Is in Authentication Database

The user must be recognized in the authentication database.

### Configure Firewall

Ensure the firewall has an open port for MongoDB communication.

### Check the Number of Connections

Each `MongoClient` instance has a `maxPoolSize` (default `100`). If this limit is reached, the server waits for a connection to become available. If the wait exceeds `maxIdleTimeMS`, an error occurs.

## Timeout Error

Timeout errors may appear as:

```none
Timed out after 30000 ms while waiting for a server that matches ReadPreferenceServerSelector{readPreference=primary}.
```

### Set `maxConnectionTimeoutMS`

Increase the `maxConnectionTimeoutMS` (default `10000`) or set it to `0` for no timeout.

### Set `maxConnectionLifeTime` and `maxConnectionIdleTime`

Configure `maxConnectionLifeTime` and `maxConnectionIdleTime` for connection maintenance.

### Check the Number of Connections

Too many open connections can cause issues, as described under Error Sending Message.

## Additional Tips

For TLS/SSL issues, use the `-Djavax.net.debug=all` system property for detailed logs. Refer to the Oracle guide for debugging TLS/SSL connections.

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/issues-and-help/
# Issues & Help

For support, visit the MongoDB Community Forums. 

## Bugs / Feature Requests

Provide feedback on the Kotlin driver via the MongoDB Feedback Engine under Drivers. To report bugs or suggest improvements, create a Jira issue:

1. Sign up and log in to the MongoDB Jira issue tracker.
2. Navigate to the JAVA project.
3. Click Create and provide detailed information.

Bug reports are publicly viewable. Report security vulnerabilities as per the Create a Vulnerability Report page.

## Pull Requests

Contributions are welcome. Ensure pull requests include documentation, tests, and pass **gradle** checks. To contribute, clone the repository and create a branch:

```bash
git clone https://github.com/mongodb/mongo-java-driver.git
cd mongo-java-driver
git checkout -b myNewFeature
```

Run the following to check code:

```bash
./gradlew check
```

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/compatibility/
# Compatibility

## MongoDB Compatibility

The compatibility table specifies recommended MongoDB Kotlin Driver versions for specific MongoDB versions. MongoDB ensures compatibility for three years post server version EOL. 

### Compatibility Table Legend

<table>
<tr>
<th>Icon</th>
<th>Explanation</th>
</tr>
<tr>
<td>✓</td>
<td>All features supported.</td>
</tr>
<tr>
<td>⊛</td>
<td>Driver works, but not all new features supported.</td>
</tr>
<tr>
<td>No mark</td>
<td>Driver not tested with MongoDB version.</td>
</tr>
</table>

<table>
<tr>
<th>Kotlin Driver Version</th>
<th>MongoDB 8.0</th>
<th>MongoDB 7.0</th>
<th>MongoDB 6.0</th>
<th>MongoDB 5.0</th>
<th>MongoDB 4.4</th>
<th>MongoDB 4.2</th>
<th>MongoDB 4.0</th>
<th>MongoDB 3.6</th>
</tr>
<tr>
<td>5.2 to 5.3</td>
<td>✓</td>
<td>✓</td>
<td>✓</td>
<td>✓</td>
<td>✓</td>
<td>✓</td>
<td>✓</td>
<td></td>
</tr>
<tr>
<td>4.10 to 5.1</td>
<td>⊛</td>
<td>✓</td>
<td>✓</td>
<td>✓</td>
<td>✓</td>
<td>✓</td>
<td>✓</td>
<td>✓</td>
</tr>
</table>

## Language Compatibility

The following table specifies recommended MongoDB Kotlin Driver versions for specific Kotlin versions.

<table>
<tr>
<th>Kotlin Driver Version</th>
<th>Kotlin 1.8</th>
</tr>
<tr>
<td>4.10 to 5.3</td>
<td>✓</td>
</tr>
</table>

For more on reading compatibility tables, see our guide on MongoDB Compatibility Tables.

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/migrate-kmongo/
# Migrate from KMongo

## Overview

This page compares the official MongoDB Kotlin Driver and the deprecated KMongo driver, helping you identify necessary changes for migration. KMongo, a community-developed library, is now deprecated as of July 2023. The MongoDB Kotlin Driver is officially supported and maintained by the MongoDB team, focusing on asynchronous coroutine-based operations.

## Connect to MongoDB Cluster

Both drivers connect to MongoDB clusters from Kotlin applications.

<Tabs>

<Tab name="">

Using the MongoDB Kotlin Driver:

```kotlin
import com.mongodb.kotlin.client.coroutine.MongoClient

data class Jedi(val name: String, val age: Int)
val uri = CONNECTION_STRING_URI_PLACEHOLDER
val mongoClient = MongoClient.create(uri)
val database = mongoClient.getDatabase("test")
val collection = database.getCollection<Jedi>("jedi")
```

</Tab>

<Tab name="">

Using KMongo with coroutines:

```kotlin
import org.litote.kmongo.reactivestreams.*
import org.litote.kmongo.coroutine.*

data class Jedi(val name: String, val age: Int)
val client = KMongo.createClient().coroutine
val database = client.getDatabase("test")
val col = database.getCollection<Jedi>()
```

KMongo infers the collection name from the data class.

</Tab>

</Tabs>

## CRUD and Aggregation

Both drivers support all MongoDB CRUD APIs and aggregation operations.

<Tabs>

<Tab name="">

MongoDB Kotlin Driver CRUD operations:

```kotlin
val jedi = Jedi("Luke Skywalker", 19)
collection.insertOne(jedi)
val luke = collection.find(Jedi::name.name, "Luke Skywalker")
val jedis = collection.find(lt(Jedi::age.name, 30)).toList()
val filter = Filters.eq(Jedi::name.name, "Luke Skywalker")
collection.updateOne(filter, Updates.set(Jedi::age.name, 20))
collection.deleteOne(filter)
```

Aggregation example:

```kotlin
data class Results(val avgAge: Double)
val resultsFlow = collection.aggregate<Results>(
    listOf(
      Aggregates.match(Filters.ne(Jedi::name.name, "Luke Skywalker")),
      Aggregates.group("\$${Jedi::name.name}", Accumulators.avg("avgAge", "\$${Jedi::age.name}"))
    )
)
resultsFlow.collect { println(it) }
```

</Tab>

<Tab name="">

KMongo CRUD operations:

```kotlin
val jedi = Jedi("Luke Skywalker", 19)
col.insertOne(jedi)
val luke = col.findOne(Jedi::name eq "Luke Skywalker")
val jedis = col.find(Jedi::age lt 30).toList()
col.updateOne(Jedi::name eq "Luke Skywalker", setValue(Jedi::age, 20))
col.deleteOne(Jedi::name eq "Luke Skywalker")
```

Aggregation example:

```kotlin
val avgAge = collection.aggregate<Double>(
    pipeline(
        match(Jedi::name ne "Luke Skywalker"),
        group(Jedi::name, avg(Jedi::age))
    )
).toList()
```

</Tab>

</Tabs>

## Construct Queries

Both drivers support type-safe queries using property references.

<Tabs>

<Tab name="">

MongoDB Kotlin Driver query construction:

```kotlin
data class Person(val name: String, val email: String, val gender: String, val age: Int)
data class Results(val email: String)
val collection = database.getCollection<Person>("people")
val filter = and(eq("gender", "female"), gt("age", 29))
val projection = fields(excludeId(), include("email"))
val results = collection.find<Results>(filter).projection(projection)
```

Mapping KMongo string query:

```kotlin
val query = JsonObject("{\"name\": \"Gabriel Garc\\u00eda M\\u00e1rquez\"}")
val jsonResult = collection.find(query).firstOrNull()
```

</Tab>

<Tab name="">

Using Builders API in the Kotlin driver:

```kotlin
import com.mongodb.kotlin.client.model.Filters.eq
import com.mongodb.kotlin.client.model.Filters.and
import com.mongodb.kotlin.client.model.Filters.gt
import com.mongodb.kotlin.client.model.Projections.excludeId
import com.mongodb.kotlin.client.model.Projections.fields
import com.mongodb.kotlin.client.model.Projections.include

data class Person(val name: String, val gender: String, val age: Int)
data class Result(val name: String)
val collection = database.getCollection<Person>("people")
val filter = (Person::gender eq "female") and (Person::age gt 29)
val projection = fields(excludeId(), include(Person::name))
val results = collection.find<Result>(filter).projection(projection)
```

</Tab>

<Tab name="">

KMongo query construction:

```kotlin
data class Jedi(val name: String)
val yoda = col.findOne(Jedi::name eq "Yoda")
```

KMongo string queries:

```kotlin
val yoda = col.findOne("{name: {$regex: 'Yo.*'}}")!!
```

</Tab>

</Tabs>

## Data Typing

Both drivers support Kotlin data classes and the `Document` class for modeling data.

<Tabs>

<Tab name="">

MongoDB Kotlin Driver:

```kotlin
data class Movie(val title: String, val year: Int, val rating: Float)
val dataClassCollection = database.getCollection<Movie>("movies")
val movieDataClass = dataClassCollection.findOneOrNull()
val movieNameDataClass = movieDataClass.title
```

</Tab>

<Tab name="">

KMongo:

```kotlin
data class Movie(val title: String, val year: Int, val rating: Float)
val collection = database.getCollection<Movie>("movies")
val movieDataClass = dataClassCollection.findOne()
val movieNameDataClass = movieDataClass.title
```

</Tab>

</Tabs>

## Data Serialization

Both drivers support serialization and deserialization of data objects to and from BSON.

<Tabs>

<Tab name="">

MongoDB Kotlin Driver serialization:

```kotlin
@Serializable
data class LightSaber(
    @SerialName("_id") @Contextual val id: ObjectId?,
    val color: String,
    val qty: Int,
    @SerialName("brand") val manufacturer: String = "Acme"
)
```

Document serialization:

```kotlin
val document = Document("_id", 1).append("color", "blue")
document.toJson()
```

</Tab>

<Tab name="">

KMongo serialization:

```kotlin
@Serializable
data class Data(@Contextual val _id: Id<Data> = newId())
val json = Json { serializersModule = IdKotlinXSerializationModule }
val data = Data()
val json = json.encodeToString(data)
```

</Tab>

</Tabs>

## Synchronous and Asynchronous Support

Both drivers support synchronous and asynchronous operations.

<Tabs>

<Tab name="">

MongoDB Kotlin Driver:

```kotlin
import com.mongodb.kotlin.client.MongoClient
data class Jedi(val name: String, val age: Int)
val uri = "<your-connection-string>"
val mongoClient = MongoClient.create(uri)
val database = mongoClient.getDatabase("test")
val collection = database.getCollection<Jedi>("jedi")
collection.insertOne(Jedi("Luke Skywalker", 19))
```

Asynchronous coroutine code:

```kotlin
runBlocking {
  collection.insertOne(Jedi("Luke Skywalker", 19))
}
```

</Tab>

<Tab name="">

KMongo:

```kotlin
import org.litote.kmongo.*
data class Jedi(val name: String, val age: Int)
val client = KMongo.createClient()
val database = client.getDatabase("test")
val col = database.getCollection<Jedi>()
col.insertOne(Jedi("Luke Skywalker", 19))
```

Asynchronous coroutine code:

```kotlin
runBlocking {
  col.insertOne(Jedi("Luke Skywalker", 19))
}
```

</Tab>

</Tabs>

## What Next?

Refer to the Quick Start to begin using the MongoDB Kotlin driver.

Page Url: https://mongodb.com/docs/drivers/kotlin/coroutine/current/validate-signatures/
# Validate Driver Artifact Signatures

## Overview

Validate the signature of a Kotlin driver artifact published on Maven to confirm its authenticity.

## Procedure

### Install Encryption Software

Install GnuPG using Homebrew or GPG Suite for a GUI option.

### Download and Import the Public Key

Visit the Releases page in the MongoDB JVM drivers GitHub repository for instructions on downloading and importing the public key.

### Download the Signed File

Use `curl` to download the signed file for a specific driver version. For example, for v5.1.0:

```sh
curl -LO https://repo.maven.apache.org/maven2/org/mongodb/mongodb-driver-core/5.1.0/mongodb-driver-core-5.1.0.jar
```

### Download the File Signature

Download the file signature using `curl`. For v5.1.0:

```sh
curl -LO https://repo.maven.apache.org/maven2/org/mongodb/mongodb-driver-core/5.1.0/mongodb-driver-core-5.1.0.jar.asc
```

### Verify the Signature

Verify the signature with `gpg`:

```sh
gpg --verify mongodb-driver-core-5.1.0.jar.asc mongodb-driver-core-5.1.0.jar
```

A successful verification will show:

```none
gpg: Signature made Tue 30 Apr 12:05:34 2024 MDT
gpg: Good signature from "MongoDB Java Driver Release Signing Key <packaging@mongodb.com>" [unknown]
```

## Additional Information

For more on verifying signatures, see Verify Integrity of MongoDB Packages in the Server manual.

