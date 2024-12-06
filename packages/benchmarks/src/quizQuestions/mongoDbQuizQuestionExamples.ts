import { QuizQuestionData } from "./QuizQuestionData";

export const mongoDbQuizQuestionExamples = [
  {
    questionText:
      "Which of the following are valid data types in MongoDB? (Select all that apply.)",
    answers: [
      {
        label: "A",
        answer: "String",
        isCorrect: true,
      },
      {
        label: "B",
        answer: "Integer",
        isCorrect: true,
      },
      {
        label: "C",
        answer: "Boolean",
        isCorrect: true,
      },
      {
        label: "D",
        answer: "Money",
        isCorrect: false,
      },
    ],
  },
  {
    questionText:
      "What type of data structure does MongoDB use to store data? (Select one.)",
    answers: [
      {
        label: "A",
        answer: "Tuples",
        isCorrect: false,
      },
      {
        label: "B",
        answer: "Tables",
        isCorrect: false,
      },
      {
        label: "C",
        answer: "Documents",
        isCorrect: true,
      },
      {
        label: "D",
        answer: "Rows",
        isCorrect: false,
      },
    ],
  },
  {
    questionText:
      "Which command is used to insert a document into a collection in MongoDB? (Select one.)",
    answers: [
      {
        label: "A",
        answer: "db.collection.insert()",
        isCorrect: true,
      },
      {
        label: "B",
        answer: "db.collection.add()",
        isCorrect: false,
      },
      {
        label: "C",
        answer: "db.collection.push()",
        isCorrect: false,
      },
      {
        label: "D",
        answer: "db.collection.save()",
        isCorrect: false,
      },
    ],
  },
  {
    questionText:
      "What is the primary key used in MongoDB documents called? (Select one.)",
    answers: [
      {
        label: "A",
        answer: "id",
        isCorrect: false,
      },
      {
        label: "B",
        answer: "_id",
        isCorrect: true,
      },
      {
        label: "C",
        answer: "primary_key",
        isCorrect: false,
      },
      {
        label: "D",
        answer: "document_id",
        isCorrect: false,
      },
    ],
  },
  {
    questionText:
      "Which of the following is a valid query operator in MongoDB? (Select all that apply.)",
    answers: [
      {
        label: "A",
        answer: "$eq",
        isCorrect: true,
      },
      {
        label: "B",
        answer: "$neq",
        isCorrect: false,
      },
      {
        label: "C",
        answer: "$like",
        isCorrect: false,
      },
      {
        label: "D",
        answer: "$gt",
        isCorrect: true,
      },
    ],
  },
] satisfies QuizQuestionData[];
