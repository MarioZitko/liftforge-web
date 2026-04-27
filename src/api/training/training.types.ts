export interface Training {
  id: number;
  name: string;
  date: string;
  weekId: number;
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
