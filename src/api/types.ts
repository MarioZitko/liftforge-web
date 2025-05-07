// Common structure returned by many APIs
export interface IApiBaseResponse {
	statusCode: number;
	message: string;
	error?: string;
}

// If your backend wraps actual data inside a `data` field (optional pattern)
export interface IApiDataResponse<T> extends IApiBaseResponse {
	data: T;
}

// Example: for paginated lists
export interface IPaginatedResponse<T> {
	items: T[];
	total: number;
	page: number;
	pageSize: number;
}
