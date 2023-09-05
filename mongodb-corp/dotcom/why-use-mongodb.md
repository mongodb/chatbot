---
title: Why Use MongoDB and When to Use It?
url: https://www.mongodb.com/why-use-mongodb
metadata:
  tags:
    - Get Started
    - Document Model
    - Scalability
    - Developer Experience
    - Maturity
---

# Why Use MongoDB and When to Use It?

You can learn more about why to use MongoDB in this article or try it right away with MongoDB Atlas, the database-as-a-service offering by MongoDB.

MongoDB is a document database used to build highly available and scalable internet applications. With its flexible schema approach, it’s popular with development teams using agile methodologies. Offering drivers for all major programming languages, MongoDB allows you to immediately start building your application without spending time configuring a database.

## What is MongoDB?

MongoDB is an open-source document database built on a horizontal scale-out architecture that uses a flexible schema for storing data. Founded in 2007, MongoDB has a worldwide following in the developer community.

Instead of storing data in tables of rows or columns like SQL databases, each record in a MongoDB database is a document described in BSON, a binary representation of the data. Applications can then retrieve this information in a JSON format.

Here’s a simple JSON document describing a historical figure.

```json
{
  "_id": 1,
  "name": {
    "first": "Ada",
    "last": "Lovelace"
  },
  "title": "The First Programmer",
  "interests": ["mathematics", "programming"]
}
```

