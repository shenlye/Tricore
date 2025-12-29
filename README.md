# My Simple Blog Backend

- Bun
- Hono
- Drizzle ORM
- Biome
- SQLite

## Quick Start

1. Install Dependencies

```bash
bun install
```

2. Environment Configuration

Create a `.env` file in the root directory of the project.

```env
DB_FILE_NAME=mydb.sqlite
ADMIN_SECRET_KEY=your_admin_secret_key
```

3. Initialize Database
```bash
bunx drizzle-kit push
```

4. Run the Server

```bash
bun run dev
```

