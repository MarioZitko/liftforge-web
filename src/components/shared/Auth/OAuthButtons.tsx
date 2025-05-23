// src/components/auth/OAuthButtons.tsx
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";

export default function OAuthButtons() {
	const baseUrl = import.meta.env.VITE_API_BASE_URL;

	return (
		<div className="space-y-2">
			<Button
				variant="outline"
				className="w-full flex items-center justify-center gap-2"
				onClick={() => (window.location.href = `${baseUrl}/auth/google`)}
			>
				<FcGoogle className="text-xl" />
				<span>Continue with Google</span>
			</Button>

			<Button
				variant="outline"
				className="w-full flex items-center justify-center gap-2"
				onClick={() => (window.location.href = `${baseUrl}/auth/facebook`)}
			>
				<FaFacebook className="text-xl text-[#1877f2]" />
				<span>Continue with Facebook</span>
			</Button>
		</div>
	);
}
