FROM node:24.3-alpine AS base

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
RUN mkdir -p ./data/files ./data/tmp
RUN echo '[]' > ./data/games.json
RUN echo '{}' > ./data/manifest.json

FROM node:24.3-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
COPY . .
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/data ./data
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

ENTRYPOINT ["sh", "docker/dev/entrypoint.sh"]

FROM node:24.3-alpine AS test

WORKDIR /app
ENV WORK_DIR=/app
ENV NODE_ENV='testing'
ENV BODY_SIZE_LIMIT=5G
ENV APP_NAME='Playnite Insights (Testing)'

COPY . .
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/data ./data
# Include placeholder images for testing
COPY ./static/placeholder ./data/files/placeholder

RUN npx playwright install --with-deps

ENTRYPOINT ["npm", "run", "test:unit"]

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
COPY --chown=playnite-insights:playnite-insights --from=build /app/docker/common ./docker/common
COPY --chown=playnite-insights:playnite-insights --from=build /app/docker/prod ./docker/prod
COPY --chown=playnite-insights:playnite-insights --from=build /app/data ./data

EXPOSE 3000

USER playnite-insights

ENTRYPOINT ["sh", "docker/prod/entrypoint.sh"]
