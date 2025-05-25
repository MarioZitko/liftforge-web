import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import AuthApiClient from "@/api/auth/auth.api";
import { showSuccess, showError } from "@/components/shared/utils/toast.util";

const schema = z.object({
	email: z.string().email(),
});

export default function RequestPasswordResetPage() {
	const form = useForm<{ email: string }>({
		resolver: zodResolver(schema),
		defaultValues: { email: "" },
	});

	const handleSubmit = async (data: { email: string }) => {
		try {
			const api = AuthApiClient.getInstance();
			await api.requestPasswordReset(data);
			showSuccess("Check your email for the password reset link.");
		} catch (err) {
			showError(err, "Request failed");
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center px-4">
			<div className="w-full max-w-md border border-border rounded-lg shadow-md p-8 bg-card space-y-6">
				<h1 className="text-2xl font-bold text-center">Reset your password</h1>
				<p className="text-sm text-muted-foreground text-center">
					Enter your email and we'll send you a reset link.
				</p>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handleSubmit)}
						className="space-y-4"
					>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input
											type="email"
											placeholder="you@example.com"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type="submit" className="w-full">
							Send Reset Link
						</Button>
					</form>
				</Form>
			</div>
		</div>
	);
}
