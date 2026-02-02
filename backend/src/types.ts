export interface Env {
  // D1 Database
  DB: D1Database;

  // Environment variables
  JWT_SECRET: string;
  DEFAULT_ADMIN_PASSWORD: string;
  ALLOWED_ORIGINS: string;
}

declare module "hono" {
  interface ContextVariableMap {
    jwtPayload: {
      sub: number;
      role: "admin" | "user";
      exp: number;
    };
  }
}
