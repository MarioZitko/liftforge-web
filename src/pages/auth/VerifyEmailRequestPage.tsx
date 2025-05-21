import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { showError, showSuccess } from "@/components/shared/utils/toast.util";
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

const schema = z.object({
	email: z.string().email(),
});

type FormData = z.infer<typeof schema>;

export default function VerifyEmailRequestPage() {
	const form = useForm<FormData>({
		resolver: zodResolver(schema),
		defaultValues: { email: "" },
	});

	const onSubmit = async (data: FormData) => {
		try {
			const authApi = AuthApiClient.getInstance();
			await authApi.requestEmailVerification(data);
			showSuccess("Verification email sent, Please check your inbox.");
		} catch (err) {
			showError(err, "Failed to send verification email.");
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center px-4">
			<div className="max-w-md w-full space-y-6 p-6 border border-border rounded-lg bg-card shadow">
				<h1 className="text-2xl font-bold text-center">
					Resend Verification Email
				</h1>
				<p className="text-sm text-muted-foreground text-center">
					Enter your email to receive a new verification link.
				</p>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input placeholder="you@example.com" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button type="submit" className="w-full">
							Send Verification Email
						</Button>
					</form>
				</Form>
			</div>
		</div>
	);
}
