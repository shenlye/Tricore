import { createRoute, z } from "@hono/zod-openapi";
import { createErrorResponse } from "../../lib/route-factory";
import { createSuccessSchema } from "../../lib/schema";
import { authMiddleware } from "../../middleware/auth";

export const meRoute = createRoute({
  method: "get",
  path: "/me",
  middleware: [authMiddleware] as const,
  security: [{ Bearer: [] }],
  responses: {
    200: {
      content: {
        "application/json": {
          schema: createSuccessSchema(
            z.object({
              id: z.number(),
              username: z.string(),
              email: z.string(),
              role: z.string(),
            }),
          ),
        },
      },
      description: "Retrieve current user information",
    },
    404: createErrorResponse("User not found"),
    401: createErrorResponse("Unauthorized"),
    500: createErrorResponse("Internal server error"),
  },
});
