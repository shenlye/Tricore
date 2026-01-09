import { eq, or } from "drizzle-orm";
import { sign } from "hono/jwt";
import type { DB } from "../db";
import { users } from "../db/schema";
import { env } from "../lib/env";

export class AuthService {
	constructor(private db: DB) {}

	async findUserByIdentifier(identifier: string) {
		const user = await this.db
			.select()
			.from(users)
			.where(or(eq(users.username, identifier), eq(users.email, identifier)))
			.limit(1);
		return user[0];
	}

	async findUserById(id: number) {
		const user = await this.db
			.select()
			.from(users)
			.where(eq(users.id, id))
			.limit(1);
		return user[0];
	}

	async verifyPassword(password: string, hash: string) {
		return await Bun.password.verify(password, hash);
	}

	async hashPassword(password: string) {
		return await Bun.password.hash(password);
	}

	async generateToken(user: { id: number; role: string }) {
		const payload = {
			sub: user.id,
			role: user.role,
			exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
		};
		return await sign(payload, env.JWT_SECRET);
	}

	async updatePassword(userId: number, newPasswordHash: string) {
		const result = await this.db
			.update(users)
			.set({ passwordHash: newPasswordHash })
			.where(eq(users.id, userId))
			.returning();
		return result.length > 0;
	}
}
