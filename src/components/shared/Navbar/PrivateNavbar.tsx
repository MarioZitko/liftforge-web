import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useUserStore } from "@/store/userStore";
import { DarkModeToggle } from "./DarkModeToggle";
import { cn } from "@/lib/utils";

export default function PrivateNavbar() {
	const [menuOpen, setMenuOpen] = useState(false);
	const toggleMenu = () => setMenuOpen(!menuOpen);
	const logout = useUserStore((s) => s.logout);

	return (
		<>
			<nav className="mx-auto max-w-screen-xl flex items-center justify-between px-4 py-3">
				<Link to="/dashboard" className="text-lg font-bold">
					LiftForge
				</Link>
				<div className="hidden md:flex items-center gap-6">
					<Link
						to="/dashboard"
						className="text-sm font-medium hover:text-primary"
					>
						Dashboard
					</Link>
					<Link
						to="/clients"
						className="text-sm font-medium hover:text-primary"
					>
						Clients
					</Link>
					<DarkModeToggle />
					<button
						onClick={logout}
						className="text-sm text-red-500 hover:text-red-600"
					>
						Logout
					</button>
				</div>
				<button className="md:hidden" onClick={toggleMenu}>
					{menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
				</button>
			</nav>

			<div
				className={cn(
					"md:hidden bg-background transition-all duration-200 overflow-hidden",
					menuOpen ? "max-h-96" : "max-h-0"
				)}
			>
				<div className="flex flex-col gap-2 px-6 pb-4">
					<Link
						to="/dashboard"
						className="py-1 text-sm font-medium hover:text-primary"
					>
						Dashboard
					</Link>
					<Link
						to="/clients"
						className="py-1 text-sm font-medium hover:text-primary"
					>
						Clients
					</Link>
					<DarkModeToggle />
					<button
						onClick={logout}
						className="py-1 text-sm text-red-500 hover:text-red-600 text-left"
					>
						Logout
					</button>
				</div>
			</div>
		</>
	);
}
