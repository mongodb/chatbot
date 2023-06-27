# Build stage
FROM node:18-alpine as builder
WORKDIR /app

COPY ../chat-core ./chat-core/
COPY src/ ./src/
COPY package*.json tsconfig.json ./
RUN npm ci && npm run build

# Main image
FROM node:18-alpine as main
ENV NODE_ENV=production
WORKDIR /app

# Install only production dependencies
COPY ../chat-core ./chat-core/
COPY package*.json ./
RUN npm ci --omit=dev

# Get built JS file
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/index.js"]
