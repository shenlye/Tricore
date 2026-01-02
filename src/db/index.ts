import { count, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "../lib/env";
import { logger } from "../lib/logger";
import { users } from "./schema";

export const db = drizzle(env.DATABASE_URL);

export const seedDefaultUser = async () => {
    try {
        const [result] = await db
            .select({ value: count() })
            .from(users)
            .where(eq(users.role, "admin"));
        const adminExists = (result.value ?? 0) > 0;

        if (!adminExists) {
            logger.info(
                "admin user not found. Initializing default admin user...",
            );

            const passwordHash = await Bun.password.hash(
                env.DEFAULT_ADMIN_PASSWORD,
            );

            await db
                .insert(users)
                .values({
                    role: "admin",
                    username: "admin",
                    email: "admin@example.com",
                    passwordHash: passwordHash,
                })
                .onConflictDoNothing();

            logger.warn(`${"=".repeat(50)}`);
            logger.warn("SECURITY NOTICE: Default admin created.");
            logger.warn("Username: admin");
            logger.warn(
                "Password: [As defined in your DEFAULT_ADMIN_PASSWORD]",
            );
            logger.warn(`${"=".repeat(50)}\n`);

            logger.info(
                {
                    user: {
                        username: "admin",
                        role: "admin",
                        source: "DEFAULT_ADMIN_PASSWORD env var",
                    },
                },
                "✅ Default admin account initialized successfully.",
            );
        }
    } catch (error) {
        logger.error(error, "Failed to seed default user");
        process.exit(1);
    }
};
