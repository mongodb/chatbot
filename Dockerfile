# Build stage
FROM node:18-alpine as builder

# Set up chat-core
WORKDIR /app/chat-core
COPY chat-core ./
RUN npm ci && npm run build

# Set up chat-server
WORKDIR /app/chat-server
COPY chat-server/src/ ./src/
COPY chat-server/static ./static/
COPY chat-server/package*.json chat-server/tsconfig.json ./
RUN npm ci && npm run build

# Set up chat-ui
# NOTE: This must be done after setting up chat-server so that
# static asset directory exists for build to output files to.
WORKDIR /app/chat-ui
COPY chat-ui ./
RUN npm ci && npm run build:static-site:staging


# Main image
FROM node:18-alpine as main
ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder /app/chat-core ./chat-core/
RUN cd chat-core && npm ci
COPY --from=builder /app/chat-server ./chat-server/
RUN cd chat-server && npm ci


EXPOSE 3000
WORKDIR /app/chat-server
CMD ["npm", "start"]
