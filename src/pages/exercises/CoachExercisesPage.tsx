import ExerciseListTable from "@/pages/exercises/ExerciseListTable";

export default function CoachExercisesPage() {
	return (
		<div className="p-6 max-w-screen-xl mx-auto space-y-6">
			<h1 className="text-2xl font-bold">Exercises</h1>
			<ExerciseListTable role="COACH" />
		</div>
	);
}
