import { useEffect, useState } from "react";
import authApiClient from "@/api/auth/auth.api";
import { useUserStore } from "@/store/userStore";
import type { LoginRequest } from "@/api/auth/auth.types";

export function useAuth() {
	const { user, setUser, logout: clearUser } = useUserStore();
	const [loading, setLoading] = useState(true);
	const authApi = authApiClient.getInstance();

	useEffect(() => {
		if (!user) {
			authApi
				.getMe()
				.then((res) => setUser(res.data))
				.catch(() => clearUser())
				.finally(() => setLoading(false));
		} else {
			setLoading(false);
		}
	}, [user]);

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
