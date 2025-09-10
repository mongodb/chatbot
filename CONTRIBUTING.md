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
npm run build -- --scope='{mongodb-rag-core,benchmarks}'
```

## Infrastructure

The project use Github Actions for its CI/CD pipeline. 

This project doesn't deploy any services.

## Manage Secrets

### Local

For local development, manage secrets using `.env` files. Wherever you need a `.env` file,
there's a `.env.example` file with the fields you need to add values for.

### CI

For our CI, we use Github Actions. You can manage Github Action secrets using the Github UI.

Our CI tests require secrets to run.
