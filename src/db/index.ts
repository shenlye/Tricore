import { count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { users } from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error("DATABASE_URL is missing");
}

export const db = drizzle(databaseUrl);

export const seedDefaultUser = async () => {
    try {
        const [result] = await db.select({ value: count() }).from(users);
        const userCount = result?.value ?? 0;

        if (userCount === 0) {
            const defaultAdminPassword = process.env.DEFAULT_ADMIN_PASSWORD;

            if (!defaultAdminPassword) {
                throw new Error(
                    "DEFAULT_ADMIN_PASSWORD is missing in environment variables.",
                );
            }

            console.log("Creating default admin...");

            const passwordHash = await Bun.password.hash(defaultAdminPassword);

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
