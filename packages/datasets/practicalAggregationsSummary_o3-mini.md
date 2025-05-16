You are an expert on MongoDB Aggregations. Base your answers on the following content:

---
page_url: https://www.practical-mongodb-aggregations.com/guides/guides
---
# Guiding Tips & Principles

Chapters offer concise, practical rules to boost efficiency, productivity, and performance in aggregation pipeline development.

---
page_url: https://www.practical-mongodb-aggregations.com/guides/composibility
---
# Embrace Composability For Increased Productivity

An aggregation pipeline is a series of stateless stages where each stage’s output becomes the next’s input. This allows you to break a complex task into testable, isolated stages and prototyping can be done by running stages separately or disabling them via comments or GUI features.

Key composability principles:
- Easy disabling of pipeline stages for prototyping/debugging.
- Trailing commas avoid syntax errors when adding new fields/stages.
- Each stage should be visually distinct.

Guidelines for JavaScript pipelines:
1. Place each stage on a separate line.
2. Include trailing commas for all fields and stages.
3. Separate stages with blank lines.
4. Precede complex stages with a comment (`//`).
5. Use block comments (`/* */`) to disable stages.

Example of poor layout:
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

Improved layout:
```javascript
// GOOD
var pipeline = [
  {"$unset": [
    "_id",
    "address",
  ]},    
    
  // Only match people born on or after 1970
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

Alternatively, you can define each stage as a separate variable:
```javascript
// GOOD
var unsetStage = {
  "$unset": [
    "_id",
    "address",
  ],
};

var matchStage = {
  "$match": {
    "dateofbirth": {"$gte": ISODate("1970-01-01T00:00:00Z")},
  },
};

var sortStage = {
  "$sort": {
    "dateofbirth": -1,
  },
}; 

var limitStage = {"$limit": 2};

var pipeline = [
  unsetStage,
  matchStage,
  sortStage,
  limitStage,
];
```

Developers may further decompose stage elements or use functions to generate boilerplate code if it suits their workflow. Choose the approach that maximizes clarity and productivity.

---
page_url: https://www.practical-mongodb-aggregations.com/guides/project
---
# Better Alternatives To A Project Stage

MongoDB’s Aggregation Framework traditionally used `$project` to include/exclude fields, but it only allows one or the other (with the one-off exception for `_id`). It’s verbose and inflexible since modifying or adding one field requires explicitly listing all other fields. 

Since version 4.2, `$set` (alias `$addFields`) and `$unset` provide clearer intent, less verbosity, and better adaptability to evolving data models.

## When To Use `$set` & `$unset`

Use them when retaining most fields and modifying or adding a few. For example, converting a string field to a date and adding a literal field:

```javascript
// GOOD
[
  {"$set": {
    "card_expiry": {"$dateFromString": {"dateString": "$card_expiry"}},
    "card_type": "CREDIT"
  }},
  {"$unset": [
    "_id"
  ]}
]
```

Using `$project` here forces naming all other fields:

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

## When To Use `$project`

Use `$project` when the output document’s structure is significantly different and only a few fields are needed. For example, reshaping the document:

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

## Main Takeaway

Prefer `$set`/`$unset` for minor field changes to leverage new fields automatically, and use `$project` only for a drastically different output shape.

---
page_url: https://www.practical-mongodb-aggregations.com/guides/explain
---
# Using Explain Plans

MongoDB explain plans reveal query performance and index usage, essential for optimizing aggregation pipelines with complex logic. The aggregation engine applies runtime optimizations (e.g. reordering stages, merging $sort and $limit) without changing results. You can view an explain plan by prepending .explain() to your aggregate command.

Example for a simple pipeline:

```javascript
db.coll.explain().aggregate({ "$match": { "name": "Jo" } });
```

Define and reuse a pipeline:

```javascript
db.coll.aggregate(pipeline);
db.coll.explain().aggregate(pipeline);
```

Three verbosity modes are available:

```javascript
db.coll.explain("queryPlanner").aggregate(pipeline);
db.coll.explain("executionStats").aggregate(pipeline);
db.coll.explain("allPlansExecution").aggregate(pipeline);
```

For most cases, "executionStats" provides key runtime metrics (e.g. keys and docs examined) since it executes the pipeline.

Example pipeline for showing a customer's top 3 orders:

```javascript
var pipeline = [
  { "$unwind": { "path": "$orders" } },
  { "$match": { "customer_id": "tonijones@myemail.com" } },
  { "$sort": { "orders.value": -1 } },
  { "$limit": 3 },
  { "$set": { "order_value": "$orders.value" } },
  { "$unset": [ "_id", "orders" ] }
];
```

An explain output might reveal:

```javascript
stages: [
  { "$cursor": { 
      queryPlanner: { 
        parsedQuery: { customer_id: { "$eq": "tonijones@myemail.com" } },
        winningPlan: { stage: "FETCH", inputStage: { stage: "IXSCAN", indexName: "customer_id_1" } }
      }
    }
  },
  { "$unwind": { path: "$orders" } },
  { "$sort": { sortKey: { "orders.value": -1 }, limit: 3 } },
  { "$set": { order_value: "$orders.value" } },
  { "$project": { _id: false, orders: false } }
]
```

Key insights include: the internal $cursor stage leverages the query engine and index, the $match is moved early, and $sort and $limit are collapsed to reduce memory use. If the index fully covers the query, you may see totalDocsExamined as 0.

---
page_url: https://www.practical-mongodb-aggregations.com/guides/performance
---
# Pipeline Performance Considerations

Prematurely optimizing an aggregation pipeline can overcomplicate solutions. Use explain plans once your pipeline is functionally correct and refer to these guiding principles to avoid performance pitfalls.

## 1. Streaming vs Blocking Stages

Most stages stream batches of records, but certain stages (blocking stages) wait for all input. Blocking stages include:

- `$sort`
- `$group` (plus `$bucket`, `$bucketAuto`, `$count`, `$sortByCount`, `$facet`)

Examples:
- A `$sort` on each batch only sorts within batches, not globally.
- A `$group` on partial batches duplicates group keys.

Blocking stages increase memory use and latency.

### `$sort` Memory & Mitigation
- By default, `$sort` requires all input data in memory, limited to 100 MB.  
- Use `allowDiskUse:true` to spill to disk (at a performance cost).  
- Mitigations:
  1. **Index Sort**: Place `$sort` near the beginning with an index.
  2. **Limit With Sort**: Add `$limit` after `$sort` to collapse the stages.
  3. **Reduce Records**: Move `$sort` later after filtering unnecessary records.

### `$group` Memory & Mitigation
- `$group` also faces the 100 MB limit.  
- Use `allowDiskUse:true` if needed, but prefer to:
  1. **Avoid Unnecessary Grouping**
  2. **Group Summary Data Only** (totals, counts, etc.)

## 2. Avoid Unwinding & Regrouping for Array Processing

Instead of using an `$unwind/$group` combination—which introduces a blocking stage—to transform array fields, use Array Operators like `$filter`. 

For example, to filter out inexpensive products:
  
_Suboptimal Approach:_

```javascript
var pipeline = [
  { "$unwind": { "path": "$products" } },
  { "$match": { "products.price": { "$gt": NumberDecimal("15.00") } } },
  { "$group": { "_id": "$_id", "products": { "$push": "$products" } } }
];
```

_Optimal Approach:_

```javascript
var pipeline = [
  { "$set": { 
      "products": { 
        "$filter": { 
          "input": "$products", 
          "as": "product", 
          "cond": { "$gt": ["$$product.price", NumberDecimal("15.00")] } 
        } 
      } 
    } 
  }
];
```

If empty arrays are an issue, add a `$match` stage to remove them.

## 3. Encourage Early Match Filters

Move `$match` filters to the beginning to leverage indexes. If a `$match` relies on computed fields, consider refactoring.

For instance, consider orders with a computed dollar value:

_Suboptimal:_

```javascript
var pipeline = [
  { "$set": { "value_dollars": { "$multiply": [0.01, "$value"] } } },
  { "$unset": ["_id", "value"] },
  { "$match": { "value_dollars": { "$gte": 100 } } }
];
```

_Optimal:_

```javascript
var pipeline = [
  { "$set": { "value_dollars": { "$multiply": [0.01, "$value"] } } },
  { "$match": { "value": { "$gte": 10000 } } },
  { "$unset": ["_id", "value"] }
];
```

In cases where the computed field cannot be avoided, consider adding an additional `$match` using the original field to filter more records initially.

These practices—optimizing the order and method of stages—help reduce execution time and memory consumption, ensuring efficient aggregations on large datasets.

---
page_url: https://www.practical-mongodb-aggregations.com/guides/expressions
---
# Expressions Explained

Aggregation expressions empower pipelines through data manipulation and come in three types:

- **Operators:** Objects with a `$` prefix (e.g. `{$arrayElemAt: ...}`, `{$cond: ...}`, `{$dateToString: ...}`). They return a fixed set of types.
- **Field Paths:** Strings with a `$` prefix (e.g. `"$account.sortcode"`, `"$addresses.address.city"`). Their return type depends on each record.
- **Variables:** Strings with a `$$` prefix:
  - *Context System Variables* (e.g. `"$$NOW"`, `"$$CLUSTER_TIME"`)
  - *Marker Flag Variables* (e.g. `"$$ROOT"`, `"$$REMOVE"`)
  - *Bind User Variables* (e.g. `"$$product_name_var"`)

These can combine for complex transformations. For example, masking sensitive fields:

```javascript
"customer_info": {"$cond": {
    "if": {"$eq": "$customer_info.category", "SENSITIVE"},
    "then": "$$REMOVE",
    "else": "$customer_info"
}}
```

Expressions produce JSON/BSON types (Number, String, Boolean, DateTime, Array, Object). Operator expressions return fixed types (e.g. `{$concat: ...}` returns a String or null) while Field Paths can vary and change by record.

Operators are composable. For example, to compute day of the week:
  
```javascript
{"$dayOfWeek": ISODate("2021-04-24T00:00:00Z")}
{"$dayOfWeek": "$person_details.date_of_birth"}
{"$dayOfWeek": "$$NOW"}
{"$dayOfWeek": {"$dateFromParts": {"year": 2021, "month": 4, "day": 24}}}
```

Not all pipeline stages accept expressions. Stages like `$match`, `$limit`, `$skip`, `$sort`, `$count`, `$lookup`, and `$out` use fixed query syntax (MQL) for optimizations. Exceptions exist with `$match` using the `$expr` operator to embed expressions.

For example, filtering rectangles with area > 12:

```javascript
var pipeline = [
  {"$match": {
    "$expr": {"$gt": [{"$multiply": ["$width", "$height"]}, 12]}
  }}
];
```

This pipeline returns rectangles where the area exceeds 12. Note that using `$expr` may restrict index usage (e.g. range comparisons work optimally only in MongoDB 5.0+), and type ordering differences (type bracketing) can affect results. Use `$expr` only if regular MQL cannot express the filter.

---
page_url: https://www.practical-mongodb-aggregations.com/guides/advanced-arrays
---
# Advanced Use Of Expressions For Array Processing

MongoDB embeds arrays in documents to model real‑world objects. Its Aggregation Framework offers powerful array expressions to process arrays in‑place using a functional paradigm, avoiding costly unwinding/regrouping. This chapter covers using operators like $map and $reduce to transform, summarize, and filter arrays, often comparing aggregation pipelines with equivalent procedural and functional JavaScript code.

## Conditional Comparisons

A conditional discount calculation in JavaScript:

```javascript
let order = { product: "WizzyWidget", price: 25.99, qty: 8 };
if (order.qty > 5) { order.cost = order.price * order.qty * 0.9; }
else { order.cost = order.price * order.qty; }
```

Equivalent aggregation pipeline:

```javascript
db.customer_orders.insertOne(order);
var pipeline = [
  { "$set": { "cost": {
      "$cond": {
        "if": { "$gte": ["$qty", 5] },
        "then": { "$multiply": ["$price", "$qty", 0.9] },
        "else": { "$multiply": ["$price", "$qty"] }
      }
    }
  } }
];
db.customer_orders.aggregate(pipeline);
```

Functional JS style:

```javascript
order.cost = (order.qty > 5) 
  ? (order.price * order.qty * 0.9) 
  : (order.price * order.qty);
