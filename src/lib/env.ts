import { mkdir } from "node:fs/promises";
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
    const secretPath = "/app/data/jwt_secret";
    try {
        await mkdir("/app/data", { recursive: true });
        const file = Bun.file(secretPath);
        if (await file.exists()) {
            env.JWT_SECRET = (await file.text()).trim();
            console.info(`从 ${secretPath} 加载了 JWT_SECRET`);
        } else {
            const newSecret = crypto.randomUUID();
            await Bun.write(secretPath, newSecret);
            env.JWT_SECRET = newSecret;
            console.info(`已生成新的 JWT_SECRET 并保存至 ${secretPath}`);
        }
    } catch (error) {
        console.error(
            `在生产环境中使用默认 JWT_SECRET，且无法读取或写入密钥文件 (${secretPath}):`,
            error,
        );
        process.exit(1);
    }
}

export { env };
