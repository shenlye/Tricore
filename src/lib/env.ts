import { z } from "zod";

const envSchema = z.object({
    DATABASE_URL: z.url(),
    JWT_SECRET: z.string().min(16, "JWT_SECRET 必须至少 16 位以保证安全"),
    DEFAULT_ADMIN_PASSWORD: z.string().min(8),
    NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("development"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error("❌ 环境变量配置错误:", z.treeifyError(parsed.error));
    process.exit(1);
}

export const env = parsed.data;
