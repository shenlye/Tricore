import type { Context, Next } from "hono";
import { createMiddleware } from "hono/factory";
import { jwt } from "hono/jwt";
import { z } from "zod";
import { env } from "../lib/env";
import { logger } from "../lib/logger";

const jwtMiddleware = jwt({
	secret: env.JWT_SECRET,
});

export const authMiddleware = createMiddleware(
	async (c: Context, next: Next) => {
		try {
			return await jwtMiddleware(c, next);
		} catch (e) {
			logger.error({ err: e }, "JWT Verification Failed");

			return c.json(
				{
					success: false,
					error: {
						code: "UNAUTHORIZED",
						message: "Unauthorized",
					},
				},
				401,
			);
		}
	},
);

const payloadSchema = z.object({
	sub: z.number(),
	role: z.enum(["admin", "user"]),
	exp: z.number(),
});

export const adminMiddleware = createMiddleware(
	async (c: Context, next: Next) => {
		const payload = c.get("jwtPayload");

		const result = payloadSchema.safeParse(payload);
		if (!result.success) {
			return c.json(
				{
					success: false,
					error: {
						code: "UNAUTHORIZED",
						message: "Unauthorized: Invalid session",
					},
				},
				401,
			);
		}

		if (result.data.role !== "admin") {
			return c.json(
				{
					success: false,
					error: {
						code: "FORBIDDEN",
						message: "Forbidden: Admin access required",
					},
				},
				403,
			);
		}

		c.set("user", result.data);

		await next();
	},
);
