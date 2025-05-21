import { useState } from "react";
import { Menu, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { DarkModeToggle } from "./DarkModeToggle";
import { navLinkClass } from "@/components/shared/utils/navLinkUtils"; // ✅ Updated import
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const links = [
	{ to: "/dashboard", label: "Dashboard" },
	{ to: "/clients", label: "Clients" },
];

export default function PrivateNavbar() {
	const [menuOpen, setMenuOpen] = useState(false);
	const { logout } = useAuth();

	return (
		<header className="sticky top-0 z-50 bg-background border-b border-gray-200 dark:border-gray-700 shadow-sm">
			<div className="mx-auto max-w-screen-xl flex items-center justify-between px-4 py-3">
				<NavLink to="/" className="text-lg font-bold">
					LiftForge
				</NavLink>

				{/* Desktop Menu */}
				<div className="hidden md:flex items-center gap-6">
					{links.map(({ to, label }) => (
						<NavLink
							key={to}
							to={to}
							className={({ isActive }) => navLinkClass(isActive)}
						>
							<span className="relative z-10">{label}</span>
							<span
								className="absolute bottom-0 left-1/2 h-[2px] w-0 bg-primary
											transform -translate-x-1/2 scale-x-0 origin-center
											transition-all duration-300 group-hover:w-full group-hover:scale-x-100"
							/>
						</NavLink>
					))}

					<DarkModeToggle />

					<button
						onClick={logout}
						className="px-2 py-1 text-sm font-medium text-red-500 hover:text-red-600"
					>
						Logout
					</button>
				</div>

				{/* Mobile Toggle */}
				<button
					className="md:hidden"
					onClick={() => setMenuOpen((prev) => !prev)}
				>
					{menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
				</button>
			</div>

			{/* Mobile Menu */}
			<div
				className={cn(
					"md:hidden bg-background overflow-hidden transition-max-h duration-200",
					menuOpen ? "max-h-60" : "max-h-0"
				)}
			>
				<div className="flex flex-col gap-2 px-6 pb-4">
					{links.map(({ to, label }) => (
						<NavLink
							key={to}
							to={to}
							className={({ isActive }) => navLinkClass(isActive)}
						>
							<span className="relative z-10">{label}</span>
							<span
								className="absolute bottom-0 left-1/2 h-[2px] w-0 bg-primary
											transform -translate-x-1/2 scale-x-0 origin-center
											transition-all duration-300 group-hover:w-full group-hover:scale-x-100"
							/>
						</NavLink>
					))}

					<DarkModeToggle />

					<button
						onClick={logout}
						className="text-left px-2 py-1 text-sm font-medium text-red-500 hover:text-red-600"
					>
						Logout
					</button>
				</div>
			</div>
		</header>
	);
}
