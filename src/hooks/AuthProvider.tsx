import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";

export function AuthProvider({ children }: { children: ReactNode }) {
	useAuth(); // ✅ only runs once when mounted
	return <>{children}</>;
}
