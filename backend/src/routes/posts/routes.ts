import { createRoute, z } from "@hono/zod-openapi";
import { createErrorResponse } from "../../lib/route-factory";
import {
    createPaginatedSuccessSchema,
    createSuccessSchema,
} from "../../lib/schema";
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
                    schema: createSuccessSchema(PostSchema),
                },
            },
            description: "Retrieve the post",
        },
        404: createErrorResponse("Post not found"),
        500: createErrorResponse("Internal server error"),
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
                    schema: createPaginatedSuccessSchema(
                        PostSchema.omit({ content: true }),
                    ),
                },
            },
            description: "Retrieve a list of posts",
        },
        500: createErrorResponse("Internal server error"),
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
                    schema: createSuccessSchema(PostSchema),
                },
            },
            description: "Post created successfully",
        },
        400: createErrorResponse("Invalid request data"),
        401: createErrorResponse("Unauthorized"),
        403: createErrorResponse("Forbidden"),
        409: createErrorResponse("Conflict - Slug already exists"),
        500: createErrorResponse("Internal Server Error"),
    },
});
