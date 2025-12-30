# My Simple Blog Backend

A blog backend API based on Bun + Hono.

## Tech Stack

- Bun - JavaScript runtime
- Hono - Web framework
- Drizzle ORM - Database ORM
- Biome - Code formatter and linter
- PostgreSQL - Database

## Local Development

### 1. Install Dependencies

```bash
bun install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```env
ADMIN_SECRET_KEY=your_admin_secret_key
DATABASE_URL=your_database_url
```

### 3. Initialize Database

```bash
bunx drizzle-kit push
```

This will create database tables based on the schema.

### 4. Start Development Server

```bash
bun run dev
```

Server runs at http://localhost:3000 by default.

## Docker Deployment

Create a `docker-compose.yml` file:

```yaml
services:
  blog-api:
    image: ghcr.io/shenlye/my-api:latest
    container_name: blog-backend
    ports:
      - "8088:3000"
    volumes:
      - ./mydb.sqlite:/app/mydb.sqlite
    env_file:
      - .env
    restart: always
```

Start the service:

```bash
docker compose pull
docker compose up -d
```