```

## The "Power" Array Operators

- **$map:** Iterates through an array, transforming each element (access via $$this).
- **$reduce:** Iterates to accumulate a single value using $$value and $$this.

## Transforming Arrays

To uppercase product names:

```javascript
let order = { orderId: "AB12345", products: ["Laptop", "Kettle", "Phone", "Microwave"] };
db.orders.insertOne(order);
var pipeline = [
  { "$set": {
      "products": {
        "$map": {
          "input": "$products",
          "as": "product",
          "in": { "$toUpper": "$$product" }
        }
      }
    }
  }
];
db.orders.aggregate(pipeline);
```

To concatenate product names with delimiters using $reduce:

```javascript
var pipeline = [
  { "$set": {
      "productList": {
        "$reduce": {
          "input": "$products",
          "initialValue": "",
          "in": { "$concat": ["$$value", "$$this", "; "] }
        }
      }
    }
  }
];
db.orders.aggregate(pipeline);
```

## Locating Array Elements

Finding the index of the first room with area > 60m² using $reduce and $range:

```javascript
var pipeline = [
  { "$set": {
      "firstLargeEnoughRoomArrayIndex": {
        "$reduce": {
          "input": { "$range": [0, { "$size": "$room_sizes" }] },
          "initialValue": -1,
          "in": {
            "$cond": {
              "if": { "$and": [
                { "$lt": ["$$value", 0] },
                { "$gt": [
                    { "$multiply": [
                        { "$getField": { "input": { "$arrayElemAt": ["$room_sizes", "$$this"] }, "field": "width" } },
                        { "$getField": { "input": { "$arrayElemAt": ["$room_sizes", "$$this"] }, "field": "length" } }
                      ] },
                    60
                  ]
                }
              ] },
              "then": "$$this",
              "else": "$$value"
            }
          }
        }
      }
    }
  }
];
db.buildings.aggregate(pipeline);
```

Alternatively, use $filter with $first to return the element itself:

```javascript
var pipeline = [
  { "$set": {
      "firstLargeEnoughRoom": {
        "$first": {
          "$filter": {
            "input": "$room_sizes",
            "as": "room",
            "cond": { "$gt": [ { "$multiply": ["$$room.width", "$$room.length"] }, 60 ] }
          }
        }
      }
    }
  }
];
db.buildings.aggregate(pipeline);
```

## Reproducing $map with $reduce

Transform sensor readings into strings:

Using $map:

```javascript
var pipeline = [
  { "$set": {
      "deviceReadings": {
        "$map": {
          "input": "$readings",
          "as": "reading",
          "in": { "$concat": ["$device", ":", { "$toString": "$$reading" }] }
        }
      }
    }
  }
];
db.deviceReadings.aggregate(pipeline);
```

Using $reduce (also allowing for conditional filtering):

```javascript
var pipeline = [
  { "$set": {
      "deviceReadings": {
        "$reduce": {
          "input": "$readings",
          "initialValue": [],
          "in": {
            "$concatArrays": [
              "$$value",
              { "$cond": {
                  "if": { "$gte": ["$$this", 0] },
                  "then": [{ "$concat": ["$device", ":", { "$toString": "$$this" }] }],
                  "else": []
              } }
            ]
          }
        }
      }
    }
  }
];
db.deviceReadings.aggregate(pipeline);
```

## Adding Fields to Documents Within Arrays

To add a computed "cost" to each order item, preserving existing fields:

Using $mergeObjects:

```javascript
var pipeline = [
  { "$set": {
      "items": {
        "$map": {
          "input": "$items",
          "as": "item",
          "in": {
            "$mergeObjects": [
              "$$item",
              { "cost": { "$multiply": ["$$item.unitPrice", "$$item.qty"] } }
            ]
          }
        }
      }
    }
  }
];
db.orders.aggregate(pipeline);
```

Or dynamically rename the cost field using $objectToArray, $concatArrays and $arrayToObject:

```javascript
var pipeline = [
  { "$set": {
      "items": {
        "$map": {
          "input": "$items",
          "as": "item",
          "in": {
            "$arrayToObject": {
              "$concatArrays": [
                { "$objectToArray": "$$item" },
                [{
                  "k": { "$concat": ["costFor", "$$item.product"] },
                  "v": { "$multiply": ["$$item.unitPrice", "$$item.qty"] }
                }]
              ]
            }
          }
        }
      }
    }
  }
];
db.orders.aggregate(pipeline);
```

## Rudimentary Schema Reflection

Analyze document fields and types using $objectToArray. Example pipeline:

```javascript
var pipeline = [
  { "$project": {
      "_id": 0,
      "schema": {
        "$map": {
          "input": { "$objectToArray": "$$ROOT" },
          "as": "field",
          "in": {
            "fieldname": "$$field.k",
            "type": { "$type": "$$field.v" }
          }
        }
      }
    }
  },
  { "$unwind": "$schema" },
  { "$group": {
      "_id": "$schema.fieldname",
      "types": { "$addToSet": "$schema.type" }
    }
  },
  { "$set": {
      "fieldname": "$_id",
      "_id": "$$REMOVE"
    }
  }
];
db.customers.aggregate(pipeline);
```

This groups field names and lists their possible types (e.g., "telNums" may be both string and array).

Further examples on array manipulation are included elsewhere in the book.

---
page_url: https://www.practical-mongodb-aggregations.com/examples/examples
---
# Aggregations By Example

Examples for common data manipulation tasks. Run them as you read (see Getting Started).

---
page_url: https://www.practical-mongodb-aggregations.com/examples/foundational/foundational
---
# Foundational Examples

Examples of common data manipulation patterns for aggregation pipelines.

---
page_url: https://www.practical-mongodb-aggregations.com/examples/foundational/filtered-top-subset
---
# Filtered Top Subset

**Minimum MongoDB Version:** 4.2

Query the persons collection for the 3 youngest engineers (sorted by descending dateofbirth).

## Sample Data

```javascript
db = db.getSiblingDB("book-filtered-top-subset");
db.dropDatabase();
db.persons.createIndex({"vocation": 1, "dateofbirth": 1});
db.persons.insertMany([
  { "person_id": "6392529400", "firstname": "Elise", "lastname": "Smith", "dateofbirth": ISODate("1972-01-13T09:32:07Z"), "vocation": "ENGINEER", "address": { "number": 5625, "street": "Tipa Circle", "city": "Wojzinmoj" } },
  { "person_id": "1723338115", "firstname": "Olive", "lastname": "Ranieri", "dateofbirth": ISODate("1985-05-12T23:14:30Z"), "gender": "FEMALE", "vocation": "ENGINEER", "address": { "number": 9303, "street": "Mele Circle", "city": "Tobihbo" } },
  { "person_id": "8732762874", "firstname": "Toni", "lastname": "Jones", "dateofbirth": ISODate("1991-11-23T16:53:56Z"), "vocation": "POLITICIAN", "address": { "number": 1, "street": "High Street", "city": "Upper Abbeywoodington" } },
  { "person_id": "7363629563", "firstname": "Bert", "lastname": "Gooding", "dateofbirth": ISODate("1941-04-07T22:11:52Z"), "vocation": "FLORIST", "address": { "number": 13, "street": "Upper Bold Road", "city": "Redringtonville" } },
  { "person_id": "1029648329", "firstname": "Sophie", "lastname": "Celements", "dateofbirth": ISODate("1959-07-06T17:35:45Z"), "vocation": "ENGINEER", "address": { "number": 5, "street": "Innings Close", "city": "Basilbridge" } },
  { "person_id": "7363626383", "firstname": "Carl", "lastname": "Simmons", "dateofbirth": ISODate("1998-12-26T13:13:55Z"), "vocation": "ENGINEER", "address": { "number": 187, "street": "Hillside Road", "city": "Kenningford" } }
]);
```

## Aggregation Pipeline

```javascript
var pipeline = [
  { "$match": { "vocation": "ENGINEER" } },
  { "$sort": { "dateofbirth": -1 } },
  { "$limit": 3 },
  { "$unset": [ "_id", "vocation", "address" ] }
];
```

## Execution

```javascript
db.persons.aggregate(pipeline);
db.persons.explain("executionStats").aggregate(pipeline);
```

## Expected Output

```javascript
[
  { person_id: '7363626383', firstname: 'Carl', lastname: 'Simmons', dateofbirth: ISODate('1998-12-26T13:13:55.000Z') },
  { person_id: '1723338115', firstname: 'Olive', lastname: 'Ranieri', dateofbirth: ISODate('1985-05-12T23:14:30.000Z'), gender: 'FEMALE' },
  { person_id: '6392529400', firstname: 'Elise', lastname: 'Smith', dateofbirth: ISODate('1972-01-13T09:32:07.000Z') }
]
```

## Observations

- A compound index on {"vocation": 1, "dateofbirth": 1} optimizes matching, sorting, and limiting.
- Using `$unset` avoids verbosity and future schema changes.
- MQL equivalent:

```javascript
db.persons.find(
  { "vocation": "ENGINEER" },
  { "_id": 0, "vocation": 0, "address": 0 }
).sort({ "dateofbirth": -1 }).limit(3);
```

---
page_url: https://www.practical-mongodb-aggregations.com/examples/foundational/group-and-total
---
# Group & Total

**MongoDB Version:** 4.2+

Generate a 2020 report by grouping orders per customer to capture:
- first purchase date (using $first after pre-sorted orders),
- total order count,
- total order value,
- list of orders sorted by date.

## Sample Data

```javascript
db = db.getSiblingDB("book-group-and-total");
db.dropDatabase();
db.orders.createIndex({ "orderdate": -1 });
db.orders.insertMany(
  {
    "customer_id": "elise_smith@myemail.com",
    "orderdate": ISODate("2020-05-30T08:35:52Z"),
    "value": NumberDecimal("231.43")
  },
  {
    "customer_id": "elise_smith@myemail.com",
    "orderdate": ISODate("2020-01-13T09:32:07Z"),
    "value": NumberDecimal("99.99")
  },
  {
    "customer_id": "oranieri@warmmail.com",
    "orderdate": ISODate("2020-01-01T08:25:37Z"),
    "value": NumberDecimal("63.13")
  },
  {
    "customer_id": "tj@wheresmyemail.com",
    "orderdate": ISODate("2019-05-28T19:13:32Z"),
    "value": NumberDecimal("2.01")
  },
  {
    "customer_id": "tj@wheresmyemail.com",
    "orderdate": ISODate("2020-11-23T22:56:53Z"),
    "value": NumberDecimal("187.99")
  },
  {
    "customer_id": "tj@wheresmyemail.com",
    "orderdate": ISODate("2020-08-18T23:04:48Z"),
    "value": NumberDecimal("4.59")
  },
  {
    "customer_id": "elise_smith@myemail.com",
    "orderdate": ISODate("2020-12-26T08:55:46Z"),
    "value": NumberDecimal("48.50")
  },
  {
    "customer_id": "tj@wheresmyemail.com",
    "orderdate": ISODate("2021-02-29T07:49:32Z"),
    "value": NumberDecimal("1024.89")
  },
  {
    "customer_id": "elise_smith@myemail.com",
    "orderdate": ISODate("2020-10-03T13:49:44Z"),
    "value": NumberDecimal("102.24")
  }
);
```

## Aggregation Pipeline

```javascript
var pipeline = [
  { "$match": { "orderdate": { "$gte": ISODate("2020-01-01T00:00:00Z"), "$lt": ISODate("2021-01-01T00:00:00Z") } } },
  { "$sort": { "orderdate": 1 } },
  { "$group": {
      "_id": "$customer_id",
      "first_purchase_date": { "$first": "$orderdate" },
      "total_value": { "$sum": "$value" },
      "total_orders": { "$sum": 1 },
      "orders": { "$push": { "orderdate": "$orderdate", "value": "$value" } }
  }},
  { "$sort": { "first_purchase_date": 1 } },
  { "$set": { "customer_id": "$_id" } },
  { "$unset": [ "_id" ] }
];
```

## Execution

```javascript
db.orders.aggregate(pipeline);
db.orders.explain("executionStats").aggregate(pipeline);
```

## Expected Output

Three documents by customer, example:

```javascript
{
  customer_id: 'oranieri@warmmail.com',
  first_purchase_date: ISODate('2020-01-01T08:25:37Z'),
  total_value: NumberDecimal('63.13'),
  total_orders: 1,
  orders: [{orderdate: ISODate('2020-01-01T08:25:37Z'), value: NumberDecimal('63.13')}]
}
```

## Notes

- **Double $sort:** Pre-group to ensure $first gets the earliest date; post-group to re-sort grouped records.
- **Renaming _id:** Use $set and $unset to rename _id to customer_id.
- **High-Precision:** Use NumberDecimal (IEEE 754 decimal128) to avoid precision loss (e.g., 482.16 vs 482.15999999999997).

---
page_url: https://www.practical-mongodb-aggregations.com/examples/foundational/unpack-array-group-differently
---
# Unpack Arrays & Group Differently

**MongoDB Version:** 4.2  
**Scenario:** Create a retail report showing total value and quantity for products priced over $15 from orders containing a products array.

## Sample Data
Populate the `orders` collection:
```javascript
db = db.getSiblingDB("book-unpack-array-group-differently");
db.dropDatabase();
db.orders.insertMany(
  {
    "order_id": 6363763262239,
    "products": [
      {"prod_id": "abc12345", "name": "Asus Laptop", "price": NumberDecimal("431.43")},
      {"prod_id": "def45678", "name": "Karcher Hose Set", "price": NumberDecimal("22.13")}
    ],
  },
  {
    "order_id": 1197372932325,
    "products": [
      {"prod_id": "abc12345", "name": "Asus Laptop", "price": NumberDecimal("429.99")}
    ],
  },
  {
    "order_id": 9812343774839,
    "products": [
      {"prod_id": "pqr88223", "name": "Morphy Richardds Food Mixer", "price": NumberDecimal("431.43")},
      {"prod_id": "def45678", "name": "Karcher Hose Set", "price": NumberDecimal("21.78")}
    ],
  },
  {
    "order_id": 4433997244387,
    "products": [
      {"prod_id": "def45678", "name": "Karcher Hose Set", "price": NumberDecimal("23.43")},
      {"prod_id": "jkl77336", "name": "Picky Pencil Sharpener", "price": NumberDecimal("0.67")},
      {"prod_id": "xyz11228", "name": "Russell Hobbs Chrome Kettle", "price": NumberDecimal("15.76")}
    ],
  },
);
```

## Aggregation Pipeline
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
  {"$unset": ["_id"]},
];
```

