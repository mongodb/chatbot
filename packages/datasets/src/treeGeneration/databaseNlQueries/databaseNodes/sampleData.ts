import { ObjectId } from "mongodb-rag-core/mongodb";
import {
  DatabaseInfoNode,
  DatabaseUseCase,
  DatabaseUser,
  DatabaseUserNode,
  NaturalLanguageQuery,
} from "./nodeTypes";
import { DatabaseInfo, LlmOptions } from "mongodb-rag-core/executeCode";

export const makeSampleLlmOptions = () => {
  return {
    model: "gpt-4o-mini",
    temperature: 0.5,
    seed: 42,
  } satisfies LlmOptions;
};

export const sampleMovieDbInfo: DatabaseInfo = {
  name: "MovieDB",
  description:
    "A database containing information about movies, actors, directors, and reviews",
  latestDate: new Date("2017-09-13T00:37:11.000+00:00"),
  collections: [
    {
      name: "movies",
      description:
        "Collection of movie information including title, year, genre, and ratings",
      schema: {
        type: "object",
        properties: {
          _id: { type: "string" },
          title: { type: "string" },
          year: { type: "number" },
          genre: { type: "array", items: { type: "string" } },
          director_id: { type: "string" },
          cast: { type: "array", items: { type: "string" } },
          rating: { type: "number" },
          plot: { type: "string" },
        },
        required: ["_id", "title", "year", "genre"],
      },
      indexes: [],
      examples: [
        {
          _id: new ObjectId().toString(),
          title: "The Shawshank Redemption",
          year: 1994,
          genre: ["Drama"],
          director_id: "director1",
          cast: ["actor1", "actor2"],
          plot: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
          runtime: 142,
          rating: 9.3,
          poster_url: "https://example.com/shawshank.jpg",
        },
        {
          _id: "movie2",
          title: "The Godfather",
          year: 1972,
          genre: ["Crime", "Drama"],
          director_id: "director2",
          cast: ["actor3", "actor4", "actor5"],
          plot: "The aging patriarch of an organized crime dynasty transfers control to his reluctant son.",
          runtime: 175,
          rating: 9.2,
          poster_url: "https://example.com/godfather.jpg",
        },
      ],
    },
    {
      name: "directors",
      description: "Information about movie directors",
      indexes: [],
      schema: {
        type: "object",
        properties: {
          _id: { type: "string" },
          name: { type: "string" },
          birth_year: { type: "number" },
          nationality: { type: "string" },
          movies: { type: "array", items: { type: "string" } },
          biography: { type: "string" },
        },
        required: ["_id", "name"],
      },
      examples: [
        {
          _id: "director1",
          name: "Frank Darabont",
          birth_year: 1959,
          nationality: "American",
          movies: ["movie1"],
          biography:
            "Frank Darabont is an American filmmaker and screenwriter.",
        },
        {
          _id: "director2",
          name: "Francis Ford Coppola",
          birth_year: 1939,
          nationality: "American",
          movies: ["movie2"],
          biography:
            "Francis Ford Coppola is an American film director, producer, and screenwriter.",
        },
      ],
    },
    {
      name: "users",
      description: "Users who interact with the movie database",
      indexes: [],
      schema: {
        type: "object",
        properties: {
          _id: { type: "string" },
          username: { type: "string" },
          email: { type: "string" },
          favorite_genres: { type: "array", items: { type: "string" } },
          watched_movies: { type: "array", items: { type: "string" } },
          reviews: { type: "array", items: { type: "string" } },
        },
        required: ["_id", "username", "email"],
      },
      examples: [
        {
          _id: "user1",
          username: "moviebuff42",
          email: "moviebuff42@example.com",
          favorite_genres: ["Drama", "Sci-Fi"],
          watched_movies: ["movie1", "movie2"],
          reviews: ["review1", "review2"],
        },
      ],
    },
  ],
};

