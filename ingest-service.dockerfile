# TODO: add dockerfile for running the ingest service
# Build stage
FROM node:18-alpine as builder

# Set up chat-core
WORKDIR /chat-core
COPY chat-core ./
RUN npm ci && npm run build

# Set up ingest service
WORKDIR /ingest-service
COPY ingest/src/ ./src/
COPY ingest/package*.json ingest/tsconfig.json ./
RUN npm ci && npm run build

# Main image
FROM node:18-alpine as main
ENV NODE_ENV=production
WORKDIR /bin

COPY --from=builder /chat-core ./chat-core/
RUN cd chat-core && npm ci
COPY --from=builder /ingest/package*.json ./ingest/
COPY --from=builder /ingest/build ./ingest/build
RUN cd ingest && npm ci

WORKDIR /bin/ingest
