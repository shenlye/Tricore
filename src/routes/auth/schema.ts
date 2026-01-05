import { z } from "@hono/zod-openapi";

export const loginSchema = z.object({
    identifier: z.string().min(3).openapi({
        example: "admin@example.com",
        description: "Username or email of the user",
    }),
    password: z.string().min(6).openapi({
        example: "admin123",
        description: "Password of the user",
        format: "password",
    }),
});

export const changePasswordSchema = z.object({
    oldPassword: z.string().min(6).openapi({
        example: "oldPassword123",
        description: "The current password of the user",
        format: "password",
    }),
    newPassword: z.string().min(6).openapi({
        example: "newPassword456",
        description: "The new password to set for the user",
        format: "password",
    }),
});
