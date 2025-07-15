FROM node:24.3-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run -r build
RUN pnpm deploy --filter=playnite-insights /prod/playnite-insights
RUN pnpm deploy --filter=@playnite-insights/infrastructure /prod/infra

FROM base AS dev-deploy
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm deploy --filter=playnite-insights /prod/playnite-insights

FROM base AS dev
WORKDIR /app
ENV WORK_DIR=/app
ENV NODE_ENV='development'
ENV BODY_SIZE_LIMIT=128M
ENV APP_NAME='Playnite Insights (Dev)'

RUN addgroup -S playnite-insights && adduser -S -G playnite-insights playnite-insights
RUN mkdir -p ./data/files ./data/tmp
RUN chown -R playnite-insights:playnite-insights ./data
COPY --from=dev-deploy --chown=playnite-insights:playnite-insights /prod/playnite-insights .
COPY --from=dev-deploy --chown=playnite-insights:playnite-insights /prod/playnite-insights/static/placeholder ./data/files/placeholder
COPY --from=build --chown=playnite-insights:playnite-insights /prod/infra/migrations ./infra/migrations

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

FROM base AS prod
WORKDIR /app
ENV WORK_DIR=/app
ENV NODE_ENV='production'
ENV BODY_SIZE_LIMIT=128M
ENV APP_NAME='Playnite Insights'

RUN addgroup -S playnite-insights && adduser -S -G playnite-insights playnite-insights
RUN mkdir -p ./data/files ./data/tmp
RUN chown -R playnite-insights:playnite-insights ./data
COPY --from=build --chown=playnite-insights:playnite-insights /prod/playnite-insights/node_modules ./node_modules
COPY --from=build --chown=playnite-insights:playnite-insights /prod/playnite-insights/build ./build
COPY --from=build --chown=playnite-insights:playnite-insights /prod/playnite-insights/package.json ./package.json
COPY --from=build --chown=playnite-insights:playnite-insights /prod/infra/migrations ./infra/migrations

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
RUN mkdir -p ./data/files ./data/tmp
RUN chown -R playnite-insights:playnite-insights ./data
COPY --from=build --chown=playnite-insights:playnite-insights /prod/playnite-insights/node_modules ./node_modules
COPY --from=build --chown=playnite-insights:playnite-insights /prod/playnite-insights/build ./build
COPY --from=build --chown=playnite-insights:playnite-insights /prod/playnite-insights/package.json ./package.json
COPY --from=build --chown=playnite-insights:playnite-insights /prod/playnite-insights/static/placeholder ./data/files/placeholder
COPY --from=build --chown=playnite-insights:playnite-insights /prod/infra/migrations ./infra/migrations

EXPOSE 3000

USER playnite-insights

ENTRYPOINT ["node", "build"]