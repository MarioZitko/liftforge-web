import { useEffect, useState } from "react";
import { usersApi } from "@/api/users/users.api";
import { authApi } from "@/api/auth/auth.api";
import { useUserStore } from "@/store/userStore";
import type { LoginRequest } from "@/api/auth/auth.types";

export function useAuth() {
	const { user, setUser, logout: clearUser } = useUserStore();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!user) {
			usersApi
				.getMe()
				.then(setUser)
				.catch(() => clearUser())
				.finally(() => setLoading(false));
		} else {
			setLoading(false);
		}
	}, [user, setUser, clearUser]);

	const login = async (data: LoginRequest) => {
		await authApi.login(data);
		const currentUser = await usersApi.getMe();
		setUser(currentUser);
	};

	const logout = () => {
		authApi.logout();
		clearUser();
	};

	return { user, login, logout, loading };
}
