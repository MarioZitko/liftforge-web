export interface Client {
  id: string;
  coachId?: string;
  userId: string;
  dateOfBirth?: Date;
  lookingForCoach?: boolean;
  bio?: string;
  user?: {
    name: string;
    email: string;
    emailVerified: boolean;
  };
}

export interface ClientProgram {
  id: number;
  clientId: string;
  programId: number;
  startDate: Date;
  endDate: Date;
  status: string;
  coachId?: string;
}

export interface CreateClientDto {
  userId: string;
  dateOfBirth?: Date;
  coachId?: string;
}

export interface UpdateClientDto {
  dateOfBirth?: Date;
  coachId?: string;
}
