# MongoDB Documentation AI Chatbot

Repo holding resources related to the MongoDB AI Chatbot. The Chatbot uses the MongoDB [documentation](https://www.mongodb.com/docs/) and [Developer Center](https://www.mongodb.com/developer/) as its sources of truth.

More coming soon!

## Releases

### Staging

Changes are added to staging environment when you merge into `main` branch. Handled by the CI.

### Production

This project uses `release-it` to create production releases.

#### `chat-server` and `ingest`

For `chat-server` and `ingest`, both of which are published to a MongoDB server environment:

1. Pull latest code you want to release (probably `git pull upstream main`).
1. Checkout a new branch for your release. The branch must have the following naming convention:
   `package-name@semver-for-release` (e.g `git checkout -b chat-server@1.0.0`).
1. In the relevant package directory (e.g `chat-server`), run the command: `npm run release`
1. Fill out the CLI prompts. Eventually, you should be directed to the Github UI, where you
   can add a description of the release.
1. Fill out the release description and publish the release. **DO NOT** edit the release name field.
   This is used to trigger publication in the release. The release name MUST match the branch name.
   - This release has not yet been published.
1. Create a pull request for the branch. Get it reviewed using the standard review process.
1. Once, the PR is approved and merged, it will automatically attempt to publish the release
   with the same name as the PR.
