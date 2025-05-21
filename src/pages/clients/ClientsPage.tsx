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

export default function ClientsPage() {
	const [query, setQuery] = useState<ServerQuery>({
		pageNumber: 1,
		pageSize: 10,
		searchText: "",
		orderByProperty: "name",
		ascending: true,
	});

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
				<CardHeader>
					<CardTitle>All Clients</CardTitle>
					<CardDescription>
						View client activity, program status, and email verification.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ServerTable
						data={pagedClients}
						columns={columns}
						totalCount={filteredClients.length}
						loading={false}
						query={query}
						setQuery={setQuery}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
