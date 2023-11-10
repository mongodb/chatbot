# Build stage
FROM node:18-alpine

ARG LG_ARTIFACTORY_PASSWORD
ENV LG_ARTIFACTORY_PASSWORD=${LG_ARTIFACTORY_PASSWORD}
ARG LG_ARTIFACTORY_USERNAME
ENV LG_ARTIFACTORY_USERNAME=${LG_ARTIFACTORY_USERNAME}
ARG LG_ARTIFACTORY_EMAIL
ENV LG_ARTIFACTORY_EMAIL=${LG_ARTIFACTORY_EMAIL}

WORKDIR /bin
COPY . ./
RUN npm install lerna
RUN npm run bootstrap -- --scope='{mongodb-rag-core,mongodb-rag-ingest,ingest-mongodb-public}'
RUN npm run build -- --scope='{mongodb-rag-core,mongodb-rag-ingest,ingest-mongodb-public}'

# Add git for GitDataSource
RUN apk add --no-cache git

ENV NODE_ENV=production

WORKDIR /bin/ingest-mongodb-public
