import { createRoute, z } from "@hono/zod-openapi";
import { createErrorResponse } from "../../lib/route-factory";
import { createPaginatedSuccessSchema, createSuccessSchema } from "../../lib/schema";
import { adminMiddleware, authMiddleware } from "../../middleware/auth";
import { createMemoSchema, memoPaginationSchema, MemoSchema, updateMemoSchema } from "./schema";

export const getMemoRoute = createRoute({
  method: "get",
  path: "/{id}",
  request: {
    params: z.object({
      id: z.coerce.number().openapi({ example: 1 }),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: createSuccessSchema(MemoSchema),
        },
      },
      description: "Retrieve the memo by ID",
    },
    404: createErrorResponse("Memo not found"),
    500: createErrorResponse("Internal server error"),
  },
});

export const listMemosRoute = createRoute({
  method: "get",
  path: "/",
  request: {
    query: memoPaginationSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: createPaginatedSuccessSchema(MemoSchema),
        },
      },
      description: "Retrieve a list of memos",
    },
    500: createErrorResponse("Internal server error"),
  },
});

export const createMemoRoute = createRoute({
  method: "post",
  path: "/",
  middleware: [authMiddleware, adminMiddleware] as const,
  security: [{ Bearer: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createMemoSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: createSuccessSchema(MemoSchema),
        },
      },
      description: "Memo created successfully",
    },
    400: createErrorResponse("Invalid request data"),
    401: createErrorResponse("Unauthorized"),
    403: createErrorResponse("Forbidden"),
    500: createErrorResponse("Internal Server Error"),
  },
});

export const updateMemoRoute = createRoute({
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
          schema: updateMemoSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: createSuccessSchema(MemoSchema),
        },
      },
      description: "Memo updated successfully",
    },
    400: createErrorResponse("Invalid request data"),
    401: createErrorResponse("Unauthorized"),
    404: createErrorResponse("Memo not found"),
    500: createErrorResponse("Internal Server Error"),
  },
});

export const deleteMemoRoute = createRoute({
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
      description: "Memo deleted successfully",
    },
    401: createErrorResponse("Unauthorized"),
    403: createErrorResponse("Forbidden"),
    404: createErrorResponse("Memo not found"),
    500: createErrorResponse("Internal Server Error"),
  },
});
