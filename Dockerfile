FROM node:24.3-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./

RUN npm install

# Copy source files into application directory
COPY . .
RUN npm run build

FROM node:24.3-alpine AS run

# Create user and group
RUN addgroup -S playnite-insights && adduser -S -G playnite-insights playnite-insights

WORKDIR /app
ENV WORK_DIR=/app
ENV NODE_ENV=production
ENV BODY_SIZE_LIMIT=5G
ENV APP_NAME='Playnite Insights'

WORKDIR /app
COPY --chown=playnite-insights:playnite-insights --from=build /app/build ./build
COPY --chown=playnite-insights:playnite-insights --from=build /app/package.json ./package.json
COPY --chown=playnite-insights:playnite-insights --from=build /app/node_modules ./node_modules
COPY --chown=playnite-insights:playnite-insights --from=build /app/docker/common ./docker/common
COPY --chown=playnite-insights:playnite-insights --from=build /app/docker/prod ./docker/prod

RUN mkdir -p ./data/files ./data/tmp
RUN chown playnite-insights:playnite-insights ./data ./data/files ./data/tmp
RUN echo '[]' > ./data/games.json && chown playnite-insights:playnite-insights ./data/games.json
RUN echo '{}' > ./data/manifest.json && chown playnite-insights:playnite-insights ./data/manifest.json

EXPOSE 3000

USER playnite-insights

ENTRYPOINT ["sh", "docker/prod/entrypoint.sh"]
