import { z } from "@hono/zod-openapi";

export const loginSchema = z.object({
    identifier: z.string().min(3).openapi({
        example: "user@example.com",
        description: "Username or email of the user",
    }),
    password: z.string().min(6).openapi({
        example: "password123",
        description: "Password of the user",
        format: "password",
    }),
});
