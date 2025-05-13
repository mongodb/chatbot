<guide>
<guide_topic>MongoDB Atlas - AI Integrations</guide_topic>

<section>
<title>Integrate Vector Search with AI Technologies</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/ai-integrations/</url>
<description>Learn how to integrate Atlas Vector Search with our partner AI integrations.</description>


# Atlas Vector Search – AI Integrations

**Frameworks**

- **LangChain** – Atlas integration  • LangChain JS/TS guide  
- **LangGraph** – Python & LangGraph.js guides  
- **LangChainGo** – Go guide  
- **LangChain4j** – Java guide  
- **LlamaIndex** – Integration guide  
- **Semantic Kernel** – C# & Python guides  
- **Haystack** – Integration guide  
- **Spring AI** – Integration guide  

**Platforms**

- **Amazon Bedrock** – Knowledge Base integration  
- **Google Vertex AI** – Atlas integration  

**API References**

LangChain (Py, JS/TS) • LangGraph (Py, JS) • LangChain4j • LlamaIndex • Semantic Kernel C# • Haystack • Spring AI

</section>
<section>
<title>Integrate Atlas Vector Search with LangChain</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/ai-integrations/langchain/</url>
<description>Integrate Atlas Vector Search with LangChain to build generative AI and RAG applications with MongoDB.</description>


# Atlas Vector Search × LangChain Quick Ref

## Install
```bash
pip install langchain-mongodb
```

## Vector Store `MongoDBAtlasVectorSearch`
```python
from langchain_mongodb.vectorstores import MongoDBAtlasVectorSearch
from langchain_voyageai import VoyageAIEmbeddings
vs = MongoDBAtlasVectorSearch.from_connection_string(
    "<mongodb-uri>",              # `mongodb+srv://…` or `mongodb://localhost:…`
    "<db>.<coll>",                # namespace
    VoyageAIEmbeddings(),         # any LC embedding model
    index_name="vector_index",    # default
    text_key="text",              # default
    embedding_key="embedding",    # default
    relevance_score_fn="cosine",  # cosine|euclidean|dotProduct
    dimensions=None,              # auto-create if set
    auto_create_index=False,
    auto_index_timeout=None,
    **kwargs                      # LC extras
)
```
Alternate: pass `collection=<pymongo.Collection>` or `from_documents(docs, embedding, collection, …)`.

## Retrievers
```python
retriever = vs.as_retriever()               # vector search

from langchain_mongodb.retrievers.full_text_search import MongoDBAtlasFullTextSearchRetriever
fts = MongoDBAtlasFullTextSearchRetriever(
    collection, search_field="<field>", search_index_name="<idx>")

from langchain_mongodb.retrievers.hybrid_search import MongoDBAtlasHybridSearchRetriever
hyb = MongoDBAtlasHybridSearchRetriever(
    vectorstore=vs, search_index_name="<fts-idx>", top_k=5,
    fulltext_penalty=60.0, vector_penalty=60.0)

from langchain_mongodb.retrievers.parent_document import MongoDBAtlasParentDocumentRetriever
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
pd = MongoDBAtlasParentDocumentRetriever.from_connection_string(
    "<mongodb-uri>", OpenAIEmbeddings(),
    RecursiveCharacterTextSplitter(),
    database_name="<db>", collection_name="<coll>")
docs = retriever.invoke("query")
```

## GraphRAG `MongoDBGraphStore`
```python
from langchain_mongodb import MongoDBGraphStore
from langchain_openai import ChatOpenAI
gs = MongoDBGraphStore(
    connection_string="<uri>", database_name="<db>", collection_name="<coll>",
    entity_extraction_model=ChatOpenAI())
gs.add_documents(docs)
answer = gs.chat_response("Who is the CEO of MongoDB?").content
```

## Caches
```python
from langchain_mongodb import MongoDBCache, MongoDBAtlasSemanticCache
from langchain_core.globals import set_llm_cache
set_llm_cache(MongoDBCache("<uri>", "<db>", "<coll>"))

from langchain_voyageai import VoyageAIEmbeddings
set_llm_cache(MongoDBAtlasSemanticCache(
    embedding=VoyageAIEmbeddings(), connection_string="<uri>",
    database_name="<db>", collection_name="<coll>"))
```

## Loaders
```python
from langchain_mongodb.loaders import MongoDBLoader
docs = MongoDBLoader.from_connection_string(
    "<uri>", "<db>", "<coll>",
    filter_criteria={"field":"value"},
    field_names=["field1", "field2"],
    metadata_names=["meta1"]).load()
```

## Chat History
```python
from langchain_mongodb.chat_message_histories import MongoDBChatMessageHistory
hist = MongoDBChatMessageHistory("<session>", "<uri>", "<db>", "<coll>")
hist.add_user_message("Hello"); hist.add_ai_message("Hi")
```

## Stores
```python
from langchain_mongodb.docstores import MongoDBDocStore
ds = MongoDBDocStore.from_connection_string("<uri>", "<db>.<coll>")

from langchain.storage import MongoDBByteStore
bs = MongoDBByteStore("<uri>", "<db>", "<coll>")
bs.mset([("k1", b"v1")]); bs.mget(["k1"]); list(bs.yield_keys()); bs.mdelete(["k1"])
```

---

</section>
<section>
<title>Get Started with the LangChain Integration</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/ai-integrations/langchain/get-started/</url>
<description>Use the LangChain integration for MongoDB to implement RAG with Atlas Vector Search.</description>


# Get Started with LangChain & Atlas Vector Search

## Prereqs
- Atlas cluster MongoDB ≥ 6.0.11/7.0.2, IP allow-listed  
- OpenAI API key  
- Python notebook (e.g., Colab)

## Install & Import
```bash
pip install --quiet --upgrade \
 langchain langchain-community langchain-core \
 langchain-mongodb langchain-openai pymongo pypdf
```
```python
import os, pprint
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_mongodb import MongoDBAtlasVectorSearch
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from pymongo.operations import SearchIndexModel
```
```python
os.environ["OPENAI_API_KEY"] = "<openai_key>"
ATLAS_CONNECTION_STRING = "mongodb+srv://<user>:<pwd>@<cluster>.mongodb.net"
```

## Load Data
```python
docs = RecursiveCharacterTextSplitter(chunk_size=200,chunk_overlap=20)\
       .split_documents(PyPDFLoader("https://investors.mongodb.com/node/13176/pdf").load())
```

## Vector Store
```python
vector_store = MongoDBAtlasVectorSearch.from_connection_string(
    connection_string=ATLAS_CONNECTION_STRING,
    namespace="langchain_db.test",
    embedding=OpenAIEmbeddings(model="text-embedding-3-large"),
    index_name="vector_index")
vector_store.add_documents(docs)
```

## Create Vector Index
### LangChain
```python
vector_store.create_vector_search_index(dimensions=1536, filters=["page_label"])
```
### PyMongo
```python
SearchIndexModel(
 name="vector_index",type="vectorSearch",
 definition={"fields":[
   {"type":"vector","path":"embedding","numDimensions":1536,"similarity":"cosine"},
   {"type":"filter","path":"page_label"}]})
```

## Queries
```python
vector_store.similarity_search("MongoDB acquisition")

vector_store.similarity_search_with_score(
    query="MongoDB acquisition", k=3)

vector_store.similarity_search_with_score(
    query="MongoDB acquisition", k=3,
    pre_filter={"page_label":{"$eq":2}})
```

## Basic RAG
```python
retriever = vector_store.as_retriever(
    search_type="similarity", search_kwargs={"k":10})

prompt = PromptTemplate.from_template(
    "Use the following context to answer.\n{context}\nQuestion: {question}")

chain = ({"context":retriever,"question":RunnablePassthrough()} |
         prompt | ChatOpenAI(model="gpt-4o") | StrOutputParser())

answer = chain.invoke("What was MongoDB's latest acquisition?")
```

## RAG with Score & Filter
```python
retriever = vector_store.as_retriever(
  search_type="similarity",
  search_kwargs={"k":10,"score_threshold":0.75,
                 "pre_filter":{"page_label":{"$eq":2}}})
# reuse prompt/chain
```

</section>
<section>
<title>Add Memory and Semantic Caching to your RAG Applications with LangChain and MongoDB</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/ai-integrations/langchain/memory-semantic-cache/</url>
<description>Learn how to add conversation memory and semantic caching to your RAG application using MongoDB and LangChain.</description>


# RAG Memory & Semantic Cache with LangChain + MongoDB Atlas

## Prerequisites
- Atlas cluster 6.0.11/7.0.2+ (allow your IP).  
- `VOYAGE_API_KEY`, `OPENAI_API_KEY`.  
- `MONGODB_URI = mongodb+srv://<user>:<pw>@<cluster>.<host>.mongodb.net`

## Install
```bash
pip install -U langchain langchain-community langchain-core \
  langchain-mongodb langchain-voyageai langchain-openai pypdf
```

## Vector Store
```python
import os; os.environ["OPENAI_API_KEY"]="<openai>"; os.environ["VOYAGE_API_KEY"]="<voyage>"
MONGODB_URI="<connection-string>"

from langchain_mongodb import MongoDBAtlasVectorSearch
from langchain_voyageai import VoyageAIEmbeddings
embedding_model = VoyageAIEmbeddings(model="voyage-3")

vector_store = MongoDBAtlasVectorSearch.from_connection_string(
    connection_string=MONGODB_URI,
    embedding=embedding_model,
    namespace="langchain_db.rag_with_memory")
```

### Ingest PDF
```python
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
docs = RecursiveCharacterTextSplitter(chunk_size=200, chunk_overlap=20) \
       .split_documents(PyPDFLoader("https://investors.mongodb.com/node/13176/pdf").load())
vector_store.add_documents(docs)
```

### Create Vector Index
```python
vector_store.create_vector_search_index(dimensions=1024)
```

## RAG + Conversation Memory
### Message History Helper
```python
from langchain_mongodb.chat_message_histories import MongoDBChatMessageHistory
def get_session_history(session_id:str):
    return MongoDBChatMessageHistory(
        connection_string=MONGODB_URI,
        session_id=session_id,
        database_name="langchain_db",
        collection_name="rag_with_memory")
```

### Build Chain
```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_core.runnables.history import RunnableWithMessageHistory

llm = ChatOpenAI(model="gpt-4o")

standalone_question = (
    ChatPromptTemplate.from_messages([
        ("system",
         "Given chat history + follow-up, return standalone question only."),
        MessagesPlaceholder("history"),
        ("human","{question}")])
    | llm | StrOutputParser())

retriever_chain = RunnablePassthrough.assign(
    context=standalone_question |
            vector_store.as_retriever(search_type="similarity",search_kwargs={"k":5}) |
            (lambda d:"\n\n".join(x.page_content for x in d)))

rag_prompt = ChatPromptTemplate.from_messages([
    ("system","Answer using ONLY:\n{context}\n"),
    MessagesPlaceholder("history"),
    ("human","{question}")])

rag_chain = retriever_chain | rag_prompt | llm | StrOutputParser()

rag_with_memory = RunnableWithMessageHistory(
    rag_chain, get_session_history,
    input_messages_key="question", history_messages_key="history")
```

### Example
```python
rag_with_memory.invoke(
    {"question":"What was MongoDB's latest acquisition?"},
    {"configurable":{"session_id":"user1"}})
```

