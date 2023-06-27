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
WORKDIR /app

COPY --from=builder /app/chat-core ./chat-core/
RUN cd chat-core && npm ci
COPY --from=builder /app/chat-server/package*.json ./chat-server/
COPY --from=builder /app/chat-server/dist ./chat-server/dist
RUN cd chat-server && npm ci


EXPOSE 3000
WORKDIR /app/chat-server
CMD ["npm", "start"]
