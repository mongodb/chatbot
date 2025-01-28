# How to Model Documents for Vector Search to Improve Querying Capabilities

Atlas Vector Search was recently released, so let’s dive into a tutorial on how to properly model your documents when utilizing vector search to revolutionize your querying capabilities!

## Data modeling normally in MongoDB

Vector search is new, so let’s first go over the basic ways of modeling your data in a MongoDB document before continuing on into how to incorporate vector embeddings. 

Data modeling in MongoDB revolves around organizing your data into documents within various collections. Varied projects or organizations will require different ways of structuring data models due to the fact that successful data modeling depends on the specific requirements of each application, and for the most part, no one document design can be applied for every situation. There are some commonalities, though, that can guide the user. These are:

 1. Choosing whether to embed or reference your related data. 
 2. Using arrays in a document.
 3. Indexing your documents (finding fields that are frequently used and applying the appropriate indexing, etc.).

For a more in-depth explanation and a comprehensive guide of data modeling with MongoDB, please check out our data modeling article.

## Setting up an example data model

We are going to be building our vector embedding example using a MongoDB document for our MongoDB TV series. Here, we have a single MongoDB document representing our MongoDB TV show, without any embeddings in place. We have a nested array featuring our array of seasons, and within that, our array of different episodes. This way, in our document, we are capable of seeing exactly which season each episode is a part of, along with the episode number, the title, the description, and the date: 

```
{
   "_id": ObjectId("238478293"),
   "title": "MongoDB TV",
   "description": "All your MongoDB updates, news, videos, and podcast episodes, straight to you!",
   "genre": "Programming", "Database", "MongoDB"],
   "seasons": [
      {
         "seasonNumber": 1,
         "episodes": [
            {
               "episodeNumber": 1,
               "title": "EASY: Build Generative AI Applications",
               "description": "Join Jesse Hall….",
               "date": ISODate("Oct52023")
            },
            {
               "episodeNumber": 2,
               "title": "RAG Architecture & MongoDB: The Future of Generative AI Apps",
               "description": "Join Prakul Agarwal…",
               "date": ISODate("Oct42023")
            }
         ]
      },
      {
         "seasonNumber": 2,
         "episodes": [
            {
               "episodeNumber": 1,
               "title": "Cloud Connect - Harness the Power of AI/ML and Generative AI on AWS with MongoDB Atlas",
               "description": "Join Igor Alekseev….",
               "date": ISODate("Oct32023")
            },
            {
               "episodeNumber": 2,
               "title": "The Index: Here’s what you missed last week…",
               "description": "Join Megan Grant…",
               "date": ISODate("Oct22023")
            }
         ]
      }
   ]
}
```

Now that we have our example set up, let’s incorporate vector embeddings and discuss the proper techniques to set you up for success.

## Integrating vector embeddings for vector search in our data model 

Let’s first understand exactly what vector search is: Vector search is the way to search based on *meaning* rather than specific words. This comes in handy when querying using similarities rather than searching based on keywords. When using vector search, you can query using a question or a phrase rather than just a word. In a nutshell, vector search is great for when you can’t think of *exactly* that book or movie, but you remember the plot or the climax. 

This process happens when text, video, or audio is transformed via an encoder into vectors. With MongoDB, we can do this using OpenAI, Hugging Face, or other natural language processing models. Once we have our vectors, we can upload them in the base of our document and conduct vector search using them. Please keep in mind the [current limitations of vector search and how to properly embed your vectors. 

You can store your vector embeddings alongside other data in your document, or you can store them in a new collection. It is really up to the user and the project goals. Let’s go over what a document with vector embeddings can look like when you incorporate them into your data model, using the same example from above: 

```
{
   "_id": ObjectId("238478293"),
   "title": "MongoDB TV",
   "description": "All your MongoDB updates, news, videos, and podcast episodes, straight to you!",
   "genre": "Programming", "Database", "MongoDB"],
   “vectorEmbeddings”: [ 0.25, 0.5, 0.75, 0.1, 0.1, 0.8, 0.2, 0.6, 0.6, 0.4, 0.9, 0.3, 0.2, 0.7, 0.5, 0.8, 0.1, 0.8, 0.2, 0.6 ],
   "seasons": [
      {
         "seasonNumber": 1,
         "episodes": [
            {
               "episodeNumber": 1,
               "title": "EASY: Build Generative AI Applications",
               "description": "Join Jesse Hall….",
               "date": ISODate("Oct 5, 2023")
 
            },
            {
               "episodeNumber": 2,
               "title": "RAG Architecture & MongoDB: The Future of Generative AI Apps",
               "description": "Join Prakul Agarwal…",
               "date": ISODate("Oct 4, 2023")
            }
         ]
      },
      {
         "seasonNumber": 2,
         "episodes": [
            {
               "episodeNumber": 1,
               "title": "Cloud Connect - Harness the Power of AI/ML and Generative AI on AWS with MongoDB Atlas",
               "description": "Join Igor Alekseev….",
               "date": ISODate("Oct 3, 2023")
            },
            {
               "episodeNumber": 2,
               "title": "The Index: Here’s what you missed last week…",
               "description": "Join Megan Grant…",
               "date": ISODate("Oct 2, 2023")
            }
         ]
      }
   ]
}
```
Here, you have your vector embeddings classified at the base in your document. Currently, there is a limitation where vector embeddings cannot be nested in an array in your document. Please ensure your document has your embeddings at the base. There are various tutorials on our [Developer Center, alongside our YouTube account and our documentation, that can help you figure out how to embed these vectors into your document and how to acquire the necessary vectors in the first place. 

## Extras: Indexing with vector search

When you’re using vector search, it is necessary to create a search index so you’re able to be successful with your semantic search. To do this, please view our Vector Search documentation. Here is the skeleton code provided by our documentation:

```
{
  "fields":
    {
      "type": "vector",
      "path": "",
      "numDimensions": ,
      "similarity": "euclidean | cosine | dotProduct"
    },
    {
      "type": "filter",
      "path": ""
    },
    ...
  ]
}
```

When setting up your search index, you want to change the “” to be your vector path. In our case, it would be “vectorEmbeddings”. “type” can stay the way it is. For “numDimensions”, please match the dimensions of the model you’ve chosen. This is just the number of vector dimensions, and the value cannot be greater than 4096. This limitation comes from the base embedding model that is being used, so please ensure you’re using a supported LLM (large language model) such as OpenAI or Hugging Face. When using one of these, there won’t be any issues running into vector dimensions. For “similarity”, please pick which vector function you want to use to search for the top K-nearest neighbors. 

## Extras: Querying with vector search

When you’re ready to query and find results from your embedded documents, it’s time to create an aggregation pipeline on your embedded vector data. To do this, you can use the“$vectorSearch” operator, which is a new aggregation stage in Atlas. It helps execute an Approximate Nearest Neighbor query. 

For more information on this step, please check out the tutorial on Developer Center about [building generative AI applications, and our YouTube video on vector search.