## Execution
Run the aggregation and explain:
```javascript
db.orders.aggregate(pipeline);
db.orders.explain("executionStats").aggregate(pipeline);
```

## Expected Results
Returns documents for products over $15:
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
_Notes:_  
- `$unwind` creates one record per array element.  
- The `$match` filters expensive items post-unwind to avoid incorrect results.  
- An initial partial filter on `products.price` can use indexes and avoid full scans for large datasets.

---
page_url: https://www.practical-mongodb-aggregations.com/examples/foundational/distinct-values
---
# Distinct List Of Values

**Minimum MongoDB Version:** 4.2

## Scenario  
Query a collection of persons to obtain an alphabetically sorted, unique list of languages (like SQL's SELECT DISTINCT). Some documents have a string value for "language", others an array.

## Sample Data

```javascript
db = db.getSiblingDB("book-distinct-values");
db.dropDatabase();

db.persons.insertMany([
  { "firstname": "Elise", "lastname": "Smith", "vocation": "ENGINEER", "language": "English" },
  { "firstname": "Olive", "lastname": "Ranieri", "vocation": "ENGINEER", "language": ["Italian", "English"] },
  { "firstname": "Toni", "lastname": "Jones", "vocation": "POLITICIAN", "language": ["English", "Welsh"] },
  { "firstname": "Bert", "lastname": "Gooding", "vocation": "FLORIST", "language": "English" },
  { "firstname": "Sophie", "lastname": "Celements", "vocation": "ENGINEER", "language": ["Gaelic", "English"] },
  { "firstname": "Carl", "lastname": "Simmons", "vocation": "ENGINEER", "language": "English" },
  { "firstname": "Diego", "lastname": "Lopez", "vocation": "CHEF", "language": "Spanish" },
  { "firstname": "Helmut", "lastname": "Schneider", "vocation": "NURSE", "language": "German" },
  { "firstname": "Valerie", "lastname": "Dubois", "vocation": "SCIENTIST", "language": "French" }
]);
```

## Aggregation Pipeline

```javascript
var pipeline = [
  { "$unwind": { "path": "$language" } }, // Handles arrays & single values
  { "$group": { "_id": "$language" } },     // Group unique languages
  { "$sort": { "_id": 1 } },                // Sort A-Z
  { "$set": { "language": "$_id", "_id": "$$REMOVE" } } // Rename field
];
```

## Execution

```javascript
db.persons.aggregate(pipeline);
db.persons.explain("executionStats").aggregate(pipeline);
```

## Expected Output

```javascript
[
  { language: 'English' },
  { language: 'French' },
  { language: 'Gaelic' },
  { language: 'German' },
  { language: 'Italian' },
  { language: 'Spanish' },
  { language: 'Welsh' }
]
```

## Observations

- `$unwind` works with both arrays and single values.
- `$group` creates unique groups based on language.
- The `$set` stage uses `$$REMOVE` to drop the `_id` field.

---
page_url: https://www.practical-mongodb-aggregations.com/examples/joining/joining
---
# Joining Data Examples

Examples showing how to join a source collection in an aggregation pipeline with another collection using various methods.

---
page_url: https://www.practical-mongodb-aggregations.com/examples/joining/one-to-one-join
---
# One-to-One Join

**Minimum MongoDB Version:** 4.4 (uses `$first`)

## Scenario
Generate a 2020 shop purchases report showing product name and category by joining the _orders_ collection (with field "product_id") to the _products_ collection (with field "id").

## Sample Data Population

**Part 1 – Products**

```javascript
db = db.getSiblingDB("book-one-to-one-join");
db.dropDatabase();
db.products.createIndex({"id": 1});
db.products.insertMany(
  {
    "id": "a1b2c3d4",
    "name": "Asus Laptop",
    "category": "ELECTRONICS",
    "description": "Good value laptop for students",
  },
  {
    "id": "z9y8x7w6",
    "name": "The Day Of The Triffids",
    "category": "BOOKS",
    "description": "Classic post-apocalyptic novel",
  },
  {
    "id": "ff11gg22hh33",
    "name": "Morphy Richardds Food Mixer",
    "category": "KITCHENWARE",
    "description": "Luxury mixer turning good cakes into great",
  },
  {
    "id": "pqr678st",
    "name": "Karcher Hose Set",
    "category": "GARDEN",
    "description": "Hose + nosels + winder for tidy storage",
  }
);
```

**Part 2 – Orders**

```javascript
db.orders.createIndex({"orderdate": -1});
db.orders.insertMany([
  {
    "customer_id": "elise_smith@myemail.com",
    "orderdate": ISODate("2020-05-30T08:35:52Z"),
    "product_id": "a1b2c3d4",
    "value": NumberDecimal("431.43")
  },
  {
    "customer_id": "tj@wheresmyemail.com",
    "orderdate": ISODate("2019-05-28T19:13:32Z"),
    "product_id": "z9y8x7w6",
    "value": NumberDecimal("5.01")
  },
  {
    "customer_id": "oranieri@warmmail.com",
    "orderdate": ISODate("2020-01-01T08:25:37Z"),
    "product_id": "ff11gg22hh33",
    "value": NumberDecimal("63.13")
  },
  {
    "customer_id": "jjones@tepidmail.com",
    "orderdate": ISODate("2020-12-26T08:55:46Z"),
    "product_id": "a1b2c3d4",
    "value": NumberDecimal("429.65")
  }
]);
```

## Aggregation Pipeline

```javascript
var pipeline = [
  { "$match": { "orderdate": { "$gte": ISODate("2020-01-01T00:00:00Z"),
                                "$lt": ISODate("2021-01-01T00:00:00Z") } }},
  { "$lookup": {
      "from": "products",
      "localField": "product_id",
      "foreignField": "id",
      "as": "product_mapping"
    }},
  { "$set": { "product_mapping": { "$first": "$product_mapping" } }},
  { "$set": {
      "product_name": "$product_mapping.name",
      "product_category": "$product_mapping.category"
    }},
  { "$unset": ["_id", "product_id", "product_mapping"] }
];
```

## Execution

```javascript
db.orders.aggregate(pipeline);
db.orders.explain("executionStats").aggregate(pipeline);
```

## Expected Results

```javascript
[
  {
    customer_id: 'elise_smith@myemail.com',
    orderdate: ISODate('2020-05-30T08:35:52.000Z'),
    value: NumberDecimal('431.43'),
    product_name: 'Asus Laptop',
    product_category: 'ELECTRONICS'
  },
  {
    customer_id: 'oranieri@warmmail.com',
    orderdate: ISODate('2020-01-01T08:25:37.000Z'),
    value: NumberDecimal('63.13'),
    product_name: 'Morphy Richardds Food Mixer',
    product_category: 'KITCHENWARE'
  },
  {
    customer_id: 'jjones@tepidmail.com',
    orderdate: ISODate('2020-12-26T08:55:46.000Z'),
    value: NumberDecimal('429.65'),
    product_name: 'Asus Laptop',
    product_category: 'ELECTRONICS'
  }
]
```

## Observations
- Performs a single-field join between orders and products.
- Uses `$first` to extract a single matching product; for pre-4.4 MongoDB, use:
  
  ```javascript
  "product_mapping": { "$arrayElemAt": ["$product_mapping", 0] }
  ```

---
page_url: https://www.practical-mongodb-aggregations.com/examples/joining/multi-one-to-many
---
# Multi-Field Join & One-to-Many

__Minimum MongoDB Version: 4.2__

## Scenario
Join a shop's _products_ collection to its _orders_ collection (1:many) using two fields: `name` with `product_name` and `variation` with `product_variation`. Filter orders to only those made in 2020.

## Sample Data Population

### Part 1
```javascript
db = db.getSiblingDB("book-multi-one-to-many");
db.dropDatabase();

db.products.insertMany(
  {
    "name": "Asus Laptop",
    "variation": "Ultra HD",
    "category": "ELECTRONICS",
    "description": "Great for watching movies",
  },
  {
    "name": "Asus Laptop",
    "variation": "Normal Display",
    "category": "ELECTRONICS",
    "description": "Good value laptop for students",
  },
  {
    "name": "The Day Of The Triffids",
    "variation": "1st Edition",
    "category": "BOOKS",
    "description": "Classic post-apocalyptic novel",
  },
  {
    "name": "The Day Of The Triffids",
    "variation": "2nd Edition",
    "category": "BOOKS",
    "description": "Classic post-apocalyptic novel",
  },
  {
    "name": "Morphy Richards Food Mixer",
    "variation": "Deluxe",
    "category": "KITCHENWARE",
    "description": "Luxury mixer turning good cakes into great",
  },
  {
    "name": "Karcher Hose Set",
    "variation": "Full Monty",
    "category": "GARDEN",
    "description": "Hose + nosels + winder for tidy storage",
  },
);
```

### Part 2
```javascript
db.orders.createIndex({"product_name": 1, "product_variation": 1});

db.orders.insertMany([
  {
    "customer_id": "elise_smith@myemail.com",
    "orderdate": ISODate("2020-05-30T08:35:52Z"),
    "product_name": "Asus Laptop",
    "product_variation": "Normal Display",
    "value": NumberDecimal("431.43"),
  },
  {
    "customer_id": "tj@wheresmyemail.com",
    "orderdate": ISODate("2019-05-28T19:13:32Z"),
    "product_name": "The Day Of The Triffids",
    "product_variation": "2nd Edition",
    "value": NumberDecimal("5.01"),
  },
  {
    "customer_id": "oranieri@warmmail.com",
    "orderdate": ISODate("2020-01-01T08:25:37Z"),
    "product_name": "Morphy Richards Food Mixer",
    "product_variation": "Deluxe",
    "value": NumberDecimal("63.13"),
  },
  {
    "customer_id": "jjones@tepidmail.com",
    "orderdate": ISODate("2020-12-26T08:55:46Z"),
    "product_name": "Asus Laptop",
    "product_variation": "Normal Display",
    "value": NumberDecimal("429.65"),
  },
]);
```

## Aggregation Pipeline
```javascript
var pipeline = [
  {
    "$lookup": {
      "from": "orders",
      "let": { "prdname": "$name", "prdvartn": "$variation" },
      "pipeline": [
        { "$match": { "$expr": { "$and": [
            { "$eq": ["$product_name", "$$prdname"] },
            { "$eq": ["$product_variation", "$$prdvartn"] }
          ] } } },
        { "$match": {
            "orderdate": { "$gte": ISODate("2020-01-01T00:00:00Z"),
                           "$lt": ISODate("2021-01-01T00:00:00Z") }
          }
        },
        { "$unset": [ "_id", "product_name", "product_variation" ] },
      ],
      "as": "orders"
    }
  },
  { "$match": { "orders": { "$ne": [] } } },
  { "$unset": [ "_id" ] },
];
```

## Execution
```javascript
db.products.aggregate(pipeline);
db.products.explain("executionStats").aggregate(pipeline);
```

## Expected Results
Returns two documents for products with 2020 orders:
```javascript
[
  {
    name: 'Asus Laptop',
    variation: 'Normal Display',
    category: 'ELECTRONICS',
    description: 'Good value laptop for students',
    orders: [
      {
        customer_id: 'elise_smith@myemail.com',
        orderdate: ISODate('2020-05-30T08:35:52.000Z'),
        value: NumberDecimal('431.43')
      },
      {
        customer_id: 'jjones@tepidmail.com',
        orderdate: ISODate('2020-12-26T08:55:46.000Z'),
        value: NumberDecimal('429.65')
      }
    ]
  },
  {
    name: 'Morphy Richards Food Mixer',
    variation: 'Deluxe',
    category: 'KITCHENWARE',
    description: 'Luxury mixer turning good cakes into great',
    orders: [
      {
        customer_id: 'oranieri@warmmail.com',
        orderdate: ISODate('2020-01-01T08:25:37.000Z'),
        value: NumberDecimal('63.13')
      }
    ]
  }
]
```

## Observations
- Use `$lookup` with `let` and an embedded pipeline to join multiple fields with `$expr` for index-friendly equality checks.
- Filtering unwanted fields can be done inside the pipeline using `$unset`, preventing a need for additional stages later.

---
page_url: https://www.practical-mongodb-aggregations.com/examples/type-convert/type-convert
---
# Data Types Conversion Examples

Examples converting string-represented fields to strongly typed fields for easier querying.

---
page_url: https://www.practical-mongodb-aggregations.com/examples/type-convert/convert-to-strongly-typed
---
# Strongly-Typed Conversion

Minimum MongoDB Version: 4.2

Re-establish correct types for a collection of retail orders (all stored as strings) and copy them to a new collection using an aggregation pipeline.

## Sample Data Population
Drop the old database and insert orders (one document omits further_info.reported):

```javascript
db = db.getSiblingDB("book-convert-to-strongly-typed");
db.dropDatabase();

db.orders.insertMany(
  {
    "customer_id": "elise_smith@myemail.com",
    "order_date": "2020-05-30T08:35:52",
    "value": "231.43",
    "further_info": { "item_qty": "3", "reported": "false" },
  },
  {
    "customer_id": "oranieri@warmmail.com",
    "order_date": "2020-01-01T08:25:37",
    "value": "63.13",
    "further_info": { "item_qty": "2" },
  },
  {
    "customer_id": "tj@wheresmyemail.com",
    "order_date": "2019-05-28T19:13:32",
    "value": "2.01",
    "further_info": { "item_qty": "1", "reported": "true" },
  },
);
```

## Aggregation Pipeline
Convert string fields to correct types and write results to a new collection:

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
  {"$merge": {"into": "orders_typed"}},
];
```

## Execution
Run the aggregation, inspect the new collection, and view the execution plan:

```javascript
db.orders.aggregate(pipeline);
db.orders_typed.find();
db.orders.explain("executionStats").aggregate(pipeline);
```

## Expected Results
Documents in orders_typed display the original structure with strongly-typed fields:

```javascript
[
  {
    _id: ObjectId('...'),
    customer_id: 'elise_smith@myemail.com',
    order_date: ISODate('2020-05-30T08:35:52.000Z'),
    value: NumberDecimal('231.43'),
    further_info: { item_qty: 3, reported: false }
  },
  {
    _id: ObjectId('...'),
    customer_id: 'oranieri@warmmail.com',
    order_date: ISODate('2020-01-01T08:25:37.000Z'),
    value: NumberDecimal('63.13'),
    further_info: { item_qty: 2 }
  },
  {
    _id: ObjectId('...'),
    customer_id: 'tj@wheresmyemail.com',
    order_date: ISODate('2019-05-28T19:13:32.000Z'),
    value: NumberDecimal('2.01'),
    further_info: { item_qty: 1, reported: true }
  }
]
```

## Observations
- Boolean Conversion: Uses $switch with $toLower to avoid $toBool converting any non-empty string to true.
- Preserving Non-Existence: $ifNull returns $$REMOVE if a field (like further_info.reported) is missing.
- Output: $merge outputs to a collection (supports both sharded and unsharded collections) unlike $out.
- Date Conversions: Ensure input strings meet $toDate requirements; handle incomplete dates separately.

---
page_url: https://www.practical-mongodb-aggregations.com/examples/type-convert/convert-incomplete-dates
---
# Convert Incomplete Date Strings

**MongoDB Version:** 4.2  
**Scenario:** Convert _payment date_ strings like `"01-JAN-20 01.01.01.123000000"` into BSON dates. The strings lack complete century, time-zone, and language info; assume 21st century, UTC, English.

## Sample Data Population

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

```javascript
var pipeline = [
  {"$set": {
    "paymentDate": {    
      "$let": {
        "vars": {
          "txt": "$paymentDate",
          "month": {"$substrCP": ["$paymentDate", 3, 3]}
        },
        "in": { 
          "$dateFromString": {
            "format": "%d-%m-%Y %H.%M.%S.%L", 
            "dateString": {"$concat": [
              {"$substrCP": ["$$txt", 0, 3]},
              {"$switch": {
                "branches": [
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
                  {"case": {"$eq": ["$$month", "DEC"]}, "then": "12"}
                ],
                "default": "ERROR"
              }},
              "-20",
              {"$substrCP": ["$$txt", 7, 15]}
            ]}
          }
        }
      }
    }
  }},
  {"$unset": ["_id"]}
];
```

## Execution

```javascript
db.payments.aggregate(pipeline);
db.payments.explain("executionStats").aggregate(pipeline);
```

## Expected Results

Returns 12 documents with `paymentDate` as ISODate. Example:

```javascript
{
  account: '010101',
  paymentDate: ISODate('2020-01-01T01:01:01.123Z'),
  amount: 1.01
}
```

## Observations

- The pipeline reconstructs the date string by concatenating:
  - Day ("12-"),
  - Month converted via a `$switch`,
  - Hard-coded century ("-20"),
  - The time part (excluding extra nanoseconds).
- Uses `$let` to define `txt` and `month` for reuse in the conversion logic.

---
page_url: https://www.practical-mongodb-aggregations.com/examples/trend-analysis/trend-analysis
---
# Trend Analysis Examples

Examples of analyzing datasets to identify trends, categories, and relationships.

---
page_url: https://www.practical-mongodb-aggregations.com/examples/trend-analysis/faceted-classifications
---
# Faceted Classification

Minimum MongoDB Version: 4.2

Scenario: Implement faceted search on a retail site by splitting products into sub-ranges for fields like price and rating using a single aggregation pipeline.

## Sample Data Population

-Part 1-
```javascript
db = db.getSiblingDB("book-faceted-classfctn");
db.dropDatabase();
db.products.insertMany(
  {
    "name": "Asus Laptop",
    "category": "ELECTRONICS",
    "description": "Good value laptop for students",
    "price": NumberDecimal("431.43"),
    "rating": NumberDecimal("4.2"),
  },
  {
    "name": "The Day Of The Triffids",
    "category": "BOOKS",
    "description": "Classic post-apocalyptic novel",
    "price": NumberDecimal("5.01"),
    "rating": NumberDecimal("4.8"),
  },
  {
    "name": "Morphy Richardds Food Mixer",
    "category": "KITCHENWARE",
    "description": "Luxury mixer turning good cakes into great",
    "price": NumberDecimal("63.13"),
    "rating": NumberDecimal("3.8"),
  },
  {
    "name": "Karcher Hose Set",
    "category": "GARDEN",
    "description": "Hose + nosels + winder for tidy storage",
    "price": NumberDecimal("22.13"),
    "rating": NumberDecimal("4.3"),
  },
  {
    "name": "Oak Coffee Table",
    "category": "HOME",
    "description": "size is 2m x 0.5m x 0.4m",
    "price": NumberDecimal("22.13"),
    "rating": NumberDecimal("3.8"),
  },
  {
    "name": "Lenovo Laptop",
    "category": "ELECTRONICS",
    "description": "High spec good for gaming",
    "price": NumberDecimal("1299.99"),
    "rating": NumberDecimal("4.1"),
  },
  {
    "name": "One Day in the Life of Ivan Denisovich",
    "category": "BOOKS",
    "description": "Brutal life in a labour camp",
    "price": NumberDecimal("4.29"),
    "rating": NumberDecimal("4.9"),
  },
  {
    "name": "Russell Hobbs Chrome Kettle",
    "category": "KITCHENWARE",
    "description": "Nice looking budget kettle",
    "price": NumberDecimal("15.76"),
    "rating": NumberDecimal("3.9"),
  }
);
```

-Part 2-
```javascript
db.products.insertMany([  
  {
    "name": "Tiffany Gold Chain",
    "category": "JEWELERY",
    "description": "Looks great for any age and gender",
    "price": NumberDecimal("582.22"),
    "rating": NumberDecimal("4.0"),
  },
  {
    "name": "Raleigh Racer 21st Century Classic",
    "category": "BICYCLES",
    "description": "Modern update to a classic 70s bike design",
    "price": NumberDecimal("523.00"),
    "rating": NumberDecimal("4.5"),
  },
  {
    "name": "Diesel Flare Jeans",
    "category": "CLOTHES",
    "description": "Top end casual look",
    "price": NumberDecimal("129.89"),
    "rating": NumberDecimal("4.3"),
  },
  {
    "name": "Jazz Silk Scarf",
    "category": "CLOTHES",
    "description": "Style for the winder months",
    "price": NumberDecimal("28.39"),
    "rating": NumberDecimal("3.7"),
  },
  {
    "name": "Dell XPS 13 Laptop",
    "category": "ELECTRONICS",
    "description": "Developer edition",
    "price": NumberDecimal("1399.89"),
    "rating": NumberDecimal("4.4"),
  },
  {
    "name": "NY Baseball Cap",
    "category": "CLOTHES",
    "description": "Blue & white",
    "price": NumberDecimal("18.99"),
    "rating": NumberDecimal("4.0"),
  },
  {
    "name": "Tots Flower Pots",
    "category": "GARDEN",
    "description": "Set of three",
    "price": NumberDecimal("9.78"),
    "rating": NumberDecimal("4.1"),
  },  
  {
    "name": "Picky Pencil Sharpener",
    "category": "Stationery",
    "description": "Ultra budget",
    "price": NumberDecimal("0.67"),
    "rating": NumberDecimal("1.2"),
  }
]);
```

## Aggregation Pipeline

```javascript
var pipeline = [
  {"$facet": {
    "by_price": [
      {"$bucketAuto": {
        "groupBy": "$price",
        "buckets": 3,
        "granularity": "1-2-5",
        "output": { "count": {"$sum": 1}, "products": {"$push": "$name"} }
      }},
      {"$set": { "price_range": "$_id" }},
      {"$unset": [ "_id" ]}
    ],
    "by_rating": [
      {"$bucketAuto": {
        "groupBy": "$rating",
        "buckets": 5,
        "output": { "count": {"$sum": 1}, "products": {"$push": "$name"} }
      }},
      {"$set": { "rating_range": "$_id" }},
      {"$unset": [ "_id" ]}
    ]
  }}
];
```

## Execution

```javascript
db.products.aggregate(pipeline);
db.products.explain("executionStats").aggregate(pipeline);
```

## Expected Results

A single document with two keys: "by_price" and "by_rating", each an array of buckets with product names, counts, and range info.

```javascript
[
  {
    by_price: [
      { count: 6, products: [ ... ], price_range: { min: NumberDecimal('0.50'), max: NumberDecimal('20.00') } },
      { count: 5, products: [ ... ], price_range: { min: NumberDecimal('20.00'), max: NumberDecimal('200.00') } },
      { count: 5, products: [ ... ], price_range: { min: NumberDecimal('200.00'), max: NumberDecimal('2000.00') } }
    ],
    by_rating: [
      { count: 4, products: [ ... ], rating_range: { min: NumberDecimal('1.2'), max: NumberDecimal('3.9') } },
      { count: 3, products: [ ... ], rating_range: { min: NumberDecimal('3.9'), max: NumberDecimal('4.1') } },
      { count: 3, products: [ ... ], rating_range: { min: NumberDecimal('4.1'), max: NumberDecimal('4.3') } },
      { count: 3, products: [ ... ], rating_range: { min: NumberDecimal('4.3'), max: NumberDecimal('4.5') } },
      { count: 3, products: [ ... ], rating_range: { min: NumberDecimal('4.5'), max: NumberDecimal('4.9') } }
    ]
  }
]
```

## Observations

- Use $facet to run parallel sub-pipelines (e.g. $bucketAuto for price and rating) in one aggregation.
- The stage returns one document with named arrays for each facet.
- Different granularity settings allow evenly distributed ranges.
- Full collection scans may be inefficient; Atlas Search offers a faster alternative for faceted search.

---
page_url: https://www.practical-mongodb-aggregations.com/examples/trend-analysis/largest-graph-network
---
# Largest Graph Network

Minimum MongoDB Version: 4.2

## Scenario
Calculate each user's extended network reach in a Twitter-like social network using $graphLookup on the "followed_by" field.

## Sample Data Population
Drop the old database, create an index on "name", and insert ten user documents:
```javascript
db = db.getSiblingDB("book-largest-graph-network");
db.dropDatabase();
db.users.createIndex({ "name": 1 });
db.users.insertMany(
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
);
```

## Aggregation Pipeline
The pipeline uses $graphLookup to traverse "followed_by", then:
- Computes "network_reach" using $size.
- Maps "extended_connections" to extract names.
- Unsets unwanted fields.
- Sorts by "network_reach" descending.
```javascript
var pipeline = [
  { "$graphLookup": {
      "from": "users",
      "startWith": "$followed_by",
      "connectFromField": "followed_by",
      "connectToField": "name",
      "depthField": "depth",
      "as": "extended_network"
  }},
  { "$set": {
      "network_reach": { "$size": "$extended_network" },
      "extended_connections": {
        "$map": {
          "input": "$extended_network",
          "as": "connection",
          "in": "$$connection.name"
        }
      }
  }},
  { "$unset": ["_id", "followed_by", "extended_network"] },
  { "$sort": { "network_reach": -1 } }
];
```

## Execution and Expected Results
Run the aggregation and its explain plan:
```javascript
db.users.aggregate(pipeline);
db.users.explain("executionStats").aggregate(pipeline);
```
The result returns 10 documents sorted by descending network reach (e.g., Carol with reach 8).

## Observations
- $graphLookup traverses relationships and leverages the index on "name".
- $map extracts the "name" field from each related document.

---
page_url: https://www.practical-mongodb-aggregations.com/examples/trend-analysis/incremental-analytics
---
# Incremental Analytics

**Minimum MongoDB Version:** 4.2

Manage continuously added shop orders by summarizing each day’s orders into a separate collection (On-Demand Materialized Views). This allows constant summary update time regardless of the growing orders collection size.

## Sample Data Population

```javascript
db = db.getSiblingDB("book-incremental-analytics");
db.dropDatabase();
db.daily_orders_summary.createIndex({"day": 1}, {"unique": true});
db.orders.createIndex({"orderdate": 1});
db.orders.insertMany([
  { "orderdate": ISODate("2021-02-01T08:35:52Z"), "value": NumberDecimal("231.43") },
  { "orderdate": ISODate("2021-02-01T09:32:07Z"), "value": NumberDecimal("99.99") },
  { "orderdate": ISODate("2021-02-01T08:25:37Z"), "value": NumberDecimal("63.13") },
  { "orderdate": ISODate("2021-02-01T19:13:32Z"), "value": NumberDecimal("2.01") },
  { "orderdate": ISODate("2021-02-01T22:56:53Z"), "value": NumberDecimal("187.99") },
  { "orderdate": ISODate("2021-02-02T23:04:48Z"), "value": NumberDecimal("4.59") },
  { "orderdate": ISODate("2021-02-02T08:55:46Z"), "value": NumberDecimal("48.50") },
  { "orderdate": ISODate("2021-02-02T07:49:32Z"), "value": NumberDecimal("1024.89") },
  { "orderdate": ISODate("2021-02-02T13:49:44Z"), "value": NumberDecimal("102.24") },
]);
```

## Aggregation Pipeline

Parameterized pipeline for summarizing one day:

```javascript
function getDayAggPipeline(startDay, endDay) {
  return [
    { "$match": { "orderdate": { "$gte": ISODate(startDay), "$lt": ISODate(endDay) } } },
    { "$group": {
      "_id": null,
      "date_parts": { "$first": { "$dateToParts": { "date": "$orderdate" } } },
      "total_value": { "$sum": "$value" },
      "total_orders": { "$sum": 1 }
    }},
    { "$set": { "day": { "$dateFromParts": {
      "year": "$date_parts.year", "month": "$date_parts.month", "day": "$date_parts.day" } } } },
    { "$unset": ["_id", "date_parts"] },
    { "$merge": {
      "into": "daily_orders_summary",
      "on": "day",
      "whenMatched": "replace",
      "whenNotMatched": "insert"
    }},
  ];
}
```

## Execution Examples

For 01-Feb-2021:

```javascript
var pipeline = getDayAggPipeline("2021-02-01T00:00:00Z", "2021-02-02T00:00:00Z");
db.orders.aggregate(pipeline);
db.daily_orders_summary.find();
```

For 02-Feb-2021:

```javascript
var pipeline = getDayAggPipeline("2021-02-02T00:00:00Z", "2021-02-03T00:00:00Z");
db.orders.aggregate(pipeline);
db.daily_orders_summary.find();
```

To update 01-Feb after adding a late order:

```javascript
db.orders.insertOne({
  "orderdate": ISODate("2021-02-01T09:32:07Z"),
  "value": NumberDecimal("11111.11")
});
var pipeline = getDayAggPipeline("2021-02-01T00:00:00Z", "2021-02-02T00:00:00Z");
db.orders.aggregate(pipeline);
db.daily_orders_summary.find();
```

Also, view the explain plan:

```javascript
db.products.explain("executionStats").aggregate(pipeline);
```

## Expected Results

After first-day aggregation:
```javascript
[
  {
    _id: ObjectId(...),
    total_value: NumberDecimal('584.55'),
    total_orders: 5,
    day: ISODate("2021-02-01T00:00:00Z")
  }
]
```

After second-day aggregation:
```javascript
[
  { ... first day summary ... },
  {
    _id: ObjectId(...),
    total_value: NumberDecimal('1180.22'),
    total_orders: 4,
    day: ISODate("2021-02-02T00:00:00Z")
  }
]
```

After re-aggregation for 01-Feb:
```javascript
[
  {
    _id: ObjectId(...),
    total_value: NumberDecimal('11695.66'),
    total_orders: 6,
    day: ISODate("2021-02-01T00:00:00Z")
  },
  { ... second day summary ... }
]
```

## Observations

- **Merging Results:** The `$merge` stage inserts or replaces records in the daily summary collection.
- **Incremental Updates:** Only the current day’s data is aggregated, keeping update times constant despite large datasets.
- **Idempotency:** Re-running a failed pipeline safely replaces incomplete summaries.
- **Retrospective Changes:** The pipeline can be re-run for historical days to correct data.

---
page_url: https://www.practical-mongodb-aggregations.com/examples/securing-data/securing-data
---
# Securing Data Examples

Examples on using aggregation pipelines to securely access and distribute data.

---
page_url: https://www.practical-mongodb-aggregations.com/examples/securing-data/redacted-view
---
# Redacted View

**Minimum MongoDB Version:** 4.2

## Scenario

A user management system restricts sensitive data using a read-only view named _adults_. The view shows only persons aged 18+ (by comparing `dateofbirth` against `$$NOW` minus 18 years) and excludes the `social_security_num` field. In practice, RBAC would further limit access to the original collection.

## Sample Data Population

```javascript
db = db.getSiblingDB("book-redacted-view");
db.dropDatabase();
db.persons.createIndex({"dateofbirth": -1});
db.persons.createIndex({"gender": 1});
db.persons.createIndex({"gender": 1, "dateofbirth": -1});
db.persons.insertMany(
  {
    "person_id": "6392529400",
    "firstname": "Elise",
    "lastname": "Smith",
    "dateofbirth": ISODate("1972-01-13T09:32:07Z"),
    "gender": "FEMALE",
    "email": "elise_smith@myemail.com",
    "social_security_num": "507-28-9805",
    "address": { "number": 5625, "street": "Tipa Circle", "city": "Wojzinmoj" },
  },
  {
    "person_id": "1723338115",
    "firstname": "Olive",
    "lastname": "Ranieri",
    "dateofbirth": ISODate("1985-05-12T23:14:30Z"),    
    "gender": "FEMALE",
    "email": "oranieri@warmmail.com",
    "social_security_num": "618-71-2912",
    "address": { "number": 9303, "street": "Mele Circle", "city": "Tobihbo" },
  },
  {
    "person_id": "8732762874",
    "firstname": "Toni",
    "lastname": "Jones",
    "dateofbirth": ISODate("2014-11-23T16:53:56Z"),    
    "gender": "FEMALE",
    "email": "tj@wheresmyemail.com",
    "social_security_num": "001-10-3488",
    "address": { "number": 1, "street": "High Street", "city": "Upper Abbeywoodington" },
  },
  {
    "person_id": "7363629563",
    "firstname": "Bert",
    "lastname": "Gooding",
    "dateofbirth": ISODate("1941-04-07T22:11:52Z"),    
    "gender": "MALE",
    "email": "bgooding@tepidmail.com",
    "social_security_num": "230-43-7633",
    "address": { "number": 13, "street": "Upper Bold Road", "city": "Redringtonville" },
  },
  {
    "person_id": "1029648329",
    "firstname": "Sophie",
    "lastname": "Celements",
    "dateofbirth": ISODate("2013-07-06T17:35:45Z"),    
    "gender": "FEMALE",
    "email": "sophe@celements.net",
    "social_security_num": "377-30-5364",
    "address": { "number": 5, "street": "Innings Close", "city": "Basilbridge" },
  },
]);
```

## Aggregation Pipeline

```javascript
var pipeline = [
  { "$match": {
      "$expr": { "$lt": ["$dateofbirth", {"$subtract": ["$$NOW", 18*365.25*24*60*60*1000]}] }
    }
  },
  { "$unset": ["_id", "social_security_num"] }
];
```

## Execution

Test the pipeline and view creation:

```javascript
db.persons.aggregate(pipeline);
db.persons.explain("executionStats").aggregate(pipeline);
db.createView("adults", "persons", pipeline);
db.adults.find();
db.adults.explain("executionStats").find();
db.adults.find({"gender": "FEMALE"});
db.adults.explain("executionStats").find({"gender": "FEMALE"});
```

## Expected Results

Both aggregation and view queries return only persons aged 18+ (3 records) without social security numbers:

```javascript
[
  { person_id: '6392529400', firstname: 'Elise', lastname: 'Smith', dateofbirth: ISODate('1972-01-13T09:32:07Z'), gender: 'FEMALE', email: 'elise_smith@myemail.com', address: { number: 5625, street: 'Tipa Circle', city: 'Wojzinmoj' } },
  { person_id: '1723338115', firstname: 'Olive', lastname: 'Ranieri', dateofbirth: ISODate('1985-05-12T23:14:30Z'), gender: 'FEMALE', email: 'oranieri@warmmail.com', address: { number: 9303, street: 'Mele Circle', city: 'Tobihbo' } },
  { person_id: '7363629563', firstname: 'Bert', lastname: 'Gooding', dateofbirth: ISODate('1941-04-07T22:11:52Z'), gender: 'MALE', email: 'bgooding@tepidmail.com', address: { number: 13, street: 'Upper Bold Road', city: 'Redringtonville' } }
]
```

For the filter `{"gender": "FEMALE"}`, only the records for Elise and Olive are returned.

## Observations

- The `$expr` operator is required to use `$$NOW` for the age check. Prior to MongoDB 5.0, using `$expr` may prevent using an index on `dateofbirth`.
- When querying the view with an additional `$match` (e.g. filtering by gender), MongoDB optimizes by moving the extra match to the start of the pipeline, allowing index use (e.g. on the `gender` field). In MongoDB 5.0+, a compound index on `gender` and `dateofbirth` is fully utilized.
- Note: If a pipeline stage (like `$group`) prevents reordering, these optimizations may not apply.

---
page_url: https://www.practical-mongodb-aggregations.com/examples/securing-data/mask-sensitive-fields
---
# Mask Sensitive Fields

**Minimum MongoDB Version:** 4.4 (uses `$rand`)

## Scenario

Mask credit card payment docs irreversibly for third party analysis by:
- Partially obfuscating `card_name` (extract last word and prefix with "Mx. Xxx").
- Masking `card_num` (replace first 12 digits with X's).
- Adjusting `card_expiry` by ± up to 30 days.
- Replacing `card_sec_code` with random 3 digits.
- Modifying `transaction_amount` by ± up to 10% of its value.
- Flipping `reported` value in ~20% of records.
- Removing the `customer_info` sub-document if its `category` equals "RESTRICTED".
- Excluding the `_id` field.

## Sample Data Population

```javascript
db = db.getSiblingDB("book-mask-sensitive-fields");
db.dropDatabase();

