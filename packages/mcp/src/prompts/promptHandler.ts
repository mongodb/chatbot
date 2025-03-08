/**
 * Prompt handler for MongoDB MCP server
 *
 * This module provides functionality for handling and rendering prompts
 * with data from MongoDB.
 */

import { Prompt } from "../types";

/**
 * Simple template rendering function that replaces handlebars-style variables
 * and supports basic conditionals.
 *
 * @param template The template string with handlebars-style variables
 * @param data The data to use for variable replacement
 * @returns The rendered template
 */
export function renderTemplate(
  template: string,
  data: Record<string, any>
): string {
  // Handle conditionals {{#if variable}}content{{/if}}
  const conditionalRegex = /\{\{#if ([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
  const renderedWithConditionals = template.replace(
    conditionalRegex,
    (match, variable, content) => {
      const value = getNestedProperty(data, variable.trim());
      return value ? content : "";
    }
  );

  // Replace variables {{variable}}
  const variableRegex = /\{\{([^}]+)\}\}/g;
  return renderedWithConditionals.replace(variableRegex, (match, variable) => {
    const value = getNestedProperty(data, variable.trim());
    return value !== undefined ? String(value) : "";
  });
}

/**
 * Get a nested property from an object using dot notation
 *
 * @param obj The object to get the property from
 * @param path The path to the property using dot notation
 * @returns The value of the property or undefined if not found
 */
function getNestedProperty(obj: Record<string, any>, path: string): any {
  return path.split(".").reduce((prev, curr) => {
    return prev && prev[curr] !== undefined ? prev[curr] : undefined;
  }, obj);
}

/**
 * Render a prompt with the given data
 *
 * @param prompt The prompt to render
 * @param data The data to use for variable replacement
 * @returns The rendered prompt
 */
export function renderPrompt(
  prompt: Prompt,
  data: Record<string, any>
): string {
  return renderTemplate(prompt.template, data);
}

/**
 * Validate that the data contains all required parameters for a prompt
 *
 * @param prompt The prompt to validate against
 * @param data The data to validate
 * @returns True if the data is valid, false otherwise
 */
export function validatePromptData(
  prompt: Prompt,
  data: Record<string, any>
): boolean {
  const required = prompt.parameters.required || [];
  return required.every((param) => data[param] !== undefined);
}

/**
 * Get a list of all required parameters for a prompt
 *
 * @param prompt The prompt to get parameters for
 * @returns Array of required parameter names
 */
export function getRequiredParameters(prompt: Prompt): string[] {
  return prompt.parameters.required || [];
}

/**
 * Get a list of all optional parameters for a prompt
 *
 * @param prompt The prompt to get parameters for
 * @returns Array of optional parameter names
 */
export function getOptionalParameters(prompt: Prompt): string[] {
  const allParams = Object.keys(prompt.parameters.properties || {});
  const required = prompt.parameters.required || [];
  return allParams.filter((param) => !required.includes(param));
}