## Semantic Cache
```python
from langchain_mongodb.cache import MongoDBAtlasSemanticCache
from langchain_core.globals import set_llm_cache

set_llm_cache(MongoDBAtlasSemanticCache(
    connection_string=MONGODB_URI,
    database_name="langchain_db",
    collection_name="semantic_cache",
    embedding=embedding_model,
    index_name="vector_index",
    similarity_threshold=0.5))
```

Cached prompts auto-apply; similar queries hit cache, reducing latency.

</section>
<section>
<title>Perform Hybrid Search with the LangChain Integration</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/ai-integrations/langchain/hybrid-search/</url>
<description>Perform hybrid search by using the LangChain integration for Atlas Vector Search.</description>


# Hybrid Search with MongoDB Atlas + LangChain

## Prerequisites
- Atlas cluster MongoDB ≥ 6.0.11/7.0.2, IP allowed  
- OpenAI API key  
- Python notebook (e.g., Colab)

## Setup
```python
!pip install -q --upgrade langchain langchain-community langchain-core \
                     langchain-mongodb langchain-openai pymongo pypdf
import os
os.environ["OPENAI_API_KEY"]="<>"
ATLAS_CONNECTION_STRING="mongodb+srv://<user>:<pwd>@<cluster>.mongodb.net"
```

## Vector Store
```python
from langchain_mongodb import MongoDBAtlasVectorSearch
from langchain_openai import OpenAIEmbeddings

vector_store = MongoDBAtlasVectorSearch.from_connection_string(
    connection_string=ATLAS_CONNECTION_STRING,
    embedding=OpenAIEmbeddings(disallowed_special=()),
    namespace="sample_mflix.embedded_movies",
    text_key="plot",
    embedding_key="plot_embedding",
    relevance_score_fn="dotProduct")
```

## Indexes (Project Data Access Admin+)

LangChain helpers:
```python
vector_store.create_vector_search_index(dimensions=1536)

from langchain_mongodb.index import create_fulltext_search_index
from pymongo import MongoClient
client = MongoClient(ATLAS_CONNECTION_STRING)
create_fulltext_search_index(
    collection=client["sample_mflix"]["embedded_movies"],
    field="plot",
    index_name="search_index")
```

PyMongo alternative:
```python
from pymongo.operations import SearchIndexModel
col = client["sample_mflix"]["embedded_movies"]

col.create_search_index(SearchIndexModel(
    definition={"fields":[{"type":"vector","path":"plot_embedding",
                           "numDimensions":1536,"similarity":"dotProduct"}]},
    name="vector_index", type="vectorSearch"))

col.create_search_index(SearchIndexModel(
    definition={"mappings":{"dynamic":False,
                            "fields":{"plot":{"type":"string"}}}},
    name="search_index"))
```

## Hybrid Search
```python
from langchain_mongodb.retrievers.hybrid_search import MongoDBAtlasHybridSearchRetriever
retriever = MongoDBAtlasHybridSearchRetriever(
    vectorstore=vector_store,
    search_index_name="search_index",
    top_k=5,
    fulltext_penalty=50,
    vector_penalty=50)

docs = retriever.invoke("time travel")
for d in docs:
    print(d.metadata["title"], d.metadata["fulltext_score"],
          d.metadata["vector_score"])
```

## RAG Pipeline
```python
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI

prompt = PromptTemplate.from_template(
    "Use the context to answer the question.\n{context}\n"
    "Question: Can you recommend some movies about {query}?")

chain = ({"context": retriever, "query": RunnablePassthrough()} |
         prompt | ChatOpenAI() | StrOutputParser())

print(chain.invoke("time travel"))
```

</section>
<section>
<title>Perform Parent Document Retrieval with the LangChain Integration</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/ai-integrations/langchain/parent-document-retrieval/</url>
<description>Perform parent document retrieval by using the LangChain integration for Atlas Vector Search.</description>


# Parent Document Retrieval with LangChain & MongoDB Atlas

## Quick Setup
```bash
pip install -q langchain langchain-community langchain-core langchain-mongodb \
             langchain-openai pymongo pypdf
```
```python
import os
os.environ["OPENAI_API_KEY"] = "<openai-key>"
ATLAS_CONNECTION_STRING = "mongodb+srv://<user>:<pass>@<cluster>.mongodb.net"
```
Atlas cluster ≥ 6.0.11 and IP-whitelisted required.

## Load & Chunk Data
```python
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter

data = PyPDFLoader("https://investors.mongodb.com/node/12881/pdf").load()
parent_splitter = RecursiveCharacterTextSplitter(chunk_size=2000, chunk_overlap=20)
docs = parent_splitter.split_documents(data)
```

## Build Retriever & Ingest
```python
from langchain_openai import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_mongodb.retrievers import MongoDBAtlasParentDocumentRetriever

retriever = MongoDBAtlasParentDocumentRetriever.from_connection_string(
    connection_string=ATLAS_CONNECTION_STRING,
    child_splitter=RecursiveCharacterTextSplitter(chunk_size=200, chunk_overlap=20),
    embedding_model=OpenAIEmbeddings(model="text-embedding-3-small"),
    database_name="langchain_db",
    collection_name="parent_document",
    text_key="page_content",
    relevance_score_fn="dotProduct",
    search_kwargs={"k":10},
)
retriever.add_documents(docs)       # ingests parent & child docs
```

## Create Vector Search Index (`embedding` field, 1536 dims)

LangChain helper:
```python
retriever.vectorstore.create_vector_search_index(dimensions=1536)
```
PyMongo:
```python
from pymongo import MongoClient
from pymongo.operations import SearchIndexModel
col = MongoClient(ATLAS_CONNECTION_STRING)["langchain_db"]["parent_document"]
col.create_search_index(model=SearchIndexModel(
    definition={"fields":[{"type":"vector","path":"embedding",
                           "numDimensions":1536,"similarity":"dotProduct"}]},
    name="vector_index", type="vectorSearch"))
```

## Query / RAG Example
```python
# Vector search
docs = retriever.invoke("AI technology")

# RAG chain
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser

prompt = PromptTemplate.from_template(
    "Use the following context to answer.\n{context}\nQuestion: {query}?")
chain = ({"context": retriever, "query": RunnablePassthrough()}
         | prompt | ChatOpenAI() | StrOutputParser())
print(chain.invoke("In a list, what are MongoDB's latest AI announcements?"))
```

Optional UI queries:
```json
{ "doc_id": "<parent_id>" }    // child docs
{ "_id": "<parent_id>" }       // parent doc
```

Child docs contain `embedding` and `doc_id`; parents do not.

</section>
<section>
<title>Build a Local RAG Implementation with MongoDB and LangChain</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/ai-integrations/langchain/local-rag/</url>
<description>Build a local RAG implementation with the LangChain integration for Atlas Vector Search.</description>


# Build a Local RAG Implementation with MongoDB and LangChain

## Prereqs
- Atlas CLI ≥ 1.14.3
- Python ≥ 3.10 (notebook, e.g., VS Code)

## 1 Create Local Atlas Deployment
```bash
atlas deployments setup   # follow prompts
```
Testing-only; use clusters for prod.

## 2 Project Setup
```bash
mkdir local-rag-langchain-mongodb && cd $_
touch langchain-local-rag.ipynb
```
Notebook deps:
```python
pip install -q --upgrade pymongo langchain langchain-community \
  langchain-huggingface gpt4all pypdf
```
Connection string:
```python
MONGODB_URI="mongodb://localhost:<port>/?directConnection=true"
```

## 3 Local Deployment as Vector Store
```python
from langchain_mongodb import MongoDBAtlasVectorSearch
from langchain_huggingface import HuggingFaceEmbeddings

embedding_model=HuggingFaceEmbeddings(
    model_name="mixedbread-ai/mxbai-embed-large-v1")

vector_store=MongoDBAtlasVectorSearch.from_connection_string(
    connection_string=MONGODB_URI,
    namespace="langchain_db.local_rag",
    embedding=embedding_model,
    index_name="vector_index")
```
Add PDF docs:
```python
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter

docs=RecursiveCharacterTextSplitter(chunk_size=200,chunk_overlap=20)\
     .split_documents(PyPDFLoader(
        "https://investors.mongodb.com/node/13176/pdf").load())
vector_store.add_documents(docs)
```
Create Vector Search index (1024 dims):
```python
vector_store.create_vector_search_index(dimensions=1024)
```

## 4 Load Local LLM
Download Mistral 7B (GPT4All) ⇒ place in project.
```python
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain_community.llms import GPT4All
llm=GPT4All(model="<path-to-model>",
            callbacks=[StreamingStdOutCallbackHandler()],
            verbose=True)
```

## 5 RAG Chain
```python
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

retriever=vector_store.as_retriever()
prompt=PromptTemplate.from_template(
"""Use the following pieces of context to answer the question at the end.
{context}
Question: {question}""")

def format_docs(docs): return "\n\n".join(d.page_content for d in docs)

rag_chain=({"context":retriever|format_docs,"question":RunnablePassthrough()}
           |prompt|llm|StrOutputParser())

question="What was MongoDB's latest acquisition?"
answer=rag_chain.invoke(question)

# Sources
docs_src=retriever.invoke(question)
```

Key CLI: `atlas deployments setup`  
Key params: `connection_string`, `namespace`, `index_name`, `dimensions`.

</section>
<section>
<title>GraphRAG with MongoDB and LangChain</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/ai-integrations/langchain/graph-rag/</url>
<description>Learn how to implement GraphRAG using Atlas Vector Search and LangChain.</description>


# GraphRAG with MongoDB + LangChain

Prereqs: Atlas cluster MongoDB ≥ 6.0.11, IP-allowlisted; OpenAI key; Python notebook.

Install  
```bash
pip install -q --upgrade pymongo langchain_community wikipedia langchain_openai langchain_mongodb
```

Env  
```python
import os
os.environ["OPENAI_API_KEY"]="YOUR_OPENAI_KEY"
ATLAS_CONNECTION_STRING="mongodb+srv://<user>:<pwd>@<cluster>.mongodb.net"
ATLAS_DB_NAME="langchain_db"
ATLAS_COLLECTION="wikipedia"
```

Init model  
```python
from langchain_openai import OpenAI
from langchain.chat_models import init_chat_model
chat_model = init_chat_model("gpt-4o", model_provider="openai", temperature=0)
```

Load data  
```python
from langchain_community.document_loaders import WikipediaLoader
from langchain.text_splitter import TokenTextSplitter
pages = WikipediaLoader(query="Sherlock Holmes", load_max_docs=3).load()
docs = TokenTextSplitter(chunk_size=1024, chunk_overlap=0).split_documents(pages)
```

Create graph store & ingest  
```python
from langchain_mongodb.graphrag.graph import MongoDBGraphStore
graph = MongoDBGraphStore.from_connection_string(
    connection_string=ATLAS_CONNECTION_STRING,
    database_name=ATLAS_DB_NAME,
    collection_name=ATLAS_COLLECTION,
    entity_extraction_model=chat_model
)
graph.add_documents(docs)     # upsert entities/relationships
```

Query  
```python
answer = graph.chat_response("Who inspired Sherlock Holmes?")
print(answer.content)  # Dr. Joseph Bell …
```

(Optional) Visualize with `networkx` + `pyvis`.

</section>
<section>
<title>Get Started with the LangChain JS/TS Integration</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/ai-integrations/langchain-js/</url>
<description>Integrate Atlas Vector Search with LangChain JS/TS to build LLM and RAG applications.</description>


# Atlas Vector Search + LangChain JS Quickstart

