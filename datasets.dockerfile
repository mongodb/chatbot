# Build stage
FROM node:18 as builder

WORKDIR /app
COPY . ./
RUN npm install lerna && npm run bootstrap && npm run build -- --scope=datasets --include-dependencies

WORKDIR /app
