# Build stage
FROM node:18

ARG ENVIRONMENT
ENV ENVIRONMENT=${ENVIRONMENT}
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
CMD ["npm", "run", "server:start"]