## Prereqs
• Atlas cluster (≥6.0.11) with IP allowlist, SRV string  
• OpenAI API key  
• Node + npm

## Install
```sh
mkdir langchain-mongodb && cd $_
npm init -y
npm i langchain @langchain/community @langchain/mongodb @langchain/openai pdf-parse fs
```
`package.json`
```json
{ "type": "module" }
```

## get-started.js
```javascript
import { formatDocumentsAsString } from "langchain/util/document";
import { MongoClient } from "mongodb";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { PromptTemplate } from "@langchain/core/prompts";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { RunnableSequence, RunnablePassthrough } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import * as fs from "fs";

process.env.OPENAI_API_KEY="<OPENAI_KEY>";
process.env.ATLAS_CONNECTION_STRING="<ATLAS_SRV>";
const client=new MongoClient(process.env.ATLAS_CONNECTION_STRING);

async function run(){
  const col=client.db("langchain_db").collection("test");
  const cfg={collection:col,indexName:"vector_index",textKey:"text",embeddingKey:"embedding"};
  await col.deleteMany({});                                   // reset

  // fetch + split PDF
  fs.writeFileSync("atlas.pdf",Buffer.from(await (await fetch(
    "https://query.prod.cms.rt.microsoft.com/cms/api/am/binary/RE4HkJP")).arrayBuffer()));
  const docs=await new RecursiveCharacterTextSplitter({chunkSize:200,chunkOverlap:20})
           .splitDocuments(await new PDFLoader("atlas.pdf").load());

  // load to Atlas
  const store=await MongoDBAtlasVectorSearch.fromDocuments(docs,new OpenAIEmbeddings(),cfg);

  // create vector index once
  if(!(await col.listSearchIndexes("vector_index").toArray()).length){
    await col.createSearchIndex({
      name:"vector_index",type:"vectorSearch",
      definition:{fields:[
        {type:"vector",path:"embedding",numDimensions:1536,similarity:"cosine"},
        {type:"filter",path:"loc.pageNumber"}]}
    });
    await new Promise(r=>setTimeout(r,1e4));                  // wait sync
  }

  /* -------- Queries -------- */
  const show=r=>console.log(r.map(d=>({page:d.metadata.loc.pageNumber,text:d.pageContent})));

  // semantic
  show(await store.similaritySearch("MongoDB Atlas security"));

  // semantic + filter (page 17, top 3)
  show(await store.similaritySearch("MongoDB Atlas security",3,
       {preFilter:{"loc.pageNumber":{$eq:17}}}));

  // MMR
  show(await store.maxMarginalRelevanceSearch("MongoDB Atlas security",{k:3,fetchK:10}));

  /* -------- Basic RAG -------- */
  const prompt=PromptTemplate.fromTemplate(
    `Answer using context:\n{context}\n\nQuestion: {question}`);
  const chain=RunnableSequence.from([
    {context:store.asRetriever().pipe(formatDocumentsAsString),
     question:new RunnablePassthrough()},
    prompt,new ChatOpenAI({}),new StringOutputParser()]);
  console.log(await chain.invoke("How can I secure my MongoDB Atlas cluster?"));

  /* RAG w/ MMR + filter */
  const retr2=await store.asRetriever({
    searchType:"mmr",
    filter:{preFilter:{"loc.pageNumber":{$eq:17}}},
    searchKwargs:{fetchK:20,lambda:0.1}});
  const chain2=RunnableSequence.from([
    {context:retr2.pipe(formatDocumentsAsString),question:new RunnablePassthrough()},
    prompt,new ChatOpenAI({}),new StringOutputParser()]);
  console.log(await chain2.invoke("How can I secure my MongoDB Atlas cluster?"));
}
run().finally(()=>client.close());
```

## Run
```sh
node get-started.js
```

</section>
<section>
<title>Integrate MongoDB with LangGraph</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/ai-integrations/langgraph/</url>
<description>Integrate MongoDB with LangGraph to build AI agents and advanced RAG applications.</description>


# MongoDB LangGraph Integration

Use MongoDB for both Retrieval-Augmented Generation and LangGraph state persistence.

## Retrieval Tool (full-text, vector, hybrid, parent-doc)

```python
from langchain.tools.retriever import create_retriever_tool
from langchain_mongodb.vectorstores import MongoDBAtlasVectorSearch
from langchain_voyageai import VoyageAIEmbeddings

vector_store = MongoDBAtlasVectorSearch.from_connection_string(
    "<connection-string>",            # Mongo URI
    namespace="<db>.<coll>",          # db.collection
    embedding=VoyageAIEmbeddings(),   # embedder
    index_name="vector_index",
)
retriever_tool = create_retriever_tool(
    vector_store.as_retriever(),      # LangChain retriever
    "vector_search_retriever",
    "Retrieve relevant documents",
)
```

Attach tool to graph:

```python
from langgraph.graph import StateGraph
from langgraph.prebuilt import ToolNode

g = StateGraph()
g.add_node("vector_search_retriever", ToolNode([retriever_tool]))
graph = g.compile()
```

## MongoDB Checkpointer

```python
from langgraph.checkpoint.mongodb import MongoDBSaver
from pymongo import MongoClient

checkpointer = MongoDBSaver(MongoClient("<connection-string>"))
app = graph.compile(checkpointer=checkpointer)
```

Checkpointer adds memory, human-in-the-loop, time-travel, and fault tolerance.

</section>
<section>
<title>Build an AI Agent with LangGraph and Atlas Vector Search</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/ai-integrations/langgraph/build-agents/</url>
<description>Learn how to build AI agents with LangGraph and Atlas Vector Search.</description>


# Build an AI Agent with LangGraph + Atlas Vector Search

## Install & Init
```python
pip install -q --upgrade langgraph langgraph-checkpoint-mongodb \
    langchain langchain_mongodb langchain-openai pymongo
```
```python
import os
os.environ["OPENAI_API_KEY"] = "<openai-key>"
MONGODB_URI = "<mongodb+srv://user:pwd@cluster.x.mongodb.net>"
```

## Vector Store (Atlas)
```python
from langchain_mongodb import MongoDBAtlasVectorSearch
from langchain_openai import OpenAIEmbeddings

embedding_model = OpenAIEmbeddings(model="text-embedding-ada-002", disallowed_special=())
vector_store = MongoDBAtlasVectorSearch.from_connection_string(
    connection_string=MONGODB_URI,
    namespace="sample_mflix.embedded_movies",  # coll with embeddings
    embedding=embedding_model,
    text_key="plot",
    embedding_key="plot_embedding",
    relevance_score_fn="dotProduct"
)
```

### Indexes  
Requires Atlas role `Project Data Access Admin+`.

LangChain helpers:
```python
# Vector
vector_store.create_vector_search_index(dimensions=1536)

# Full-text on "title"
from langchain_mongodb.index import create_fulltext_search_index
from pymongo import MongoClient
client = MongoClient(MONGODB_URI)
create_fulltext_search_index(
    collection=client["sample_mflix"]["embedded_movies"],
    field="title",
    index_name="search_index")
```

PyMongo equivalent:
```python
from pymongo.operations import SearchIndexModel
# vector
collection.create_search_index(SearchIndexModel(
   {"fields":[{"type":"vector","path":"plot_embedding",
               "numDimensions":1536,"similarity":"dotProduct"}]},
   name="vector_index", type="vectorSearch"))
# full-text
collection.create_search_index(SearchIndexModel(
   {"mappings":{"dynamic":False,"fields":{"plot":{"type":"title"}}}},
   name="search_index"))
```

## Agent Tools
```python
from langchain.agents import tool
# Vector search
@tool
def vector_search(user_query:str)->str:
    retriever = vector_store.as_retriever(
        search_type="similarity", search_kwargs={"k":5})
    docs = retriever.invoke(user_query)
    return "\n\n".join(f"{d.metadata['title']}: {d.page_content}" for d in docs)

# Full-text search
from langchain_mongodb.retrievers.full_text_search import MongoDBAtlasFullTextSearchRetriever
@tool
def full_text_search(user_query:str)->str:
    retriever = MongoDBAtlasFullTextSearchRetriever(
        collection=client["sample_mflix"]["embedded_movies"],
        search_field="title",
        search_index_name="search_index",
        top_k=1)
    doc = retriever.invoke(user_query)[0]
    return doc.metadata.get("fullplot","Movie not found")
```

## LLM & Prompt
```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
llm = ChatOpenAI()  # gpt-3.5-turbo default
tools = [vector_search, full_text_search]

prompt = ChatPromptTemplate.from_messages([
  ("system",
   "You are a helpful AI agent with tools: {tool_names}. "
   "Think step-by-step, avoid redundant calls; say I DON'T KNOW if needed."),
  MessagesPlaceholder(variable_name="messages"),
]).partial(tool_names=", ".join(t.name for t in tools))

llm_with_tools = prompt | llm.bind_tools(tools)
```

## LangGraph
State:
```python
from typing_extensions import TypedDict
from typing import Annotated, List, Dict
from langgraph.graph.message import add_messages
class GraphState(TypedDict):
    messages: Annotated[list, add_messages]
```
Graph & nodes:
```python
from langgraph.graph import StateGraph, START, END
from langchain_core.messages import ToolMessage

graph = StateGraph(GraphState)

def agent(state:GraphState)->Dict[str,List]:
    msgs = state["messages"]
    return {"messages":[llm_with_tools.invoke(msgs)]}
graph.add_node("agent", agent)

tools_by_name = {t.name:t for t in tools}
def tools_node(state:GraphState)->Dict[str,List]:
    out=[]
    for call in state["messages"][-1].tool_calls:
        obs = tools_by_name[call["name"]].invoke(call["args"])
        out.append(ToolMessage(content=obs, tool_call_id=call["id"]))
    return {"messages":out}
graph.add_node("tools", tools_node)

# edges
graph.add_edge(START, "agent")
graph.add_edge("tools", "agent")
def route_tools(state:GraphState):
    msg=state["messages"][-1]
    return "tools" if getattr(msg,"tool_calls",[]) else END
graph.add_conditional_edges("agent", route_tools, {"tools":"tools", END:END})

app = graph.compile()
```

## Execution Helper
```python
def execute_graph(user_input:str, thread_id:str=None):
    cfg = {"configurable":{"thread_id":thread_id}} if thread_id else {}
    inp = {"messages":[("user",user_input)]}
    for step in app.stream(inp, cfg):
        pass  # stream handles printing; adapt as needed
    print(step["messages"][-1].content)
```

## Persisting Memory (optional)
```python
from langgraph.checkpoint.mongodb import MongoDBSaver
checkpointer = MongoDBSaver(client)        # uses MongoDB for checkpoints
app = graph.compile(checkpointer=checkpointer)

# call with thread id to keep context
execute_graph("What's the plot of Titanic?", thread_id="1")
execute_graph("What movies are similar to the one I just asked about?", thread_id="1")
```

</section>
<section>
<title>Integrate MongoDB with LangGraph.js</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/ai-integrations/langgraph-js/</url>
<description>Integrate MongoDB with LangGraph JS/TS to build AI agents and advanced RAG applications.</description>


# Integrate MongoDB with LangGraph.js

## Retrieval Tool

