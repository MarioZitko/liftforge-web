import { cn } from "@/lib/utils";

export const navLinkClass = (isActive: boolean) =>
	cn(
		"relative group px-2 py-1 text-sm font-medium transition-colors",
		isActive
			? "text-primary font-semibold border-b-2 border-primary"
			: "text-gray-700 hover:text-primary dark:text-gray-200"
	);
