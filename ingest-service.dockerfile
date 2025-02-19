# Use Node.js Alpine as the base image
FROM node:18-alpine

# Set working directory
WORKDIR /bin

# Copy all files
COPY . ./

# Install Lerna
RUN npm install lerna

# Install system dependencies required for Playwright & Chromium
RUN apk add --no-cache \
    bash \
    curl \
    jq \
    coreutils \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    chromium \
    git

# Set Playwright's environment variable to store browsers in the container
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

RUN npm run bootstrap -- --scope='{mongodb-rag-core,mongodb-rag-ingest,ingest-mongodb-public}'
RUN npm run build -- --scope='{mongodb-rag-core,mongodb-rag-ingest,ingest-mongodb-public}'

# Install Playwright (explicitly fetching browsers)
RUN npm install -g playwright@latest && npx playwright install --with-deps

ENV NODE_ENV=production

WORKDIR /bin/packages/ingest-mongodb-public
