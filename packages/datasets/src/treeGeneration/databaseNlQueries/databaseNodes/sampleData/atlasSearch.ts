import { ObjectId } from "mongodb-rag-core/mongodb";
import {
  DatabaseInfoNode,
  DatabaseUseCase,
  DatabaseUser,
  DatabaseUserNode,
  NaturalLanguageQuery,
} from "../nodeTypes";
import { DatabaseInfo, LlmOptions } from "mongodb-rag-core/executeCode";
import fs from "fs";
import path from "path";

export const makeSampleLlmOptions = () => {
  return {
    model: "gpt-4o-mini",
    temperature: 0.5,
    seed: 42,
  } satisfies LlmOptions;
};

const atlasSearchIndexDefinition = fs.readFileSync(
  path.resolve(
    __dirname,
    "..",
    "..",
    "..",
    "..",
    "..",
    "mongodb_datasets",
    "atlas_search_dataset_index.jsonc"
  ),
  "utf8"
);

export const sampleWikipediaDbInfo: DatabaseInfo = {
  name: "wikipedia_dataset",
  description:
    "A Wikipedia dataset database that stores article content and metadata from Wikipedia. This database serves as a repository for Wikipedia articles, enabling efficient storage, retrieval, and searching of encyclopedic content.",
  latestDate: new Date("2024-01-01T00:00:00.000Z"),
  collections: [
    {
      name: "articles",
      description:
        "The primary collection storing Wikipedia article data. Each document represents a single Wikipedia article with its full text content, URL, title, and a unique identifier. The collection includes a hash field for data integrity verification and has a unique index on the 'id' field to ensure no duplicate articles. This collection serves as the core data store for Wikipedia content, enabling fast lookups by article ID and supporting various Wikipedia data processing and analysis workflows.",
      schema:
        "interface Article {\n  _id: ObjectId; // MongoDB document identifier\n  id: string; // Unique article identifier from Wikipedia\n  url: string; // Full URL to the Wikipedia article\n  title: string; // Article title\n  text: string; // Article content/body text\n  hash: {\n    low: number; // Low 32 bits of the hash value\n    high: number; // High 32 bits of the hash value\n    unsigned: boolean; // Whether the hash is unsigned\n  }; // Hash value for the article, likely used for deduplication or integrity checking\n}",
      examples: [
        {
          _id: {
            $oid: "689381101c3ad24c2648661d",
          },
          id: "236517",
          url: "https://simple.wikipedia.org/wiki/Hiroshi%20Hirakawa",
          title: "Hiroshi Hirakawa",
          text: "is a former Japanese football player. He played for the Japan national team.\n\nBiography\nHirakawa was...",
          hash: {
            low: -1969570652,
            high: -2147482279,
            unsigned: false,
          },
        },
        {
          _id: {
            $oid: "689394a98939e606a96aac19",
          },
          id: "1014940",
          url: "https://simple.wikipedia.org/wiki/Griesheim-sur-Souffel",
          title: "Griesheim-sur-Souffel",
          text: "Griesheim-sur-Souffel is a commune. It is in Grand Est in the Bas-Rhin department in northeast Franc...",
          hash: {
            low: -2142743457,
            high: -2147473452,
            unsigned: false,
          },
        },
      ],
      indexes: [
        {
          v: 2,
          key: {
            _id: 1,
          },
          name: "_id_",
          description:
            "Default MongoDB index on the _id field. Automatically created for all collections to ensure fast lookups by document ID and to enforce uniqueness of the _id field.",
        },
        {
          v: 2,
          key: {
            id: 1,
          },
          name: "id_1",
          background: true,
          unique: true,
          description:
            "Unique index on the 'id' field (Wikipedia article ID). This index ensures that each Wikipedia article ID is unique within the collection and enables fast lookups when querying articles by their Wikipedia ID. Useful for finding specific articles, preventing duplicate imports, and maintaining referential integrity with external Wikipedia data.",
        },
      ],
      searchIndexes: [atlasSearchIndexDefinition],
    },
  ],
};

