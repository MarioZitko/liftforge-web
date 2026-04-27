export interface Program {
  id: number;
  name: string;
  description?: string;
  isPublic: boolean;
  createdById?: string;
}

export interface CreateProgramDto {
  name: string;
  description?: string;
  isPublic?: boolean;
}

export interface UpdateProgramDto {
  name?: string;
  description?: string;
  isPublic?: boolean;
}
