// src/pages/auth/OAuthFinalizePage.tsx
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import authApiClient from "@/api/auth/auth.api";
import { showError, showSuccess } from "@/components/shared/utils/toast.util";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function OAuthFinalizePage() {
	const navigate = useNavigate();
	const [name, setName] = useState("");
	const [role, setRole] = useState<"CLIENT" | "COACH">("CLIENT");
	const [loading, setLoading] = useState(false);
	const authApi = authApiClient.getInstance();

	useEffect(() => {
		// Prefill name from cookie via server-rendered template if needed (optional)
	}, []);

	const handleSubmit = async () => {
		if (!name.trim()) {
			showError("Please enter your name");
			return;
		}

		setLoading(true);
		try {
			await authApi.finalizeOAuth({ name, role });
			showSuccess("You're now registered!");
			navigate("/oauth-callback");
		} catch (err) {
			showError(err, "OAuth finalization failed");
			navigate("/login");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex flex-col items-center justify-center h-screen space-y-6 px-4">
			<h1 className="text-2xl font-semibold text-center">Finish Signing Up</h1>
			<p className="text-muted-foreground text-center">
				Choose your role and enter your name to continue.
			</p>

			<div className="w-full max-w-sm space-y-4">
				<Input
					placeholder="Your full name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					disabled={loading}
				/>

				<div className="space-y-2">
					<Label>Role</Label>
					<RadioGroup
						defaultValue="CLIENT"
						onValueChange={(val) => setRole(val as "CLIENT" | "COACH")}
					>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="CLIENT" id="r1" />
							<Label htmlFor="r1">Client</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="COACH" id="r2" />
							<Label htmlFor="r2">Coach</Label>
						</div>
					</RadioGroup>
				</div>

				<Button onClick={handleSubmit} disabled={loading} className="w-full">
					Complete Registration
				</Button>
			</div>
		</div>
	);
}
