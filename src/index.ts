import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { logger as honoLogger } from "hono/logger";
import { seedDefaultUser } from "./db";
import { logger } from "./lib/logger";
import authRouter from "./routes/auth/index";
import postsRouter from "./routes/posts/index";

const app = new OpenAPIHono();

app.use(
    "*",
    honoLogger((str) => logger.info(str)),
);

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

app.route("/api/v1/posts", postsRouter);
app.route("/api/v1/auth", authRouter);

export default app;
