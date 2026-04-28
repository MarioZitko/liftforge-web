export interface ClientProgramAssignment {
  id: number;
  name: string;
  clientId: string;
  programId: number;
  startDate: string;
  endDate: string;
  status: "active" | "completed" | "draft";
  coachId?: string;
  program?: {
    id: number;
    name: string;
    description?: string;
    isPublic: boolean;
  };
  client?: {
    id: string;
    user?: {
      name: string;
      email: string;
    };
  };
}

export interface CreateClientProgramDto {
  clientId: string;
  name: string;
  programId: number;
  startDate: string;
  endDate: string;
  status: string;
  coachId?: string;
}

export interface UpdateClientProgramDto {
  name?: string;
  clientId?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  coachId?: string;
}
