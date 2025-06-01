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

export default function ExerciseListTable({ role }: IExerciseListTableProps) {
	const exercisesApi = ExercisesApiClient.getInstance();

	const [query, setQuery] = useState<ServerQuery>({
		pageNumber: 1,
		pageSize: 10,
		searchText: "",
		orderByProperty: "name",
		ascending: true,
	});

	const [filterValue, setFilterValue] = useState("all");
	const [exercises, setExercises] = useState<Exercise[]>([]);
	const [loading, setLoading] = useState(false);
	const [editExercise, setEditExercise] = useState<Exercise | null>(null);
	const [showModal, setShowModal] = useState(false);
	const [exerciseToDelete, setExerciseToDelete] = useState<Exercise | null>(
		null
	);

	const fetchExercises = async (): Promise<void> => {
		setLoading(true);
		try {
			const data =
				role === "COACH"
					? await exercisesApi.getCoachExercises(filterValue === "mine")
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
	}, [role, filterValue]);

	const handleDelete = async (id: number): Promise<void> => {
		try {
			await exercisesApi.delete(id);
			showSuccess("Exercise deleted");
			fetchExercises();
		} catch {
			showError("Failed to delete exercise");
		}
	};

	const filteredExercises = exercises.filter((exercise) =>
		exercise.name.toLowerCase().includes(query.searchText?.toLowerCase() || "")
	);

	const sortedExercises = [...filteredExercises].sort((a, b) => {
		const key = query.orderByProperty as keyof Exercise;
		const valA = a[key] ?? "";
		const valB = b[key] ?? "";
		return query.ascending
			? String(valA).localeCompare(String(valB))
			: String(valB).localeCompare(String(valA));
	});

	const pagedExercises = sortedExercises.slice(
		(query.pageNumber - 1) * query.pageSize,
		query.pageNumber * query.pageSize
	);

	const columns: Column<Exercise>[] = [
		{ key: "name", label: "Name", sortable: true },
		{ key: "description", label: "Description" },
		{
			key: "primaryMuscles",
			label: "Primary Muscles",
			render: (exercise) =>
				exercise.primaryMuscles?.length ? (
					<span className="text-sm">
						{exercise.primaryMuscles.slice(0, 2).join(", ")}
						{exercise.primaryMuscles.length > 2 && "..."}
					</span>
				) : (
					<span className="text-muted-foreground italic">-</span>
				),
		},
		{
			key: "secondaryMuscles",
			label: "Secondary Muscles",
			render: (exercise) =>
				exercise.secondaryMuscles?.length ? (
					<span className="text-sm">
						{exercise.secondaryMuscles.slice(0, 2).join(", ")}
						{exercise.secondaryMuscles.length > 2 && "..."}
					</span>
				) : (
					<span className="text-muted-foreground italic">-</span>
				),
		},
		{
			key: "tutorialUrl",
			label: "Tutorial",
			render: (exercise) =>
				exercise.tutorialUrl ? (
					<a
						href={exercise.tutorialUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="text-blue-600 underline hover:text-blue-800"
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
			key: "id",
			label: "Actions",
			render: (exercise) => (
				<div className="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							setEditExercise(exercise);
							setShowModal(true);
						}}
					>
						Edit
					</Button>
					<Button
						variant="destructive"
						size="sm"
						onClick={() => setExerciseToDelete(exercise)}
					>
						Delete
					</Button>
				</div>
			),
		});
	}

	const filters =
		role === "COACH"
			? [
					{
						label: "Exercises",
						value: filterValue,
						onChange: (val: string) => setFilterValue(val),
						options: [
							{ label: "My Exercises", value: "mine" },
							{ label: "Shared + My Exercises", value: "all" },
						],
					},
			  ]
			: [];

	return (
		<>
			<ServerTable<Exercise>
				data={pagedExercises}
				columns={columns}
				totalCount={filteredExercises.length}
				loading={loading}
				query={query}
				setQuery={setQuery}
				getRowId={(exercise) => exercise.id.toString()}
				{...(role === "COACH" || role === "ADMIN"
					? {
							onCreate: () => {
								setEditExercise(null);
								setShowModal(true);
							},
							createLabel: "Add Exercise",
					  }
					: {})}
				filters={filters}
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