export const sampleDatabaseUsers = [
  {
    name: "Dr. Priya Chakraborty",
    role: "Research Scientist - Information Retrieval",
    description:
      "A computational linguist with 8 years of experience in natural language processing and information retrieval. Priya uses the Wikipedia dataset to train and evaluate machine learning models for semantic search, entity recognition, and knowledge graph construction. She regularly queries the database to extract article text and metadata for her research on cross-lingual information retrieval systems.",
  },
  {
    name: "Marcus Thompson",
    role: "High School History Teacher",
    description:
      "An enthusiastic educator with 5 years of teaching experience who integrates Wikipedia content into his lesson plans. Marcus accesses the database through an educational portal to find reliable historical articles, create fact-checking exercises for students, and track how historical narratives evolve over time. He particularly values the ability to search for specific topics and compare different perspectives on historical events.",
  },
  {
    name: "Yuki Tanaka",
    role: "Content Moderator - Wikipedia Foundation",
    description:
      "A dedicated Wikipedia contributor and moderator with 12 years of experience maintaining content quality. Yuki uses the database to identify potential vandalism, track article changes through hash comparisons, and ensure consistency across related articles. She frequently runs complex queries to find articles that need attention, verify citations, and maintain the integrity of the encyclopedia.",
  },
  {
    name: "Alejandra Morales",
    role: "Trivia App Developer",
    description:
      "An independent mobile app developer with 3 years of experience creating educational games. Alejandra queries the Wikipedia database to source verified facts for her popular trivia applications, using the search functionality to find interesting articles across diverse topics. She implements rate-limited API calls to extract article titles and snippets for her quiz questions, serving over 50,000 daily active users.",
  },
  {
    name: "Ibrahim Al-Hassan",
    role: "Data Engineering Intern",
    description:
      "A computer science graduate student in his first year of practical experience with big data systems. Ibrahim is learning to optimize database queries and build data pipelines that process Wikipedia articles for a media monitoring startup. He experiments with different indexing strategies and search queries to improve performance while managing the massive volume of encyclopedic content, often working late nights to meet project deadlines.",
  },
] as const satisfies DatabaseUser[];

