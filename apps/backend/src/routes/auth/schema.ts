import { z } from "@hono/zod-openapi";

const strongPassword = z
  .string()
  .min(8, "密码长度至少为 8 位")
  .max(72, "密码长度不能超过 72 位")
  .regex(/[a-z]/, "必须包含至少一个小写字母")
  .regex(/\d/, "必须包含至少一个数字");

export const loginSchema = z.object({
  identifier: z.string().min(3, "用户名至少需要 3 个字符").openapi({
    example: "admin@example.com",
    description: "Username or email of the user",
  }),
  password: z.string().min(6, "密码长度至少为 6 位").openapi({
    example: "admin123",
    description: "Password of the user",
    format: "password",
  }),
});

export const registerSchema = z.object({
  username: z.string().min(3, "用户名至少需要 3 个字符").openapi({
    example: "admin",
    description: "Username for the new user",
  }),
  email: z.string().email("无效的邮箱地址").openapi({
    example: "admin@example.com",
    description: "Email for the new user",
  }),
  password: strongPassword.openapi({
    example: "admin123",
    description: "Password for the new user",
    format: "password",
  }),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(6, "密码长度至少为 6 位").openapi({
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
