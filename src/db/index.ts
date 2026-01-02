import { count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "../lib/env";
import { logger } from "../lib/logger";
import { users } from "./schema";

export const db = drizzle(env.DATABASE_URL);

export const seedDefaultUser = async () => {
    try {
        const [result] = await db.select({ value: count() }).from(users);
        const userCount = result?.value ?? 0;

        if (userCount === 0) {
            logger.info(
                "Database is empty. Initializing default admin user...",
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

            console.log(`\n${"=".repeat(50)}`);
            console.log("SECURITY NOTICE: Default admin created.");
            console.log("Username: admin");
            console.log(
                "Password: [As defined in your DEFAULT_ADMIN_PASSWORD]",
            );
            console.log(`${"=".repeat(50)}\n`);
        }
    } catch (error) {
        logger.error(error, "Failed to seed default user");
    }
};
