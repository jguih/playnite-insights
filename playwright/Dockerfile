FROM mcr.microsoft.com/playwright:v1.54.1-noble AS playwright-base

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
RUN npx playwright install --with-deps

FROM playwright-base AS playwright

WORKDIR /app
COPY . .

ENTRYPOINT ["npx", "playwright", "test"]