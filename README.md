# MongoDB Documentation AI Chatbot

Repo holding resources related to the MongoDB AI Chatbot. The Chatbot uses the MongoDB [documentation](https://www.mongodb.com/docs/) and [Developer Center](https://www.mongodb.com/developer/) as its sources of truth.

## Releases

### Staging

We run a staging server that uses the latest commit on the `main` branch. When
you merge new commits into `main`, a CI/CD pipeline automatically builds and
publishes the updated staging server and demo site.

### QA Server & Demo Site

We run a QA server that serves a specific build for testing before we release to
production.

To publish to QA:

1. Check out the `qa` branch and pull any upstream changes. Here, `upstream` is
   the name of the `mongodb/docs-chatbot` remote repo.

   ```sh
   git fetch upstream
   git checkout qa
   git pull upstream qa
   ```

2. Apply any commits you want to build to the branch. In many cases you'll just
   build from the same commits as `main`. However, you might want to QA only a
   subset of commits from `main`.

3. Add a tag to the latest commit on the `qa` branch using the following naming scheme: `chat-server-qa-<Build ID>`

   ```
   git tag chat-server-qa-0.0.42 -a
   ```

4. Push the branch to this upstream GitHub repo

   ```sh
   git push upstream qa
   ```

Once you've added the tag to the upstream repo, the Drone CI automatically
builds and deploys the branch to the QA server.

### Production Deployments

We use a tool called `release-it` to prepare production releases for the
`chat-server`, `ingest`, and `chat-ui` projects.

Production releases are triggered by creating a git tag prefaced with the
package name (e.g. `chat-server-v{version-number}`).

To create a new production release:

1. Pull latest code you want to release.

   ```sh
   git pull upstream main
   ```

2. In the relevant package directory (e.g `chat-server`) run the release
   command. This gets the package ready for a new release.

   ```sh
   npm run release
   ```

   When prompted create a draft Github release. The URL for the release draft is
   present in the output of CLI operation. You can use this later.

3. Create a pull request for the branch. Get it reviewed using the standard
   review process.

4. Once the PR is approved and merged, publish the draft release. You can find
   the release draft in the draft tag:
   <https://github.com/mongodb/docs-chatbot/releases>.

When the release is published, the Drone CI picks up the corresponding git tag
and then automatically builds and deploys the branch to production.
