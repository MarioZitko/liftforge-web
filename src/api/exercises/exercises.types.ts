import { User } from "../users/users.types";

// src/api/exercises/exercises.types.ts
export interface Exercise {
	id: number;
	name: string;
	description?: string;
	tutorialUrl?: string;
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
}

export interface UpdateExerciseDto {
	name?: string;
	description?: string;
	tutorialUrl?: string;
}

export type FormExerciseData = {
	name: string;
	description?: string;
	tutorialUrl?: string;
};
