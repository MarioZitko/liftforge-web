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
import { showError, showSuccess } from "@/components/shared/utils/toast.util";
import ExercisesApiClient from "@/api/exercises/exercises.api";
import { Exercise } from "@/api/exercises/exercises.types";
import ExerciseFormModal from "../exercises/ExerciseFormModal";
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

export default function AdminExercisesPage() {
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

	const fetchExercises = () => {
		setLoading(true);
		exercisesApi
			.getAll()
			.then(setExercises)
			.catch(() => showError("Failed to fetch exercises"))
			.finally(() => setLoading(false));
	};

	useEffect(fetchExercises, []);

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
		{
			key: "createdBy",
			label: "Created By",
			render: (e) =>
				e.createdBy?.name ? (
					<span>{e.createdBy.name}</span>
				) : (
					<span className="text-muted-foreground italic">N/A</span>
				),
		},
		{
			key: "id",
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
		},
	];

	return (
		<>
			<div className="space-y-6 px-4 py-6 max-w-screen-xl mx-auto">
				<h1 className="text-2xl font-bold">Exercise Administration</h1>

				<Card>
					<CardHeader className="flex flex-col items-center text-center">
						<div>
							<CardTitle>All Exercises</CardTitle>
							<CardDescription>
								Manage all exercises in the system
							</CardDescription>
						</div>
					</CardHeader>
					<CardContent>
						<ServerTable<Exercise>
							data={paged}
							columns={columns}
							totalCount={filtered.length}
							loading={loading}
							query={query}
							setQuery={setQuery}
							getRowId={(row) => row.id.toString()}
							onCreate={() => {
								setEditExercise(null);
								setShowModal(true);
							}}
							createLabel="Create Exercise"
						/>
					</CardContent>
				</Card>

				<ExerciseFormModal
					open={showModal}
					onClose={() => setShowModal(false)}
					onSuccess={() => {
						fetchExercises();
						setShowModal(false);
					}}
					exercise={editExercise}
				/>
			</div>

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
								This action cannot be undone. The exercise will be permanently
								deleted.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel onClick={() => setExerciseToDelete(null)}>
								Cancel
							</AlertDialogCancel>
							<AlertDialogAction
								onClick={async () => {
									if (exerciseToDelete) {
										await handleDelete(exerciseToDelete.id);
										setExerciseToDelete(null);
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
