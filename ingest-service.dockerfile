# Build stage
FROM node:18-alpine as builder

WORKDIR /app
COPY . ./
RUN npm ci -- --scope='{chat-core,ingest}' --stream --parallel && npm run bootstrap -- --scope='{chat-core,ingest}' --stream --parallel && npm run build -- --scope='{chat-core,ingest}' --stream --parallel

# Main image
FROM node:18-alpine as main
ENV NODE_ENV=production
WORKDIR /bin

COPY --from=builder app/chat-core ./chat-core/
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder app/ingest/package*.json ./ingest/
COPY --from=builder app/ingest/node_modules ./ingest/node_modules
COPY --from=builder app/ingest/build ./ingest/build

WORKDIR /bin/ingest