```js
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { MongoClient } from "mongodb";
import { VoyageAIEmbeddings } from "@langchain/community/embeddings/voyage";
import { createRetrieverTool } from "langchain/tools/retriever";

const client = new MongoClient("<connection-string>");
const collection = client.db("<db>").collection("<coll>");

const vectorStore = new MongoDBAtlasVectorSearch(
  new VoyageAIEmbeddings(),
  {
    collection,
    indexName: "vector_index",
    textKey: "text",
    embeddingKey: "embedding",
  }
);

const retrieverTool = createRetrieverTool(
  vectorStore.asRetriever(),
  {
    name: "vector_search_retriever",
    description: "Retrieve relevant documents from the collection",
  }
);
```

Add to LangGraph:

```js
import { StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";

const retrieverNode = new ToolNode([retrieverTool]);

const graph = new StateGraph(SomeGraphState)
  .addNode("vector_search_retriever", retrieverNode)
  .compile();
```

## MongoDB Checkpointer

```js
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";
import { MongoClient } from "mongodb";

const checkpointer = new MongoDBSaver(new MongoClient("<connection-string>"));
const app = graph.compile(checkpointer);   // persist agent state in MongoDB
```

</section>
<section>
<title>Build an AI Agent with LangGraph.js and Atlas Vector Search</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/ai-integrations/langgraph-js/build-agents/</url>
<description>Integrate Atlas Vector Search with LangGraph JS/TS to build LLM and RAG applications.</description>


# Build an AI Agent with LangGraph.js + Atlas Vector Search

## Prereqs  
• Node.js/npm  
• Atlas cluster URI  
• `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`

## Install & Init

```bash
npm init -y
npm i -D typescript ts-node @types/{express,node}
npx tsc --init
npm i langchain @langchain/{langgraph,mongodb,langgraph-checkpoint-mongodb,anthropic} dotenv express mongodb zod
```

.env

```env
OPENAI_API_KEY=<key>
ANTHROPIC_API_KEY=<key>
MONGODB_ATLAS_URI=<uri>
```

Tree

```
.env  index.ts  agent.ts  seed-database.ts  package.json  tsconfig.json
```

## Seed Sample Data (`seed-database.ts`)

```ts
import {ChatOpenAI,OpenAIEmbeddings} from "@langchain/openai";
import {StructuredOutputParser} from "@langchain/core/output_parsers";
import {MongoClient} from "mongodb";
import {MongoDBAtlasVectorSearch} from "@langchain/mongodb";
import {z} from "zod"; import "dotenv/config";

const client=new MongoClient(process.env.MONGODB_ATLAS_URI!);
const llm=new ChatOpenAI({modelName:"gpt-4o-mini",temperature:0.7});

const EmployeeSchema=z.object({employee_id:z.string(),first_name:z.string(),last_name:z.string(),job_details:z.object({job_title:z.string(),department:z.string()}),skills:z.array(z.string()),notes:z.string()}).passthrough();
type Employee=z.infer<typeof EmployeeSchema>;
const parser=StructuredOutputParser.fromZodSchema(z.array(EmployeeSchema));

async function generate():Promise<Employee[]>{return parser.parse((await llm.invoke(`Generate 10 employee records.\n${parser.getFormatInstructions()}`)).content!);}
function summary(e:Employee){return`${e.first_name} ${e.last_name}. Job: ${e.job_details.job_title} in ${e.job_details.department}. Skills: ${e.skills.join(", ")}. Notes: ${e.notes}`;}

(async()=>{
  await client.connect();
  const col=client.db("hr_database").collection("employees");
  await col.deleteMany({});
  for(const r of await generate()){
    await MongoDBAtlasVectorSearch.fromDocuments(
      [{pageContent:summary(r),metadata:r}],
      new OpenAIEmbeddings(),
      {collection:col,indexName:"vector_index",textKey:"embedding_text",embeddingKey:"embedding"}
    );
  }
  await client.close();
})();
```

Run: `npx ts-node seed-database.ts`

Atlas Vector Search index (`hr_database.employees`, name `vector_index`):

```json
{"fields":[{"path":"embedding","type":"vector","numDimensions":1536,"similarity":"cosine"}]}
```

## Agent (`agent.ts`)

```ts
import {...} from "@langchain/*"; import {MongoClient} from "mongodb"; import "dotenv/config";

export async function callAgent(client:MongoClient,query:string,thread_id:string){
  const collection=client.db("hr_database").collection("employees");

/* ---------- Graph State ---------- */
  const GraphState=Annotation.Root({messages:Annotation<BaseMessage[]>({reducer:(x,y)=>x.concat(y)})});

/* ---------- Tool ---------- */
  const employeeLookup=tool(
    async({query,n=10})=>{
      const vs=new MongoDBAtlasVectorSearch(new OpenAIEmbeddings(),{collection,indexName:"vector_index",textKey:"embedding_text",embeddingKey:"embedding"});
      return JSON.stringify(await vs.similaritySearchWithScore(query,n));
    },{
      name:"employee_lookup",
      description:"Gathers employee details from HR database",
      schema:z.object({query:z.string(),n:z.number().optional().default(10)})
    }
  );

/* ---------- Model ---------- */
  const model=new ChatAnthropic({model:"claude-3-5-sonnet-20240620",temperature:0}).bindTools([employeeLookup]);

/* ---------- Nodes ---------- */
  async function callModel(state:typeof GraphState.State){
    const prompt=ChatPromptTemplate.fromMessages([
      ["system",`You are a helpful HR chatbot. Tools: {tool_names}\n{system_message}\nTime:{time}.`],
      new MessagesPlaceholder("messages"),
    ]);
    const msgs=await prompt.formatMessages({
      system_message:"You are helpful HR Chatbot Agent.",
      time:new Date().toISOString(),
      tool_names:"employee_lookup",
      messages:state.messages,
    });
    return {messages:[await model.invoke(msgs)]};
  }
  function shouldContinue(state:typeof GraphState.State){
    return (state.messages.at(-1) as AIMessage).tool_calls?.length?"tools":"__end__";
  }

/* ---------- Workflow ---------- */
  const wf=new StateGraph(GraphState)
    .addNode("agent",callModel)
    .addNode("tools",new ToolNode([employeeLookup]))
    .addEdge("__start__","agent")
    .addConditionalEdges("agent",shouldContinue)
    .addEdge("tools","agent");

  const app=wf.compile({checkpointer:new MongoDBSaver({client,dbName:"hr_database"})});
  const out=await app.invoke({messages:[new HumanMessage(query)]},{recursionLimit:15,configurable:{thread_id}});
  return out.messages.at(-1)!.content;
}
```

## Server (`index.ts`)

```ts
import 'dotenv/config'; import express from "express"; import {MongoClient} from "mongodb"; import {callAgent} from "./agent";

const app=express(); app.use(express.json());
const client=new MongoClient(process.env.MONGODB_ATLAS_URI!);
await client.connect(); await client.db("admin").command({ping:1});

app.post("/chat",async(req,res)=>{
  const id=Date.now().toString();
  res.json({threadId:id,response:await callAgent(client,req.body.message,id)});
});
app.post("/chat/:threadId",async(req,res)=>{
  res.json({response:await callAgent(client,req.body.message,req.params.threadId)});
});
app.listen(process.env.PORT||3000);
```

Run: `npx ts-node index.ts`

## Test

```bash
curl -X POST -H "Content-Type: application/json" -d '{"message":"Build a team to make a web app."}' http://localhost:3000/chat
curl -X POST -H "Content-Type: application/json" -d '{"message":"Who should lead?"}' http://localhost:3000/chat/<threadId>
```

</section>
<section>
<title>Get Started with the LangChainGo Integration</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/ai-integrations/langchaingo/</url>
<description>Integrate Atlas Vector Search with LangChainGo to build LLM and RAG applications.</description>


# Atlas Vector Search + LangChainGo Quick Guide

## Prerequisites
- Atlas cluster ≥ 6.0.11, IP allow-listed.  
- OpenAI API key with credit.  
- Go installed.

## Setup
```sh
mkdir langchaingo-mongodb && cd $_
go mod init langchaingo-mongodb
go get github.com/joho/godotenv \
       github.com/tmc/langchaingo/{chains,llms,prompts,vectorstores/mongovector} \
       go.mongodb.org/mongo-driver/v2/mongo
go mod tidy
```
`.env`
```
OPENAI_API_KEY=<api-key>
ATLAS_CONNECTION_STRING=mongodb+srv://<user>:<pwd>@<cluster>.mongodb.net/<db>
```

## App Skeleton (`main.go`)
```go
package main
import (
  "context"; "log"; "os"; "time"; "fmt"; "strings"
  "github.com/joho/godotenv"
  "github.com/tmc/langchaingo/{embeddings,llms/openai,vectorstores,mongovector,chains,prompts}"
  "github.com/tmc/langchaingo/schema"
  "go.mongodb.org/mongo-driver/v2/mongo"
  "go.mongodb.org/mongo-driver/v2/mongo/options"
  "go.mongodb.org/mongo-driver/v2/bson"
)
/* ---------- CONFIG ---------- */
const (
  db="langchaingo_db"; coll="test"; idx="vector_index"
  openAIModel="text-embedding-3-small"; dims=1536; sim="dotProduct"
)
type Document struct {
  PageContent string            `bson:"text"`
  Embedding   []float32         `bson:"embedding"`
  Metadata    map[string]string `bson:"metadata"`
}
func fatalf(msg string, a ...any){log.Fatalf(msg, a...)}
/* ---------- MAIN ---------- */
func main(){
  godotenv.Load()
  uri:=os.Getenv("ATLAS_CONNECTION_STRING")
  api:=os.Getenv("OPENAI_API_KEY")
  if uri==""||api==""{fatalf("Missing env vars")}
  client,err:=mongo.Connect(options.Client().ApplyURI(uri)); if err!=nil{fatalf("connect: %v",err)}
  defer client.Disconnect(context.Background())
  c:=client.Database(db).Collection(coll)

  llm, _ := openai.New(openai.WithEmbeddingModel(openAIModel))
  embedder,_ := embeddings.NewEmbedder(llm)
  store := mongovector.New(c, embedder, mongovector.WithIndex(idx), mongovector.WithPath("embeddings"))

  if isEmpty(c){
    docs:=[]schema.Document{
      {PageContent:"Proper tuber planting ...", Metadata:map[string]any{"author":"A","type":"post"}},
      {PageContent:"Successful oil painting ...", Metadata:map[string]any{"author":"B","type":"post"}},
      {PageContent:"For a natural lawn ...",     Metadata:map[string]any{"author":"C","type":"post"}},
    }
    if _,err:=store.AddDocuments(context.Background(),docs); err!=nil{fatalf("add docs: %v",err)}
  }

  if ok,_:=indexExists(c,idx); !ok {
    client.Database(db).CreateCollection(context.Background(),coll)
    if _,err:=createIndex(c,idx,dims,sim); err!=nil{fatalf("index: %v",err)}
  }

  basicSearch(store)
  filterSearch(store)
  rag(store,llm)
}
/* ---------- HELPERS ---------- */
func isEmpty(c *mongo.Collection) bool{
  cnt,_:=c.EstimatedDocumentCount(context.Background()); return cnt==0
}
func indexExists(c *mongo.Collection,name string)(bool,error){
  cur,err:=c.SearchIndexes().List(context.Background(),options.SearchIndexes().SetName(name).SetType("vectorSearch"))
  if err!=nil{return false,err}
  for cur.Next(context.Background()){ if cur.Current.Lookup("queryable").Boolean(){return true,nil}}
  return false,nil
}
func createIndex(c *mongo.Collection,name string,d int,sim string)(string,error){
  def:=bson.M{"fields":[]bson.M{
    {"type":"vector","path":"embeddings","numDimensions":d,"similarity":sim},
    {"type":"filter","path":"metadata.author"},
    {"type":"filter","path":"metadata.type"},
  }}
  view:=c.SearchIndexes()
  id,err:=view.CreateOne(context.Background(),mongo.SearchIndexModel{Definition:def,
    Options:options.SearchIndexes().SetName(name).SetType("vectorSearch")})
  if err!=nil{return "",err}
  // wait until queryable
  for {
    cur,_:=view.List(context.Background(),options.SearchIndexes().SetName(id))
    if cur.Next(context.Background()) && cur.Current.Lookup("queryable").Boolean(){return id,nil}
    time.Sleep(5*time.Second)
  }
}
/* ---------- QUERIES ---------- */
func basicSearch(store mongovector.Store){
  docs,err:=store.SimilaritySearch(context.Background(),"Prevent weeds",1)
  if err!=nil{fmt.Println("search:",err)} else{fmt.Println("Basic:",docs)}
}
func filterSearch(store mongovector.Store){
  filter:=map[string]any{"metadata.type":"post"}
  opts:=[]vectorstores.Option{vectorstores.WithScoreThreshold(0.60),vectorstores.WithFilters(filter)}
  docs,err:=store.SimilaritySearch(context.Background(),"Tulip care",1,opts...)
  if err!=nil{fmt.Println("filter:",err)} else{fmt.Println("Filter:",docs)}
}
/* ---------- RAG ---------- */
func rag(store mongovector.Store,llm llms.Model){
  retriever:=vectorstores.ToRetriever(&store,1,vectorstores.WithScoreThreshold(0.60))
  prompt:=prompts.NewPromptTemplate(
    `Answer the question based on the following context:
{{.context}}
Question: {{.question}}`,
    []string{"context","question"})
  chain:=chains.NewLLMChain(llm,prompt)

  q:="How do I get started painting?"
  docs,_:=retriever.GetRelevantDocuments(context.Background(),q)
  var b strings.Builder
  for i,d:=range docs{b.WriteString(fmt.Sprintf("Doc %d: %s\n",i+1,d.PageContent))}
  out,_:=chains.Call(context.Background(),chain,map[string]any{"context":b.String(),"question":q})
  fmt.Println("Answer:",out["text"])
}
```

