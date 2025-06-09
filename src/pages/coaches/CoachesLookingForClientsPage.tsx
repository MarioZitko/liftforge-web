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
import CoachesApiClient from "@/api/coach/coach.api";
import { CoachWithDetailsDto } from "@/api/coach/coach.types";

interface CoachTableData {
	id: string;
	name: string | null;
	email: string;
	clientCount: number;
}

export default function CoachesLookingForClientsPage() {
	const [query, setQuery] = useState<ServerQuery>({
		pageNumber: 1,
		pageSize: 10,
		searchText: "",
		orderByProperty: "name",
		ascending: true,
	});
	const [coaches, setCoaches] = useState<CoachTableData[]>([]);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		fetchCoaches();
	}, [query]);

	async function fetchCoaches() {
		try {
			setLoading(true);
			const availableCoaches: CoachWithDetailsDto[] =
				await CoachesApiClient.getInstance().getAvailableCoachesWithClientCount();

			const transformedCoaches: CoachTableData[] = availableCoaches.map(
				(coach) => ({
					id: coach.id,
					name: coach.user.name,
					email: coach.user.email,
					clientCount: coach._count.clients,
				})
			);
			setCoaches(transformedCoaches);
		} catch (error) {
			showError(error, "Failed to fetch available coaches.");
		} finally {
			setLoading(false);
		}
	}

	const filteredCoaches = coaches.filter(
		(coach) =>
			(coach.name ?? "")
				.toLowerCase()
				.includes(query.searchText?.toLowerCase() ?? "") ||
			coach.email.toLowerCase().includes(query.searchText?.toLowerCase() ?? "")
	);

	const sortedCoaches = [...filteredCoaches].sort((a, b) => {
		const key = query.orderByProperty as keyof CoachTableData;
		const valA = a[key] ?? "";
		const valB = b[key] ?? "";

		if (typeof valA === "number" && typeof valB === "number") {
			return query.ascending ? valA - valB : valB - valA;
		}
		return query.ascending
			? String(valA).localeCompare(String(valB))
			: String(valB).localeCompare(String(valA));
	});

	const pagedCoaches = sortedCoaches.slice(
		(query.pageNumber - 1) * query.pageSize,
		query.pageNumber * query.pageSize
	);

	const columns: Column<CoachTableData>[] = [
		{ key: "name", label: "Coach Name", sortable: true },
		{ key: "email", label: "Email", sortable: true },
		{ key: "clientCount", label: "Current Clients", sortable: true },
		{
			key: "id",
			label: "Status",
			render: () => <Badge variant="secondary">Looking for Clients</Badge>,
		},
	];

	return (
		<div className="space-y-6 px-4 py-6 max-w-screen-xl mx-auto">
			<h1 className="text-2xl font-bold">Coaches Looking for Clients</h1>

			<Card>
				<CardHeader className="flex flex-col items-center">
					<div className="text-center">
						<CardTitle>Coaches Looking for Clients</CardTitle>
						<CardDescription>
							View coaches who are actively seeking new clients.
						</CardDescription>
					</div>
				</CardHeader>
				<CardContent>
					<ServerTable<CoachTableData>
						data={pagedCoaches}
						columns={columns}
						totalCount={filteredCoaches.length}
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
