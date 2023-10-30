# Build stage
FROM node:18-alpine as builder

ARG ENVIRONMENT
ENV ENVIRONMENT=${ENVIRONMENT}
ARG LG_ARTIFACTORY_PASSWORD
ENV LG_ARTIFACTORY_PASSWORD=${LG_ARTIFACTORY_PASSWORD}
ARG LG_ARTIFACTORY_USERNAME
ENV LG_ARTIFACTORY_USERNAME=${LG_ARTIFACTORY_USERNAME}
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

# OSS_REFACTOR_TODO: this will probably need work
# need to do something to ready up mongodb-chatbot-server
COPY --from=builder /app/chat-core ./chat-core/
COPY --from=builder /app/chat-server ./chat-server/
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/chatbot-server-mongodb-public/package*.json ./chatbot-server-mongodb-public/
COPY --from=builder /app/chatbot-server-mongodb-public/static ./chatbot-server-mongodb-public/static
COPY --from=builder /app/chatbot-server-mongodb-public/dist ./chatbot-server-mongodb-public/dist
COPY --from=builder /app/chatbot-server-mongodb-public/node_modules ./chatbot-server-mongodb-public/node_modules

EXPOSE 3000
WORKDIR /app/chatbot-server-mongodb-public
CMD ["npm", "start"]
