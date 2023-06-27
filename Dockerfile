# Build stage
FROM node:18-alpine as builder

# Set up chat-core
WORKDIR /app/chat-core
COPY chat-core ./
RUN npm ci

# Set up chat-server
WORKDIR /app/chat-server
COPY chat-server/src/ ./src/
COPY chat-server/package*.json chat-server/tsconfig.json ./
RUN pwd
RUN ls
RUN npm ci && npm run build

# Main image
FROM node:18-alpine as main
ENV NODE_ENV=production
WORKDIR /app/chat-server

# Install only production dependencies
COPY --from=builder /app/chat-core ../chat-core/
COPY --from=builder /app/chat-server/package*.json ./
RUN npm ci

# Get built JS file
COPY --from=builder /app/chat-server/dist ./dist

EXPOSE 3000
CMD ["node", "dist/index.js"]
