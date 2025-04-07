import {
  getSimplifiedSchema,
  SimplifiedSchema,
  SimplifiedSchemaField,
} from "mongodb-schema";
import { DatabaseExecutionResult } from "../DatabaseExecutionResult";

/**
  Given a {@link DatabaseExecutionResult}, return a JSON schema-like object of the result.
  This function builds on {@link getSimplifiedSchema}, but simplifies the types further.
 */
export async function getVerySimplifiedSchema(
  result: unknown
): Promise<Record<string, unknown> | string> {
  if (typeof result === "number") return { type: "Number" };
  else if (typeof result === "boolean") return { type: "Boolean" };
  else if (result === null) return { type: "Null" };
  else if (result === undefined) return { type: "Undefined" };
  else if (typeof result === "string") return { type: "String" };
  else if (Array.isArray(result) && result.length === 0) {
    return { type: "Array", $metadata: { emptyArray: true } };
  } else if (Array.isArray(result) && result.length > 0) {
    const simplifiedSchema = await furtherSimplifySchema(result);

    // For arrays of objects, we need to wrap the schema in a Document type
    return {
      type: "Array",
      items: {
        type: "Document",
        properties: simplifiedSchema,
      },
    };
  } else if (typeof result === "object" && result !== null) {
    const simplifiedSchema = await furtherSimplifySchema(result);

    return { type: "Document", properties: simplifiedSchema };
  } else return { type: "Unknown" };
}

async function furtherSimplifySchema(
  elem: unknown
): Promise<Record<string, unknown>> {
  const schema = await getSimplifiedSchema(Array.isArray(elem) ? elem : [elem]);
  const result = furtherSimplySchemaRecursiveHelper(schema);
  return result;
}

function furtherSimplySchemaRecursiveHelper(
  schema: SimplifiedSchema | SimplifiedSchemaField
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(schema)) {
    if (Array.isArray(value) && value.length > 0) {
      const firstItem = value[0];

      if (firstItem.bsonType === "Document" && firstItem.fields) {
        // Handle document with fields
        result[key] = {
          type: "Document",
          properties: furtherSimplySchemaRecursiveHelper(firstItem.fields),
        };
      } else if (firstItem.bsonType === "Array") {
        // Handle array type
        result[key] = {
          type: "Array",
          items: { type: "String" }, // Default to string items, adjust as needed
        };
      } else {
        // Handle primitive types
        result[key] = firstItem.bsonType;
      }
    } else if (value.types && value.types.length > 0) {
      // Handle the regular case with types array
      const valueType = value.types[0].bsonType;

      if (valueType === "Document") {
        // For Document type, we need to check if it has fields
        if (value.types[0].fields) {
          result[key] = {
            type: "Document",
            properties: furtherSimplySchemaRecursiveHelper(
              value.types[0].fields
            ),
          };
        } else {
          result[key] = {
            type: "Document",
            properties: {},
          };
        }
      } else if (valueType === "Array") {
        // For Array type, we need to check if it has types for items
        if (value.types[0].types && value.types[0].types.length > 0) {
          const firstItemType = value.types[0].types[0].bsonType;

          if (firstItemType === "Document" && value.types[0].types[0].fields) {
            // Handle arrays of objects by recursing into the fields
            result[key] = {
              type: "Array",
              items: {
                type: "Document",
                properties: furtherSimplySchemaRecursiveHelper(
                  value.types[0].types[0].fields
                ),
              },
            };
          } else {
            // Handle arrays of primitive types
            result[key] = {
              type: "Array",
              items: { type: firstItemType },
            };
          }
        } else {
          result[key] = {
            type: "Array",
            items: { type: "String" }, // Default to string items
          };
        }
      } else {
        // Handle primitive types
        result[key] = valueType;
      }
    } else {
      // Fallback for unknown structures
      result[key] = "Unknown";
    }
  }

  return result;
}
