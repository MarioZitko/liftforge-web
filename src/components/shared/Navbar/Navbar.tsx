import { useUserStore } from "@/store/userStore";
import PublicNavbar from "./PublicNavbar";
import PrivateNavbar from "./PrivateNavbar";

export default function Navbar() {
	const user = useUserStore((s) => s.user);
	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background">
			{user ? <PrivateNavbar /> : <PublicNavbar />}
		</header>
	);
}
