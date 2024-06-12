# YAML Parser

Yaml parser helps to read the configurations from Yaml file process it and return the required configurations.

## Installation


```
cd examples/yaml_parser
npm install
```

## Usage

Loading the entire YAML data:

```
const config = load_yaml();

console.log("Embedding configuration:", config.embedding);
console.log("LLM configurations:", config.llms);
console.log("Vector store configuration:", config.vector_store);
```

Loading only the RAG pipeline configuration:

```
const ragPipeline = load_rag_pipeline();

console.log("RAG pipeline configuration:", ragPipeline.rag_pipeline);
```

Command-line arguments:

Pass the YAML file path as the first argument after the script name:

```
node index.js path/to/your/config.yaml
```

### **Functions**
* **load_yaml()**: Loads the entire YAML data and returns specific configurations as a typed object. This functions returns llms, embeddings and vector store.
* **load_rag_pipeline()**: Loads only the RAG pipeline configuration.


### Interface

The YamlData interface defines the expected structure of the YAML data:

```
interface YamlData {
  embedding: {
    class_name: string;
    model_name: string;
  };
  vector_store: {
    conn_str: string;
    namespace: string;
    embedding_key: string;
    text_key: string;
  };
  llms: {
    class_name: string;
    model_name: string;
    temprature?: number; // Optional property with number type
    top_p?: number;       // Optional property with number type
  }[];
  rag_pipeline: {
    vs?: string;        // Optional property with string type
    embedding: string;  // Reference to the embedding configuration name
    retriever?: {
      class_name: string;
      vs: string;
      llm: string;
    };
    chat_engine: string; // Reference to the llm configuration name
  }[];
  ingest_pipeline: string[]; // Array of strings, likely referencing other configurations
}
```



