import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { seedDefaultUser } from "./db";
import postsRouter from "./routes/posts/index";

const app = new OpenAPIHono();

await seedDefaultUser();

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

export default app;
