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
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret_key
DEFAULT_ADMIN_PASSWORD=your_default_admin_password
```

说明：
- `DATABASE_URL`: PostgreSQL 数据库连接字符串
- `JWT_SECRET`: 用于生成和验证 JWT Token 的密钥
- `DEFAULT_ADMIN_PASSWORD`: 首次启动时自动创建的管理员账号 (admin) 的密码

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
    env_file:
      - .env
    restart: always
```

启动服务：

```bash
docker compose pull
docker compose up -d
```

### 直接使用 Docker Run 运行

如果你不想使用 docker-compose，也可以直接运行以下命令：

```bash
docker run -d \
  --name blog-backend \
  -p 8088:3000 \
  -e DATABASE_URL="your_postgresql_url" \
  -e JWT_SECRET="your_jwt_secret" \
  -e DEFAULT_ADMIN_PASSWORD="your_admin_password" \
  --restart always \
  ghcr.io/shenlye/my-api:latest
```