import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	FormControl,
} from "@/components/ui/form";
import UsersApiClient from "@/api/users/users.api";
import { showError, showSuccess } from "@/components/shared/utils/toast.util";
import { useEffect } from "react";
import {
	CreateUserDto,
	UpdateUserDto,
	FormUserData,
} from "@/api/users/users.types";
import { IAdminUsersPageProps } from "./types";

const schema = z.object({
	email: z.string().email(),
	name: z.string().optional(),
	password: z.string().min(6).optional(),
	role: z.enum(["CLIENT", "COACH", "ADMIN"]),
});

export default function UserFormModal({
	open,
	onClose,
	onSuccess,
	user,
}: IAdminUsersPageProps) {
	const usersApi = UsersApiClient.getInstance();

	const form = useForm<FormUserData>({
		resolver: zodResolver(schema),
		defaultValues: {
			email: "",
			name: "",
			password: "",
			role: "CLIENT",
		},
	});

	// 🧠 Reset form when editing a new user
	useEffect(() => {
		form.reset({
			email: user?.email ?? "",
			name: user?.name ?? "",
			password: "",
			role: user?.role ?? "CLIENT",
		});
	}, [user, form]);

	const handleSubmit = async (data: FormUserData) => {
		try {
			if (user) {
				const updateData: UpdateUserDto = {
					email: data.email,
					name: data.name,
					role: data.role,
					password: data.password || undefined,
				};
				await usersApi.update(user.id, updateData);
				showSuccess("User updated");
			} else {
				const createData: CreateUserDto = {
					email: data.email,
					name: data.name,
					role: data.role,
					password: data.password!,
				};
				await usersApi.create(createData);
				showSuccess("User created");
			}
			onSuccess();
		} catch {
			showError("Failed to save user");
		}
	};

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{user ? "Edit User" : "Create User"}</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handleSubmit)}
						className="space-y-4"
					>
						<FormField
							name="email"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							name="name"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{!user && (
							<FormField
								name="password"
								control={form.control}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Password</FormLabel>
										<FormControl>
											<Input type="password" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}

						<FormField
							name="role"
							control={form.control}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Role</FormLabel>
									<FormControl>
										<select
											className="w-full rounded border border-input bg-background text-foreground px-2 py-2"
											{...field}
										>
											<option value="CLIENT">Client</option>
											<option value="COACH">Coach</option>
											<option value="ADMIN">Admin</option>
										</select>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button type="submit" className="w-full">
							{user ? "Update" : "Create"}
						</Button>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
