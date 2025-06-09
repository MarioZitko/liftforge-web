export interface Client {
	id: string;
	userId: string;
	dateOfBirth?: Date | null;
	lookingForCoach?: boolean;
	coachId?: string | null;
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
	dateOfBirth?: Date | null;
	lookingForCoach?: boolean;
	coachId?: string | null;
}

export class ClientWithDetailsDto {
	id!: string;
	userId!: string;
	dateOfBirth?: Date | null;
	lookingForCoach!: boolean;
	coachId?: string | null;
	user!: {
		name: string | null;
		email: string;
	};
}
