// src/pages/ConfirmEmailPage.tsx
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import AuthApiClient from "@/api/auth/auth.api";
import { showError, showSuccess } from "@/components/shared/utils/toast.util";
import { Loader2 } from "lucide-react";

export default function ConfirmEmailPage() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const [status, setStatus] = useState<"loading" | "success" | "error">(
		"loading"
	);

	useEffect(() => {
		const token = searchParams.get("token");

		if (!token) {
			showError("Missing confirmation token");
			setStatus("error");
			return;
		}

		const verify = async () => {
			try {
				const authApi = AuthApiClient.getInstance();
				await authApi.verifyEmail({ token });

				showSuccess("Email verified successfully");
				setStatus("success");

				// Redirect after a short delay
				setTimeout(() => {
					navigate("/login");
				}, 3000);
			} catch (err) {
				showError(err, "Email verification failed");
				setStatus("error");
			}
		};

		verify();
	}, [searchParams, navigate]);

	return (
		<div className="min-h-screen flex items-center justify-center px-4">
			<div className="text-center space-y-4">
				{status === "loading" && (
					<>
						<Loader2 className="animate-spin mx-auto h-8 w-8 text-primary" />
						<p className="text-sm text-muted-foreground">Verifying email...</p>
					</>
				)}

				{status === "success" && (
					<>
						<h1 className="text-2xl font-bold text-green-600 dark:text-green-400">
							Success!
						</h1>
						<p className="text-sm">
							Your email has been confirmed. Redirecting...
						</p>
					</>
				)}

				{status === "error" && (
					<>
						<h1 className="text-2xl font-bold text-red-600 dark:text-red-400">
							Oops!
						</h1>
						<p className="text-sm">
							Something went wrong. Please check your link.
						</p>
					</>
				)}
			</div>
		</div>
	);
}
