import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ServerTable } from "@/components/shared/DataTable/ServerTable";
import { useEffect, useState } from "react";
import { Column, ServerQuery } from "@/components/shared/DataTable/types";
import { showError } from "@/components/shared/utils/toast.util";
import ClientsApiClient from "@/api/client/client.api";
import { Client } from "@/api/client/client.types";

interface ClientTableData {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	lookingForCoach: boolean;
}

export default function ClientsLookingForCoachPage() {
	const [query, setQuery] = useState<ServerQuery>({
		pageNumber: 1,
		pageSize: 10,
		searchText: "",
		orderByProperty: "firstName",
		ascending: true,
	});
	const [clients, setClients] = useState<ClientTableData[]>([]);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		fetchClients();
	}, [query]);

	async function fetchClients() {
		try {
			setLoading(true);
			const allClients: Client[] =
				await ClientsApiClient.getInstance().getAll();
			const filteredClients = allClients.filter(
				(client) =>
					client.lookingForCoach === true ||
					client.lookingForCoach === undefined
			);

			const transformedClients: ClientTableData[] = filteredClients.map(
				(client) => ({
					id: client.id,
					firstName: client.user?.name?.split(" ")[0] || "N/A",
					lastName: client.user?.name?.split(" ")[1] || "N/A",
					email: client.user?.email || "N/A",
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

	const filteredClients = clients.filter(
		(client) =>
			client.firstName
				.toLowerCase()
				.includes(query.searchText?.toLowerCase() ?? "") ||
			client.lastName
				.toLowerCase()
				.includes(query.searchText?.toLowerCase() ?? "") ||
			client.email.toLowerCase().includes(query.searchText?.toLowerCase() ?? "")
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
		{ key: "firstName", label: "First Name", sortable: true },
		{ key: "lastName", label: "Last Name", sortable: true },
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
	];

	return (
		<div className="space-y-6 px-4 py-6 max-w-screen-xl mx-auto">
			<h1 className="text-2xl font-bold">Clients Looking for a Coach</h1>

			<Card>
				<CardHeader className="flex flex-col items-center">
					<div className="text-center">
						<CardTitle>Clients Looking for a Coach</CardTitle>
						<CardDescription>
							View clients who are actively seeking a coach.
						</CardDescription>
					</div>
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
