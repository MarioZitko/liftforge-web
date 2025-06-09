export interface Coach {
	id: string;
	userId: string;
	certification?: string | null;
	lookingForClients?: boolean;
}

export interface CreateCoachDto {
	userId: string;
	certification?: string;
}

export interface UpdateCoachDto {
	certification?: string | null;
	lookingForClients?: boolean;
}

export interface InviteClientDto {
	email: string;
}

export class CoachWithDetailsDto {
	id!: string;
	userId!: string;
	certification?: string | null;
	lookingForClients!: boolean;
	user!: {
		name: string | null;
		email: string;
	};
	_count!: {
		clients: number;
	};
}
