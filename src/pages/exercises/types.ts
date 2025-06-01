import { Exercise } from "@/api/exercises/exercises.types";

export interface IExerciseListTableProps {
	role: "COACH" | "CLIENT" | "ADMIN";
}

export interface IExerciseListProps {
	open: boolean;
	onClose: () => void;
	onSuccess: () => void;
	exercise: Exercise | null; // if null, creating a new one
}

export interface IExerciseFormModalProps {
	open: boolean;
	onClose: () => void;
	onSuccess: () => void;
	exercise: Exercise | null;
}
