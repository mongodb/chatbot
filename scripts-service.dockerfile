# Build stage
FROM node:18-alpine as builder

WORKDIR /app
COPY . ./
RUN npm install lerna && npm run bootstrap && npm run build -- --scope='{mongodb-rag-core,mongodb-chatbot-server,scripts}'

WORKDIR /app
