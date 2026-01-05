import { z } from "@hono/zod-openapi";

const strongPassword = z
    .string()
    .min(8, "密码长度至少为 8 位")
    .max(100)
    .regex(/[A-Z]/, "必须包含至少一个大写字母")
    .regex(/[a-z]/, "必须包含至少一个小写字母")
    .regex(/[0-9]/, "必须包含至少一个数字")
    .regex(/[^A-Za-z0-9]/, "必须包含至少一个特殊字符");

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
    oldPassword: z.string().openapi({
        example: "oldPassword123",
        description: "The current password of the user",
        format: "password",
    }),
    newPassword: strongPassword.openapi({
        example: "newPassword456",
        description: "The new password to set for the user",
        format: "password",
    }),
});
