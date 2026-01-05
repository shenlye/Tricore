import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";

import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger as honoLogger } from "hono/logger";
import { seedDefaultUser } from "./db";
import { env } from "./lib/env";
import { logger } from "./lib/logger";
import authRouter from "./routes/auth/index";
import postsRouter from "./routes/posts/index";

const app = new OpenAPIHono({
    // 当 JSON 格式正确，但不符合 Zod schema 时触发
    defaultHook: (result, c) => {
        if (!result.success) {
            return c.json(
                {
                    success: false,
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Validation Error",
                        details: result.error.issues,
                    },
                },
                400,
            );
        }
    },
});

app.use(
    "*",
    honoLogger((str) => logger.info(str)),
);

app.use(
    "*",
    cors({
        origin: [
            "https://blog.shenley.cn",
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ],

        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],

        allowHeaders: ["Content-Type", "Authorization"],

        credentials: true,

        maxAge: 600,
    }),
);

const routes = app
    .route("/api/v1/posts", postsRouter)
    .route("/api/v1/auth", authRouter);

app.onError((err, c) => {
    // JSON 多打了一个逗号，导致 JSON.parse 失败，抛出一个 Malformed JSON 错误
    // 既然解析都失败了，Hono 不知道这个请求有没有内容，所以无法交给 Zod 去验证，所以没触发 defaultHook
    // 如果是 JSON 格式这类 HTTP 异常，保留原始状态码和错误信息
    if (err instanceof HTTPException) {
        return c.json(
            {
                success: false,
                error: {
                    code: err.status.toString(),
                    message: err.message,
                },
            },
            err.status,
        );
    }

    // 真正的代码报错才走 500
    logger.error(err);
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

// 初始化默认管理员用户
await seedDefaultUser();

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

const port = env.PORT;
logger.info(`Server starting on port ${port}...`);

export type AppType = typeof routes;

export default {
    port,
    fetch: app.fetch,
};

export { app };