Run:
```sh
go run main.go
```

Key operations performed:
1. Load env vars, connect to Atlas.
2. Embed sample docs via OpenAI and store in `langchaingo_db.test`.
3. Create `vector_index` (`vectorSearch`; path: `embeddings`; dims: 1536; similarity: dotProduct) plus filter fields `metadata.author/type`.
4. Example queries:
   - `store.SimilaritySearch(ctx,"Prevent weeds",1)`
   - Same with filters & score threshold.
5. RAG flow: convert store to retriever → prompt template → LLM chain.

This guide shows minimal, executable steps to ingest data, index with Atlas Vector Search, query semantically, filter results, and perform retrieval-augmented generation using LangChainGo.

</section>
<section>
<title>Get Started with the LangChain4j Integration</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/ai-integrations/langchain4j/</url>
<description>Integrate Atlas Vector Search with LangChain4j to build LLM applications in Java.</description>


# LangChain4j + Atlas Vector Search Quickstart

## Prereqs
- Atlas cluster ≥ 6.0.11/7.0.2, IP allow-listed, role `Project Data Access Admin`.
- Env vars  
  `MONGODB_URI=mongodb+srv://<user>:<pwd>@<cluster>/?...`  
  `VOYAGE_AI_KEY=<voyage-ai>`  
  `OPENAI_KEY=<openai>`
- JDK ≥ 8.

## Maven
```xml
<!-- core -->
<dependencyManagement>
  <dependency>
    <groupId>dev.langchain4j</groupId><artifactId>langchain4j-bom</artifactId>
    <version>1.0.0-beta1</version><type>pom</type><scope>import</scope>
  </dependency>
</dependencyManagement>
<dependencies>
  <dependency><groupId>dev.langchain4j</groupId><artifactId>langchain4j-mongodb-atlas</artifactId></dependency>
  <dependency><groupId>dev.langchain4j</groupId><artifactId>langchain4j-voyage-ai</artifactId></dependency>
  <dependency><groupId>org.mongodb</groupId><artifactId>mongodb-driver-sync</artifactId><version>5.4.0</version></dependency>

  <!-- RAG -->
  <dependency><groupId>dev.langchain4j</groupId><artifactId>langchain4j-open-ai</artifactId></dependency>
  <dependency><groupId>dev.langchain4j</groupId><artifactId>langchain4j</artifactId></dependency>
</dependencies>
```

## Imports (`Main.java`)
```java
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import dev.langchain4j.data.document.Metadata;
import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.voyageai.VoyageAiEmbeddingModel;
import dev.langchain4j.store.embedding.*;
import dev.langchain4j.store.embedding.filter.comparison.*;
import dev.langchain4j.store.embedding.mongodb.*;
import java.io.*; import java.util.*; import org.bson.Document;

// RAG
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.langchain4j.service.AiServices;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.openai.OpenAiChatModel;
import dev.langchain4j.rag.content.retriever.*;
```

## Setup
```java
String uri = System.getenv("MONGODB_URI");
String voyageKey = System.getenv("VOYAGE_AI_KEY");

// Embedding model
EmbeddingModel embeddingModel = VoyageAiEmbeddingModel.builder()
       .apiKey(voyageKey).modelName("voyage-3").build();

// Vector store + index (1024-dim cosine)
MongoClient client = MongoClients.create(uri);
boolean createIndex = true;
MongoDbEmbeddingStore embeddingStore = MongoDbEmbeddingStore.builder()
       .databaseName("search")
       .collectionName("langchaintest")
       .indexName("vector_index")
       .createIndex(createIndex)
       .indexMapping(IndexMapping.builder()
             .dimension(embeddingModel.dimension())
             .metadataFieldNames(new HashSet<>()).build())
       .fromClient(client).build();
if (createIndex) Thread.sleep(15_000);
```

## Insert Sample Docs
```java
List<Document> docs = List.of(
 new Document("text","In Zadie Smith's new novel, ...")
     .append("metadata",new Metadata(Map.of("author","A"))),
 new Document("text","Emperor penguins are the tallest...")
     .append("metadata",new Metadata(Map.of("author","D"))),
 new Document("text","Penguins are flightless seabirds ...")
     .append("metadata",new Metadata(Map.of("author","C"))),
 new Document("text","Patagonia is home to five penguin species ...")
     .append("metadata",new Metadata(Map.of("author","B"))));

for (Document d:docs){
   TextSegment seg = TextSegment.from(d.getString("text"), d.get("metadata",Metadata.class));
   embeddingStore.add(embeddingModel.embed(seg).content(), seg);
}
Thread.sleep(5_000);
```

## Semantic Search
```java
Embedding query = embeddingModel.embed("Where do penguins live?").content();
EmbeddingSearchRequest req = EmbeddingSearchRequest.builder()
        .queryEmbedding(query).maxResults(3).build();
embeddingStore.search(req).matches().forEach(m -> {
   System.out.println(m.embedded().text()+" | "+m.embedded().metadata().getString("author")+" | "+m.score());
});
```

### With Metadata Filter
```java
EmbeddingSearchRequest req = EmbeddingSearchRequest.builder()
        .queryEmbedding(query)
        .filter(new IsIn("author", List.of("B","C")))
        .maxResults(3).build();
```

## RAG Workflow

### Load External JSON
```java
private static List<Document> loadJsonDocuments(String path) throws IOException{
  InputStream in = Main.class.getClassLoader().getResourceAsStream(path);
  if(in==null) throw new FileNotFoundException(path);
  return new ObjectMapper().readValue(in, new TypeReference<>(){});
}

// call inside main
List<Document> rainforest = loadJsonDocuments("rainforest-docs.json");
for(Document d:rainforest){
  TextSegment seg = TextSegment.from(d.getString("text"), new Metadata(d.get("metadata",Map.class)));
  embeddingStore.add(embeddingModel.embed(seg).content(), seg);
}
Thread.sleep(5_000);
```

### Chat Model & Retriever
```java
ChatLanguageModel chatModel = OpenAiChatModel.builder()
        .apiKey(System.getenv("OPENAI_KEY")).modelName("gpt-4").build();

ContentRetriever retriever = EmbeddingStoreContentRetriever.builder()
        .embeddingStore(embeddingStore)
        .embeddingModel(embeddingModel)
        .maxResults(3).minScore(0.75).build();
```

### Assistant Interface
```java
public interface Assistant { String answer(String question); }
Assistant assistant = AiServices.builder(Assistant.class)
        .chatLanguageModel(chatModel)
        .contentRetriever(retriever).build();
```

### Ask
```java
String output = assistant.answer("What types of insects live in the rainforest?");
System.out.println(output);
```

The assistant uses Atlas Vector Search to fetch top-k (≥0.75 score) documents, then GPT-4 to generate the final answer.

</section>
<section>
<title>Get Started with the LlamaIndex Integration</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/ai-integrations/llamaindex/</url>
<description>Integrate Atlas Vector Search with LlamaIndex to build RAG applications.</description>


# LlamaIndex + Atlas Vector Search Quickstart

## Prerequisites
- Atlas cluster (MongoDB ≥ 6.0.11/7.0.2), IP allow-listed  
- OpenAI API key with credits  
- Python notebook (e.g., Colab)

## 1  Install & Import
```python
!pip install -q --upgrade llama-index llama-index-vector-stores-mongodb \
                     llama-index-embeddings-openai pymongo
import os, pymongo
from pymongo.operations import SearchIndexModel
from llama_index.core import (SimpleDirectoryReader, VectorStoreIndex,
                              StorageContext)
from llama_index.core.settings import Settings
from llama_index.core.retrievers import VectorIndexRetriever
from llama_index.core.vector_stores import ExactMatchFilter, MetadataFilters
from llama_index.core.query_engine import RetrieverQueryEngine
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.llms.openai import OpenAI
from llama_index.vector_stores.mongodb import MongoDBAtlasVectorSearch
```

## 2  Env Vars & LlamaIndex Settings
```python
os.environ["OPENAI_API_KEY"] = "<openai-key>"
ATLAS_CONNECTION_STRING = "mongodb+srv://<user>:<pwd>@<cluster>.mongodb.net"

Settings.llm = OpenAI()
Settings.embed_model = OpenAIEmbedding(model="text-embedding-ada-002")
Settings.chunk_size, Settings.chunk_overlap = 100, 10
```

## 3  Load Data
```python
!mkdir -p data
!wget https://query.prod.cms.rt.microsoft.com/cms/api/am/binary/RE4HkJP \
      -O data/atlas_best_practices.pdf
docs = SimpleDirectoryReader(input_files=["data/atlas_best_practices.pdf"]).load_data()
```

## 4  Create Vector Store & Index (Build Embeddings)
```python
client = pymongo.MongoClient(ATLAS_CONNECTION_STRING)
vstore = MongoDBAtlasVectorSearch(client,
          db_name="llamaindex_db", collection_name="test",
          vector_index_name="vector_index")
ctx = StorageContext.from_defaults(vector_store=vstore)

vs_index = VectorStoreIndex.from_documents(docs, storage_context=ctx,
                                           show_progress=True)
```

