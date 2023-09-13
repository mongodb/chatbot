[![MongoDB](/mongo-java-driver/4.10/img/logo-mongodb-header.png)](/mongo-java-driver/4.10/../)

## Aggregation Framework

The [aggregation pipeline](https://www.mongodb.org/docs/manual/core/aggregation-pipeline
) is a framework for data aggregation, modeled on the concept of data processing pipelines.

## Prerequisites

-   The example below requires a `restaurants` collection in the `test` database. To create and populate the collection, follow the directions in [github](https://github.com/mongodb/docs-assets/tree/drivers).
    
-   Include the following import statements:
    
    ```java
     import com.mongodb.reactivestreams.client.MongoClients;
     import com.mongodb.reactivestreams.client.MongoClient;
     import com.mongodb.reactivestreams.client.MongoCollection;
     import com.mongodb.reactivestreams.client.MongoDatabase;
     import com.mongodb.client.model.Aggregates;
     import com.mongodb.client.model.Accumulators;
     import com.mongodb.client.model.Projections;
     import com.mongodb.client.model.Filters;
         
     import org.bson.Document;
    ```
    

##### important

This guide uses the `Subscriber` implementations as covered in the [Quick Start Primer](/mongo-java-driver/4.10/driver-reactive/getting-started/quick-start-primer/).

## Connect to a MongoDB Deployment

Connect to a MongoDB deployment and declare and define a `MongoDatabase` and a `MongoCollection` instances.

For example, include the following code to connect to a standalone MongoDB deployment running on localhost on port `27017` and define `database` to refer to the `test` database and `collection` to refer to the `restaurants` collection.

```java
MongoClient mongoClient = MongoClients.create();
MongoDatabase database = mongoClient.getDatabase("test");
MongoCollection<Document> collection = database.getCollection("restaurants");
```

For additional information on connecting to MongoDB, see [Connect to MongoDB](/mongo-java-driver/4.10/driver/tutorials/connect-to-mongodb/).

## Perform Aggregation

To perform aggregation, pass a list of [aggregation stages](https://www.mongodb.org/docs/manual/meta/aggregation-quick-reference
) to the [`MongoCollection.aggregate()`](/mongo-java-driver/4.10/apidocs/mongodb-driver-sync/com/mongodb/client/MongoCollection.html#aggregate(java.util.List)
) method. The Java driver provides the [`Aggregates`](/mongo-java-driver/4.10/apidocs/mongodb-driver-core/com/mongodb/client/model/Aggregates.html
) helper class that contains builders for aggregation stages.

In the following example, the aggregation pipeline

-   First uses a [`$match`](https://www.mongodb.org/docs/manual/reference/operator/aggregation/match/
    ) stage to filter for documents whose `categories` array field contains the element `Bakery`. The example uses [`Aggregates.match`](/mongo-java-driver/4.10/builders/aggregation/#match) to build the `$match` stage.
    
-   Then, uses a [`$group`](https://www.mongodb.org/docs/manual/reference/operator/aggregation/group/
    ) stage to group the matching documents by the `stars` field, accumulating a count of documents for each distinct value of `stars`. The example uses [`Aggregates.group`](/mongo-java-driver/4.10/builders/aggregation/#group) to build the `$group` stage and [`Accumulators.sum`](/mongo-java-driver/4.10/apidocs/mongodb-driver-core/com/mongodb/client/model/Accumulators#sum(java.lang.String,TExpression).html
    ) to build the [accumulator expression](https://www.mongodb.org/docs/manual/reference/operator/aggregation/group/#accumulator-operator
    ). For the [accumulator expressions](https://www.mongodb.org/docs/manual/reference/operator/aggregation-group/
    ) for use within the [`$group`](https://www.mongodb.org/docs/manual/reference/operator/aggregation/group/
    ) stage, the Java driver provides [`Accumulators`](/mongo-java-driver/4.10/apidocs/mongodb-driver-core/com/mongodb/client/model/Accumulators.html
    ) helper class.
    

```java
collection.aggregate(
      Arrays.asList(
              Aggregates.match(Filters.eq("categories", "Bakery")),
              Aggregates.group("$stars", Accumulators.sum("count", 1))
      )
).subscribe(new PrintDocumentSubscriber());
```

### Use Aggregation Expressions

For [$group accumulator expressions](https://www.mongodb.org/docs/manual/reference/operator/aggregation-group/
), the Java driver provides [`Accumulators`](/mongo-java-driver/4.10/apidocs/mongodb-driver-core/com/mongodb/client/model/Accumulators.html
) helper class. For other [aggregation expressions](https://www.mongodb.org/docs/manual/meta/aggregation-quick-reference/#aggregation-expressions
), manually build the expression `Document`.

In the following example, the aggregation pipeline uses a [`$project`](https://www.mongodb.org/docs/manual/reference/operator/aggregation/project/
) stage to return only the `name` field and the calculated field `firstCategory` whose value is the first element in the `categories` array. The example uses [`Aggregates.project`](/mongo-java-driver/4.10/builders/aggregation/#project) and various [`Projections`](/mongo-java-driver/4.10/apidocs/mongodb-driver-core/com/mongodb/client/model/Projections.html
) methods to build the `$project` stage.

```java
collection.aggregate(
      Arrays.asList(
          Aggregates.project(
              Projections.fields(
                    Projections.excludeId(),
                    Projections.include("name"),
                    Projections.computed(
                            "firstCategory",
                            new Document("$arrayElemAt", Arrays.asList("$categories", 0))
                    )
              )
          )
      )
).subscribe(new PrintDocumentSubscriber());
```

### Explain an Aggregation

To [explain](https://www.mongodb.org/docs/manual/reference/command/explain/
) an aggregation pipeline, call the [`AggregatePublisher.explain()`](/mongo-java-driver/4.10/apidocs/mongodb-driver-reactivestreams/com/mongodb/reactivestreams/client/AggregatePublisher.html#explain()
) method:

```java
collection.aggregate(
      Arrays.asList(
              Aggregates.match(Filters.eq("categories", "Bakery")),
              Aggregates.group("$stars", Accumulators.sum("count", 1))))
      .explain()
      .subscribe(new PrintDocumentSubscriber());
```

The driver supports explain of aggregation pipelines starting with MongoDB 3.6.

[Write Operations](/mongo-java-driver/4.10/driver-reactive/tutorials/perform-write-operations/)

[Change Streams](/mongo-java-driver/4.10/driver-reactive/tutorials/change-streams/)