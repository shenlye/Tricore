# My Simple Blog Admin

English version: [README_EN.md](README_EN.md)

基于 Bun + Hono 的博客后台。

## 技术栈

- Bun - JavaScript 运行时
- Hono - Web 框架
- Drizzle ORM - 数据库 ORM
- Biome - 代码格式化和检查
- SQLite - 数据库 (使用 Bun 内置驱动)
- Pino - 日志

## 本地开发

### 1. 安装依赖

```bash
bun install
```

### 2. 初始化数据库

```bash
bunx drizzle-kit push
```

这会根据 schema 创建数据库表结构。

### 3. 启动开发服务器

```bash
bun run dev
```

服务默认运行在 http://localhost:3000

## Docker 部署

### Docker Run 运行

```bash
docker run -d \
  --name blog-admin \
  -p 8088:3000 \
  -v /opt/blog-backend/data:/app/data \
  --restart always \
  ghcr.io/shenlye/my-api:latest
```

### Docker Compose 运行

```bash
docker-compose up -d
```

`docker-compose.yml` 配置示例：

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

### 环境变量

```env
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret_key
DEFAULT_ADMIN_PASSWORD=your_default_admin_password
ALLOWED_ORIGINS=http://localhost:5173
PORT=3000
```

说明：
- `DATABASE_URL`: SQLite 数据库文件路径，默认为/app/data/sqlite.db
- `JWT_SECRET`: 用于生成和验证 JWT Token 的密钥。在生产环境下，如果不配置此项，系统将自动生成一个随机密钥并持久化保存。
- `DEFAULT_ADMIN_PASSWORD`: 首次启动时自动创建的管理员账号 (admin) 的密码，默认为admin123456
- `ALLOWED_ORIGINS`: 前端域名