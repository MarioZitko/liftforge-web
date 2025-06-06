export interface Coach {
	id: string;
	userId: string;
	certification?: string;
}

export interface CreateCoachDto {
	userId: string;
	certification?: string;
}

export interface UpdateCoachDto {
	certification?: string;
}

export interface InviteClientDto {
	email: string;
}
