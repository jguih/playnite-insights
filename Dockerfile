FROM node:24.3-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS deps
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
# Run unit tests
RUN pnpm --filter core test

FROM deps AS build
RUN pnpm run -r build
RUN pnpm deploy --filter=playnite-insights /prod/playnite-insights
RUN pnpm deploy --filter=@playnite-insights/infra /prod/infra

FROM base AS dev
WORKDIR /app
ENV WORK_DIR=/app
ENV NODE_ENV='development'
ENV BODY_SIZE_LIMIT=128M
ENV APP_NAME='Playnite Insights (Dev)'

RUN addgroup -S playnite-insights && adduser -S -G playnite-insights playnite-insights
RUN mkdir -p ./data/files ./data/tmp
RUN chown -R playnite-insights:playnite-insights ./data
COPY --from=deps --chown=playnite-insights:playnite-insights /usr/src/app ./
COPY --from=deps --chown=playnite-insights:playnite-insights /usr/src/app/playnite-insights/static/placeholder ./data/files/placeholder
COPY --from=deps --chown=playnite-insights:playnite-insights /usr/src/app/packages/@playnite-insights/infra/migrations ./infra/migrations

EXPOSE 3000

USER playnite-insights

ENTRYPOINT [ "pnpm", "--filter", "playnite-insights", "dev" ]

FROM base AS vitest
WORKDIR /app
ENV NODE_ENV='testing'
COPY --from=deps /usr/src/app ./
ENTRYPOINT [ "pnpm", "--filter", "playnite-insights", "test:unit" ]

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

FROM mcr.microsoft.com/playwright:v1.54.1-noble AS playwright-base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable pnpm

FROM playwright-base AS playwright-deps
COPY ./packages /usr/src/app/packages
COPY ./playwright /usr/src/app/playwright
COPY ./pnpm-workspace.yaml /usr/src/app
COPY ./package.json /usr/src/app
COPY ./tsconfig.json /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install

FROM playwright-deps AS playwright
WORKDIR /usr/src/app
ENTRYPOINT ["pnpm", "--filter", "playwright", "exec", "playwright", "test"]
