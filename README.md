# My Simple Blog Backend

English version: [README_EN.md](README_EN.md)

基于 Bun + Hono 的博客后端 API。

## 技术栈

- Bun - JavaScript 运行时
- Hono - Web 框架
- Drizzle ORM - 数据库 ORM
- Biome - 代码格式化和检查
- PostgreSQL- 数据库

## 本地开发

### 1. 安装依赖

```bash
bun install
```

### 2. 配置环境变量

在项目根目录创建 `.env` 文件：

```env
ADMIN_SECRET_KEY=your_admin_secret_key
DATABASE_URL=your_database_url
```

说明：
- `DATABASE_URL`: 数据库连接
- `ADMIN_SECRET_KEY`: 密钥，用于身份验证

### 3. 初始化数据库

```bash
bunx drizzle-kit push
```

这会根据 schema 创建数据库表结构。

### 4. 启动开发服务器

```bash
bun run dev
```

服务默认运行在 http://localhost:3000

## Docker 部署

创建 `docker-compose.yml` 文件：

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

启动服务：

```bash
docker compose pull
docker compose up -d
```