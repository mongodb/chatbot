# Build stage
FROM node:20

WORKDIR /app
COPY . ./
RUN npm install lerna && npm run bootstrap && npm run build

WORKDIR /app
