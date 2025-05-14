import { Link } from "react-router-dom";
import { DarkModeToggle } from "./DarkModeToggle";

export default function PublicNavbar() {
	return (
		<nav className="mx-auto max-w-screen-xl flex items-center justify-between px-4 py-3">
			<Link to="/" className="text-lg font-bold">
				LiftForge
			</Link>
			<div className="flex items-center gap-6">
				<DarkModeToggle />
				<Link to="/login" className="text-sm font-medium hover:text-primary">
					Login
				</Link>
			</div>
		</nav>
	);
}
