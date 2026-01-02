import { createRoute, z } from "@hono/zod-openapi";
import { changePasswordSchema, loginSchema } from "./schema";

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
        429: {
            content: {
                "application/json": {
                    schema: z.object({
                        message: z.string(),
                    }),
                },
            },
            description: "Too many login attempts, please try again later",
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

export const changePasswordRoute = createRoute({
    method: "post",
    path: "/change-password",
    security: [{ Bearer: [] }],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: changePasswordSchema,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: z.object({
                        message: z.string(),
                    }),
                },
            },
            description: "Password changed successfully",
        },
        400: {
            content: {
                "application/json": {
                    schema: z.object({
                        message: z.string(),
                    }),
                },
            },
            description: "Invalid request data",
        },
        401: {
            content: {
                "application/json": {
                    schema: z.object({
                        message: z.string(),
                    }),
                },
            },
            description: "Unauthorized",
        },
        404: {
            content: {
                "application/json": {
                    schema: z.object({
                        message: z.string(),
                    }),
                },
            },
            description: "User not found",
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