## 5  Create Atlas Vector Search Index (one-time DDL)
Requires Atlas role `Project Data Access Admin+`.
```python
collection = client["llamaindex_db"]["test"]
search_index = SearchIndexModel(
  name="vector_index", type="vectorSearch",
  definition={
    "fields":[
      {"type":"vector","path":"embedding","numDimensions":1536,"similarity":"cosine"},
      {"type":"filter","path":"metadata.page_label"}
]})
collection.create_search_index(model=search_index)
```

## 6  Query Examples

### 6.1 Semantic Search (top-3)
```python
nodes = vs_index.as_retriever(similarity_top_k=3)\
                .retrieve("MongoDB Atlas security")
for n in nodes: print(n.text, n.score)
```

### 6.2 Semantic Search + Metadata Filter (page 17)
```python
flt = MetadataFilters(filters=[ExactMatchFilter(
        key="metadata.page_label", value="17")])
nodes = vs_index.as_retriever(similarity_top_k=3, filters=flt)\
                .retrieve("MongoDB Atlas security")
```

## 7  Retrieval-Augmented Generation (RAG)

### 7.1 Basic
```python
retriever = VectorIndexRetriever(index=vs_index, similarity_top_k=5)
qe = RetrieverQueryEngine(retriever=retriever)
print(qe.query("How can I secure my MongoDB Atlas cluster?"))
```

### 7.2 RAG with Filter (page 17 only)
```python
flt = MetadataFilters(filters=[ExactMatchFilter(
        key="metadata.page_label", value="17")])
retriever = VectorIndexRetriever(index=vs_index,
                                 filters=flt, similarity_top_k=5)
qe = RetrieverQueryEngine(retriever=retriever)
print(qe.query("How can I secure my MongoDB Atlas cluster?"))
```

## Next Steps
Explore additional LlamaIndex connectors, query engines (LlamaHub) or extend to chat (Chat Engine).

</section>
<section>
<title>Integrate Semantic Kernel with Atlas Vector Search</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/ai-integrations/semantic-kernel/</url>

# Integrate Semantic Kernel with Atlas Vector Search

Refer to “Get Started with the Semantic Kernel Integration” for Python and C#.

</section>
<section>
<title>Get Started with the Semantic Kernel Python Integration</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/ai-integrations/semantic-kernel-python/</url>
<description>Integrate Atlas Vector Search with Microsoft Semantic Kernel to build Gen AI applications and implement RAG.</description>


# Semantic Kernel Python + Atlas Vector Search Quickstart

## Prereqs
• Atlas cluster 6.0.11+/7.0.2+ (IP allowlist)  
• OpenAI API key  
• Python notebook

## Install & Import
```python
pip install -qU semantic-kernel openai motor
import semantic_kernel as sk
from semantic_kernel.connectors.ai.open_ai import OpenAIChatCompletion, OpenAITextEmbedding
from semantic_kernel.connectors.memory.mongodb_atlas import MongoDBAtlasMemoryStore
from semantic_kernel.core_plugins.text_memory_plugin import TextMemoryPlugin
from semantic_kernel.memory.semantic_text_memory import SemanticTextMemory
from semantic_kernel.prompt_template import InputVariable, PromptTemplateConfig
from pymongo import MongoClient
from pymongo.operations import SearchIndexModel
```

## Env vars
```python
OPENAI_API_KEY="..."
ATLAS_CONNECTION_STRING="mongodb+srv://<user>:<pwd>@<cluster>.mongodb.net"
```

## Kernel & Memory
```python
kernel=sk.Kernel()
kernel.add_service(OpenAIChatCompletion("chat","gpt-3.5-turbo",OPENAI_API_KEY))
embed=OpenAITextEmbedding("text-embedding-ada-002",OPENAI_API_KEY)
kernel.add_service(embed)

store=MongoDBAtlasMemoryStore(ATLAS_CONNECTION_STRING,"semantic_kernel_db","vector_index")
memory=SemanticTextMemory(storage=store,embeddings_generator=embed)
kernel.add_plugin(TextMemoryPlugin(memory),"TextMemoryPlugin")
```

### Load docs
```python
async def load():
    await memory.save_information("test","1","I am a developer")
    await memory.save_information("test","2","I started using MongoDB two years ago")
    await memory.save_information("test","3","I'm using MongoDB Vector Search with Semantic Kernel to implement RAG")
    await memory.save_information("test","4","I like coffee")
await load()
```

## Create Vector Index (need Project Data Access Admin)
```python
coll=MongoClient(ATLAS_CONNECTION_STRING)["semantic_kernel_db"]["test"]
idx=SearchIndexModel(
  {"fields":[{"type":"vector","path":"embedding","numDimensions":1536,"similarity":"cosine"}]},
  name="vector_index",type="vectorSearch")
coll.create_search_index(model=idx)
```

## Vector Search
```python
res=await memory.search("test","What is my job title?")
print(res[0].text,res[0].relevance)   # I am a developer 0.89
```

## RAG Example
```python
settings=kernel.get_service("chat").instantiate_prompt_execution_settings("chat")
tmpl="""Answer based on context.\n\nQuestion: {{$input}}\nContext: {{$context}}"""
cfg=PromptTemplateConfig(settings,[InputVariable("input"),InputVariable("context")],tmpl)
rag=kernel.add_function("RAG","TextMemoryPlugin",prompt_template_config=cfg)

q="When did I start using MongoDB?"
ctx=(await memory.search("test",q))[0].text
ans=await rag.invoke(kernel=kernel,input=q,context=ctx)
print(ans)  # You started using MongoDB two years ago.
```

Links: Atlas Vector Search RAG guide, notebook.

</section>
<section>
<title>Get Started with the Semantic Kernel C# Integration</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/ai-integrations/semantic-kernel-csharp/</url>
<description>Integrate Atlas Vector Search with Microsoft Semantic Kernel to build Gen AI applications and implement RAG in C#.</description>


# Atlas Vector Search + Semantic Kernel (C#) Quickstart

## Prereqs
- Atlas cluster ≥ 6.0.11/7.0.2, IP allow-listed  
- OpenAI API key with credits  
- .NET SDK + terminal/editor  
- Atlas role: Project Data Access Admin (to create index)

## 1. App Scaffold
```bash
mkdir sk-mongodb && cd sk-mongodb
dotnet new console
dotnet add package Microsoft.SemanticKernel
dotnet add package Microsoft.SemanticKernel.Connectors.MongoDB --prerelease
dotnet add package Microsoft.SemanticKernel.Connectors.OpenAI
dotnet add package Microsoft.SemanticKernel.Memory
dotnet add package Microsoft.SemanticKernel.Plugins.Memory --prerelease
export OPENAI_API_KEY="<key>"
export ATLAS_CONNECTION_STRING="mongodb+srv://<user>:<pass>@<cluster>.mongodb.net"
```

## 2. Program.cs (store docs)
```csharp
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.Connectors.MongoDB;
using Microsoft.SemanticKernel.Connectors.OpenAI;
using Microsoft.SemanticKernel.Memory;
using Microsoft.SemanticKernel.Plugins.Memory;

var conn = Environment.GetEnvironmentVariable("ATLAS_CONNECTION_STRING")!;
var openAi = Environment.GetEnvironmentVariable("OPENAI_API_KEY")!;
var embed = new OpenAITextEmbeddingGenerationService("text-embedding-ada-002", openAi);

var kb = Kernel.CreateBuilder();
kb.AddOpenAIChatCompletion("gpt-3.5-turbo", openAi);
var kernel = kb.Build();

var store = new MongoDBMemoryStore(conn, "semantic_kernel_db", indexName: "vector_index");
var mem   = new SemanticTextMemory(store, embed);

// sample docs
await mem.SaveInformationAsync("test", "I am a developer", id:"1");
await mem.SaveInformationAsync("test", "I started using MongoDB two years ago", id:"2");
await mem.SaveInformationAsync("test", "I'm using MongoDB Vector Search with Semantic Kernel to implement RAG", id:"3");
await mem.SaveInformationAsync("test", "I like coffee", id:"4");
```
Run: `dotnet run`

## 3. Atlas Vector Search Index (`vector_index`)
JSON (use Atlas UI/API):
```json
{
  "fields": [
    { "type": "vector", "path": "embedding",
      "numDimensions": 1536, "similarity": "cosine" }
  ]
}
```
Collection: `semantic_kernel_db.test`

## 4. Semantic Search
Append:
```csharp
await foreach (var r in mem.SearchAsync("test", "What is my job title?"))
    Console.WriteLine($"{r.Metadata.Text}  {r.Relevance}");
```
Output → `I am a developer  0.89`

## 5. RAG Example
```csharp
kernel.ImportPluginFromObject(new TextMemoryPlugin(mem));
const string prompt = @"
Answer the question using the context.
Question: {{$input}}
Context: {{recall 'When did I start using MongoDB?'}}";

var fn = kernel.CreateFunctionFromPrompt(prompt, new OpenAIPromptExecutionSettings());
var ans = await kernel.InvokeAsync(fn, new() {
    [TextMemoryPlugin.InputParam] = "When did I start using MongoDB?",
    [TextMemoryPlugin.CollectionParam] = "test"
});
Console.WriteLine(ans.GetValue<string>());  // → You started using MongoDB two years ago.
```

Replace prompt/query/collection to use your own data.

</section>
<section>
<title>Get Started with the Haystack Integration</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/ai-integrations/haystack/</url>
<description>Integrate Atlas Vector Search with Haystack to build Gen AI applications and implement RAG.</description>


# MongoDB Atlas Vector Search + Haystack Quickstart

Prereqs  
• Atlas cluster 6.0.11 / 7.0.2+ (IP whitelisted, “Project Data Access Admin” to create index)  
• OpenAI key with quota  
• Python notebook

```bash
pip install --quiet --upgrade mongodb-atlas-haystack pymongo
```

```python
import os
from pymongo import MongoClient
from pymongo.operations import SearchIndexModel
from haystack import Pipeline, Document
from haystack.components.embedders import OpenAITextEmbedder, OpenAIDocumentEmbedder
from haystack.components.writers import DocumentWriter
from haystack.components.builders.prompt_builder import PromptBuilder
from haystack.components.generators import OpenAIGenerator
from haystack_integrations.document_stores.mongodb_atlas import MongoDBAtlasDocumentStore
from haystack_integrations.components.retrievers.mongodb_atlas import MongoDBAtlasEmbeddingRetriever

os.environ["OPENAI_API_KEY"]="‹api›"
os.environ["MONGO_CONNECTION_STRING"]="mongodb+srv://<user>:<pwd>@<cluster>.mongodb.net"
```

## 1 Create Vector Index

```python
client = MongoClient(os.environ["MONGO_CONNECTION_STRING"])
client.haystack_db.create_collection("test")              # no-op if exists
model = SearchIndexModel(
  name="vector_index",
  type="vectorSearch",
  definition={"fields":[{"type":"vector","path":"embedding",
                         "numDimensions":1536,"similarity":"cosine"}]})
client.haystack_db.test.create_search_index(model=model)
```

## 2 Document Store

```python
doc_store = MongoDBAtlasDocumentStore(
    database_name="haystack_db",
    collection_name="test",
    vector_search_index="vector_index")
```

## 3 Index Documents

```python
docs=[Document(content="My name is Jean and I live in Paris."),
      Document(content="My name is Mark and I live in Berlin."),
      Document(content="My name is Giorgio and I live in Rome.")]
pipe=Pipeline()
pipe.add_component("embed", OpenAIDocumentEmbedder())
pipe.add_component("write", DocumentWriter(document_store=doc_store))
pipe.connect("embed.documents","write.documents")
pipe.run({"embed":{"documents":docs}})
```

