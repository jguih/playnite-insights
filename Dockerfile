FROM node:alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./

RUN npm install

# Copy source files into application directory
COPY . .
RUN npm run build

FROM node:alpine AS run

# Create user and group
RUN addgroup -S playnite-insights && adduser -S -G playnite-insights playnite-insights

ENV NODE_ENV=production
ENV BODY_SIZE_LIMIT=5G
ENV WORK_DIR=/app
WORKDIR /app

WORKDIR /app
COPY --chown=playnite-insights:playnite-insights --from=build /app/build ./build
COPY --chown=playnite-insights:playnite-insights --from=build /app/package.json ./package.json
COPY --chown=playnite-insights:playnite-insights --from=build /app/node_modules ./node_modules

RUN mkdir -p ./data/files ./data/tmp ./data/logs
RUN chown playnite-insights:playnite-insights ./data ./data/files ./data/tmp ./data/logs

EXPOSE 3000

USER playnite-insights

ENTRYPOINT ["node", "build"]
