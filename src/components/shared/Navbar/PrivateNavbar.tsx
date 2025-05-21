import { useUserStore } from "@/store/userStore";
import CoachNavbar from "./CoachNavbar";
import ClientNavbar from "./ClientNavbar";
import AdminNavbar from "./AdminNavbar";

export default function PrivateNavbar() {
	const role = useUserStore((s) => s.user?.role);

	switch (role) {
		case "ADMIN":
			return <AdminNavbar />;
		case "COACH":
			return <CoachNavbar />;
		case "CLIENT":
			return <ClientNavbar />;
		default:
			return null;
	}
}
