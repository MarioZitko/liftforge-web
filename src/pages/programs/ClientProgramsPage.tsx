import ClientProgramApiClient from "@/api/client-program/client-program.api";
import { ClientProgramAssignment } from "@/api/client-program/client-program.types";
import { ServerTable } from "@/components/shared/DataTable/ServerTable";
import {
	Column,
	ServerQuery,
} from "@/components/shared/DataTable/types";
import { showError } from "@/components/shared/utils/toast.util";
import { statusBadgeVariant } from "@/lib/program-utils";
import { formatDateMedium } from "@/lib/date";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface MyProgramRow {
	id: number;
	programId: number;
	name: string;
	programName: string;
	description: string;
	startDate: string;
	endDate: string;
	status: string;
}


export default function ClientProgramsPage() {
	const navigate = useNavigate();
	const [rows, setRows] = useState<MyProgramRow[]>([]);
	const [loading, setLoading] = useState(true);

	const [query, setQuery] = useState<ServerQuery>({
		pageNumber: 1,
		pageSize: 10,
		searchText: "",
		orderByProperty: "name",
		ascending: true,
	});

	useEffect(() => {
		fetchPrograms();
	}, []);

	async function fetchPrograms() {
		try {
			setLoading(true);
			const assignments: ClientProgramAssignment[] =
				await ClientProgramApiClient.getInstance().getMyClientPrograms();

			const mapped: MyProgramRow[] = assignments.map((a) => ({
				id: a.id,
				programId: a.programId,
				name: a.name,
				programName: a.program?.name ?? "—",
				description: a.program?.description ?? "",
				startDate: a.startDate,
				endDate: a.endDate,
				status: a.status,
			}));
			setRows(mapped);
		} catch (err) {
			showError(err, "Failed to load your programs.");
		} finally {
			setLoading(false);
		}
	}

	const searched = rows.filter((r) =>
		r.name.toLowerCase().includes(query.searchText?.toLowerCase() ?? "")
	);

	const sorted = [...searched].sort((a, b) => {
		const key = query.orderByProperty as keyof MyProgramRow;
		const va = String(a[key] ?? "");
		const vb = String(b[key] ?? "");
		return query.ascending ? va.localeCompare(vb) : vb.localeCompare(va);
	});

	const paged = sorted.slice(
		(query.pageNumber - 1) * query.pageSize,
		query.pageNumber * query.pageSize
	);

	const columns: Column<MyProgramRow>[] = [
		{ key: "name", label: "Assignment Name", sortable: true },
		{ key: "programName", label: "Program", sortable: true },
		{
			key: "description",
			label: "Description",
			render: (row) =>
				row.description ? (
					<span className="text-sm">{row.description}</span>
				) : (
					<span className="text-muted-foreground italic text-sm">—</span>
				),
		},
		{
			key: "startDate",
			label: "Start Date",
			sortable: true,
			render: (row) => formatDateMedium(row.startDate),
		},
		{
			key: "endDate",
			label: "End Date",
			sortable: true,
			render: (row) => formatDateMedium(row.endDate),
		},
		{
			key: "status",
			label: "Status",
			render: (row) => (
				<Badge variant={statusBadgeVariant(row.status)}>
					{row.status.charAt(0).toUpperCase() + row.status.slice(1)}
				</Badge>
			),
		},
		{
			key: "id",
			label: "",
			render: (row) => (
				<Button
					size="sm"
					variant="default"
					onClick={() => navigate(`/my-programs/${row.programId}`)}
				>
					View
				</Button>
			),
		},
	];

	return (
		<div className="space-y-6 px-4 py-6 max-w-screen-xl mx-auto">
			<h1 className="text-2xl font-bold">My Programs</h1>

			<Card>
				<CardHeader>
					<CardTitle>Assigned Programs</CardTitle>
					<CardDescription>
						Programs assigned to you by your coach.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ServerTable<MyProgramRow>
						data={paged}
						columns={columns}
						totalCount={searched.length}
						loading={loading}
						query={query}
						setQuery={setQuery}
						getRowId={(row) => String(row.id)}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
