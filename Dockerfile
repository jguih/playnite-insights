FROM node:24.3-alpine AS base

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
RUN mkdir -p ./data/files ./data/tmp

FROM base AS build

WORKDIR /app
COPY . .
RUN npm run build

FROM base AS dev

RUN addgroup -S playnite-insights && adduser -S -G playnite-insights playnite-insights

WORKDIR /app
ENV WORK_DIR=/app
ENV NODE_ENV='development'
ENV BODY_SIZE_LIMIT=128M
ENV APP_NAME='Playnite Insights (Dev)'

COPY --chown=playnite-insights:playnite-insights . .
# Include placeholder images for testing
COPY --chown=playnite-insights:playnite-insights ./static/placeholder ./data/files/placeholder
RUN chown -R playnite-insights:playnite-insights /app

EXPOSE 3000

USER playnite-insights

ENTRYPOINT [ "npx", "vite", "dev", "--host" ]

FROM base AS vitest

WORKDIR /app
ENV WORK_DIR=/app
ENV NODE_ENV='testing'
ENV APP_NAME='Playnite Insights (Vitest)'

COPY . .

ENTRYPOINT ["npx", "vitest", "run"]

FROM build AS prod

WORKDIR /app
ENV WORK_DIR=/app
ENV NODE_ENV='production'
ENV BODY_SIZE_LIMIT=128M
ENV APP_NAME='Playnite Insights'

RUN addgroup -S playnite-insights && adduser -S -G playnite-insights playnite-insights
RUN chown -R playnite-insights:playnite-insights /app

EXPOSE 3000

USER playnite-insights

ENTRYPOINT ["node", "build"]

FROM build AS stage

WORKDIR /app
ENV WORK_DIR=/app
ENV NODE_ENV='testing'
ENV BODY_SIZE_LIMIT=128M
ENV APP_NAME='Playnite Insights (Stage)'

RUN addgroup -S playnite-insights && adduser -S -G playnite-insights playnite-insights
COPY --chown=playnite-insights:playnite-insights ./static/placeholder ./data/files/placeholder
RUN chown -R playnite-insights:playnite-insights /app

EXPOSE 3000

USER playnite-insights

ENTRYPOINT ["node", "build"]