export interface PaginationControlsProps {
	page: number;
	pageSize: number;
	total: number;
	onPageChange: (newPage: number) => void;
	onPageSizeChange?: (newPageSize: number) => void;
	pageSizeOptions?: number[];
}

export interface ServerQuery {
	pageNumber: number;
	pageSize: number;
	searchText?: string;
	orderByProperty?: string;
	ascending?: boolean;
}

export interface TableFilterOption {
	label: string;
	value: string;
}

export interface TableFilter {
	label: string;
	value: string;
	options: TableFilterOption[];
	onChange: (value: string) => void;
}

export interface ServerTableProps<T> {
	data: T[];
	columns: Column<T>[];
	totalCount: number;
	loading: boolean;
	query: ServerQuery;
	setQuery: (query: ServerQuery) => void;
	getRowId: (row: T) => string;
	onCreate?: () => void;
	createLabel?: string;
	filters?: TableFilter[];
	mobileCardRenderer?: (row: T) => React.ReactNode; // New prop for custom mobile layout
}

export type Column<T> = {
	key: keyof T;
	label: string;
	sortable?: boolean;
	render?: (row: T) => React.ReactNode;
};

// Backend API interfaces for server-side pagination
export interface PaginatedRequest {
	pageNumber: number;
	pageSize: number;
	searchText?: string;
	orderByProperty?: string;
	ascending?: boolean;
	filters?: Record<string, string>; // Additional filters
}

export interface PaginatedResponse<T> {
	data: T[];
	totalCount: number;
	pageNumber: number;
	pageSize: number;
	totalPages: number;
}
