import { IPaginatedRequest } from "@/api/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function constructQueryParams<
	T extends Record<string, string | number | boolean | undefined>
>(
	paginatedRequestParams: IPaginatedRequest,
	additionalParams?: T
): URLSearchParams {
	const queryParams = new URLSearchParams({
		pageNumber: paginatedRequestParams.pageNumber.toString(),
		pageSize: paginatedRequestParams.pageSize.toString(),
		searchText: paginatedRequestParams.searchText ?? "",
		orderByProperty: paginatedRequestParams.orderByProperty ?? "",
		ascending: paginatedRequestParams.ascending?.toString() ?? "",
	});

	if (additionalParams) {
		Object.entries(additionalParams).forEach(([key, value]) => {
			if (value !== undefined && value !== null) {
				queryParams.set(key, String(value));
			}
		});
	}

	return queryParams;
}
