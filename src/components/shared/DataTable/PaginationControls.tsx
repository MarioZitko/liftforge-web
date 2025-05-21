import { Button } from "@/components/ui/button";

interface PaginationControlsProps {
	page: number;
	pageSize: number;
	total: number;
	onPageChange: (newPage: number) => void;
}

export function PaginationControls({
	page,
	pageSize,
	total,
	onPageChange,
}: PaginationControlsProps) {
	const totalPages = Math.ceil(total / pageSize);

	return (
		<div className="flex justify-between items-center pt-4">
			<span className="text-sm text-muted-foreground">
				Page {page} of {totalPages}
			</span>
			<div className="space-x-2">
				<Button
					variant="outline"
					disabled={page === 1}
					onClick={() => onPageChange(page - 1)}
				>
					Previous
				</Button>
				<Button
					variant="outline"
					disabled={page >= totalPages}
					onClick={() => onPageChange(page + 1)}
				>
					Next
				</Button>
			</div>
		</div>
	);
}
