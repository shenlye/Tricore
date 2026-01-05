# My Simple Blog Backend

A blog backend API based on Bun + Hono.

## Tech Stack

- Bun - JavaScript runtime
- Hono - Web framework
- Drizzle ORM - Database ORM
- Biome - Code formatter and linter
- SQLite - Database (using Bun's built-in driver)

## Local Development

### 1. Install Dependencies

```bash
bun install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret_key
DEFAULT_ADMIN_PASSWORD=your_default_admin_password
```

Description:
- `DATABASE_URL`: SQLite database file path (e.g., `sqlite.db`)
- `JWT_SECRET`: Secret key for generating and verifying JWT tokens
- `DEFAULT_ADMIN_PASSWORD`: Password for the default admin account created on first run

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
      - /opt/blog/data:/app/data
    env_file:
      - .env
    restart: always
```

Start the service:

```bash
docker compose pull
docker compose up -d
```

### Run with Docker Run

If you don't want to use docker-compose, you can run the following command directly:

```bash
docker run -d \
  --name blog-backend \
  -p 8088:3000 \
  -v /opt/blog/data:/app/data \
  -e DATABASE_URL="/app/data/sqlite.db" \
  -e JWT_SECRET="your_jwt_secret_key" \
  -e DEFAULT_ADMIN_PASSWORD="your_admin_password" \
  --restart always \
  ghcr.io/shenlye/my-api:latest
```
