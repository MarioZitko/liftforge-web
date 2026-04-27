import { Training } from "../training/training.types";

export interface TrainingWeek {
  id: number;
  name: string;
  number: number;
  blockId: number;
  trainings: Training[];
}

export interface CreateTrainingWeekDto {
  name: string;
  number: number;
  blockId: number;
}

export interface UpdateTrainingWeekDto {
  name?: string;
  number?: number;
}
