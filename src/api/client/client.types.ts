export interface Client {
	id: string;
	userId: string;
	dateOfBirth?: Date;
	coachId?: string;
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
