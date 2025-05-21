import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";

import { coachLinks } from "./navLinks";
import { navLinkClass } from "../utils/navLinkUtils";
import { useAuth } from "@/hooks/useAuth";
import { DarkModeToggle } from "./DarkModeToggle";
import MobileNavMenu from "./MobileNavMenu";

export default function CoachNavbar() {
	const [menuOpen, setMenuOpen] = useState(false);
	const { logout } = useAuth();

	return (
		<header className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
			<div className="mx-auto max-w-screen-xl flex items-center justify-between px-4 py-3">
				<NavLink to="/" className="text-lg font-bold">
					LiftForge Coach
				</NavLink>

				{/* Desktop Menu */}
				<div className="hidden md:flex items-center gap-6">
					{coachLinks.map(({ to, label }) => (
						<NavLink
							key={to}
							to={to}
							className={({ isActive }) => navLinkClass(isActive)}
						>
							{label}
						</NavLink>
					))}
					<DarkModeToggle />
					<button
						onClick={logout}
						className="text-sm font-medium text-red-500 hover:text-red-600"
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

			<MobileNavMenu
				links={coachLinks}
				menuOpen={menuOpen}
				toggleMenu={() => setMenuOpen(false)}
				extras={
					<>
						<DarkModeToggle />
						<button
							onClick={logout}
							className="text-left px-2 py-1 text-sm font-medium text-red-500 hover:text-red-600"
						>
							Logout
						</button>
					</>
				}
			/>
		</header>
	);
}
