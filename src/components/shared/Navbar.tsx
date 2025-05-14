import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function Navbar() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);

	return (
		<header className="sticky top-0 z-50 w-full bg-white shadow-sm">
			<nav className="mx-auto flex max-w-screen-xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
				{/* Logo */}
				<Link to="/" className="text-xl font-bold text-black">
					LiftForge
				</Link>

				{/* Desktop Menu */}
				<div className="hidden md:flex space-x-6 items-center">
					<Link
						to="/dashboard"
						className="text-sm font-medium hover:text-primary"
					>
						Dashboard
					</Link>
					<Link
						to="/programs"
						className="text-sm font-medium hover:text-primary"
					>
						Programs
					</Link>
					<Link
						to="/clients"
						className="text-sm font-medium hover:text-primary"
					>
						Clients
					</Link>
				</div>

				{/* Hamburger Button */}
				<button className="md:hidden" onClick={toggleMenu}>
					{mobileMenuOpen ? (
						<X className="h-6 w-6" />
					) : (
						<Menu className="h-6 w-6" />
					)}
				</button>
			</nav>

			{/* Mobile Menu */}
			<div
				className={cn(
					"md:hidden bg-white transition-all duration-200 overflow-hidden",
					mobileMenuOpen ? "max-h-96" : "max-h-0"
				)}
			>
				<div className="flex flex-col px-6 pb-4">
					<Link
						to="/dashboard"
						className="py-2 text-sm font-medium hover:text-primary"
					>
						Dashboard
					</Link>
					<Link
						to="/programs"
						className="py-2 text-sm font-medium hover:text-primary"
					>
						Programs
					</Link>
					<Link
						to="/clients"
						className="py-2 text-sm font-medium hover:text-primary"
					>
						Clients
					</Link>
				</div>
			</div>
		</header>
	);
}
