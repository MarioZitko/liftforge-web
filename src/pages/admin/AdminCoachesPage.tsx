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
import { CoachWithDetailsDto, UpdateCoachDto } from "@/api/coach/coach.types";
import CoachesApiClient from "@/api/coach/coach.api";
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

interface CoachTableData {
	id: string;
	name: string | null;
	email: string;
	certification?: string | null;
	lookingForClients: boolean;
}

export default function AdminCoachesPage() {
	const coachesApi = CoachesApiClient.getInstance();

	const [query, setQuery] = useState<ServerQuery>({
		pageNumber: 1,
		pageSize: 10,
		searchText: "",
		orderByProperty: "name",
		ascending: true,
	});

	const [coaches, setCoaches] = useState<CoachTableData[]>([]);
	const [loading, setLoading] = useState(false);
	const [coachToDelete, setCoachToDelete] = useState<CoachTableData | null>(
		null
	);

	const fetchCoaches = () => {
		setLoading(true);
		coachesApi
			.getAll()
			.then((allCoaches: CoachWithDetailsDto[]) => {
				const transformedCoaches: CoachTableData[] = allCoaches.map(
					(coach) => ({
						id: coach.id,
						name: coach.user.name,
						email: coach.user.email,
						certification: coach.certification,
						lookingForClients: coach.lookingForClients,
					})
				);
				setCoaches(transformedCoaches);
			})
			.catch((error) => showError(error, "Failed to fetch coaches"))
			.finally(() => setLoading(false));
	};

	useEffect(fetchCoaches, []);

	const handleDelete = async (id: string) => {
		try {
			await coachesApi.delete(id);
			showSuccess("Coach deleted");
			fetchCoaches();
		} catch {
			showError("Failed to delete coach");
		}
	};

	const handleToggleLookingForClients = async (
		coachId: string,
		checked: boolean
	) => {
		try {
			const updateData: UpdateCoachDto = { lookingForClients: checked };
			await coachesApi.update(coachId, updateData);
			showSuccess("Coach status updated successfully.");
			fetchCoaches(); // Re-fetch to update the table
		} catch (error) {
			showError(error, "Failed to update coach status.");
		}
	};

	const filtered = coaches.filter(
		(c) =>
			(c.name ?? "")
				.toLowerCase()
				.includes((query.searchText ?? "").toLowerCase()) ||
			c.email.toLowerCase().includes((query.searchText ?? "").toLowerCase())
	);

	const sorted = [...filtered].sort((a, b) => {
		const key = query.orderByProperty as keyof CoachTableData;
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

	const columns: Column<CoachTableData>[] = [
		{ key: "name", label: "Name", sortable: true },
		{ key: "email", label: "Email", sortable: true },
		{ key: "certification", label: "Certification" },
		{
			key: "lookingForClients",
			label: "Looking for Clients",
			render: (coach) => (
				<div className="flex items-center space-x-2">
					<Switch
						id={`looking-for-clients-${coach.id}`}
						checked={coach.lookingForClients}
						onCheckedChange={(checked) =>
							handleToggleLookingForClients(coach.id, checked)
						}
					/>
					<Label htmlFor={`looking-for-clients-${coach.id}`}>
						{coach.lookingForClients ? "Yes" : "No"}
					</Label>
				</div>
			),
		},
		{
			key: "id",
			label: "Actions",
			render: (coach) => (
				<div className="flex gap-2">
					{/* Edit functionality can be added here if needed */}
					<Button
						variant="destructive"
						size="sm"
						onClick={() => setCoachToDelete(coach)}
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
				<h1 className="text-2xl font-bold">Coach Administration</h1>

				<Card>
					<CardHeader className="flex flex-col items-center text-center">
						<div>
							<CardTitle>All Coaches</CardTitle>
							<CardDescription>Manage registered coaches</CardDescription>
						</div>
					</CardHeader>
					<CardContent>
						<ServerTable<CoachTableData>
							data={paged}
							columns={columns}
							totalCount={filtered.length}
							loading={loading}
							query={query}
							setQuery={setQuery}
							getRowId={(row) => row.id}
							// onCreate={() => { /* Add create coach functionality if needed */ }}
							// createLabel="Create Coach"
						/>
					</CardContent>
				</Card>
			</div>

			{coachToDelete && (
				<AlertDialog
					open={!!coachToDelete}
					onOpenChange={() => setCoachToDelete(null)}
				>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>
								Delete coach "{coachToDelete?.name}"?
							</AlertDialogTitle>
							<AlertDialogDescription>
								This action cannot be undone. The coach and their data will be
								permanently deleted.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel onClick={() => setCoachToDelete(null)}>
								Cancel
							</AlertDialogCancel>
							<AlertDialogAction
								onClick={async () => {
									if (coachToDelete) {
										await handleDelete(coachToDelete.id);
										setCoachToDelete(null);
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
