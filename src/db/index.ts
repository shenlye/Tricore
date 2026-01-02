import { count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "../lib/env";
import { users } from "./schema";

export const db = drizzle(env.DATABASE_URL);

export const seedDefaultUser = async () => {
    try {
        const [result] = await db.select({ value: count() }).from(users);
        const userCount = result?.value ?? 0;

        if (userCount === 0) {
            console.log("Creating default admin...");

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

            console.log("-----------------------------------------");
            console.log("Default admin created");
            console.log("username: admin");
            console.log("-----------------------------------------");
        }
    } catch (error) {
        console.error("Failed to seed default user:", error);
    }
};
