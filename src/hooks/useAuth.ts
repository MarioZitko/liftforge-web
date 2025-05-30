import { useEffect, useState } from "react";
import authApiClient from "@/api/auth/auth.api";
import { useUserStore } from "@/store/userStore";
import type { LoginRequest } from "@/api/auth/auth.types";

export function useAuth() {
	const { user, setUser, logout: clearUser } = useUserStore();
	const [loading, setLoading] = useState(true);
	const authApi = authApiClient.getInstance();

	useEffect(() => {
		// Always try to fetch the real session on load
		authApi
			.getMe()
			.then((res) => setUser(res.data))
			.catch(() => clearUser()) // if cookie/session is invalid, clear local user
			.finally(() => setLoading(false));
	}, []);

	const login = async (data: LoginRequest) => {
		await authApi.login(data);
		const currentUser = await authApi.getMe();
		setUser(currentUser.data);
	};

	const logout = () => {
		authApi.logout();
		clearUser();
	};

	return { user, login, logout, loading };
}
