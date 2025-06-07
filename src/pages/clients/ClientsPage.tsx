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
import { useEffect, useState } from "react";
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
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import CoachesApiClient from "@/api/coach/coach.api";
import { showSuccess, showError } from "@/components/shared/utils/toast.util";
import ClientsApiClient from "@/api/client/client.api";
import { Client } from "@/api/client/client.types";

interface ClientTableData {
	id: string;
	name: string;
	email: string;
	activeProgram: string | null;
	lastActivity: string;
	isVerified: boolean;
	lookingForCoach: boolean;
}

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
	const [clients, setClients] = useState<ClientTableData[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [clientToDelete, setClientToDelete] = useState<string | null>(null);
	const [showInviteClientDialog, setShowInviteClientDialog] = useState(false);
	const [showViewClientDialog, setShowViewClientDialog] = useState(false);

	useEffect(() => {
		fetchClients();
	}, [query]);

	async function fetchClients() {
		try {
			setLoading(true);
			const fetchedClients: Client[] =
				await ClientsApiClient.getInstance().getAll();

			const transformedClients: ClientTableData[] = fetchedClients.map(
				(client) => ({
					id: client.id,
					name: client.user?.name || "N/A",
					email: client.user?.email || "N/A",
					activeProgram: null, // Placeholder: Need active program from API
					lastActivity: "", // Placeholder: Need last activity from API
					isVerified: client.user?.emailVerified || false,
					lookingForCoach: client.lookingForCoach ?? true,
				})
			);
			setClients(transformedClients);
		} catch (error) {
			showError(error, "Failed to fetch clients.");
		} finally {
			setLoading(false);
		}
	}

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
			setShowInviteClientDialog(false); // Close the dialog on successful invitation
			await fetchClients(); // Refresh client list after inviting a new client
		} catch (error) {
			showError(error, "Failed to send invitation.");
		}
	}

	async function confirmDeleteClient() {
		if (clientToDelete) {
			try {
				await ClientsApiClient.getInstance().delete(clientToDelete);
				showSuccess("Client deleted successfully.");
				await fetchClients(); // Refresh client list after deleting
			} catch (error) {
				showError(error, "Failed to delete client.");
			} finally {
				setClientToDelete(null);
				setShowDeleteConfirm(false);
			}
		}
	}

	const filteredClients = clients.filter((client) =>
		client.name.toLowerCase().includes(query.searchText?.toLowerCase() ?? "")
	);

	const sortedClients = [...filteredClients].sort((a, b) => {
		const key = query.orderByProperty as keyof ClientTableData;
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

	const columns: Column<ClientTableData>[] = [
		{ key: "name", label: "Name", sortable: true },
		{ key: "email", label: "Email", sortable: true },
		{
			key: "lookingForCoach",
			label: "Status",
			render: (row) => (
				<Badge variant={row.lookingForCoach ? "secondary" : "default"}>
					{row.lookingForCoach ? "Looking for Coach" : "Assigned"}
				</Badge>
			),
		},
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
			render: (row) => (
				<div className="flex space-x-2">
					<Dialog
						open={showViewClientDialog}
						onOpenChange={setShowViewClientDialog}
					>
						<DialogTrigger asChild>
							<Button
								size="sm"
								variant="outline"
								onClick={() => setShowViewClientDialog(true)}
							>
								View
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-[600px]">
							<DialogHeader>
								<DialogTitle>Client Details: {row.name}</DialogTitle>
								<DialogDescription>
									View client programs and training history.
								</DialogDescription>
							</DialogHeader>
							<div className="py-4">
								<p>Email: {row.email}</p>
								<p>Verified: {row.isVerified ? "Yes" : "No"}</p>
								<h3 className="text-lg font-semibold mt-4">Programs</h3>
								<p className="text-muted-foreground">
									No programs assigned yet.
								</p>
								<h3 className="text-lg font-semibold mt-4">Trainings</h3>
								<p className="text-muted-foreground">
									No training history available.
								</p>
							</div>
							<DialogFooter>
								<Button
									type="button"
									onClick={() => setShowViewClientDialog(false)}
								>
									Close
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
					<AlertDialog
						open={showDeleteConfirm}
						onOpenChange={setShowDeleteConfirm}
					>
						<AlertDialogTrigger asChild>
							<Button
								size="sm"
								variant="destructive"
								onClick={() => {
									setClientToDelete(row.id);
									setShowDeleteConfirm(true);
								}}
							>
								Delete
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
								<AlertDialogDescription>
									This action cannot be undone. This will permanently delete the
									client and remove their data from our servers.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction onClick={confirmDeleteClient}>
									Continue
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
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
					<Dialog
						open={showInviteClientDialog}
						onOpenChange={setShowInviteClientDialog}
					>
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
					<ServerTable<ClientTableData>
						data={pagedClients}
						columns={columns}
						totalCount={filteredClients.length}
						loading={loading}
						query={query}
						setQuery={setQuery}
						getRowId={(row) => row.id}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
