import { mkdir } from "node:fs/promises";
import { z } from "zod";

const envSchema = z.object({
	DATABASE_URL: z.string().default("/app/data/sqlite.db"),
	JWT_SECRET: z.string().default("your_jwt_secret_key"),
	DEFAULT_ADMIN_PASSWORD: z.string().min(8).default("admin123456"),
	NODE_ENV: z.enum(["development", "production", "test"]).default("production"),
	PORT: z.coerce.number().int().positive().default(3000),
	ALLOWED_ORIGINS: z
		.string()
		.default("http://localhost:5173,http://127.0.0.1:5173"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
	console.error("环境变量配置错误:", z.treeifyError(parsed.error));
	process.exit(1);
}

const env = parsed.data;

if (env.NODE_ENV === "production") {
	if (env.JWT_SECRET === "your_jwt_secret_key") {
		const secretPath = "/app/data/jwt_secret";
		try {
			await mkdir("/app/data", { recursive: true });
			const file = Bun.file(secretPath);

			let finalSecret = (await file.text()).trim();

			if (finalSecret && finalSecret.length >= 32) {
				console.info(`Loaded persisted JWT_SECRET from ${secretPath}`);
			} else {
				finalSecret = crypto.randomUUID();
				await Bun.write(secretPath, finalSecret);
				console.info(
					`Generated new random JWT_SECRET and saved to ${secretPath}`,
				);
			}

			env.JWT_SECRET = finalSecret;
		} catch (error) {
			console.error(
				`Failed to auto-generate secret key in production (${secretPath}):`,
				error,
			);
			process.exit(1);
		}
	}
}

export { env };