## 4 RAG Query

```python
TEMPLATE = """You are an assistant allowed to use the following context documents.
Documents:
{% for doc in documents %}{{ doc.content }}{% endfor %}
Query: {{query}}
Answer:
"""
rag = Pipeline()
rag.add_component("q_emb", OpenAITextEmbedder())
rag.add_component("retr", MongoDBAtlasEmbeddingRetriever(document_store=doc_store, top_k=15))
rag.add_component("prompt", PromptBuilder(template=TEMPLATE))
rag.add_component("llm", OpenAIGenerator())
rag.connect("q_emb.embedding","retr.query_embedding")
rag.connect("retr","prompt.documents")
rag.connect("prompt","llm")

query="Where does Mark live?"
print(rag.run({"q_emb":{"text":query},"prompt":{"query":query}})["llm"]["replies"][0])
# → Mark lives in Berlin.
```



</section>
<section>
<title>Get Started with the Spring AI Integration</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/ai-integrations/spring-ai/</url>
<description>Integrate Atlas Vector Search with Spring AI to build Gen AI applications.</description>


# Spring AI + Atlas Vector Search Quick Guide

## Prerequisites
- Atlas cluster MongoDB ≥ 6.0.11, IP allow-listed  
- OpenAI API key with credits  
- JDK 8+ & Maven project

## Project Setup
Spring Initializr → Maven, Java 21, add deps “MongoDB Atlas Vector Database”, “Spring Data MongoDB”.

pom.xml (core parts):
```xml
<dependency>
  <groupId>org.springframework.ai</groupId>
  <artifactId>spring-ai-openai-spring-boot-starter</artifactId>
</dependency>
<dependency>
  <groupId>org.springframework.ai</groupId>
  <artifactId>spring-ai-spring-boot-autoconfigure</artifactId>
</dependency>
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-web</artifactId>
</dependency>

<dependencyManagement>
  <dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-bom</artifactId>
    <version>${spring-ai.version}</version>
    <type>pom</type><scope>import</scope>
  </dependency>
</dependencyManagement>

<repositories>
  <repository><id>spring-snapshots</id><url>https://repo.spring.io/snapshot</url><releases><enabled>false</enabled></releases></repository>
</repositories>
```
`<properties><spring-ai.version>1.0.0-SNAPSHOT</spring-ai.version></properties>`

application.properties
```properties
spring.ai.openai.api-key=<OPENAI_KEY>
spring.ai.openai.embedding.options.model=text-embedding-ada-002
spring.data.mongodb.uri=<MONGODB_URI>
spring.data.mongodb.database=springai_test
spring.ai.vectorstore.mongodb.collection-name=vector_store
spring.ai.vectorstore.mongodb.indexName=vector_index
spring.ai.vectorstore.mongodb.initialize-schema=true
```
URI: `mongodb+srv://<user>:<pwd>@<cluster>.<host>.mongodb.net/?<settings>`

## Atlas Vector Search Index (springai_test.vector_store)
```json
{
  "fields": [{
    "path":"embedding","type":"vector",
    "numDimensions":1536,"similarity":"cosine"
  }]
}
```
Spring AI auto-creates if `initialize-schema=true` and Atlas role ≥ Project Data Access Admin.

## Spring Configuration (`config/Config.java`)
```java
@Configuration @EnableAutoConfiguration
public class Config {
  @Value("${spring.ai.openai.api-key}") String openAiKey;
  @Value("${spring.ai.vectorstore.mongodb.initialize-schema}") Boolean initSchema;

  @Bean EmbeddingModel embeddingModel(){
    return new OpenAiEmbeddingModel(new OpenAiApi(openAiKey));
  }
  @Bean VectorStore mongodbVectorStore(MongoTemplate t, EmbeddingModel m){
    return new MongoDBAtlasVectorStore(t, m,
      MongoDBAtlasVectorStore.MongoDBVectorStoreConfig.builder().build(), initSchema);
  }
}
```

## REST Endpoints (`controller/Controller.java`)
```java
@RestController @RequestMapping("/tutorial")
public class Controller {
  @Autowired VectorStore vectorStore;

  @GetMapping("/add")
  public String add(){
    vectorStore.add(List.of(
      new Document("Proper tuber planting ...", Map.of("author","A","type","post")),
      new Document("Successful oil painting ...", Map.of("author","A")),
      new Document("For a natural lawn ...", Map.of("author","B","type","post"))
    ));
    return "Documents added";
  }

  @GetMapping("/search")
  public List<Map<String,Object>> search(){
    return vectorStore.similaritySearch(
      SearchRequest.query("learn how to grow things").withTopK(2))
      .stream().map(d->Map.of("content",d.getContent(),"metadata",d.getMetadata())).toList();
  }

  @GetMapping("/searchAuthorA")   // with metadata filter
  public List<Map<String,Object>> searchA(){
    FilterExpressionBuilder b=new FilterExpressionBuilder();
    return vectorStore.similaritySearch(
      SearchRequest.defaults()
        .withQuery("learn how to grow things").withTopK(2)
        .withSimilarityThreshold(0.5)
        .withFilterExpression(b.eq("author","A").build()));
  }
}
```
Metadata fields used for filtering must be added to the Atlas Vector Search index as `filter` paths.

## Run & Test
```bash
./mvnw spring-boot:run        # app on localhost:8080
curl http://localhost:8080/tutorial/add
curl http://localhost:8080/tutorial/search
```

</section>
<section>
<title>Get Started with the Amazon Bedrock Knowledge Base Integration</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/ai-integrations/amazon-bedrock/</url>
<description>Use Atlas Vector Search as a knowledge base for Amazon Bedrock to build generative AI and RAG applications.</description>


# Amazon Bedrock Knowledge Base Integration with MongoDB Atlas

Atlas KB support: AWS US regions only.

## Prereqs
- Atlas M10+ cluster (MongoDB ≥ 6.0.11 / 7.0.2).
- AWS account, Secrets Manager secret with Atlas credentials.
- Model access: “Amazon Titan Embeddings G1 – Text”, “Anthropic Claude V2.1”.
- AWS CLI & npm (if using PrivateLink).

## 1 . Load Data
1. Download MongoDB Best Practices PDF → upload to an S3 bucket (`s3://<bucket>/...`).

## 2 . (Optional) PrivateLink
1. Create AWS PrivateLink endpoint for Atlas VPC.
2. Deploy partner CDK script (Network Load Balancer → endpoint).

## 3 . Create Atlas Vector Search Index
```
Collection: bedrock_db.test
Index  : vector_index   (type: vectorSearch)
Fields :
  - embedding (type: vector, numDimensions:1024, similarity:"cosine")
  - bedrock_metadata (filter)
  - bedrock_text_chunk (filter)
  - x-amz-bedrock-kb-document-page-number (filter)   # replaces old page_number
Access : Project Data Access Admin+
```
UI path: Clusters → Browse Collections → +Create Database (`bedrock_db`) & Collection (`test`) → Atlas Search → Create Search Index (Vector Search) → paste JSON above → Create Vector Search Index.

## 4 . Create Knowledge Base in Bedrock
Amazon Bedrock Console → Knowledge Bases → Create “Knowledge base with vector store”  
Settings:  
- Name: `mongodb-atlas-knowledge-base`  
- Data source: S3 URI (bucket with PDF)  
- Embedding model: Titan Embeddings G1 – Text  
Vector database:
```
Type        : Use existing vector store → MongoDB Atlas
Hostname    : <clusterName>.mongodb.net
Database    : bedrock_db
Collection  : test
Secret ARN  : arn:aws:secretsmanager:...   # Atlas user/pass
Mappings
  Vector index name          : vector_index
  Vector embedding field path: embedding
  Text field path            : bedrock_text_chunk
  Metadata field path        : bedrock_metadata
  (Optional) Text search index name: <text_index>   # for hybrid search
PrivateLink Service Name     : <svc-name>  # if used
```
Review → Create knowledge base → Sync data source; vectors visible in Atlas `bedrock_db.test`.

## 5 . Create RAG Agent
Bedrock → Agents → Create  
- Name: `mongodb-rag-agent`  
- Model: Anthropic Claude V2.1  
- Instructions example:  
  ```
  You are a friendly AI chatbot that answers questions about working with MongoDB.
  ```  
Add Knowledge Base → select `mongodb-atlas-knowledge-base`, description e.g.  
```
This knowledge base describes best practices when working with MongoDB.
```
Save → Prepare → Test (e.g. “What’s the best practice to reduce network utilization with MongoDB?”) → agent retrieves docs via Atlas Vector Search and responds.

## Notes
- Hybrid search: supply Text search index name during KB setup.
- Region limitation: Atlas KB only in US AWS regions.
- Rename filter field to `x-amz-bedrock-kb-document-page-number`; older `page_number` no longer works.

</section>
<section>
<title>Hybrid Search with Amazon Bedrock and Atlas</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/ai-integrations/amazon-bedrock/hybrid-search/</url>
<description>Perform hybrid search by using the Amazon Bedrock knowledge base integration for Atlas Vector Search.</description>


# Hybrid Search: Amazon Bedrock + MongoDB Atlas

• Region: AWS us-west-2, us-east-1 only.  
• Collection must have **both** Atlas Vector Search index **and** Atlas Search index.

## Create Indexes
```json
// Atlas Search index (name: search_index, db: bedrock_db, coll: test)
{
  "mappings": { "dynamic": true }
}
```
Create Atlas Vector Search index via UI (any name).

## Enable Hybrid Search in Bedrock

### Console
1. Amazon Bedrock → Knowledge Bases.  
2. Create/edit KB; Vector store → Text search index name = `search_index`. Save.  
3. Open KB → Test knowledge base → ⚙️ → Search type = “Hybrid search (semantic & text)”. (Optional: disable “Generate response”.)

### API
```json
// part of Create/UpdateKnowledgeBase
"vectorStoreConfig": {
  "mongoDbAtlas": {
    "clusterName": "...",
    "databaseName": "bedrock_db",
    "collectionName": "test",
    "textIndexName": "search_index"      // NEW
  },
  "overrideSearchType": "HYBRID"          // in KnowledgeBaseVectorSearchConfiguration
}
```
`HYBRID` applies to Retrieve and RetrieveAndGenerate calls.

After configuration, test KB or use in agents.

</section>
<section>
<title>Troubleshooting the Amazon Bedrock Knowledge Base Integration</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/ai-integrations/amazon-bedrock/troubleshooting/</url>
<description>Troubleshoot issues related to the Amazon Bedrock knowledge base integration for MongoDB Atlas.</description>


# Troubleshooting Amazon Bedrock KB + Atlas Vector Search

## General

### Knowledge Base Creation
- Cluster hostname:  
  ```
  <clusterName>.mongodb.net
  ```  
  If using PrivateLink, hostname **must include `-pl`**.  
- DB, collection, and vector index names must match Atlas; user needs DB access.  
- Secrets Manager: correct username/password keys & ARNs.  
- PrivateLink service endpoint must be in same AWS account as KB.  
- IAM role errors → verify `iam:*Role` permissions.

### Sync / Retrieval
- Source format must match model (e.g., text).  
- Confirm cluster connectivity, creds, network.  
- Vector index `numDimensions` must equal model dimension.  
- Filtering: metadata fields must be declared as `preFilter` fields and exist in docs.  
- After S3 adds/edits/deletes, run KB sync (incremental).

## Error → Fix

