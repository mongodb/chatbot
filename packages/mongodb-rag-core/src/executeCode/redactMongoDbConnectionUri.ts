/**
  Replace MongoDB conneciton URI username and password
  with `"<USERNAME>:<PASSWORD>"` so that the URI is safe to log/persist.
 */
export function redactMongoDbConnectionUri(uri: string) {
  return uri.replace(
    /mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/g,
    "mongodb$1://<USERNAME>:<PASSWORD>@"
  );
}
