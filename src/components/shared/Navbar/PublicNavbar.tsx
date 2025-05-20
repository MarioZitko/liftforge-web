import { NavLink } from "react-router-dom";
import { DarkModeToggle } from "./DarkModeToggle";
import { navLinkClass } from "@/components/shared/utils/navLinkUtils"; // ✅ new path

const links = [
	{ to: "/features", label: "Features" },
	{ to: "/pricing", label: "Pricing" },
	{ to: "/about", label: "About Us" },
	{ to: "/contact", label: "Contact" },
];

export default function PublicNavbar() {
	return (
		<header className="sticky top-0 z-50 bg-background border-b border-gray-200 dark:border-gray-700 shadow-sm">
			<div className="mx-auto max-w-screen-xl flex items-center justify-between px-4 py-3">
				<NavLink to="/" className="text-lg font-bold">
					LiftForge
				</NavLink>
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
				</div>
				<div className="flex items-center gap-6">
					<DarkModeToggle />
					<NavLink
						to="/login"
						className={({ isActive }) => navLinkClass(isActive)}
					>
						<span className="relative z-10">Login</span>
						<span
							className="absolute bottom-0 left-1/2 h-[2px] w-0 bg-primary
											transform -translate-x-1/2 scale-x-0 origin-center
											transition-all duration-300 group-hover:w-full group-hover:scale-x-100"
						/>
					</NavLink>
				</div>
			</div>
		</header>
	);
}
