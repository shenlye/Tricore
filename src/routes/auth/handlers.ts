import type { RouteHandler } from "@hono/zod-openapi";
import { eq, or } from "drizzle-orm";
import { sign } from "hono/jwt";
import { db } from "../../db";
import { users } from "../../db/schema";
import { env } from "../../lib/env";
import type { changePasswordRoute, loginRoute } from "./routers";

export const loginHandler: RouteHandler<typeof loginRoute> = async (c) => {
    const { identifier, password } = c.req.valid("json");

    const user = await db
        .select()
        .from(users)
        .where(or(eq(users.username, identifier), eq(users.email, identifier)))
        .limit(1);

    const foundUser = user[0];

    const dummyHash =
        "$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHQ$q/v5V4AmI3f23aVw7V7d2A";
    const passwordHash = foundUser ? foundUser.passwordHash : dummyHash;
    const isMatch = await Bun.password.verify(password, passwordHash);

    if (!foundUser || !isMatch) {
        return c.json({ message: "Invalid username/email or password" }, 401);
    }

    const payload = {
        sub: user[0].id,
        role: user[0].role,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    };

    const token = await sign(payload, env.JWT_SECRET);

    return c.json({ token: token }, 200);
};

export const changePasswordHandler: RouteHandler<
    typeof changePasswordRoute
> = async (c) => {
    const { oldPassword, newPassword } = c.req.valid("json");
    const payload = c.get("jwtPayload");

    const userId = payload.sub;

    const user = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

    const foundUser = user[0];
    if (!foundUser) {
        return c.json({ message: "User not found" }, 404);
    }

    const isMatch = await Bun.password.verify(
        oldPassword,
        foundUser.passwordHash,
    );
    if (!isMatch) {
        return c.json({ message: "Old password is incorrect" }, 401);
    }

    const newPasswordHash = await Bun.password.hash(newPassword);

    const result = await db
        .update(users)
        .set({ passwordHash: newPasswordHash })
        .where(eq(users.id, userId))
        .returning();
    
    if (result.length === 0) {
        return c.json({ message: "User not found during update" }, 404);
    }

    return c.json({ message: "Password changed successfully" }, 200);
};
