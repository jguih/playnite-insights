FROM node:alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./

RUN npm install

# Copy source files into application directory
COPY . .
RUN npm run build

FROM node:alpine AS run

# Install dependencies
RUN apk add --no-cache su-exec

ENV NODE_ENV=production
ENV BODY_SIZE_LIMIT=5G
ENV WORK_DIR=/app
WORKDIR /app

WORKDIR /app
COPY --from=build /app/build ./build
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/docker/init.sh ./docker/init.sh 

EXPOSE 3000

ENTRYPOINT ["sh", "docker/init.sh", "node", "build"]
