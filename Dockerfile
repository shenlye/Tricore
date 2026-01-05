FROM oven/bun:latest AS base
WORKDIR /app

FROM base AS install
COPY package.json bun.lock ./
RUN bun install

FROM base AS release
COPY --from=install /app/node_modules ./node_modules
COPY . .

RUN mkdir -p /app/data

EXPOSE 3000

ENTRYPOINT ["sh", "-c", "bunx drizzle-kit push && bun run src/index.ts"]
