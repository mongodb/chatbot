FROM node:18-alpine

WORKDIR /bin
COPY . ./
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    nodejs \
    yarn \
    libstdc++ \
    bash \
    wget \
    curl \
    nss \
    nspr \
    alsa-lib \
    atk \
    cairo \
    cups-libs \
    dbus-libs \
    expat \
    fontconfig \
    gtk3 \
    libxcomposite \
    libxdamage \
    libxext \
    libxi \
    libxrandr \
    mesa \
    pango

RUN npm install lerna
RUN npm run bootstrap -- --scope='{mongodb-rag-core,mongodb-rag-ingest,ingest-mongodb-public}'
RUN npm run build -- --scope='{mongodb-rag-core,mongodb-rag-ingest,ingest-mongodb-public}'

# Add git for GitDataSource
RUN apk add --no-cache git

ENV NODE_ENV=production

WORKDIR /bin/packages/ingest-mongodb-public