"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
// Replace the uri string with your MongoDB deployment's connection string.
const uri = "<connection string uri>";
const client = new mongodb_1.MongoClient(uri);
async function run() {
    try {
        const database = client.db("insertDB");
        // Specifying a Schema is optional, but it enables type hints on
        // finds and inserts
        const haiku = database.collection("haiku");
        const result = await haiku.insertOne({
            title: "Record of a Shriveled Datum",
            content: "No bytes, no problem. Just insert a document, in MongoDB",
        });
        console.log(`A document was inserted with the _id: ${result.insertedId}`);
    }
    finally {
        await client.close();
    }
}
run().catch(console.dir);
