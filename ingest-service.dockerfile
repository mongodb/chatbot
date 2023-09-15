# Build stage
FROM node:18-alpine as builder

ARG LG_ARTIFACTORY_PASSWORD
ENV LG_ARTIFACTORY_PASSWORD=${LG_ARTIFACTORY_PASSWORD}
ARG LG_ARTIFACTORY_USERNAME
ENV LG_ARTIFACTORY_USERNAME=${LG_ARTIFACTORY_USERNAME}
ARG LG_ARTIFACTORY_EMAIL
ENV LG_ARTIFACTORY_EMAIL=${LG_ARTIFACTORY_EMAIL}

WORKDIR /app
COPY . ./
RUN npm install lerna && npm run bootstrap && npm run build -- --scope='{chat-core,ingest}'

# Main image
FROM node:18-alpine as main
ENV NODE_ENV=production
WORKDIR /bin

# Add git for GitDataSource
RUN apk add --no-cache git

COPY --from=builder app/chat-core ./chat-core/
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder app/ingest/package*.json ./ingest/
COPY --from=builder app/ingest/node_modules ./ingest/node_modules
COPY --from=builder app/ingest/build ./ingest/build

WORKDIR /bin/ingest
