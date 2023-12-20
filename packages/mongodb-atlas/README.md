# MongoDB Atlas Scripts

Scripts to manage MongoDB Atlas cluster.

Run them from the `package.json` file.

## atlas-search-index.ts

### Troubleshooting

A few notes for troubleshooting the `atlas-search-index.ts` script.

When you run it:

- If you get a 403 error, it's probably because you're IP address isn't on the allow list.
  You can go on the NYC VPN to access.
- If you get a 400 error, it's likely because the index already exists.

### Atlas Vector Search Index Configuration

```json
{
  "fields": [
    {
      "numDimensions": 1536,
      "path": "embedding",
      "similarity": "cosine",
      "type": "vector"
    },
    {
      "path": "sourceName",
      "type": "filter"
    }
  ]
}
```

## dump-restore

Scripts to dump DB and reupload.

Note that using `mongorestore` with the `--dump` flag on a collection indexed with Atlas Search destroys
the search index. You must readd (see `add-search-index.ts` script).
