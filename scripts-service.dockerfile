# Build stage
FROM node:18

WORKDIR /app
COPY . ./
RUN npm install lerna && npm run bootstrap && npm run build -- --scope='{mongodb-rag-core,mongodb-chatbot-server,benchmarks,scripts,chatbot-server-mongodb-public}'

WORKDIR /app
