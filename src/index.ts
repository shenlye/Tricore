import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { seedDefaultUser } from "./db";
import authRouter from "./routes/auth/index";
import postsRouter from "./routes/posts/index";

const app = new OpenAPIHono();

await seedDefaultUser();

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
    console.error("ERROR: JWT_SECRET is missing in environment variables.");
    process.exit(1);
}

app.get("/", (c) => {
    return c.text("Hello Hono!");
});

app.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
    type: "http",
    scheme: "bearer",
});

app.doc("/doc", {
    openapi: "3.0.0",
    info: {
        version: "1.0.0",
        title: "My API",
    },
});

app.get("/scalar", Scalar({ url: "/doc" }));

app.route("/posts", postsRouter);
app.route("/auth", authRouter);

export default app;
