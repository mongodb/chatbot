# Build stage
FROM node:18-alpine as builder

ARG ENVIRONMENT
ENV ENVIRONMENT=${ENVIRONMENT}
ARG LG_ARTIFACTORY_TOKEN
ENV LG_ARTIFACTORY_TOKEN=${LG_ARTIFACTORY_TOKEN}
ARG LG_ARTIFACTORY_EMAIL
ENV LG_ARTIFACTORY_EMAIL=${LG_ARTIFACTORY_EMAIL}
ARG GIT_COMMIT
ENV VITE_GIT_COMMIT=${GIT_COMMIT}

# Install all dependencies && set up project
WORKDIR /app
COPY . ./
RUN npm install lerna && npm run bootstrap && npm run build

# Main image
FROM node:18-alpine as main
WORKDIR /app

# Add curl for the function executor
RUN apk --no-cache add curl

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
