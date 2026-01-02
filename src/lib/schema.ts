import { z } from "@hono/zod-openapi";

export const ErrorSchema = z.object({
    success: z.boolean().openapi({ example: false }),
    error: z.object({
        code: z.string().openapi({ example: "VALIDATION_ERROR" }),
        message: z.string().openapi({ example: "Invalid request parameters" }),
        details: z.array(z.any()).optional(),
    }),
});

export type ErrorType = z.infer<typeof ErrorSchema>;
