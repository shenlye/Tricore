import { createRoute, z } from "@hono/zod-openapi";
import { createErrorResponse } from "../../lib/route-factory";
import { createSuccessSchema } from "../../lib/schema";
import { authMiddleware } from "../../middleware/auth";
import { changePasswordSchema, loginSchema, registerSchema } from "./schema";

export const loginRoute = createRoute({
  method: "post",
  path: "/login",
  request: {
    body: {
      content: {
        "application/json": { schema: loginSchema },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: createSuccessSchema(
            z.object({
              token: z.string().openapi({ example: "eyJhbGci..." }),
            }),
          ),
        },
      },
      description: "User logged in successfully",
    },
    401: createErrorResponse("Invalid username/email or password"),
    429: createErrorResponse("Too many requests, please try again later"),
    500: createErrorResponse("Internal server error"),
  },
});

export const registerRoute = createRoute({
  method: "post",
  path: "/register",
  request: {
    body: {
      content: {
        "application/json": { schema: registerSchema },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: createSuccessSchema(
            z.object({
              message: z.string().openapi({ example: "User registered successfully" }),
            }),
          ),
        },
      },
      description: "User registered successfully",
    },
    403: createErrorResponse("Registration is only allowed for the first user"),
    400: createErrorResponse("Invalid request"),
    500: createErrorResponse("Internal server error"),
  },
});

export const changePasswordRoute = createRoute({
  method: "post",
  path: "/change-password",
  middleware: [authMiddleware] as const,
  security: [{ Bearer: [] }],
  request: {
    body: {
      content: {
        "application/json": { schema: changePasswordSchema },
      },
    },
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
      description: "Password changed successfully",
    },
    400: createErrorResponse("Invalid request data"),
    401: createErrorResponse("Unauthorized"),
    404: createErrorResponse("User not found"),
    500: createErrorResponse("Internal server error"),
  },
});
