FROM node:24.3-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

FROM node:24.3-alpine AS run

# Create user and group
RUN addgroup -S playnite-insights && adduser -S -G playnite-insights playnite-insights

WORKDIR /app
ENV WORK_DIR=/app
ENV NODE_ENV=development
ENV BODY_SIZE_LIMIT=256M
ENV APP_NAME='Playnite Insights (Dev)'

# Copy source files into application directory
COPY --chown=playnite-insights:playnite-insights . .
COPY --chown=playnite-insights:playnite-insights --from=build /app/node_modules ./node_modules

RUN mkdir -p ./data/files ./data/tmp
RUN chown playnite-insights:playnite-insights ./data ./data/files ./data/tmp
RUN echo '[]' > ./data/games.json && chown playnite-insights:playnite-insights ./data/games.json
RUN echo '{}' > ./data/manifest.json && chown playnite-insights:playnite-insights ./data/manifest.json

COPY --chown=playnite-insights:playnite-insights ./static/placeholder ./data/files/placeholder

EXPOSE 3000

USER playnite-insights

ENTRYPOINT ["sh", "docker/dev/entrypoint.sh"]