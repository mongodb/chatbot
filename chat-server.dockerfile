# Build stage
FROM node:18-alpine as builder

ARG ENVIRONMENT
ENV ENVIRONMENT=${ENVIRONMENT}
# Install all dependencies && set up project
WORKDIR /app
COPY . ./
RUN npm ci && npm run bootstrap && npm run build

# Main image
FROM node:18-alpine as main
ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder /app/chat-core ./chat-core/
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/chat-server/package*.json ./chat-server/
COPY --from=builder /app/chat-server/static ./chat-server/static
COPY --from=builder /app/chat-server/dist ./chat-server/dist
COPY --from=builder /app/chat-server/node_modules ./chat-server/node_modules

EXPOSE 3000
WORKDIR /app/chat-server
CMD ["npm", "start"]