// Insert credit card payment records
db.payments.insertMany(
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

```javascript
var pipeline = [
  {"$set": {
    "card_name": {"$regexFind": {"input": "$card_name", "regex": /(\S+)$/}},
    "card_num": {"$concat": [
                  "XXXXXXXXXXXX",
                  {"$substrCP": ["$card_num", 12, 4]},
                ]},
    "card_expiry": {"$add": [
                     "$card_expiry",
                     {"$floor": {"$multiply": [{"$subtract": [{"$rand": {}}, 0.5]}, 2*30*24*60*60*1000]}},
                   ]},
    "card_sec_code": {"$concat": [
                       {"$toString": {"$floor": {"$multiply": [{"$rand": {}}, 10]}}},
                       {"$toString": {"$floor": {"$multiply": [{"$rand": {}}, 10]}}},
                       {"$toString": {"$floor": {"$multiply": [{"$rand": {}}, 10]}}},
                     ]},
    "transaction_amount": {"$add": [
                            "$transaction_amount",
                            {"$multiply": [{"$subtract": [{"$rand": {}}, 0.5]}, 0.2, "$transaction_amount"]},
                          ]},
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

```javascript
db.payments.aggregate(pipeline);
db.payments.explain("executionStats").aggregate(pipeline);
```

## Expected Results

Two documents are returned with obfuscated fields, with `customer_info` removed for records where its `category` is "RESTRICTED". For example:

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

- **Redaction:** Uses `$cond` with `$$REMOVE` to eliminate `customer_info` if `category` is "RESTRICTED", avoiding heavier `$redact` processing.
- **Regex:** `$regexFind` extracts the last word from `card_name`. MongoDB 5.0+ can use `$getField` to directly extract the match:
  
  ```javascript
  "card_name": {"$concat": ["Mx. Xxx ", {"$ifNull": [{"$getField": {"field": "match", "input": {"$regexFind": {"input": "$card_name", "regex": /(\S+)$/}}}}, "Anonymous"]}]},
  ```
- **Analytics:** Minor random adjustments allow analysis of trends despite data masking.

---
page_url: https://www.practical-mongodb-aggregations.com/examples/securing-data/role-programmatic-restricted-view
---
# Role Programmatic Restricted View

**Minimum MongoDB Version:** 7.0 (requires `USER_ROLES`)

## Scenario
A medical IT system surfaces patient data with field-level and record-level access control via programmatic RBAC. Depending on the role (Receptionist, Nurse, Doctor), sensitive fields (e.g. weight and medication) are omitted. In production, declarative roles should limit access only to the view.

## Sample Data Population
For self-installed MongoDB, run:

```javascript
var dbName = "book-role-programmatic-restricted-view";
db = db.getSiblingDB(dbName);
db.dropDatabase();
db.dropAllRoles();
db.dropAllUsers();

// Create roles
db.createRole({ "role": "Receptionist", "roles": [], "privileges": [] });
db.createRole({ "role": "Nurse", "roles": [], "privileges": [] });
db.createRole({ "role": "Doctor", "roles": [], "privileges": [] });

// Create users with roles
db.createUser({ "user": "front-desk", "pwd": "abc123", "roles": [{ "role": "Receptionist", "db": dbName }] });
db.createUser({ "user": "nurse-station", "pwd": "xyz789", "roles": [{ "role": "Nurse", "db": dbName }] });
db.createUser({ "user": "exam-room", "pwd": "mno456", "roles": [{ "role": "Doctor", "db": dbName }] });
```

Populate the `patients` collection:

```javascript
db = db.getSiblingDB("book-role-programmatic-restricted-view");
db.patients.insertMany([
  { "id": "D40230", "first_name": "Chelsea", "last_Name": "Chow", "birth_date": ISODate("1984-11-07T10:12:00Z"), "weight": 145, "medication": ["Insulin", "Methotrexate"] },
  { "id": "R83165", "first_name": "Pharrell", "last_Name": "Phillips", "birth_date": ISODate("1993-05-30T19:44:00Z"), "weight": 137, "medication": ["Fluoxetine"] },
  { "id": "X24046", "first_name": "Billy", "last_Name": "Boaty", "birth_date": ISODate("1976-02-07T23:58:00Z"), "weight": 223, "medication": [] },
  { "id": "P53212", "first_name": "Yazz", "last_Name": "Yodeler", "birth_date": ISODate("1999-12-25T12:51:00Z"), "weight": 156, "medication": ["Tylenol", "Naproxen"] }
]);
```

## Aggregation Pipeline & View
Define a pipeline that conditionally removes fields:

```javascript
var pipeline = [
  { "$set": {
      "weight": { "$cond": { "if": { "$eq": [ { "$setIntersection": ["$$USER_ROLES.role", ["Doctor", "Nurse"]]}, [] ] }, "then": "$$REMOVE", "else": "$weight" } },
      "medication": { "$cond": { "if": { "$eq": [ { "$setIntersection": ["$$USER_ROLES.role", ["Doctor"]]}, [] ] }, "then": "$$REMOVE", "else": "$medication" } },
      "_id": "$$REMOVE"
  }}
];
```

Create the view:

```javascript
db.createView("patients_view", "patients", pipeline);
```

## Execution
Query the view based on user role:

```javascript
// As Receptionist (front-desk)
db.auth("front-desk", "abc123");
db.patients_view.find();

// As Nurse (nurse-station)
db.auth("nurse-station", "xyz789");
db.patients_view.find();

// As Doctor (exam-room)
db.auth("exam-room", "mno456");
db.patients_view.find();

// Explain plan
db.patients_view.explain("executionStats").find();
```

## Expected Results
- **Receptionist:** Returns patient data without weight and medication.
- **Nurse:** Returns data including weight.
- **Doctor:** Returns full data (weight and medication).

## Observations
- **Programmatic vs Declarative RBAC:** Uses aggregation with `$$USER_ROLES` to enforce custom logic vs hard-coding separate views.
- **Avoiding View Proliferation:** A single dynamic view reduces maintenance compared to multiple role-specific views.
- **Index Pushdowns:** The view’s pipeline can benefit from index optimizations including filter pushdowns.
- **Field- vs Record-Level Access:** Pipeline offers field-level control; record-level filtering can be added via `$match`.
- **Dynamic Metadata:** Future implementations might factor access rules into a metadata collection, enabling business users to update rules without code changes.

---
page_url: https://www.practical-mongodb-aggregations.com/examples/time-series/time-series
---
# Time-Series Examples

Examples of aggregating time-series data for finance and IoT use cases.

---
page_url: https://www.practical-mongodb-aggregations.com/examples/time-series/iot-power-consumption
---
# IoT Power Consumption

**Minimum MongoDB Version:** 5.0 (for time series collections, `$setWindowFields` & `$integral`)

## Scenario

Monitor air-conditioning units in two buildings. Every 30 minutes, devices send power readings. Compute per-reading unit energy consumption (kWh over the past hour) and aggregate hourly consumption per building.

## Data Population

Drop the old database, create a time series collection with an index on `{deviceID: 1, timestamp: 1}`, then insert sample data (readings from 11:29, 11:59, 12:29, 12:59, 13:29, 13:59).

```javascript
db = db.getSiblingDB("book-iot-power-consumption");
db.dropDatabase();

db.createCollection("device_readings", {
  timeseries: { timeField: "timestamp", metaField: "deviceID", granularity: "minutes" }
});
db.device_readings.createIndex({ deviceID: 1, timestamp: 1 });
db.device_readings.insertMany([
  { buildingID: "Building-ABC", deviceID: "UltraAirCon-111", timestamp: ISODate("2021-07-03T11:29:59Z"), powerKilowatts: 8 },
  { buildingID: "Building-ABC", deviceID: "UltraAirCon-222", timestamp: ISODate("2021-07-03T11:29:59Z"), powerKilowatts: 7 },
  { buildingID: "Building-XYZ", deviceID: "UltraAirCon-666", timestamp: ISODate("2021-07-03T11:29:59Z"), powerKilowatts: 10 },
  // ... additional records for 11:59, 12:29, 12:59, 13:29, 13:59
]);
```

## Aggregation Pipelines

Per-unit energy consumption (using trapezoidal rule):

```javascript
var pipelineRawReadings = [
  { $setWindowFields: {
      partitionBy: "$deviceID",
      sortBy: { timestamp: 1 },
      output: {
        consumedKilowattHours: {
          $integral: { input: "$powerKilowatts", unit: "hour" },
          window: { range: [-1, "current"], unit: "hour" }
        }
      }
  } }
];
```

Building hourly summary:

```javascript
var pipelineBuildingsSummary = [
  { $setWindowFields: {
      partitionBy: "$deviceID",
      sortBy: { timestamp: 1 },
      output: {
        consumedKilowattHours: {
          $integral: { input: "$powerKilowatts", unit: "hour" },
          window: { range: [-1, "current"], unit: "hour" }
        }
      }
  } },
  { $sort: { deviceID: 1, timestamp: 1 } },
  { $group: {
      _id: {
        deviceID: "$deviceID",
        date: { $dateTrunc: { date: "$timestamp", unit: "hour" } }
      },
      buildingID: { $last: "$buildingID" },
      consumedKilowattHours: { $last: "$consumedKilowattHours" }
  } },
  { $group: {
      _id: {
        buildingID: "$buildingID",
        dayHour: { $dateToString: { format: "%Y-%m-%d  %H", date: "$_id.date" } }
      },
      consumedKilowattHours: { $sum: "$consumedKilowattHours" }
  } },
  { $sort: { "_id.buildingID": 1, "_id.dayHour": 1 } },
  { $set: {
      buildingID: "$_id.buildingID",
      dayHour: "$_id.dayHour",
      _id: "$$REMOVE"
  } }
];
```

## Execution

Run aggregations and view explain plans:

```javascript
db.device_readings.aggregate(pipelineRawReadings);
db.device_readings.explain("executionStats").aggregate(pipelineRawReadings);
db.device_readings.aggregate(pipelineBuildingsSummary);
db.device_readings.explain("executionStats").aggregate(pipelineBuildingsSummary);
```

## Expected Results

Per-unit pipeline returns documents with fields: `deviceID`, `buildingID`, `timestamp`, `powerKilowatts`, `consumedKilowattHours` (e.g., 0, 4, 8.25, 8.5,...). 

Building summary returns documents like:

```javascript
[
  { buildingID: 'Building-ABC', dayHour: '2021-07-03  11', consumedKilowattHours: 8 },
  { buildingID: 'Building-ABC', dayHour: '2021-07-03  12', consumedKilowattHours: 17.25 },
  // ...
]
```

## Key Observations

- The `$integral` operator approximates area using the trapezoidal rule.
- The window range `[-1, "current"]` covers 1 hour of prior readings.
- Specifying `unit: "hour"` in `$integral` returns kWh; using "minute" would yield kilowatt-minutes.
- A time series collection is optional but enhances performance on large datasets.
- An index on `{deviceID, timestamp}` optimizes `partitionBy` and `sortBy` in `$setWindowFields`.

---
page_url: https://www.practical-mongodb-aggregations.com/examples/time-series/state-change-boundaries
---
# State Change Boundaries

**Minimum Version:** MongoDB 5.0 (uses time series collections, `$setWindowFields`, `$shift`)

The example monitors device states (e.g. heaters, fans) and condenses multiple on/off readings into state boundaries with start and end timestamps.

## Sample Data

```javascript
db = db.getSiblingDB("book-state-change-boundaries");
db.dropDatabase();
db.createCollection("device_status", {
  "timeseries": { "timeField": "timestamp", "metaField": "deviceID", "granularity": "minutes" }
});
db.device_status.createIndex({"deviceID": 1, "timestamp": 1});
db.device_status.insertMany(
  {
    "deviceID": "HEATER-111", "timestamp": ISODate("2021-07-03T11:09:00Z"), "state": "on",
  },
  {
    "deviceID": "FAN-999", "timestamp": ISODate("2021-07-03T11:09:00Z"), "state": "on",
  },
  {
    "deviceID": "HEATER-111", "timestamp": ISODate("2021-07-03T11:19:00Z"), "state": "on",
  },
  {
    "deviceID": "HEATER-111", "timestamp": ISODate("2021-07-03T11:29:00Z"), "state": "on",
  },
  {
    "deviceID": "FAN-999", "timestamp": ISODate("2021-07-03T11:39:00Z"), "state": "off",
  },
  {
    "deviceID": "HEATER-111", "timestamp": ISODate("2021-07-03T11:39:00Z"), "state": "off",
  },
  {
    "deviceID": "HEATER-111", "timestamp": ISODate("2021-07-03T11:49:00Z"), "state": "off",
  },
  {
    "deviceID": "HEATER-111", "timestamp": ISODate("2021-07-03T11:59:00Z"), "state": "on",
  },
  {
    "deviceID": "DEHUMIDIFIER-555", "timestamp": ISODate("2021-07-03T11:29:00Z"), "state": "on",
  }
);
```

## Aggregation Pipeline

```javascript
var pipeline = [
  {
    "$setWindowFields": {
      "partitionBy": "$deviceID",
      "sortBy": {"timestamp": 1},
      "output": {
        "previousState": {"$shift": {"output": "$state", "by": -1}},
        "nextState": {"$shift": {"output": "$state", "by": 1}}
      }
    }
  },
  {
    "$set": {
      "startTimestamp" : {
        "$cond": [ {"$eq": ["$state", "$previousState"]}, "$$REMOVE", "$timestamp" ]
      },
      "endMarkerDate" : {
        "$cond": [ {"$eq": ["$state", "$nextState"]}, "$$REMOVE", "$timestamp" ]
      }
    }
  },
  {
    "$match": { "$expr": { "$or": [ {"$ne": ["$state", "$previousState"]}, {"$ne": ["$state", "$nextState"]} ] } }
  },
  {
    "$setWindowFields": {
      "partitionBy": "$deviceID",
      "sortBy": {"timestamp": 1},
      "output": {
        "nextMarkerDate": {"$shift": {"output": "$timestamp", "by": 1}}
      }
    }
  },
  {
    "$match": { "$expr": { "$ne": ["$state", "$previousState"] } }
  },
  {
    "$set": {
      "endTimestamp" : {
        "$switch": {
          "branches": [
            { "case": {"$eq": [{"$type": "$nextMarkerDate"}, "null"]}, "then": null },
            { "case": {"$ne": [{"$type": "$endMarkerDate"}, "missing"]}, "then": "$endMarkerDate" }
          ],
          "default": "$nextMarkerDate"
        }
      }
    }
  },
  {"$unset": ["_id", "timestamp", "previousState", "nextState", "endMarkerDate", "nextMarkerDate"]}
];
```

## Execution

```javascript
db.device_status.aggregate(pipeline);
db.device_status.explain("executionStats").aggregate(pipeline);
```

## Expected Results

```javascript
[
  { deviceID: 'DEHUMIDIFIER-555', state: 'on', startTimestamp: ISODate("2021-07-03T11:29:00.000Z"), endTimestamp: null },
  { deviceID: 'FAN-999', state: 'on', startTimestamp: ISODate("2021-07-03T11:09:00.000Z"), endTimestamp: ISODate("2021-07-03T11:09:00.000Z") },
  { deviceID: 'FAN-999', state: 'off', startTimestamp: ISODate("2021-07-03T11:39:00.000Z"), endTimestamp: null },
  { deviceID: 'HEATER-111', state: 'on', startTimestamp: ISODate("2021-07-03T11:09:00.000Z"), endTimestamp: ISODate("2021-07-03T11:29:00.000Z") },
  { deviceID: 'HEATER-111', state: 'off', startTimestamp: ISODate("2021-07-03T11:39:00.000Z"), endTimestamp: ISODate("2021-07-03T11:49:00.000Z") },
  { deviceID: 'HEATER-111', state: 'on', startTimestamp: ISODate("2021-07-03T11:59:00.000Z"), endTimestamp: null }
]
```

## Observations

- **Null End Timestamps:** The final record per device has `endTimestamp` as null.
- **Windowing with $shift:** The pipeline uses `$setWindowFields` with `$shift` to access preceding and following document states for detecting state transitions.
- **Dual Windowing:** An initial window stage marks changes and a second condenses start/end pairs.
- **Time Series & Indexes:** Using time series collections and a compound index on `{deviceID, timestamp}` improves performance by avoiding in-memory sorts.

---
page_url: https://www.practical-mongodb-aggregations.com/examples/array-manipulations/array-manipulations
---
# Array Manipulation Examples

Manipulate array fields via expressions (no unwind/re-group). Read the Advanced Use Of Expressions For Array Processing chapter first.

---
page_url: https://www.practical-mongodb-aggregations.com/examples/array-manipulations/array-high-low-avg
---
# Summarising Arrays For First, Last, Minimum, Maximum & Average Values

**MongoDB 4.4+ is required** (due to the `$first` and `$last` operators).

Generate daily summaries (open, close, low, high, average) for currency exchange rates from an hourly array.

## Sample Data & Pipeline

Populate the database:

```javascript
db = db.getSiblingDB("book-array-high-low-avg");
db.dropDatabase();
db.currency_pair_values.insertMany([
  {
    "currencyPair": "USD/GBP",
    "day": ISODate("2021-07-05T00:00:00.000Z"),
    "hour_values": [
      NumberDecimal("0.71903411"), NumberDecimal("0.72741832"), /* ... */, NumberDecimal("0.74998835")
    ]
  },
  {
    "currencyPair": "EUR/GBP",
    "day": ISODate("2021-07-05T00:00:00.000Z"),
    "hour_values": [
      NumberDecimal("0.86739394"), NumberDecimal("0.86763782"), /* ... */, NumberDecimal("0.84811122")
    ]
  }
]);
```

Aggregation pipeline:

```javascript
var pipeline = [
  {"$set": {
    "summary.open": {"$first": "$hour_values"},
    "summary.low": {"$min": "$hour_values"},
    "summary.high": {"$max": "$hour_values"},
    "summary.close": {"$last": "$hour_values"},
    "summary.average": {"$avg": "$hour_values"}
  }},
  {"$unset": ["_id", "hour_values"]}
];
```

Execute the aggregation and view the explain plan:

```javascript
db.currency_pair_values.aggregate(pipeline);
db.currency_pair_values.explain("executionStats").aggregate(pipeline);
```

Expected output: Documents per currency pair with `day`, `currencyPair`, and a `summary` containing the open, low, high, close, and average rates.

For MongoDB versions earlier than 4.4, use `$arrayElemAt` instead:

```javascript
"summary.open": {"$arrayElemAt": ["$hour_values", 0]},
"summary.close": {"$arrayElemAt": ["$hour_values", -1]}
```

---
page_url: https://www.practical-mongodb-aggregations.com/examples/array-manipulations/pivot-array-items
---
# Pivot Array Items By A Key

Minimum MongoDB Version: 4.2

## Scenario
Group unordered weather station sensor readings by device for easier dashboard consumption.

## Sample Data Population
```javascript
db = db.getSiblingDB("book-pivot-array-by-key");
db.dropDatabase();

db.weather_measurements.insertMany(
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
      {"device": "ABCD-Device-789", "pressureMBar": 1003}
    ]
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
      {"device": "ABCD-Device-789", "humidityPercent": 34}
    ]
  }
);
```

## Aggregation Pipeline
```javascript
var pipeline = [
  {"$set": {
    "readings_device_summary": {
      "$map": {
        "input": {"$setUnion": "$readings.device"},
        "as": "device",
        "in": {
          "$mergeObjects": {
            "$filter": {
              "input": "$readings",
              "as": "reading",
              "cond": {"$eq": ["$$reading.device", "$$device"]}
            }
          }
        }
      }
    }
  }},
  {"$unset": ["_id", "readings"]}
];
```

## Execution
```javascript
db.weather_measurements.aggregate(pipeline);
db.weather_measurements.explain("executionStats").aggregate(pipeline);
```

## Expected Results
Documents include a new readings_device_summary array with one object per device, merging duplicate measurement keys (last value wins).

## Observations
The pipeline uses $setUnion to list unique devices, $filter to select matching readings, and $mergeObjects to combine them. Consider better data models (bucketing or time series collections in MongoDB 5.0+) for optimal performance.

---
page_url: https://www.practical-mongodb-aggregations.com/examples/array-manipulations/array-sort-percentiles
---
# Array Sorting & Percentiles

**Minimum MongoDB Version:** 4.2

**Scenario:**  
Analyze performance test runs where each document’s response times array is processed to compute the median (50th percentile) and 90th percentile. Return only those with a 90th percentile > 100 ms.  
• For MongoDB ≤5.1, use custom functions to sort arrays inline.  
• For MongoDB 5.2+, use the new `$sortArray` operator.  
• MongoDB 7.0 adds `$median` and `$percentile` for simpler pipelines.

## Sample Data Population

```javascript
db = db.getSiblingDB("book-array-sort-percentiles");
db.dropDatabase();

