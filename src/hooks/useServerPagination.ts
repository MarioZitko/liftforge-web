import { useEffect, useState } from "react";
import { constructQueryParams } from "@/lib/utils";

export interface ServerQueryParams {
	pageNumber: number;
	pageSize: number;
	searchText?: string;
	orderByProperty?: string;
	ascending?: boolean;
}

export function useServerPagination<T>(
	fetchFn: (query: string) => Promise<{ data: T[]; totalCount: number }>
) {
	const [query, setQuery] = useState<ServerQueryParams>({
		pageNumber: 1,
		pageSize: 10,
		searchText: "",
		orderByProperty: "name",
		ascending: true,
	});
	const [data, setData] = useState<T[]>([]);
	const [totalCount, setTotalCount] = useState(0);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const fetch = async () => {
			setLoading(true);
			try {
				const queryStr = constructQueryParams(query).toString();
				const res = await fetchFn(queryStr);
				setData(res.data);
				setTotalCount(res.totalCount);
			} finally {
				setLoading(false);
			}
		};
		fetch();
	}, [fetchFn, query]);

	return { data, loading, totalCount, query, setQuery };
}
