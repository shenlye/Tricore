# My API - Cloudflare Workers Blog System

自用的全栈博客/管理系统，基于 Cloudflare 基础设施。

## 架构

- **后端 (Backend)**: Hono + Drizzle ORM + Cloudflare D1 (Database) + Cloudflare Workers（serverless）
- **前端 (Frontend)**: React + Vite + Shadcn UI + Cloudflare Pages
- **部署**: Cloudflare 全家桶 (Workers + D1 + Pages + R2)
- **测试**: Vitest 
## 快速开始

### 后端 (Cloudflare Workers)

1. **进入目录**: `cd backend`
2. **安装依赖**: `pnpm install`
3. **数据库准备**:
   - **创建 D1**: `pnpm wrangler d1 create my-api-db`
   - **配置**: 将返回的 `database_id` 填入 `wrangler.toml` 。
   - **迁移**: `pnpm run migrate:remote` (线上) 或 `pnpm run migrate:local` (本地)。
4. **日志查看**: 
   - **生产环境**: `pnpm run logs`
   - **开发环境**: `pnpm run logs:dev`
5. **设置密钥 (Secrets)**:
   ```bash
   npx wrangler secret put JWT_SECRET
   ```
6. **部署**: `pnpm run deploy`
6. **初始化管理员**:
   本系统采用“首位注册提权”机制。部署完成后，直接访问 `POST /api/v1/auth/register` 进行注册。若数据库用户为空，首个注册者将自动获得 `admin` 权限。

### 前端 (Dashboard)

1. **进入目录**: `cd frontend`
2. **安装依赖**: `pnpm install`
3. **本地开发**: `pnpm run dev`
4. **部署**: 推荐直接关联 GitHub 仓库部署到 Cloudflare Pages。


## 环境变量 (Secret)
- `JWT_SECRET`: 必须，用于身份验证。
- `ALLOWED_ORIGINS`: 允许的跨域来源。
