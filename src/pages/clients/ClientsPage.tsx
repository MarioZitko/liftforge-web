import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ServerTable } from "@/components/shared/DataTable/ServerTable";
import { useState } from "react";
import { Column, ServerQuery } from "@/components/shared/DataTable/types";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import CoachesApiClient from "@/api/coach/coach.api";
import { showSuccess, showError } from "@/components/shared/utils/toast.util";

interface Client {
	id: string;
	name: string;
	email: string;
	activeProgram: string | null;
	lastActivity: string;
	isVerified: boolean;
}

const mockClients: Client[] = [
	{
		id: "1",
		name: "John Smith",
		email: "john@example.com",
		activeProgram: "Power Hypertrophy Split",
		lastActivity: "2025-05-19",
		isVerified: true,
	},
	{
		id: "2",
		name: "Maria Gonzalez",
		email: "maria@example.com",
		activeProgram: null,
		lastActivity: "2025-05-10",
		isVerified: false,
	},
	{
		id: "3",
		name: "Tom Lee",
		email: "tom@example.com",
		activeProgram: "Full Body Beginner",
		lastActivity: "2025-05-20",
		isVerified: true,
	},
];

const inviteClientSchema = z.object({
	email: z.string().email("Invalid email address"),
});

type InviteClientFormValues = z.infer<typeof inviteClientSchema>;

export default function ClientsPage() {
	const [query, setQuery] = useState<ServerQuery>({
		pageNumber: 1,
		pageSize: 10,
		searchText: "",
		orderByProperty: "name",
		ascending: true,
	});

	const form = useForm<InviteClientFormValues>({
		resolver: zodResolver(inviteClientSchema),
		defaultValues: {
			email: "",
		},
	});

	async function handleInviteClient(values: InviteClientFormValues) {
		try {
			await CoachesApiClient.getInstance().inviteClient(values);
			showSuccess(`An invitation has been sent to ${values.email}.`);
			form.reset();
		} catch (error) {
			showError(error, "Failed to send invitation.");
		}
	}

	const filteredClients = mockClients.filter((client) =>
		client.name.toLowerCase().includes(query.searchText?.toLowerCase() ?? "")
	);

	const sortedClients = [...filteredClients].sort((a, b) => {
		const key = query.orderByProperty as keyof Client;
		const valA = a[key] ?? "";
		const valB = b[key] ?? "";

		return query.ascending
			? String(valA).localeCompare(String(valB))
			: String(valB).localeCompare(String(valA));
	});

	const pagedClients = sortedClients.slice(
		(query.pageNumber - 1) * query.pageSize,
		query.pageNumber * query.pageSize
	);

	const columns: Column<Client>[] = [
		{ key: "name", label: "Name", sortable: true },
		{ key: "email", label: "Email", sortable: true },
		{
			key: "activeProgram",
			label: "Program",
			render: (row) =>
				row.activeProgram ?? (
					<span className="italic text-muted-foreground">Unassigned</span>
				),
		},
		{ key: "lastActivity", label: "Last Activity", sortable: true },
		{
			key: "isVerified",
			label: "Verified",
			render: (row) => (
				<Badge variant={row.isVerified ? "default" : "destructive"}>
					{row.isVerified ? "Verified" : "Unverified"}
				</Badge>
			),
		},
		{
			key: "id",
			label: "Actions",
			render: () => (
				<Button size="sm" variant="outline">
					View
				</Button>
			),
		},
	];

	return (
		<div className="space-y-6 px-4 py-6 max-w-screen-xl mx-auto">
			<h1 className="text-2xl font-bold">Clients</h1>

			<Card>
				<CardHeader className="flex flex-col items-center">
					<div className="text-center">
						<CardTitle>All Clients</CardTitle>
						<CardDescription>
							View client activity, program status, and email verification.
						</CardDescription>
					</div>
					<Dialog>
						<DialogTrigger asChild>
							<Button className="mt-4">Invite Client</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-[425px]">
							<DialogHeader>
								<DialogTitle>Invite New Client</DialogTitle>
								<DialogDescription>
									Enter the email address of the client you want to invite.
								</DialogDescription>
							</DialogHeader>
							<form
								onSubmit={form.handleSubmit(handleInviteClient)}
								className="grid gap-4 py-4"
							>
								<div className="grid grid-cols-4 items-center gap-4">
									<Label htmlFor="email" className="text-right">
										Email
									</Label>
									<Input
										id="email"
										placeholder="client@example.com"
										className="col-span-3"
										{...form.register("email")}
									/>
									{form.formState.errors.email && (
										<p className="col-span-4 text-right text-sm text-red-500">
											{form.formState.errors.email.message}
										</p>
									)}
								</div>
								<DialogFooter>
									<Button type="submit" disabled={form.formState.isSubmitting}>
										{form.formState.isSubmitting
											? "Inviting..."
											: "Send Invitation"}
									</Button>
								</DialogFooter>
							</form>
						</DialogContent>
					</Dialog>
				</CardHeader>
				<CardContent>
					<ServerTable<Client>
						data={pagedClients}
						columns={columns}
						totalCount={filteredClients.length}
						loading={false}
						query={query}
						setQuery={setQuery}
						getRowId={(row) => row.id}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