db.performance_test_results.insertMany(
  { "testRun": 1, "datetime": ISODate("2021-08-01T22:51:27.638Z"), "responseTimesMillis": [62,97,59,104,97,71,62,115,82,87] },
  { "testRun": 2, "datetime": ISODate("2021-08-01T22:56:32.272Z"), "responseTimesMillis": [34,63,51,104,87,63,64,86,105,51,73,78,59,108,65,58,69,106,87,93,65] },
  { "testRun": 3, "datetime": ISODate("2021-08-01T23:01:08.908Z"), "responseTimesMillis": [56,72,83,95,107,83,85] },
  { "testRun": 4, "datetime": ISODate("2021-08-01T23:17:33.526Z"), "responseTimesMillis": [78,67,107,110] },
  { "testRun": 5, "datetime": ISODate("2021-08-01T23:24:39.998Z"), "responseTimesMillis": [75,91,75,87,99,88,55,72,99,102] },
  { "testRun": 6, "datetime": ISODate("2021-08-01T23:27:52.272Z"), "responseTimesMillis": [88,89] },
  { "testRun": 7, "datetime": ISODate("2021-08-01T23:31:59.917Z"), "responseTimesMillis": [101] }
);
```

## Custom Functions (MongoDB ≤5.1)

### sortArray()

Sorts an array of primitives using a `$reduce` expression.

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
                  {"$cond": [ 
                    {"$eq": [0, "$$targetArrayPosition"]}, 
                    [],
                    {"$slice": ["$$resultArray", 0, "$$targetArrayPosition"]}
                  ]},
                  ["$$currentSourceArrayElement"],
                  {"$cond": [ 
                    {"$gt": [{"$size": "$$resultArray"}, 0]}, 
                    {"$slice": ["$$resultArray", "$$targetArrayPosition", {"$size": "$$resultArray"}]},
                    []
                  ]}
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

### arrayElemAtPercentile()

Retrieves the element at the nth percentile from a sorted array.

```javascript
function arrayElemAtPercentile(sourceArrayField, percentile) {
  return {    
    "$let": {
      "vars": {
        "sortedArray": sortArray(sourceArrayField)
        // For MongoDB 5.2+: use 
        // "sortedArray": {"$sortArray": {"input": sourceArrayField, "sortBy": 1}},
      },
      "in": {         
        "$arrayElemAt": [
          "$$sortedArray",
          {"$subtract": [
            {"$ceil": {
              "$multiply": [
                {"$divide": [percentile, 100]},
                {"$size": "$$sortedArray"}
              ]
            }},
            1
          ]}
        ]
      }
    }
  };
}
```

## Aggregation Pipeline

For MongoDB ≤5.1:

```javascript
var pipeline = [
  { "$set": {
      "sortedResponseTimesMillis": sortArray("$responseTimesMillis"),
      // For MongoDB 5.2+: use {"$sortArray": {"input": "$responseTimesMillis", "sortBy": 1}},
      "medianTimeMillis": arrayElemAtPercentile("$responseTimesMillis", 50),
      "ninetiethPercentileTimeMillis": arrayElemAtPercentile("$responseTimesMillis", 90)
  }},
  { "$match": { "ninetiethPercentileTimeMillis": { "$gt": 100 } } },
  { "$unset": ["_id", "datetime", "responseTimesMillis"] }
];
```

For MongoDB 7.0+ (simplified):

```javascript
var pipeline = [
  { "$set": {
      "sortedResponseTimesMillis": { "$sortArray": { "input": "$responseTimesMillis", "sortBy": 1 } },
      "medianTimeMillis": { "$median": { "input": "$responseTimesMillis", "method": "approximate" } },
      "ninetiethPercentileTimeMillis": { "$first": { "$percentile": { "input": "$responseTimesMillis", "p": [0.90], "method": "approximate" } } }
  }},
  { "$match": { "ninetiethPercentileTimeMillis": { "$gt": 100 } } }
];
```

## Execution

```javascript
db.performance_test_results.aggregate(pipeline);
db.performance_test_results.explain("executionStats").aggregate(pipeline);
```

## Expected Results

Five documents will be returned containing:  
• testRun  
• sortedResponseTimesMillis (sorted array)  
• medianTimeMillis  
• ninetiethPercentileTimeMillis  

## Observations

- The custom functions (`sortArray()` and `arrayElemAtPercentile()`) act as macros that embed boilerplate code into the pipeline.  
- They work for arrays with primitive values; use `$sortArray` for richer types and performance improvements in MongoDB 5.2+.  
- MongoDB 7.0’s new operators simplify the pipeline by removing the need for custom macros.

---
page_url: https://www.practical-mongodb-aggregations.com/examples/array-manipulations/array-element-grouping
---
# Array Element Grouping

__MongoDB Version: 4.2__

This example shows how to generate reports for an online game where each user's "coin" rewards (stored as an array of objects) are grouped by coin type to display counts and totals, without knowing coin types in advance.

## Sample Data

```javascript
db = db.getSiblingDB("book-array-element-grouping");
db.dropDatabase();
db.user_rewards.insertMany(
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
      {"coin": "platinum", "amount": 5, "date": ISODate("2022-11-19T15:02:53Z")}
    ],
  }
);
```

## Macro Functions

These functions generate expressions to group an array field's elements.

```javascript
function arrayGroupByCount(arraySubdocField, groupByKeyField) {
  return {
    "$map": {
      "input": {
        "$setUnion": {
          "$map": { "input": `$${arraySubdocField}`, "in": `$$this.${groupByKeyField}` }
        }
      },
      "as": "key",
      "in": {
        "id": "$$key",
        "count": {
          "$size": {
            "$filter": {
              "input": `$${arraySubdocField}`,
              "cond": { "$eq": [`$$this.${groupByKeyField}`, "$$key"] }
            }
          }
        }
      }
    }
  };
}
```

```javascript
function arrayGroupBySum(arraySubdocField, groupByKeyField, groupByValueField) {
  return {
    "$map": {
      "input": {
        "$setUnion": {
          "$map": { "input": `$${arraySubdocField}`, "in": `$$this.${groupByKeyField}` }
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

## Aggregation Pipeline

This pipeline sets new fields for counts and totals, and removes unwanted fields.

```javascript
var pipeline = [
  { "$set": {
      "coinTypeAwardedCounts": arrayGroupByCount("rewards", "coin"),
      "coinTypeTotals": arrayGroupBySum("rewards", "coin", "amount"),
      "_id": "$$REMOVE",
      "rewards": "$$REMOVE"
    }
  }
];
```

## Execution

Run the aggregation and get its explain plan:

```javascript
db.user_rewards.aggregate(pipeline);
db.user_rewards.explain("executionStats").aggregate(pipeline);
```

## Expected Output

Each document represents a user with grouped counts and totals. For example:

```javascript
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
}
```

## Notes

- The macro functions are reusable for any grouping of array elements.
- They avoid unwinding the array, which can be resource-intensive.
- The use of JavaScript Template Literals (e.g. `` `$${arraySubdocField}` ``) ensures the field name is correctly replaced (e.g. "$rewards") before pipeline execution.

---
page_url: https://www.practical-mongodb-aggregations.com/examples/array-manipulations/array-fields-joining
---
# Array Fields Joining

**Minimum MongoDB Version:** 4.2

In this example for a dating website, each user document stores hobbies (with descriptions) and moodFavourites mapping moods (e.g., "happy", "sad") to hobby keys.

### Sample Data

```javascript
db = db.getSiblingDB("book-array-fields-joining");
db.dropDatabase();

db.users.insertMany(
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
      "cooking": "Trying out new recipes"
    },
    "moodFavourites": {
      "sad": ["music"],
      "happy": ["sports"],
      "chilling": ["music", "cooking"]
    }
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
      "cinema": "Watching classic movies"
    },
    "moodFavourites": {
      "happy": ["gardening", "cycling"],
      "sad": ["knitting"]
    }
  }
);
```

### Macro Function

Retrieves values from sub-document fields by runtime names:

```javascript
function getValuesOfNamedFieldsAsArray(obj, fieldnames) {
  return {
    "$map": { 
      "input": {
        "$filter": { 
          "input": {"$objectToArray": obj}, 
          "as": "currElem",
          "cond": {"$in": ["$$currElem.k", fieldnames]}
        }
      }, 
      "in": "$$this.v" 
    }
  };
}
```

### Aggregation Pipeline

Creates a new field, moodActivities, by joining hobbies with moodFavourites:

```javascript
var pipeline = [
  { "$set": {
      "moodActivities": {      
        "$arrayToObject": {
          "$map": { 
            "input": {"$objectToArray": "$moodFavourites"},
            "in": {              
              "k": "$$this.k",
              "v": getValuesOfNamedFieldsAsArray("$hobbies", "$$this.v")
            }
          }
        }
      }
  }},
  { "$unset": ["_id", "hobbies", "moodFavourites"] }
];
```

### Execution

Run the aggregation and view its explain plan:

```javascript
db.users.aggregate(pipeline);
db.users.explain("executionStats").aggregate(pipeline);
```

### Expected Outcome

Documents are returned with a moodActivities field mapping moods to arrays of hobby descriptions. This approach joins two fields per document without unwinding arrays and uses a reusable macro function for similar aggregations.

---
page_url: https://www.practical-mongodb-aggregations.com/examples/array-manipulations/comparison-of-two-arrays
---
# Comparison Of Two Arrays

**Minimum Version:** MongoDB 4.4

## Scenario  
Generate a report showing configuration changes between two snapshots (e.g. "Production", "QA") of virtual machine deployments.

## Sample Data  
Drop existing DB and insert deployments:

```javascript
db = db.getSiblingDB("book-comparison-of-two-arrays");
db.dropDatabase();

db.deployments.insertMany([
  {
    "name": "ProdServer",
    "beforeTimestamp": ISODate("2022-01-01T00:00:00Z"),
    "afterTimestamp": ISODate("2022-01-02T00:00:00Z"),
    "beforeConfig": { "vcpus": 8, "ram": 128, "storage": 512, "state": "running" },
    "afterConfig": { "vcpus": 16, "ram": 256, "storage": 512, "state": "running" }
  },
  {
    "name": "QAServer",
    "beforeTimestamp": ISODate("2022-01-01T00:00:00Z"),
    "afterTimestamp": ISODate("2022-01-02T00:00:00Z"),
    "beforeConfig": { "vcpus": 4, "ram": 64, "storage": 512, "state": "paused" },
    "afterConfig": { "vcpus": 4, "ram": 64, "storage": 256, "state": "running", "extraParams": "disableTLS;disableCerts;" }
  },
  {
    "name": "LoadTestServer",
    "beforeTimestamp": ISODate("2022-01-01T00:00:00Z"),
    "beforeConfig": { "vcpus": 8, "ram": 128, "storage": 256, "state": "running" }
  },
  {
    "name": "IntegrationServer",
    "beforeTimestamp": ISODate("2022-01-01T00:00:00Z"),
    "afterTimestamp": ISODate("2022-01-02T00:00:00Z"),
    "beforeConfig": { "vcpus": 4, "ram": 32, "storage": 64, "state": "running" },
    "afterConfig": { "vcpus": 4, "ram": 32, "storage": 64, "state": "running" }
  },
  {
    "name": "DevServer",
    "afterTimestamp": ISODate("2022-01-02T00:00:00Z"),
    "afterConfig": { "vcpus": 2, "ram": 16, "storage": 64, "state": "running" }
  }
]);
```

## Macro Functions  
Generate expression to get unique keys from two sub-documents and to extract a dynamic field:

```javascript
function getArrayOfTwoSubdocsKeysNoDups(firstArrayRef, secondArrayRef) {
  return {
    "$setUnion": {
      "$concatArrays": [
        {"$map": { "input": {"$objectToArray": firstArrayRef}, "in": "$$this.k" }},
        {"$map": { "input": {"$objectToArray": secondArrayRef}, "in": "$$this.k" }}
      ]
    }
  };
}

function getDynamicField(obj, fieldname) {
  return {
    "$first": [ 
      {"$map": { 
        "input": { "$filter": { 
          "input": {"$objectToArray": obj}, 
          "as": "currObj",
          "cond": {"$eq": ["$$currObj.k", fieldname]},
          "limit": 1 
        }}, 
        "in": "$$this.v" 
      }}
    ]
  };
}
```

## Aggregation Pipeline  
Compare beforeConfig and afterConfig, capture differences and set a status:

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
              "if": {"$ne": [ getDynamicField("$beforeConfig", "$$this"), getDynamicField("$afterConfig", "$$this") ]},
              "then": [{
                "field": "$$this",
                "change": {
                  "$concat": [
                    {"$ifNull": [{"$toString": getDynamicField("$beforeConfig", "$$this")}, "<not-set>"]},
                    " --> ",
                    {"$ifNull": [{"$toString": getDynamicField("$afterConfig", "$$this")}, "<not-set>"]}
                  ]
                }
              }],
              "else": []
            }}
          ]
        }
      }
    }
  }},
  {"$set": {
    "status": {
      "$switch": {        
        "branches": [
          {"case": {"$and": [
              {"$in": [{"$type": "$differences"}, ["missing", "null"]]},
              {"$in": [{"$type": "$beforeConfig"}, ["missing", "null"]]}
            ]}, "then": "ADDED"},
          {"case": {"$and": [
              {"$in": [{"$type": "$differences"}, ["missing", "null"]]},
              {"$in": [{"$type": "$afterConfig"}, ["missing", "null"]]}
            ]}, "then": "REMOVED"},
          {"case": {"$lte": [{"$size": "$differences"}, 0]}, "then": "UNCHANGED"},
          {"case": {"$gt": [{"$size": "$differences"}, 0]}, "then": "MODIFIED"}
        ],
        "default": "UNKNOWN"
      }
    },
    "differences": {
      "$cond": [
        {"$or": [
          {"$in": [{"$type": "$differences"}, ["missing", "null"]]},
          {"$lte": [{"$size": "$differences"}, 0]}
        ]},
        "$$REMOVE", 
        "$differences"
      ]
    }
  }},
  {"$unset": ["_id", "beforeTimestamp", "afterTimestamp", "beforeConfig", "afterConfig"]}
];
```

## Execution  
Run the aggregation and view its explain plan:

```javascript
db.deployments.aggregate(pipeline);
db.deployments.explain("executionStats").aggregate(pipeline);
```

## Expected Results  
Documents indicate each deployment’s status and changes (if any). For example:

```javascript
[
  {
    "name": "ProdServer",
    "status": "MODIFIED",
    "differences": [
      { "field": "vcpus", "change": "8 --> 16" },
      { "field": "ram", "change": "128 --> 256" }
    ]
  },
  {
    "name": "QAServer",
    "status": "MODIFIED",
    "differences": [
      { "field": "storage", "change": "512 --> 256" },
      { "field": "state", "change": "paused --> running" },
      { "field": "extraParams", "change": "<not-set> --> disableTLS;disableCerts;" }
    ]
  },
  { "name": "LoadTestServer", "status": "REMOVED" },
  { "name": "IntegrationServer", "status": "UNCHANGED" },
  { "name": "DevServer", "status": "ADDED" }
]
```

## Observations  
- **Reusable Macros:** The helper functions are reusable for other array manipulation tasks.  
- **Sub-Document Comparison:** Only top-level primitive fields are compared; arrays/objects are not supported.  
- **Real-World Use:** If configuration snapshots exist in separate records, add stages like `$sort` and `$group` (using `$first` and `$last` for beforeConfig/afterConfig) before applying the provided pipeline.

---
page_url: https://www.practical-mongodb-aggregations.com/appendices/cheatsheet
---
# Stages Cheatsheet

**Categories:**

| Query             | Mutate                 | Summarise/Itemise       | Join           | Input/Output  |
|-------------------|------------------------|-------------------------|----------------|---------------|
| `$geoNear`        | `$addFields`           | `$bucket`               | `$graphLookup` | `$documents`  |
| `$limit`          | `$densify`             | `$bucketAuto`           | `$lookup`      | `$merge`      |
| `$match`          | `$fill`                | `$count`                | `$unionWith`   | `$out`        |
| `$sample`         | `$project`             | `$facet`                |                |               |
| `$search`         | `$redact`              | `$group`                |                |               |
| `$searchMeta`     | `$replaceRoot`         | `$sortByCount`          |                |               |
| `$skip`           | `$replaceWith`         | `$unwind`               |                |               |
| `$sort`           | `$set`                 |                         |                |               |
|                   | `$setWindowFields`     |                         |                |               |
|                   | `$unset`               |                         |                |               |

> Excluded stages: `$changeStream`, `$collStats`, etc.

---

## Input Collections

```javascript
// shapes
{_id:"◐", x:"■", y:"▲", val:10, ord:0}
{_id:"◑", x:"■", y:"■", val:60}
{_id:"◒", x:"●", y:"■", val:80}
{_id:"◓", x:"▲", y:"▲", val:85}
{_id:"◔", x:"■", y:"▲", val:90}
{_id:"◕", x:"●", y:"■", val:95, ord:100}

