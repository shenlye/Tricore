// This file provides type definitions for Cloudflare bindings that are
// referenced by imported library code (e.g. @my-api/backend)
// but are not actually needed or present in this frontend worker.

declare global {
  namespace Cloudflare {
    interface Env {
      DB: D1Database;
      ALLOWED_ORIGINS: string;
      JWT_SECRET: string;
    }
  }
}

export {};
