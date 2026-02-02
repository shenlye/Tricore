# My API - Cloudflare Workers Blog System

自用的全栈博客/管理系统，基于 Cloudflare 基础设施。

## 架构

- **后端 (Backend)**: Hono + Drizzle ORM + Cloudflare D1 (Database) + Cloudflare Workers（serverless）
- **前端 (Frontend)**: React + Vite + Shadcn UI + Cloudflare Pages
- **部署**: Cloudflare 全家桶 (Workers + D1 + Pages)

## 快速开始

### 后端 (Cloudflare Workers)

1. **进入目录**: `cd backend`
2. **安装依赖**: `pnpm install`
3. **初始化数据库**:
   ```bash
   pnpm wrangler d1 create my-api-db
   # 将返回的 database_id 填入 wrangler.toml
   ```
4. **设置密钥**:
5. **部署**: `pnpm run deploy`

6. **初始化管理员**:
   本系统采用“首位注册提权”机制。部署完成后，直接访问前端或调用接口进行注册：
   - **接口**: `POST /auth/register`
   - **逻辑**: 系统检测到数据库为空时，首个注册的用户将自动获得 `admin` 权限。之后该接口将失效。

### 前端 (Dashboard)
...
   ```bash
   npx wrangler secret put JWT_SECRET
   ```
5. **部署**: `pnpm run deploy`

### 前端 (Dashboard)

1. **进入目录**: `cd frontend`
2. **安装依赖**: `pnpm install`
3. **开发**: `pnpm run dev`
4. **部署**: 推荐直接关联 GitHub 仓库部署到 Cloudflare Pages。

## 环境变量 (Secret)
- `JWT_SECRET`: 必须，用于身份验证。
- `ALLOWED_ORIGINS`: 允许的跨域来源。
