# Tricore

A self-hosted fullstack blog & content management system built entirely on the Cloudflare ecosystem.

## Architecture

**Monorepo** managed with [pnpm workspaces](https://pnpm.io/workspaces), containing three apps:

| App | Stack | Deployment |
|---|---|---|
| **Backend** | [Hono](https://hono.dev) + [Drizzle ORM](https://orm.drizzle.team) + Cloudflare D1 | Cloudflare Workers |
| **Frontend** | [Next.js](https://nextjs.org) + React 19 + Three.js + GSAP + Tailwind CSS | Cloudflare Workers (via [OpenNext](https://opennext.js.org)) |
| **Admin** | React 19 + [Vite](https://vite.dev) + [shadcn/ui](https://ui.shadcn.com) + TanStack Query + Milkdown | Cloudflare Pages |

### Key Features

- **OpenAPI-first backend** — auto-generated docs with [Scalar](https://scalar.com), type-safe RPC client shared across apps
- **End-to-end type safety** — the `@tricore/backend` package exports `AppType` consumed by the frontend & admin via Hono's RPC client
- **Content model** — Posts (with categories & tags), Memos, Users with role-based access
- **Rich text editing** — Milkdown (Markdown WYSIWYG) in the admin panel
- **3D landing page** — Three.js background with React Three Fiber on the public frontend
- **Code quality** — ESLint ([@antfu/eslint-config](https://github.com/antfu/eslint-config)), Husky + lint-staged, Vitest for backend tests

## Prerequisites

- [Node.js](https://nodejs.org) >= 20
- [pnpm](https://pnpm.io) >= 10
- A [Cloudflare](https://cloudflare.com) account (for D1, Workers, and Pages)

## Getting Started

### 1. Install Dependencies

```bash
git clone https://github.com/shenlye/Tricore.git
cd Tricore
pnpm install
```

### 2. Backend (Cloudflare Workers)

```bash
cd apps/backend
```

**Database setup:**

```bash
# Create a D1 database
pnpm wrangler d1 create tricore-db

# Copy the returned database_id into wrangler.toml

# Run migrations
pnpm run migrate:local       # local development
pnpm run migrate:remote      # production
```

**Secrets:**

```bash
npx wrangler secret put JWT_SECRET
```

**Development:**

```bash
pnpm run dev                  # local dev server
pnpm run dev:remote           # dev against remote D1
```

**Deploy:**

```bash
pnpm run deploy
```

**Admin bootstrap:**
The system uses a "first-register promotion" mechanism. After deployment, send a `POST /api/v1/auth/register` request. If the database has no users, the first registrant is automatically granted the `admin` role.

**API docs** are available at `/docs` (Scalar UI) and `/api/v1/openapi.json`.

**Logs:**

```bash
pnpm run logs                 # production
pnpm run logs:dev             # development
```

### 3. Frontend (Next.js)

```bash
cd apps/frontend
```

**Configuration:**
Update `NEXT_PUBLIC_API_BASE_URL` in `apps/frontend/wrangler.jsonc` to point to your backend API:
```jsonc
"vars": {
  "NEXT_PUBLIC_API_BASE_URL": "https://your-api.workers.dev"
}
```

**Development:**
```bash
pnpm run dev                  # local dev server (http://localhost:3000)
```

**Deploy:**
```bash
pnpm run deploy               # build & deploy to Cloudflare via OpenNext
```

### 4. Admin Dashboard (Vite + React)

```bash
cd apps/admin
```

**Configuration:**
Create a `.env` file in `apps/admin` (based on `.env.example`) to set your API endpoint:
```dotenv
VITE_API_BASE_URL=https://your-api.workers.dev
```

**Development:**
```bash
pnpm run dev                  # local dev server (http://localhost:5173)
```

Deploy to Cloudflare Pages from the repo root:

```bash
pnpm run deploy:admin
```

### Running Everything at Once

From the repo root:

```bash
pnpm run dev                  # starts all apps in parallel
```

## Scripts

| Command | Scope | Description |
|---|---|---|
| `pnpm run dev` | Root | Start all apps in dev mode |
| `pnpm run lint` | Root | Lint all packages |
| `pnpm run test` | Root | Run all tests |
| `pnpm run deploy:backend` | Root | Deploy backend to Workers |
| `pnpm run deploy:frontend` | Root | Deploy frontend to Cloudflare Pages |
| `pnpm run deploy:admin` | Root | Build & deploy admin to Cloudflare Pages |

## Testing

Backend tests use [Vitest](https://vitest.dev) with the Cloudflare Workers pool:

```bash
cd apps/backend
pnpm run test
```

Or from the root:

```bash
pnpm run test
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `JWT_SECRET` | Yes | Secret key for JWT authentication (set via `wrangler secret put`) |
| `ALLOWED_ORIGINS` | No | Comma-separated list of allowed CORS origins (configured in `wrangler.toml`) |
| `VITE_API_BASE_URL` | Yes (Admin) | API endpoint for the Admin dashboard (set in `apps/admin/.env`) |
| `NEXT_PUBLIC_API_BASE_URL` | Yes (Frontend) | API endpoint for the Next.js site (set in `apps/frontend/wrangler.jsonc`) |

## License

MIT
