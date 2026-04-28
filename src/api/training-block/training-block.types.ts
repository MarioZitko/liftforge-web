import { Training } from "../training/training.types";

export interface TrainingWeekSummary {
  id: number;
  name: string;
  number: number;
  blockId: number;
  trainings: Training[];
}

export interface TrainingBlock {
  id: number;
  name: string;
  description?: string;
  programId: number;
  weeks: TrainingWeekSummary[];
}

export interface CreateTrainingBlockDto {
  name: string;
  description?: string;
  programId: number;
}

export interface UpdateTrainingBlockDto {
  name?: string;
  description?: string;
}
