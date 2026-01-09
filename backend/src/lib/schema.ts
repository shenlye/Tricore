import { z } from "@hono/zod-openapi";

export const ErrorSchema = z.object({
	success: z.boolean().openapi({ example: false }),
	error: z.object({
		code: z.string().openapi({ example: "VALIDATION_ERROR" }),
		message: z.string().openapi({ example: "Invalid request parameters" }),
		details: z.array(z.any()).optional(),
	}),
});

export const createSuccessSchema = <T extends z.ZodTypeAny>(dataSchema: T) => {
	return z.object({
		success: z.boolean().openapi({ example: true }),
		data: dataSchema,
		meta: z
			.object({
				timestamp: z.string().openapi({ example: "2026-01-01T00:00:00Z" }),
			})
			.optional(),
	});
};

export const createPaginatedSuccessSchema = <T extends z.ZodTypeAny>(
	dataSchema: T,
) => {
	return z.object({
		success: z.boolean().openapi({ example: true }),
		data: z.array(dataSchema),
		meta: z.object({
			total: z.number().openapi({ example: 100 }),
			page: z.number().openapi({ example: 1 }),
			limit: z.number().openapi({ example: 10 }),
		}),
	});
};

export type ErrorType = z.infer<typeof ErrorSchema>;
