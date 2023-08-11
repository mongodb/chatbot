/**
 * Returns the value of the environment variable with the given name.
 * @param name The name of the environment variable.
 * @returns The value of the environment variable.
 * @throws If the environment variable is not set.
 */
export function getEnvironmentValue(name: string) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Environment value ${name} is not set. Define it in the .env file.`)
  }
  return value
}
