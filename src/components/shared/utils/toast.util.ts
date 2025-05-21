import { toast } from "sonner";
import type { ApiErrorResponse } from "@/api/types";

export function showSuccess(message: string) {
	toast.success(message); // 👈 no description
}

export function showError(
	error: unknown,
	fallbackMessage = "Something went wrong."
) {
	let message: string;

	if (typeof error === "string") {
		message = error;
	} else if (
		typeof error === "object" &&
		error !== null &&
		"message" in error
	) {
		const err = error as ApiErrorResponse;
		message = Array.isArray(err.message)
			? err.message.join("\n")
			: err.message || fallbackMessage;
	} else {
		message = fallbackMessage;
	}

	toast.error(message); // 👈 simplified
}
