# Build stage
FROM node:18-alpine as builder

ARG LG_ARTIFACTORY_TOKEN
ENV LG_ARTIFACTORY_TOKEN=${LG_ARTIFACTORY_TOKEN}
ARG LG_ARTIFACTORY_EMAIL
ENV LG_ARTIFACTORY_EMAIL=${LG_ARTIFACTORY_EMAIL}

WORKDIR /app
COPY . ./
RUN npm install lerna && npm run bootstrap && npm run build -- --scope='{mongodb-rag-core,mongodb-chatbot-server,mongodb-chatbot-eval,chatbot-eval-mongodb-public}'

WORKDIR /app
