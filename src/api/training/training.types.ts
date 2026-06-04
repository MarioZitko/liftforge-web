export interface TrainingExerciseSummary {
  id: number;
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
  exerciseId: number;
  exercise?: { id: number; name: string };
  volume?: { id: number; volumeTotal: number };
}

export interface Training {
  id: number;
  name: string;
  date: string;
  weekId: number;
  trainingExercises?: TrainingExerciseSummary[];
}

export interface CreateTrainingDto {
  name: string;
  date: string;
  weekId: number;
}

export interface UpdateTrainingDto {
  name?: string;
  date?: string;
}

export interface ScheduleProgramDto {
  programId: number;
  startDate: string;
  trainingDays: number[];
}

export interface TrainingCalendarItem {
  id: number;
  name: string;
  date: string;
  weekId: number;
  exerciseCount: number;
  clientId: string;
  clientName: string;
  programId: number;
}
