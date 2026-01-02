import { createRoute, z } from "@hono/zod-openapi";
import { createErrorResponse } from "../../lib/route-factory";
import { changePasswordSchema, loginSchema } from "./schema";

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
                    schema: z.object({
                        success: z.boolean().default(true),
                        token: z.string().openapi({ example: "eyJhbGci..." }),
                    }),
                },
            },
            description: "User logged in successfully",
        },
        401: createErrorResponse("Invalid username/email or password"),
        429: createErrorResponse("Too many requests, please try again later"),
        500: createErrorResponse("Internal server error"),
    },
});

export const changePasswordRoute = createRoute({
    method: "post",
    path: "/change-password",
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
                    schema: z.object({
                        success: z.boolean().default(true),
                        message: z.string(),
                    }),
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
