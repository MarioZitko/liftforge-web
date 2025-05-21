// api/types.ts

export interface ApiSuccessResponse<T> {
	statusCode: number;
	timestamp: string;
	data: T;
}

export interface ApiErrorResponse {
	statusCode: number;
	timestamp: string;
	path: string;
	message: string | string[];
}

// For pagination input
export interface IPaginatedRequest {
	pageNumber: number;
	pageSize: number;
	searchText?: string;
	orderByProperty?: string;
	ascending?: boolean;
}

// Unified paginated response format
export interface PaginatedData<T> {
	currentPage: number;
	totalPages: number;
	pageSize: number;
	totalCount: number;
	hasPrevious: boolean;
	hasNext: boolean;
	data: T[];
}

// Final API response for paginated queries
export type ApiPaginatedResponse<T> = ApiSuccessResponse<PaginatedData<T>>;

export interface GenericMessageResponse {
	message: string;
}

export type ApiMessageResponse = ApiSuccessResponse<GenericMessageResponse>;
