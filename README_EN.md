# My Simple Blog Admin

基于 Bun + Hono 的博客后台。

## Tech Stack

- Bun - JavaScript runtime
- Hono - Web framework
- Drizzle ORM - Database ORM
- Biome - Code formatter and linter
- SQLite - Database (using Bun's built-in driver)
- Pino - Logging

## Local Development

### 1. Install Dependencies

```bash
bun install
```

### 2. Initialize Database

```bash
bunx drizzle-kit push
```

This will create database tables based on the schema.

### 3. Start Development Server

```bash
bun run dev
```

Server runs at http://localhost:3000 by default.

## Docker Deployment

### Docker Run

```bash
docker run -d \
  --name blog-admin \
  -p 8088:3000 \
  -v /opt/blog-backend/data:/app/data \
  --restart always \
  ghcr.io/shenlye/my-api:latest
```

### Docker Compose

```bash
docker-compose up -d
```

Example `docker-compose.yml`:

```yaml
services:
  blog-admin:
    image: ghcr.io/shenlye/my-api:latest
    container_name: blog-admin
    ports:
      - "8088:3000"
    volumes:
      - ./data:/app/data
    environment:
      DATABASE_URL: /app/data/sqlite.db
      JWT_SECRET: your_jwt_secret_key
      DEFAULT_ADMIN_PASSWORD: admin123456
      ALLOWED_ORIGINS: http://localhost:5173
      PORT: 3000
    restart: always
```

### Environment Variables

```env
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret_key
DEFAULT_ADMIN_PASSWORD=your_default_admin_password
ALLOWED_ORIGINS=http://localhost:5173
PORT=3000
```

Description:
- `DATABASE_URL`: SQLite database file path, default is `/app/data/sqlite.db`
- `JWT_SECRET`: Secret key for generating and verifying JWT Tokens. In production, if not configured, a random key will be generated and persisted.
- `DEFAULT_ADMIN_PASSWORD`: Password for the default admin account (admin) created on first run, default is `admin123456`
- `ALLOWED_ORIGINS`: Frontend domains

