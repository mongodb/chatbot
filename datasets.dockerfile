# Build stage
FROM node:20 as builder

WORKDIR /bin
COPY . ./
RUN npm install lerna && npm run bootstrap && npm run build -- --scope=datasets --include-dependencies

ENV NODE_ENV=production

WORKDIR /bin/packages/datasets
