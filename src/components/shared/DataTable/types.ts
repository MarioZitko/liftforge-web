export interface ServerQuery {
	pageNumber: number;
	pageSize: number;
	searchText?: string;
	orderByProperty?: string;
	ascending?: boolean;
}

export interface ServerTableProps<T> {
	data: T[];
	columns: Column<T>[];
	totalCount: number;
	loading: boolean;
	query: ServerQuery;
	setQuery: (q: ServerQuery) => void;
	getRowId: (row: T) => string;
}

export type Column<T> = {
	key: keyof T;
	label: string;
	sortable?: boolean;
	render?: (row: T) => React.ReactNode;
};
