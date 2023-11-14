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
RUN npm install lerna
RUN npm run bootstrap -- --scope='{mongodb-rag-core,mongodb-chatbot-server,chatbot-server-mongodb-public,mongodb-chatbot-ui}'
RUN npm run build -- --scope='{mongodb-rag-core,mongodb-chatbot-server,chatbot-server-mongodb-public,mongodb-chatbot-ui}'

ENV NODE_ENV=production

EXPOSE 3000
WORKDIR /app/chatbot-server-mongodb-public
CMD ["npm", "start"]
