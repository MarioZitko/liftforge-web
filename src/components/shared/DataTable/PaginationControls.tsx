import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	ChevronLeftIcon,
	ChevronRightIcon,
	ChevronsLeftIcon,
	ChevronsRightIcon,
} from "lucide-react";
import { PaginationControlsProps } from "./types";

export function PaginationControls({
	page,
	pageSize,
	total,
	onPageChange,
	onPageSizeChange,
	pageSizeOptions = [10, 20, 50, 100],
}: PaginationControlsProps) {
	const totalPages = Math.ceil(total / pageSize);
	const startItem = Math.min((page - 1) * pageSize + 1, total);
	const endItem = Math.min(page * pageSize, total);

	const getVisiblePages = () => {
		const delta = 2;
		const range = [];
		const rangeWithDots = [];

		for (
			let i = Math.max(2, page - delta);
			i <= Math.min(totalPages - 1, page + delta);
			i++
		) {
			range.push(i);
		}

		if (page - delta > 2) {
			rangeWithDots.push(1, "...");
		} else {
			rangeWithDots.push(1);
		}

		rangeWithDots.push(...range);

		if (page + delta < totalPages - 1) {
			rangeWithDots.push("...", totalPages);
		} else if (totalPages > 1) {
			rangeWithDots.push(totalPages);
		}

		return rangeWithDots;
	};

	const visiblePages = getVisiblePages();

	return (
		<div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
			<div className="flex flex-col sm:flex-row items-center gap-2 text-sm text-muted-foreground">
				<span>
					Showing {startItem} to {endItem} of {total} results
				</span>
				{onPageSizeChange && (
					<div className="flex items-center gap-2">
						<span>Show</span>
						<Select
							value={pageSize.toString()}
							onValueChange={(value) => onPageSizeChange(parseInt(value))}
						>
							<SelectTrigger className="w-16 h-8">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{pageSizeOptions.map((size) => (
									<SelectItem key={size} value={size.toString()}>
										{size}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<span>per page</span>
					</div>
				)}
			</div>

			<div className="flex items-center gap-1">
				{/* First Page */}
				<Button
					variant="outline"
					size="sm"
					disabled={page === 1}
					onClick={() => onPageChange(1)}
					className="hidden sm:flex"
				>
					<ChevronsLeftIcon className="h-4 w-4" />
				</Button>

				{/* Previous Page */}
				<Button
					variant="outline"
					size="sm"
					disabled={page === 1}
					onClick={() => onPageChange(page - 1)}
				>
					<ChevronLeftIcon className="h-4 w-4" />
					<span className="hidden sm:inline ml-1">Previous</span>
				</Button>

				{/* Page Numbers - Hidden on mobile */}
				<div className="hidden sm:flex items-center gap-1">
					{visiblePages.map((pageNum, index) => (
						<Button
							key={index}
							variant={pageNum === page ? "default" : "outline"}
							size="sm"
							disabled={pageNum === "..."}
							onClick={() =>
								typeof pageNum === "number" && onPageChange(pageNum)
							}
							className="min-w-[32px]"
						>
							{pageNum}
						</Button>
					))}
				</div>

				{/* Mobile page indicator */}
				<div className="sm:hidden px-3 py-1 text-sm">
					{page} of {totalPages}
				</div>

				{/* Next Page */}
				<Button
					variant="outline"
					size="sm"
					disabled={page >= totalPages}
					onClick={() => onPageChange(page + 1)}
				>
					<span className="hidden sm:inline mr-1">Next</span>
					<ChevronRightIcon className="h-4 w-4" />
				</Button>

				{/* Last Page */}
				<Button
					variant="outline"
					size="sm"
					disabled={page >= totalPages}
					onClick={() => onPageChange(totalPages)}
					className="hidden sm:flex"
				>
					<ChevronsRightIcon className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}
