import ClientProgramApiClient from "@/api/client-program/client-program.api";
import { ClientProgramAssignment } from "@/api/client-program/client-program.types";
import ClientsApiClient from "@/api/client/client.api";
import { Client } from "@/api/client/client.types";
import ProgramsApiClient from "@/api/programs/programs.api";
import { Program } from "@/api/programs/programs.types";
import { useNavigate } from "react-router-dom";
import { ServerTable } from "@/components/shared/DataTable/ServerTable";
import {
	Column,
	ServerQuery,
} from "@/components/shared/DataTable/types";
import { showError, showSuccess } from "@/components/shared/utils/toast.util";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCoachStore } from "@/store/coachStore";
import { useUserStore } from "@/store/userStore";
import { statusBadgeVariant } from "@/lib/program-utils";
import { todayIso } from "@/lib/date";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

interface ProgramRow {
	id: number;
	name: string;
	description: string;
	isPublic: boolean;
	assignedClientName: string;
	status: string;
	assignment?: ClientProgramAssignment;
}

const programSchema = z.object({
	name: z.string().min(1, "Name is required"),
	description: z.string().optional(),
	isPublic: z.boolean().optional(),
});

const assignSchema = z.object({
	clientId: z.string().min(1, "Client is required"),
	name: z.string().min(1, "Assignment name is required"),
	startDate: z.string().min(1, "Start date is required"),
	endDate: z.string().min(1, "End date is required"),
	status: z.enum(["active", "completed", "draft"]),
});

type ProgramFormValues = z.infer<typeof programSchema>;
type AssignFormValues = z.infer<typeof assignSchema>;


