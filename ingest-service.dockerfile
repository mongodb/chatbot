FROM node:18-alpine

WORKDIR /bin
COPY . ./
RUN npm install lerna

# Required to run web scraping
RUN npx playwright install-deps chromium
RUN apt-get update && apt-get install -y libnss3 libatk1.0-0 libx11-xcb1 libxcomposite1 libxcursor1 libxdamage1 libxfixes3 libxi6 libxrandr2 libgbm1 libpango-1.0-0 libcairo2

RUN npm run bootstrap -- --scope='{mongodb-rag-core,mongodb-rag-ingest,ingest-mongodb-public}'
RUN npm run build -- --scope='{mongodb-rag-core,mongodb-rag-ingest,ingest-mongodb-public}'

# Add git for GitDataSource
RUN apk add --no-cache git

ENV NODE_ENV=production

WORKDIR /bin/packages/ingest-mongodb-public
