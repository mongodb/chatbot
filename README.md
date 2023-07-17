# MongoDB Documentation AI Chatbot

Repo holding resources related to the MongoDB AI Chatbot. The Chatbot uses the MongoDB [documentation](https://www.mongodb.com/docs/) and [Developer Center](https://www.mongodb.com/developer/) as its sources of truth.

## Releases

### Staging

Changes are added to staging environment when you merge into `main` branch. Handled by the CI.

### Production

This project uses `release-it` to create production releases.

#### `chat-server` and `ingest`

For `chat-server` and `ingest`, both of which are published to a MongoDB server environment,
production releases are triggered by creating a git tag prefaced with the package name (e.g. `chat-server@version-number).

To create a new production release:

1. Pull latest code you want to release (probably `git pull upstream main`).
1. Checkout a new branch for your release. The branch should have the following naming convention:
   `package-name@semver-for-release` (e.g `git checkout -b chat-server@1.0.0`).
1. In the relevant package directory (e.g `chat-server`), run the command: `npm run release`
1. This will get the package ready for release, including creating a draft Github release.
   The URL for the release draft is present in the output of CLI operation.
   You can use this later.
1. Create a pull request for the branch. Get it reviewed using the standard review process.
1. Once the PR is approved and merged, publish the release draft corresponding to the changes in the PR.
   You can find the release draft in the draft tag: <https://github.com/mongodb/docs-chatbot/releases>.
   DO NOT change the release name. The name is used to create the tag,
   which is used to create the production release.
1. When the release is published, the Drone CI will pick up the corresponding git tag,
   and trigger a deploy from it.

#### `chat-ui`

TBD