// lists
{_id:"▤", a:"●", b:["◰","◱"]}
{_id:"▥", a:"▲", b:["◲"]}
{_id:"▦", a:"▲", b:["◰","◳","◱"]}
{_id:"▧", a:"●", b:["◰"]}
{_id:"▨", a:"■", b:["◳","◱"]}

// places
{_id:"Bigtown", loc:{type:"Point", coordinates:[1,1]}}
{_id:"Smalltown", loc:{type:"Point", coordinates:[3,3]}}
{_id:"Happytown", loc:{type:"Point", coordinates:[5,5]}}
{_id:"Sadtown", loc:{type:"LineString", coordinates:[[7,7],[8,8]]}}
```

---

## `$addFields`

```javascript
// Input: shapes
$addFields: {z:"●"}
// Output:
{_id:"◐", x:"■", y:"▲", val:10, ord:0, z:"●"}
...
```

---

## `$bucket`

```javascript
$bucket: {
  groupBy:"$val",
  boundaries:[0,25,50,75,100],
  default:"Other"
}
// Output:
{_id:0,count:1}
{_id:50,count:1}
{_id:75,count:4}
```

---

## `$bucketAuto`

```javascript
$bucketAuto: {groupBy:"$val", buckets:3}
// Output:
{_id:{min:10, max:80}, count:2}
{_id:{min:80, max:90}, count:2}
{_id:{min:90, max:95}, count:2}
```

---

## `$count`

```javascript
$count:"amount"
// Output:
{amount:6}
```

---

## `$densify`

```javascript
$densify: {
  field:"val",
  partitionByFields:"x",
  range:{bounds:"full", step:25}
}
// Inserts missing documents with interpolated values.
```

---

## `$documents`

```javascript
$documents: [
  {p:"▭", q:"▯"},
  {p:"▯", q:"▭"}
]
// Output as given.
```

---

## `$facet`

```javascript
$facet: {
  X_CIRCLE_FACET: [{$match:{x:"●"}}],
  FIRST_TWO_FACET: [{$limit:2}]
}
// Output: two facets with matching and limited data.
```

---

## `$fill`

```javascript
$fill: {
  sortBy:{val:1},
  output:{ord:{method:"linear"}}
}
// Output: fills missing 'ord' values.
```

---

## `$geoNear`

```javascript
$geoNear: {
  near:{type:"Point", coordinates:[9,9]},
  distanceField:"distance"
}
// Output: docs sorted by proximity with computed distance.
```

---

## `$graphLookup`

```javascript
$graphLookup: {
  from:"shapes",
  startWith:"$x",
  connectFromField:"x",
  connectToField:"y",
  depthField:"depth",
  as:"connections"
}
$project: {connections_count: {$size:"$connections"}}
// Output: counts of connected docs.
```

---

## `$group`

```javascript
$group: {_id:"$x", ylist: {$push:"$y"}}
// Output: groups by x with list of y values.
```

---

## `$limit`

```javascript
$limit: 2
// Output: first 2 documents.
```

---

## `$lookup`

```javascript
$lookup: {
  from:"lists",
  localField:"y",
  foreignField:"a",
  as:"refs"
}
// Output: each shape doc now has matching list docs.
```

---

## `$match`

```javascript
$match: {y:"▲"}
// Output: Only documents with y equal to "▲".
```

---

## `$merge`

```javascript
$merge: {into:"results"}
// Merges aggregation output into "results" collection.
```

---

## `$out`

```javascript
$out: "results"
// Writes aggregation output to "results" collection.
```

---

## `$project`

```javascript
$project: {x:1}
// Output: only the field x (plus _id).
```

---

## `$redact`

```javascript
$redact: {
  $cond: {
    if: {$eq:["$type","LineString"]},
    then:"$$PRUNE",
    else:"$$DESCEND"
  }
}
// Removes docs with LineString type.
```

---

## `$replaceRoot`

```javascript
$replaceRoot: {
  newRoot: {first: {$first:"$b"}, last: {$last:"$b"}}
}
// Output: new root with first and last elements of array b.
```

---

## `$replaceWith`

```javascript
$replaceWith: {
  first: {$first:"$b"}, last: {$last:"$b"}
}
// Same as $replaceRoot.
```

---

## `$sample`

```javascript
$sample: {size:3}
// Output: Random sample of 3 docs.
```

---

## `$search`

```javascript
$search: {
  text: {
    path:"_id",
    query:"Bigtown Happytown"
  }
}
// Output: docs matching the query.
```

---

## `$searchMeta`

```javascript
$searchMeta: {
  facet: {
    operator: {exists:{path:"_id"}},
    facets: {
      geotypes: {type:"string", path:"loc.type", numBuckets:2}
    }
  }
}
// Output: meta count and buckets by loc.type.
```

---

## `$set`

```javascript
$set: {y:"▲"}
// Sets y to "▲" for all documents.
```

---

## `$setWindowFields`

```javascript
$setWindowFields: {
  partitionBy:"$x",
  sortBy: {_id:1},
  output: {
    cumulativeValShapeX: {
      $sum:"$val",
      window:{documents:["unbounded","current"]}
    }
  }
}
// Output: cumulative sum by partition.
```

---

## `$skip`

```javascript
$skip: 5
// Output: skips first 5 docs.
```

---

## `$sort`

```javascript
$sort: {x:1, y:1}
// Output: docs sorted by x then y.
```

---

## `$sortByCount`

```javascript
$sortByCount: "$x"
// Output: count and sort docs grouped by x.
```

---

## `$unionWith`

```javascript
$unionWith: {coll:"lists"}
// Output: union of shapes and lists.
```

---

## `$unset`

```javascript
$unset: "x"
// Output: removes field x from each doc.
```

---

## `$unwind`

```javascript
$unwind: {path:"$b"}
// Output: splits array field b into individual documents.
```

