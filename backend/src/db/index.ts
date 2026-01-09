import { Database } from "bun:sqlite";
import { count, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { env } from "../lib/env";
import { logger } from "../lib/logger";
import * as schema from "./schema";
import { users } from "./schema";

const sqlite = new Database(env.DATABASE_URL);
sqlite.run("PRAGMA journal_mode = WAL;");
export const db = drizzle(sqlite, { schema });
export type DB = typeof db;

export const seedDefaultUser = async () => {
	try {
		const [result] = await db
			.select({ value: count() })
			.from(users)
			.where(eq(users.role, "admin"));
		const adminExists = (result.value ?? 0) > 0;

		if (!adminExists) {
			logger.info("admin user not found. Initializing default admin user...");

			if (env.DEFAULT_ADMIN_PASSWORD === "admin123456") {
				logger.warn(`\n${"=".repeat(50)}`);
				logger.warn("SECURITY WARNING: Using default admin password.");
				logger.warn(
					"Please change the password immediately after first login!",
				);
				logger.warn(`${"=".repeat(50)}\n`);
			}

			const passwordHash = await Bun.password.hash(env.DEFAULT_ADMIN_PASSWORD);

			await db
				.insert(users)
				.values({
					role: "admin",
					username: "admin",
					email: "admin@example.com",
					passwordHash: passwordHash,
				})
				.onConflictDoNothing();

			logger.info(`${"=".repeat(50)}`);
			logger.info("Default admin account initialized successfully.");
			logger.info("Username: admin");
			logger.info(`${"=".repeat(50)}`);
		}
	} catch (error) {
		logger.error(error, "Failed to seed default user");
		process.exit(1);
	}
};
