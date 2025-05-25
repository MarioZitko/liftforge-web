import { useEffect, useState } from "react";
import { Column, ServerQuery } from "@/components/shared/DataTable/types";
import { ServerTable } from "@/components/shared/DataTable/ServerTable";
import { Button } from "@/components/ui/button";
import { showError, showSuccess } from "@/components/shared/utils/toast.util";
import ExercisesApiClient from "@/api/exercises/exercises.api";
import { Exercise } from "@/api/exercises/exercises.types";
import ExerciseFormModal from "./ExerciseFormModal";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogAction,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { IExerciseListTableProps } from "./types";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export default function ExerciseListTable({ role }: IExerciseListTableProps) {
	const exercisesApi = ExercisesApiClient.getInstance();

	const [query, setQuery] = useState<ServerQuery>({
		pageNumber: 1,
		pageSize: 10,
		searchText: "",
		orderByProperty: "name",
		ascending: true,
	});

	const [exercises, setExercises] = useState<Exercise[]>([]);
	const [loading, setLoading] = useState(false);
	const [editExercise, setEditExercise] = useState<Exercise | null>(null);
	const [showModal, setShowModal] = useState(false);
	const [exerciseToDelete, setExerciseToDelete] = useState<Exercise | null>(
		null
	);

	const [filter, setFilter] = useState<"mine" | "all">("all");

	const fetchExercises = async () => {
		setLoading(true);
		try {
			const data =
				role === "COACH"
					? await exercisesApi.getCoachExercises(filter === "mine")
					: await exercisesApi.getAll();
			setExercises(data);
		} catch {
			showError("Failed to fetch exercises");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchExercises();
	}, [role, filter]);

	const handleDelete = async (id: number) => {
		try {
			await exercisesApi.delete(id);
			showSuccess("Exercise deleted");
			fetchExercises();
		} catch {
			showError("Failed to delete exercise");
		}
	};

	const filtered = exercises.filter((e) =>
		e.name.toLowerCase().includes((query.searchText ?? "").toLowerCase())
	);
	const sorted = [...filtered].sort((a, b) => {
		const key = query.orderByProperty as keyof Exercise;
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

	const columns: Column<Exercise>[] = [
		{ key: "name", label: "Name", sortable: true },
		{ key: "description", label: "Description" },
		{
			key: "tutorialUrl",
			label: "Tutorial",
			render: (e) =>
				e.tutorialUrl ? (
					<a
						href={e.tutorialUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="text-blue-600 underline"
					>
						Video
					</a>
				) : (
					<span className="text-muted-foreground italic">No video</span>
				),
		},
	];

	if (role === "COACH") {
		columns.push({
			key: "id", // must be valid key
			label: "Actions",
			render: (e) => (
				<div className="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							setEditExercise(e);
							setShowModal(true);
						}}
					>
						Edit
					</Button>
					<Button
						variant="destructive"
						size="sm"
						onClick={() => setExerciseToDelete(e)}
					>
						Delete
					</Button>
				</div>
			),
		});
	}

	return (
		<>
			<div className="mb-4 flex justify-end">
				<Select
					value={filter}
					onValueChange={(val) => setFilter(val as "mine" | "all")}
				>
					<SelectTrigger className="w-[220px]">
						<SelectValue placeholder="Filter exercises" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="mine">My Exercises</SelectItem>
						<SelectItem value="all">Shared + My Exercises</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<ServerTable<Exercise>
				data={paged}
				columns={columns}
				totalCount={filtered.length}
				loading={loading}
				query={query}
				setQuery={setQuery}
				getRowId={(e) => e.id.toString()}
			/>

			{role === "COACH" && (
				<ExerciseFormModal
					open={showModal}
					onClose={() => setShowModal(false)}
					onSuccess={() => {
						fetchExercises();
						setShowModal(false);
					}}
					exercise={editExercise}
				/>
			)}

			{exerciseToDelete && (
				<AlertDialog
					open={!!exerciseToDelete}
					onOpenChange={() => setExerciseToDelete(null)}
				>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>
								Delete exercise "{exerciseToDelete?.name}"?
							</AlertDialogTitle>
							<AlertDialogDescription>
								This action cannot be undone.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel onClick={() => setExerciseToDelete(null)}>
								Cancel
							</AlertDialogCancel>
							<AlertDialogAction
								onClick={async () => {
									await handleDelete(exerciseToDelete.id);
									setExerciseToDelete(null);
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
