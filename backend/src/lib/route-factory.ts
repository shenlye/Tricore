import type { Hook } from "@hono/zod-openapi";
import { ErrorSchema } from "./schema";

export const defaultHook: Hook<any, any, any, any> = (result, c) => {
	if (!result.success) {
		return c.json(
			{
				success: false,
				error: {
					code: "VALIDATION_ERROR",
					message: "Validation Error",
					details: result.error.issues,
				},
			},
			400,
		);
	}
};

export const createErrorResponse = (description: string) => ({
	content: {
		"application/json": {
			schema: ErrorSchema,
		},
	},
	description,
});
