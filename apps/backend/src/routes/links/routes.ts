import { createRoute, z } from "@hono/zod-openapi";
import { createErrorResponse } from "../../lib/route-factory";
import { createPaginatedSuccessSchema, createSuccessSchema } from "../../lib/schema";
import { adminMiddleware, authMiddleware } from "../../middleware/auth";
import { createLinkSchema, LinkSchema, paginationSchema, updateLinkSchema } from "./schema";

export const getLinkRoute = createRoute({
  method: "get",
  path: "/{id}",
  request: {
    params: z.object({
      id: z.coerce.number().int().positive().openapi({ example: 1 }),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: createSuccessSchema(LinkSchema),
        },
      },
      description: "Retrieve the link by ID",
    },
    404: createErrorResponse("Link not found"),
    500: createErrorResponse("Internal server error"),
  },
  tags: ["Links"],
});

export const listLinksRoute = createRoute({
  method: "get",
  path: "/",
  request: {
    query: paginationSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: createPaginatedSuccessSchema(LinkSchema),
        },
      },
      description: "Retrieve a list of links",
    },
    500: createErrorResponse("Internal server error"),
  },
  tags: ["Links"],
});

export const createLinkRoute = createRoute({
  method: "post",
  path: "/",
  middleware: [authMiddleware, adminMiddleware] as const,
  security: [{ Bearer: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createLinkSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: createSuccessSchema(LinkSchema),
        },
      },
      description: "Link created successfully",
    },
    400: createErrorResponse("Invalid request data"),
    401: createErrorResponse("Unauthorized"),
    500: createErrorResponse("Internal server error"),
  },
  tags: ["Links"],
});

export const updateLinkRoute = createRoute({
  method: "put",
  path: "/{id}",
  middleware: [authMiddleware, adminMiddleware] as const,
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.coerce.number().int().positive().openapi({ example: 1 }),
    }),
    body: {
      content: {
        "application/json": {
          schema: updateLinkSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: createSuccessSchema(LinkSchema),
        },
      },
      description: "Link updated successfully",
    },
    400: createErrorResponse("Invalid request data"),
    401: createErrorResponse("Unauthorized"),
    404: createErrorResponse("Link not found"),
    500: createErrorResponse("Internal server error"),
  },
  tags: ["Links"],
});

export const deleteLinkRoute = createRoute({
  method: "delete",
  path: "/{id}",
  middleware: [authMiddleware, adminMiddleware] as const,
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.coerce.number().int().positive().openapi({ example: 1 }),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: createSuccessSchema(
            z.object({
              message: z.string(),
            }),
          ),
        },
      },
      description: "Link deleted successfully",
    },
    401: createErrorResponse("Unauthorized"),
    404: createErrorResponse("Link not found"),
    500: createErrorResponse("Internal server error"),
  },
  tags: ["Links"],
});
