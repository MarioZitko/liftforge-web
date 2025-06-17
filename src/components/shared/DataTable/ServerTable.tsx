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
import { Card, CardContent } from "@/components/ui/card";
import { PaginationControls } from "./PaginationControls";
import { cn } from "@/lib/utils";
import { ServerTableProps, TableFilter } from "./types";
import { useDebounce } from "@/hooks/useDebounce"; // You'll need to create this hook
import { useState, useEffect } from "react";
import {
	ChevronUpIcon,
	ChevronDownIcon,
	SearchIcon,
	FilterIcon,
} from "lucide-react";

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
	mobileCardRenderer, // New prop for mobile card rendering
}: ServerTableProps<T>) {
	const [searchInput, setSearchInput] = useState(query.searchText ?? "");
	const [isMobile, setIsMobile] = useState(false);
	const debouncedSearch = useDebounce(searchInput, 500);

	// Check if mobile on mount and resize
	useEffect(() => {
		const checkMobile = () => setIsMobile(window.innerWidth < 768);
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	// Update query when debounced search changes
	useEffect(() => {
		if (debouncedSearch !== query.searchText) {
			setQuery({
				...query,
				searchText: debouncedSearch,
				pageNumber: 1,
			});
		}
	}, [debouncedSearch]);

	const handleSort = (key: string) => {
		const same = key === query.orderByProperty;
		setQuery({
			...query,
			orderByProperty: key,
			ascending: same ? !query.ascending : true,
			pageNumber: 1, // Reset to first page when sorting
		});
	};

	const getSortIcon = (columnKey: string) => {
		if (query.orderByProperty !== columnKey) return null;
		return query.ascending ? (
			<ChevronUpIcon className="inline w-4 h-4 ml-1" />
		) : (
			<ChevronDownIcon className="inline w-4 h-4 ml-1" />
		);
	};

	// Mobile Card View
	const MobileCardView = () => (
		<div className="space-y-3">
			{loading ? (
				<Card>
					<CardContent className="p-4 text-center">Loading...</CardContent>
				</Card>
			) : data.length === 0 ? (
				<Card>
					<CardContent className="p-4 text-center">
						No results found.
					</CardContent>
				</Card>
			) : (
				data.map((row) => (
					<Card key={getRowId(row)} className="p-4">
						<CardContent className="p-0 space-y-2">
							{mobileCardRenderer
								? mobileCardRenderer(row)
								: // Default mobile card layout
								  columns.map((col) => (
										<div
											key={String(col.key)}
											className="flex justify-between items-center"
										>
											<span className="text-sm font-medium text-muted-foreground">
												{col.label}:
											</span>
											<div className="flex-1 text-right">
												{col.render ? (
													col.render(row)
												) : (
													<span className="text-sm">
														{String(row[col.key as keyof T] ?? "")}
													</span>
												)}
											</div>
										</div>
								  ))}
						</CardContent>
					</Card>
				))
			)}
		</div>
	);

	return (
		<div className="space-y-4">
			{/* Controls */}
			<div className="space-y-4">
				{/* Search and Create Button Row */}
				<div className="flex flex-col sm:flex-row gap-4">
					<div className="relative flex-1">
						<SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder="Search..."
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
							className="pl-9"
						/>
					</div>
					{onCreate && (
						<Button onClick={onCreate} className="shrink-0">
							{createLabel}
						</Button>
					)}
				</div>

				{/* Filters */}
				{filters.length > 0 && (
					<div className="flex flex-col sm:flex-row gap-4 items-start">
						<div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
							<FilterIcon className="h-4 w-4" />
							Filters:
						</div>
						<div className="flex flex-wrap gap-2 flex-1">
							{filters.slice(0, 4).map((filter: TableFilter, index: number) => (
								<Select
									key={index}
									value={filter.value}
									onValueChange={(selectedValue: string) => {
										// Reset to first page when filter changes
										setQuery({ ...query, pageNumber: 1 });
										filter.onChange(selectedValue);
									}}
								>
									<SelectTrigger className="w-[180px]">
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
						</div>
					</div>
				)}
			</div>

			{/* Table/Cards */}
			{isMobile ? (
				<MobileCardView />
			) : (
				<div className="rounded-md border">
					<div className="overflow-x-auto">
						<Table className="w-full">
							<TableHeader>
								<TableRow>
									{columns.map((col) => (
										<TableHead
											key={String(col.key)}
											className={cn(
												"px-4 py-3 text-left font-medium",
												col.sortable &&
													"cursor-pointer hover:bg-muted/50 select-none"
											)}
											onClick={() =>
												col.sortable && handleSort(String(col.key))
											}
										>
											<div className="flex items-center">
												{col.label}
												{col.sortable && getSortIcon(String(col.key))}
											</div>
										</TableHead>
									))}
								</TableRow>
							</TableHeader>
							<TableBody>
								{loading ? (
									<TableRow>
										<TableCell
											colSpan={columns.length}
											className="text-center py-8"
										>
											<div className="flex items-center justify-center space-x-2">
												<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
												<span>Loading...</span>
											</div>
										</TableCell>
									</TableRow>
								) : data.length === 0 ? (
									<TableRow>
										<TableCell
											colSpan={columns.length}
											className="text-center py-8 text-muted-foreground"
										>
											No results found.
										</TableCell>
									</TableRow>
								) : (
									data.map((row) => (
										<TableRow key={getRowId(row)} className="hover:bg-muted/50">
											{columns.map((col) => (
												<TableCell key={String(col.key)} className="px-4 py-3">
													{col.render ? (
														col.render(row)
													) : (
														<span className="break-words">
															{String(row[col.key as keyof T] ?? "")}
														</span>
													)}
												</TableCell>
											))}
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>
				</div>
			)}

			{/* Pagination */}
			<PaginationControls
				page={query.pageNumber}
				pageSize={query.pageSize}
				total={totalCount}
				onPageChange={(newPage) => setQuery({ ...query, pageNumber: newPage })}
			/>
		</div>
	);
}
