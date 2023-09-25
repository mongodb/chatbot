# Contributor Guide

Information for contributors to the Docs AI Chatbot project.

> **Note** This guide is for MongoDB employees
>
> Currently, we have written the contributor guide and designed the project only
> for MongoDB employees to contribute to it. The project is dependent
> on some MongoDB infrastructure and credentials.
>
> In the future, we will explore accepting eternal contributions,
> and setting up the project accordingly.

## Project Structure

The project is structured as a monorepo, with all projects using TypeScript.
We use [Lerna](https://lerna.js.org/) to manage our monorepo.

The monorepo has the following main projects, each of which correspond to a JavaScript module:

- `chat-server`: Express.js server that performs chat functionality. RESTful API.
- `ingest`: CLI application that takes data from data sources and converts it to `embedded_content`
  used by Atlas Vector Search.
- `chat-ui`: React component for interfacing with the `chat-server`.
  Built with Leafygreen and vite.
- `chat-core`: Common resources shared across other projects.
  - You need to recompile `chat-core` by running `npm run build`
    every time you update it for the changes to be accessible in the other projects
    that dependend on it.
- `mongodb-atlas`: Collection of scripts related to managing the MongoDB Atlas deployment used by the project.
- `performance-tests`: Performance tests for the project using the
  k6 performance testing framework.
- `scripts`: Miscellaneous scripts to help with the project.

## Git Workflow

To contribute to the project, you should follow the standard GitHub workflow:

1. Create a fork of the repo.
2. Create a branch for your changes on your fork.
   - If there's a Jira ticket for your changes, name the branch after the ticket (e.g. `DOCSP-1234`).
   - If there's no Jira ticket, name the branch after the changes you're making (e.g. `fix_typos`).
3. Make your changes. Commit them to your branch and push to your fork.
4. Create a pull request to merge the changes from `<your fork/branch>` into
   the `docs-chatbot/main` branch.

## Network Access

You must be on a MongoDB corporate network (both office and VPNs) to access
many of the dependent services. If you are not in a MongoDB office, you should
go on the VPN before starting the bootstrap.

You should also be on a MongoDB corporate network to run the project locally.

## Bootstrapping

### 1. Get credentials and environment variables

Before you begin setting up the project, ask a current project contributor for the following:

1. Artifactory credentials
2. `.env` file variables for whichever projects you're working on.
   At a minimum, you'll need the `chat-core` environment variables, as the other
   projects depend on `chat-core`. If you're unsure which projects you need
   to work with, ask a current contributor.

### 2. Add Artifactory credentials

To install all dependencies and build all projects, you must set up your npm config
to use Artifactory with a specific set of credentials. You should have gotten the credentials
in the previous step.

In your shell environment configuration (e.g. `.zshrc`, `.bashprofile`, etc),
add the credentials:

```shell
# .zshrc
export LG_ARTIFACTORY_PASSWORD=<password>
export LG_ARTIFACTORY_USERNAME=<username>
export LG_ARTIFACTORY_EMAIL=<email>
```

### 3. Install dependencies and build projects

Run the following in the root of your project:

```sh
npm install
npm run bootstrap
```

### 4. Add Environment Variables

In step 1, you should have gotten the environment variables you need.

Add environment variables to whichever projects you're working on.
Every project has an `.env.example` file showing you which environment variables
you need.

### 4. Run Project(s)

Refer to the each project;s `README` files for information about running that project.

You can also run a development build of both the `chat-server` and `chat-ui`
with hot reload by running the following command from the root of the monorepo:

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

## Releases

### Staging

We run a staging version of the `chat-server` and `ingest` that uses
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