export const sampleUseCases = {
  "Yuki Tanaka": [
    {
      title: "Recent Article Vandalism Detection",
      description:
        "As a content moderator, Yuki needs to identify articles that have been recently modified and show signs of potential vandalism. She needs to find articles where the content hash has changed within the last 24-48 hours, particularly focusing on high-traffic articles or those containing controversial topics. This helps her prioritize which articles to review manually and ensures that vandalism is caught quickly before it affects many readers. She often looks for patterns like articles with multiple hash changes in a short period, or articles where certain keywords associated with common vandalism (profanity, promotional content, nonsense text) have been introduced.",
      dataNeeded: [
        "Article hash values (current and historical)",
        "Article titles and IDs",
        "Article text content",
        "Time stamps of hash changes",
        "Full text of articles to search for vandalism indicators",
      ],
    },
    {
      title: "Cross-Article Consistency Verification",
      description:
        "Yuki regularly needs to ensure consistency across related Wikipedia articles, particularly for articles about the same topic in different contexts or articles that reference each other. For example, when reviewing an article about a historical event, she needs to find all other articles that mention this event to ensure dates, names, and facts are consistent. She searches for specific phrases, proper nouns, or dates across the entire article database to identify related content. This is especially important for maintaining accuracy in biographical articles, historical events, and scientific topics where misinformation in one article could propagate to others.",
      dataNeeded: [
        "Full text content of articles for phrase searching",
        "Article titles to identify topic relationships",
        "Article URLs for cross-referencing",
        "Ability to search for specific terms, dates, or names across all articles",
        "Article IDs for tracking related article sets",
      ],
    },
  ],
  "Dr. Priya Chakraborty": [
    {
      title: "Cross-lingual Named Entity Training Set Extraction",
      description:
        "Dr. Chakraborty needs to extract a diverse set of Wikipedia articles that contain rich named entities (people, places, organizations) across multiple languages to train her multilingual entity recognition models. She requires articles that have high entity density and cover various domains like biography, geography, and organizational profiles. The extracted text will be used to create training datasets where entities are automatically labeled using Wikipedia's internal linking structure as weak supervision signals.",
      dataNeeded: [
        "Article titles containing person names, place names, or organization names",
        "Full article text with preserved formatting and internal Wikipedia links",
        "Articles with high frequency of capitalized words (potential entity indicators)",
        "URL patterns to identify articles from different Wikipedia language editions",
        "Articles from specific categories like 'Biography', 'Geography', 'Companies'",
      ],
    },
    {
      title: "Semantic Search Evaluation Benchmark Creation",
      description:
        "For her research on improving semantic search algorithms, Dr. Chakraborty needs to create evaluation benchmarks by extracting pairs of semantically related Wikipedia articles. She requires articles that discuss similar topics but use different vocabulary, articles that reference each other, and articles about the same concept in different contexts (e.g., 'Machine Learning' vs 'Artificial Intelligence' vs 'Deep Learning'). This data will help her evaluate how well her semantic search models can identify conceptually related content despite lexical differences.",
      dataNeeded: [
        "Articles containing specific technical terms and their synonyms",
        "Full text content to analyze semantic similarity",
        "Articles with overlapping topics but different titles",
        "Text segments containing definitions and explanations of concepts",
        "Articles from scientific and technical domains with rich terminology",
      ],
    },
  ],
  "Marcus Thompson": [
    {
      title: "Finding Primary Sources for World War II Unit",
      description:
        "Marcus needs to gather comprehensive Wikipedia articles about World War II events, key figures, and battles to create a curated reading list for his 11th-grade unit on WWII. He wants to find articles that cover major events like D-Day, Pearl Harbor, and the Holocaust, as well as profiles of leaders like Churchill, Roosevelt, and Stalin. This information will help him design document-based question (DBQ) exercises where students analyze multiple perspectives on the same historical events. He also needs to ensure the articles are detailed enough to support student research projects but accessible for high school reading levels.",
      dataNeeded: [
        "Article titles containing World War II-related terms",
        "Full text content of articles about specific battles and events",
        "Articles about historical figures from the 1940s",
        "Multiple articles covering the same event from different angles",
        "Article URLs for creating hyperlinked resource pages",
      ],
    },
    {
      title: "Creating a Fact-Checking Exercise on Historical Myths",
      description:
        "Marcus wants to develop a critical thinking exercise where students fact-check common historical misconceptions using Wikipedia as a reference source. He needs to search for articles about frequently misunderstood historical events (like 'Columbus discovering America' or 'Medieval people thought the Earth was flat') and compare the Wikipedia content with popular myths. He wants to find articles that explicitly address these misconceptions and provide accurate historical context. This will help students learn how to use encyclopedic sources to verify information and understand how historical narratives can be distorted over time. He also needs to track which articles have the most comprehensive coverage of these topics to ensure students have sufficient material for their fact-checking assignments.",
      dataNeeded: [
        "Articles containing keywords related to historical myths and misconceptions",
        "Full text search for phrases like 'common misconception' or 'historically inaccurate'",
        "Articles about Columbus, medieval science, and other frequently misunderstood topics",
        "Article titles and text that specifically address historical accuracy",
        "Multiple articles on the same topic to show different levels of detail",
      ],
    },
  ],
  "Alejandra Morales": [
    {
      title: "Daily Random Fact Discovery",
      description:
        "As a trivia app developer serving 50,000+ daily users, Alejandra needs to continuously source fresh, interesting facts to keep her app content engaging. She requires a way to discover random Wikipedia articles across diverse topics (science, history, pop culture, geography, etc.) to extract surprising facts and create new quiz questions. This is a daily routine where she needs to find 20-30 articles with interesting trivia potential, ensuring variety across categories to appeal to different user interests. The facts need to be verifiable and from reputable Wikipedia articles to maintain the educational integrity of her app.",
      dataNeeded: [
        "Article titles from various topic categories",
        "Full article text content to extract specific facts",
        "Article URLs for fact verification references",
        "Random sampling of articles to ensure variety",
        "Text snippets containing interesting statistics or unusual facts",
      ],
    },
    {
      title: "Themed Quiz Pack Research",
      description:
        "Every month, Alejandra creates special themed quiz packs (e.g., 'Ancient Civilizations', 'Space Exploration', 'World Cuisines', 'Olympic Sports') to drive user engagement and in-app purchases. She needs to search for Wikipedia articles related to specific themes, finding 50-100 relevant articles per theme to extract cohesive sets of questions. The search must be comprehensive enough to cover both well-known and obscure aspects of each theme, allowing her to create questions of varying difficulty levels. She particularly looks for articles with rich factual content, dates, numbers, and interesting anecdotes that make good multiple-choice questions.",
      dataNeeded: [
        "Articles matching specific theme keywords",
        "Article titles and text containing theme-related terms",
        "Full article content for detailed fact extraction",
        "Related articles through text search to expand topic coverage",
        "Articles with numeric data, dates, and specific facts suitable for quiz questions",
      ],
    },
  ],
  "Ibrahim Al-Hassan": [
    {
      title: "Performance Testing for Article Search Optimization",
      description:
        "As part of optimizing the search functionality for the media monitoring startup, Ibrahim needs to analyze the performance characteristics of different search queries. He wants to understand how search response times vary based on the complexity of search terms, the use of autocomplete versus full-text search, and the volume of results returned. This information will help him recommend indexing improvements and query optimization strategies to his team. He needs to run various test queries with different parameters and measure their execution times, particularly focusing on searches that media monitors would commonly use, such as searching for trending topics, specific entities, or recent events mentioned in Wikipedia articles.",
      dataNeeded: [
        "Article titles containing specific keywords using both standard and autocomplete search",
        "Full-text search results from article content for various phrase combinations",
        "Execution statistics for different query types (single word, phrase, wildcard)",
        "Result counts for searches with varying specificity levels",
        "Performance metrics when combining title and text searches",
        "Response times for queries returning different volumes of results (10, 100, 1000+ documents)",
      ],
    },
    {
      title: "Building a Data Pipeline for Daily Wikipedia Content Updates",
      description:
        "Ibrahim is tasked with designing a data pipeline that processes new and updated Wikipedia articles for the media monitoring system. He needs to identify articles that have been added or modified within specific time windows to ensure the monitoring system has the latest information. This involves understanding the current state of the database, identifying patterns in article IDs and URLs, and determining how to efficiently extract batches of articles for processing. He also needs to analyze the distribution of article sizes and content types to optimize the pipeline's batch processing parameters and ensure it can handle the volume without overwhelming the system during peak hours.",
      dataNeeded: [
        "Total count of articles in the database",
        "Distribution of article text lengths to determine optimal batch sizes",
        "Sample of article IDs to understand ID formatting patterns",
        "Articles with specific URL patterns (e.g., from certain Wikipedia subdomains)",
        "Random samples of articles to analyze content structure and hash values",
        "Statistics on article titles to identify naming conventions and special characters",
        "Distinct URL domains to understand the scope of Wikipedia sources",
      ],
    },
  ],
} as const satisfies Record<
  (typeof sampleDatabaseUsers)[number]["name"],
  DatabaseUseCase[]
