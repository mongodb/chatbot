# Data Sources

The MongoDB Knowledge Service uses [retrieval augmented generation](https://www.mongodb.com/resources/basics/artificial-intelligence/retrieval-augmented-generation) to answer user queries.

All the data sources are public on the web.


## Sources

The Knowledge Service ingests the following data sources:

- MongoDB Technical Documentation (https://mongodb.com/docs)
- MongoDB Developer Center blog (https://mongodb.com/developer)
- MongoDB University transcripts and landing pages (https://learn.mongodb.com)
- Select marketing and sales pages from https://mongodb.com
- Select external data sources:
  - Mongoose.js docs (https://mongoosejs.com)
  - Prisma MongoDB connector docs (https://www.prisma.io/docs/orm/overview/databases/mongodb)
  - Terraform MongoDB Provider docs (https://registry.terraform.io/providers/mongodb/mongodbatlas/latest)
 - WiredTiger docs (https://source.wiredtiger.com/)
 - Practical MongoDB Aggregations book (https://www.practical-mongodb-aggregations.com/)


## Source Code

You can see the source code for the data source ingestion here: https://github.com/mongodb/chatbot/tree/main/packages/ingest-mongodb-public
