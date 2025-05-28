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

	// New
	onCreate?: () => void;
	createLabel?: string;
	filters?: TableFilter[]; // max 4 supported
}

export type Column<T> = {
	key: keyof T;
	label: string;
	sortable?: boolean;
	render?: (row: T) => React.ReactNode;
};
