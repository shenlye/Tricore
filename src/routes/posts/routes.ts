import { createRoute, z } from "@hono/zod-openapi";
import { adminMiddleware, authMiddleware } from "../../middleware/auth";
import { createPostSchema, PostSchema, paginationSchema } from "./schema";

export const getPostRoute = createRoute({
    method: "get",
    path: "/{slug}",
    request: {
        params: z.object({
            slug: z.string().openapi({ example: "hello-world" }),
        }),
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: z.object({
                        data: PostSchema,
                    }),
                },
            },
            description: "Retrieve the post",
        },
        404: {
            content: {
                "application/json": {
                    schema: z.object({
                        error: z.string(),
                    }),
                },
            },
            description: "Post not found",
        },
    },
});

export const listPostsRoute = createRoute({
    method: "get",
    path: "/",
    request: {
        query: paginationSchema,
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: z.object({
                        data: z.array(PostSchema.omit({ content: true })),
                        meta: z.object({
                            total: z.number(),
                            page: z.number(),
                            limit: z.number(),
                        }),
                    }),
                },
            },
            description: "Retrieve a list of posts",
        },
    },
});

export const createPostRoute = createRoute({
    method: "post",
    path: "/",
    middleware: [authMiddleware, adminMiddleware] as const,
    security: [{ Bearer: [] }],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: createPostSchema,
                },
            },
        },
    },
    responses: {
        201: {
            content: {
                "application/json": {
                    schema: z.object({
                        message: z.string(),
                        data: PostSchema,
                    }),
                },
            },
            description: "Post created successfully",
        },
        400: {
            content: {
                "application/json": {
                    schema: z.object({
                        error: z.string(),
                        details: z.array(z.any()).optional(),
                    }),
                },
            },
            description: "Invalid data",
        },
        401: {
            content: {
                "application/json": {
                    schema: z.object({
                        error: z.string(),
                    }),
                },
            },
            description: "Unauthorized",
        },
        409: {
            content: {
                "application/json": {
                    schema: z.object({
                        error: z.string(),
                        message: z.string(),
                        detail: z.string(),
                    }),
                },
            },
            description: "Conflict - Slug already exists",
        },
        500: {
            content: {
                "application/json": {
                    schema: z.object({
                        message: z.string(),
                        error: z.string(),
                    }),
                },
            },
            description: "Internal Server Error",
        },
    },
});
