import type { Env } from "./types";
import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { count, eq } from "drizzle-orm";
import { cors } from "hono/cors";
import { createDb } from "./db";
import { users } from "./db/schema";
import { getAllowedOrigins, validateEnv } from "./lib/env";
import { defaultHook } from "./lib/route-factory";
import { servicesMiddleware } from "./middleware/services";
import { createAuthRouter } from "./routes/auth/index";
import { createCategoriesRouter } from "./routes/categories/index";
import { createPostsRouter } from "./routes/posts/index";
import { createTagsRouter } from "./routes/tags/index";
import { hashPassword } from "./services/auth";

const app = new OpenAPIHono<{ Bindings: Env }>({
  defaultHook,
});

app.use("*", servicesMiddleware);

app.use("*", async (c, next) => {
  const env = validateEnv(c.env);
  const allowedOrigins = getAllowedOrigins(env as any);

  const corsMiddleware = cors({
    origin: allowedOrigins,
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 600,
  });

  return corsMiddleware(c, next);
});

// 动态挂载路由
app.route("/api/v1/posts", createPostsRouter());
app.route("/api/v1/auth", createAuthRouter());
app.route("/api/v1/categories", createCategoriesRouter());
app.route("/api/v1/tags", createTagsRouter());

app.onError((err, c) => {
  console.error(err);
  return c.json(
    {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Internal Server Error",
      },
    },
    500,
  );
});

app.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
  type: "http",
  scheme: "bearer",
});

app.doc("/api/v1/openapi.json", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "My API",
  },
});

app.get("/docs", Scalar({ url: "/api/v1/openapi.json" }));

app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

export type AppType = typeof app;

export default app;

export { app };
