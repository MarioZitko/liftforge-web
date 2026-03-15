export interface Program {
  id: string;
  name: string;
  description?: string;
  isPublic?: boolean;
  clientProgramId?: string;
  trainingBlockIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProgramDto {
  name: string;
  description?: string;
  isPublic?: boolean;
  clientProgramId?: string;
  trainingBlockIds?: string[];
}

export interface UpdateProgramDto {
  name?: string;
  description?: string;
  isPublic?: boolean;
  clientProgramId?: string;
  trainingBlockIds?: string[];
}

export type FormProgramData = {
  name: string;
  description?: string;
  isPublic?: boolean;
  clientProgramId?: string;
  trainingBlockIds?: string[];
};
