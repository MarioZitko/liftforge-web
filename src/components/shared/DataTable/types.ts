export interface ServerQuery {
	pageNumber: number;
	pageSize: number;
	searchText?: string;
	orderByProperty?: string;
	ascending?: boolean;
}

export interface Column<T> {
	label: string;
	key: keyof T;
	render?: (row: T) => React.ReactNode;
	sortable?: boolean;
}
