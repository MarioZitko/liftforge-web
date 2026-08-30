import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleRowTriggerProps extends React.ComponentProps<"button"> {
	open: boolean;
	iconClassName?: string;
}

export function CollapsibleRowTrigger({
	open,
	iconClassName,
	className,
	children,
	...props
}: CollapsibleRowTriggerProps) {
	const Icon = open ? ChevronDown : ChevronRight;

	return (
		<button
			className={cn("flex items-center gap-2 text-left flex-1 hover:opacity-80", className)}
			{...props}
		>
			<Icon className={cn("shrink-0", iconClassName)} />
			{children}
		</button>
	);
}
