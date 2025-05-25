// src/pages/auth/OAuthCallbackPage.tsx

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "@/store/userStore";
import authApiClient from "@/api/auth/auth.api";
import { showError } from "@/components/shared/utils/toast.util";

export default function OAuthCallbackPage() {
	const navigate = useNavigate();
	const setUser = useUserStore((s) => s.setUser);
	const authApi = authApiClient.getInstance();

	useEffect(() => {
		const handleOAuth = async () => {
			try {
				const res = await authApi.getMe();
				setUser(res.data);
				navigate("/dashboard");
			} catch (err) {
				showError(err);
				navigate("/login");
			}
		};

		void handleOAuth();
	}, [authApi, setUser, navigate]);

	return <p className="text-center mt-10">Logging you in...</p>;
}
