# Build stage
FROM node:18

WORKDIR /bin
COPY . ./
RUN npm install lerna
RUN npm run bootstrap -- --scope='{mongodb-rag-core,mongodb-rag-ingest,ingest-mongodb-public}'
RUN npm run build -- --scope='{mongodb-rag-core,mongodb-rag-ingest,ingest-mongodb-public}'

# Install Playwright with dependencies
RUN npx playwright install chromium --with-deps

# Add git for GitDataSource
RUN apt-get update && apt-get install -y git

ENV NODE_ENV=production

WORKDIR /bin/packages/ingest-mongodb-public
