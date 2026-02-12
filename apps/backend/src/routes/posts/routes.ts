import { createRoute, z } from "@hono/zod-openapi";
import { createErrorResponse } from "../../lib/route-factory";
import { createPaginatedSuccessSchema, createSuccessSchema } from "../../lib/schema";
import { adminMiddleware, authMiddleware } from "../../middleware/auth";
import { createPostSchema, paginationSchema, PostSchema, updatePostSchema } from "./schema";

export const getPostRoute = createRoute({
  method: "get",
  path: "/{idOrSlug}",
  request: {
    params: z.object({
      idOrSlug: z.string().openapi({ example: "hello-world" }),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: createSuccessSchema(PostSchema),
        },
      },
      description: "Retrieve the post by ID or Slug",
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
          schema: createPaginatedSuccessSchema(PostSchema.omit({ content: true })),
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

export const updatePostRoute = createRoute({
  method: "patch",
  path: "/{id}",
  middleware: [authMiddleware, adminMiddleware] as const,
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.coerce.number().openapi({ example: 1 }),
    }),
    body: {
      content: {
        "application/json": {
          schema: updatePostSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: createSuccessSchema(PostSchema),
        },
      },
      description: "Post updated successfully",
    },
    400: createErrorResponse("Invalid request data"),
    401: createErrorResponse("Unauthorized"),
    404: createErrorResponse("Post not found"),
    409: createErrorResponse("Conflict - Slug already exists"),
    500: createErrorResponse("Internal Server Error"),
  },
});

export const deletePostRoute = createRoute({
  method: "delete",
  path: "/{id}",
  middleware: [authMiddleware, adminMiddleware] as const,
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.coerce.number().openapi({ example: 1 }),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: createSuccessSchema(z.object({ id: z.number() })),
        },
      },
      description: "Post deleted successfully",
    },
    401: createErrorResponse("Unauthorized"),
    403: createErrorResponse("Forbidden"),
    404: createErrorResponse("Post not found"),
    500: createErrorResponse("Internal Server Error"),
  },
});

// 数字花园：添加文章链接
export const addPostLinkRoute = createRoute({
  method: "post",
  path: "/{id}/links",
  middleware: [authMiddleware, adminMiddleware] as const,
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.coerce.number().openapi({ example: 1 }),
    }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            targetPostId: z.number().openapi({ example: 2 }),
            context: z.string().optional().openapi({ example: "链接上下文说明" }),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: createSuccessSchema(z.object({
            sourcePostId: z.number(),
            targetPostId: z.number(),
            context: z.string().nullable(),
          })),
        },
      },
      description: "Link created successfully",
    },
    400: createErrorResponse("Bad request - Invalid target post or self-linking"),
    401: createErrorResponse("Unauthorized"),
    403: createErrorResponse("Forbidden"),
    404: createErrorResponse("Source post not found"),
    409: createErrorResponse("Link already exists"),
    500: createErrorResponse("Internal Server Error"),
  },
});

// 数字花园：删除文章链接
export const removePostLinkRoute = createRoute({
  method: "delete",
  path: "/{id}/links/{targetId}",
  middleware: [authMiddleware, adminMiddleware] as const,
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.coerce.number().openapi({ example: 1 }),
      targetId: z.coerce.number().openapi({ example: 2 }),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: createSuccessSchema(z.object({ success: z.boolean() })),
        },
      },
      description: "Link removed successfully",
    },
    401: createErrorResponse("Unauthorized"),
    403: createErrorResponse("Forbidden"),
    404: createErrorResponse("Link not found"),
    500: createErrorResponse("Internal Server Error"),
  },
});

// 数字花园：获取文章的链接关系
export const getPostLinksRoute = createRoute({
  method: "get",
  path: "/{id}/links",
  request: {
    params: z.object({
      id: z.coerce.number().openapi({ example: 1 }),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: createSuccessSchema(z.object({
            outgoing: z.array(z.object({
              id: z.number(),
              title: z.string().nullable(),
              slug: z.string().nullable(),
              context: z.string().nullable(),
            })),
            incoming: z.array(z.object({
              id: z.number(),
              title: z.string().nullable(),
              slug: z.string().nullable(),
              context: z.string().nullable(),
            })),
          })),
        },
      },
      description: "Retrieve post links",
    },
    404: createErrorResponse("Post not found"),
    500: createErrorResponse("Internal Server Error"),
  },
});

// 数字花园：搜索文章（用于链接自动完成）
export const searchPostsRoute = createRoute({
  method: "get",
  path: "/search",
  request: {
    query: z.object({
      q: z.string().min(1).openapi({ example: "原子", description: "搜索关键词" }),
      limit: z.coerce.number().int().min(1).max(20).default(10).openapi({
        example: 10,
        description: "返回数量限制",
      }),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: createSuccessSchema(z.array(z.object({
            id: z.number(),
            title: z.string().nullable(),
            slug: z.string().nullable(),
          }))),
        },
      },
      description: "Search posts by title",
    },
    400: createErrorResponse("Invalid search query"),
    500: createErrorResponse("Internal Server Error"),
  },
});
