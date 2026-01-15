import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

interface ApiError {
	error: {
		code: string;
		message: string;
		details?: { message: string }[];
	};
}

function isApiError(res: unknown): res is ApiError {
	return (
		typeof res === "object" &&
		res !== null &&
		"error" in res &&
		typeof (res as ApiError).error === "object" &&
		(res as ApiError).error !== null &&
		"message" in (res as ApiError).error
	);
}

export function parseBackendError(res: unknown): string {
	if (!isApiError(res)) {
		return "Unknown error";
	}
	const err = res.error;

	if (err?.code === "VALIDATION_ERROR") {
		return err.details?.[0]?.message ?? err.message;
	}

	return err?.message ?? "Unknown error";
}
