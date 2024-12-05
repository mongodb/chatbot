# Contributor Guide

Information for contributors to the Docs AI Chatbot project.

> **Note** This guide is for MongoDB employees
>
> Currently, we have written the contributor guide and designed the project only
> for MongoDB employees to contribute to it. The project is dependent
> on some MongoDB infrastructure and credentials.
>
> In the future, we will explore accepting external contributions,
> and setting up the project accordingly.

## Project Structure

The project is structured as a monorepo, with all projects using TypeScript.
We use [Lerna](https://lerna.js.org/) to manage our monorepo.

The monorepo has the following main projects, each of which correspond to a JavaScript module:

### Retrieval-Augmented Generation

These packages power our RAG applications.

- `mongodb-rag-core`: A set of common resources (modules, functions, types, etc.) shared across projects.
  - You need to recompile `mongodb-rag-core` by running `npm run build` every time you update it for the changes to be accessible in the other projects that dependend on it.
- `mongodb-rag-ingest`: CLI application that takes data from data sources and converts it to `embedded_content` used by Atlas Vector Search.

### MongoDB Chatbot Framework

These packages are generic implementations of our Chatbot Server framework. In
general, we publish these as reusable packages on npm.

- `mongodb-chatbot-server`: Express.js server that performs chat functionality. RESTful API.
- `mongodb-chatbot-ui`: React component for interfacing with the `mongodb-chatbot-server`. Built with Leafygreen and vite.
- `mongodb-chatbot-verified-answers`: A CLI and framework for ingesting & managing verified chatbot answers.

### MongoDB AI Chatbot

These packages are our production chatbot. They build on top of the Chatbot
Framework packages and add MongoDB-specific implementations.

- `chatbot-eval-mongodb-public`: Test suites, evaluators, and reports for the MongoDB AI Chatbot
- `chatbot-server-mongodb-public`: Chatbot server implementation with our MongoDB-specific configuration.
- `ingest-mongodb-public`: RAG ingest service configured to ingest MongoDB Docs, DevCenter, MDBU, MongoDB Press, etc.

### Tools, Scripts, & Generators

- `mongodb-artifact-generator`: A CLI to generate docs pages, translate code examples, etc.
- `mongodb-atlas`: Collection of scripts related to managing the MongoDB Atlas deployment used by the project.
- `performance-tests`: Performance tests for the project using the k6 performance testing framework.
- `scripts`: Miscellaneous scripts to help with the project.

## Git Workflow

To contribute to the project, you should follow the standard GitHub workflow:

1. Create a fork of the repo.
2. Create a branch for your changes on your fork.
   - If there's a Jira ticket for your changes, name the branch after the ticket (e.g. `DOCSP-1234`).
   - If there's no Jira ticket, name the branch after the changes you're making (e.g. `fix_typos`).
3. Make your changes. Commit them to your branch and push to your fork.
4. Create a pull request to merge the changes from `<your fork/branch>` into
   the `mongodb:chatbot/main` branch.

## Network Access

You must be on a MongoDB corporate network (both office and VPNs) to access
many of the dependent services. If you are not in a MongoDB office, you should
go on the VPN before starting the bootstrap.

You should also be on a MongoDB corporate network to run the project locally.

## Bootstrapping

### 1. Set Up The Monorepo

Run the following in the root of the repo to install the dependencies and link
packages in the repo:

```sh
npm install
npm run bootstrap
```

### 2. Get Credentials And Environment Variables

Most packages in the monorepo require you to define environment variables. We
use these to configure services like MongoDB Atlas and OpenAI as well as to
control aspects of the build process.

We define environment variables for each package in a `.env` file in the package
root. Every project has an `.env.example` file showing you which environment
variables you need.

To set up a package, ask a current project contributor for the `.env` files of
that package and any of our packages it depends on. If you're unsure which
projects you need to work with, ask a current contributor.

At a minimum, you'll need the environment variables for `mongodb-rag-core` since
it's used by most packages.

### 3. Build The Packages

In general, you need to build a package's local dependencies and then build the
package itself before you can use it. You can check if a package has any local
dependencies by looking for the names of this repo's other packages in the
`dependencies` list of `package.json`.

At a minimum, you'll need to build `mongodb-rag-core`.

You can build packages individually by running `build` from the package root:

```shell
npm run build
```

Or you can build multiple packages by running `build` from the repo root. By
default this builds all packages in the repo. You can use the `--scope` flag to
only build a subset of all packages.

```shell
npm run build -- --scope='{mongodb-rag-core,chatbot-server-mongodb-public,mongodb-chatbot-ui}'
```

You can also run a development build of both the `chatbot-server-mongodb-public`
and `mongodb-chatbot-ui` with hot reload by running the following command from
the root of the monorepo:

```sh
npm run dev
```

## Infrastructure

The projects uses Drone for its CI/CD pipeline. All drone config is located in `.drone.yml`.

Applications are deployed on Kubernetes using the Kanopy developer platform.
Kubernetes/Kanopy configuration are found in the `<deployed project>/environments`
directories. Refer to the Kanopy documentation for more information
on the Kanopy environment files.

The applications are containerized using docker. Docker files are named
with the `*.dockerfile` extension.

## Versioning

We use [release-it](https://github.com/release-it/release-it) to manage versioning packages.

All packages' versioning is managed independently, which means that each package has its own version number. We use Lerna **independent mode** to facilitate this.

We use [semantic versioning](https://semver.org/) to version packages.

Updating the version of a package is done as part of the release flow. Run the following command from a given package (e.g. `mongodb-chatbot-server`):

```sh
npm run release
```

To learn more about our release setup, refer to the [release-it monorepo documentation](https://github.com/release-it/release-it/blob/main/docs/recipes/monorepo.md).

When you create a tag for a release and push it to Github, it triggers a Drone pipeline
that publishes the package to npm.

## Releases

### Staging

We run a staging version of the `mongodb-chatbot-server` and `mongodb-rag-ingest` that uses
the latest commit on the `main` branch. When you merge new commits into `main`,
a CI/CD pipeline automatically builds and publishes the updated staging server and demo site.

### QA Server & Demo Site

We run a QA server that serves a specific build for testing before we release to
production.

To publish to QA:

1. Check out the `qa` branch and pull any upstream changes. Here, `upstream` is
   the name of the `mongodb/chatbot` remote repo.

   ```sh
   git fetch upstream
   git checkout qa
   git pull upstream qa
   ```

2. Apply any commits you want to build to the branch. In many cases you'll just
   build from the same commits as `main`. However, you might want to QA only a
   subset of commits from `main`.

3. Add a tag to the latest commit on the `qa` branch using the following naming scheme:
   `chat-server-qa-<Build ID>`

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
`mongodb-chatbot-server`, `mongodb-rag-ingest`, and `chat-ui` projects.

Production releases are triggered by creating a git tag prefaced with the
package name (e.g. `chat-server-v{version-number}`).

To create a new production release:

1. Pull latest code you want to release.

   ```sh
   git pull upstream main
   ```

2. In the relevant package directory (e.g `mongodb-chatbot-server`) run the release
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
   <https://github.com/mongodb/chatbot/releases>.

When the release is published, the Drone CI picks up the corresponding git tag
and then automatically builds and deploys the branch to production.

## Manage Secrets

### Local

For local development, manage secrets using `.env` files. Wherever you need a `.env` file,
there's a `.env.example` file with the fields you need to add values for.

### CI

For our CI, we use [Drone](https://docs.drone.io/). You can manage Drone secrets using the Drone UI.

Our CI tests require secrets to run. These are run from the config in the `.drone.yml` file.

For more information on Drone secrets management, refer to <https://docs.drone.io/secret/>.

### Staging

Our staging environment is deployed to a Kubernetes deployment via the Kanopy developer platform.
We use [Kubernetes secrets](https://kubernetes.io/docs/concepts/configuration/secret/).
You can update secrets with either the [helm ksec extension](https://github.com/kanopy-platform/ksec)
or the Kanopy UI.

### Production

Same as staging, but in the production environment.
