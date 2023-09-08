---
title: MongoDB AI Chatbot Overview
url: https://mongodb.com/docs/
metadata:
  description: Overview of Docs AI Chatbot, including it's capabilities and how it's built
  products:
    - Docs AI Chatbot
  tags:
    - AI
    - Generative AI
    - Chatbot
    - Atlas Vector Search
    - LLM
    - OpenAI
    - ChatGPT
---

# MongoDB AI Chatbot Overview

The MongoDB AI is an advanced LLM-based chatbot designed to operate as a
database expert. Its primary role is to assist users, whether they're database
novices or seasoned administrators, with a vast array of database-related tasks.

The chatbot can access the MongoDB documentation, Developer Center, and more
helpful sources. When you ask a question, it finds the most relevant information
and provides a succinct summary of the information and/or a helpful example.

In general, the chatbot can only answer a question if it finds semantically
related information in the docs or another source.

## Capabilities

- **Product Information**: Fetches structured information from database product documentation, guiding users through specific features and capabilities.

- **Query Assistance**: The MongoDB AI can help formulate, optimize, and troubleshoot MongoDB queries and aggregations.

- **Schema Design**: The MongoDB AI can help you design a robust and scalable database schema that utilizes MongoDB design patterns.

- **Performance Tuning**: Provides suggestions for optimizing query performance and server configurations.

- **Database Best Practices**: Advises on security best practices, backup strategies, and other essential database management tasks.

- **Self-awareness**: Can describe its own functionalities, origin, and purpose, enabling users to understand its capabilities better.

## FAQ

### What information does the chatbot store about me?

The chatbot stores IP addresses, anonymous conversation history, and message ratings.

### Does the Chatbot use Atlas Vector Search?

The MongoDB AI uses MongoDB Atlas Vector Search to pull the most relevant information for a given question.

### Does the chatbot improve over time?

Users can provide feedback on the MongoDB AI's responses, helping it improve over time and better serve user needs.

### What does the chatbot know?

The MongoDB AI chatbot knows about all of MongoDB's products and services and can direct you to resources with more information.

### How does the Docs AI chatbot work?

The chatbot combines state of the art LLM models with a rich backing store of knowledge and examples from official MongoDB sources. This includes guides and reference pages from the Documentation, tutorials and blogs from the Developer Center, and more. When you send the chatbot a message, it determines what you're asking for and searches the backing store for the most relevant information. Then, it uses an LLM model to transform your message and the raw results into a formatted response.

### How does the chatbot use AI?

The chatbot uses state of the art vector embeddings and LLM models to respond to messages with accurate information.

### How does the chatbot use MongoDB?

The chatbot stores data for the backing knowledge store and conversation history in MongoDB Atlas. It uses MongoDB Atlas Vector Search to find semantically relevant information for incoming messages.