Document databases are highly flexible, allowing variations in the structure of documents and storing documents that are partially complete. One document can have others [embedded](https://docs.mongodb.com/manual/tutorial/model-embedded-one-to-many-relationships-between-documents/) in it. Fields in a document play the role of columns in a SQL database, and like columns, they can be [indexed](https://www.mongodb.com/blog/post/performance-best-practices-indexing) to increase search performance.

From its founding, MongoDB was built on a scale-out architecture, a structure that allows many [small machines to work together](https://www.mongodb.com/basics/clusters/mongodb-cluster-setup) to create fast systems and handle huge amounts of data.

MongoDB has always focused on providing developers with an excellent user experience, which, in addition to all its other properties, has made MongoDB a favorite of developers worldwide for a wide variety of applications.

## Why Use MongoDB?

MongoDB is built on a [scale-out architecture](https://www.mongodb.com/basics/scaling) that has become popular with developers of all kinds for developing scalable applications with evolving data schemas.

As a document database, MongoDB makes it easy for developers to store structured or unstructured data. It uses a [JSON-like](https://www.mongodb.com/json-and-bson) format to store documents. This format directly maps to native objects in most modern [programming languages](https://www.mongodb.com/languages), making it a natural choice for developers, as they don’t need to think about [normalizing data](https://www.mongodb.com/basics/data-models). MongoDB can also handle high volume and can scale both vertically or horizontally to accommodate large data loads.

MongoDB was built for people building internet and business applications who need to evolve quickly and scale elegantly. Companies and development teams of all sizes use MongoDB for a wide variety of reasons.

### Document Model

The [document](https://www.mongodb.com/document-databases) data model is a powerful way to store and retrieve data in any modern programming language, allowing developers to move quickly.

### Deployment Options

MongoDB is available in any major public cloud (such as [AWS](https://www.mongodb.com/mongodb-on-aws), [Azure](https://www.mongodb.com/mongodb-on-azure), and [Google Cloud](https://www.mongodb.com/cloud/atlas/mongodb-google-cloud)) through [MongoDB Atlas](https://www.mongodb.com/cloud/atlas), in large data centers through the [Enterprise Advanced](https://www.mongodb.com/products/mongodb-enterprise-advanced) edition, or free through the open-source [Community](https://www.mongodb.com/try/download/community) edition.

### Get Started Quickly

MongoDB has a great user experience for developers who can install MongoDB and start [writing code](https://docs.mongodb.com/drivers/) immediately.

### Fully Scalable

MongoDB’s horizontal, [scale-out architecture](https://www.mongodb.com/basics/scaling) can support huge volumes of both data and traffic.

### Find Community

MongoDB has developed a large and mature platform ecosystem. It has a worldwide [community of developers](https://www.mongodb.com/community/forums/) and consultants, making it easy to get help. It also has an [enterprise-grade support](https://www.mongodb.com/products/enterprise-grade-support) offering.

Using MongoDB enables your team to go further and faster when developing software applications that handle data of all sorts in a scalable way.

MongoDB is an excellent choice if you need to: Support rapid iterative development. Enable collaboration of a large number of teams. Scale to high levels of read and write traffic. Scale your data repository to a massive size. Evolve the type of deployment as the business changes. Store, manage, and search data with text, geospatial, or time-series dimensions.

MongoDB as a company has grown because the number of use cases with these characteristics continues to grow.

## What are the Advantages of MongoDB?

MongoDB has become one of the most [wanted databases](https://www.mongodb.com/blog/post/mongodb-the-most-wanted-database-by-developers-for-the-4th-consecutive-year) in the world because it makes it easy for developers to store, manage, and retrieve data when creating applications with most programming languages.

To understand whether MongoDB is right for you, let’s look at the advantages of MongoDB for developers. You can also check out the top five [MongoDB features](https://www.mongodb.com/what-is-mongodb/features).

### The Power of Document-Oriented Databases

MongoDB is the pioneer of what has come to be called [NoSQL](https://www.mongodb.com/nosql-explained) databases, which developed because RDBMS systems based on SQL did not support the scale or rapid development cycles needed for creating modern applications.

NoSQL is an umbrella term; it includes document-oriented databases like MongoDB, columnar databases, in-memory databases, and more.

In MongoDB, records are stored as documents in compressed BSON files. The documents can be retrieved directly in JSON format, which has many benefits:

- It is a natural form to store data.
- It is human-readable.
- Structured and unstructured information can be stored in the same document.
- You can nest JSON to store complex data objects.
- JSON has a flexible and dynamic schema, so adding fields or leaving a field out is not a problem.
- Documents map to objects in most popular programming languages.

Most developers find it easy to work with JSON because it is a simple and powerful way to describe and store data.

Perhaps most importantly, the developer controls the database schema. Developers adjust and reformat the database schema as the application evolves without the help of a database administrator. When needed, MongoDB can coordinate and control changes to the structure of documents using schema validation.

MongoDB created [Binary JSON format (BSON)](https://www.mongodb.com/json-and-bson) to support more data types than JSON. This new format allows for faster parsing of the data. Data stored in BSON can be searched and indexed, tremendously increasing performance. MongoDB supports a wide variety of indexing methods, including text, decimal, geospatial, and partial.

### Developer User Experience

MongoDB has always devoted abundant time and energy to making sure developers have a great experience. Developers appreciate that MongoDB has made sure the database can be used from various programming languages, including [C](https://www.mongodb.com/docs/drivers/c/), [C# and .NET](https://www.mongodb.com/docs/drivers/csharp/current/), [C++](https://www.mongodb.com/docs/drivers/cxx/), [Go](https://www.mongodb.com/docs/drivers/go/current/), [Java](https://www.mongodb.com/docs/drivers/java-drivers/), [JavaScript](https://www.mongodb.com/docs/drivers/node/current/), [PHP](https://www.mongodb.com/docs/drivers/php/), [Python](https://www.mongodb.com/docs/drivers/python/), [Ruby](https://www.mongodb.com/docs/ruby-driver/current/), [Rust](https://www.mongodb.com/docs/drivers/rust/), [Scala](https://www.mongodb.com/docs/drivers/scala/), and [Swift](https://www.mongodb.com/docs/drivers/swift/).

As more and more business users have joined the MongoDB community, features have been added to support the use and operation of MongoDB in enterprise IT departments. MongoDB now also offers first-class support for customers who need it.

With MongoDB Atlas, the database-as-a-service at the center of the MongoDB Cloud, it is easier than ever to use MongoDB. You can provision a cluster with a few clicks from the web interface and start writing code almost immediately.

MongoDB Atlas allows developers to get started right away in any major public cloud and easily migrate on-premise MongoDB instances to the cloud.

MongoDB Atlas also embeds powerful capabilities like:

[MongoDB Atlas Search](https://www.mongodb.com/atlas/search) (powered by the Lucene search engine) to enable full-text search.
[Atlas App Services](https://www.mongodb.com/realm), fully-managed back-end services for building mobile and web apps.
[MongoDB Atlas Data Lake](https://www.mongodb.com/atlas/data-lake), which allows developers to query and combine data stored in Atlas with data stored in Amazon S3 or an HTTPS store.

### Scalability and Transactionality

MongoDB’s scale-out architecture, which distributes work across many smaller (and cheaper) computers, means that you can create an application that will handle spikes in traffic as your business grows.

Engineering innovations by MongoDB support massive numbers of reads and writes. MongoDB’s approach to sharding is at the heart of these innovations, allowing clusters of information to be stored together as the information is spread across the cluster of computers. By comparison, most SQL databases use a scale-up architecture that is limited because it relies on creating faster and more powerful computers.

When modeling data in MongoDB, it is common to embed objects within each other. What used to take multiple transactions to update in traditional relational databases can sometimes be achieved in a single transaction with MongoDB.

If still needed, MongoDB also supports database [transactions](https://docs.mongodb.com/manual/core/transactions/) that allow many changes to a database to be grouped and either made or rejected in a batch.

### Platform and Ecosystem Maturity

MongoDB has been around since 2007 and has been deployed at thousands of companies for a wide range of [use cases](https://www.mongodb.com/use-cases). A natural result of that usage level is that the platform has been extended to meet a massive number of new demands. Most large organizations want to make sure it is easy to get help using any technology that becomes the foundation of their business.

MongoDB has a large and thriving community of developers across the open-source community, academia, and among system integrators and consulting firms across the globe.

## When Should You Use MongoDB?

MongoDB is a general-purpose database used in various ways to support applications in many different [industries](https://www.mongodb.com/industries) (e.g., [telecommunications](https://www.mongodb.com/industries/telecommunications), [gaming](https://www.mongodb.com/use-cases/gaming), [finances](https://www.mongodb.com/industries/financial-services), [healthcare](https://www.mongodb.com/industries/healthcare), and [retail](https://www.mongodb.com/industries/retail)). MongoDB has found a home in many different businesses and functions because it solves long-standing problems in data management and software development. Typical use cases for MongoDB include:

### Integrating large amounts of diverse data

If you are bringing together tens or hundreds of data sources, the flexibility and power of the document model can create a single unified view in ways that other databases cannot. MongoDB has succeeded in bringing such projects to life when approaches using other databases have failed.

### Describing complex data structures that evolve

Document databases allow embedding of documents to describe nested structures and easily tolerate variations in data in generations of documents. Specialized data formats like geospatial are efficiently supported. This results in a resilient repository that doesn’t break or need to be redesigned every time something changes.

### Delivering data in high-performance applications

MongoDB’s scale-out architecture can support huge numbers of transactions on humongous databases. Unlike other databases that either cannot support such scale or can only do so with massive amounts of engineering and additional components, MongoDB has a clear path to scalability because of the way it was designed. MongoDB is scalable out of the box.

### Supporting hybrid and multi-cloud applications

MongoDB can be deployed and run on a desktop, a massive cluster of computers in a data center, or in a public cloud, either as installed software or through MongoDB Atlas, a database-as-a-service product. If you have applications that need to run wherever they make sense, MongoDB supports any configuration now and in the future.

### Supporting agile development and collaboration

Document databases put developers in charge of the data. Data becomes like code that is friendly to developers. This is far different from making developers use a strange system that requires a specialist. Document databases also allow the evolution of the structure of the data as needs are better understood. Collaboration and governance can allow one team to control one part of a document and another team to control another part.

## Summary

MongoDB is a general-purpose database that can provide many benefits to your application development processes. It can help you build applications that are more future-proof with its scaling capabilities and flexible schema. It offers a great developer experience with drivers for most major programming languages and a large community of users. It is also available on any of the major cloud providers.

Why not give it a [try](https://www.mongodb.com/try) right now with MongoDB Atlas? Once you have access to your cluster, you can take a look at [MongoDB University](https://university.mongodb.com/) for an extensive offering of free courses to help you explore the benefits of using MongoDB.

## Ready to get started?

### What's the fastest way to get started using MongoDB?

MongoDB Atlas is a fully-managed database as a service that runs on all public clouds. It scales from a free tier (no credit card required) to global clusters.

### Can I use MongoDB locally?

Both MongoDB Enterprise Server and MongoDB Community Server can be locally installed and used in a self-managed manner.

You can run either of these editions on your own hardware or in the cloud.

### How do I manage and configure MongoDB?

All of the functionality of MongoDB is available through the CLI, which uses the mongo shell to enter commands and receive output.

To use the mongo shell, you must have a user set up on a MongoDB cluster. Then you install the mongo shell on your computer and connect to the user account on the cluster.

At this point, you are off and running and can enter commands to configure the cluster, create databases, or get information about how the cluster is running.

MongoDB Compass offers a GUI for those who prefer a visual interface. MongoDB Compass provides a way to visualize your data, create indexes, and assemble complex aggregation pipelines that streamline how you work with data.

### What kind of database is MongoDB?

MongoDB falls into the document database category, which is part of the more prominent NoSQL databases family. It stores information as structured or unstructured objects called documents. These documents are grouped in collections.

### What are the features and benefits of using MongoDB?

Using MongoDB can provide many benefits to a software development team. Its flexible schema makes it easy to evolve and store data in a way that is easy for programmers to work with. MongoDB is also built to scale up quickly and supports all the main features of modern databases such as transactions. Additionally, MongoDB has a large community of users that can provide help, and enterprise-level support is available. See When To Use NoSQL Databases to find out more about the benefits of NoSQL databases.

### Who uses MongoDB Atlas?

Thousands of companies like Forbes, Toyota, and Thermo Fisher run their businesses on MongoDB Atlas and use it to handle their most demanding apps in areas like telecommunications, gaming, finances, healthcare, and retail.
