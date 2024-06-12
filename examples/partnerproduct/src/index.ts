import 'dotenv/config';
import express from 'express';

import { 
    getDatabaseConfig, 
    getModelClass,
    getIngestLoader,
    getEmbeddingModel
 } from "../../../src/yaml_parser/src/LoadYaml.js";
import { RAGApplicationBuilder } from '../../../src/index.js';

const vector_store = getDatabaseConfig();
const model = getModelClass();
const embedding_model = getEmbeddingModel();

// Initialize Express
const app = express();
const port = 9000; // Port number for the Express server

const llmApplication = await new RAGApplicationBuilder()
    .setModel(model)
    .setEmbeddingModel(embedding_model)
    .setSearchResultCount(30)
    .setVectorDb(vector_store)
    .build();


// Define a route for querying
app.get('/api/v1/conversations', async (req, res) => {
    console.log(req)
    const question = "who found tesla";
    // if (!question) {
    //     return res.status(400).send('Question is required');
    // }

    try {
        const result = (await llmApplication.query(question.toString())).result;
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error processing your query');
    }
});

// Start the Express server
// app.listen(port, () => {
//     console.log(`Server is running on http://localhost:${port}`);
// });

// await llmApplication.addLoader(new SitemapLoader({ url: 'https://tesla-info.com/sitemap.xml' }));
// const loader = getIngestLoader();
// await llmApplication.addLoader(loader);

let question = 'Who founded Tesla?';
console.log('[QUESTION]', question);
console.log((await llmApplication.query(question)).result);

// question = 'Tell me about the history of Tesla?';
// console.log('[QUESTION]', question);
// console.log((await llmApplication.query(question)).result);

// question = 'What cars does Tesla have';
// console.log('[QUESTION]', question);
// console.log((await llmApplication.query(question)).result);
