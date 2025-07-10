FROM node:24.3-alpine AS base

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
RUN mkdir -p ./data/files ./data/tmp

FROM node:24.3-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/data ./data
COPY . .
RUN npm run build

FROM node:24.3-alpine AS dev

RUN addgroup -S playnite-insights && adduser -S -G playnite-insights playnite-insights

WORKDIR /app
ENV WORK_DIR=/app
ENV NODE_ENV='development'
ENV BODY_SIZE_LIMIT=5G
ENV APP_NAME='Playnite Insights (Dev)'

COPY --chown=playnite-insights:playnite-insights . .
COPY --chown=playnite-insights:playnite-insights --from=base /app/node_modules ./node_modules
COPY --chown=playnite-insights:playnite-insights --from=base /app/data ./data
# Include placeholder images for testing
COPY --chown=playnite-insights:playnite-insights ./static/placeholder ./data/files/placeholder

EXPOSE 3000

USER playnite-insights

ENTRYPOINT [ "npx", "vite", "dev", "--host" ]

# Playwright not compatible with Alpine!
FROM node:24.3 AS test

WORKDIR /app
ENV WORK_DIR=/app
ENV NODE_ENV='testing'
ENV BODY_SIZE_LIMIT=5G
ENV APP_NAME='Playnite Insights (Testing)'

COPY package.json package-lock.json ./
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/data ./data
# Include placeholder images for testing
COPY ./static/placeholder ./data/files/placeholder
RUN npx -y playwright install --with-deps 
COPY . .

ENTRYPOINT ["sh", "-c", "npm run test:all"]

FROM node:24.3-alpine AS prod

WORKDIR /app
RUN addgroup -S playnite-insights && adduser -S -G playnite-insights playnite-insights

ENV WORK_DIR=/app
ENV NODE_ENV='production'
ENV BODY_SIZE_LIMIT=5G
ENV APP_NAME='Playnite Insights'

WORKDIR /app
COPY --chown=playnite-insights:playnite-insights --from=build /app/build ./build
COPY --chown=playnite-insights:playnite-insights --from=build /app/package.json ./package.json
COPY --chown=playnite-insights:playnite-insights --from=build /app/package-lock.json ./package-lock.json
COPY --chown=playnite-insights:playnite-insights --from=build /app/node_modules ./node_modules
COPY --chown=playnite-insights:playnite-insights --from=build /app/docker ./docker
COPY --chown=playnite-insights:playnite-insights --from=build /app/data ./data

EXPOSE 3000

USER playnite-insights

ENTRYPOINT ["node", "build"]