export default function CoachProgramsPage() {
	const user = useUserStore((s) => s.user);
	const { coach, fetchCoach } = useCoachStore();
	const navigate = useNavigate();

	const [programs, setPrograms] = useState<Program[]>([]);
	const [assignments, setAssignments] = useState<ClientProgramAssignment[]>([]);
	const [clients, setClients] = useState<Client[]>([]);
	const [loading, setLoading] = useState(true);

	const [filterClientId, setFilterClientId] = useState<string>("all");

	const [query, setQuery] = useState<ServerQuery>({
		pageNumber: 1,
		pageSize: 10,
		searchText: "",
		orderByProperty: "name",
		ascending: true,
	});

	// Program create/edit dialog
	const [programDialogOpen, setProgramDialogOpen] = useState(false);
	const [editingProgram, setEditingProgram] = useState<Program | null>(null);

	// Assign dialog
	const [assignDialogOpen, setAssignDialogOpen] = useState(false);
	const [assigningProgram, setAssigningProgram] = useState<ProgramRow | null>(null);

	// Delete confirmation
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [deletingRow, setDeletingRow] = useState<ProgramRow | null>(null);

	const programForm = useForm<ProgramFormValues>({
		resolver: zodResolver(programSchema),
		defaultValues: { name: "", description: "", isPublic: false },
	});

	const assignForm = useForm<AssignFormValues>({
		resolver: zodResolver(assignSchema),
		defaultValues: {
			clientId: "",
			name: "",
			startDate: todayIso(),
			endDate: "",
			status: "draft",
		},
	});

	useEffect(() => {
		if (user?.userId && !coach) {
			fetchCoach(user.userId).catch(() => {});
		}
	}, [user?.userId]);

	useEffect(() => {
		fetchAll();
	}, []);

	async function fetchAll() {
		setLoading(true);
		try {
			const all = await ProgramsApiClient.getInstance().getAll();
			const mine = all.filter((p) => p.createdById === user?.userId);
			setPrograms(mine);
		} catch (err) {
			showError(err, "Failed to load programs.");
		}
		try {
			const assigns = await ClientProgramApiClient.getInstance().getMyCoachPrograms();
			setAssignments(assigns);
		} catch {
			// non-fatal — assignments will just be empty
		}
		try {
			const cls = await ClientsApiClient.getInstance().getAll();
			setClients(cls);
		} catch {
			// non-fatal — client filter / assign dropdown will be empty
		}
		setLoading(false);
	}

	// Merge programs with their assignment info
	const programRows: ProgramRow[] = programs.map((p) => {
		const assignment = assignments.find((a) => a.programId === p.id);
		return {
			id: p.id,
			name: p.name,
			description: p.description ?? "",
			isPublic: p.isPublic,
			assignedClientName: assignment?.client?.user?.name ?? "—",
			status: assignment?.status ?? "unassigned",
			assignment,
		};
	});

	// Client filter
	const filteredRows =
		filterClientId === "all"
			? programRows
			: filterClientId === "unassigned"
			? programRows.filter((r) => !r.assignment)
			: programRows.filter((r) => r.assignment?.clientId === filterClientId);

	// Search
	const searched = filteredRows.filter((r) =>
		r.name.toLowerCase().includes(query.searchText?.toLowerCase() ?? "")
	);

	// Sort
	const sorted = [...searched].sort((a, b) => {
		const key = query.orderByProperty as keyof ProgramRow;
		const va = String(a[key] ?? "");
		const vb = String(b[key] ?? "");
		return query.ascending ? va.localeCompare(vb) : vb.localeCompare(va);
	});

	// Paginate
	const paged = sorted.slice(
		(query.pageNumber - 1) * query.pageSize,
		query.pageNumber * query.pageSize
	);

	// ── Program create / edit ──────────────────────────────────────────────────

	function openCreateProgram() {
		setEditingProgram(null);
		programForm.reset({ name: "", description: "", isPublic: false });
		setProgramDialogOpen(true);
	}

	function openEditProgram(row: ProgramRow) {
		const program = programs.find((p) => p.id === row.id)!;
		setEditingProgram(program);
		programForm.reset({
			name: program.name,
			description: program.description ?? "",
			isPublic: program.isPublic,
		});
		setProgramDialogOpen(true);
	}

	async function handleSaveProgram(values: ProgramFormValues) {
		try {
			if (editingProgram) {
				await ProgramsApiClient.getInstance().update(editingProgram.id, values);
				showSuccess("Program updated.");
			} else {
				await ProgramsApiClient.getInstance().create(values);
				showSuccess("Program created.");
			}
			setProgramDialogOpen(false);
			await fetchAll();
		} catch (err) {
			showError(err, "Failed to save program.");
		}
	}

	// ── Assign dialog ──────────────────────────────────────────────────────────

	function openAssign(row: ProgramRow) {
		setAssigningProgram(row);
		assignForm.reset({
			clientId: row.assignment?.clientId ?? "",
			name: row.name,
			startDate: row.assignment?.startDate?.split("T")[0] ?? todayIso(),
			endDate: row.assignment?.endDate?.split("T")[0] ?? "",
			status: (row.assignment?.status as AssignFormValues["status"]) ?? "draft",
		});
		setAssignDialogOpen(true);
	}

	async function handleAssign(values: AssignFormValues) {
		if (!assigningProgram) return;
		try {
			const toISO = (d: string) => new Date(d + "T00:00:00.000Z").toISOString();

		if (assigningProgram.assignment) {
				await ClientProgramApiClient.getInstance().update(
					assigningProgram.assignment.id,
					{
						clientId: values.clientId,
						name: values.name,
						startDate: toISO(values.startDate),
						endDate: toISO(values.endDate),
						status: values.status,
					}
				);
				showSuccess("Assignment updated.");
			} else {
				await ClientProgramApiClient.getInstance().create({
					clientId: values.clientId,
					name: values.name,
					programId: assigningProgram.id,
					startDate: toISO(values.startDate),
					endDate: toISO(values.endDate),
					status: values.status,
					coachId: coach?.id,
				});
				showSuccess("Program assigned to client.");
			}
			setAssignDialogOpen(false);
			await fetchAll();
		} catch (err) {
			showError(err, "Failed to assign program.");
		}
	}

	// ── Delete ─────────────────────────────────────────────────────────────────

	function openDelete(row: ProgramRow) {
		setDeletingRow(row);
		setDeleteDialogOpen(true);
	}

	async function confirmDelete() {
		if (!deletingRow) return;
		try {
			// Remove assignment first if one exists (FK constraint)
			if (deletingRow.assignment) {
				await ClientProgramApiClient.getInstance().delete(
					deletingRow.assignment.id
				);
			}
			await ProgramsApiClient.getInstance().delete(deletingRow.id);
			showSuccess("Program deleted.");
			await fetchAll();
		} catch (err) {
			showError(err, "Failed to delete program.");
		} finally {
			setDeleteDialogOpen(false);
			setDeletingRow(null);
		}
	}

	// ── Table columns ──────────────────────────────────────────────────────────

	const columns: Column<ProgramRow>[] = [
		{ key: "name", label: "Name", sortable: true },
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
			key: "isPublic",
			label: "Public",
			render: (row) => (
				<Badge variant={row.isPublic ? "default" : "outline"}>
					{row.isPublic ? "Public" : "Private"}
				</Badge>
			),
		},
		{
			key: "assignedClientName",
			label: "Assigned To",
			sortable: true,
			render: (row) =>
				row.assignment ? (
					<span className="text-sm font-medium">{row.assignedClientName}</span>
				) : (
					<span className="text-muted-foreground italic text-sm">Unassigned</span>
				),
		},
		{
			key: "status",
			label: "Status",
			render: (row) =>
				row.status === "unassigned" ? (
					<Badge variant="outline">Unassigned</Badge>
				) : (
					<Badge variant={statusBadgeVariant(row.status)}>
						{row.status.charAt(0).toUpperCase() + row.status.slice(1)}
					</Badge>
				),
		},
		{
			key: "id",
			label: "Actions",
			render: (row) => (
				<div className="flex gap-2 flex-wrap">
					<Button
						size="sm"
						variant="default"
						onClick={() => navigate(`/programs/${row.id}`)}
					>
						View
					</Button>
					<Button size="sm" variant="outline" onClick={() => openEditProgram(row)}>
						Edit
					</Button>
					<Button
						size="sm"
						variant={row.assignment ? "secondary" : "outline"}
						onClick={() => openAssign(row)}
					>
						{row.assignment ? "Edit Assignment" : "Assign"}
					</Button>
					<Button
						size="sm"
						variant="destructive"
						onClick={() => openDelete(row)}
					>
						Delete
					</Button>
				</div>
			),
		},
	];

	// ── Client filter options ──────────────────────────────────────────────────

	const assignedClientIds = new Set(assignments.map((a) => a.clientId));
	const assignedClients = clients.filter((c) => assignedClientIds.has(c.id));

	const clientFilterOptions = [
		{ value: "all", label: "All programs" },
		{ value: "unassigned", label: "Unassigned" },
		...assignedClients.map((c) => ({
			value: c.id,
			label: c.user?.name ?? c.user?.email ?? c.id,
		})),
	];

	return (
		<div className="space-y-6 px-4 py-6 max-w-screen-xl mx-auto">
			<h1 className="text-2xl font-bold">Programs</h1>

			<Card>
				<CardHeader>
					<CardTitle>All Programs</CardTitle>
					<CardDescription>
						Manage your programs and assign them to clients.
					</CardDescription>
				</CardHeader>

				<CardContent>
					<ServerTable<ProgramRow>
						data={paged}
						columns={columns}
						totalCount={searched.length}
						loading={loading}
						query={query}
						setQuery={setQuery}
						getRowId={(row) => String(row.id)}
						filters={[{
							label: "Filter by client",
							value: filterClientId,
							onChange: setFilterClientId,
							options: clientFilterOptions,
						}]}
						onCreate={openCreateProgram}
						createLabel="New Program"
					/>
				</CardContent>
			</Card>

			{/* ── Create / Edit Program Dialog ────────────────────────────────── */}
			<Dialog open={programDialogOpen} onOpenChange={setProgramDialogOpen}>
				<DialogContent className="sm:max-w-[480px]">
					<DialogHeader>
						<DialogTitle>
							{editingProgram ? "Edit Program" : "New Program"}
						</DialogTitle>
						<DialogDescription>
							{editingProgram
								? "Update the program details."
								: "Create a new training program."}
						</DialogDescription>
					</DialogHeader>
					<form
						onSubmit={programForm.handleSubmit(handleSaveProgram)}
						className="space-y-4 py-2"
					>
						<div className="space-y-1">
							<Label htmlFor="prog-name">Name</Label>
							<Input
								id="prog-name"
								placeholder="e.g. Strength Block 1"
								{...programForm.register("name")}
							/>
							{programForm.formState.errors.name && (
								<p className="text-sm text-red-500">
									{programForm.formState.errors.name.message}
								</p>
							)}
						</div>

						<div className="space-y-1">
							<Label htmlFor="prog-desc">Description</Label>
							<Input
								id="prog-desc"
								placeholder="Optional description"
								{...programForm.register("description")}
							/>
						</div>

						<div className="flex items-center gap-3">
							<Controller
								control={programForm.control}
								name="isPublic"
								render={({ field }) => (
									<Switch
										id="prog-public"
										checked={field.value}
										onCheckedChange={field.onChange}
									/>
								)}
							/>
							<Label htmlFor="prog-public">Make this program public</Label>
						</div>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setProgramDialogOpen(false)}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={programForm.formState.isSubmitting}
							>
								{programForm.formState.isSubmitting
									? "Saving…"
									: editingProgram
									? "Save Changes"
									: "Create Program"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* ── Assign to Client Dialog ──────────────────────────────────────── */}
			<Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
				<DialogContent className="sm:max-w-[500px]">
					<DialogHeader>
						<DialogTitle>
							{assigningProgram?.assignment
								? "Edit Assignment"
								: "Assign Program to Client"}
						</DialogTitle>
						<DialogDescription>
							Program: <strong>{assigningProgram?.name}</strong>
						</DialogDescription>
					</DialogHeader>
					<form
						onSubmit={assignForm.handleSubmit(handleAssign)}
						className="space-y-4 py-2"
					>
						<div className="space-y-1">
							<Label>Client</Label>
							<Controller
								control={assignForm.control}
								name="clientId"
								render={({ field }) => (
									<Select value={field.value} onValueChange={field.onChange}>
										<SelectTrigger>
											<SelectValue placeholder="Select a client…" />
										</SelectTrigger>
										<SelectContent>
											{clients.map((c) => (
												<SelectItem key={c.id} value={c.id}>
													{c.user?.name
														? `${c.user.name} (${c.user.email})`
														: c.user?.email ?? c.id}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							/>
							{assignForm.formState.errors.clientId && (
								<p className="text-sm text-red-500">
									{assignForm.formState.errors.clientId.message}
								</p>
							)}
						</div>

						<div className="space-y-1">
							<Label htmlFor="assign-name">Assignment Name</Label>
							<Input
								id="assign-name"
								placeholder="e.g. John's Strength Block"
								{...assignForm.register("name")}
							/>
							{assignForm.formState.errors.name && (
								<p className="text-sm text-red-500">
									{assignForm.formState.errors.name.message}
								</p>
							)}
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-1">
								<Label htmlFor="assign-start">Start Date</Label>
								<Input
									id="assign-start"
									type="date"
									{...assignForm.register("startDate")}
								/>
								{assignForm.formState.errors.startDate && (
									<p className="text-sm text-red-500">
										{assignForm.formState.errors.startDate.message}
									</p>
								)}
							</div>
							<div className="space-y-1">
								<Label htmlFor="assign-end">End Date</Label>
								<Input
									id="assign-end"
									type="date"
									{...assignForm.register("endDate")}
								/>
								{assignForm.formState.errors.endDate && (
									<p className="text-sm text-red-500">
										{assignForm.formState.errors.endDate.message}
									</p>
								)}
							</div>
						</div>

						<div className="space-y-1">
							<Label>Status</Label>
							<Controller
								control={assignForm.control}
								name="status"
								render={({ field }) => (
									<Select value={field.value} onValueChange={field.onChange}>
										<SelectTrigger>
											<SelectValue placeholder="Select status…" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="draft">Draft</SelectItem>
											<SelectItem value="active">Active</SelectItem>
											<SelectItem value="completed">Completed</SelectItem>
										</SelectContent>
									</Select>
								)}
							/>
						</div>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setAssignDialogOpen(false)}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={assignForm.formState.isSubmitting}
							>
								{assignForm.formState.isSubmitting
									? "Saving…"
									: assigningProgram?.assignment
									? "Update Assignment"
									: "Assign"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* ── Delete Confirmation ──────────────────────────────────────────── */}
			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete program?</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently delete{" "}
							<strong>{deletingRow?.name}</strong>.
							{deletingRow?.assignment && (
								<>
									{" "}
									The assignment to{" "}
									<strong>{deletingRow.assignedClientName}</strong> will also be
									removed.
								</>
							)}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