| Error | Resolution |
|-------|------------|
| `AccessDeniedException … iam:CreateRole` | Grant IAM permissions to create roles/policies. |
| `ConflictException … status CREATING` | Wait until KB status **Ready**, then sync. |
| `You must save your agent …` | Save agent, then attach KB. |
| `Access denied when calling Bedrock` | Request access to the chosen foundation model. |
| `BSON field '$vectorSearch.queryVector.####' is the wrong type 'int'` (Titan Text Embedding) | Known issue; contact MongoDB Support. |
| Index filter field error | Rename `page_number` filter to `x-amz-bedrock-kb-document-page-number` in index definition. |



</section>
<section>
<title>Integrate Atlas with Google Vertex AI</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/ai-integrations/google-vertex-ai/</url>
<description>Integrate Google Vertex AI with MongoDB Atlas to build and deploy AI applications.</description>


# Integrate Atlas with Google Vertex AI

Prereqs  
• Atlas cluster ≥ 6.0.11/7.0.2; IP whitelisted  
• Google Cloud project with Vertex AI API enabled  

## VM (Google Cloud)
Name `vertexai-chatapp`; region/zone near you  
Series High Memory, type `n1-standard-1`  
Boot disk 100 GB  
Access: Full Cloud APIs; Firewall: allow all  
Networking: reserve static external IP  

## Demo RAG App
1. Atlas Vector Search index  
   • Namespace `vertexaiApp.chat-vec`  
   • Index name `vector_index`, dims 768, default settings  

2. SSH to VM & install  
```bash
git clone https://github.com/mongodb-partners/MongoDB-VertexAI-Qwiklab.git
sudo apt update && sudo apt install -y python3-pip git
cd MongoDB-VertexAI-Qwiklab
pip3 install -r requirements.txt
```

3. Run UI  
```bash
streamlit run app.py
```  
Open `http://<VM_IP>:<port>`.

## Use
Upload PDFs → app chunks text, creates Vertex AI embeddings, stores in `vertexaiApp.chat-vec`.  
Q&A tab → ask question; app runs vector search + Vertex AI chat (RAG) to answer.

</section>
<section>
<title>Use Vertex AI Extensions for Natural Language MongoDB Queries</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/ai-integrations/google-vertex-ai/extensions/</url>
<description>Use Vertex AI Extensions to perform real-time data querying and run natural language queries on MongoDB Atlas.</description>


# Vertex AI + MongoDB Atlas NL Query Guide

## Prereqs
- Atlas cluster (sample data loaded) & connection string `mongodb+srv://<user>:<pwd>@<cluster>.<hostname>.mongodb.net`
- GCP project, Colab Enterprise, GCS bucket, enabled APIs: Cloud Build/Functions/Run/Logging/PubSub
- Gemini 1.5 Pro model access

## 1 Cloud Run Function (`mongodb_crud`)
Python 3, allow **unauthenticated**.  
Entry point `mongodb_crud`, deps:
```text
functions-framework==3.*
pymongo[srv]
```
Handler supports paths ➜ PyMongo ops:

| Path            | Required JSON fields | Result key  |
|-----------------|----------------------|-------------|
| /findOne        | database, collection, filter{}, projection{} | document |
| /find           | database, collection, filter{}, sort{}, skip, limit, projection{} | documents[] |
| /insertOne      | database, collection, document | insertedId |
| /insertMany     | database, collection, documents[] | insertedIds[] |
| /updateOne/Many | database, collection, filter, update, upsert(bool) | matchedCount, modifiedCount |
| /deleteOne/Many | database, collection, filter | deletedCount |
| /aggregate      | database, collection, pipeline[] | documents[] |

All `_id` ObjectIds are stringified. Return codes: 200 JSON, 400 on error.

Deploy, note **HTTPS endpoint** and **service-account**.

## 2 Vertex AI Extension (Colab)

```python
!pip install -q --force-reinstall google_cloud_aiplatform langchain==0.0.298 bigframes==0.26.0
from google.colab import auth; auth.authenticate_user()
!gcloud config set project <PROJECT_ID>
```

Set env vars:
```python
import os
os.environ.update({
 'PROJECT_ID':'<proj>',
 'REGION':'us-central1',
 'STAGING_BUCKET':'gs://vertexai_extensions',
 'OPENAPI_GCS_URI':'gs://vertexai_extensions/mongodbopenapispec.yaml',
 'LLM_MODEL':'gemini-1.5-pro'
})
```

Upload OpenAPI 3 YAML describing the Cloud Run endpoints to `OPENAPI_GCS_URI`.

Create extension:
```python
from vertexai.preview import extensions
mdb_crud = extensions.Extension.create(
  display_name="MongoDB Vertex API Interpreter",
  description="CRUD on MongoDB via NL",
  manifest={
    "name":"mdb_crud_interpreter",
    "description":"CRUD on MongoDB via NL",
    "api_spec":{"open_api_gcs_uri":os.environ['OPENAPI_GCS_URI']},
    "authConfig":{"authType":"OAUTH",
                  "oauthConfig":{"service_account":"<function-svc-acct>"}}
})
```
Validate:
```python
print(mdb_crud.operation_schemas())
```

## 3 Run NL Queries (Gemini 1.5 Pro)

```python
from vertexai.preview.generative_models import GenerativeModel, Tool
chat = GenerativeModel(os.environ['LLM_MODEL']).start_chat()
msg = "Find the release year of the movie 'A Corner in Wheat' from VertexAI-POC cluster, sample_mflix, movies"
resp = chat.send_message(msg, tools=[Tool.from_dict({"function_declarations": mdb_crud.operation_schemas()})])
out = mdb_crud.execute(
    operation_id=resp.candidates[0].content.parts[0].function_call.name,
    operation_params=resp.candidates[0].content.parts[0].function_call.args)
print(out)
```
Change `msg` for other questions, e.g.  
`"give me movies released in year 1924 from VertexAI-POC cluster, sample_mflix, movies"`.

</section>
<section>
<title>Build AI Agents with Vertex AI Agent Engine and Atlas</title>
<url>https://mongodb.com/docs/atlas/atlas-vector-search/ai-integrations/google-vertex-ai/agent-engine/</url>
<description>Use the Google Vertex AI Agent Engine with MongoDB Atlas to build and deploy AI agents in production and implement agentic RAG.</description>


# Vertex AI Agent Engine × MongoDB Atlas Quick-Start

## Prereqs
* Atlas cluster in GCP region  
* Google Cloud project with Vertex AI enabled  
* Colab/Jupyter notebook

## Install
```bash
pip install -q \
 "google-cloud-aiplatform[langchain,agent_engines]" \
 requests datasets pymongo certifi \
 langchain langchain-community langchain-mongodb \
 langchain-google-vertexai langchain_google_genai \
 beautifulsoup4
```

## Atlas Vector Search
```python
from pymongo import MongoClient
from pymongo.operations import SearchIndexModel

uri = "mongodb+srv://<user>:<pwd>@<cluster>.<host>.mongodb.net"
client = MongoClient(uri)
db = client["AGENT-ENGINE"]
for name in ("sample_starwars_embeddings","sample_startrek_embeddings"):
    coll = db[name]
    coll.create_search_index(
        SearchIndexModel(
            {
              "fields":[
                {"type":"vector","path":"embedding",
                 "numDimensions":768,"similarity":"cosine"}
              ]
            },
            name="vector_index",
            type="vectorSearch",
        )
    )
```

## Init Vertex AI
```python
import vertexai, os
vertexai.init(project="<project-id>",
              location="<region>",
              staging_bucket="gs://<bucket>")
```

## Scrape → Embed → Insert
```python
from bs4 import BeautifulSoup
from vertexai.language_models import TextEmbeddingModel
import requests, certifi

def ingest(url, coll):
    html = requests.get(url,timeout=30).text
    text = ' '.join(p.text for p in BeautifulSoup(html,'html.parser').find_all('p'))
    chunks=[text[i:i+1000] for i in range(0,len(text),1000)]
    embeds = TextEmbeddingModel.from_pretrained("text-embedding-005").get_embeddings(chunks)
    coll.insert_many({"chunk":c,"embedding":e.values} for c,e in zip(chunks,embeds))

ingest("https://en.wikipedia.org/wiki/Star_Wars", db.sample_starwars_embeddings)
ingest("https://en.wikipedia.org/wiki/Star_Trek", db.sample_startrek_embeddings)
```

## Retrieval Tool Template
```python
def make_query_tool(namespace):
    def tool(query:str):
        from langchain_mongodb import MongoDBAtlasVectorSearch
        from langchain_google_vertexai import VertexAIEmbeddings, ChatVertexAI
        from langchain.chains import ConversationalRetrievalChain
        from langchain.memory import ConversationBufferWindowMemory
        from langchain.prompts import PromptTemplate

        prompt = PromptTemplate(
            template=("Use the context to answer in ≤3 sentences; "
                      "say you don't know if unsure.\n\n{context}\n\nQuestion:{question}"),
            input_variables=["context","question"]
        )

        vs = MongoDBAtlasVectorSearch.from_connection_string(
            connection_string=uri,
            namespace=namespace,
            embedding=VertexAIEmbeddings(model_name="text-embedding-005"),
            index_name="vector_index",
            embedding_key="embedding",
            text_key="chunk",
        )
        chain = ConversationalRetrievalChain.from_llm(
            llm=ChatVertexAI(model_name="gemini-pro",max_output_tokens=1000),
            retriever=vs.as_retriever(search_type="mmr",
                                      search_kwargs={"k":10,"lambda_mult":0.25}),
            memory=ConversationBufferWindowMemory(k=5,return_messages=True),
            combine_docs_chain_kwargs={"prompt":prompt},
        )
        return chain({"question":query})
    return tool

star_wars_query_tool = make_query_tool("AGENT-ENGINE.sample_starwars_embeddings")
star_trek_query_tool = make_query_tool("AGENT-ENGINE.sample_startrek_embeddings")
```

## Session Memory
```python
from langchain.memory import ChatMessageHistory
store={}
def get_session_history(id:str):
    store.setdefault(id, ChatMessageHistory())
    return store[id]
```

## Agent (local)
```python
from vertexai.preview.reasoning_engines import LangchainAgent

agent = LangchainAgent(
    model="gemini-1.5-pro-001",
    chat_history=get_session_history,
    model_kwargs={"temperature":0},
    tools=[star_wars_query_tool, star_trek_query_tool],
    agent_executor_kwargs={"return_intermediate_steps":True},
)

print(agent.query("Who played Darth Vader?", config={"configurable":{"session_id":"demo"}})["output"])
```

## Deploy to Vertex AI Agent Engine
```python
from vertexai import agent_engines
remote_agent = agent_engines.create(
    agent,
    requirements=[
      "google-cloud-aiplatform[agent_engines,langchain]",
      "cloudpickle==3.0.0","pydantic>=2.10","requests",
      "langchain-mongodb","pymongo","langchain-google-vertexai",
    ],
)
```

Retrieve resource name:  
```python
from googleapiclient import discovery
pid="<project-id>"
proj_num=discovery.build("cloudresourcemanager","v1").projects().get(projectId=pid).execute()["projectNumber"]
# resource format: projects/{proj_num}/locations/<region>/reasoningEngines/{id}
```

### Remote Query
```python
from vertexai.preview import reasoning_engines
engine = reasoning_engines.ReasoningEngine("<full-resource-name>")
print(engine.query("tell me about episode 1 of star wars",
      config={"configurable":{"session_id":"demo"}})["output"])
```

</section>
</guide>