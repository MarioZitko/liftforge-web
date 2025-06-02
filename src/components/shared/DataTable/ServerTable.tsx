import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectTrigger,
	SelectContent,
	SelectItem,
	SelectValue,
	SelectGroup,
	SelectLabel,
} from "@/components/ui/select";
import { PaginationControls } from "./PaginationControls"; // Assuming this path is correct
import { cn } from "@/lib/utils"; // Assuming this path is correct
import { ServerTableProps, TableFilter } from "./types"; // Using the provided types

export function ServerTable<T>({
	data,
	columns,
	totalCount,
	loading,
	query,
	setQuery,
	getRowId,
	onCreate,
	createLabel = "Add New",
	filters = [],
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
			<div className="overflow-x-auto">
				<div className="flex items-center gap-4 whitespace-nowrap pb-2 min-w-full">
					{/* Search */}
					<Input
						placeholder="Search..."
						value={query.searchText ?? ""}
						onChange={(e) => handleSearch(e.target.value)}
						className="w-[200px] shrink-0"
					/>

					{/* Filters */}
					{/* Filters */}
					{filters.slice(0, 4).map((filter: TableFilter, index: number) => (
						<Select
							key={index}
							value={filter.value}
							onValueChange={(selectedValue: string) => {
								filter.onChange(selectedValue);
							}}
						>
							<SelectTrigger className="w-[200px] shrink-0">
								<SelectValue placeholder={filter.label} />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectLabel>{filter.label}</SelectLabel>
									{filter.options.map((opt) => (
										<SelectItem key={opt.value} value={opt.value}>
											{opt.label}
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>
					))}

					{/* Add Button */}
					{onCreate && (
						<Button onClick={onCreate} className="shrink-0">
							{createLabel}
						</Button>
					)}
				</div>
			</div>

			<div className="rounded-md border">
				<Table className="w-full table-fixed text-center">
					<TableHeader>
						<TableRow>
							{columns.map((col) => (
								<TableHead
									key={String(col.key)}
									className={cn(
										"px-4 py-2 text-center",
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
								<TableCell colSpan={columns.length} className="text-center">
									Loading...
								</TableCell>
							</TableRow>
						) : data.length === 0 ? (
							<TableRow>
								<TableCell colSpan={columns.length} className="text-center">
									No results.
								</TableCell>
							</TableRow>
						) : (
							data.map((row) => (
								<TableRow key={getRowId(row)}>
									{columns.map((col) => (
										<TableCell
											key={String(col.key)}
											className="px-4 py-2 text-center" // Removed justify-center items-center, let content flow
										>
											<div className="flex justify-center items-center min-h-[36px]">
												{col.render ? (
													col.render(row)
												) : (
													<span
														className="line-clamp-2 text-sm break-words max-w-[300px]"
														title={String(row[col.key as keyof T] ?? "")}
													>
														{String(row[col.key as keyof T] ?? "")}
													</span>
												)}
											</div>
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
