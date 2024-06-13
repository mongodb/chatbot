// Import required modules
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as process from 'process';
import { AdaEmbeddings, GeckoEmbedding, OpenAi, PdfLoader, VertexAI, WebLoader } from '../../index.js';
import { MongoDBAtlas } from '../../vectorDb/mongo-db-atlas.js';


function getDataFromYamlFile(){

  const args = process.argv.slice(2);

  // Check if a file path is provided
  if (!args[0]) {
    throw new Error("Please provide the YAML file path as an argument.");
  }
  const data = fs.readFileSync(args[0], 'utf8');
  const parsedData = yaml.load(data);
  return parsedData;
}


export function getDatabaseConfig(){

  const parsedData = getDataFromYamlFile();
  return new MongoDBAtlas({
    connectionString: parsedData.vector_store.connectionString,
    dbName: parsedData.vector_store.dbName,
    collectionName: parsedData.vector_store.collectionName,
    embeddingKey: parsedData.vector_store.embeddingKey,
    textKey: parsedData.vector_store.textKey
})
}


export function getModelClass(){

  const parsedData = getDataFromYamlFile();
  if (parsedData.llms.class_name === "VertexAI") {
    return new VertexAI({ modelName: parsedData.llms.model_name});
  } else if (parsedData.llms.class_name === "OpenAi"){
    return new OpenAi({ modelName: parsedData.llms.model_name}); 
  } else {
    return null;
  }
}

export function getEmbeddingModel(){

  const parsedData = getDataFromYamlFile();
  if (parsedData.embedding.class_name === "VertexAI") {
    return new GeckoEmbedding();
  } else if (parsedData.embedding.class_name === "OpenAIEmbeddings"){
    return new AdaEmbeddings(); 
  } else {
    return null;
  }
}

export function getIngestLoader(){

  const parsedData = getDataFromYamlFile();
  if(parsedData.ingest.source === 'web') {
    return new WebLoader({url: parsedData.ingest.source_path});
  }
  else if(parsedData.ingest.source === 'pdf') {
    return new PdfLoader({url: parsedData.ingest.source_path});
  } else {
    return null;
  }
}
