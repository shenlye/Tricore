import { z } from "zod";

const envSchema = z.object({
    DATABASE_URL: z.string().default("sqlite.db"),
    JWT_SECRET: z.string().min(16, "JWT_SECRET 必须至少 16 位以保证安全"),
    DEFAULT_ADMIN_PASSWORD: z.string().min(8),
    NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("production"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error("环境变量配置错误:", z.treeifyError(parsed.error));
    process.exit(1);
}

const env = parsed.data;

if (env.JWT_SECRET === "your_jwt_secret_key" && env.NODE_ENV === "production") {
    console.error(
        "你正在使用默认的 JWT_SECRET，这在生产环境中是不安全的！请更改它以确保应用程序的安全。",
    );
    process.exit(1);
}

export { env };
