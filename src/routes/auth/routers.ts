import { createRoute, z } from "@hono/zod-openapi";
import { loginSchema } from "./schema";

export const loginRoute = createRoute({
    method: "post",
    path: "/login",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: loginSchema,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: z.object({
                        token: z.string().openapi({
                            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                        }),
                    }),
                },
            },
            description: "User logged in successfully",
        },
        401: {
            content: {
                "application/json": {
                    schema: z.object({
                        message: z.string(),
                    }),
                },
            },
            description: "Invalid username/email or password",
        },
        500: {
            content: {
                "application/json": {
                    schema: z.object({
                        message: z.string(),
                    }),
                },
            },
            description: "Internal server error",
        },
    },
});
