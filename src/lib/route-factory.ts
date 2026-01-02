import { ErrorSchema } from "./schema";

export const createErrorResponse = (description: string) => ({
    content: {
        "application/json": {
            schema: ErrorSchema,
        },
    },
    description,
});
