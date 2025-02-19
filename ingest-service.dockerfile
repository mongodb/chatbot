# Build stage
FROM node:18-bullseye

# Installs Chromium (100) package.
RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont
      # nodejs \
      # yarn

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /bin
COPY . ./
RUN npm install lerna
# RUN npm install puppeteer
RUN npm run bootstrap -- --scope='{mongodb-rag-core,mongodb-rag-ingest,ingest-mongodb-public}'
RUN npm run build -- --scope='{mongodb-rag-core,mongodb-rag-ingest,ingest-mongodb-public}'

# Add git for GitDataSource
RUN apk add --no-cache git

ENV NODE_ENV=production

WORKDIR /bin/packages/ingest-mongodb-public

# FROM node:18-alpine

# WORKDIR /bin
# COPY . ./

# RUN apk add --no-cache \
#       chromium \
#       nss \
#       freetype \
#       harfbuzz \
#       ca-certificates \
#       ttf-freefont \
#       nodejs \
#       wget \
#       bash \
#       libstdc++ \
#       udev \
#       ttf-opensans \
#       playwright

# # If running Docker >= 1.13.0 use docker run's --init arg to reap zombie processes, otherwise
# # uncomment the following lines to have `dumb-init` as PID 1
# # ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.2/dumb-init_1.2.2_x86_64 /usr/local/bin/dumb-init
# # RUN chmod +x /usr/local/bin/dumb-init
# # ENTRYPOINT ["dumb-init", "--"]

# # Uncomment to skip the Chrome for Testing download when installing puppeteer. If you do,
# # you'll need to launch puppeteer with:
# #     browser.launch({executablePath: 'google-chrome-stable'})
# # ENV PUPPETEER_SKIP_DOWNLOAD true

# # Install puppeteer so it's available in the container.
# RUN npm init -y && \
#     npm i puppeteer && \
#     npm install lerna && \
#     npm run bootstrap -- --scope='{mongodb-rag-core,mongodb-rag-ingest,ingest-mongodb-public}' && \
#     npm run build -- --scope='{mongodb-rag-core,mongodb-rag-ingest,ingest-mongodb-public}'

# # Install Playwright with dependencies
# # RUN npx playwright install --with-deps

# # Add git for GitDataSource
# RUN apk add --no-cache git

# ENV NODE_ENV=production

# WORKDIR /bin/packages/ingest-mongodb-public