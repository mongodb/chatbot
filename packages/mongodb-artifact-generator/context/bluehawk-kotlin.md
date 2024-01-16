## How to Use Bluehawk

Bluehawk is a tool that lets you extract code snippets from files by annotating
your source code with Bluehawk tag comments. There are several Bluehawk tags but
the most relevant is `:snippet-{start|end}:` which specifies which code to
extract as snippets.

For example, consider the following Kotlin test file:

```InsertTest.kt
import com.mongodb.MongoBulkWriteException
import com.mongodb.kotlin.client.coroutine.MongoClient
import config.getConfig
import kotlinx.coroutines.runBlocking
import org.bson.codecs.pojo.annotations.BsonId
import org.bson.types.ObjectId
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
internal class InsertTest {
    // :snippet-start: data-model
    data class PaintOrder(
        @BsonId val id: ObjectId? = null,
        val qty: Int,
        val color: String
    )
    // :snippet-end:

    companion object {
        val config = getConfig()
        val client = MongoClient.create(config.connectionUri)
        val database = client.getDatabase("paint_store")
        val collection = database.getCollection<PaintOrder>("paint_order")

        @AfterAll
        @JvmStatic
        fun afterAll() {
            runBlocking {
                client.close()
            }
        }
    }

    @Test
    fun insertOneTest() = runBlocking {
        // :snippet-start: insert-one
        val paintOrder = PaintOrder(ObjectId(), 5, "red")
        val result = collection.insertOne(paintOrder)
        // :remove-start:
        println("This line isn't included in the generated insert-one snippet")
        println("Neither is this one!")
        // :remove-end:

        val insertedId = result.insertedId?.asObjectId()?.value

        println("Inserted a document with the following id: $insertedId")
        // :snippet-end:
        // Junit test for the above code
        assertTrue(result.wasAcknowledged())
    }

    @Test
    fun insertManyTest() = runBlocking {
        // :snippet-start: insert-many
        val paintOrders = listOf(
            PaintOrder(ObjectId(), 5, "red"),
            PaintOrder(ObjectId(), 10, "purple")
        )
        val result = collection.insertMany(paintOrders)

        println("Inserted a document with the following ids: ${result.insertedIds.toList()}")
        // :snippet-end:
        // Junit test for the above code
        assertTrue(result.wasAcknowledged())
    }
}
```

When you run the Bluehawk snippet generator on this file, it creates 3 code
snippet files that each use the snippet name defined in their bluehawk
:snippet-start: tag.

```InsertTest.snippet.data-model.kt
data class PaintOrder(
    @BsonId val id: ObjectId? = null,
    val qty: Int,
    val color: String
)
```

```InsertTest.snippet.insert-one.kt
val paintOrder = PaintOrder(ObjectId(), 5, "red")
val result = collection.insertOne(paintOrder)

val insertedId = result.insertedId?.asObjectId()?.value

println("Inserted a document with the following id: $insertedId")
```

```InsertTest.snippet.insert-many.kt
val paintOrders = listOf(
    PaintOrder(ObjectId(), 5, "red"),
    PaintOrder(ObjectId(), 10, "purple")
)
val result = collection.insertMany(paintOrders)

println("Inserted a document with the following ids: ${result.insertedIds.toList()}")
```
