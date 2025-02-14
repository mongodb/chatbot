# Build stage
FROM node:18-alpine

# Installs Chromium (100) package.
RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      nodejs \
      yarn

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Puppeteer v13.5.0 works with Chromium 100.
RUN npm install puppeteer@13.5.0

WORKDIR /bin
COPY . ./
RUN npm install lerna
RUN npm run bootstrap -- --scope='{mongodb-rag-core,mongodb-rag-ingest,ingest-mongodb-public}'
RUN npm run build -- --scope='{mongodb-rag-core,mongodb-rag-ingest,ingest-mongodb-public}'

# Add git for GitDataSource
RUN apk add --no-cache git

ENV NODE_ENV=production

WORKDIR /bin/packages/ingest-mongodb-public
