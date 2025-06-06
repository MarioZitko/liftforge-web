import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useSearchParams } from "react-router-dom";

// API
import AuthApiClient from "@/api/auth/auth.api";

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
import { Switch } from "@/components/ui/switch";
import { showError, showSuccess } from "@/components/shared/utils/toast.util";

// Validation schema
const registerSchema = z.object({
	name: z.string().min(2),
	firstName: z.string().min(2),
	lastName: z.string().min(2),
	email: z.string().email(),
	password: z.string().min(6),
	role: z.enum(["COACH", "CLIENT"]),
	inviteToken: z.string().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const inviteToken = searchParams.get("inviteToken") || undefined;
	const emailFromQuery = searchParams.get("email") || "";

	const form = useForm<RegisterFormData>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			name: "",
			firstName: "",
			lastName: "",
			email: emailFromQuery,
			password: "",
			role: "CLIENT",
			inviteToken,
		},
	});

	useEffect(() => {
		if (inviteToken) {
			form.setValue("email", emailFromQuery);
			form.setValue("role", "CLIENT");
			form.setValue("inviteToken", inviteToken);
		}
	}, [inviteToken, emailFromQuery, form]);

	const onSubmit = async (data: RegisterFormData) => {
		try {
			const authApi = AuthApiClient.getInstance();
			await authApi.register(data);
			showSuccess("Registration successful, Confirm your email to log in.");
			navigate("/login");
		} catch (err) {
			showError(err, "Registration failed");
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-background px-4">
			<div className="w-full max-w-md border border-border rounded-lg shadow-md p-8 bg-card space-y-6">
				<h1 className="text-2xl font-bold text-center">Create your account</h1>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Username</FormLabel>
									<FormControl>
										<Input placeholder="username123" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="firstName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>First Name</FormLabel>
									<FormControl>
										<Input placeholder="John" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="lastName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Last Name</FormLabel>
									<FormControl>
										<Input placeholder="Doe" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

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
											disabled={!!inviteToken}
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

						<FormField
							control={form.control}
							name="role"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Role</FormLabel>
									<FormControl>
										<div className="flex items-center space-x-4">
											<FormLabel className="text-sm font-medium">
												Coach
											</FormLabel>
											<Switch
												checked={field.value === "CLIENT"}
												onCheckedChange={(checked) =>
													field.onChange(checked ? "CLIENT" : "COACH")
												}
												disabled={!!inviteToken}
											/>
											<FormLabel className="text-sm font-medium">
												Client
											</FormLabel>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button type="submit" className={cn("w-full")}>
							Register
						</Button>
					</form>
				</Form>

				<p className="text-xs text-muted-foreground text-center">
					Already have an account?{" "}
					<a href="/login" className="text-primary underline">
						Log in here
					</a>
				</p>
			</div>
		</div>
	);
}