export const sampleDatabaseUsers = [
  {
    name: "Alice Chen",
    role: "Data Analyst",
    description:
      "Alice analyzes user interaction data to derive meaningful insights and create reports on movie trends. In Analytics Department. Expertise areas: Data Analysis, SQL, Python, Data Visualization. 5 years of experience.",
  },
  {
    name: "Daniel Garcia",
    role: "Film Critic",
    description:
      "Daniel writes and publishes reviews and provides ratings for the latest movie releases on MovieDB. In Content Department. Expertise areas: Film Critique, Writing, Cinema Studies. 7 years of experience.",
  },
  {
    name: "Samuel King",
    role: "Film Festival Organizer",
    description:
      "Samuel organizes film festivals and uses MovieDB to discover films and directors to feature in his events. In Events Department. Expertise areas: Event Planning, Film Selection, Networking. 15 years of experience.",
  },
  {
    name: "Tina Lewis",
    role: "Talent Agent",
    description:
      "Tina represents actors and helps them find roles in films. She uses MovieDB to stay updated on industry trends and opportunities. In Talent Management Department. Expertise areas: Talent Representation, Negotiation, Industry Knowledge. 10 years of experience.",
  },
] as const satisfies DatabaseUser[];

export const sampleUseCases = {
  "Alice Chen": [
    {
      title: "Daily User Engagement Metrics",
      description:
        "Alice needs to analyze daily user interaction data to understand how users are engaging with movies on the platform. This includes metrics such as the number of views, likes, and comments per movie. Moderate complexity.",
      dataNeeded: ["users", "movies"],
    },
    {
      title: "Weekly Trending Movies Report",
      description:
        "Alice creates weekly reports on trending movies based on user interactions and ratings. This helps the marketing team to promote popular movies. Moderate complexity.",
      dataNeeded: ["movies", "users"],
    },
    {
      title: "Monthly Genre Popularity Analysis",
      description:
        "Alice performs a monthly analysis of movie genres to determine which genres are gaining or losing popularity over time. This information is used for content acquisition and recommendation algorithms. Complex complexity.",
      dataNeeded: ["movies", "users"],
    },
    {
      title: "Occasional Director Performance Insights",
      description:
        "Alice occasionally analyzes the performance of movies directed by specific directors. This involves comparing the ratings and user engagement of movies from different directors. Complex complexity.",
      dataNeeded: ["movies", "directors", "users"],
    },
    {
      title: "Daily Data Quality Checks",
      description:
        "Alice needs to perform daily checks to ensure the data in the MovieDB is accurate and up-to-date. This includes validating the integrity of user interaction data and movie information. Simple complexity.",
      dataNeeded: ["movies", "users"],
    },
  ],
  "Daniel Garcia": [
    {
      title: "Latest Movie Releases",
      description:
        "Daniel needs to stay updated with the latest movie releases to write timely reviews and provide ratings. He looks for information such as movie titles, release dates, genres, and initial ratings. Moderate complexity.",
      dataNeeded: ["movies"],
    },
    {
      title: "Director Filmography",
      description:
        "For comprehensive reviews, Daniel often researches the filmography of directors to provide context and comparisons in his critiques. He looks for information such as the director's previous movies, genres they've worked in, and their overall ratings. Complex complexity.",
      dataNeeded: ["directors", "movies"],
    },
    {
      title: "User Reviews and Ratings",
      description:
        "To gauge public opinion and compare his ratings with general audience reception, Daniel reviews user ratings and comments on movies. He looks for aggregated user ratings, comments, and trends over time. Moderate complexity.",
      dataNeeded: ["users", "movies"],
    },
    {
      title: "Genre-Specific Trends",
      description:
        "Daniel analyzes trends in specific movie genres to identify patterns, popularity, and changes over time. He looks for information on movie titles, release years, genres, and their ratings. Complex complexity.",
      dataNeeded: ["movies"],
    },
    {
      title: "Award-Winning Movies",
      description:
        "To highlight critically acclaimed films in his reviews, Daniel researches movies that have won awards. He looks for information on award-winning titles, the awards they have won, and the year of the awards. Moderate complexity.",
      dataNeeded: ["movies"],
    },
    {
      title: "Upcoming Movie Releases",
      description:
        "Daniel needs to plan his review schedule by keeping track of upcoming movie releases. He looks for information on movie titles, scheduled release dates, and genres. Simple complexity.",
      dataNeeded: ["movies"],
    },
  ],
  "Samuel King": [
    {
      title: "Discover New Films",
      description:
        "Samuel needs to find new and upcoming films to feature in his film festivals. This includes searching for films by genre, release year, and ratings to ensure they align with the festival's theme and audience preferences. Moderate complexity.",
      dataNeeded: ["movies"],
    },
    {
      title: "Identify Prominent Directors",
      description:
        "Samuel needs to identify and learn about prominent directors whose work aligns with the festival's themes. This involves researching their filmography, awards, and critical reception. Moderate complexity.",
      dataNeeded: ["directors"],
    },
    {
      title: "Analyze Audience Reviews",
      description:
        "Samuel needs to analyze audience reviews to understand the reception of certain films. This helps in making informed decisions about which films to feature based on audience feedback and ratings. Complex complexity.",
      dataNeeded: ["movies", "users"],
    },
    {
      title: "Track Film Festival Trends",
      description:
        "Samuel needs to stay updated with the latest trends in film festivals, including popular genres, emerging directors, and audience preferences. This helps in curating a relevant and appealing festival lineup. Complex complexity.",
      dataNeeded: ["movies", "directors", "users"],
    },
    {
      title: "Network with Industry Professionals",
      description:
        "Samuel needs to network with directors, producers, and other industry professionals to invite them to the festival and collaborate on events. This involves finding contact information and professional history. Moderate complexity.",
      dataNeeded: ["directors"],
    },
  ],
  "Tina Lewis": [
    {
      title: "Trending Movies for Casting Opportunities",
      description:
        "Tina needs to stay updated on the latest trending movies to identify potential casting opportunities for her clients. This helps her proactively pitch her clients for roles in upcoming films. Moderate complexity.",
      dataNeeded: ["movies"],
    },
    {
      title: "Director Profiles and Upcoming Projects",
      description:
        "Tina needs detailed profiles of directors and information about their upcoming projects. This helps her understand the directors' styles and preferences, and match her clients with suitable roles. Complex complexity.",
      dataNeeded: ["directors", "movies"],
    },
    {
      title: "Actor Performance Reviews",
      description:
        "Tina needs to gather reviews and ratings of actors' performances in recent films. This helps her gauge the industry's perception of her clients and strategize their career moves. Moderate complexity.",
      dataNeeded: ["actors", "movies", "performance reviews", "ratings"],
    },
    {
      title: "Industry Trends and Insights",
      description:
        "Tina needs insights into industry trends, such as popular genres, box office hits, and emerging talent. This helps her make informed decisions about which roles to pursue for her clients. Complex complexity.",
      dataNeeded: [
        "genre trends",
        "box office statistics",
        "emerging talent profiles",
      ],
    },
    {
      title: "User Engagement and Feedback",
      description:
        "Tina needs to understand how users are interacting with the MovieDB, including feedback on movies and actors. This helps her gauge public opinion and tailor her clients' public relations strategies. Moderate complexity.",
      dataNeeded: ["user feedback", "movie reviews", "actor reviews"],
    },
  ],
} as const satisfies Record<
  (typeof sampleDatabaseUsers)[number]["name"],
  DatabaseUseCase[]
