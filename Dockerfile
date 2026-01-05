FROM oven/bun:1.3.3-alpine
WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile && \
    rm -rf ~/.bun/install/cache

COPY . .

RUN mkdir -p /app/data
EXPOSE 3000

ENTRYPOINT ["sh", "-c", "bunx drizzle-kit push && bun index.ts"]