>;

export const sampleNlQueries = {
  "Alejandra Morales": {
    "Daily Random Fact Discovery": [
      {
        intent:
          "Find Wikipedia articles about scientific discoveries and breakthroughs that contain surprising statistics or revolutionary findings, focusing on physics, chemistry, or biology topics with quantifiable facts",
        collections: ["articles"],
        complexity: "complex",
        query:
          "Find the top 20 Wikipedia articles about scientific discoveries that MUST contain words like 'discovery', 'breakthrough', or 'invention' in the title, SHOULD contain numerical statistics or percentages in the text with boost for terms like 'first', 'largest', 'smallest', or 'fastest', focusing on physics, chemistry, or biology topics, excluding articles with 'stub' or 'disambiguation' in the text, and prioritize articles with longer content over 500 words",
        resultsSchema:
          "/**\n * Wikipedia articles with scientific discoveries containing interesting facts\n */\ntype QueryResults = {\n  title: string;\n  text: string;\n  url: string;\n}[];",
      },
      {
        intent:
          "Search for Wikipedia articles containing unusual historical events or lesser-known historical facts with specific dates, numbers, or surprising circumstances that would make good trivia questions",
        collections: ["articles"],
        complexity: "complex",
        query:
          "Search for 25 Wikipedia articles about historical events where the text MUST contain exact phrases like 'for the first time' or 'never before' or 'only known case', SHOULD include specific years between 1500 and 2020 with boosted relevance for unusual circumstances, filter out common topics like 'World War' or 'United States' to find more obscure facts, and prioritize articles mentioning strange coincidences, unique records, or unexpected outcomes",
        resultsSchema:
          "/**\n * Historical Wikipedia articles with unusual facts and dates\n */\ntype QueryResults = {\n  title: string;\n  text: string;\n  url: string;\n}[];",
      },
      {
        intent:
          "Discover Wikipedia articles about geographical locations with extreme or record-breaking characteristics, including unusual natural phenomena, extreme weather records, or unique geological features",
        collections: ["articles"],
        complexity: "complex",
        query:
          "Find 20 Wikipedia articles about geographical locations that MUST contain superlatives like 'highest', 'lowest', 'hottest', 'coldest', 'deepest', or 'most remote' in the text, SHOULD include specific measurements in meters, kilometers, or degrees with higher boost for extreme values, focus on natural phenomena or geological features, exclude common tourist destinations, and prioritize articles with unique records or little-known extreme locations",
        resultsSchema:
          "/**\n * Geographical Wikipedia articles with extreme or record-breaking facts\n */\ntype QueryResults = {\n  title: string;\n  text: string;\n  url: string;\n}[];",
      },
    ],
    "Themed Quiz Pack Research": [
      {
        intent:
          "Find Wikipedia articles about ancient civilizations to create a themed quiz pack with 50-100 questions covering well-known and obscure aspects",
        collections: ["articles"],
        complexity: "complex",
        query:
          "Find the top 75 most relevant Wikipedia articles about ancient civilizations that must contain 'ancient' and any of ['civilization', 'empire', 'dynasty', 'kingdom'] in the title or text, should include specific terms like 'pharaoh', 'emperor', 'pyramid', 'temple', or 'archaeological' with higher boost for title matches, must contain numeric data or dates in the text, exclude articles with 'modern' or 'contemporary' in the title, and prioritize longer articles with rich factual content suitable for quiz questions",
        resultsSchema:
          "```typescript\n/**\n * Wikipedia articles about ancient civilizations with title and full text content\n */\ntype QueryResults = {\n  title: string;\n  text: string;\n  url: string;\n}[];\n```",
      },
      {
        intent:
          "Search for Wikipedia articles related to space exploration theme with both famous missions and lesser-known space facts for creating varied difficulty quiz questions",
        collections: ["articles"],
        complexity: "complex",
        query:
          "Search for the top 100 Wikipedia articles where the title or content must contain 'space' within 5 words of any of ['exploration', 'mission', 'astronaut', 'satellite', 'rocket'], should include fuzzy matches for common misspellings like 'satelite' or 'astronot', boost articles containing specific dates, mission names, or numeric facts like distances and speeds, filter to include both NASA and international space agencies, exclude science fiction content by filtering out 'fictional' or 'Star Wars', and find articles with rich technical details and historical anecdotes",
        resultsSchema:
          "```typescript\n/**\n * Space exploration articles with title and content for quiz fact extraction\n */\ntype QueryResults = {\n  title: string;\n  text: string;\n  url: string;\n}[];\n```",
      },
      {
        intent:
          "Discover Wikipedia articles about world cuisines covering both popular dishes and obscure regional foods to create a comprehensive food trivia quiz pack",
        collections: ["articles"],
        complexity: "moderate",
        query:
          "Find the top 80 Wikipedia articles containing 'cuisine' or 'food' or 'dish' in the title, and any of ['recipe', 'ingredient', 'cooking', 'culinary', 'traditional'] in the text, boosting results that mention specific countries or regions, include numeric data like cooking temperatures or ingredient amounts, and focus on articles with cultural history and interesting food facts",
        resultsSchema:
          "```typescript\n/**\n * World cuisine articles with cultural and factual content\n */\ntype QueryResults = {\n  title: string;\n  text: string;\n  url: string;\n}[];\n```",
      },
    ],
  },
  "Dr. Priya Chakraborty": {
    "Semantic Search Evaluation Benchmark Creation": [
      {
        intent:
          "Find semantically related Wikipedia articles about machine learning concepts that use different vocabulary but discuss similar topics, to create evaluation benchmarks for semantic search algorithms",
        collections: ["articles"],
        complexity: "complex",
        query:
          "Find the top 15 Wikipedia articles that contain either 'machine learning', 'artificial intelligence', 'deep learning', 'neural networks', or 'AI' in the title or text, but prioritize articles where these terms appear in the title with a 3x boost, exclude any articles with 'stub' or 'disambiguation' in the text, and ensure the articles have substantial content by filtering for text length greater than 1000 characters",
        resultsSchema:
          "```typescript\n/**\n * Wikipedia articles with semantically related machine learning concepts\n */\ntype QueryResults = {\n  title: string;\n  text: string;\n  url: string;\n  relevanceScore?: number;\n}[];\n```",
      },
      {
        intent:
          "Extract pairs of Wikipedia articles that reference each other or discuss overlapping scientific concepts using different terminology, for evaluating semantic similarity despite lexical differences",
        collections: ["articles"],
        complexity: "complex",
        query:
          "Search for the top 20 scientific Wikipedia articles where the text contains both a primary term like 'quantum computing' AND at least one related term such as 'quantum mechanics', 'superposition', 'qubit', or 'quantum entanglement' within 50 words of each other, boost results where multiple related terms appear, exclude articles shorter than 500 words, and prioritize articles with 'computing' or 'computer science' in the title",
        resultsSchema:
          "```typescript\n/**\n * Scientific articles with overlapping quantum computing concepts\n */\ntype QueryResults = {\n  title: string;\n  text: string;\n  id: string;\n  matchedTerms?: string[];\n}[];\n```",
      },
      {
        intent:
          "Identify Wikipedia articles containing technical definitions and explanations of computational linguistics concepts with rich terminology variations for semantic search model training",
        collections: ["articles"],
        complexity: "moderate",
        query:
          "Find the top 10 Wikipedia articles containing the exact phrases 'is defined as' or 'refers to' in the text field, and also containing any of these terms: 'natural language processing', 'NLP', 'computational linguistics', or 'text mining' with fuzzy matching to catch misspellings, ranked by relevance",
        resultsSchema:
          "```typescript\n/**\n * Articles with technical definitions in computational linguistics\n */\ntype QueryResults = {\n  title: string;\n  text: string;\n  definitionContext?: string;\n}[];\n```",
      },
    ],
    "Cross-lingual Named Entity Training Set Extraction": [
      {
        intent:
          "Extract Wikipedia articles about famous people across multiple languages for training named entity recognition models. Looking for biographical articles with high entity density.",
        collections: ["articles"],
        complexity: "complex",
        query:
          "Find the top 20 Wikipedia articles where the title contains a person's name and the text includes at least 5 occurrences of words like 'born', 'founded', 'president', 'CEO', or 'director', with URLs containing language codes like '/en.', '/es.', '/fr.', '/de.', or '/zh.', prioritizing articles with 'Biography' or 'Living people' categories mentioned in the text, and boosting results that have high frequency of capitalized words indicating potential entities",
        resultsSchema:
          "/**\n * Articles about people with high entity density for NER training\n */\ntype QueryResults = {\n  title: string;\n  url: string;\n  text: string;\n  id: string;\n}[];",
      },
      {
        intent:
          "Find Wikipedia articles about geographic locations and places with rich named entity content for cross-lingual entity recognition training datasets.",
        collections: ["articles"],
        complexity: "complex",
        query:
          "Search for the top 15 Wikipedia articles where the title matches place name patterns like 'City of', 'Mount', 'River', 'Lake', or contains geographic suffixes like '-burg', '-ville', '-shire', '-stan', and the article text must contain location-related terms like 'located', 'capital', 'population', 'coordinates', or 'bordered by' appearing at least 3 times, filtering for URLs from different Wikipedia editions (en, es, fr, de, ja, ar), with higher relevance for articles mentioning multiple place names or geographic entities",
        resultsSchema:
          "/**\n * Geographic articles with location entities for NER training\n */\ntype QueryResults = {\n  title: string;\n  url: string;\n  text: string;\n  id: string;\n}[];",
      },
      {
        intent:
          "Retrieve Wikipedia articles about organizations and companies with dense entity mentions for training multilingual named entity recognition models.",
        collections: ["articles"],
        complexity: "complex",
        query:
          "Get the top 20 Wikipedia articles where the title contains organizational keywords like 'Corporation', 'Company', 'Inc.', 'Ltd.', 'Foundation', 'Association', or 'Institute', and the text must include business-related terms such as 'headquartered', 'established', 'employees', 'revenue', or 'subsidiary' with at least 4 occurrences, searching across multiple language Wikipedia URLs (containing '/en.', '/de.', '/ja.', '/fr.', '/es.', '/pt.'), boosting articles that mention multiple organization names or have high density of capitalized multi-word phrases",
        resultsSchema:
          "/**\n * Organizational articles with company/institution entities for NER training\n */\ntype QueryResults = {\n  title: string;\n  url: string;\n  text: string;\n  id: string;\n}[];",
      },
    ],
  },
  "Ibrahim Al-Hassan": {
    "Building a Data Pipeline for Daily Wikipedia Content Updates": [
      {
        intent:
          "Get the total count of articles in the database to understand the scale of data for pipeline processing",
        collections: ["articles"],
        complexity: "simple",
        query:
          "How many Wikipedia articles are currently stored in the database?",
        resultsSchema:
          "/**\n * Total count of articles in the database\n */\ntype QueryResults = number;",
      },
      {
        intent:
          "Analyze the distribution of article text lengths to determine optimal batch sizes for the data pipeline",
        collections: ["articles"],
        complexity: "moderate",
        query:
          "Show me the distribution of article text lengths, grouped into buckets of 1000 characters, with the count of articles in each bucket",
        resultsSchema:
          "/**\n * Distribution of article text lengths grouped by size buckets\n */\ntype QueryResults = {\n  lengthBucket: string;\n  count: number;\n}[];",
      },
      {
        intent:
          "Extract a sample of article IDs to understand formatting patterns for the pipeline's ID processing logic",
        collections: ["articles"],
        complexity: "simple",
        query:
          "Give me 20 random article IDs to understand their formatting patterns",
        resultsSchema:
          "/**\n * Sample of article IDs\n */\ntype QueryResults = string[];",
      },
    ],
    "Performance Testing for Article Search Optimization": [
      {
        intent:
          "Test search performance by finding articles with simple single-word search terms to establish baseline response times",
        collections: ["articles"],
        complexity: "simple",
        query:
          "Find the top 10 articles containing the word 'technology' in the title",
        resultsSchema:
          "```typescript\n/**\n * Articles with title containing the search term\n */\ntype QueryResults = {title: string, url: string}[];\n```",
      },
      {
        intent:
          "Compare autocomplete performance for trending topic searches that media monitors would frequently use",
        collections: ["articles"],
        complexity: "simple",
        query:
          "Show me 15 autocomplete suggestions for articles starting with 'artificial intellig'",
        resultsSchema:
          "```typescript\n/**\n * Autocomplete suggestions with title and URL\n */\ntype QueryResults = {title: string, url: string}[];\n```",
      },
      {
        intent:
          "Measure performance of exact phrase searches in article content for specific entity mentions",
        collections: ["articles"],
        complexity: "simple",
        query:
          "Search for the exact phrase 'climate change' in article text and return the first 20 results",
        resultsSchema:
          "```typescript\n/**\n * Articles containing the exact phrase\n */\ntype QueryResults = {title: string, text: string, url: string}[];\n```",
      },
    ],
  },
  "Yuki Tanaka": {
    "Cross-Article Consistency Verification": [
      {
        intent:
          "Find all Wikipedia articles that mention a specific historical event to verify consistency of dates and facts across related articles",
        collections: ["articles"],
        complexity: "moderate",
        query:
          "Find the top 20 articles that contain the exact phrase 'Battle of Waterloo' in their text content, showing their titles and URLs for cross-reference verification",
        resultsSchema:
          "```typescript\n/**\n * Articles containing the exact phrase with title and URL for verification\n */\ntype QueryResults = {\n  title: string;\n  url: string;\n  text: string;\n}[];\n```",
      },
      {
        intent:
          "Search for articles containing specific proper nouns and dates to ensure biographical consistency across Wikipedia",
        collections: ["articles"],
        complexity: "complex",
        query:
          "Find the top 15 articles that MUST contain 'Albert Einstein' AND MUST mention the year '1905' in their content, SHOULD also contain 'relativity' or 'physics' with higher relevance scores, excluding articles with 'disambiguation' in the title, ranked by relevance",
        resultsSchema:
          "```typescript\n/**\n * Articles about Einstein with specific year references for consistency checking\n */\ntype QueryResults = {\n  title: string;\n  url: string;\n  text: string;\n  id: string;\n}[];\n```",
      },
      {
        intent:
          "Identify all articles that reference a specific scientific concept to verify consistency of terminology and definitions",
        collections: ["articles"],
        complexity: "complex",
        query:
          "Search for the top 25 articles where 'quantum mechanics' appears near 'wave function' within 10 words in the text, MUST contain either 'Schrödinger' or 'Heisenberg', SHOULD boost results containing 'equation' in the title, and filter out articles shorter than 500 characters for comprehensive content review",
        resultsSchema:
          "```typescript\n/**\n * Scientific articles with related quantum mechanics concepts for consistency verification\n */\ntype QueryResults = {\n  title: string;\n  url: string;\n  text: string;\n  id: string;\n}[];\n```",
      },
    ],
    "Recent Article Vandalism Detection": [
      {
        intent:
          "Detect recent vandalism in high-traffic articles by finding articles whose content has been modified to include common vandalism indicators like profanity or promotional content within the last 48 hours",
        collections: ["articles"],
        complexity: "complex",
        query:
          "Find the top 20 high-traffic articles that have been modified in the last 48 hours and now contain any of these vandalism indicators: profanity terms, promotional phrases like 'buy now' or 'click here', or nonsense text patterns, prioritizing articles with 'controversial' or 'politics' in the title and excluding articles already tagged for review",
        resultsSchema:
          "/**\n * Articles with potential vandalism indicators\n */\ntype QueryResults = {\n  title: string;\n  id: string;\n  url: string;\n  text: string;\n  hash: {\n    low: number;\n    high: number;\n    unsigned: boolean;\n  };\n}[];",
      },
      {
        intent:
          "Identify articles with multiple recent hash changes that could indicate edit wars or persistent vandalism attempts, focusing on controversial topics",
        collections: ["articles"],
        complexity: "moderate",
        query:
          "Show me the 15 most recently modified articles containing 'election', 'religion', or 'controversy' in either the title or content, where the hash values indicate changes within the past 24 hours, ranked by relevance to these controversial topics",
        resultsSchema:
          "/**\n * Recently modified controversial articles\n */\ntype QueryResults = {\n  title: string;\n  id: string;\n  text: string;\n  hash: {\n    low: number;\n    high: number;\n    unsigned: boolean;\n  };\n}[];",
      },
      {
        intent:
          "Search for articles where specific vandalism-related keywords have been recently introduced to help prioritize manual review",
        collections: ["articles"],
        complexity: "complex",
        query:
          "Search for articles that MUST contain any common vandalism phrases like 'your mom', 'is gay', 'sucks', or spam patterns like repeated exclamation marks or ALL CAPS sections in the content, SHOULD have been popular articles with 'featured' or 'good article' in the text indicating high traffic, MUST NOT be in the talk or user namespace based on URL patterns, with fuzzy matching for common misspellings of profanity, limiting to the 25 most relevant results for immediate review",
        resultsSchema:
          "/**\n * Articles requiring vandalism review\n */\ntype QueryResults = {\n  title: string;\n  id: string;\n  url: string;\n  text: string;\n  hash: {\n    low: number;\n    high: number;\n    unsigned: boolean;\n  };\n}[];",
      },
    ],
  },
  "Marcus Thompson": {
    "Creating a Fact-Checking Exercise on Historical Myths": [
      {
        intent:
          "Find Wikipedia articles that specifically address common historical misconceptions about Columbus discovering America, including articles that contain phrases like 'common misconception' or 'historically inaccurate' in their text",
        collections: ["articles"],
        complexity: "moderate",
        query:
          "Find the top 10 Wikipedia articles about Columbus that contain the phrases 'common misconception' or 'historically inaccurate' in their content",
        resultsSchema:
          "```typescript\n/**\n * Wikipedia articles addressing Columbus misconceptions\n */\ntype QueryResults = {\n  title: string;\n  text: string;\n  url: string;\n}[];\n```",
      },
      {
        intent:
          "Search for articles about medieval science and the flat Earth myth that explicitly discuss historical inaccuracies and provide accurate historical context for teaching fact-checking exercises",
        collections: ["articles"],
        complexity: "complex",
        query:
          "Find the top 15 most relevant Wikipedia articles that MUST contain 'medieval' in the title or text AND MUST include the exact phrase 'flat Earth' AND SHOULD contain any of these terms: 'myth', 'misconception', 'historically inaccurate', or 'common belief' with higher relevance for articles containing multiple terms",
        resultsSchema:
          "```typescript\n/**\n * Articles about medieval flat Earth misconceptions\n */\ntype QueryResults = {\n  title: string;\n  text: string;\n  url: string;\n}[];\n```",
      },
      {
        intent:
          "Identify Wikipedia articles with comprehensive coverage of historical myths by searching for multiple misconception-related keywords and ranking by the density of fact-checking content to ensure sufficient material for student assignments",
        collections: ["articles"],
        complexity: "complex",
        query:
          "Search for the top 20 Wikipedia articles that MUST contain at least two of these exact phrases: 'common misconception', 'historically inaccurate', 'popular myth', or 'historical accuracy' AND SHOULD contain 'fact' or 'truth' within 10 words of 'myth' or 'misconception', boosting articles with higher frequency of these terms and excluding articles with 'fiction' or 'fantasy' in the title",
        resultsSchema:
          "```typescript\n/**\n * Comprehensive articles on historical misconceptions\n */\ntype QueryResults = {\n  title: string;\n  text: string;\n  url: string;\n}[];\n```",
      },
    ],
    "Finding Primary Sources for World War II Unit": [
      {
        intent:
          "Find Wikipedia articles about major World War II battles and events like D-Day, Pearl Harbor, and the Holocaust for creating a comprehensive reading list",
        collections: ["articles"],
        complexity: "complex",
        query:
          "Find the top 15 Wikipedia articles that MUST contain 'World War II' or 'WWII' in the title or content, and SHOULD contain any of the terms 'D-Day', 'Pearl Harbor', 'Holocaust', 'Normandy', 'Midway', or 'Stalingrad' with higher relevance scores, filtering out articles shorter than 500 characters, and boost results that have 'battle' or 'event' in the title",
        resultsSchema:
          "/**\n * Wikipedia articles about WWII battles and events with title, URL, and content\n */\ntype QueryResults = {\n  title: string;\n  url: string;\n  text: string;\n}[];",
      },
      {
        intent:
          "Search for detailed Wikipedia biographies of World War II leaders including Churchill, Roosevelt, and Stalin for student research projects",
        collections: ["articles"],
        complexity: "moderate",
        query:
          "Search for the 10 most relevant Wikipedia articles containing 'Winston Churchill', 'Franklin Roosevelt', 'Joseph Stalin', 'Adolf Hitler', or 'Benito Mussolini' in the title, and also containing 'World War II' or '1940s' in the content, ranked by relevance",
        resultsSchema:
          "/**\n * WWII leader biographies with title, URL, and article content\n */\ntype QueryResults = {\n  title: string;\n  url: string;\n  text: string;\n}[];",
      },
      {
        intent:
          "Find multiple Wikipedia articles covering the same WWII event from different perspectives for document-based question exercises",
        collections: ["articles"],
        complexity: "complex",
        query:
          "Find the top 20 Wikipedia articles where the title or content MUST contain the exact phrase 'Pearl Harbor attack' or fuzzy match 'Pearl Harbour' with edit distance 2, SHOULD contain perspective indicators like 'Japanese perspective', 'American response', 'military strategy', or 'civilian impact' with different boost values, exclude articles with less than 1000 characters, and use proximity search to find 'December' within 5 words of '1941'",
        resultsSchema:
          "/**\n * Multiple perspectives on Pearl Harbor with title and content\n */\ntype QueryResults = {\n  title: string;\n  text: string;\n  url: string;\n}[];",
      },
    ],
  },
} as const satisfies Partial<
  Record<
    (typeof sampleDatabaseUsers)[number]["name"],
    Partial<
      Record<
        (typeof sampleUseCases)[keyof typeof sampleUseCases][number]["title"],
        NaturalLanguageQuery[]
      >
    >
  >
>;

// Create a parent node with the database info
export const databaseInfoNode: DatabaseInfoNode = {
  _id: new ObjectId(),
  parent: null,
  type: "database_info",
  data: sampleWikipediaDbInfo,
  updated: new Date(),
};

// Create a user node with the parent reference
export const userNodes: DatabaseUserNode[] = sampleDatabaseUsers.map(
  (user) => ({
    _id: new ObjectId(),
    parent: databaseInfoNode,
    data: user,
    type: "database_user",
    updated: new Date(),
  })
);

// Get a sample user and their use cases
const sampleUser = sampleDatabaseUsers[1];

// Create a user node with the parent reference
export const userNode: DatabaseUserNode = {
  _id: new ObjectId(),
  parent: databaseInfoNode,
  data: sampleUser,
  updated: new Date(),
};

// Create an array of all use cases from all users mapped into UseCase nodes
export const useCaseNodes = userNodes
  .map((userNode) => {
    const userUseCases =
      sampleUseCases[userNode.data.name as keyof typeof sampleUseCases] ?? [];
    return userUseCases.map((useCase: DatabaseUseCase) => ({
      _id: new ObjectId(),
      parent: userNode,
      data: useCase,
      updated: new Date(),
    }));
  })
  .flat();
