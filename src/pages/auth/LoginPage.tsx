import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";

// UI
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { showError, showSuccess } from "@/components/shared/utils/toast.util";
import OAuthButtons from "@/components/shared/Auth/OAuthButtons";

// Schema
const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
	const { login } = useAuth();
	const navigate = useNavigate();
	const form = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const onSubmit = async (data: LoginFormData) => {
		try {
			await login(data); // useAuth().login
			showSuccess("Login successful, redirecting to dashboard...");
			navigate("/dashboard");
		} catch (err) {
			showError(err, "Invalid credentials");
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-background px-4">
			<div className="w-full max-w-md border border-border rounded-lg shadow-md p-8 bg-card space-y-6">
				<h1 className="text-2xl font-bold text-center">Welcome back</h1>
				<p className="text-sm text-muted-foreground text-center">
					Sign in to your LiftForge account
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

						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Password</FormLabel>
									<FormControl>
										<Input type="password" placeholder="••••••••" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button type="submit" className={cn("w-full")}>
							Sign In
						</Button>
					</form>
				</Form>

				<OAuthButtons />

				<p className="text-xs text-muted-foreground text-center">
					Don’t have an account?{" "}
					<a href="/register" className="text-primary underline">
						Register here
					</a>
				</p>

				<p className="text-xs text-muted-foreground text-center">
					Haven’t received an email?{" "}
					<Link to="/verify-email" className="text-primary underline">
						Resend verification
					</Link>
				</p>
			</div>
		</div>
	);
}
