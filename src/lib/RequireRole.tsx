import { Navigate } from "react-router-dom";
import { useUserStore } from "@/store/userStore";

interface RequireRoleProps {
	allow: string[]; // Use strings so you don’t need to change type
	children: React.ReactNode;
}

export function RequireRole({ allow, children }: RequireRoleProps) {
	const user = useUserStore((s) => s.user);

	if (!user) return <Navigate to="/login" replace />;
	if (!allow.includes(user.role)) return <Navigate to="/dashboard" replace />;

	return <>{children}</>;
}
