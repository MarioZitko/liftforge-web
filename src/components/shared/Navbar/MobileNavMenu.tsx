import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { navLinkClass } from "../utils/navLinkUtils";
import { IMobileNavMenuProps } from "./types";

export default function MobileNavMenu({
	links,
	menuOpen,
	toggleMenu,
	extras,
}: IMobileNavMenuProps) {
	return (
		<div
			className={cn(
				"md:hidden bg-background overflow-hidden transition-max-h duration-200 border-t border-border",
				menuOpen ? "max-h-96" : "max-h-0"
			)}
		>
			<div className="flex flex-col gap-2 px-6 py-4">
				{links.map(({ to, label }) => (
					<NavLink
						key={to}
						to={to}
						onClick={toggleMenu}
						className={({ isActive }) => navLinkClass(isActive)}
					>
						{label}
					</NavLink>
				))}
				{extras}
			</div>
		</div>
	);
}
