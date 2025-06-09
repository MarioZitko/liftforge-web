import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ServerTable } from "@/components/shared/DataTable/ServerTable";
import { useEffect, useState } from "react";
import { Column, ServerQuery } from "@/components/shared/DataTable/types";
import {
	ClientWithDetailsDto,
	UpdateClientDto,
} from "@/api/client/client.types";
import ClientsApiClient from "@/api/client/client.api";
import { showError, showSuccess } from "@/components/shared/utils/toast.util";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogFooter,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogCancel,
	AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ClientTableData {
	id: string;
	firstName: string | null;
	lastName: string | null;
	email: string;
	lookingForCoach: boolean;
}

export default function AdminClientsPage() {
	const clientsApi = ClientsApiClient.getInstance();

	const [query, setQuery] = useState<ServerQuery>({
		pageNumber: 1,
		pageSize: 10,
		searchText: "",
		orderByProperty: "firstName",
		ascending: true,
	});

	const [clients, setClients] = useState<ClientTableData[]>([]);
	const [loading, setLoading] = useState(false);
	const [clientToDelete, setClientToDelete] = useState<ClientTableData | null>(
		null
	);

	const fetchClients = () => {
		setLoading(true);
		clientsApi
			.getAll()
			.then((allClients: ClientWithDetailsDto[]) => {
				const transformedClients: ClientTableData[] = allClients.map(
					(client) => ({
						id: client.id,
						firstName: client.user.name?.split(" ")[0] ?? null,
						lastName: client.user.name?.split(" ")[1] ?? null,
						email: client.user.email,
						lookingForCoach: client.lookingForCoach,
					})
				);
				setClients(transformedClients);
			})
			.catch((error) => showError(error, "Failed to fetch clients"))
			.finally(() => setLoading(false));
	};

	useEffect(fetchClients, []);

	const handleDelete = async (id: string) => {
		try {
			await clientsApi.delete(id);
			showSuccess("Client deleted");
			fetchClients();
		} catch {
			showError("Failed to delete client");
		}
	};

	const handleToggleLookingForCoach = async (
		clientId: string,
		checked: boolean
	) => {
		try {
			const updateData: UpdateClientDto = { lookingForCoach: checked };
			await clientsApi.update(clientId, updateData);
			showSuccess("Client status updated successfully.");
			fetchClients(); // Re-fetch to update the table
		} catch (error) {
			showError(error, "Failed to update client status.");
		}
	};

	const filtered = clients.filter(
		(c) =>
			(c.firstName ?? "")
				.toLowerCase()
				.includes((query.searchText ?? "").toLowerCase()) ||
			(c.lastName ?? "")
				.toLowerCase()
				.includes((query.searchText ?? "").toLowerCase()) ||
			c.email.toLowerCase().includes((query.searchText ?? "").toLowerCase())
	);

	const sorted = [...filtered].sort((a, b) => {
		const key = query.orderByProperty as keyof ClientTableData;
		const valA = a[key] ?? "";
		const valB = b[key] ?? "";
		return query.ascending
			? String(valA).localeCompare(String(valB))
			: String(valB).localeCompare(String(valA));
	});

	const paged = sorted.slice(
		(query.pageNumber - 1) * query.pageSize,
		query.pageNumber * query.pageSize
	);

	const columns: Column<ClientTableData>[] = [
		{ key: "firstName", label: "First Name", sortable: true },
		{ key: "lastName", label: "Last Name", sortable: true },
		{ key: "email", label: "Email", sortable: true },
		{
			key: "lookingForCoach",
			label: "Looking for Coach",
			render: (client) => (
				<div className="flex items-center space-x-2">
					<Switch
						id={`looking-for-coach-${client.id}`}
						checked={client.lookingForCoach}
						onCheckedChange={(checked) =>
							handleToggleLookingForCoach(client.id, checked)
						}
					/>
					<Label htmlFor={`looking-for-coach-${client.id}`}>
						{client.lookingForCoach ? "Yes" : "No"}
					</Label>
				</div>
			),
		},
		{
			key: "id",
			label: "Actions",
			render: (client) => (
				<div className="flex gap-2">
					{/* Edit functionality can be added here if needed */}
					<Button
						variant="destructive"
						size="sm"
						onClick={() => setClientToDelete(client)}
					>
						Delete
					</Button>
				</div>
			),
		},
	];

	return (
		<>
			<div className="space-y-6 px-4 py-6 max-w-screen-xl mx-auto">
				<h1 className="text-2xl font-bold">Client Administration</h1>

				<Card>
					<CardHeader className="flex flex-col items-center text-center">
						<div>
							<CardTitle>All Clients</CardTitle>
							<CardDescription>Manage registered clients</CardDescription>
						</div>
					</CardHeader>
					<CardContent>
						<ServerTable<ClientTableData>
							data={paged}
							columns={columns}
							totalCount={filtered.length}
							loading={loading}
							query={query}
							setQuery={setQuery}
							getRowId={(row) => row.id}
							// onCreate={() => { /* Add create client functionality if needed */ }}
							// createLabel="Create Client"
						/>
					</CardContent>
				</Card>
			</div>

			{clientToDelete && (
				<AlertDialog
					open={!!clientToDelete}
					onOpenChange={() => setClientToDelete(null)}
				>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>
								Delete client "{clientToDelete?.firstName}{" "}
								{clientToDelete?.lastName}"?
							</AlertDialogTitle>
							<AlertDialogDescription>
								This action cannot be undone. The client and their data will be
								permanently deleted.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel onClick={() => setClientToDelete(null)}>
								Cancel
							</AlertDialogCancel>
							<AlertDialogAction
								onClick={async () => {
									if (clientToDelete) {
										await handleDelete(clientToDelete.id);
										setClientToDelete(null);
									}
								}}
							>
								Delete
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			)}
		</>
	);
}
