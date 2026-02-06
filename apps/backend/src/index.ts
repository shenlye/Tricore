import type { Env } from "./types";
import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { cors } from "hono/cors";
import { getAllowedOrigins, validateEnv } from "./lib/env";
import { defaultHook } from "./lib/route-factory";
import { servicesMiddleware } from "./middleware/services";
import { createAuthRouter } from "./routes/auth/index";
import { createCategoriesRouter } from "./routes/categories/index";
import { createMemosRouter } from "./routes/memos/index";
import { createPostsRouter } from "./routes/posts/index";
import { createTagsRouter } from "./routes/tags/index";

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

const routes = app
  .route("/api/v1/posts", createPostsRouter())
  .route("/api/v1/memos", createMemosRouter())
  .route("/api/v1/auth", createAuthRouter())
  .route("/api/v1/categories", createCategoriesRouter())
  .route("/api/v1/tags", createTagsRouter());

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

const _finalApp = routes.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

export type AppType = typeof _finalApp;

export default app;

export { app };
