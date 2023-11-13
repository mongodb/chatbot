# Build stage
FROM node:18-alpine as builder

ARG LG_ARTIFACTORY_TOKEN
ENV LG_ARTIFACTORY_TOKEN=${LG_ARTIFACTORY_TOKEN}
ARG LG_ARTIFACTORY_EMAIL
ENV LG_ARTIFACTORY_EMAIL=${LG_ARTIFACTORY_EMAIL}

WORKDIR /app
COPY . ./
RUN npm install lerna && npm run bootstrap && npm run build -- --scope='{chat-core,chat-server,scripts}'

# Main image
FROM node:18-alpine as main
ENV NODE_ENV=production
WORKDIR /bin

COPY --from=builder app/chat-core ./chat-core/
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder app/scripts/package*.json ./scripts/
COPY --from=builder app/scripts/node_modules ./scripts/node_modules
COPY --from=builder app/scripts/build ./scripts/build

WORKDIR /bin/scripts
