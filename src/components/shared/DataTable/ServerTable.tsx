import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { PaginationControls } from "./PaginationControls";
import { cn } from "@/lib/utils";
import { ServerTableProps } from "./types";

export function ServerTable<T>({
	data,
	columns,
	totalCount,
	loading,
	query,
	setQuery,
	getRowId,
}: ServerTableProps<T>) {
	const handleSort = (key: string) => {
		const same = key === query.orderByProperty;
		setQuery({
			...query,
			orderByProperty: key,
			ascending: same ? !query.ascending : true,
		});
	};

	const handleSearch = (val: string) => {
		setQuery({ ...query, searchText: val, pageNumber: 1 });
	};

	return (
		<div className="space-y-4">
			<Input
				placeholder="Search..."
				value={query.searchText ?? ""}
				onChange={(e) => handleSearch(e.target.value)}
				className="max-w-sm"
			/>

			<div className="rounded-md border">
				<Table className="w-full table-fixed text-center">
					<TableHeader>
						<TableRow>
							{columns.map((col) => (
								<TableHead
									key={String(col.key)}
									className={cn(
										"px-4 py-2 text-center", // 👈 Added text-center
										col.sortable && "cursor-pointer hover:underline"
									)}
									onClick={() => col.sortable && handleSort(String(col.key))}
								>
									{col.label}
									{col.sortable &&
										query.orderByProperty === col.key &&
										(query.ascending ? " ↑" : " ↓")}
								</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{loading ? (
							<TableRow>
								<TableCell colSpan={columns.length}>Loading...</TableCell>
							</TableRow>
						) : data.length === 0 ? (
							<TableRow>
								<TableCell colSpan={columns.length}>No results.</TableCell>
							</TableRow>
						) : (
							data.map((row) => (
								<TableRow key={getRowId(row)}>
									{columns.map((col) => (
										<TableCell
											key={String(col.key)}
											className="px-4 py-2 text-center"
										>
											{col.render ? col.render(row) : (row[col.key] as string)}
										</TableCell>
									))}
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			<PaginationControls
				page={query.pageNumber}
				pageSize={query.pageSize}
				total={totalCount}
				onPageChange={(newPage) => setQuery({ ...query, pageNumber: newPage })}
			/>
		</div>
	);
}