>;

export const sampleNlQueries = {
  "Alice Chen": {
    "Daily User Engagement Metrics": [
      {
        query:
          "What are the top 10 most viewed movies in the last 24 hours with their like counts and comment counts?",
        intent: "Track daily user engagement metrics for movies",
        collections: ["movies"],
        complexity: "moderate",
        resultsSchema: `type ResultSchema = { _id: ObjectId; title: string; views: number; likes: number; comments: number }[]`,
      },
    ],
    "Weekly Trending Movies Report": [
      {
        query:
          "Which movies have shown the biggest increase in ratings and views over the past week compared to their previous week?",
        intent: "Identify trending movies for marketing team",
        collections: ["movies"],
        complexity: "complex",
        resultsSchema: `type ResultSchema = { _id: ObjectId; title: string; ratings: number; views: number }[]`,
      },
    ],
    "Monthly Genre Popularity Analysis": [
      {
        query:
          "Compare the average ratings and total views across different genres for the past month versus the previous month",
        intent: "Analyze genre popularity trends month-over-month",
        collections: ["movies"],
        complexity: "complex",
        resultsSchema: `type ResultSchema = { _id: ObjectId; genre: string; ratings: number; views: number }[]`,
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
  data: sampleMovieDbInfo,
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
const sampleUser = sampleDatabaseUsers[1]; // Daniel Garcia
const userUseCases = sampleUseCases[sampleUser.name];

// Create a user node with the parent reference
export const userNode: DatabaseUserNode = {
  _id: new ObjectId(),
  parent: databaseInfoNode,
  data: sampleUser,
  updated: new Date(),
};

export const useCaseNodes = userUseCases.map((useCase) => ({
  _id: new ObjectId(),
  parent: userNode,
  data: useCase,
  updated: new Date(),
}));
