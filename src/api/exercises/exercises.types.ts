import { User } from "../users/users.types";

export interface Exercise {
	id: number;
	name: string;
	description?: string;
	tutorialUrl?: string;
	primaryMuscles?: string[];
	secondaryMuscles?: string[];
	createdById?: string;
	createdBy?: User;
	updatedById?: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface CreateExerciseDto {
	name: string;
	description?: string;
	tutorialUrl?: string;
	primaryMuscles?: string[];
	secondaryMuscles?: string[];
}

export interface UpdateExerciseDto {
	name?: string;
	description?: string;
	tutorialUrl?: string;
	primaryMuscles?: string[];
	secondaryMuscles?: string[];
}

export type FormExerciseData = {
	name: string;
	description?: string;
	tutorialUrl?: string;
	primaryMuscles?: string[];
	secondaryMuscles?: string[];
};
