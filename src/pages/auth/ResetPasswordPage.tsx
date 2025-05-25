import { useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import AuthApiClient from "@/api/auth/auth.api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
} from "@/components/ui/form";
import { showError, showSuccess } from "@/components/shared/utils/toast.util";

const schema = z.object({
	newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export default function ResetPasswordPage() {
	const [params] = useSearchParams();
	const navigate = useNavigate();
	const token = params.get("token");

	const form = useForm<{ newPassword: string }>({
		resolver: zodResolver(schema),
		defaultValues: { newPassword: "" },
	});

	const handleSubmit = async (data: { newPassword: string }) => {
		if (!token) {
			showError("Reset token is missing.");
			return;
		}

		try {
			const api = AuthApiClient.getInstance();
			await api.resetPassword({ token, newPassword: data.newPassword });
			showSuccess("Password reset successfully.");
			navigate("/login");
		} catch (err) {
			showError(err, "Reset failed");
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center px-4">
			<div className="w-full max-w-md border border-border rounded-lg shadow-md p-8 bg-card space-y-6">
				<h1 className="text-2xl font-bold text-center">Set a new password</h1>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handleSubmit)}
						className="space-y-4"
					>
						<FormField
							control={form.control}
							name="newPassword"
							render={({ field }) => (
								<FormItem>
									<FormLabel>New Password</FormLabel>
									<FormControl>
										<Input type="password" placeholder="••••••••" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type="submit" className="w-full">
							Reset Password
						</Button>
					</form>
				</Form>
			</div>
		</div>
	);
}
