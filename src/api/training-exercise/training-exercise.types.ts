import { Exercise } from "../exercises/exercises.types";

export interface TrainingExercise {
  id: number;
  trainingId: number;
  exerciseId: number;
  sortOrder: number;
  sets: number;
  reps: number;
  weight: number;
  rpePlanned?: number;
  rpeActual?: number;
  intensity?: number;
  percentageOfMax?: number;
  note?: string;
  videoUrl?: string;
  volumeId?: number;
  exercise?: Exercise;
  volume?: { id: number; volumeTotal: number };
}

export interface CreateTrainingExerciseDto {
  trainingId: number;
  exerciseId: number;
  sortOrder: number;
  sets: number;
  reps: number;
  weight: number;
  rpePlanned?: number;
  rpeActual?: number;
  intensity?: number;
  percentageOfMax?: number;
  note?: string;
  videoUrl?: string;
}

export interface UpdateTrainingExerciseDto {
  sortOrder?: number;
  sets?: number;
  reps?: number;
  weight?: number;
  rpePlanned?: number;
  rpeActual?: number;
  intensity?: number;
  percentageOfMax?: number;
  note?: string;
  videoUrl?: string;
}
